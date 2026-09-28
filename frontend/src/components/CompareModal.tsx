import { useState } from 'react';
import {
  X, Zap, Shield, Sparkles, CheckCircle2, FileText,
  MessageSquare, Plus, Trash2, ChevronDown, Check, Search, Award,
  ArrowLeft, RefreshCw, Car, Bike, Sparkle, HelpCircle
} from 'lucide-react';
import type { Vehicle } from '@/types';
import { getImageUrl, formatVNDPrice } from '@/lib/api';
import { CLOUD_ASSETS } from '@/lib/cloudAssets';
import { getSmartFeatureDisplay } from '@/lib/smartFeatures';
import { isSameComparisonCategory } from '@/lib/vehicleComparison';

type FilterCategory = 'all' | 'suv' | 'scooter' | 'commercial';
interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  allVehicles: Vehicle[];
  onRemoveVehicle: (id: string) => void;
  onAddVehicle: (id: string) => void;
  onReplaceVehicle: (oldId: string, newId: string) => void;
  onRequestQuote: (vehicle: Vehicle) => void;
  onOpenChatWithCompare?: (vehicles: Vehicle[]) => void;
}

function parseAirbags(safety: any, isMotorbike: boolean, officialOnly = false): string {
  if (isMotorbike) return 'Không áp dụng (Xe máy điện)';
  if (!safety || typeof safety !== 'object') return officialOnly ? 'Chưa công bố' : 'Trang bị an toàn chuẩn VinFast';
  if (typeof safety.airbags === 'number') {
    if (safety.airbags === 0) return 'Thông số túi khí đang cập nhật';
    return `${safety.airbags} túi khí an toàn`;
  }
  if (typeof safety.airbags === 'string') return `${safety.airbags}`;
  if (safety.side_airbags || safety.front_airbags) return 'Túi khí phía trước & bên hông';
  return officialOnly ? 'Chưa công bố' : 'Trang bị an toàn chuẩn VinFast';
}

function parseActiveSafety(safety: any, isMotorbike: boolean, officialOnly = false): string {
  if (isMotorbike) return 'Phanh đĩa an toàn, giảm chấn thủy lực';
  if (!safety || typeof safety !== 'object') return officialOnly ? 'Chưa công bố' : 'Hệ thống an toàn tiêu chuẩn';

  const items: string[] = [];
  if (safety.abs) items.push('ABS');
  if (safety.ebd) items.push('EBD');
  if (safety.ba) items.push('BA');
  if (safety.esc) items.push('ESC');
  if (safety.ess) items.push('ESS');
  if (safety.hsa) items.push('HSA');
  if (safety.tcs) items.push('TCS');
  if (safety.tpms) items.push('TPMS');
  if (safety.rom) items.push('ROM');
  if (safety.isofix) items.push('ISOFIX');
  if (safety.automatic_door_lock) items.push('Khóa cửa tự động');

  if (items.length > 0) return items.join(', ');
  if (safety.other_features) return String(safety.other_features);
  return officialOnly ? 'Chưa công bố' : 'Trang bị an toàn tiêu chuẩn VinFast';
}

function parseAdasFeatures(adas: any, isMotorbike: boolean, officialOnly = false): string {
  if (isMotorbike) return 'Không áp dụng (xe máy điện)';
  if (!adas || typeof adas !== 'object') return officialOnly ? 'Chưa công bố' : 'Hệ thống hỗ trợ lái xe tiêu chuẩn';

  const items: string[] = [];
  if (adas.highway_assist) items.push('Hỗ trợ cao tốc');
  if (adas.lane_keep_assist || adas.emergency_lane_keep) items.push('Giữ làn khẩn cấp');
  if (adas.blind_spot_warning) items.push('Cảnh báo điểm mù');
  if (adas.surround_view_camera || adas.camera === 'Camera 360 độ') items.push('Camera 360°');
  else if (adas.rear_camera) items.push('Camera lùi');
  if (adas.adaptive_cruise_control) items.push('Ga tự động thích ứng ACC');
  else if (adas.cruise_control) items.push('Ga tự động Cruise Control');
  if (adas.automatic_emergency_braking) items.push('Phanh khẩn cấp AEB');
  if (adas.vietnamese_voice_assistant || adas.voice_assistant) items.push('Trợ lý ảo ViVi');

  if (items.length > 0) return items.join(' • ');
  if (typeof adas.adas === 'string') return adas.adas;
  if (adas.other_features) return String(adas.other_features);

  return officialOnly ? 'Chưa công bố' : 'Trang bị hỗ trợ lái tiêu chuẩn VinFast';
}

