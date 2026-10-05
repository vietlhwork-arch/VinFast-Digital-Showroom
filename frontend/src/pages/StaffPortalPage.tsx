import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Clock, CheckCircle2, XCircle, RefreshCw, Search,
  User, Phone, Mail, Car, Calendar, ChevronDown, Loader2,
  TrendingUp, AlertCircle, FileText, Plus, Shield,
  Edit3, RotateCcw, Sliders, Trash2, Check, ArrowLeft,
  Sparkles, Tag, Layers, MapPin, Receipt
} from 'lucide-react';
import { api, formatVNDPrice } from '@/lib/api';
import type { Quote } from '@/types';
import QuoteTCOInvoice, {
  TCOLineItem,
  generateDefaultLineItems,
  calculateTotalFromItems,
  parseTCOItemsFromNotes,
  encodeTCOItemsToNotes
} from '@/components/QuoteTCOInvoice';

interface StaffPortalPageProps {
  onBackToHome?: () => void;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';
type BookingFilterTab = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: 'text-amber-700 bg-amber-50 border-amber-300', dot: 'bg-amber-500', icon: Clock },
  approved: { label: 'Đã duyệt', color: 'text-emerald-700 bg-emerald-50 border-emerald-300', dot: 'bg-emerald-500', icon: CheckCircle2 },
  rejected: { label: 'Từ chối', color: 'text-red-700 bg-red-50 border-red-300', dot: 'bg-red-500', icon: XCircle },
};

function formatPrice(p: number) {
  return (p || 0).toLocaleString('vi-VN') + ' VNĐ';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatNumberWithDots(val: string | number): string {
  if (val === '' || val === undefined || val === null) return '';
  const isNegative = String(val).startsWith('-');
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return isNegative ? '-' : '';
  const formatted = Number(digits).toLocaleString('vi-VN');
  return isNegative ? `-${formatted}` : formatted;
}

interface CurrencyInputFieldProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  placeholder?: string;
  isDiscount?: boolean;
  disabled?: boolean;
}

