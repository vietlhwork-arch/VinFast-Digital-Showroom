import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, Tag, Receipt, Sparkles, Edit3, Trash2, Plus } from 'lucide-react';
import { formatVNDPrice } from '@/lib/api';

export interface TCOLineItem {
  id: string;
  stt?: string;
  title: string;
  note: string;
  amount: number;
  isPercentage?: boolean;
  percentage?: number;
  type: 'base' | 'fee' | 'free' | 'discount' | 'custom';
  isDeletable?: boolean;
}

export interface CustomTCOFees {
  basePrice?: number;
  registrationFee?: number;
  plateFee?: number;
  roadFee?: number;
  civilInsurance?: number;
  discount?: number;
  totalRollingCost?: number;
  customItems?: TCOLineItem[];
}

export interface QuoteTCOInvoiceProps {
  vehicleName: string;
  basePrice: number;
  discount?: number;
  finalPrice?: number;
  notes?: string;
  compact?: boolean;
  isConsultantView?: boolean;
  customFees?: CustomTCOFees;
  customItems?: TCOLineItem[];
}

const TCO_TAG_PREFIX = '<!--TCO_ITEMS:';
const TCO_TAG_SUFFIX = '-->';

export function encodeTCOItemsToNotes(cleanNotes: string, items: TCOLineItem[]): string {
  try {
    const jsonStr = JSON.stringify(items);
    const trimmed = (cleanNotes || '').trim();
    return `${trimmed ? trimmed + '\n' : ''}${TCO_TAG_PREFIX}${jsonStr}${TCO_TAG_SUFFIX}`;
  } catch {
    return cleanNotes;
  }
}

export function parseTCOItemsFromNotes(rawNotes?: string): { cleanNotes: string; items?: TCOLineItem[] } {
  if (!rawNotes) return { cleanNotes: '' };
  const startIndex = rawNotes.indexOf(TCO_TAG_PREFIX);
  if (startIndex === -1) {
    return { cleanNotes: rawNotes };
  }
  const endIndex = rawNotes.indexOf(TCO_TAG_SUFFIX, startIndex);
  if (endIndex === -1) {
    return { cleanNotes: rawNotes };
  }

  const jsonStr = rawNotes.slice(startIndex + TCO_TAG_PREFIX.length, endIndex);
  const clean = (rawNotes.slice(0, startIndex) + rawNotes.slice(endIndex + TCO_TAG_SUFFIX.length)).trim();

  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { cleanNotes: clean, items: parsed };
    }
  } catch (e) {
    console.warn('Failed to parse custom TCO items from notes:', e);
  }
  return { cleanNotes: clean };
}

