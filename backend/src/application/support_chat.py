"""Business rules for customer-to-staff support conversations."""

from __future__ import annotations

from uuid import UUID

from src.domain.chat import Conversation, ConversationStatus, Message
from src.domain.errors import NotFoundError, PermissionDeniedError, ValidationError
from src.domain.identity import Actor, Role
from src.domain.unit_of_work import UnitOfWork

MAX_MESSAGE_LENGTH = 2_000


class SupportChatService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    @property
    def repository(self):
        return self.uow.conversations

    async def create_conversation(self, actor: Actor, subject: str) -> Conversation:
        if actor.role is not Role.CUSTOMER:
            raise PermissionDeniedError("Chỉ khách hàng có thể mở cuộc hội thoại hỗ trợ")
        cleaned = " ".join(subject.split())
        if not 3 <= len(cleaned) <= 160:
            raise ValidationError("Chủ đề phải có từ 3 đến 160 ký tự")
        conversation = await self.repository.create_conversation(actor.user_id, cleaned)
        await self.uow.commit()
        return conversation

    async def list_conversations(self, actor: Actor) -> list[Conversation]:
        if actor.role is Role.CUSTOMER:
            return await self.repository.list_for_customer(actor.user_id)
        if actor.is_staff:
            return await self.repository.list_for_staff()
        raise PermissionDeniedError("Vai trò không được phép truy cập hội thoại")

    async def get_conversation(self, actor: Actor, conversation_id: UUID) -> Conversation:
        conversation = await self.repository.get_conversation(conversation_id)
        if conversation is None:
            raise NotFoundError("Không tìm thấy hội thoại")
        self._ensure_access(actor, conversation)
        return conversation

    async def list_messages(self, actor: Actor, conversation_id: UUID) -> list[Message]:
        await self.get_conversation(actor, conversation_id)
        return await self.repository.list_messages(conversation_id)

    async def send_message(self, actor: Actor, conversation_id: UUID, content: str) -> Message:
        conversation = await self.get_conversation(actor, conversation_id)
        if conversation.status is not ConversationStatus.OPEN:
            raise ValidationError("Hội thoại đã đóng")
        # Tư vấn viên chỉ được trả lời sau khi đã nhận phụ trách hội thoại.
        if actor.role is Role.CONSULTANT and conversation.assigned_staff_id != actor.user_id:
            raise PermissionDeniedError("Nhân viên cần nhận hội thoại trước khi trả lời")
        cleaned = content.strip()
        if not cleaned:
            raise ValidationError("Nội dung tin nhắn không được để trống")
        if len(cleaned) > MAX_MESSAGE_LENGTH:
            raise ValidationError("Tin nhắn không được vượt quá 2.000 ký tự")
        message = await self.repository.create_message(conversation_id, actor.user_id, cleaned)
        await self.uow.commit()
        return message

    async def assign_to_me(self, actor: Actor, conversation_id: UUID) -> Conversation:
        if not actor.is_staff:
            raise PermissionDeniedError("Chỉ nhân viên có thể nhận hội thoại")
        conversation = await self.get_conversation(actor, conversation_id)
        if conversation.status is not ConversationStatus.OPEN:
            raise ValidationError("Không thể nhận hội thoại đã đóng")
        # Chỉ quản trị viên mới được phép nhận lại hội thoại đã có nhân viên phụ trách.
        if conversation.assigned_staff_id not in (None, actor.user_id) and not actor.is_admin:
            raise PermissionDeniedError("Hội thoại đã được nhân viên khác tiếp nhận")
        conversation = await self.repository.assign_staff(conversation_id, actor.user_id)
        await self.uow.commit()
        return conversation

    async def close(self, actor: Actor, conversation_id: UUID) -> Conversation:
        conversation = await self.get_conversation(actor, conversation_id)
        if actor.role is Role.CONSULTANT and conversation.assigned_staff_id != actor.user_id:
            raise PermissionDeniedError("Chỉ nhân viên đang phụ trách mới có thể đóng hội thoại")
        conversation = await self.repository.close_conversation(conversation.conversation_id)
        await self.uow.commit()
        return conversation

    async def delete(self, actor: Actor, conversation_id: UUID) -> None:
        conversation = await self.get_conversation(actor, conversation_id)
        # Khách hàng chỉ xóa được hội thoại của mình; quản trị viên có thể xóa mọi hội thoại.
        if not actor.is_admin and conversation.customer_id != actor.user_id:
            raise PermissionDeniedError("Chỉ khách hàng sở hữu hoặc quản trị viên có thể xóa hội thoại")
        await self.repository.delete_conversation(conversation_id)
        await self.uow.commit()

    @staticmethod
    def _ensure_access(actor: Actor, conversation: Conversation) -> None:
        if actor.role is Role.CUSTOMER and conversation.customer_id != actor.user_id:
            raise PermissionDeniedError("Bạn không có quyền truy cập hội thoại này")
        if not actor.is_staff and actor.role is not Role.CUSTOMER:
            raise PermissionDeniedError("Vai trò không được phép truy cập hội thoại")
