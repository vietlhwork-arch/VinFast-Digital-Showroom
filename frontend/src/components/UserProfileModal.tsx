import { useState, useEffect } from 'react';
import {
  X, User, ShieldCheck, Mail, Phone, Calendar, Car, FileText,
  LogOut, Award, CheckCircle2, Clock, Sparkles, Building2, UserCog, ExternalLink,
  Edit2, Trash2, Check, AlertCircle
} from 'lucide-react';
import type { UserAccount, Quote } from '@/types';
import { api } from '@/lib/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onLogout: () => void;
  onUpdateUser?: (updatedUser: UserAccount) => void;
  onOpenStaffConsole?: () => void;
  onOpenChat?: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateUser,
  onOpenStaffConsole,
  onOpenChat,
}: UserProfileModalProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'quotes'>('info');

  // Phone editing states
  const [phone, setPhone] = useState(user.phone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUserQuotes = async (silent = false) => {
    if (!silent) setLoadingQuotes(true);
    try {
      const data = await api.getQuotes<Quote[]>(user.id, user.email, user.phone);
      if (Array.isArray(data)) {
        setQuotes(data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách báo giá:', err);
    } finally {
      if (!silent) setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPhone(user.phone || '');
      setPhoneInput(user.phone || '');
      setIsEditingPhone(false);
      setPhoneMsg(null);

      const handleUserUpdated = (e: any) => {
        const u = e?.detail || user;
        if (u?.phone) {
          setPhone(u.phone);
          setPhoneInput(u.phone);
        }
      };
      window.addEventListener('vinfast_user_updated', handleUserUpdated);

      if (user.role === 'customer') {
        fetchUserQuotes(false);

        // Realtime sync listeners
        let bc: BroadcastChannel | null = null;
        try {
          bc = new BroadcastChannel('vinfast_realtime_sync');
          bc.onmessage = () => fetchUserQuotes(true);
        } catch {}

        const handleSync = () => fetchUserQuotes(true);
        window.addEventListener('vinfast_quote_updated', handleSync);
        window.addEventListener('storage', handleSync);

        return () => {
          if (bc) bc.close();
          window.removeEventListener('vinfast_user_updated', handleUserUpdated);
          window.removeEventListener('vinfast_quote_updated', handleSync);
          window.removeEventListener('storage', handleSync);
        };
      }

      return () => {
        window.removeEventListener('vinfast_user_updated', handleUserUpdated);
      };
    }
  }, [isOpen, user]);

  // Allow the profile page to be closed reliably from the keyboard as well as
  // the close control, even when another overlay is mounted behind it.
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSavePhone = async () => {
    const trimmed = phoneInput.trim();
    if (trimmed && !/^[0-9+ -]{8,15}$/.test(trimmed)) {
      setPhoneMsg({ type: 'error', text: 'Số điện thoại không hợp lệ (8-15 chữ số).' });
      return;
    }
    setSavingPhone(true);
    setPhoneMsg(null);
    try {
      try {
        await api.updateMe({ phone: trimmed });
      } catch {
        if (user.id && !user.id.startsWith('usr_')) {
          await api.updateUser(user.id, { phone: trimmed });
        }
      }
      setPhone(trimmed);
      setIsEditingPhone(false);
      onUpdateUser?.({ ...user, phone: trimmed });
      setPhoneMsg({ type: 'success', text: 'Đã cập nhật số điện thoại thành công!' });
      setTimeout(() => setPhoneMsg(null), 3500);
    } catch (err: any) {
      setPhoneMsg({ type: 'error', text: err.message || 'Cập nhật SĐT thất bại.' });
    } finally {
      setSavingPhone(false);
    }
  };

  const handleDeletePhone = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa số điện thoại này khỏi tài khoản?')) return;
    setSavingPhone(true);
    setPhoneMsg(null);
    try {
      try {
        await api.updateMe({ phone: '' });
      } catch {
        if (user.id && !user.id.startsWith('usr_')) {
          await api.updateUser(user.id, { phone: '' });
        }
      }
      setPhone('');
      setPhoneInput('');
      setIsEditingPhone(false);
      onUpdateUser?.({ ...user, phone: '' });
      setPhoneMsg({ type: 'success', text: 'Đã xóa số điện thoại thành công!' });
      setTimeout(() => setPhoneMsg(null), 3500);
    } catch (err: any) {
      setPhoneMsg({ type: 'error', text: err.message || 'Xóa SĐT thất bại.' });
    } finally {
      setSavingPhone(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto my-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-200/80 max-h-[88vh] flex flex-col my-auto"
        onClick={(event) => event.stopPropagation()}
      >
        
        {/* Header Profile Cover */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 sm:p-6 relative overflow-hidden flex-shrink-0">
          <button
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            }}
            type="button"
            aria-label="Thoát"
            title="Thoát"
            className="absolute top-4 right-4 z-20 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-all cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 relative z-10">
            <div className="relative">
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
                }
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white/20 shadow-lg"
              />
              <span
                className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm ${
                  user.role === 'staff' ? 'bg-amber-500' : 'bg-blue-600'
                }`}
              >
                {user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
              </span>
            </div>

            <div className="text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-0.5">
                <h3 className="text-xl font-extrabold">{user.name}</h3>
                {user.role === 'staff' ? (
                  <UserCog size={16} className="text-amber-400" />
                ) : (
                  <ShieldCheck size={16} className="text-blue-300" />
                )}
              </div>
              <p className="text-blue-200 text-xs font-medium">{user.email}</p>

              {user.role === 'staff' ? (
                <div className="mt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/15 rounded text-[11px] font-semibold text-white">
                    <Building2 size={12} />
                    {user.showroom || 'VinFast Landmark 81'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[11px] font-bold border border-amber-400/30">
                    Mã NV: {user.employeeId || 'VF-8892'}
                  </span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1.5 justify-center sm:justify-start text-xs text-blue-200 font-medium">
                  <User size={13} className="text-blue-300" />
                  <span>Tài khoản Khách hàng VinFast</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-5 bg-slate-50/70 flex-shrink-0">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2.5 px-3 font-bold text-xs border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-700 text-blue-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Thông tin tài khoản
          </button>
          {user.role === 'customer' && (
            <button
              onClick={() => setActiveTab('quotes')}
              className={`py-2.5 px-3 font-bold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'quotes'
                  ? 'border-blue-700 text-blue-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Yêu cầu báo giá của tôi
              {quotes.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-blue-100 text-blue-700 font-bold rounded-full">
                  {quotes.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab Content - Scrollable */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                    <Mail size={13} className="text-blue-600" /> Email liên hệ
                  </div>
                  <div className="text-xs font-extrabold text-slate-800 truncate">{user.email}</div>
                </div>

                {/* Phone Box with Edit & Delete */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 relative">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-blue-600" /> Số điện thoại
                    </span>
                    {!isEditingPhone && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneInput(phone);
                            setIsEditingPhone(true);
                            setPhoneMsg(null);
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 hover:underline"
                        >
                          <Edit2 size={12} />
                          {phone ? 'Sửa' : 'Thêm SĐT'}
                        </button>
                        {phone && (
                          <button
                            type="button"
                            onClick={handleDeletePhone}
                            disabled={savingPhone}
                            className="text-[11px] text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 hover:underline"
                          >
                            <Trash2 size={12} />
                            Xóa
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditingPhone ? (
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="VD: 0901234567"
                          className="flex-1 px-2.5 py-1 text-xs font-bold text-slate-800 bg-white border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSavePhone}
                          disabled={savingPhone}
                          className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          {savingPhone ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Check size={13} />
                              Lưu
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPhone(false);
                            setPhoneInput(phone);
                          }}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-extrabold text-slate-800">
                      {phone ? (
                        <span>{phone}</span>
                      ) : (
                        <span className="text-slate-400 font-medium italic">Chưa cập nhật (Bấm 'Thêm SĐT')</span>
                      )}
                    </div>
                  )}

                  {phoneMsg && (
                    <div className={`mt-2 text-[11px] font-bold flex items-center gap-1 ${phoneMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {phoneMsg.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      <span>{phoneMsg.text}</span>
                    </div>
                  )}
                </div>
              </div>

              {user.role === 'staff' ? (
                <div className="p-4 bg-gradient-to-r from-blue-950 to-indigo-950 rounded-xl text-white">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={15} className="text-amber-400" />
                      <span className="font-bold text-xs">Bảng Quản trị Báo giá CRM</span>
                    </div>
                    <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold">
                      Quyền Staff
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-200 mb-3">
                    Truy cập danh sách yêu cầu báo giá từ khách hàng, duyệt chiết khấu và cập nhật hợp đồng.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenStaffConsole?.();
                    }}
                    className="w-full py-2.5 bg-white text-blue-950 hover:bg-blue-50 font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    Mở Bảng Điều Khiển Sales CRM
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <h4 className="text-xs font-extrabold text-blue-900 mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-blue-600" /> Dịch vụ dành cho Khách hàng VinFast
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                      Tra cứu thông tin hệ thống trạm sạc V-GREEN toàn quốc
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                      Theo dõi tiến độ yêu cầu báo giá & bảo dưỡng xe
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                      Tư vấn thiết kế gói tài chính ưu đãi trả góp
                    </li>
                  </ul>
                  {onOpenChat && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenChat();
                      }}
                      className="mt-3 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Car size={14} />
                      Tư vấn mua xe với AI Advisor ngay
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quotes' && user.role === 'customer' && (
            <div>
              {loadingQuotes ? (
                <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải danh sách báo giá của bạn...</span>
                </div>
              ) : quotes.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Bạn chưa có yêu cầu báo giá nào. Vui lòng chọn xe trên Showroom và nhấn "Nhận báo giá".
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(quotes || []).map((q: any) => (
                    <div
                      key={q.id || Math.random()}
                      className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-extrabold text-xs text-slate-900">
                            {q.vehicle_name || q.vehicle_id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : q.status === 'rejected'
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {q.status === 'approved' ? 'Đã duyệt' : q.status === 'rejected' ? 'Từ chối' : 'Đang xử lý'}
                          </span>
                        </div>
                        {q.status === 'approved' ? (
                          <p className="text-[11px] text-slate-500 font-medium">
                            Giá niêm yết: {(q.base_price || 0).toLocaleString('vi-VN')} ₫
                            {q.discount > 0 && (
                              <span className="ml-1 text-emerald-600 font-bold">
                                (Ưu đãi: -{q.discount.toLocaleString('vi-VN')} ₫)
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">
                            {q.status === 'rejected' ? 'Báo giá chưa được chấp thuận' : 'Giá chính thức sẽ xuất hiện sau khi duyệt'}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {q.status === 'approved' ? (
                          <div className="text-xs font-extrabold text-emerald-700">
                            {(q.final_price || q.base_price || 0).toLocaleString('vi-VN')} ₫
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">
                            {q.status === 'rejected' ? '—' : 'Chờ duyệt'}
                          </span>
                        )}
                        <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                          {q.created_at ? new Date(q.created_at).toLocaleDateString('vi-VN') : 'Mới tạo'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-start flex-shrink-0">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-red-200"
          >
            <LogOut size={14} />
            Đăng xuất
          </button>

        </div>

      </div>
    </div>
  );
}
