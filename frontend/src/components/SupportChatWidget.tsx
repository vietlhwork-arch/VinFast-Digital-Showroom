import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Headphones, Loader2, MessageCircle, Plus, Send, UserCheck, X } from 'lucide-react';

import { api, getConversationSocketUrl } from '@/lib/api';
import type { UserAccount } from '@/types';

type Conversation = {
  conversation_id: string;
  customer_id: string;
  assigned_staff_id: string | null;
  subject: string;
  status: 'open' | 'closed';
  customer_name?: string | null;
  assigned_staff_name?: string | null;
  updated_at: string;
};

type SupportMessage = {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name?: string | null;
  sender_role?: string | null;
  content: string;
  sent_at: string;
};

interface SupportChatWidgetProps {
  externalOpen: boolean;
  onExternalOpenChange: (open: boolean) => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: () => void;
}

export default function SupportChatWidget({
  externalOpen,
  onExternalOpenChange,
  currentUser,
  onOpenAuthModal,
}: SupportChatWidgetProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [subject, setSubject] = useState('Hỗ trợ chọn xe và đặt lịch lái thử');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const isStaff = currentUser?.role === 'staff' || currentUser?.role === 'admin';
  const activeConversation = conversations.find((item) => item.conversation_id === activeId) || null;
  const canReply = Boolean(
    activeConversation?.status === 'open'
    && (!isStaff || currentUser?.role === 'admin' || activeConversation.assigned_staff_id === currentUser?.id),
  );

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getConversations<Conversation[]>();
      setConversations(data);
      setActiveId((current) => current && data.some((item) => item.conversation_id === current)
        ? current
        : data[0]?.conversation_id || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được hội thoại');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (externalOpen && currentUser) void loadConversations();
  }, [externalOpen, currentUser, loadConversations]);

  useEffect(() => {
    if (!externalOpen || !activeId || !currentUser) return;
    let cancelled = false;
    setError('');
    api.getConversationMessages<SupportMessage[]>(activeId)
      .then((data) => { if (!cancelled) setMessages(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được tin nhắn'); });

    const socket = new WebSocket(getConversationSocketUrl(activeId));
    socketRef.current = socket;
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === 'message' && payload.message) {
        setMessages((current) => current.some((item) => item.message_id === payload.message.message_id)
          ? current
          : [...current, payload.message]);
      } else if (payload.type === 'conversation_updated') {
        void loadConversations();
      } else if (payload.type === 'error') {
        setError(payload.message || 'Không gửi được tin nhắn');
      }
    };
    socket.onerror = () => setError('Kết nối realtime bị gián đoạn. Bạn vẫn có thể tải lại hội thoại.');

    return () => {
      cancelled = true;
      socket.close();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [activeId, currentUser, externalOpen, loadConversations]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createConversation = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const created = await api.createConversation<Conversation>(subject);
      setConversations((current) => [created, ...current]);
      setActiveId(created.conversation_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không mở được hội thoại');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!activeId || !content) return;
    setDraft('');
    setError('');
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ content }));
      return;
    }
    try {
      const message = await api.sendConversationMessage<SupportMessage>(activeId, content);
      setMessages((current) => [...current, message]);
    } catch (err) {
      setDraft(content);
      setError(err instanceof Error ? err.message : 'Không gửi được tin nhắn');
    }
  };

  const assignToMe = async () => {
    if (!activeId) return;
    try {
      await api.assignConversation<Conversation>(activeId);
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nhận hội thoại');
    }
  };

  const openWidget = () => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    onExternalOpenChange(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openWidget}
        className="fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-2xl transition hover:scale-105 hover:bg-blue-600"
        title="Chat với nhân viên"
        aria-label="Mở chat hỗ trợ"
      >
        <MessageCircle size={24} />
      </button>

      {externalOpen && currentUser && (
        <section className="fixed bottom-24 right-4 z-[9999] flex h-[min(680px,75vh)] w-[min(760px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center gap-2 px-1 text-sm font-bold text-slate-800">
              <Headphones size={17} className="text-blue-700" />
              {isStaff ? 'Hàng đợi hỗ trợ' : 'Hỗ trợ của tôi'}
            </div>
            {loading && <Loader2 className="mx-auto mt-8 animate-spin text-blue-700" size={22} />}
            <div className="space-y-2 overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.conversation_id}
                  type="button"
                  onClick={() => setActiveId(conversation.conversation_id)}
                  className={`w-full rounded-xl border p-3 text-left text-xs transition ${activeId === conversation.conversation_id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}
                >
                  <div className="line-clamp-2 font-bold text-slate-800">{conversation.subject}</div>
                  <div className="mt-1 text-slate-500">{isStaff ? conversation.customer_name : conversation.assigned_staff_name || 'Đang chờ nhân viên'}</div>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${conversation.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {conversation.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <div>
                <div className="font-bold text-slate-900">{activeConversation?.subject || 'Chat trực tiếp với VinFast'}</div>
                <div className="text-xs text-slate-500">Không dùng chatbot hoặc nội dung tạo tự động</div>
              </div>
              <button type="button" onClick={() => onExternalOpenChange(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Đóng chat">
                <X size={20} />
              </button>
            </header>

            {!activeConversation && !isStaff ? (
              <form onSubmit={createConversation} className="m-auto w-full max-w-md space-y-4 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Plus /></div>
                <h3 className="text-lg font-bold text-slate-900">Bạn cần nhân viên hỗ trợ vấn đề gì?</h3>
                <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500" />
                <button disabled={loading} className="w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-60">Bắt đầu hội thoại</button>
              </form>
            ) : activeConversation ? (
              <>
                {isStaff && !activeConversation.assigned_staff_id && (
                  <div className="border-b border-blue-100 bg-blue-50 px-4 py-2">
                    <button type="button" onClick={assignToMe} className="flex items-center gap-2 text-xs font-bold text-blue-700"><UserCheck size={15} /> Nhận xử lý hội thoại này</button>
                  </div>
                )}
                {currentUser.role === 'staff' && activeConversation.assigned_staff_id && activeConversation.assigned_staff_id !== currentUser.id && (
                  <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
                    Hội thoại đang do {activeConversation.assigned_staff_name || 'nhân viên khác'} phụ trách. Bạn có thể xem nhưng không thể gửi tin.
                  </div>
                )}
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
                  {messages.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Chưa có tin nhắn. Hãy bắt đầu trao đổi.</p>}
                  {messages.map((message) => {
                    const mine = message.sender_id === currentUser.id;
                    return (
                      <div key={message.message_id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${mine ? 'bg-blue-700 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                          {!mine && <div className="mb-1 text-[10px] font-bold text-blue-700">{message.sender_name || 'Nhân viên hỗ trợ'}</div>}
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>
                {error && <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</div>}
                <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 p-3">
                  <input disabled={!canReply} value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder={canReply ? 'Nhập tin nhắn…' : activeConversation.status !== 'open' ? 'Hội thoại đã đóng' : 'Nhận hội thoại trước khi trả lời'} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100" />
                  <button disabled={!draft.trim() || !canReply} className="rounded-xl bg-blue-700 px-4 text-white hover:bg-blue-600 disabled:opacity-40" aria-label="Gửi tin nhắn"><Send size={18} /></button>
                </form>
              </>
            ) : (
              <div className="m-auto p-6 text-center text-sm text-slate-500">Chọn một hội thoại trong hàng đợi để hỗ trợ khách hàng.</div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