export function generateDefaultLineItems(
  vehicleName: string,
  basePrice: number,
  discount = 0
): TCOLineItem[] {
  const nameLower = (vehicleName || '').toLowerCase();
  const isScooter =
    nameLower.includes('amio') ||
    nameLower.includes('evo') ||
    nameLower.includes('feliz') ||
    nameLower.includes('klara') ||
    nameLower.includes('vento') ||
    nameLower.includes('theon') ||
    nameLower.includes('zgoo') ||
    nameLower.includes('flazz') ||
    nameLower.includes('drgnfly') ||
    nameLower.includes('kyo') ||
    nameLower.includes('viper') ||
    nameLower.includes('kinet') ||
    nameLower.includes('xe máy');

  const is7Seats = nameLower.includes('vf 9') || nameLower.includes('vf9') || nameLower.includes('mpv');

  const plateFee = isScooter ? 2000000 : 20000000;
  const roadFee = isScooter ? 0 : 1560000;
  const civilInsurance = isScooter ? 66000 : (is7Seats ? 794000 : 437000);

  const items: TCOLineItem[] = [
    {
      id: 'base_price',
      title: 'Giá niêm yết xe VinFast',
      note: 'Giá bán lẻ đề xuất chính thức',
      amount: basePrice,
      type: 'base',
      isDeletable: false,
    },
    {
      id: 'reg_fee',
      title: 'Lệ phí trước bạ xe điện (0%)',
      note: 'Miễn 100% theo Nghị định 10/2022/NĐ-CP & 57/2024/NĐ-CP',
      amount: 0,
      type: 'free',
      isDeletable: true,
    },
    {
      id: 'plate_fee',
      title: isScooter ? 'Phí cấp biển số xe máy điện' : 'Phí cấp biển số ô tô điện (Khu vực I)',
      note: isScooter ? 'Hà Nội & TP. Hồ Chí Minh' : 'Hà Nội & TP. Hồ Chí Minh (Biểu phí chuẩn)',
      amount: plateFee,
      type: 'fee',
      isDeletable: true,
    },
    {
      id: 'road_fee',
      title: 'Phí sử dụng đường bộ (1 năm)',
      note: isScooter ? 'Xe 2 bánh / Miễn thu phí đường bộ' : '130.000 VNĐ / tháng (12 tháng)',
      amount: roadFee,
      type: roadFee === 0 ? 'free' : 'fee',
      isDeletable: true,
    },
    {
      id: 'insurance_fee',
      title: 'Bảo hiểm trách nhiệm dân sự bắt buộc (1 năm)',
      note: isScooter ? 'Bảo hiểm TNDS xe 2 bánh' : (is7Seats ? 'Xe 7-9 chỗ ngồi' : 'Xe dưới 6 chỗ ngồi'),
      amount: civilInsurance,
      type: 'fee',
      isDeletable: true,
    },
  ];

  if (discount > 0) {
    items.push({
      id: 'discount_fee',
      title: 'Chiết khấu & Ưu đãi từ Tư vấn viên',
      note: 'Áp dụng trực tiếp vào tổng chi phí lăn bánh',
      amount: -discount,
      type: 'discount',
      isDeletable: true,
    });
  }

  return items;
}

export function calculateTotalFromItems(items: TCOLineItem[]): number {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
}

export function calculateTCOItems(
  vehicleName: string,
  basePrice: number,
  discount = 0,
  finalPrice?: number,
  customFees?: CustomTCOFees,
  customItems?: TCOLineItem[]
) {
  let effectiveItems: TCOLineItem[];

  if (customItems && customItems.length > 0) {
    effectiveItems = customItems;
  } else if (customFees?.customItems && customFees.customItems.length > 0) {
    effectiveItems = customFees.customItems;
  } else {
    // Generate standard line items with any scalar overrides
    effectiveItems = generateDefaultLineItems(vehicleName, customFees?.basePrice !== undefined ? customFees.basePrice : basePrice, customFees?.discount !== undefined ? customFees.discount : discount);

    if (customFees) {
      if (customFees.registrationFee !== undefined) {
        const item = effectiveItems.find(i => i.id === 'reg_fee');
        if (item) item.amount = customFees.registrationFee;
      }
      if (customFees.plateFee !== undefined) {
        const item = effectiveItems.find(i => i.id === 'plate_fee');
        if (item) item.amount = customFees.plateFee;
      }
      if (customFees.roadFee !== undefined) {
        const item = effectiveItems.find(i => i.id === 'road_fee');
        if (item) item.amount = customFees.roadFee;
      }
      if (customFees.civilInsurance !== undefined) {
        const item = effectiveItems.find(i => i.id === 'insurance_fee');
        if (item) item.amount = customFees.civilInsurance;
      }
    }
  }

  // Assign STT numbers
  const rows = effectiveItems.map((item, idx) => ({
    ...item,
    stt: String(idx + 1).padStart(2, '0'),
  }));

  const calculatedTotal = calculateTotalFromItems(effectiveItems);
  const totalRollingCost =
    customFees?.totalRollingCost !== undefined
      ? customFees.totalRollingCost
      : (finalPrice !== undefined && finalPrice !== null ? finalPrice : calculatedTotal);

  return {
    rows,
    totalRollingCost: Math.max(0, totalRollingCost),
  };
}

