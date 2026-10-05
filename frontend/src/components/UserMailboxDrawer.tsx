import { useState, useEffect } from 'react';
import {
  X, Mail, CheckCircle2, Clock, XCircle, RefreshCw, Car, ShieldCheck,
  Calendar, MapPin, Phone, FileText
} from 'lucide-react';
import { api, formatVNDPrice } from '@/lib/api';
import type { UserAccount } from '@/types';
import QuoteTCOInvoice from '@/components/QuoteTCOInvoice';

interface UserMailboxDrawerProps {
  open: boolean;
  onClose: () => void;
  user: UserAccount | null;
}

type MailKind = 'all' | 'quotes' | 'bookings';
type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

export default function UserMailboxDrawer({ open, onClose, user }: UserMailboxDrawerProps) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [kindFilter, setKindFilter] = useState<MailKind>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchUserMailbox = async (silent = false) => {
    let effectiveUser = user;
    if (!effectiveUser) {
      try {
        const u = localStorage.getItem('vinfast_user');
        if (u) effectiveUser = JSON.parse(u);
      } catch {}
    }
    if (!effectiveUser) return;

    if (!silent) setLoading(true);
    try {
      const userPhone = (effectiveUser.phone || '').trim();
      const userEmail = (effectiveUser.email || '').trim().toLowerCase();
      const uDigits = userPhone.replace(/\D/g, '');

      const [quotesRes, bookingsRes] = await Promise.all([
        api.getQuotes<any[]>(effectiveUser.id, userEmail, userPhone).catch(() => []),
        api.getBookings<any[]>(userPhone, userEmail).catch(() => []),
      ]);

      const rawQuotes = Array.isArray(quotesRes) ? quotesRes : [];
      const rawBookings = Array.isArray(bookingsRes) ? bookingsRes : [];

      // Lọc nghiêm ngặt: Chỉ lấy đăng ký lái thử của chính tài khoản cá nhân này
      const personalBookings = rawBookings.filter((b) => {
        if (!b) return false;
        const bDigits = (b.customer_phone || '').replace(/\D/g, '');
        const matchesPhone = uDigits && bDigits && (bDigits === uDigits || bDigits.endsWith(uDigits) || uDigits.endsWith(bDigits));
        const notesLower = (b.notes || '').toLowerCase();
        const matchesEmail = userEmail && notesLower.includes(userEmail);
        return Boolean(matchesPhone || matchesEmail);
      });

      setQuotes(rawQuotes);
      setBookings(personalBookings);
    } catch (err) {
      console.error('Error fetching mailbox items:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !user) return;
    fetchUserMailbox(false);

    // 1. Cross-tab real-time sync via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('vinfast_realtime_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'QUOTE_STATUS_CHANGED') {
          fetchUserMailbox(true);
        }
      };
    } catch {}

    // 2. Same-window / same-tab instant sync via CustomEvent
    const handleCustomSync = () => {
      fetchUserMailbox(true);
    };
    window.addEventListener('vinfast_quote_updated', handleCustomSync);

    // 3. Cross-tab sync via storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vinfast_realtime_ping') {
        fetchUserMailbox(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. Lightweight polling fallback while drawer is open (every 3 seconds)
    const interval = setInterval(() => {
      fetchUserMailbox(true);
    }, 3000);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('vinfast_quote_updated', handleCustomSync);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [open, user]);

  if (!open || !user) return null;

  // Normalized items
  interface NormalizedMailItem {
    id: string;
    kind: 'quote' | 'booking';
    title: string;
    vehicleName: string;
    customerName: string;
    customerPhone: string;
    status: string; // 'pending' | 'approved' | 'confirmed' | 'completed' | 'rejected' | 'cancelled'
    createdAt: string;
    raw: any;
  }

  const normalizedQuotes: NormalizedMailItem[] = quotes.map((q) => ({
    id: `quote-${q.id}`,
    kind: 'quote',
    title: 'Báo Giá Xe',
    vehicleName: q.vehicle_name,
    customerName: q.customer_name,
    customerPhone: q.customer_phone,
    status: (q.status || 'pending').toLowerCase(),
    createdAt: q.created_at || '',
    raw: q,
  }));

  const normalizedBookings: NormalizedMailItem[] = bookings.map((b) => ({
    id: `booking-${b.id}`,
    kind: 'booking',
    title: 'Đăng Ký Lái Thử',
    vehicleName: b.vehicle_name,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    status: (b.status || 'pending').toLowerCase(),
    createdAt: b.created_at || '',
    raw: b,
  }));

  const allItems: NormalizedMailItem[] = [...normalizedQuotes, ...normalizedBookings].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  // Filter by Kind (All vs Quotes vs Bookings)
  const itemsByKind = allItems.filter((item) => {
    if (kindFilter === 'quotes') return item.kind === 'quote';
    if (kindFilter === 'bookings') return item.kind === 'booking';
    return true;
  });

  // Filter by Status
  const filteredItems = itemsByKind.filter((item) => {
    const s = item.status;
    const isAppr = ['approved', 'confirmed', 'completed'].includes(s);
    const isPend = s === 'pending';
    const isRej = ['rejected', 'cancelled'].includes(s);

    if (statusFilter === 'approved') return isAppr;
    if (statusFilter === 'pending') return isPend;
    if (statusFilter === 'rejected') return isRej;
    return true;
  });

  const totalCount = allItems.length;
  const quotesCount = normalizedQuotes.length;
  const bookingsCount = normalizedBookings.length;

  const approvedCount = itemsByKind.filter((i) => ['approved', 'confirmed', 'completed'].includes(i.status)).length;
  const pendingCount = itemsByKind.filter((i) => i.status === 'pending').length;
  const rejectedCount = itemsByKind.filter((i) => ['rejected', 'cancelled'].includes(i.status)).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 border border-white/20 shadow-inner">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-lg leading-tight">Hòm Thư Thông Báo</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {totalCount} tin
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Tài khoản cá nhân: <strong className="text-white">{user.name || user.email}</strong> {user.phone ? `(${user.phone})` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchUserMailbox(false)}
              disabled={loading}
              className="p-2 hover:bg-white/10 rounded-lg transition-all text-blue-200 hover:text-white cursor-pointer active:scale-95 disabled:opacity-50"
              title="Làm mới hòm thư"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-200 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Kind Switcher Tabs (Tất cả / Báo giá / Lái thử) */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100/80 border-b border-slate-200">
          <button
            onClick={() => setKindFilter('all')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              kindFilter === 'all'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Tất cả ({totalCount})</span>
          </button>
          <button
            onClick={() => setKindFilter('bookings')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              kindFilter === 'bookings'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-blue-600" />
            <span>Lái thử ({bookingsCount})</span>
          </button>
          <button
            onClick={() => setKindFilter('quotes')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              kindFilter === 'quotes'
                ? 'bg-white text-blue-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Báo giá ({quotesCount})</span>
          </button>
        </div>

        {/* Status Sub-Filters */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Tất cả trạng thái
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> Đã duyệt/Xác nhận ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-3 h-3" /> Chờ xử lý ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === 'rejected'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <XCircle className="w-3 h-3" /> Từ chối/Hủy ({rejectedCount})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && allItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm">Đang tải tin nhắn hòm thư...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Mail className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="font-semibold text-gray-700 text-base">Hòm thư trống</h4>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Chưa có thông báo nào trong danh mục này. Hãy trải nghiệm Đăng ký lái thử hoặc Yêu cầu báo giá xe VinFast ngay nhé!
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              if (item.kind === 'booking') {
                /* ================= TEST DRIVE BOOKING CARD ================= */
                const b = item.raw;
                const status = item.status;
                const isConfirmed = ['confirmed', 'approved'].includes(status);
                const isCompleted = status === 'completed';
                const isCancelled = ['cancelled', 'rejected'].includes(status);
                const isPending = !isConfirmed && !isCompleted && !isCancelled;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isConfirmed || isCompleted
                        ? 'border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-white shadow-sm'
                        : isCancelled
                        ? 'border-red-200 bg-red-50/20'
                        : 'border-amber-200 bg-gradient-to-br from-amber-50/40 via-white to-white shadow-sm'
                    }`}
                  >
                    {/* Status Banner */}
                    <div
                      className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between border-b ${
                        isConfirmed || isCompleted
                          ? 'bg-blue-100/80 text-blue-900 border-blue-200'
                          : isCancelled
                          ? 'bg-red-100/70 text-red-800 border-red-200'
                          : 'bg-amber-100/80 text-amber-900 border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {isConfirmed || isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : isCancelled ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                        )}
                        <span>
                          {isCompleted
                            ? '🎉 ĐÃ HOÀN TẤT LÁI THỬ'
                            : isConfirmed
                            ? '✅ LỊCH HẸN LÁI THỬ ĐÃ XÁC NHẬN'
                            : isCancelled
                            ? '❌ LỊCH HẸN LÁI THỬ ĐÃ HỦY'
                            : '⏳ ĐĂNG KÝ LÁI THỬ — ĐANG CHỜ XÁC NHẬN'}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-normal">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString('vi-VN') : ''}
                      </span>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-gray-900 text-base">{b.vehicle_name}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Khách hàng: <strong>{b.customer_name}</strong> ({b.customer_phone})
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[11px] font-black uppercase">
                          Lái thử thực tế
                        </span>
                      </div>

                      {/* Appointment details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-600" /> Thời gian trải nghiệm
                          </span>
                          <span className="font-bold text-slate-800 block mt-0.5">
                            {b.preferred_time || '09:00'} - {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase flex items-center gap-1">
                            <Phone className="w-3 h-3 text-blue-600" /> Hotline tiếp đón
                          </span>
                          <span className="font-bold text-blue-700 block mt-0.5">
                            1900 23 23 89
                          </span>
                        </div>
                      </div>

                      {/* Location & Notes */}
                      {b.notes && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{b.notes}</span>
                        </div>
                      )}

                      {/* Guidance notice */}
                      {isConfirmed ? (
                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed space-y-1">
                          <div className="font-bold flex items-center gap-1 text-blue-800">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            <span>Lịch hẹn đã được Showroom ghi nhận</span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Quý khách vui lòng mang theo Giấy phép lái xe (GPLX) còn hiệu lực khi đến Showroom để hoàn tất thủ tục lái thử xe <strong>{b.vehicle_name}</strong>.
                          </p>
                        </div>
                      ) : isPending ? (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                          Yêu cầu đăng ký lái thử xe <strong>{b.vehicle_name}</strong> của Quý khách đã gửi tới hệ thống. Chuyên viên VinFast sẽ gọi điện thoại xác nhận chi tiết lịch hẹn trong thời gian sớm nhất.
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              }

              /* ================= QUOTE CARD ================= */
              const q = item.raw;
              const status = item.status;
              const isApproved = status === 'approved';
              const isRejected = ['rejected', 'cancelled'].includes(status);

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isApproved
                      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white shadow-sm'
                      : isRejected
                      ? 'border-red-200 bg-red-50/20'
                      : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  {/* Status Banner */}
                  <div
                    className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b ${
                      isApproved
                        ? 'bg-emerald-100/70 text-emerald-800 border-emerald-200'
                        : isRejected
                        ? 'bg-red-100/70 text-red-800 border-red-200'
                        : 'bg-amber-100/70 text-amber-800 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isApproved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isRejected ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      )}
                      <span>
                        {isApproved
                          ? 'ĐÃ ĐƯỢC TƯ VẤN VIÊN DUYỆT'
                          : isRejected
                          ? 'BÁO GIÁ KHÔNG ĐƯỢC CHẤP NHẬN'
                          : 'ĐANG CHỜ TƯ VẤN VIÊN KHỞI TẠO & DUYỆT'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-normal">
                      {q.created_at ? new Date(q.created_at).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Car className="w-5 h-5 text-blue-700" />
                          <h3 className="font-bold text-gray-900 text-base">{q.vehicle_name}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Khách hàng: {q.customer_name} ({q.customer_phone})</p>
                      </div>
                      <div className="text-right">
                        {isApproved ? (
                          <>
                            <div className="text-[10px] text-gray-400 font-medium">Giá lăn bánh chính thức</div>
                            <div className="text-base font-black text-emerald-700">
                              {formatVNDPrice(q.final_price || q.base_price)}
                            </div>
                          </>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase inline-block ${
                              isRejected
                                ? 'bg-red-100 text-red-700 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            }`}
                          >
                            {isRejected ? 'Bị từ chối' : 'Đang chờ duyệt giá'}
                          </span>
                        )}
                      </div>
                    </div>

                    {isApproved ? (
                      /* APPROVED QUOTE: FULL ITEMIZED TCO INVOICE PRESENTATION */
                      <div className="pt-2 border-t border-emerald-100">
                        <QuoteTCOInvoice
                          vehicleName={q.vehicle_name}
                          basePrice={q.base_price}
                          discount={q.discount}
                          finalPrice={q.final_price}
                          notes={q.notes}
                        />
                      </div>
                    ) : isRejected ? (
                      /* REJECTED QUOTE: HIDE PRICES ENTIRELY */
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-red-700">
                          <XCircle className="w-4 h-4" />
                          <span>Báo giá chưa được chấp thuận hoặc đã hết hiệu lực</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Yêu cầu báo giá mẫu xe <strong>{q.vehicle_name}</strong> hiện chưa được phê duyệt. Quý khách vui lòng liên hệ hotline <strong>1900 23 23 89</strong> hoặc chat với nhân viên để nhận báo giá cập nhật mới nhất.
                        </p>
                      </div>
                    ) : (
                      /* PENDING QUOTE: HIDE PRICES ENTIRELY */
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800">
                          <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span>Đang chờ Chuyên viên xét duyệt chiết khấu & giá lăn bánh</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Yêu cầu báo giá mẫu xe <strong>{q.vehicle_name}</strong> đang được Tư vấn viên VinFast xử lý. Hóa đơn chi tiết bóc tách chi phí lăn bánh (TCO) và ưu đãi chiết khấu sẽ xuất hiện ở đây ngay sau khi được duyệt!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
