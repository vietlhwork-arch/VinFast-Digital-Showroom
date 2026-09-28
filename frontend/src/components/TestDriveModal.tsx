import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, Car, User, Phone, Mail, MapPin,
  CheckCircle2, Sparkles, AlertCircle, Loader2, ShieldCheck, ChevronRight, LogIn, Lock
} from 'lucide-react';
import type { Vehicle, UserAccount, Role } from '@/types';
import { api } from '@/lib/api';

interface TestDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: Vehicle | null;
  allVehicles?: Vehicle[];
  user?: UserAccount | null;
  onOpenAuth?: (defaultRole?: Role) => void;
}

const SHOWROOM_LOCATIONS = [
  'VinFast Landmark 81 - Bình Thạnh, TP. Hồ Chí Minh',
  'VinFast Smart City - Nam Từ Liêm, Hà Nội',
  'VinFast Ocean Park - Gia Lâm, Hà Nội',
  'VinFast Phạm Hùng - Cầu Giấy, Hà Nội',
  'VinFast Thảo Điền - Thủ Đức, TP. Hồ Chí Minh',
  'VinFast Ngô Quyền - Ngô Quyền, Hải Phòng',
  'VinFast Điện Biên Phủ - Thanh Khê, Đà Nẵng',
  'VinFast 3 Tháng 2 - Ninh Kiều, Cần Thơ',
];


const TIME_SLOTS = [
  { id: '08:30', label: '08:30 - Sáng' },
  { id: '09:00', label: '09:00 - Sáng' },
  { id: '10:00', label: '10:00 - Sáng' },
  { id: '11:00', label: '11:00 - Sáng' },
  { id: '14:00', label: '14:00 - Chiều' },
  { id: '15:30', label: '15:30 - Chiều' },
  { id: '17:00', label: '17:00 - Chiều tối' },
];