function formatVietnameseWords(num: number): string {
  if (!num || isNaN(num) || num === 0) return '0 VNĐ';
  const abs = Math.abs(num);
  let words = '';
  if (abs >= 1_000_000_000) {
    words = `${(abs / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  } else if (abs >= 1_000_000) {
    words = `${(abs / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} triệu`;
  } else if (abs >= 1_000) {
    words = `${(abs / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} nghìn`;
  }
  return `${abs.toLocaleString('vi-VN')} VNĐ ${words ? `(${words})` : ''}`;
}

function CurrencyInputField({
  value,
  onChange,
  className = '',
  placeholder = '0',
  isDiscount = false,
  disabled = false,
}: CurrencyInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState(() => (value ? String(Math.abs(value)) : ''));

  useEffect(() => {
    if (!isFocused) {
      setRawText(value ? String(Math.abs(value)) : '');
    }
  }, [value, isFocused]);

  const currentNum = rawText ? Number(rawText.replace(/\D/g, '')) : 0;
  const displayValue = isFocused
    ? rawText
    : (value !== undefined && value !== null && !isNaN(value) && value !== 0
        ? Math.abs(value).toLocaleString('vi-VN')
        : (value === 0 ? '0' : ''));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const digitsOnly = val.replace(/\D/g, '');
    setRawText(digitsOnly);
    const num = digitsOnly ? Number(digitsOnly) : 0;
    onChange(isDiscount ? -num : num);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    const currentRaw = value ? String(Math.abs(value)) : '';
    setRawText(currentRaw);
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = rawText ? Number(rawText.replace(/\D/g, '')) : 0;
    onChange(isDiscount ? -num : num);
  };

  return (
    <div className="relative inline-block">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={displayValue}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder={placeholder}
        className={className}
      />
      {isFocused && (
        <div className="absolute right-0 top-full mt-1.5 z-50 px-2.5 py-1 bg-slate-900 text-white rounded-lg shadow-xl text-[11px] font-black whitespace-nowrap border border-blue-400 flex items-center gap-1.5 animate-in fade-in pointer-events-none">
          <Sparkles size={12} className="text-yellow-400 shrink-0" />
          <span>= {isDiscount ? '-' : ''}{formatVietnameseWords(currentNum)}</span>
        </div>
      )}
    </div>
  );
}

interface PercentInputFieldProps {
  percentage: number;
  basePrice: number;
  isDiscount?: boolean;
  disabled?: boolean;
  onChange: (percent: number, calculatedAmount: number) => void;
  className?: string;
}

function PercentInputField({
  percentage,
  basePrice,
  isDiscount = false,
  disabled = false,
  onChange,
  className = '',
}: PercentInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [textVal, setTextVal] = useState(() => (percentage !== undefined && percentage !== null ? String(percentage) : ''));

  useEffect(() => {
    if (!isFocused) {
      setTextVal(percentage !== undefined && percentage !== null && percentage !== 0 ? String(percentage) : '');
    }
  }, [percentage, isFocused]);

  const pNum = parseFloat(textVal) || 0;
  const computedAmt = Math.round(basePrice * (pNum / 100));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setTextVal(val);
    const parsed = parseFloat(val) || 0;
    const amt = Math.round(basePrice * (parsed / 100));
    onChange(parsed, isDiscount ? -amt : amt);
  };

  return (
    <div className="relative inline-block">
      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          value={isFocused ? textVal : (percentage ? `${percentage}%` : '0%')}
          onFocus={(e) => {
            setIsFocused(true);
            setTextVal(percentage ? String(percentage) : '');
            e.target.select();
          }}
          onBlur={() => {
            setIsFocused(false);
            const parsed = parseFloat(textVal) || 0;
            const amt = Math.round(basePrice * (parsed / 100));
            onChange(parsed, isDiscount ? -amt : amt);
          }}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="0%"
          className={className}
        />
      </div>
      {isFocused && (
        <div className="absolute right-0 top-full mt-1.5 z-50 px-2.5 py-1 bg-slate-900 text-white rounded-lg shadow-xl text-[11px] font-black whitespace-nowrap border border-purple-400 flex items-center gap-1.5 animate-in fade-in pointer-events-none">
          <Sparkles size={12} className="text-yellow-400 shrink-0" />
          <span>= {isDiscount ? '-' : '+'}{formatVNDPrice(computedAmt)} ({pNum}% của {formatVNDPrice(basePrice)})</span>
        </div>
      )}
    </div>
  );
}

interface QuoteFormState {
  items: TCOLineItem[];
  notes: string;
}

export default function StaffPortalPage({ onBackToHome }: StaffPortalPageProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [bookingFilterTab, setBookingFilterTab] = useState<BookingFilterTab>('all');
  const [search, setSearch] = useState('');
  const [updatingAction, setUpdatingAction] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [quoteForms, setQuoteForms] = useState<Record<string, QuoteFormState>>({});
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [mainTab, setMainTab] = useState<'quotes' | 'bookings'>('quotes');

  // Custom Item Modal / Inline Adder State
  const [addingItemToQuoteId, setAddingItemToQuoteId] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState<{
    title: string;
    note: string;
    amount: number;
    percentage: number;
    isPercentage: boolean;
    type: 'fee' | 'discount' | 'free' | 'custom';
  }>({
    title: '',
    note: '',
    amount: 0,
    percentage: 0,
    isPercentage: false,
    type: 'fee',
  });

  const fetchQuotesAndBookings = useCallback(async () => {
    setLoading(true);
    try {
      const [apiQuotes, apiBookings, apiUsers] = await Promise.all([
        api.getQuotes<any[]>().catch(() => []),
        api.getBookings<any[]>().catch(() => []),
        api.getUsers<any[]>().catch(() => []),
      ]);

      const uMap: Record<string, { name: string; phone: string }> = {};
      if (Array.isArray(apiUsers)) {
        apiUsers.forEach((u: any) => {
          const phoneVal = u.phone || u.customer_phone || '';
          const nameVal = u.full_name || u.name || '';
          if (u.id) uMap[u.id] = { name: nameVal, phone: phoneVal };
          if (u.email) uMap[u.email.toLowerCase()] = { name: nameVal, phone: phoneVal };
        });
      }

      const formattedQuotes = (Array.isArray(apiQuotes) ? apiQuotes : []).map((q: any) => {
        const match = (q.customer_email && uMap[q.customer_email.toLowerCase()]) || (q.user_id && uMap[q.user_id]);
        let realPhone = q.customer_phone;
        let realName = q.customer_name;

        if (match) {
          if (match.phone && (!realPhone || realPhone === '0900000000' || realPhone === '0901234567')) {
            realPhone = match.phone;
          }
          if (match.name && (!realName || realName === 'Khách hàng VinFast')) {
            realName = match.name;
          }
        }
        return {
          ...q,
          customer_phone: realPhone || 'Chưa cập nhật',
          customer_name: realName || 'Khách hàng VinFast',
        };
      });

      setQuotes(formattedQuotes as Quote[]);
      setBookings(apiBookings as any[]);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotesAndBookings();
  }, [fetchQuotesAndBookings]);

  // Initializer for quote form state
  const getQuoteForm = (quote: Quote): QuoteFormState => {
    if (quoteForms[quote.id]) {
      return quoteForms[quote.id];
    }
    const parsed = parseTCOItemsFromNotes(quote.notes);
    const initialItems =
      parsed.items && parsed.items.length > 0
        ? parsed.items
        : generateDefaultLineItems(quote.vehicle_name, quote.base_price, quote.discount || 0);

    return {
      items: initialItems,
      notes: parsed.cleanNotes || '',
    };
  };

  // Add Item to a Quote
  const handleAddItemToQuote = (quoteId: string, baseQuote: Quote) => {
    if (!newItemForm.title.trim()) {
      alert('Vui lòng nhập tên đầu mục chi phí.');
      return;
    }
    const basePrice = baseQuote.base_price || 0;
    let finalAmt = 0;
    let finalPercentage: number | undefined = undefined;

    if (newItemForm.isPercentage) {
      finalPercentage = newItemForm.percentage || 0;
      const rawCalc = Math.round(basePrice * (finalPercentage / 100));
      finalAmt = newItemForm.type === 'discount' ? -Math.abs(rawCalc) : newItemForm.type === 'free' ? 0 : Math.abs(rawCalc);
    } else {
      const parsedAmt = newItemForm.amount || 0;
      finalAmt = newItemForm.type === 'discount' ? -Math.abs(parsedAmt) : newItemForm.type === 'free' ? 0 : Math.abs(parsedAmt);
    }

    const currentForm = getQuoteForm(baseQuote);
    const newItem: TCOLineItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newItemForm.title.trim(),
      note: newItemForm.note.trim() || (newItemForm.isPercentage ? `${finalPercentage}% giá niêm yết xe` : 'Hạng mục tùy chỉnh'),
      amount: finalAmt,
      isPercentage: newItemForm.isPercentage,
      percentage: finalPercentage,
      type: newItemForm.type === 'discount' ? 'discount' : newItemForm.type === 'free' ? 'free' : 'custom',
      isDeletable: true,
    };

    setQuoteForms((prev) => ({
      ...prev,
      [quoteId]: {
        ...currentForm,
        items: [...currentForm.items, newItem],
      },
    }));

    setNewItemForm({ title: '', note: '', amount: 0, percentage: 0, isPercentage: false, type: 'fee' });
    setAddingItemToQuoteId(null);
    setToastMsg({ text: `Đã thêm đầu mục "${newItem.title}" vào hóa đơn!`, type: 'success' });
  };

  // Remove Item from a Quote
  const handleRemoveItem = (quoteId: string, itemId: string, baseQuote: Quote) => {
    const currentForm = getQuoteForm(baseQuote);
    const itemToRemove = currentForm.items.find(i => i.id === itemId);
    const updated = currentForm.items.filter(i => i.id !== itemId);
    setQuoteForms((prev) => ({
      ...prev,
      [quoteId]: {
        ...currentForm,
        items: updated,
      },
    }));
    setToastMsg({ text: `Đã xóa đầu mục "${itemToRemove?.title || ''}" khỏi hóa đơn.`, type: 'info' });
  };

  // Update item field directly
  const handleUpdateItemField = (
    quoteId: string,
    itemId: string,
    field: keyof TCOLineItem,
    value: any,
    baseQuote: Quote
  ) => {
    const currentForm = getQuoteForm(baseQuote);
    const basePrice = baseQuote.base_price || 0;

    const updated = currentForm.items.map((item) => {
      if (item.id === itemId) {
        if (field === 'percentage') {
          const p = Number(value) || 0;
          const isDisc = item.type === 'discount' || item.amount < 0;
          const amt = Math.round(basePrice * (p / 100));
          return {
            ...item,
            percentage: p,
            amount: isDisc ? -amt : amt,
          };
        }
        return {
          ...item,
          [field]: value,
        };
      }
      return item;
    });

    setQuoteForms((prev) => ({
      ...prev,
      [quoteId]: {
        ...currentForm,
        items: updated,
      },
    }));
  };

  // Toggle % mode for an item in table
  const handleToggleItemPercentMode = (quoteId: string, itemId: string, baseQuote: Quote) => {
    const currentForm = getQuoteForm(baseQuote);
    const basePrice = baseQuote.base_price || 1;

    const updated = currentForm.items.map((item) => {
      if (item.id === itemId) {
        const nextIsPercent = !item.isPercentage;
        if (nextIsPercent) {
          const currentPercent = Math.round((Math.abs(item.amount) / basePrice) * 1000) / 10;
          return {
            ...item,
            isPercentage: true,
            percentage: currentPercent || 5,
            amount: item.type === 'discount' || item.amount < 0
              ? -Math.round(basePrice * ((currentPercent || 5) / 100))
              : Math.round(basePrice * ((currentPercent || 5) / 100)),
          };
        } else {
          return {
            ...item,
            isPercentage: false,
          };
        }
      }
      return item;
    });

    setQuoteForms((prev) => ({
      ...prev,
      [quoteId]: {
        ...currentForm,
        items: updated,
      },
    }));
  };

  // Quick Preset Adders
  const handleAddPreset = (
    quoteId: string,
    baseQuote: Quote,
    presetType: 'hull_insurance' | 'full_service' | 'accessories' | 'home_charger' | 'voucher' | 'discount_5' | 'discount_10'
  ) => {
    const currentForm = getQuoteForm(baseQuote);
    const basePrice = baseQuote.base_price || 0;
    let presetItem: TCOLineItem;

    switch (presetType) {
      case 'hull_insurance':
        presetItem = {
          id: `hull_${Date.now()}`,
          title: 'Bảo hiểm thân vỏ / vật chất xe (1.5%)',
          note: 'Bảo hiểm PJICO / Bảo Việt chính hãng 1 năm (1.5% giá xe)',
          amount: Math.round(basePrice * 0.015),
          isPercentage: true,
          percentage: 1.5,
          type: 'custom',
          isDeletable: true,
        };
        break;
      case 'discount_5':
        presetItem = {
          id: `disc5_${Date.now()}`,
          title: 'Ưu đãi tri ân VinFast (-5% giá xe)',
          note: 'Giảm trực tiếp 5% giá niêm yết xe',
          amount: -Math.round(basePrice * 0.05),
          isPercentage: true,
          percentage: 5,
          type: 'discount',
          isDeletable: true,
        };
        break;
      case 'discount_10':
        presetItem = {
          id: `disc10_${Date.now()}`,
          title: 'Chiết khấu CBNV Vingroup / Đối tác (-10%)',
          note: 'Ưu đãi nội bộ Vingroup 10% giá niêm yết',
          amount: -Math.round(basePrice * 0.10),
          isPercentage: true,
          percentage: 10,
          type: 'discount',
          isDeletable: true,
        };
        break;
      case 'full_service':
        presetItem = {
          id: `service_${Date.now()}`,
          title: 'Dịch vụ đăng ký & đăng kiểm trọn gói',
          note: 'Hỗ trợ thủ tục biển số & giao xe tận nhà',
          amount: 2000000,
          type: 'custom',
          isDeletable: true,
        };
        break;
      case 'accessories':
        presetItem = {
          id: `acc_${Date.now()}`,
          title: 'Gói phụ kiện chính hãng VinFast',
          note: 'Thảm sàn, dán phim cách nhiệt & camera hành trình',
          amount: 5000000,
          type: 'custom',
          isDeletable: true,
        };
        break;
      case 'home_charger':
        presetItem = {
          id: `charger_${Date.now()}`,
          title: 'Bộ sạc treo tường tại nhà 7.4kW & Lắp đặt',
          note: 'Bảo hành chính hãng 24 tháng',
          amount: 7500000,
          type: 'custom',
          isDeletable: true,
        };
        break;
      case 'voucher':
        presetItem = {
          id: `voucher_${Date.now()}`,
          title: 'Voucher tri ân Khách hàng VinFast',
          note: 'Áp dụng giảm trừ trực tiếp vào giá xe',
          amount: -10000000,
          type: 'discount',
          isDeletable: true,
        };
        break;
    }

    setQuoteForms((prev) => ({
      ...prev,
      [quoteId]: {
        ...currentForm,
        items: [...currentForm.items, presetItem],
      },
    }));

    setToastMsg({ text: `Đã thêm gói "${presetItem.title}" vào hóa đơn!`, type: 'success' });
  };

  // Reset to VinFast standard defaults
  const handleResetToDefaults = (quote: Quote) => {
    const defaultItems = generateDefaultLineItems(quote.vehicle_name, quote.base_price, quote.discount || 0);
    setQuoteForms((prev) => ({
      ...prev,
      [quote.id]: {
        items: defaultItems,
        notes: '',
      },
    }));
    setToastMsg({ text: `Đã khôi phục các đầu mục về quy chuẩn mặc định của VinFast.`, type: 'info' });
  };

  // Save / Approve / Reject Quote
  async function handleSaveQuote(id: string, status: 'approved' | 'rejected') {
    setUpdatingAction({ id, action: status });
    const targetQuote = quotes.find((q) => q.id === id);
    if (!targetQuote) {
      setUpdatingAction(null);
      return;
    }

    const form = getQuoteForm(targetQuote);
    const computedFinalPrice = Math.max(0, calculateTotalFromItems(form.items));

    const baseItem = form.items.find(i => i.id === 'base_price' || i.type === 'base');
    const newBasePrice = baseItem ? baseItem.amount : targetQuote.base_price;

    const discountItems = form.items.filter(i => i.amount < 0 || i.type === 'discount');
    const totalDiscount = Math.abs(discountItems.reduce((s, i) => s + i.amount, 0));

    const encodedNotes = encodeTCOItemsToNotes(form.notes, form.items);

    const payload = {
      status,
      base_price: newBasePrice,
      discount: totalDiscount,
      final_price: computedFinalPrice,
      notes: encodedNotes,
      updated_at: new Date().toISOString(),
    };

    try {
      await api.updateQuoteStatus(id, payload);
    } catch (e) {
      setToastMsg({ text: e instanceof Error ? e.message : 'Không thể cập nhật báo giá.', type: 'error' });
      setUpdatingAction(null);
      return;
    }

    setQuotes((prev) =>
        prev.map((q) =>
          q.id === id
            ? {
                ...q,
                status,
                base_price: newBasePrice,
                notes: encodedNotes,
                discount: totalDiscount,
                final_price: computedFinalPrice,
              }
            : q
        )
      );

      const customerName = targetQuote.customer_name || 'Khách hàng';
      const vehicleName = targetQuote.vehicle_name || 'mẫu xe';
      if (status === 'approved') {
        setToastMsg({
          text: `🟢 Đã duyệt & đồng bộ hóa đơn ${vehicleName} cho ${customerName}! Tổng lăn bánh: ${formatVNDPrice(computedFinalPrice)}`,
          type: 'success',
        });
      } else {
        setToastMsg({
          text: `🔴 Đã từ chối báo giá từ ${customerName}.`,
          type: 'info',
        });
      }

    setEditingQuoteId(null);

    setUpdatingAction(null);
  }

  // Update Booking Status
  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    setUpdatingBookingId(id);
    try {
      await api.updateBookingStatus(id, { status: newStatus });
      setToastMsg({ text: `Đã cập nhật trạng thái lịch hẹn sang: ${newStatus}`, type: 'success' });
      fetchQuotesAndBookings();
    } catch (err: any) {
      setToastMsg({ text: err.message || 'Cập nhật thất bại', type: 'error' });
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Filter logic
  const filteredQuotes = quotes
    .filter((q) => {
      if (filterTab === 'all') return true;
      return q.status === filterTab;
    })
    .filter((q) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        (q.customer_name || '').toLowerCase().includes(s) ||
        (q.customer_phone || '').includes(s) ||
        (q.customer_email || '').toLowerCase().includes(s) ||
        (q.vehicle_name || '').toLowerCase().includes(s)
      );
    });

  const filteredBookings = bookings
    .filter((b) => {
      if (bookingFilterTab === 'all') return true;
      return b.status === bookingFilterTab;
    })
    .filter((b) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        (b.customer_name || '').toLowerCase().includes(s) ||
        (b.customer_phone || '').includes(s) ||
        (b.vehicle_name || '').toLowerCase().includes(s)
      );
    });

  const quoteStats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status === 'pending').length,
    approved: quotes.filter((q) => q.status === 'approved').length,
    rejected: quotes.filter((q) => q.status === 'rejected').length,
  };

  const bookingStats = {
    total: bookings.length,
    pending: bookings.filter((b) => !b.status || b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white pt-28 sm:pt-32 md:pt-36 pb-20">
      {/* Sub-Header Portal Navigation Bar */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200 shadow-sm shrink-0 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Về Showroom</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>HỆ THỐNG ĐIỀU PHỐI BÁN HÀNG & PHÊ DUYỆT BÁO GIÁ VINFAST</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    Sales Consultant Portal
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Xác nhận báo giá • Bóc tách linh hoạt các đầu mục TCO • Quản lý lịch hẹn lái thử
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={fetchQuotesAndBookings}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Toast Alert */}
        {toastMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm transition-all animate-in fade-in ${
              toastMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : toastMsg.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500 shrink-0" />
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-slate-700 px-2 cursor-pointer">✕</button>
          </div>
        )}

        {/* Tab Switcher & Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Navigation Switcher */}
          <div className="lg:col-span-1 bg-white p-2 rounded-2xl border border-slate-200 flex gap-2 shadow-sm">
            <button
              onClick={() => setMainTab('quotes')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === 'quotes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText size={16} />
              <span>Báo Giá ({quoteStats.total})</span>
            </button>

            <button
              onClick={() => setMainTab('bookings')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === 'bookings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Calendar size={16} />
              <span>Lái Thử ({bookingStats.total})</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mainTab === 'quotes' ? (
              <>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-sm">
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Tổng báo giá</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{quoteStats.total}</div>
                </div>
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-center shadow-sm">
                  <div className="text-[11px] text-amber-700 font-bold uppercase">Chờ duyệt</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{quoteStats.pending}</div>
                </div>
                <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-center shadow-sm">
                  <div className="text-[11px] text-emerald-700 font-bold uppercase">Đã duyệt</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{quoteStats.approved}</div>
                </div>
                <div className="bg-red-50/80 p-3.5 rounded-2xl border border-red-200 text-center shadow-sm">
                  <div className="text-[11px] text-red-700 font-bold uppercase">Từ chối</div>
                  <div className="text-2xl font-black text-red-600 mt-1">{quoteStats.rejected}</div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-sm">
                  <div className="text-[11px] text-slate-500 font-bold uppercase">Tổng lịch hẹn</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{bookingStats.total}</div>
                </div>
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-center shadow-sm">
                  <div className="text-[11px] text-amber-700 font-bold uppercase">Chờ xử lý</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">{bookingStats.pending}</div>
                </div>
                <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-center shadow-sm">
                  <div className="text-[11px] text-blue-700 font-bold uppercase">Đã xác nhận</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">{bookingStats.confirmed}</div>
                </div>
                <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-center shadow-sm">
                  <div className="text-[11px] text-emerald-700 font-bold uppercase">Hoàn tất</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{bookingStats.completed}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {mainTab === 'quotes' ? (
              <>
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    filterTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({quoteStats.total})
                </button>
                <button
                  onClick={() => setFilterTab('pending')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    filterTab === 'pending' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Clock size={12} /> Chờ duyệt ({quoteStats.pending})
                </button>
                <button
                  onClick={() => setFilterTab('approved')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    filterTab === 'approved' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 size={12} /> Đã duyệt ({quoteStats.approved})
                </button>
                <button
                  onClick={() => setFilterTab('rejected')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    filterTab === 'rejected' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <XCircle size={12} /> Từ chối ({quoteStats.rejected})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setBookingFilterTab('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    bookingFilterTab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({bookingStats.total})
                </button>
                <button
                  onClick={() => setBookingFilterTab('pending')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    bookingFilterTab === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Chờ xử lý ({bookingStats.pending})
                </button>
                <button
                  onClick={() => setBookingFilterTab('confirmed')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    bookingFilterTab === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đã xác nhận ({bookingStats.confirmed})
                </button>
                <button
                  onClick={() => setBookingFilterTab('completed')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    bookingFilterTab === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Hoàn tất ({bookingStats.completed})
                </button>
              </>
            )}
          </div>

          <div className="relative min-w-[260px]">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, xe, số điện thoại..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 size={36} className="text-blue-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-600">Đang tải dữ liệu điều phối bán hàng...</p>
          </div>
        ) : mainTab === 'quotes' ? (
          /* QUOTES LIST */
          filteredQuotes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-sm">
              <FileText size={48} className="mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">Không tìm thấy yêu cầu báo giá phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search ? 'Hãy thử tìm với từ khóa khác' : 'Chưa có yêu cầu báo giá nào trong danh mục này.'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredQuotes.map((quote) => {
                const cfg = STATUS_CONFIG[quote.status];
                const StatusIcon = cfg.icon;
                const isExpanded = expandedId === quote.id;
                const isEditing = editingQuoteId === quote.id;
                const currentForm = getQuoteForm(quote);

                const computedTotal = calculateTotalFromItems(currentForm.items);

                return (
                  <div
                    key={quote.id}
                    className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 transition-all hover:border-slate-300 shadow-sm"
                  >
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-base font-black text-slate-900">{quote.customer_name}</span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase ${cfg.color}`}>
                              <StatusIcon size={12} />
                              {cfg.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                            <a href={`tel:${quote.customer_phone}`} className="hover:text-blue-600 flex items-center gap-1 font-bold text-slate-700">
                              <Phone size={12} />
                              {quote.customer_phone}
                            </a>
                            {quote.customer_email && (
                              <span className="flex items-center gap-1">
                                <Mail size={12} />
                                {quote.customer_email}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-blue-700 font-extrabold">
                              <Car size={13} className="text-blue-600" />
                              {quote.vehicle_name}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Calendar size={12} />
                              {formatDate(quote.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Price & Quick Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Tổng giá lăn bánh TCO</div>
                          <div className="text-base sm:text-lg font-black text-blue-700">
                            {formatPrice(quote.final_price || quote.base_price)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedId(null);
                                setEditingQuoteId(null);
                              } else {
                                setExpandedId(quote.id);
                              }
                            }}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isExpanded
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <span>Hóa đơn TCO & Tùy biến</span>
                            <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>

                          {quote.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleSaveQuote(quote.id, 'rejected')}
                                disabled={updatingAction?.id === quote.id}
                                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {updatingAction?.id === quote.id && updatingAction.action === 'rejected' ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : null}
                                <span>Từ chối</span>
                              </button>
                              <button
                                onClick={() => handleSaveQuote(quote.id, 'approved')}
                                disabled={updatingAction?.id === quote.id}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {updatingAction?.id === quote.id && updatingAction.action === 'approved' ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <Check size={14} />
                                )}
                                <span>Duyệt & Gửi ✓</span>
                              </button>
                            </>
                          ) : quote.status === 'approved' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold flex items-center gap-1">
                              <CheckCircle2 size={13} /> Đã gửi Khách
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Section: Full Dynamic TCO Builder & Invoice */}
                    {isExpanded && (
                      <div className="mt-5 pt-4 border-t border-slate-100 space-y-5 animate-in fade-in">
                        {/* Interactive Toolbar for Consultant */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => setEditingQuoteId(isEditing ? null : quote.id)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                                isEditing
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                  : 'bg-white hover:bg-blue-100 text-blue-700 border border-blue-200'
                              }`}
                            >
                              <Edit3 size={14} />
                              <span>{isEditing ? 'Đang mở Chế độ Sửa/Xóa/Thêm TCO' : '✏️ Chỉnh sửa & Bổ sung đầu mục TCO'}</span>
                            </button>

                            <button
                              onClick={() => handleResetToDefaults(quote)}
                              className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Khôi phục các đầu mục về quy chuẩn mặc định của dòng xe"
                            >
                              <RotateCcw size={13} />
                              <span>Đặt lại chuẩn VinFast</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-600 font-bold hidden sm:inline-block">Thêm nhanh gói VinFast:</span>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => handleAddPreset(quote.id, quote, 'discount_5')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all cursor-pointer"
                              >
                                + Ưu đãi (-5%)
                              </button>
                              <button
                                onClick={() => handleAddPreset(quote.id, quote, 'discount_10')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all cursor-pointer"
                              >
                                + Giảm (-10% CBNV)
                              </button>
                              <button
                                onClick={() => handleAddPreset(quote.id, quote, 'hull_insurance')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-all cursor-pointer"
                              >
                                + Bảo hiểm thân vỏ (1.5%)
                              </button>
                              <button
                                onClick={() => handleAddPreset(quote.id, quote, 'full_service')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-all cursor-pointer"
                              >
                                + Đăng ký trọn gói (2tr)
                              </button>
                              <button
                                onClick={() => handleAddPreset(quote.id, quote, 'accessories')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition-all cursor-pointer"
                              >
                                + Phụ kiện (5tr)
                              </button>
                              <button
                                onClick={() => handleAddPreset(quote.id, quote, 'voucher')}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer"
                              >
                                + Voucher (-10tr)
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* LIVE INVOICE TABLE (WIDESCREEN FORMAT) */}
                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
                                <Receipt size={16} />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                                  HÓA ĐƠN BÓC TÁCH CHI PHÍ LĂN BÁNH TCO (LIVE PREVIEW)
                                </h4>
                                <span className="text-[11px] text-slate-300">
                                  {quote.vehicle_name} • Hỗ trợ linh hoạt cả VNĐ và % Chiết khấu/Phí
                                </span>
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                              Hóa đơn thực tế
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-[11px] font-black text-slate-600 uppercase tracking-wider border-b border-slate-200">
                                  <th className="py-3 px-4 w-12 text-center">STT</th>
                                  <th className="py-3 px-4 min-w-[200px]">Hạng mục chi phí cấu thành</th>
                                  <th className="py-3 px-4">Căn cứ & Ghi chú chính sách</th>
                                  <th className="py-3 px-4 text-right min-w-[200px]">Thành tiền (VNĐ / %)</th>
                                  {isEditing && <th className="py-3 px-4 w-16 text-center">Thao tác</th>}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {currentForm.items.map((item, idx) => {
                                  const isDisc = item.amount < 0 || item.type === 'discount';
                                  const isBase = item.type === 'base';
                                  const isZero = item.amount === 0;

                                  return (
                                    <tr
                                      key={item.id || idx}
                                      className={`hover:bg-slate-50 transition-colors ${
                                        isDisc ? 'bg-emerald-50/50' : isBase ? 'bg-blue-50/30' : ''
                                      }`}
                                    >
                                      <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold text-xs">
                                        {String(idx + 1).padStart(2, '0')}
                                      </td>
                                      <td className="py-3 px-4">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={item.title}
                                            disabled={isBase}
                                            onChange={(e) => handleUpdateItemField(quote.id, item.id, 'title', e.target.value, quote)}
                                            className="w-full text-xs font-bold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                                          />
                                        ) : (
                                          <div className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                            <span>{item.title}</span>
                                            {item.isPercentage && item.percentage !== undefined && (
                                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 font-black text-[9px]">
                                                {isDisc ? '-' : '+'}{item.percentage}%
                                              </span>
                                            )}
                                            {isZero && (
                                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-[9px]">
                                                0% Thuế
                                              </span>
                                            )}
                                            {isDisc && (
                                              <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-black text-[9px]">
                                                Giảm trừ
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-slate-600">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={item.note}
                                            onChange={(e) => handleUpdateItemField(quote.id, item.id, 'note', e.target.value, quote)}
                                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="Ghi chú chính sách..."
                                          />
                                        ) : (
                                          item.note || '—'
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-right whitespace-nowrap">
                                        {isEditing ? (
                                          <div className="inline-flex items-center gap-1.5 justify-end">
                                            {item.isPercentage ? (
                                              <PercentInputField
                                                percentage={item.percentage ?? 0}
                                                basePrice={quote.base_price}
                                                isDiscount={isDisc}
                                                onChange={(p) => {
                                                  handleUpdateItemField(quote.id, item.id, 'percentage', p, quote);
                                                }}
                                                className="w-24 text-right text-xs font-black px-2.5 py-1.5 bg-purple-50 border border-purple-300 rounded-lg text-purple-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono tracking-tight"
                                              />
                                            ) : (
                                              <CurrencyInputField
                                                value={Math.abs(item.amount)}
                                                isDiscount={isDisc}
                                                disabled={isZero}
                                                onChange={(val) => {
                                                  handleUpdateItemField(quote.id, item.id, 'amount', val, quote);
                                                }}
                                                className={`w-32 text-right text-xs font-black px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono tracking-tight ${
                                                  isDisc ? 'text-emerald-700' : 'text-slate-900'
                                                }`}
                                              />
                                            )}

                                            {!isBase && (
                                              <button
                                                type="button"
                                                onClick={() => handleToggleItemPercentMode(quote.id, item.id, quote)}
                                                className={`px-2 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer shrink-0 ${
                                                  item.isPercentage
                                                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                                }`}
                                                title={item.isPercentage ? 'Đang tính theo %. Bấm để chuyển sang nhập VNĐ' : 'Bấm để chuyển sang tính theo % giá xe'}
                                              >
                                                {item.isPercentage ? '%' : 'VNĐ'}
                                              </button>
                                            )}
                                          </div>
                                        ) : isDisc ? (
                                          <span className="font-black text-emerald-600 font-mono">
                                            -{formatVNDPrice(Math.abs(item.amount))}
                                          </span>
                                        ) : isZero ? (
                                          <span className="font-black text-emerald-700 font-mono">+ 0 VNĐ</span>
                                        ) : isBase ? (
                                          <span className="font-black text-slate-900 font-mono">{formatVNDPrice(item.amount)}</span>
                                        ) : (
                                          <span className="font-bold text-slate-700 font-mono">+ {formatVNDPrice(item.amount)}</span>
                                        )}
                                      </td>
                                      {isEditing && (
                                        <td className="py-3 px-4 text-center">
                                          {item.isDeletable !== false ? (
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveItem(quote.id, item.id, quote)}
                                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                                              title="Xóa đầu mục này khỏi hóa đơn"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          ) : (
                                            <span className="text-[10px] text-slate-400 font-bold">Cố định</span>
                                          )}
                                        </td>
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot>
                                <tr className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white font-black border-t-2 border-blue-500">
                                  <td colSpan={3} className="py-3.5 px-4 uppercase tracking-wider text-xs">
                                    <div className="flex items-center gap-2">
                                      <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                                      <span>TỔNG CHI PHÍ LĂN BÁNH TCO (HOÀN TẤT TÍNH TOÁN):</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4 text-right text-base sm:text-lg text-yellow-300 font-black whitespace-nowrap font-mono">
                                    = {formatVNDPrice(computedTotal)}
                                  </td>
                                  {isEditing && <td className="py-3.5 px-4 text-center">✓</td>}
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        {/* ADD CUSTOM LINE ITEM SECTION (When in Edit Mode) */}
                        {isEditing && (
                          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-blue-900 uppercase flex items-center gap-1.5">
                                <Plus size={14} />
                                Thêm mới Đầu mục Chi phí / Ưu đãi tùy chỉnh
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Bổ sung bất kỳ mục phí hoặc chiết khấu đặc biệt nào theo thỏa thuận
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                              <div className="sm:col-span-4">
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">Tên đầu mục *</label>
                                <input
                                  type="text"
                                  placeholder="VD: Chiết khấu đại lý, Voucher 5%..."
                                  value={newItemForm.title}
                                  onChange={(e) => setNewItemForm({ ...newItemForm, title: e.target.value })}
                                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">Loại đầu mục</label>
                                <select
                                  value={newItemForm.type}
                                  onChange={(e) => setNewItemForm({ ...newItemForm, type: e.target.value as any })}
                                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="fee">+ Cộng chi phí (Phí/Dịch vụ)</option>
                                  <option value="discount">- Giảm trừ (Chiết khấu/Voucher)</option>
                                  <option value="free">+ 0 VNĐ (Ưu đãi 0% miễn phí)</option>
                                </select>
                              </div>

                              <div className="sm:col-span-3">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-bold text-slate-700">
                                    {newItemForm.isPercentage ? 'Tỷ lệ % giá xe' : 'Số tiền (VNĐ)'}
                                  </label>
                                  {newItemForm.type !== 'free' && (
                                    <div className="inline-flex rounded-lg p-0.5 bg-slate-200 border border-slate-300">
                                      <button
                                        type="button"
                                        onClick={() => setNewItemForm({ ...newItemForm, isPercentage: false })}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all cursor-pointer ${
                                          !newItemForm.isPercentage ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                                        }`}
                                      >
                                        VNĐ
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setNewItemForm({ ...newItemForm, isPercentage: true })}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all cursor-pointer ${
                                          newItemForm.isPercentage ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600'
                                        }`}
                                      >
                                        %
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {newItemForm.isPercentage ? (
                                  <PercentInputField
                                    percentage={newItemForm.percentage}
                                    basePrice={quote.base_price}
                                    isDiscount={newItemForm.type === 'discount'}
                                    disabled={newItemForm.type === 'free'}
                                    onChange={(p, amt) => setNewItemForm({ ...newItemForm, percentage: p, amount: Math.abs(amt) })}
                                    className="w-full text-xs font-black px-3 py-2 bg-purple-50 border border-purple-300 rounded-xl text-purple-900 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50 font-mono tracking-tight"
                                  />
                                ) : (
                                  <CurrencyInputField
                                    value={newItemForm.amount}
                                    disabled={newItemForm.type === 'free'}
                                    onChange={(val) => setNewItemForm({ ...newItemForm, amount: val })}
                                    placeholder="VD: 5.000.000"
                                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 font-mono tracking-tight"
                                  />
                                )}
                              </div>

                              <div className="sm:col-span-2">
                                <button
                                  type="button"
                                  onClick={() => handleAddItemToQuote(quote.id, quote)}
                                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 shadow-sm shadow-blue-600/30 cursor-pointer"
                                >
                                  <Plus size={14} />
                                  <span>Thêm mục</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Notes for Customer Input */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <label className="text-xs font-black text-slate-800 block">
                            💬 Ghi chú & Lời nhắn của Tư vấn viên gửi tới Khách hàng (Hiển thị trên hòm thư của Khách):
                          </label>
                          <input
                            type="text"
                            value={currentForm.notes}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuoteForms((prev) => ({
                                ...prev,
                                [quote.id]: {
                                  ...currentForm,
                                  notes: val,
                                },
                              }));
                            }}
                            placeholder="VD: Báo giá đã bao gồm ưu đãi bảo hiểm và hỗ trợ thủ tục đăng ký xe trọn gói..."
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Actions Footer inside Quote Card */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                            <span>Giá chốt gửi khách hàng:</span>
                            <strong className="text-emerald-700 font-black text-base font-mono">
                              {formatPrice(computedTotal)}
                            </strong>
                          </div>

                          <div className="flex items-center gap-2.5">
                            {quote.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleSaveQuote(quote.id, 'rejected')}
                                  disabled={updatingAction?.id === quote.id}
                                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {updatingAction?.id === quote.id && updatingAction.action === 'rejected' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : null}
                                  <span>Từ chối Báo giá</span>
                                </button>
                                <button
                                  onClick={() => handleSaveQuote(quote.id, 'approved')}
                                  disabled={updatingAction?.id === quote.id}
                                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                  {updatingAction?.id === quote.id && updatingAction.action === 'approved' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Check size={15} />
                                  )}
                                  <span>Duyệt & Đồng bộ Hóa đơn tới Khách hàng ✓</span>
                                </button>
                              </>
                            ) : quote.status === 'approved' ? (
                              <>
                                <button
                                  onClick={() => handleSaveQuote(quote.id, 'rejected')}
                                  disabled={updatingAction?.id === quote.id}
                                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {updatingAction?.id === quote.id && updatingAction.action === 'rejected' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : null}
                                  <span>Hủy duyệt Báo giá</span>
                                </button>
                                <button
                                  onClick={() => handleSaveQuote(quote.id, 'approved')}
                                  disabled={updatingAction?.id === quote.id}
                                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                  {updatingAction?.id === quote.id && updatingAction.action === 'approved' ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Check size={15} />
                                  )}
                                  <span>Lưu & Cập nhật lại Hóa đơn cho Khách hàng ✓</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleSaveQuote(quote.id, 'approved')}
                                disabled={updatingAction?.id === quote.id}
                                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {updatingAction?.id === quote.id && updatingAction.action === 'approved' ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Check size={15} />
                                )}
                                <span>Khôi phục & Duyệt Báo giá ✓</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* BOOKINGS LIST */
          filteredBookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-sm">
              <Calendar size={48} className="mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">Không có lịch hẹn lái thử nào</h3>
              <p className="text-xs text-slate-500">Lịch đăng ký lái thử trực tuyến sẽ hiển thị ở đây.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 transition-all hover:border-slate-300 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">{b.customer_name}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            b.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : b.status === 'confirmed'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : b.status === 'cancelled'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          }`}
                        >
                          {b.status === 'completed'
                            ? '🟢 Hoàn tất'
                            : b.status === 'confirmed'
                            ? '🔵 Đã xác nhận'
                            : b.status === 'cancelled'
                            ? '🔴 Đã hủy'
                            : '🟡 Chờ xác nhận'}
                        </span>
                      </div>
                      <a href={`tel:${b.customer_phone}`} className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 mt-1">
                        <Phone size={13} />
                        <span>{b.customer_phone}</span>
                      </a>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 block shadow-sm">
                        🚗 {b.vehicle_name}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar size={14} className="text-blue-600" />
                      <span>Ngày: <strong>{b.preferred_date || 'Chưa chọn'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock size={14} className="text-amber-600" />
                      <span>Giờ hẹn: <strong>{b.preferred_time || '08:30'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin size={14} className="text-emerald-600" />
                      <span>Showroom: <strong>{b.showroom_name || 'VinFast Showroom'}</strong></span>
                    </div>
                  </div>

                  {b.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 italic">
                      Ghi chú: {b.notes}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                      disabled={updatingBookingId === b.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      {updatingBookingId === b.id ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                      🔵 Xác nhận lịch
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                      disabled={updatingBookingId === b.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      {updatingBookingId === b.id ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                      🟢 Hoàn tất
                    </button>
                    <button
                      onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                      disabled={updatingBookingId === b.id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {updatingBookingId === b.id ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                      🔴 Hủy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
