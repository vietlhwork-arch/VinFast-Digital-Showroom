import { useState } from 'react';
import { Zap, Users, CheckSquare, Square, ArrowRight, Star, Sparkles } from 'lucide-react';
import type { Vehicle } from '@/types';
import { getImageUrl, formatVNDPrice } from '@/lib/api';
import { getVehicleCardScale } from '@/config/vehicleCardScale';
import { getVehicleDisplayName } from '@/lib/vehicleDisplay';
import { isEBus, parseVehicleColors, resolveVehicleColorSwatch } from '@/lib/vehicleColors';

interface VehicleCardProps {
  vehicle: Vehicle;
  isCompared: boolean;
  onToggleCompare: (id: string) => void;
  onViewDetail: (id: string) => void;
  onRequestQuote: (vehicle: Vehicle) => void;
}

const COLOR_TO_HEX_MAP: Record<string, string> = {
  // Black variants
  'jet black': '#0F172A',
  'black': '#0F172A',
  'đen': '#0F172A',
  'đen nhám': '#0F172A',
  'đen bóng': '#000000',
  'đen sang trọng': '#000000',
  'đen jet black': '#0F172A',

  // White variants
  'white': '#FFFFFF',
  'trắng': '#FFFFFF',
  'trắng brahminy': '#FFFFFF',
  'trắng ngọc trai': '#F8FAFC',
  'trắng ngọc': '#F8FAFC',
  'bạch kim': '#F8FAFC',
  'trắng đen': '#F1F5F9',
  'trắng tím': '#F3E8FF',

  // Silver & Gray variants
  'silver': '#CBD5E1',
  'gray': '#64748B',
  'grey': '#64748B',
  'xám': '#64748B',
  'xám desat': '#64748B',
  'xám xi măng': '#94A3B8',
  'xám decal vàng': '#71717A',
  'bạc': '#CBD5E1',
  'desat silver': '#64748B',

  // Red variants
  'red': '#DC2626',
  'đỏ': '#DC2626',
  'đỏ crimson': '#DC2626',
  'đỏ tươi': '#EF4444',
  'đỏ thể thao': '#FF0000',
  'đỏ đô': '#800000',

  // Blue variants
  'blue': '#2563EB',
  'xanh': '#2563EB',
  'xanh vinfast': '#2563EB',
  'xanh dương': '#2563EB',
  'xanh lục bảo': '#0047AB',
  'xanh hải quân': '#000080',
  'xanh ngọc': '#0EA5E9',

  // Green variants
  'green': '#16A34A',
  'herio green': '#16A34A',
  'xanh oliu': '#2E8B57',
  'xanh lá': '#16A34A',
  'xanh rêu': '#3F6212',

  // Yellow & Gold variants
  'yellow': '#EAB308',
  'gold': '#EAB308',
  'vàng': '#EAB308',
  'vàng hoàng gia': '#FFD700',
  'vàng chanh': '#FFFF00',

  // Orange & Mint & Others
  'orange': '#F97316',
  'cam': '#F97316',
  'mint': '#0D9488',
  'xanh mint': '#0D9488',
  'purple': '#9333EA',
  'tím': '#9333EA',
};

function resolveCssColor(colorVal: any): { cssColor: string; name: string } {
  if (!colorVal) return { cssColor: '#E2E8F0', name: '' };

  let colorStr = typeof colorVal === 'string' ? colorVal : (colorVal.code || colorVal.hex || colorVal.name || String(colorVal));
  colorStr = colorStr.trim();

  if (colorStr.startsWith('#') || colorStr.startsWith('rgb')) {
    return { cssColor: colorStr, name: colorStr };
  }

  const lower = colorStr.toLowerCase();
  if (lower === 'metallic-brown') return { cssColor: '#8B5E3C', name: colorStr };
  if (lower === 'gray-yellow-decal') return { cssColor: '#94A3B8', name: colorStr };
  if (lower === 'sand-yellow') return { cssColor: '#D4A72C', name: colorStr };
  if (lower === 'milk-lavender') return { cssColor: '#C4B5FD', name: colorStr };
  if (lower === 'navy-blue') return { cssColor: '#1E3A5F', name: colorStr };
  if (lower === 'tropical-jade') return { cssColor: '#0EA5A6', name: colorStr };
  if (lower === 'cement-gray') return { cssColor: '#94A3B8', name: colorStr };
  if (lower === 'red-black') return { cssColor: '#DC2626', name: colorStr };
  if (lower === 'bright-red-matte-black') return { cssColor: '#EF4444', name: colorStr };
  for (const [key, hex] of Object.entries(COLOR_TO_HEX_MAP)) {
    if (lower === key || lower.includes(key)) {
      return { cssColor: hex, name: colorStr };
    }
  }

  // Soft fallback matching
  if (lower.includes('den') || lower.includes('black')) return { cssColor: '#0F172A', name: colorStr };
  if (lower.includes('trang') || lower.includes('white')) return { cssColor: '#FFFFFF', name: colorStr };
  if (lower.includes('do') || lower.includes('red')) return { cssColor: '#DC2626', name: colorStr };
  if (lower.includes('xanh') || lower.includes('blue')) return { cssColor: '#2563EB', name: colorStr };
  if (lower.includes('xam') || lower.includes('bac') || lower.includes('gray') || lower.includes('silver')) return { cssColor: '#94A3B8', name: colorStr };

  return { cssColor: '#64748B', name: colorStr };
}