export default function TestDriveModal({
  isOpen,
  onClose,
  initialVehicle = null,
  allVehicles = [],
  user = null,
  onOpenAuth,
}: TestDriveModalProps) {
  const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(initialVehicle);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState(tomorrowStr());
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0].id);
  const [showroomLocation, setShowroomLocation] = useState(SHOWROOM_LOCATIONS[0]);
  const [userNote, setUserNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successBooking, setSuccessBooking] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialVehicle) {
        setSelectedVehicle(initialVehicle);
      } else if (allVehicles.length > 0 && !selectedVehicle) {
        const firstCar = allVehicles.find((v) => v.category !== 'scooter') || allVehicles[0];
        setSelectedVehicle(firstCar);
      }

      if (user) {
        setCustomerName(user.name || '');
        setCustomerPhone(user.phone || '');
        setCustomerEmail(user.email || '');
      }
      setPreferredTime(TIME_SLOTS[0].id);
      setPreferredDate(tomorrowStr());
      setSuccessBooking(null);
      setErrorMsg('');
    }
  }, [isOpen, initialVehicle, user, allVehicles]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Vui lòng đăng nhập tài khoản trước khi đăng ký lái thử.');
      if (onOpenAuth) {
        onClose();
        onOpenAuth('customer');
      }
      return;
    }

    if (!selectedVehicle) {
      setErrorMsg('Vui lòng chọn dòng xe bạn muốn lái thử.');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Vui lòng nhập Số điện thoại liên hệ.');
      return;
    }
    if (customerPhone.trim().length < 9) {
      setErrorMsg('Số điện thoại không hợp lệ (ít nhất 9 chữ số).');
      return;
    }
    if (!preferredDate) {
      setErrorMsg('Vui lòng chọn ngày lái thử.');
      return;
    }

    try {
      setLoading(true);
      const combinedNotes = [
        `Địa điểm: ${showroomLocation}`,
        customerEmail ? `Email: ${customerEmail}` : '',
        userNote ? `Ghi chú: ${userNote}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        vehicle_id: String(selectedVehicle.id),
        vehicle_name: selectedVehicle.name,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes: combinedNotes,
      };

      const result = await api.createBooking<any>(payload);
      setSuccessBooking(result);
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMsg(err.message || 'Gửi đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessBooking(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header Gradient */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-blue-300">
              <Car className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  Trải nghiệm thực tế
                </span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Đăng Ký Lái Thử Xe VinFast
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-full transition-all"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {!user ? (
            /* AUTH REQUIREMENT SCREEN */
            <div className="text-center py-8 px-4 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-blue-100 relative">
                <Lock className="w-10 h-10 text-blue-600" />
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 rounded-full text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Yêu Cầu Đăng Nhập Tài Khoản
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                  Để đặt lịch lái thử, bảo mật thông tin và theo dõi lịch sử trải nghiệm xe VinFast, Quý khách vui lòng <strong className="text-blue-600 font-bold">đăng nhập tài khoản</strong> trước khi tiếp tục.
                </p>
              </div>

              {selectedVehicle && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 max-w-md mx-auto flex items-center justify-between text-left">
                  <div className="flex items-center space-x-3">
                    {selectedVehicle.image && (
                      <img
                        src={selectedVehicle.image}
                        alt={selectedVehicle.name}
                        className="w-16 h-10 object-contain"
                      />
                    )}
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">Dòng xe chọn lái thử</span>
                      <h4 className="text-sm font-extrabold text-slate-900">{selectedVehicle.name}</h4>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg">
                    Sẵn sàng
                  </span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenAuth) onOpenAuth('customer');
                  }}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-sm flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ĐĂNG NHẬP / ĐĂNG KÝ NGAY</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-sm"
                >
                  Để sau
                </button>
              </div>
            </div>
          ) : successBooking ? (
            /* SUCCESS STATE UI */
            <div className="text-center py-6 px-4 space-y-5 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Đăng Ký Lái Thử Thành Công!
                </h3>
                <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                  Cảm ơn quý khách <strong className="text-slate-900">{customerName}</strong> đã đặt lịch trải nghiệm cùng VinFast.
                </p>
              </div>

              {/* Booking Ticket Summary Card */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-5 rounded-2xl border border-slate-200/80 text-left space-y-3 shadow-sm max-w-lg mx-auto">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Dòng xe lái thử</span>
                  <span className="text-sm font-extrabold text-blue-700">{selectedVehicle?.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Thời gian hẹn</span>
                    <strong className="text-slate-800 font-bold block mt-0.5">
                      {preferredTime} - {new Date(preferredDate).toLocaleDateString('vi-VN')}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Số điện thoại</span>
                    <strong className="text-slate-800 font-bold block mt-0.5">
                      {customerPhone}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-400 block font-medium">Địa điểm</span>
                  <span className="text-slate-700 font-semibold block mt-0.5">
                    {showroomLocation}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Chuyên viên tư vấn VinFast sẽ gọi điện thoại xác nhận chi tiết lịch hẹn trong thời gian sớm nhất.
              </p>

              <button
                onClick={handleReset}
                className="w-full max-w-sm py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-sm"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          ) : (
            /* FORM STATE UI */
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* User Logged In Badge */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Đang đăng ký bằng tài khoản: <strong>{user.name || user.email}</strong>
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold rounded-md text-[10px] uppercase">
                  Đã xác thực
                </span>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center space-x-2.5 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Vehicle Selection */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span>1. Chọn Mẫu Xe Muốn Trải Nghiệm</span>
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold">(*) Bắt buộc</span>
                </label>

                {allVehicles.length > 0 ? (
                  <select
                    value={selectedVehicle?.id || ''}
                    onChange={(e) => {
                      const found = allVehicles.find((v) => String(v.id) === e.target.value);
                      if (found) setSelectedVehicle(found);
                    }}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  >
                    {(() => {
                      const cars = allVehicles.filter((v) => v.category !== 'scooter');
                      const scooters = allVehicles.filter((v) => v.category === 'scooter');
                      return (
                        <>
                          {cars.length > 0 && (
                            <optgroup label="🚗 Ô TÔ ĐIỆN VINFAST">
                              {cars.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} (Ô tô điện{v.seats ? ` - ${v.seats} chỗ` : ''})
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {scooters.length > 0 && (
                            <optgroup label="🛵 XE MÁY ĐIỆN VINFAST">
                              {scooters.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.name} (Xe máy điện)
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </>
                      );
                    })()}
                  </select>
                ) : (
                  <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between">
                    <span className="font-extrabold text-blue-900 text-sm">
                      {selectedVehicle?.name || 'VinFast EV'}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-full font-bold">
                      Đã chọn
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Customer Information */}
              <div className="space-y-3.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>2. Thông Tin Khách Hàng</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0987 654 321"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email liên hệ (Không bắt buộc)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Preferred Schedule */}
              <div className="space-y-3.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>3. Chọn Ngày & Khung Giờ Lái Thử</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Ngày trải nghiệm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Khung giờ mong muốn
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Location & Note */}
              <div className="space-y-3.5">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>4. Địa Điểm & Yêu Cầu Riêng</span>
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Showroom / Đại lý VinFast
                  </label>
                  <select
                    value={showroomLocation}
                    onChange={(e) => setShowroomLocation(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  >
                    {SHOWROOM_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ghi chú thêm (Tùy chọn)
                  </label>
                  <textarea
                    rows={2}
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Ví dụ: Muốn trải nghiệm hệ thống hỗ trợ lái nâng cao ADAS..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang gửi đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-blue-200" />
                      <span>XÁC NHẬN ĐĂNG KÝ LÁI THỬ</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 mt-2.5">
                  VinFast cam kết bảo mật thông tin cá nhân của Quý khách hàng.
                </p>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
