import { useState, useEffect } from 'react';
import { LayoutGrid, ChevronRight, Zap, Car, Bike, Truck } from 'lucide-react';
import { vehicles as staticVehicles } from '@/data/vehicles';
import VehicleCard from '@/components/VehicleCard';
import { api, getImageUrl, parseVehicleCategory } from '@/lib/api';
import { getVehicleDisplayName } from '@/lib/vehicleDisplay';
import { parseVehicleColors } from '@/lib/vehicleColors';
import { normalizeStaticVehicle, normalizeVehicleHighlights } from '@/lib/smartFeatures';
import type { Vehicle, FilterCategory } from '@/types';

interface VehicleShowcaseProps {
  compareList: string[];
  onToggleCompare: (id: string) => void;
  onRequestQuote: (vehicle: Vehicle) => void;
  onViewDetail?: (vehicle: Vehicle) => void;
  activeCategory?: FilterCategory;
  onCategoryChange?: (category: FilterCategory) => void;
  vehicles?: Vehicle[];
  onOpenChat?: () => void;
  onOpenTestDrive?: (vehicle?: Vehicle | null) => void;
}

const filterTabs: { id: FilterCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'suv', label: 'Ô tô điện' },
  { id: 'scooter', label: 'Xe máy điện' },
  { id: 'commercial', label: 'Xe dịch vụ & Thương mại' },
];