export default function VehicleCard({
  vehicle,
  isCompared,
  onToggleCompare,
  onViewDetail,
  onRequestQuote,
}: VehicleCardProps) {
  const [imgError, setImgError] = useState(false);

  const displayColors = isEBus(vehicle) ? [] : parseVehicleColors(vehicle.colors, vehicle);
  const displayName = getVehicleDisplayName(vehicle.name, vehicle.code);

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer flex flex-col h-full ${isCompared
          ? 'border-blue-400 ring-2 ring-blue-100 shadow-lg shadow-blue-50'
          : 'border-gray-100 shadow-md hover:border-blue-200'
        }`}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {vehicle.isNew && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-sm">
            <Sparkles size={10} />
            MỚI
          </span>
        )}
        {vehicle.isBestSeller && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-sm">
            <Star size={10} className="fill-white" />
            BÁN CHẠY
          </span>
        )}
      </div>

      {/* Compare checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleCompare(vehicle.id); }}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-blue-400 transition-all shadow-sm group/cmp"
        title="So sánh"
      >
        {isCompared ? (
          <CheckSquare size={14} className="text-blue-600" />
        ) : (
          <Square size={14} className="text-gray-400 group-hover/cmp:text-blue-500" />
        )}
        <span className="text-xs font-medium text-gray-600 group-hover/cmp:text-blue-600">So sánh</span>
      </button>

      {/* Image */}
      <div
        className="relative overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer shrink-0"
        style={{ height: '220px' }}
        onClick={() => onViewDetail(vehicle.id)}
      >
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
          style={{ transform: `scale(${getVehicleCardScale(vehicle.code, vehicle.name)})` }}
        >
          <img
            src={!imgError ? getImageUrl(vehicle.image) : `/static/uploads/cars/${vehicle.code?.toUpperCase() || 'VF3'}.jpg`}
            alt={displayName}
            className="w-full h-full object-contain smooth-gpu"
            decoding="async"
            onError={(e) => {
              if (!imgError) {
                setImgError(true);
              } else {
                // Final fallback if specific file is missing
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=60';
              }
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category tag & Eco/Plus Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full">
            {vehicle.category === 'scooter' || vehicle.category === 'motorbike' ? 'Xe máy điện' : vehicle.category === 'commercial' ? 'Xe dịch vụ & Thương mại' : 'Ô tô điện'}
          </span>
          {(vehicle.name.includes('VF 7') || vehicle.name.includes('VF 8') || vehicle.name.includes('VF 9')) && (
            <span className="px-2 py-0.5 bg-blue-600/90 text-white text-[10px] font-extrabold rounded-md shadow-sm border border-blue-400/30">
              Eco &amp; Plus
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Vehicle name (Fixed height to guarantee all cards align across rows) */}
        <div className="mb-3">
          <h3
            className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-700 cursor-pointer transition-colors line-clamp-2 min-h-[56px] leading-snug flex items-start"
            onClick={() => onViewDetail(vehicle.id)}
            title={displayName}
          >
            {displayName}
          </h3>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-4 whitespace-nowrap overflow-hidden">
          {vehicle.basePrice && vehicle.basePrice > 0 ? (
            <>
              <span className="text-xs text-gray-400 font-medium shrink-0">Từ</span>
              <div className="flex items-baseline gap-1 text-blue-700 tracking-tight">
                <span className="text-xl sm:text-[1.35rem] font-black leading-none">
                  {(vehicle.basePrice < 10000 ? Math.round(vehicle.basePrice * 1000000) : Math.round(vehicle.basePrice)).toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-bold text-blue-600/90">VNĐ</span>
              </div>
            </>
          ) : (
            <span className="text-base sm:text-[1.1rem] font-extrabold text-blue-700">Liên hệ báo giá</span>
          )}
        </div>

        {/* Key specs */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={12} className="text-blue-500" />
            </div>
            <div className="text-sm font-bold text-gray-800">{vehicle.range && Number(vehicle.range) > 0 ? `${vehicle.range}km` : 'Chưa công bố'}</div>
            <div className="text-xs text-gray-400">Phạm vi</div>
          </div>
          <div className="text-center border-l border-gray-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={12} className="text-violet-500" />
            </div>
            <div className="text-sm font-bold text-gray-800">{vehicle.seats > 0 ? `${vehicle.seats} chỗ` : 'Chưa công bố'}</div>
            <div className="text-xs text-gray-400">Chỗ ngồi</div>
          </div>
        </div>

        {/* Color swatches; EBus has no verified exterior-color data. */}
        {displayColors.length > 0 && (
          <div className="flex items-center gap-2 mb-4 min-h-[24px]">
            <span className="text-xs text-gray-400 font-medium shrink-0">Màu:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {displayColors.map((colorItem, idx) => {
                const { cssColor, cssImage } = resolveVehicleColorSwatch(colorItem, vehicle);
                const name = colorItem.name;
                return (
                  <div
                    key={colorItem.color_code || idx}
                    className="w-4 h-4 rounded-full border border-slate-300 shadow-sm shrink-0 transition-transform hover:scale-125 cursor-pointer"
                    style={{
                      backgroundColor: cssColor,
                      backgroundImage: colorItem.image_url
                        ? `url(${getImageUrl(colorItem.image_url)})`
                        : cssImage,
                      backgroundPosition: 'center',
                      // Official VinFast swatches have a thin white frame.
                      // Oversize the background so the circular swatch is filled.
                      backgroundSize: colorItem.image_url ? '135% 135%' : undefined,
                      backgroundRepeat: 'no-repeat',
                    }}
                    title={colorItem.official_name ? `${name} (${colorItem.official_name})` : (name || `Màu sắc VinFast ${idx + 1}`)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onRequestQuote(vehicle)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-md hover:shadow-blue-200"
          >
            Báo giá
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => onViewDetail(vehicle.id)}
            className="flex-1 py-2.5 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 text-sm font-medium rounded-xl transition-all hover:bg-blue-50"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