function extractVehicleSpecs(vehicle: Vehicle) {
  const isMotorbike = vehicle.category === 'motorbike' || vehicle.category === 'scooter';
  const raw = vehicle.rawSpecs || {};
  const isLacHong900LX = !isMotorbike && /Lạc Hồng 900 LX/i.test(`${vehicle.name} ${raw.vehicle_line || ''}`);

  const legacySource = raw._legacy_source?.specifications || raw.specs?._legacy_source?.specifications || raw.additional_specs?._legacy_source?.specifications || {};
  const legacyAdditional = legacySource.additional_specs || {};
  const directSpecs = raw.additional_specs || raw.specs || {};

  const legacySpecs: Record<string, any> = {
    ...legacySource,
    ...legacyAdditional,
    ...directSpecs,
  };

  // 1. Power, Drivetrain & Acceleration
  const powerKw = raw.maximum_power_kw ?? legacySpecs.motor_power_kw;
  const powerHp = legacySpecs.motor_power_hp ?? (powerKw ? Math.round(powerKw * 1.34) : null);
  const powerW = raw.maximum_power_w ?? legacySpecs.maximum_power_w ?? legacySpecs.power_w;

  let powerDisplay = isLacHong900LX ? 'Chưa công bố' : 'Tiêu chuẩn nhà sản xuất';
  if (isMotorbike) {
    if (powerW) powerDisplay = `${powerW} W`;
    else if (powerKw) powerDisplay = `${powerKw * 1000} W`;
  } else {
    if (powerHp && powerKw) powerDisplay = isLacHong900LX ? `${powerHp} HP` : `${powerHp} HP (${powerKw} kW)`;
    else if (powerKw) powerDisplay = `${powerKw} kW`;
    else if (powerHp) powerDisplay = `${powerHp} HP`;
  }

  const accel0100Val = legacySpecs.acceleration_0_100_seconds ?? raw.acceleration_0_100_seconds;
  const accel050Val = legacySpecs.acceleration_0_50_seconds ?? raw.acceleration_0_50_seconds;
  const accelDisplayVal = accel0100Val ?? accel050Val;
  const accelDisplayLabel = accel0100Val !== undefined ? '0-100 km/h' : '0-50 km/h';
  const accel050 = accelDisplayVal
    ? `${accelDisplayVal} giây (${accelDisplayLabel})`
    : (isLacHong900LX ? 'Chưa công bố' : (vehicle.acceleration || 'Tăng tốc mượt mà'));

  const drivetrain = legacySpecs.drivetrain || raw.drivetrain || (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Động cơ bánh sau In-Hub' : 'Cầu trước FWD / 2 cầu AWD'));

  const regenVal = legacySpecs.regenerative_braking ?? raw.regenerative_braking;
  const regenBraking = regenVal !== undefined
    ? (typeof regenVal === 'boolean' ? (regenVal ? 'Có (Phanh tái sinh năng lượng)' : 'Không') : String(regenVal))
    : (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Không áp dụng' : 'Có (Phanh tái sinh năng lượng)'));

  // 2. Torque & Speed
  const torqueVal = raw.maximum_torque_nm ?? legacySpecs.motor_torque_nm;
  const torqueNm = torqueVal ? `${torqueVal} Nm` : (isMotorbike ? 'Mô-tơ In-Hub' : 'Chưa công bố');

  const topSpeedVal = raw.maximum_speed_kmh ?? legacySpecs.maximum_speed_kmh ?? vehicle.topSpeed;
  const topSpeedKmh = topSpeedVal ? `${topSpeedVal} km/h` : 'Chưa công bố';

  // 3. Battery & Range
  const batteryCapKwh = raw.usable_battery_capacity ?? raw.battery_capacity_kwh ?? legacySpecs.battery_capacity_kwh;
  const batteryType = raw.battery_type || legacySpecs.battery_type || (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Pin Lithium-ion LFP' : 'Pin LFP cao cấp'));
  const batteryCapacityStatus = legacySpecs.battery_capacity_status ?? raw.battery_capacity_status;
  const batteryCapDisplay = batteryCapKwh
    ? `${batteryCapKwh} kWh (${batteryType})`
    : (isLacHong900LX && batteryCapacityStatus
      ? batteryCapacityStatus.replace(/\s*\([^)]*\)\s*$/, '')
      : (batteryCapacityStatus || batteryType));

  const rangeKmVal = raw.range_km ?? legacySpecs.range_km ?? vehicle.range;
  const rangeKm = rangeKmVal ? `${rangeKmVal} km` : 'Chưa công bố';

  const chargingText = legacySpecs.charging_info_text || raw.charging_info_text || (
    isLacHong900LX
      ? 'Chưa công bố'
      : (isMotorbike ? `Sạc đầy từ 0% đến 100% (~${raw.charging_time_minutes || 360} phút)` : 'Sạc nhanh DC 10-70% (~25-33 phút)')
  );

  // 4. Dimensions, Chassis & Wheels
  const lengthMm = raw.length_mm ?? legacySpecs.length_mm;
  const widthMm = raw.width_mm ?? legacySpecs.width_mm;
  const heightMm = raw.height_mm ?? legacySpecs.height_mm;
  const dimensionsStr = (lengthMm && widthMm && heightMm)
    ? `${lengthMm} x ${widthMm} x ${heightMm} mm`
    : (isLacHong900LX && (lengthMm || widthMm || heightMm)
      ? `Dài: ${lengthMm ? `${lengthMm} mm` : 'Chưa công bố'} • Rộng: ${widthMm ? `${widthMm} mm` : 'Chưa công bố'} • Cao: ${heightMm ? `${heightMm} mm` : 'Chưa công bố'}`
      : (isMotorbike ? 'Kích thước chuẩn scooter đô thị' : 'Chưa công bố'));

  const wheelbaseVal = raw.wheelbase_mm ?? legacySpecs.wheelbase_mm;
  const wheelbaseMm = wheelbaseVal ? `${wheelbaseVal} mm` : 'Chưa công bố';

  const groundClearanceVal = legacySpecs.ground_clearance_mm ?? raw.ground_clearance_mm;
  const groundClearanceMm = groundClearanceVal ? `${groundClearanceVal} mm` : 'Chưa công bố';

  const turningVal = legacySpecs.turning_radius_m ?? raw.turning_radius_m ?? legacySpecs.turning_diameter_m ?? raw.turning_diameter_m;
  const turningDiameter = turningVal ? `${turningVal} m` : (isMotorbike ? 'Bán kính quay xe linh hoạt' : 'Chưa công bố');

  const weightVal = raw.weight_kg ?? legacySpecs.curb_weight_kg ?? legacySpecs.weight_kg;
  const curbWeightKg = weightVal ? `${weightVal} kg` : 'Chưa công bố';

  const seatsVal = raw.seat_count ?? legacySpecs.seat_count ?? vehicle.seats;
  const seats = seatsVal ? `${seatsVal} chỗ` : (isMotorbike ? '2 chỗ' : 'Chưa công bố');

  const frontTire = legacySpecs.front_tire || raw.front_tire;
  const rearTire = legacySpecs.rear_tire || raw.rear_tire;
  const tiresWheels = legacySpecs.tires_wheels || raw.tires_wheels || (
    (frontTire || rearTire)
      ? `Trước: ${frontTire || 'Tiêu chuẩn'}, Sau: ${rearTire || 'Tiêu chuẩn'}`
      : (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Vành mâm hợp kim & Lốp không ruột' : 'Vành hợp kim nhôm thể thao'))
  );

  // 5. Interior, Exterior & Convenience
  const cargoLiters = legacySpecs.cargo_capacity_liters ?? raw.cargo_capacity_liters;
  const cargoFoldedLiters = legacySpecs.cargo_capacity_folded_liters ?? raw.cargo_capacity_folded_liters;
  const underseatStorage = legacySpecs.underseat_storage_liters ?? raw.underseat_storage_liters;

  let trunkDisplay = isLacHong900LX ? 'Chưa công bố' : 'Tiêu chuẩn phân khúc';
  if (isMotorbike) {
    trunkDisplay = underseatStorage ? `${underseatStorage} lít (Cốp dưới yên)` : 'Cốp rộng chứa đồ dưới yên';
  } else {
    if (cargoLiters && cargoFoldedLiters) {
      trunkDisplay = `${cargoLiters} lít (Gập ghế: ${cargoFoldedLiters} lít)`;
    } else if (cargoLiters) {
      trunkDisplay = `${cargoLiters} lít`;
    }
  }

  const waterResistance = legacySpecs.water_resistance_standard ?? raw.water_resistance_standard ?? (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'IP67 (Chống ngập 0.5m / 30p)' : 'IP67 (Pin chống nước)'));

  const exterior = legacySpecs.exterior_features || raw.exterior_features || {};
  const lighting = legacySpecs.lighting_features || raw.lighting_features || {};

  const headlights = exterior.headlights || exterior.headlight || lighting.headlight || (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Full LED' : 'Đèn LED tự động'));
  const taillights = exterior.taillights || exterior.taillight || lighting.taillight || (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Đèn hậu LED' : 'Dải LED nhận diện VinFast'));
  const lightingExteriorDisplay = `${headlights} (Trước) • ${taillights} (Sau)`;

  const interior = legacySpecs.interior_features || legacySpecs.technology_features || raw.technology_features || {};
  const screenInches = interior.central_screen_inches
    ? `${interior.central_screen_inches} inch`
    : (interior.display ? `Màn hình ${interior.display}` : (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Màn hình LED Color' : 'Màn hình cảm ứng trung tâm')));

  const speakers = typeof interior.audio_speakers === 'number'
    ? `${interior.audio_speakers} loa`
    : (interior.audio ? String(interior.audio) : (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Còi xe điện' : 'Hệ thống âm thanh tiêu chuẩn')));

  const driverSeat = interior.driver_seat || legacySpecs.driver_seat || (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Yên bọc da phẳng' : 'Ghế chỉnh điện'));
  const seatMaterial = interior.seat_material || legacySpecs.seat_material || (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Da tổng hợp chống nước' : 'Da cao cấp / Nỉ'));
  const seatDisplay = `${driverSeat} (${seatMaterial})`;

  const seatHeatCoolVal = interior.front_seat_heating_cooling ?? legacySpecs.front_seat_heating_cooling;
  const seatHeatingCooling = seatHeatCoolVal !== undefined
    ? (typeof seatHeatCoolVal === 'boolean' ? (seatHeatCoolVal ? 'Có (Sưởi & Thông gió làm mát)' : 'Không trang bị') : String(seatHeatCoolVal))
    : (isMotorbike ? 'Không áp dụng' : 'Chưa trang bị / Tùy phiên bản');

  const smartTechDisplay = getSmartFeatureDisplay(raw) || 'Không có';

  // 6. Chassis & Brakes
  const frontBrake = legacySpecs.front_brake || raw.front_brake || (isLacHong900LX ? 'Chưa công bố' : 'Phanh đĩa');
  const rearBrake = legacySpecs.rear_brake || raw.rear_brake || (isLacHong900LX ? 'Chưa công bố' : (isMotorbike ? 'Phanh cơ' : 'Phanh đĩa'));
  const brakesDisplay = `${frontBrake} / ${rearBrake}`;

  // 7. Safety & ADAS
  const safety = legacySpecs.safety_features || raw.safety_features || {};
  const adas = legacySpecs.driver_assistance_features || raw.technology_features || {};

  const airbagsDisplay = parseAirbags(safety, isMotorbike, isLacHong900LX);
  const activeSafetyDisplay = parseActiveSafety(safety, isMotorbike, isLacHong900LX);
  const adasDisplay = parseAdasFeatures(adas, isMotorbike, isLacHong900LX);

  return {
    isMotorbike,
    powerDisplay,
    accel050,
    drivetrain,
    regenBraking,
    torqueNm,
    topSpeedKmh,
    batteryCapDisplay,
    rangeKm,
    chargingText,
    dimensionsStr,
    wheelbaseMm,
    groundClearanceMm,
    turningDiameter,
    curbWeightKg,
    seats,
    tiresWheels,
    seatDisplay,
    seatHeatingCooling,
    trunkDisplay,
    waterResistance,
    lightingExteriorDisplay,
    screenInches,
    speakers,
    smartTechDisplay,
    brakesDisplay,
    airbagsDisplay,
    activeSafetyDisplay,
    adasDisplay,
  };
}

export default function CompareModal({
  open,
  onClose,
  selectedIds,
  allVehicles,
  onRemoveVehicle,
  onAddVehicle,
  onReplaceVehicle,
  onRequestQuote,
  onOpenChatWithCompare,
}: CompareModalProps) {
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(null);

  // Picker Modal State for selecting vehicle
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);
  const [pickerCategory, setPickerCategory] = useState<FilterCategory>('all');
  const [pickerSearch, setPickerSearch] = useState('');

  if (!open) return null;

  // Resolve vehicles strictly from selectedIds (NO auto-filling default 2 vehicles!)
  const safeSelectedIds = Array.isArray(selectedIds) ? selectedIds : [];
  const safeAllVehicles = Array.isArray(allVehicles) ? allVehicles : [];

  const resolvedCurrentVehicles = safeSelectedIds
    .map((id) => safeAllVehicles.find((v) => v && v.id === id))
    .filter((v): v is Vehicle => Boolean(v));

  // Keep the visible comparison safe even if an old mixed-category selection
  // is still present in memory from before the category restriction existed.
  const comparisonAnchor = resolvedCurrentVehicles[0];
  const currentVehicles = comparisonAnchor
    ? resolvedCurrentVehicles.filter((vehicle) => isSameComparisonCategory(comparisonAnchor, vehicle))
    : resolvedCurrentVehicles;
  const sameCategoryVehicles = currentVehicles;

  // Find vehicles not currently selected to allow adding/replacing
  const availableVehicles = safeAllVehicles.filter(
    (v) => v && !sameCategoryVehicles.some((cv) => cv && cv.id === v.id)
      && (!comparisonAnchor || isSameComparisonCategory(comparisonAnchor, v))
  );

  // Filtered available vehicles for picker modal
  const filteredAvailableVehicles = availableVehicles.filter((v) => {
    if (!v) return false;
    const matchCat =
      pickerCategory === 'all' ||
      (pickerCategory === 'scooter'
        ? (v.category === 'motorbike' || v.category === 'scooter')
        : v.category === pickerCategory);
    const matchSearch = !pickerSearch || (v.name || '').toLowerCase().includes(pickerSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const formatVND = (price: number) => formatVNDPrice(price);

  // Calculate quick comparison highlights
  const lowestPrice = currentVehicles.length > 0 ? Math.min(...currentVehicles.map((v) => v.basePrice || 0)) : 0;
  const maxRange = currentVehicles.length > 0 ? Math.max(...currentVehicles.map((v) => typeof v.range === 'number' ? v.range : parseInt(String(v.range)) || 0)) : 0;

  const handleOpenPickerForSlot = (slotIndex: number) => {
    setPickerSlotIndex(slotIndex);
    setPickerOpen(true);
  };

  const handleSelectVehicleInPicker = (vehicleId: string) => {
    if (pickerSlotIndex !== null && currentVehicles[pickerSlotIndex]) {
      onReplaceVehicle(currentVehicles[pickerSlotIndex].id, vehicleId);
    } else {
      onAddVehicle(vehicleId);
    }
    setPickerOpen(false);
    setPickerSlotIndex(null);
  };

  return (
    <div
      style={{ fontFamily: '"Mulish", serif' }}
      className="min-h-screen bg-gray-50 text-gray-900 pt-20 md:pt-24 pb-16 animate-fadeIn"
    >
      {/* STATIC BACK BUTTON & ACTION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-3 flex items-center justify-between gap-4">
        <button
          onClick={onClose}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <ArrowLeft size={18} className="text-slate-500 group-hover:text-blue-600 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Quay lại</span>
        </button>

        {currentVehicles.length >= 2 && currentVehicles.length < 3 && availableVehicles.length > 0 && (
          <button
            onClick={() => handleOpenPickerForSlot(2)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Thêm xe thứ 3 ({currentVehicles.length}/3)</span>
          </button>
        )}
      </div>

      {/* BODY CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* HERO BANNER SECTION */}
        <div>
          <div className="relative overflow-hidden bg-slate-950 text-white p-6 sm:p-8 lg:p-12 rounded-3xl shadow-2xl border border-slate-800/80 min-h-[260px] flex items-center">
            {/* Background banner image - 100% Sharp, Zero Blur */}
            <div className="absolute inset-0 z-0">
              <img
                src={CLOUD_ASSETS.BANNER_SOSANH}
                alt="VinFast Compare Hero Background"
                className="w-full h-full object-cover object-right sm:object-center"
              />
              {/* Subtle left gradient overlay so text remains readable without obscuring the car */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent pointer-events-none" />
            </div>

            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl lg:max-w-2xl space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-600/40 text-blue-200 text-xs font-bold rounded-full border border-blue-400/50 shadow-md">
                  <Award size={14} className="text-blue-300" />
                  So sánh trực quan thông số &amp; giá bán xe điện VinFast
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
                  So Sánh Chi Tiết Các Dòng Xe VinFast
                </h1>
                <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-medium max-w-xl drop-shadow">
                  {currentVehicles.length >= 2 ? (
                    <>
                      Đang so sánh trực quan thông số kỹ thuật, giá bán, kích thước, hiệu năng động cơ và trang bị an toàn giữa <strong>{currentVehicles.map(v => v.name).join(' vs ')}</strong>.
                    </>
                  ) : (
                    'Vui lòng chọn 2 mẫu xe bên dưới để bắt đầu so sánh chi tiết về thông số kỹ thuật, động cơ, kích thước và trang bị an toàn.'
                  )}
                </p>
              </div>

              {currentVehicles.length >= 2 && onOpenChatWithCompare && (
                <div className="shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenChatWithCompare(currentVehicles);
                    }}
                    className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xl transition-all inline-flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <MessageSquare size={16} />
                    <span>Hỏi AI Advisor</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VEHICLE SELECTION BOARD (Khi chưa đủ 2 xe) */}
        {currentVehicles.length < 2 && (
          <div className="max-w-7xl mx-auto space-y-6">

            {/* 2 Interactive Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* SLOT 1 */}
              {currentVehicles[0] ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                        Xe thứ 1 đã chọn
                      </span>
                      <button
                        onClick={() => onRemoveVehicle(currentVehicles[0].id)}
                        className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 p-1"
                      >
                        <Trash2 size={13} />
                        <span>Bỏ chọn</span>
                      </button>
                    </div>

                    <div className="relative aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-100">
                      <img
                        src={getImageUrl(currentVehicles[0].image)}
                        alt={currentVehicles[0].name}
                        className="w-full h-full object-contain p-3"
                      />
                    </div>

                    <h3 className="text-xl font-black text-slate-900">{currentVehicles[0].name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{currentVehicles[0].tagline}</p>
                    <p className="text-base font-black text-blue-700 mt-2">{formatVND(currentVehicles[0].basePrice)}</p>
                  </div>

                  <button
                    onClick={() => handleOpenPickerForSlot(0)}
                    className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Đổi sang xe khác</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleOpenPickerForSlot(0)}
                  className="bg-white rounded-3xl border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/20 hover:bg-blue-50/60 p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-sm hover:shadow-md min-h-[300px]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Plus size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Chọn xe thứ 1</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Bấm vào đây để chọn mẫu xe VinFast đầu tiên bạn muốn so sánh
                  </p>
                  <span className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl group-hover:bg-blue-700 transition-colors shadow-sm">
                    + Chọn mẫu xe 1
                  </span>
                </div>
              )}

              {/* SLOT 2 */}
              {currentVehicles[1] ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                        Xe thứ 2 đã chọn
                      </span>
                      <button
                        onClick={() => onRemoveVehicle(currentVehicles[1].id)}
                        className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 p-1"
                      >
                        <Trash2 size={13} />
                        <span>Bỏ chọn</span>
                      </button>
                    </div>

                    <div className="relative aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-100">
                      <img
                        src={getImageUrl(currentVehicles[1].image)}
                        alt={currentVehicles[1].name}
                        className="w-full h-full object-contain p-3"
                      />
                    </div>

                    <h3 className="text-xl font-black text-slate-900">{currentVehicles[1].name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{currentVehicles[1].tagline}</p>
                    <p className="text-base font-black text-blue-700 mt-2">{formatVND(currentVehicles[1].basePrice)}</p>
                  </div>

                  <button
                    onClick={() => handleOpenPickerForSlot(1)}
                    className="mt-4 w-full py-2.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>Đổi sang xe khác</span>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleOpenPickerForSlot(1)}
                  className="bg-white rounded-3xl border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/60 p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all group shadow-sm hover:shadow-md min-h-[300px]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Plus size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Chọn xe thứ 2</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Bấm vào đây để chọn mẫu xe thứ hai để kích hoạt bảng so sánh chi tiết
                  </p>
                  <span className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl group-hover:bg-emerald-700 transition-colors shadow-sm">
                    + Chọn mẫu xe 2
                  </span>
                </div>
              )}

            </div>

            {/* Quick Pick Grid: Danh mục chọn nhanh */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Gợi Ý Chọn Nhanh Mẫu Xe Để So Sánh</h3>
                  <p className="text-xs text-slate-500">Bấm vào xe bất kỳ để tự động đưa vào vị trí còn trống</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'suv', label: 'Ô tô điện' },
                    { id: 'scooter', label: 'Xe máy điện' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPickerCategory(tab.id as FilterCategory)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${pickerCategory === tab.id
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {availableVehicles
                  .filter((v) => {
                    if (pickerCategory === 'all') return true;
                    if (pickerCategory === 'scooter') return v.category === 'scooter' || v.category === 'motorbike';
                    return v.category === pickerCategory;
                  })
                  .slice(0, 12)
                  .map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => {
                        onAddVehicle(vehicle.id);
                      }}
                      className="bg-slate-50 hover:bg-blue-50/60 p-3 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between text-center"
                    >
                      <div className="aspect-[4/3] bg-white rounded-xl overflow-hidden mb-2 p-1.5 flex items-center justify-center">
                        <img
                          src={getImageUrl(vehicle.image)}
                          alt={vehicle.name}
                          className="max-h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-700 truncate">
                          {vehicle.name}
                        </h4>
                        <p className="text-[11px] font-bold text-blue-700 mt-1">
                          {formatVND(vehicle.basePrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddVehicle(vehicle.id);
                        }}
                        className="mt-2 w-full py-1.5 bg-white group-hover:bg-blue-700 group-hover:text-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-all shadow-2xs cursor-pointer"
                      >
                        + So sánh
                      </button>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* COMPARISON MATRIX WRAPPER (Chỉ hiện khi đã chọn đủ từ 2 xe trở lên) */}
        {sameCategoryVehicles.length >= 2 && (
          <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

            {/* MAIN COMPARISON TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">

                {/* HEADER ROW: VEHICLE SHOWCASE CARDS */}
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/30">
                    <th className="p-4 sm:p-5 w-48 sm:w-60 bg-slate-100/90 align-middle border-r border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                        <div>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                            Dòng Xe
                          </span>
                        </div>
                      </div>
                    </th>

                    {sameCategoryVehicles.map((vehicle, index) => {
                      return (
                        <th
                          key={vehicle.id}
                          className={`p-4 sm:p-5 align-top border-r border-slate-200 relative ${currentVehicles.length === 2 ? 'w-1/2' : 'w-1/3'
                            }`}
                        >
                          <div className="space-y-3.5">

                            {/* Swap / Change Vehicle Dropdown */}
                            <div className="relative">
                              <button
                                onClick={() => setDropdownOpenIndex(dropdownOpenIndex === index ? null : index)}
                                className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all hover:border-blue-300 active:scale-98"
                              >
                                <span className="truncate flex items-center gap-1.5">
                                  <RefreshCw size={12} className="text-blue-600 shrink-0" />
                                  Đổi sang xe khác
                                </span>
                                <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
                              </button>

                              {dropdownOpenIndex === index && (
                                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-64 overflow-y-auto p-1.5 animate-fadeIn">
                                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                    Chọn xe thay thế
                                  </div>
                                  {availableVehicles.map((av) => (
                                    <button
                                      key={av.id}
                                      onClick={() => {
                                        onReplaceVehicle(vehicle.id, av.id);
                                        setDropdownOpenIndex(null);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors flex items-center justify-between"
                                    >
                                      <span className="truncate">{av.name}</span>
                                      <span className="text-[11px] text-slate-400 shrink-0 font-medium ml-1.5">
                                        {formatVNDPrice(av.basePrice)}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Image Container */}
                            <div className="relative aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group">
                              <img
                                src={getImageUrl(vehicle.image)}
                                alt={vehicle.name}
                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                              />
                              <button
                                onClick={() => onRemoveVehicle(vehicle.id)}
                                className="absolute top-2.5 right-2.5 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all active:scale-95"
                                title="Bỏ xe này khỏi danh sách so sánh"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            {/* Name & Tagline */}
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                                  {vehicle.category === 'scooter' || vehicle.category === 'motorbike' ? 'Xe máy điện' : vehicle.category === 'commercial' ? 'Xe dịch vụ' : 'Ô tô điện'}
                                </span>
                              </div>
                              <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">{vehicle.name}</h4>
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">{vehicle.tagline}</p>
                            </div>

                            {/* CTA Button */}
                            <button
                              onClick={() => {
                                onClose();
                                onRequestQuote(vehicle);
                              }}
                              className="w-full py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-1.5 active:scale-98"
                            >
                              <FileText size={14} />
                              <span>Báo giá lăn bánh</span>
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                {/* BODY MATRIX SECTIONS */}
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">

                  {/* SECTION 1: GIÁ BÁN NIÊM YẾT */}
                  <tr className="bg-slate-100/80 font-black text-slate-900 uppercase">
                    <td colSpan={currentVehicles.length + 1} className="p-3.5 text-xs sm:text-sm tracking-wider border-y border-slate-300">
                      💵 1. Bảng Giá Niêm Yết Chính Thức
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Giá xe niêm yết
                    </td>
                    {sameCategoryVehicles.map((v) => (
                      <td key={v.id} className="p-3.5 font-medium text-blue-700 text-sm sm:text-base border-r border-slate-200">
                        {formatVND(v.basePrice)}
                      </td>
                    ))}
                  </tr>

                  {/* SECTION 2: ĐỘNG CƠ & VẬN HÀNH */}
                  <tr className="bg-slate-100/80 font-black text-slate-900 uppercase">
                    <td colSpan={currentVehicles.length + 1} className="p-3.5 text-xs sm:text-sm tracking-wider border-y border-slate-300">
                      ⚡ 2. Thông Số Động Cơ &amp; Vận Hành
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Quãng đường di chuyển max
                    </td>
                    {sameCategoryVehicles.map((v) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-extrabold text-blue-700 border-r border-slate-200">
                          {s.rangeKm}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Công suất tối đa
                    </td>
                    {sameCategoryVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-bold text-slate-900 border-r border-slate-200">
                          {s.powerDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Hệ dẫn động
                    </td>
                    {sameCategoryVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                          {s.drivetrain}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Thời gian tăng tốc
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-bold text-emerald-700 border-r border-slate-200">
                          {s.accel050}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Phanh tái sinh năng lượng
                    </td>
                    {sameCategoryVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.regenBraking}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Mô-men xoắn cực đại
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                          {s.torqueNm}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Vận tốc tối đa
                    </td>
                    {sameCategoryVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.topSpeedKmh}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Dung lượng &amp; Loại Pin
                    </td>
                    {sameCategoryVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.batteryCapDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Thông tin sạc pin
                    </td>
                    {currentVehicles.map((v) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-emerald-700 border-r border-slate-200 leading-normal">
                          {s.chargingText}
                        </td>
                      );
                    })}
                  </tr>

                  {/* SECTION 3: KÍCH THƯỚC & TRỌNG LƯỢNG */}
                  <tr className="bg-slate-100/80 font-black text-slate-900 uppercase">
                    <td colSpan={currentVehicles.length + 1} className="p-3.5 text-xs sm:text-sm tracking-wider border-y border-slate-300">
                      📏 3. Kích Thước, Trọng Lượng &amp; Ghế Ngồi
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Số chỗ ngồi
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-extrabold text-slate-900 border-r border-slate-200">
                          {s.seats}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Kích thước DxRxC (mm)
                    </td>
                    {currentVehicles.map((v) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.dimensionsStr}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Trọng lượng bản thân (kg)
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-extrabold text-slate-900 border-r border-slate-200">
                          {s.curbWeightKg}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Chiều dài cơ sở (mm)
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.wheelbaseMm}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Khoảng sáng gầm xe (mm)
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.groundClearanceMm}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Bán kính quay vòng tối thiểu
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.turningDiameter}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      La-zăng &amp; Lốp xe
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.tiresWheels}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Hệ thống phanh
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.brakesDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  {/* SECTION 4: NỘI THẤT, NGOẠI THẤT & TIỆN ÍCH */}
                  <tr className="bg-slate-100/80 font-black text-slate-900 uppercase">
                    <td colSpan={currentVehicles.length + 1} className="p-3.5 text-xs sm:text-sm tracking-wider border-y border-slate-300">
                      🛋️ 4. Nội Thất, Ngoại Thất &amp; Tiện Ích Thông Minh
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Hệ thống Đèn &amp; Ngoại thất
                    </td>
                    {currentVehicles.map((v) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-900 border-r border-slate-200">
                          {s.lightingExteriorDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Màn hình giải trí / Cảm ứng
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-extrabold text-blue-900 border-r border-slate-200">
                          {s.screenInches}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Hệ thống Âm thanh / Còi
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.speakers}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Ghế lái &amp; Chất liệu ghế
                    </td>
                    {currentVehicles.map((v) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-bold text-slate-800 border-r border-slate-200">
                          {s.seatDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Sưởi &amp; Làm mát ghế trước
                    </td>
                    {currentVehicles.map((v) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200">
                          {s.seatHeatingCooling}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Thể tích cốp chứa đồ
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-bold text-blue-700 border-r border-slate-200">
                          {s.trunkDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Tính năng thông minh &amp; Kháng nước
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200 leading-normal whitespace-pre-wrap break-words">
                          {s.smartTechDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  {/* SECTION 5: AN TOÀN & ADAS */}
                  <tr className="bg-slate-100/80 font-black text-slate-900 uppercase">
                    <td colSpan={currentVehicles.length + 1} className="p-3.5 text-xs sm:text-sm tracking-wider border-y border-slate-300">
                      🛡️ 5. An Toàn, Túi Khí &amp; ADAS
                    </td>
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Túi khí an toàn
                    </td>
                    {currentVehicles.map((v) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-bold text-emerald-700 border-r border-slate-200">
                          {s.airbagsDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Hệ thống an toàn chủ động
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-slate-800 border-r border-slate-200 leading-normal">
                          {s.activeSafetyDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Trợ lái ADAS thông minh
                    </td>
                    {currentVehicles.map((v, index) => {
                      const s = extractVehicleSpecs(v);
                      return (
                        <td key={v.id} className="p-3.5 font-medium text-blue-700 border-r border-slate-200 leading-normal">
                          {s.adasDisplay}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                      Điểm nổi bật tiêu biểu
                    </td>
                    {currentVehicles.map((v) => (
                      <td key={v.id} className="p-3.5 border-r border-slate-200">
                        <ul className="space-y-1.5">
                          {v.highlights?.map((hl, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-slate-700 font-medium">
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* POPUP SELECTOR MODAL FOR VEHICLE (Slot 1, Slot 2, or Slot 3) */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 to-blue-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {pickerSlotIndex !== null
                    ? `Chọn Xe Cho Vị Trí Thứ ${pickerSlotIndex + 1}`
                    : 'Chọn Mẫu Xe Để So Sánh'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">Danh mục toàn bộ các dòng Ô tô điện &amp; Xe máy điện VinFast</p>
              </div>
              <button
                onClick={() => {
                  setPickerOpen(false);
                  setPickerSlotIndex(null);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Controls: Search & Category Tabs */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên xe (VF 5, Feliz...)..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setPickerCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${pickerCategory === 'all' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Tất cả ({availableVehicles.length})
                </button>
                <button
                  onClick={() => setPickerCategory('suv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${pickerCategory === 'suv' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Ô tô điện
                </button>
                <button
                  onClick={() => setPickerCategory('scooter')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${pickerCategory === 'scooter' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Xe máy điện
                </button>
                <button
                  onClick={() => setPickerCategory('commercial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${pickerCategory === 'commercial' ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Xe dịch vụ
                </button>
              </div>
            </div>

            {/* Vehicle List Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 bg-slate-100">
              {filteredAvailableVehicles.length > 0 ? (
                filteredAvailableVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => handleSelectVehicleInPicker(vehicle.id)}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-50 rounded-xl overflow-hidden mb-2.5 border border-slate-100">
                        <img
                          src={getImageUrl(vehicle.image)}
                          alt={vehicle.name}
                          className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                          {vehicle.category === 'scooter' || vehicle.category === 'motorbike' ? 'Xe máy điện' : vehicle.category === 'commercial' ? 'Xe dịch vụ' : 'Ô tô điện'}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {vehicle.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">{vehicle.tagline}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-blue-700">
                        {formatVNDPrice(vehicle.basePrice)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVehicleInPicker(vehicle.id);
                        }}
                        className="px-3 py-1.5 bg-blue-700 group-hover:bg-blue-800 text-white font-extrabold text-[11px] rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        + Chọn xe
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-bold text-xs">
                  Không tìm thấy xe phù hợp từ khóa tìm kiếm.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