export default function VehicleShowcase({
  compareList,
  onToggleCompare,
  onRequestQuote,
  onViewDetail,
  activeCategory: externalCategory = 'all',
  onCategoryChange,
  vehicles: externalVehicles,
  onOpenChat,
  onOpenTestDrive,
}: VehicleShowcaseProps) {
  const [internalFilter, setInternalFilter] = useState<FilterCategory>(externalCategory);
  const [vehicleList, setVehicleList] = useState<Vehicle[]>(() =>
    externalVehicles && externalVehicles.length > 0
      ? externalVehicles
      : staticVehicles.map((v) => ({ ...normalizeStaticVehicle(v), category: parseVehicleCategory(v) }))
  );

  useEffect(() => {
    setInternalFilter(externalCategory);
  }, [externalCategory]);

  useEffect(() => {
    if (externalVehicles && externalVehicles.length > 0) {
      setVehicleList(externalVehicles);
    }
  }, [externalVehicles]);

  useEffect(() => {
    if (externalVehicles && externalVehicles.length > 0) return;
    // Tải danh sách cả Ô tô và Xe máy điện từ Backend FastAPI nếu chưa có sẵn
    Promise.all([
      api.getCars<any[]>().catch(() => []),
      api.getEScooters<any[]>().catch(() => []),
    ]).then(([dbCars, dbScooters]) => {
      const validCars = Array.isArray(dbCars) ? dbCars : [];
      const validScooters = Array.isArray(dbScooters) ? dbScooters : [];

      const carList: Vehicle[] = validCars.map((c) => {
        if (!c || typeof c !== 'object') return null as any;
        const legacySpecs = c.additional_specs?._legacy_source?.specifications?.additional_specs || c.additional_specs || c.specs || {};
        const powerKw = c.maximum_power_kw || legacySpecs.motor_power_kw;
        const powerHp = legacySpecs.motor_power_hp || (powerKw ? Math.round(powerKw * 1.34) : null);
        const torqueNm = c.maximum_torque_nm || legacySpecs.motor_torque_nm;

        const colorsList = parseVehicleColors(c.colors, c);

        return {
          id: c.id || c.car_id || 'unknown_car',
          code: c.code || c.vehicle_line || 'VF',
          name: getVehicleDisplayName(c.name || c.model_name || 'Xe điện VinFast', c.code || c.vehicle_line),
          tagline: c.description || legacySpecs.description_text || 'Mẫu ô tô điện thông minh VinFast',
          category: parseVehicleCategory(c),
          image: getImageUrl(c.image_url),
          basePrice: c.base_price || c.list_price || 0,
          batteryBuyPrice: c.battery_buy_price,
          batteryRentMonthly: c.battery_rent_monthly,
          range: c.range_km ?? legacySpecs.range_km ?? 0,
          battery: c.usable_battery_capacity != null ? `${c.usable_battery_capacity} kWh` : (legacySpecs.battery_type || 'Chưa công bố'),
          acceleration: legacySpecs.acceleration_0_50_seconds && legacySpecs.acceleration_0_50_seconds !== 'chưa công bố'
            ? `${legacySpecs.acceleration_0_50_seconds}s (0-50 km/h)`
            : (powerHp ? `${powerHp} HP / ${torqueNm || 300} Nm` : 'Chưa công bố'),
          topSpeed: legacySpecs.maximum_speed_kmh ?? c.maximum_speed_kmh ?? 0,
          seats: c.seat_count ?? legacySpecs.seat_count ?? 0,
          isNew: true,
          colors: colorsList,
          description: c.description || legacySpecs.description_text || '',
          highlights: normalizeVehicleHighlights(legacySpecs.highlights || [
            'Công nghệ VinFast tiên phong',
            'Sạc siêu nhanh DC',
            'Bảo hành chính hãng 7-10 năm'
          ], c),
          rawSpecs: c,
        };
      }).filter(Boolean);

      const scooterList: Vehicle[] = validScooters.map((s) => {
        if (!s || typeof s !== 'object') return null as any;
        const specsObj = s.specs || s.additional_specs || {};
        const colorsList = parseVehicleColors(s.colors, s);

        const rangeVal = s.range_km || specsObj.range_km || 150;
        const speedVal = s.maximum_speed_kmh || specsObj.maximum_speed_kmh || specsObj.top_speed || 70;
        const powerW = s.maximum_power_w || specsObj.maximum_power_w || 2000;

        return {
          id: s.id || s.motorbike_id || 'unknown_scooter',
          code: s.code || s.vehicle_line || 'EVO',
          name: s.name || s.model_name || 'Xe máy điện VinFast',
          tagline: s.description || specsObj.description_text || 'Mẫu xe máy điện thông minh VinFast',
          category: 'scooter',
          image: getImageUrl(s.image_url),
          basePrice: s.base_price || s.list_price || 0,
          batteryBuyPrice: s.battery_buy_price,
          batteryRentMonthly: s.battery_rent_monthly,
          range: rangeVal,
          battery: s.battery_type || specsObj.battery_type || 'Pin LFP chống cháy',
          acceleration: `Vận tốc max: ${speedVal} km/h`,
          topSpeed: speedVal,
          seats: 2,
          isNew: true,
          colors: colorsList,
          description: s.description || specsObj.description_text || '',
          highlights: normalizeVehicleHighlights([
            `Công suất tối đa: ${powerW}W`,
            'Kháng nước IP67 (0.5m trong 30p)',
            'Pin LFP tuổi thọ cao',
          ], s),
          rawSpecs: s,
        };
      }).filter(Boolean);

      if (carList.length > 0 || scooterList.length > 0) {
        setVehicleList([...carList, ...scooterList]);
      }
    });
  }, []);

  const activeFilter = internalFilter;

  const handleFilterClick = (cat: FilterCategory) => {
    setInternalFilter(cat);
    onCategoryChange?.(cat);
  };

  const SUV_ORDER = ['VF2', 'VF3', 'VF5', 'VF6', 'VF7', 'VFMPV7', 'VF8', 'VF9'];
  const COMMERCIAL_ORDER = ['MINIO', 'HERIO', 'NERIO', 'LIMO', 'EC_VAN', 'EBUS'];
  const SCOOTER_ORDER = [
    'AMIO',
    'AMIO_S',
    'AMIO_S2',
    'ZGOO',
    'EVO_LITE_NEO',
    'FLAZZ',
    'FLAZZ_MAX',
    'VF_DRGNFLY',
    'DRGNFLY',
    'EVO_LITE',
    'EVO_GRAND_LITE',
    'EVO_GRAND',
    'EVO',
    'FELIZ_2025',
    'FELIZ_II',
    'FELIZ',
    'VERO_X',
    'KYO',
    'VIPER',
    'KINET',
    'KLARA',
    'VENTO',
    'THEON',
  ];

  const getCategoryPriority = (cat?: string): number => {
    if (cat === 'suv') return 1; // 1. Ô tô điện
    if (cat === 'commercial') return 2; // 2. Xe dịch vụ & Thương mại
    if (cat === 'scooter' || cat === 'motorbike') return 3; // 3. Xe máy điện
    return 4;
  };

  const getSubOrderIndex = (v: Vehicle): number => {
    const code = (v.code || '').toUpperCase().replace(/[\s-_]/g, '');
    const name = (v.name || '').toUpperCase().replace(/[\s-_]/g, '');
    const target = `${code} ${name}`;

    if (v.category === 'suv') {
      const lacHong = (v.name || '').toLowerCase();
      if (lacHong.includes('lạc hồng 900 lx')) return SUV_ORDER.length;
      if (lacHong.includes('lạc hồng 900s')) return SUV_ORDER.length + 1;
      if (lacHong.includes('lạc hồng 800s')) return SUV_ORDER.length + 2;
      for (let i = 0; i < SUV_ORDER.length; i++) {
        if (target.includes(SUV_ORDER[i])) return i;
      }
    } else if (v.category === 'commercial') {
      for (let i = 0; i < COMMERCIAL_ORDER.length; i++) {
        if (target.includes(COMMERCIAL_ORDER[i])) return i;
      }
    } else {
      for (let i = 0; i < SCOOTER_ORDER.length; i++) {
        if (target.includes(SCOOTER_ORDER[i])) return i;
      }
    }
    return 999;
  };

  const getModelFamilyKey = (v: Vehicle) => {
    if (/lạc hồng/i.test(`${v.name} ${v.rawSpecs?.vehicle_line || ''}`)) {
      return (v.name || '').replace(/^VinFast\s+/i, '').trim().toUpperCase();
    }
    if (v.code && v.code.trim()) return v.code.trim().toUpperCase();
    const match = v.name.match(/VF\s*(MPV\s*)?\d+/i);
    return match ? match[0].toUpperCase().replace(/\s+/g, '') : v.name;
  };

  const groupedVehicles = (() => {
    const map = new Map<string, Vehicle>();
    vehicleList.forEach((v) => {
      const family = getModelFamilyKey(v);
      if (!map.has(family)) {
        const cleanName = v.name.replace(/\s+(Eco|Plus|The All New|Tiêu chuẩn)$/i, '');
        map.set(family, {
          ...v,
          name: cleanName,
        });
      } else {
        const existing = map.get(family)!;
        if (v.basePrice < existing.basePrice) {
          const cleanName = v.name.replace(/\s+(Eco|Plus|The All New|Tiêu chuẩn)$/i, '');
          map.set(family, { ...v, name: cleanName });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const catA = getCategoryPriority(a.category);
      const catB = getCategoryPriority(b.category);
      if (catA !== catB) return catA - catB;

      const idxA = getSubOrderIndex(a);
      const idxB = getSubOrderIndex(b);
      if (idxA !== idxB) return idxA - idxB;

      const priceA = a.basePrice || 0;
      const priceB = b.basePrice || 0;
      if (priceA !== priceB && priceA > 0 && priceB > 0) return priceA - priceB;

      return a.name.localeCompare(b.name);
    });
  })();

  const filtered = groupedVehicles.filter((v) => {
    if (activeFilter === 'all') return true;
    return v.category === activeFilter;
  });

  const isLacHongVehicle = (v: Vehicle) =>
    /lạc hồng/i.test(`${v.name} ${v.code || ''} ${v.rawSpecs?.vehicle_line || ''}`);

  const vehicleSections: Array<{ label?: string; vehicles: Vehicle[] }> = (() => {
    if (activeFilter === 'suv') {
      return [
        { label: 'Dòng VF', vehicles: filtered.filter((v) => !isLacHongVehicle(v)) },
        { label: 'Dòng Lạc Hồng', vehicles: filtered.filter(isLacHongVehicle) },
      ].filter((section) => section.vehicles.length > 0);
    }

    if (activeFilter === 'all') {
      return [
        { label: 'Dòng VF', vehicles: filtered.filter((v) => v.category === 'suv' && !isLacHongVehicle(v)) },
        { label: 'Dòng Lạc Hồng', vehicles: filtered.filter(isLacHongVehicle) },
        { label: 'Dòng xe dịch vụ', vehicles: filtered.filter((v) => v.category === 'commercial') },
        { label: 'Xe máy điện', vehicles: filtered.filter((v) => v.category === 'scooter' || v.category === 'motorbike') },
      ].filter((section) => section.vehicles.length > 0);
    }

    return [{ vehicles: filtered }];
  })();


  return (
    <section id="showcase" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-5 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Dòng xe VinFast</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Khám phá thế giới điện
            </h2>
            <p className="text-gray-500 mt-1.5 text-base">
              {filtered.length} mẫu xe điện từ nhỏ gọn đến hạng sang, phù hợp mọi nhu cầu
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-800 cursor-pointer group">
            <span>Xem thêm</span>
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-8 p-1 bg-white rounded-xl border border-gray-100 shadow-sm w-fit">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterClick(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeFilter === tab.id
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              {tab.id === 'all' && <LayoutGrid size={14} />}
              {tab.id === 'suv' && <Zap size={14} />}
              {tab.id === 'scooter' && <Bike size={14} />}
              {tab.id === 'commercial' && <Truck size={14} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="space-y-10">
          {vehicleSections.map((section, sectionIndex) => (
            <div key={section.label || `section-${sectionIndex}`}>
              {section.label && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 rounded-full bg-blue-600" />
                  <h3 className="text-xl font-bold text-slate-900">{section.label}</h3>
                  <span className="text-sm text-slate-400">{section.vehicles.length} mẫu</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {section.vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    isCompared={compareList.includes(vehicle.id)}
                    onToggleCompare={onToggleCompare}
                    onViewDetail={() => onViewDetail?.(vehicle)}
                    onRequestQuote={onRequestQuote}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA band */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-blue-900 to-blue-700 p-8 flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white"
                style={{
                  width: `${(i + 1) * 80}px`,
                  height: `${(i + 1) * 80}px`,
                  right: '-40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            ))}
          </div>
          <div className="relative text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Chưa biết chọn xe nào?</h3>
            <p className="text-blue-200 text-sm">Trợ lý AI của chúng tôi sẽ tư vấn xe phù hợp với nhu cầu và ngân sách của bạn</p>
          </div>
          <div className="relative flex gap-3 flex-shrink-0 flex-wrap justify-center sm:justify-start">
            <button
              onClick={onOpenChat}
              className="px-6 py-3 bg-white text-blue-800 text-sm font-bold rounded-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-md active:scale-95 cursor-pointer"
            >
              Tư vấn AI ngay
            </button>
            <button
              onClick={() => onOpenTestDrive?.(null)}
              className="px-6 py-3 bg-blue-600/80 hover:bg-blue-600 text-white text-sm font-bold rounded-xl border border-white/20 transition-all hover:scale-105 shadow-md active:scale-95 cursor-pointer"
            >
              Đăng ký lái thử
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