export default function QuoteTCOInvoice({
  vehicleName,
  basePrice,
  discount = 0,
  finalPrice,
  notes,
  compact = false,
  isConsultantView = false,
  customFees,
  customItems,
}: QuoteTCOInvoiceProps) {
  // Parse any custom items stored inside notes if not passed directly
  const parsedNotes = parseTCOItemsFromNotes(notes);
  const effectiveCustomItems = customItems || parsedNotes.items;

  const { rows, totalRollingCost } = calculateTCOItems(
    vehicleName,
    basePrice,
    discount,
    finalPrice,
    customFees,
    effectiveCustomItems
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm my-2.5">
      {/* Invoice Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black tracking-tight uppercase block">
              Hóa Đơn Bóc Tách Chi Phí Lăn Bánh (TCO)
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              {vehicleName} • Chuẩn hóa thuế, lệ phí & ưu đãi VinFast
            </span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
          Chính thức
        </span>
      </div>

      {/* Invoice Table Breakdown */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center">STT</th>
              <th className="py-2.5 px-3">Hạng mục chi phí cấu thành</th>
              {!compact && <th className="py-2.5 px-3 hidden sm:table-cell">Căn cứ & Ghi chú chính sách</th>}
              <th className="py-2.5 px-3 text-right">Thành tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {rows.map((row, idx) => {
              const isZero = row.amount === 0;
              const isDisc = row.amount < 0 || row.type === 'discount';
              const isBase = row.type === 'base';

              return (
                <tr
                  key={row.id || idx}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isDisc ? 'bg-emerald-50/50' : isBase ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                    {row.stt}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 flex-wrap">
                      <span>{row.title}</span>
                      {row.isPercentage && row.percentage !== undefined && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-extrabold text-[9px] border border-purple-200">
                          {isDisc ? '-' : '+'}{row.percentage}%
                        </span>
                      )}
                      {isZero && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9px]">
                          0% Thuế
                        </span>
                      )}
                      {isDisc && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-black text-[9px]">
                          Giảm trừ
                        </span>
                      )}
                      {row.type === 'custom' && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-extrabold text-[9px]">
                          Bổ sung
                        </span>
                      )}
                    </div>
                    {compact && row.note && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">{row.note}</span>
                    )}
                  </td>
                  {!compact && (
                    <td className="py-2.5 px-3 text-[11px] text-slate-500 hidden sm:table-cell">
                      {row.note || '—'}
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {isDisc ? (
                      <span className="font-black text-emerald-600">
                        -{formatVNDPrice(Math.abs(row.amount))}
                      </span>
                    ) : isZero ? (
                      <span className="font-black text-emerald-700">
                        + 0 VNĐ
                      </span>
                    ) : isBase ? (
                      <span className="font-extrabold text-slate-900">
                        {formatVNDPrice(row.amount)}
                      </span>
                    ) : (
                      <span className="font-bold text-slate-700">
                        + {formatVNDPrice(row.amount)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white font-black border-t-2 border-blue-500">
              <td colSpan={compact ? 2 : 3} className="py-3 px-3 uppercase tracking-wider text-xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>Tổng Chi Phí Lăn Bánh (TCO Hoàn Tất):</span>
                </div>
              </td>
              <td className="py-3 px-3 text-right text-sm sm:text-base text-yellow-300 font-black whitespace-nowrap">
                = {formatVNDPrice(totalRollingCost)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {parsedNotes.cleanNotes && (
        <div className="p-2.5 bg-blue-50/60 border-t border-slate-200 text-xs text-blue-950 flex items-start gap-1.5">
          <span className="font-bold shrink-0">💬 Lời nhắn Tư vấn viên:</span>
          <span className="text-slate-700 font-medium">{parsedNotes.cleanNotes}</span>
        </div>
      )}
    </div>
  );
}
