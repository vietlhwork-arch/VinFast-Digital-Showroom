import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Zap, ChevronDown, Loader2, CheckCircle2, Calendar, Car, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { vehicles } from '@/data/vehicles';
import { api, endChatSessionOnPageHide } from '@/lib/api';
import type { ChatMessage, ChatStage, UserAccount, Vehicle } from '@/types';

const SESSION_STORAGE_KEY = 'vinfast_session_id';

function getOrCreateSessionId() {
  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const created = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

const SESSION_ID = getOrCreateSessionId();

const QUICK_ACTIONS = [
  { label: 'Tìm theo ngân sách', key: 'budget' },
  { label: 'Xe 7 chỗ', key: 'family' },
  { label: 'So sánh xe điện', key: 'compare' },
  { label: 'Chi phí lăn bánh & TCO', key: 'tco' },
  { label: 'Xe máy điện', key: 'moto' },
  { label: 'Đặt lịch lái thử', key: 'testdrive' },
];

function formatPrice(p: number) {
  return p >= 1000
    ? `${(p / 1000).toFixed(3).replace('.', ',')} tỷ`
    : `${p.toLocaleString('vi-VN')} triệu`;
}



interface AIChatWidgetProps {
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
  onRequestQuote: (vehicle: Vehicle) => void;
  onOpenTestDrive?: (vehicle?: Vehicle | null) => void;
  onViewDetail?: (vehicle: Vehicle) => void;
  currentUser?: UserAccount | null;
  onOpenAuthModal?: () => void;
  onUpdateUser?: (user: UserAccount) => void;
}

export default function AIChatWidget({
  externalOpen,
  onExternalOpenChange,
  onRequestQuote,
  onOpenTestDrive,
  onViewDetail,
  currentUser,
  onOpenAuthModal,
  onUpdateUser,
}: AIChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const [isDraggingQA, setIsDraggingQA] = useState(false);
  const [startXQA, setStartXQA] = useState(0);
  const [scrollLeftQA, setScrollLeftQA] = useState(0);
  const [hasDraggedQA, setHasDraggedQA] = useState(false);

  const handleQAMouseDown = (e: React.MouseEvent) => {
    if (!quickActionsRef.current) return;
    setIsDraggingQA(true);
    setHasDraggedQA(false);
    setStartXQA(e.pageX - quickActionsRef.current.offsetLeft);
    setScrollLeftQA(quickActionsRef.current.scrollLeft);
  };

  const handleQAMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingQA || !quickActionsRef.current) return;
    e.preventDefault();
    const x = e.pageX - quickActionsRef.current.offsetLeft;
    const walk = (x - startXQA) * 1.5;
    if (Math.abs(walk) > 4) {
      setHasDraggedQA(true);
    }
    quickActionsRef.current.scrollLeft = scrollLeftQA - walk;
  };

  const handleQAMouseUpOrLeave = () => {
    setIsDraggingQA(false);
  };

  useEffect(() => {
    if (externalOpen) setOpen(true);
  }, [externalOpen]);

  const handleSetOpen = (val: boolean) => {
    setOpen(val);
    if (!val) onExternalOpenChange?.(false);
  };
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Xin chào! Tôi là **VinFast AI Advisor** 🚗⚡\n\nTôi có thể giúp bạn tư vấn chọn xe, so sánh dòng xe, và tính toán chi phí. Bạn cần hỗ trợ gì?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [stage, setStage] = useState<ChatStage>('free');
  const [loading, setLoading] = useState(false);
  const [pendingName, setPendingName] = useState('');
  const [pendingVehicle, setPendingVehicle] = useState<Vehicle | null>(null);
  const [quoteActionLoading, setQuoteActionLoading] = useState<string | null>(null);

  const handleCreateQuoteAction = async (msgId: string, actionData: any) => {
    if (!currentUser) {
      onOpenAuthModal?.();
      return;
    }
    setQuoteActionLoading(msgId);
    try {
      let vName = actionData?.vehicle_name;
      let vId = actionData?.vehicle_id;
      let bPrice = Number(actionData?.base_price) || 0;

      // If missing from actionData, try to resolve from the conversation context
      if (!vName || !vId) {
        for (let i = messages.length - 1; i >= 0; i--) {
          const content = messages[i].content || '';
          const matchedVeh = vehicles.find((v) =>
            content.toLowerCase().includes(v.name.toLowerCase()) ||
            (v.id && content.toLowerCase().includes(v.id.toLowerCase()))
          );
          if (matchedVeh) {
            vName = matchedVeh.name;
            vId = matchedVeh.id;
            bPrice = matchedVeh.basePrice || bPrice;
            break;
          }
        }
      }

      if (!vName || !vId) {
        alert('Không thể xác định chính xác dòng xe để tạo báo giá. Vui lòng cho em biết rõ dòng xe anh/chị cần báo giá nhé!');
        return;
      }

      // 1. Insert pending quote into database via API
      await api.createQuote({
        user_id: currentUser.id,
        customer_name: currentUser.name || 'Khách hàng VinFast',
        customer_email: currentUser.email,
        customer_phone: currentUser.phone || '0900000000',
        vehicle_id: vId,
        vehicle_name: vName,
        base_price: bPrice,
        discount: 0,
        final_price: bPrice,
        ai_summary: `Yêu cầu báo giá tạo tự động qua Chatbot AI cho xe ${vName}.`,
      });

      // 2. Mark message action as completed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId && msg.action
            ? { ...msg, action: { ...msg.action, status: 'success' } }
            : msg
        )
      );

      // 3. Append confirmation response from AI Advisor
      const confirmMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🎉 Em đã tạo thành công **Yêu cầu Báo Giá Chính Thức** cho mẫu xe **${vName}** và gửi đến Tư vấn viên phụ trách.\n\nNgay sau khi được phê duyệt, Báo giá chính thức kèm các ưu đãi áp dụng sẽ tự động được gửi vào **Hòm thư** của Anh/Chị (biểu tượng Hòm thư ở thanh menu trên cùng). Anh/Chị hãy đón chờ thông báo nhé! 🚗⚡`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (error: any) {
      console.error('Error creating quote action:', error);
      alert('Không thể tạo báo giá lúc này. Vui lòng thử lại sau.');
    } finally {
      setQuoteActionLoading(null);
    }
  };

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  function getInitialStatus(text: string): string {
    if (/báo giá|lăn bánh|chi phí|tính|tco/i.test(text)) {
      return 'Đang lập bản tính toán chi phí & báo giá...';
    }
    if (/so sánh|khác|hơn|xe nào/i.test(text)) {
      return 'Đang so sánh thông tin các dòng xe...';
    }
    if (/xe máy|ô tô|tìm xe|ngân sách|chỗ|ghế/i.test(text)) {
      return 'Đang tìm kiếm trong kho dữ liệu VinFast...';
    }
    return 'Đang suy nghĩ...';
  }

  useEffect(() => {
    const endSession = (event: PageTransitionEvent) => {
      // A page kept in the back-forward cache is not a completed session.
      if (event.persisted) return;
      if (sessionStorage.getItem(SESSION_STORAGE_KEY) !== SESSION_ID) return;

      endChatSessionOnPageHide({
        session_id: SESSION_ID,
        user_id: currentUser?.id,
      });
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    };
    window.addEventListener('pagehide', endSession);
    return () => window.removeEventListener('pagehide', endSession);
  }, [currentUser?.id]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const botMsgId = (Date.now() + 1).toString();
    const initialStatus = getInitialStatus(text.trim());
    const botMsg: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      statusText: initialStatus,
    };

    setMessages((m) => [...m, userMsg, botMsg]);
    setInput('');
    setLoading(true);

    // Fire-and-forget background logging (never block chat stream)
    try {
      void Promise.resolve(supabase.from('chat_messages').insert({
        session_id: SESSION_ID,
        role: 'user',
        content: text.trim(),
      })).catch(() => undefined);
    } catch {}

    let accumulatedText = '';
    let nextStage: ChatStage = stage;

    try {
      await api.chatStream(
        {
          message: text.trim(),
          session_id: SESSION_ID,
          user_id: currentUser?.id,
          user_email: currentUser?.email,
        },
        (token: string) => {
          setLoading(false);
          accumulatedText += token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? { ...msg, content: accumulatedText }
                : msg
            )
          );
        },
        (doneData) => {
          if (doneData.updated_user?.phone && currentUser) {
            const updatedUser = { ...currentUser, phone: doneData.updated_user.phone };
            try {
              localStorage.setItem('vinfast_user', JSON.stringify(updatedUser));
              window.dispatchEvent(new CustomEvent('vinfast_user_updated', { detail: updatedUser }));
            } catch {}
            onUpdateUser?.(updatedUser);
          }
          if (doneData.stage) {
            nextStage = doneData.stage as ChatStage;
            setStage(nextStage);
          }
          if (doneData.action) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMsgId
                  ? { ...msg, action: doneData.action }
                  : msg
              )
            );
            if (doneData.action.type === 'book_test_drive') {
              const vId = doneData.action.vehicle_id?.toLowerCase();
              const vName = doneData.action.vehicle_name?.toLowerCase();
              const matched = vehicles.find(
                (v) => v.id.toLowerCase() === vId || v.name.toLowerCase().includes(vName || '')
              ) || null;
              onOpenTestDrive?.(matched);
            }
          }
        },
        (statusText: string) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId ? { ...msg, statusText } : msg
            )
          );
        }
      );
    } catch (err: any) {
      console.error('Backend AI Agent error:', err);
      if (!accumulatedText) {
        accumulatedText = 'Dạ em xin lỗi, hệ thống đang gặp chút gián đoạn kết nối. Anh/chị vui lòng thử lại sau ít phút nhé!';
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? { ...msg, content: accumulatedText }
              : msg
          )
        );
      }
    } finally {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === botMsgId) {
            const finalContent = msg.content || accumulatedText || 'Dạ em xin lỗi, kết nối đang bị gián đoạn. Anh/chị vui lòng gửi lại câu hỏi giúp em nhé!';
            return { ...msg, content: finalContent, isStreaming: false };
          }
          return msg;
        })
      );
      setLoading(false);
    }

    if (stage === 'collecting_name') setPendingName(text.trim());
    if (stage === 'collecting_phone' && pendingVehicle) {
      try {
        await supabase.from('quotes').insert({
          customer_name: pendingName,
          customer_phone: text.trim(),
          vehicle_id: pendingVehicle.id,
          vehicle_name: pendingVehicle.name,
          base_price: pendingVehicle.basePrice,
          discount: Math.floor(pendingVehicle.basePrice * 0.02),
          final_price: Math.floor(pendingVehicle.basePrice * 0.98),
          ai_summary: `Khách hàng ${pendingName} quan tâm đến ${pendingVehicle.name}. Tư vấn: xe phù hợp với nhu cầu, đề xuất gói lãi suất 0%.`,
          status: 'pending',
        });
      } catch {
        // ignore
      }
      setPendingVehicle(null);
      setPendingName('');
    }

    try {
      if (accumulatedText) {
        await supabase.from('chat_messages').insert({
          session_id: SESSION_ID,
          role: 'assistant',
          content: accumulatedText,
        });
      }
    } catch {
      // ignore
    }
  }

  function handleQuickAction(key: string) {
    const map: Record<string, string> = {
      budget: 'Tôi muốn tìm xe theo ngân sách',
      family: 'Tôi cần xe 7 chỗ cho gia đình',
      compare: 'So sánh các dòng ô tô điện VinFast',
      tco: 'Tư vấn chi phí lăn bánh và TCO của xe VinFast',
      moto: 'Tư vấn các dòng xe máy điện VinFast',
      testdrive: 'Tôi muốn đặt lịch lái thử',
    };
    if (key === 'testdrive') {
      onOpenTestDrive?.(null);
    }
    sendMessage(map[key] || key);
  }

  function renderMessageContent(content: string) {
    if (!content) return null;
    // 1. Split by markdown links [Anchor Text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const precedingText = content.substring(lastIndex, match.index);
      if (precedingText) {
        parts.push(...renderFormattedText(precedingText, `text-${lastIndex}`));
      }

      const linkText = match[1];
      const linkUrl = match[2];
      const isInternalDetail = linkUrl.includes('#detail-') || linkUrl.startsWith('#detail-');

      parts.push(
        <a
          key={`link-${match.index}`}
          href={linkUrl}
          onClick={(e) => {
            if (isInternalDetail) {
              e.preventDefault();
              const hashPart = linkUrl.includes('#') ? linkUrl.substring(linkUrl.indexOf('#')) : `#detail-${linkUrl}`;
              const rawTarget = hashPart.replace('#detail-', '').toLowerCase().trim();
              const cleanTarget = rawTarget.replace(/[^a-z0-9]/g, '');

              const found = vehicles.find((v) => {
                const vId = (v.id || '').toLowerCase();
                const vCode = (v.code || '').toLowerCase();
                const vName = (v.name || '').toLowerCase();
                const cleanCode = vCode.replace(/[^a-z0-9]/g, '');
                const cleanName = vName.replace(/[^a-z0-9]/g, '');
                return (
                  vId === rawTarget ||
                  vCode === rawTarget ||
                  cleanCode === cleanTarget ||
                  cleanName.includes(cleanTarget) ||
                  cleanTarget.includes(cleanCode)
                );
              });

              if (found && onViewDetail) {
                onViewDetail(found);
              }
              window.location.hash = hashPart;
              window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
          }}
          className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2 hover:bg-blue-100/60 px-1.5 py-0.5 rounded transition-all cursor-pointer mx-0.5"
          title={isInternalDetail ? `Xem chi tiết xe ${linkText}` : linkText}
        >
          <Car size={13} className="inline-block shrink-0 text-blue-600" />
          <span>{linkText}</span>
          <ExternalLink size={11} className="inline-block shrink-0 opacity-70" />
        </a>
      );

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(...renderFormattedText(content.substring(lastIndex), `text-${lastIndex}`));
    }

    return parts;
  }

  function renderFormattedText(text: string, keyPrefix: string): React.ReactNode[] {
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={`${keyPrefix}-bold-${i}`} className="font-semibold">{part.slice(2, -2)}</strong>
      ) : (
        <span key={`${keyPrefix}-span-${i}`}>{part}</span>
      )
    );
  }

  return (
    <>
      {/* Floating toggle */}
      <button
        type="button"
        onClick={() => handleSetOpen(!open)}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer ${open
            ? 'bg-gray-800 hover:bg-gray-700'
            : 'bg-blue-700 hover:bg-blue-600'
          }`}
        title="Tư vấn AI"
      >
        {open ? (
          <ChevronDown size={22} className="text-white" />
        ) : (
          <>
            <MessageCircle size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-20 right-3 sm:right-6 z-[9999] w-[calc(100vw-1.5rem)] sm:w-[380px] md:w-[410px] max-w-[420px] h-[540px] sm:h-[620px] lg:h-[680px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-90 pointer-events-none'
          }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 py-3.5 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-sm">VinFast AI Advisor</div>
            <div className="text-blue-200 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              Luôn sẵn sàng tư vấn
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={14} className="text-blue-300" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSetOpen(false);
              }}
              className="w-8 h-8 rounded-lg hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-white/80 hover:text-white cursor-pointer transition-colors ml-1 relative z-10"
              title="Đóng box chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={14} className="text-blue-700" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user'
                    ? 'bg-blue-700 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100 shadow-sm'
                  }`}
              >
                {!msg.content.trim() && msg.isStreaming ? (
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-medium py-0.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    <span className="animate-pulse">{msg.statusText || 'Đang suy nghĩ...'}</span>
                  </div>
                ) : (
                  <>
                    {renderMessageContent(msg.content)}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 animate-pulse align-middle" />
                    )}
                    {msg.action && msg.action.type === 'create_quote' && !msg.isStreaming && (
                      <div className="mt-3 pt-3 border-t border-gray-100/90">
                        {msg.action.status === 'success' ? (
                          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 shadow-sm animate-in fade-in duration-300">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>Đã tạo & gửi yêu cầu Báo Giá Chính Thức thành công!</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCreateQuoteAction(msg.id, msg.action)}
                            disabled={quoteActionLoading === msg.id}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60"
                          >
                            {quoteActionLoading === msg.id ? (
                              <>
                                <Loader2 size={15} className="animate-spin" />
                                <span>Đang khởi tạo báo giá...</span>
                              </>
                            ) : (
                              <>
                                <Zap size={15} className="text-amber-300 fill-amber-300" />
                                <span>Tạo Báo Giá Chính Thức {msg.action.vehicle_name ? `(${msg.action.vehicle_name})` : ''}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {msg.action && msg.action.type === 'book_test_drive' && !msg.isStreaming && (
                      <div className="mt-3 pt-3 border-t border-gray-100/90">
                        <button
                          type="button"
                          onClick={() => {
                            const vId = msg.action?.vehicle_id?.toLowerCase();
                            const vName = msg.action?.vehicle_name?.toLowerCase();
                            const matched = vehicles.find(
                              (v) => v.id.toLowerCase() === vId || v.name.toLowerCase().includes(vName || '')
                            ) || null;
                            onOpenTestDrive?.(matched);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                          <Calendar size={15} className="text-white" />
                          <span>Mở Form Đăng Ký Lái Thử {msg.action.vehicle_name ? `(${msg.action.vehicle_name})` : ''}</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <User size={14} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick actions */}
        <div className="px-3 pt-2 pb-1 border-t border-gray-100 bg-white">
          <div
            ref={quickActionsRef}
            onMouseDown={handleQAMouseDown}
            onMouseMove={handleQAMouseMove}
            onMouseUp={handleQAMouseUpOrLeave}
            onMouseLeave={handleQAMouseUpOrLeave}
            className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 cursor-grab active:cursor-grabbing select-none"
            style={{ scrollBehavior: isDraggingQA ? 'auto' : 'smooth' }}
          >
            {QUICK_ACTIONS.map((qa) => (
              <button
                key={qa.key}
                type="button"
                onClick={() => {
                  if (!hasDraggedQA) {
                    handleQuickAction(qa.key);
                  }
                }}
                className="shrink-0 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-full border border-blue-100 transition-all select-none cursor-pointer active:scale-95"
              >
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-3 pb-3 bg-white">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
