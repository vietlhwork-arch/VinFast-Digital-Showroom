import { useState, useEffect } from 'react';
import {
  X, Zap, Shield, Sparkles, CheckCircle2, Award, Calendar, FileText,
  Cpu, Activity, ArrowRight, MessageSquare, Sliders, Compass, Car, Sun
} from 'lucide-react';
import type { Vehicle } from '@/types';
import { getImageUrl, formatVNDPrice } from '@/lib/api';
import { getVehicleDisplayName } from '@/lib/vehicleDisplay';
import { getVehicleColorImage, isEBus, parseVehicleColors, resolveVehicleColorSwatch, type VehicleColor } from '@/lib/vehicleColors';
import { getSmartFeatureItems } from '@/lib/smartFeatures';

interface VehicleDetailModalProps {
  vehicle: Vehicle | null;
  allVehicles?: Vehicle[];
  open: boolean;
  onClose: () => void;
  onRequestQuote: (vehicle: Vehicle) => void;
  onOpenChat?: () => void;
  onOpenTestDrive?: (vehicle: Vehicle) => void;
}

const colorNameMapping: Record<string, string> = {
  '#0F172A': 'Đen Jet Black',
  '#DC2626': 'Đỏ Crimson Red',
  '#FFFFFF': 'Trắng Brahminy White',
  '#2563EB': 'Xanh VinFast Blue',
  '#FFD700': 'Vàng Hoàng Gia',
  '#008080': 'Xanh Mint Thời Thượng',
  '#808080': 'Xám Desat Silver',
  '#0047AB': 'Xanh Lục Bảo',
  '#FF0000': 'Đỏ Thể Thao',
  '#000000': 'Đen Sang Trọng',
  '#4682B4': 'Bạc Cao Cấp',
  '#800000': 'Đỏ Đô Luxury',
  '#000080': 'Xanh Hải Quân',
  '#2E8B57': 'Xanh Lục Đầm',
  '#FFFF00': 'Vàng Chanh',
};

const COLOR_TO_HEX_MAP: Record<string, string> = {
  'jet black': '#0F172A',
  'black': '#0F172A',
  'đen': '#0F172A',
  'đen nhám': '#0F172A',
  'đen bóng': '#000000',
  'white': '#FFFFFF',
  'trắng': '#FFFFFF',
  'trắng brahminy': '#FFFFFF',
  'trắng ngọc trai': '#F8FAFC',
  'silver': '#CBD5E1',
  'gray': '#64748B',
  'grey': '#64748B',
  'xám': '#64748B',
  'xám desat': '#64748B',
  'bạc': '#CBD5E1',
  'red': '#DC2626',
  'đỏ': '#DC2626',
  'đỏ crimson': '#DC2626',
  'đỏ tươi': '#EF4444',
  'blue': '#2563EB',
  'xanh': '#2563EB',
  'xanh vinfast': '#2563EB',
  'xanh dương': '#2563EB',
  'xanh oliu': '#2E8B57',
  'xanh ngọc': '#0EA5A6',
  'xanh rêu': '#6B7F4A',
  'xanh tím than': '#1E3A5F',
  'xanh lá': '#16A34A',
  'yellow': '#EAB308',
  'vàng': '#EAB308',
  'vàng cát': '#D4A72C',
  'nâu ánh kim': '#8B5E3C',
  'xám xi măng': '#94A3B8',
  'xám decal vàng': '#64748B',
  'cam': '#F97316',
};

function resolveCssColor(colorVal: any): { cssColor: string; cssImage?: string; name: string } {
  if (!colorVal) return { cssColor: '#E2E8F0', name: '' };
  let colorStr = typeof colorVal === 'string'
    ? colorVal
    : (colorVal.color_code || colorVal.code || colorVal.hex || colorVal.name || String(colorVal));
  const displayLabel = typeof colorVal === 'string'
    ? colorVal
    : (colorVal.name || colorVal.official_name || colorStr);
  colorStr = colorStr.trim();
  if (colorStr.startsWith('#') || colorStr.startsWith('rgb')) {
    return { cssColor: colorStr, name: colorNameMapping[colorStr.toUpperCase()] || colorStr };
  }
  const lower = colorStr.toLowerCase();

  // Stable motorbike codes keep fallback chips accurate when the source label
  // is incomplete or has suffered an encoding loss.
  if (lower === 'metallic-brown') return { cssColor: '#8B5E3C', name: colorStr };
  if (lower === 'gray-yellow-decal') {
    return {
      cssColor: '#94A3B8',
      cssImage: 'linear-gradient(135deg, #94A3B8 0 50%, #EAB308 50% 100%)',
      name: colorStr,
    };
  }
  if (lower === 'red-black') {
    return { cssColor: '#DC2626', cssImage: 'linear-gradient(135deg, #DC2626 0 50%, #0F172A 50% 100%)', name: colorStr };
  }
  if (lower === 'bright-red-matte-black') {
    return { cssColor: '#EF4444', cssImage: 'linear-gradient(135deg, #EF4444 0 50%, #334155 50% 100%)', name: colorStr };
  }
  if (lower === 'white-black') {
    return { cssColor: '#FFFFFF', cssImage: 'linear-gradient(135deg, #FFFFFF 0 50%, #0F172A 50% 100%)', name: colorStr };
  }
  if (lower === 'white-orange') {
    return { cssColor: '#FFFFFF', cssImage: 'linear-gradient(135deg, #FFFFFF 0 50%, #F97316 50% 100%)', name: colorStr };
  }
  if (lower === 'white-purple') {
    return { cssColor: '#FFFFFF', cssImage: 'linear-gradient(135deg, #FFFFFF 0 50%, #9333EA 50% 100%)', name: colorStr };
  }
  if (lower === 'sand-yellow') return { cssColor: '#D4A72C', name: colorStr };
  if (lower === 'yellow') return { cssColor: '#EAB308', name: colorStr };
  if (lower === 'milk-lavender') return { cssColor: '#C4B5FD', name: colorStr };
  if (lower === 'navy-blue') return { cssColor: '#1E3A5F', name: colorStr };
  if (lower === 'tropical-jade') return { cssColor: '#0EA5A6', name: colorStr };
  if (lower === 'cement-gray') return { cssColor: '#94A3B8', name: colorStr };

  // A two-tone motorbike gets a two-part swatch. The label/code remains one
  // stable value, so selecting it still maps to one catalog color entry.
  const twoToneParts = String(displayLabel).toLowerCase().split(/\s+-\s+|\s*\/\s*/).filter(Boolean);
  if (twoToneParts.length === 2) {
    const first = resolveCssColor(twoToneParts[0]).cssColor;
    const second = resolveCssColor(twoToneParts[1]).cssColor;
    return {
      cssColor: first,
      cssImage: `linear-gradient(135deg, ${first} 0 50%, ${second} 50% 100%)`,
      name: colorStr,
    };
  }

  for (const [key, hex] of Object.entries(COLOR_TO_HEX_MAP)) {
    if (lower === key || lower.includes(key)) {
      return { cssColor: hex, name: colorStr };
    }
  }
  if (lower.includes('den') || lower.includes('black')) return { cssColor: '#0F172A', name: colorStr };
  if (lower.includes('trang') || lower.includes('white')) return { cssColor: '#FFFFFF', name: colorStr };
  if (lower.includes('do') || lower.includes('red')) return { cssColor: '#DC2626', name: colorStr };
  if (lower.includes('xanh') || lower.includes('blue')) return { cssColor: '#2563EB', name: colorStr };
  if (lower.includes('xam') || lower.includes('bac') || lower.includes('gray') || lower.includes('silver')) return { cssColor: '#94A3B8', name: colorStr };
  return { cssColor: '#64748B', name: colorStr };
}

function parseAirbags(safety: any, isScooter: boolean, officialOnly = false): string {
  if (isScooter) return 'Không áp dụng (Xe máy điện)';
  if (!safety || typeof safety !== 'object') return officialOnly ? 'Chưa công bố' : 'Trang bị an toàn chuẩn VinFast';
  if (typeof safety.airbags === 'number') return `${safety.airbags} túi khí an toàn`;
  if (typeof safety.airbags === 'string') return `${safety.airbags}`;
  if (safety.side_airbags || safety.front_airbags) return 'Túi khí phía trước & bên hông';
  return officialOnly ? 'Chưa công bố' : 'Trang bị an toàn chuẩn VinFast';
}

function parseActiveSafety(safety: any, isScooter: boolean, officialOnly = false): string {
  if (isScooter) return 'Phanh đĩa an toàn, giảm chấn thủy lực';
  if (!safety || typeof safety !== 'object') return officialOnly ? 'Chưa công bố' : 'Hệ thống an toàn tiêu chuẩn';

  const items: string[] = [];
  if (safety.abs) items.push('ABS');
  if (safety.ebd) items.push('EBD');
  if (safety.ba) items.push('BA');
  if (safety.esc) items.push('ESC');
  if (safety.ess) items.push('ESS');
  if (safety.hsa) items.push('HSA (Khởi hành ngang dốc)');
  if (safety.tcs) items.push('TCS (Kiểm soát lực kéo)');
  if (safety.tpms) items.push('TPMS (Áp suất lốp)');
  if (safety.rom) items.push('ROM (Chống lật)');
  if (safety.isofix) items.push('ISOFIX ghế trẻ em');
  if (safety.anti_theft || safety.anti_theft_system) items.push('Hệ thống chống trộm');
  if (safety.automatic_door_lock || safety.automatic_door_lock_above_5_kmh) items.push('Khóa cửa tự động');

  if (items.length > 0) return items.join(', ');
  if (safety.other_features) return String(safety.other_features);

  return officialOnly ? 'Chưa công bố' : 'Trang bị an toàn tiêu chuẩn VinFast';
}

function parseAdasFeatures(adas: any, isScooter: boolean, officialOnly = false): string {
  if (isScooter) return 'Không áp dụng (xe máy điện)';
  if (!adas || typeof adas !== 'object') return officialOnly ? 'Chưa công bố' : 'Hệ thống hỗ trợ lái xe tiêu chuẩn';

  const items: string[] = [];
  if (adas.highway_assist) items.push('Hỗ trợ di chuyển trên cao tốc');
  if (adas.traffic_jam_assist) items.push('Hỗ trợ di chuyển khi ùn tắc');
  if (adas.lane_keep_assist || adas.emergency_lane_keep || adas.lane_assist) items.push('Giữ làn khẩn cấp');
  if (adas.lane_departure_warning) items.push('Cảnh báo chệch làn');
  if (adas.blind_spot_warning) items.push('Cảnh báo điểm mù');
  if (adas.rear_cross_traffic_alert) items.push('Cảnh báo phương tiện cắt ngang phía sau');
  if (adas.safe_exit_warning || adas.door_open_warning) items.push('Cảnh báo mở cửa an toàn');
  if (adas.surround_view_camera || adas.camera === 'Camera 360 độ') items.push('Camera 360° toàn cảnh');
  else if (adas.rear_camera) items.push('Camera lùi');

  if (adas.adaptive_cruise_control) items.push('Ga tự động thích ứng ACC');
  else if (adas.cruise_control || adas.basic_cruise_control) items.push('Ga tự động Cruise Control');

  if (adas.forward_collision_warning) items.push('Cảnh báo va chạm phía trước');
  if (adas.automatic_emergency_braking) items.push('Phanh khẩn cấp tự động AEB');
  if (adas.traffic_sign_recognition) items.push('Nhận diện biển báo giao thông');
  if (adas.driver_monitoring) items.push('Giám sát người lái');
  if (adas.front_rear_parking_sensors || adas.rear_parking_sensor || adas.parking_assist) items.push('Cảm biến đỗ xe');
  if (adas.hud) items.push('Màn hình HUD kính lái');
  if (adas.automatic_parking) items.push('Tự động đỗ xe');
  if (adas.vietnamese_voice_assistant || adas.voice_assistant) items.push('Trợ lý ảo ViVi AI');

  if (items.length > 0) return items.join(' • ');
  if (typeof adas.adas === 'string') return adas.adas;
  if (adas.other_features) return String(adas.other_features);

  return officialOnly ? 'Chưa công bố' : 'Trang bị hỗ trợ lái tiêu chuẩn VinFast';
}

function extractVehicleSpecs(vehicle: Vehicle) {
  const isScooter = vehicle.category === 'motorbike' || vehicle.category === 'scooter';
  const isCommercial = vehicle.category === 'commercial';
  const raw = vehicle.rawSpecs || {};
  const isLacHong900LX = !isScooter && /Lạc Hồng 900 LX/i.test(`${vehicle.name} ${raw.vehicle_line || ''}`);

  // Resolve legacy specifications container & merge properties at parent + nested levels
  const legacySource = raw._legacy_source?.specifications || raw.specs?._legacy_source?.specifications || raw.additional_specs?._legacy_source?.specifications || {};
  const legacyAdditional = legacySource.additional_specs || {};
  const directSpecs = raw.additional_specs || raw.specs || {};

  const legacySpecs: Record<string, any> = {
    ...legacySource,
    ...legacyAdditional,
    ...directSpecs,
  };

  // Colors array merge
  const vehicleColors: VehicleColor[] = isEBus(vehicle) ? [] : parseVehicleColors(vehicle.colors, vehicle);

  // 1. Engine & Power
  const powerKw = raw.maximum_power_kw ?? legacySpecs.motor_power_kw;
  const powerHp = legacySpecs.motor_power_hp ?? (powerKw ? Math.round(powerKw * 1.34) : null);
  const powerW = raw.maximum_power_w ?? legacySpecs.maximum_power_w ?? legacySpecs.power_w;

  let powerDisplay = isLacHong900LX ? 'Chưa công bố' : 'Theo tiêu chuẩn nhà sản xuất';
  if (isScooter) {
    if (powerW) powerDisplay = `${powerW} W`;
    else if (powerKw) powerDisplay = `${powerKw * 1000} W`;
  } else {
    if (powerHp && powerKw) powerDisplay = isLacHong900LX ? `${powerHp} HP` : `${powerHp} HP (${powerKw} kW)`;
    else if (powerKw) powerDisplay = `${powerKw} kW`;
    else if (powerHp) powerDisplay = `${powerHp} HP`;
  }

  // 2. Torque & Speed
  const torqueVal = raw.maximum_torque_nm ?? legacySpecs.motor_torque_nm;
  const torqueNm = torqueVal ? `${torqueVal} Nm` : (isScooter ? 'Động cơ In-Hub' : 'Chưa công bố');

  const topSpeedVal = raw.maximum_speed_kmh ?? legacySpecs.maximum_speed_kmh ?? vehicle.topSpeed;
  const topSpeedKmh = topSpeedVal ? `${topSpeedVal} km/h` : 'Chưa công bố';

  const accel0100Val = legacySpecs.acceleration_0_100_seconds ?? raw.acceleration_0_100_seconds;
  const accel050Val = legacySpecs.acceleration_0_50_seconds ?? raw.acceleration_0_50_seconds;
  const accelDisplayVal = accel0100Val ?? accel050Val;
  const accelDisplayLabel = accel0100Val !== undefined ? '0-100 km/h' : '0-50 km/h';
  const accel050 = accelDisplayVal ? `${accelDisplayVal} giây (${accelDisplayLabel})` : 'Chưa công bố';

  // 3. Drivetrain & Engine Type
  const drivetrain = legacySpecs.drivetrain || raw.drivetrain || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Động cơ bánh sau In-Hub' : 'Cầu trước FWD'));
  const engineType = legacySpecs.engine_type || raw.motor_type || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Động cơ điện In-Hub nam châm vĩnh cửu' : 'Động cơ điện PMSM'));

  // 4. Battery & Range & Charging
  const batteryCapKwh = raw.usable_battery_capacity ?? raw.battery_capacity_kwh ?? legacySpecs.battery_capacity_kwh;
  const batteryType = raw.battery_type || legacySpecs.battery_type || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Pin Lithium-ion LFP' : 'Pin LFP cao cấp'));
  const batteryCapacityStatus = legacySpecs.battery_capacity_status ?? raw.battery_capacity_status;
  const batteryCapDisplay = batteryCapKwh
    ? `${batteryCapKwh} kWh (${batteryType})`
    : (isLacHong900LX && batteryCapacityStatus
      ? batteryCapacityStatus.replace(/\s*\([^)]*\)\s*$/, '')
      : (batteryCapacityStatus || batteryType));

  const rangeKmVal = raw.range_km ?? legacySpecs.range_km ?? vehicle.range;
  const rangeKm = rangeKmVal && Number(rangeKmVal) > 0 ? `${rangeKmVal} km` : 'Chưa công bố';

  const chargingText = legacySpecs.charging_info_text || raw.charging_info_text || (
    isLacHong900LX
      ? 'Chưa công bố'
      : (isScooter
        ? `Sạc đầy từ 0% đến 100% trong khoảng ${raw.charging_time_minutes || 360} phút.`
        : 'Sạc nhanh DC tại các trạm sạc VinFast trên toàn quốc.')
  );
  const standardCharger = legacySpecs.standard_charger ?? raw.standard_charger ?? (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Bộ sạc tiêu chuẩn đi kèm xe' : 'Sạc AC cầm tay / Sạc trạm DC'));
  const regenBraking = legacySpecs.regenerative_braking ?? raw.regenerative_braking ?? (isLacHong900LX ? 'Chưa công bố' : 'Có (Phanh tái sinh năng lượng)');

  // Scooter Battery Features
  const removableBattery = legacySpecs.removable_battery ?? raw.removable_battery;
  const removableBatteryText = removableBattery === true ? 'Có (Pin tháo rời dễ dàng)' : (removableBattery === false ? 'Không (Pin gắn cố định)' : (isScooter ? 'Pin cố định theo xe' : 'Không áp dụng'));
  const batterySwapSupported = legacySpecs.battery_swap_supported ?? raw.battery_swap_supported;
  const batterySwapText = batterySwapSupported === true ? 'Có hỗ trợ đổi pin tại trạm' : (batterySwapSupported === false ? 'Không hỗ trợ đổi pin' : (isScooter ? 'Sạc trực tiếp tại nhà / trạm' : 'Không áp dụng'));
  const batteryLocation = legacySpecs.battery_location ?? raw.battery_location ?? (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Dưới sàn để chân / Cốp xe' : 'Dưới sàn xe (Floorboard)'));
  const waterResistance = legacySpecs.water_resistance_standard ?? raw.water_resistance_standard ?? (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'IP67 (Chống nước ngập 0.5m trong 30 phút)' : 'Chuẩn chống nước pin IP67'));
  const licenseRequirement = legacySpecs.license_requirement ?? raw.license_requirement ?? (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Bằng lái A1 / A2' : 'Bằng lái B1 / B2'));

  // 5. Dimensions & Weight
  const lengthMm = raw.length_mm ?? legacySpecs.length_mm;
  const widthMm = raw.width_mm ?? legacySpecs.width_mm;
  const heightMm = raw.height_mm ?? legacySpecs.height_mm;
  const dimensionsStr = (lengthMm && widthMm && heightMm)
    ? `${lengthMm} x ${widthMm} x ${heightMm} mm`
    : (isLacHong900LX && (lengthMm || widthMm || heightMm)
      ? `Dài: ${lengthMm ? `${lengthMm} mm` : 'Chưa công bố'} • Rộng: ${widthMm ? `${widthMm} mm` : 'Chưa công bố'} • Cao: ${heightMm ? `${heightMm} mm` : 'Chưa công bố'}`
      : (isScooter ? 'Kích thước chuẩn scooter đô thị' : 'Chưa công bố'));

  const wheelbaseVal = raw.wheelbase_mm ?? legacySpecs.wheelbase_mm;
  const wheelbaseMm = wheelbaseVal ? `${wheelbaseVal} mm` : (isScooter ? 'Tiêu chuẩn scooter' : 'Chưa công bố');

  const groundClearanceVal = legacySpecs.ground_clearance_mm ?? raw.ground_clearance_mm;
  const groundClearanceMm = groundClearanceVal ? `${groundClearanceVal} mm` : (isScooter ? 'Gầm xe thoáng' : 'Chưa công bố');

  const weightVal = raw.weight_kg ?? legacySpecs.curb_weight_kg ?? legacySpecs.weight_kg;
  const curbWeightKg = weightVal ? `${weightVal} kg` : 'Chưa công bố';

  const seatsVal = raw.seat_count ?? legacySpecs.seat_count ?? vehicle.seats;
  const seats = seatsVal && Number(seatsVal) > 0 ? `${seatsVal} chỗ` : 'Chưa công bố';

  const cargoLiters = legacySpecs.cargo_capacity_liters ?? raw.cargo_capacity_liters;
  const cargoFoldedLiters = legacySpecs.cargo_capacity_folded_liters ?? raw.cargo_capacity_folded_liters;
  const underseatStorage = legacySpecs.underseat_storage_liters ?? raw.underseat_storage_liters;

  let trunkCapacityText = 'Chưa công bố';
  if (isScooter) {
    trunkCapacityText = underseatStorage ? `${underseatStorage} lít (Chứa vừa 2 nón bảo hiểm)` : 'Cốp rộng rãi dưới yên';
  } else {
    if (cargoLiters && cargoFoldedLiters) {
      trunkCapacityText = `${cargoLiters} lít (Gập ghế: ${cargoFoldedLiters} lít)`;
    } else if (cargoLiters) {
      trunkCapacityText = `${cargoLiters} lít`;
    } else {
      trunkCapacityText = isLacHong900LX ? 'Chưa công bố' : 'Cốp rộng rãi theo phân khúc';
    }
  }

  const turningDiameterVal = legacySpecs.turning_radius_m ?? raw.turning_radius_m ?? legacySpecs.turning_diameter_m ?? raw.turning_diameter_m;
  const turningDiameter = turningDiameterVal ? `${turningDiameterVal} m` : (isScooter ? 'Linh hoạt đô thị' : 'Chưa công bố');

  // 6. Chassis, Brakes & Wheels
  const frontBrake = legacySpecs.front_brake || raw.front_brake || (isLacHong900LX ? 'Chưa công bố' : 'Phanh đĩa');
  const rearBrake = legacySpecs.rear_brake || raw.rear_brake || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Phanh cơ' : 'Phanh đĩa'));
  const brakesDisplay = `${frontBrake} (Trước) / ${rearBrake} (Sau)`;

  const frontSuspension = legacySpecs.front_suspension || raw.front_suspension || (isLacHong900LX ? 'Chưa công bố' : 'Độc lập, kiểu MacPherson');
  const rearSuspension = legacySpecs.rear_suspension || raw.rear_suspension || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Giảm xóc đôi, giảm chấn thủy lực' : 'Dầm xoắn / Đa liên kết'));

  const tiresWheels = legacySpecs.tires_wheels || (
    (raw.front_tire || legacySpecs.front_tire)
      ? `Trước: ${raw.front_tire || legacySpecs.front_tire}, Sau: ${raw.rear_tire || legacySpecs.rear_tire}`
      : (isLacHong900LX ? 'Chưa công bố' : 'Vành mâm tiêu chuẩn VinFast')
  );

  // 7. Exterior Features
  const exterior = legacySpecs.exterior_features || raw.exterior_features || {};
  const headlights = exterior.headlights || exterior.headlight || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Đèn pha Full LED' : 'Đèn pha LED tự động bật/tắt'));
  const taillights = exterior.taillights || exterior.taillight || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Đèn hậu LED' : 'Dải đèn LED cánh chim VinFast'));
  const rearviewMirror = exterior.rearview_mirror || exterior.mirrors || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Gương chiếu hậu đôi' : 'Gương chiếu hậu chỉnh/gập điện, tích hợp đèn báo rẽ'));
  const daytimeRunningLights = exterior.daytime_running_lights || exterior.drl || (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Đèn xi-nhan LED' : 'Đèn LED chiếu sáng ban ngày'));

  const lightingFeatures = legacySpecs.lighting_features || raw.lighting_features || {};
  const scooterHeadlight = lightingFeatures.headlight || lightingFeatures.front_light || headlights;
  const scooterTaillight = lightingFeatures.taillight || lightingFeatures.rear_light || taillights;
  const scooterTurnSignals = lightingFeatures.turn_signals || 'Đèn xi-nhan LED cao cấp';

  // 8. Interior & Technology
  const interior = legacySpecs.interior_features || legacySpecs.technology_features || raw.technology_features || {};
  const screenInches = interior.central_screen_inches
    ? `${interior.central_screen_inches} inch`
    : (interior.display ? `Màn hình ${interior.display}` : (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Màn hình LED Color' : 'Màn hình cảm ứng trung tâm')));

  const speakers = typeof interior.audio_speakers === 'number'
    ? `${interior.audio_speakers} loa`
    : (interior.audio ? String(interior.audio) : (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Còi xe điện' : 'Hệ thống âm thanh tiêu chuẩn')));

  const driverSeat = interior.driver_seat
    ? `${interior.driver_seat}`
    : (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Yên xe bọc da cao cấp' : 'Ghế bọc da / nỉ'));

  const seatMaterial = interior.seat_material
    ? `${interior.seat_material}`
    : (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Da tổng hợp chống nước' : 'Da cao cấp'));

  const airConditioning = interior.air_conditioning
    ? `${interior.air_conditioning}`
    : (isLacHong900LX ? 'Chưa công bố' : (isScooter ? 'Khác (Không áp dụng)' : 'Điều hòa cabin tự động'));

  // Chỉ hiển thị các tính năng có cấu trúc trong catalog; không tự gán mặc định theo loại xe.
  const smartTechItems = getSmartFeatureItems(raw);

  // 9. Safety & ADAS
  const safety = legacySpecs.safety_features || raw.safety_features || {};
  const adas = legacySpecs.driver_assistance_features || raw.technology_features || {};

  const airbagsDisplay = parseAirbags(safety, isScooter, isLacHong900LX);
  const activeSafetyDisplay = parseActiveSafety(safety, isScooter, isLacHong900LX);
  const adasDisplay = parseAdasFeatures(adas, isScooter, isLacHong900LX);

  const warrantyText = legacySpecs.warranty_text || raw.warranty_text || (
    isScooter
      ? 'Bảo hành xe 6 năm, không giới hạn quãng đường.'
      : (isLacHong900LX ? 'Chưa công bố' : 'Bảo hành chính hãng 7 - 10 năm hoặc 160.000 - 200.000 km.')
  );

  return {
    isScooter,
    isCommercial,
    vehicleColors,
    powerDisplay,
    torqueNm,
    topSpeedKmh,
    accel050,
    drivetrain,
    engineType,
    batteryCapDisplay,
    rangeKm,
    chargingText,
    standardCharger,
    regenBraking,
    removableBatteryText,
    batterySwapText,
    batteryLocation,
    waterResistance,
    licenseRequirement,
    dimensionsStr,
    wheelbaseMm,
    groundClearanceMm,
    curbWeightKg,
    seats,
    trunkCapacityText,
    turningDiameter,
    brakesDisplay,
    frontSuspension,
    rearSuspension,
    tiresWheels,
    headlights,
    taillights,
    rearviewMirror,
    daytimeRunningLights,
    scooterHeadlight,
    scooterTaillight,
    scooterTurnSignals,
    screenInches,
    speakers,
    driverSeat,
    seatMaterial,
    airConditioning,
    smartTechItems,
    airbagsDisplay,
    activeSafetyDisplay,
    adasDisplay,
    warrantyText,
    descriptionText: legacySpecs.description_text || raw.description_text || vehicle.description || vehicle.tagline,
  };
}

export default function VehicleDetailModal({
  vehicle: initialVehicle,
  allVehicles = [],
  open,
  onClose,
  onRequestQuote,
  onOpenChat,
  onOpenTestDrive,
}: VehicleDetailModalProps) {
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(initialVehicle);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'engine' | 'dimensions' | 'interior' | 'exterior' | 'safety'>('engine');

  useEffect(() => {
    setCurrentVehicle(initialVehicle);
    if (initialVehicle) {
      const colors = isEBus(initialVehicle) ? [] : parseVehicleColors(initialVehicle.colors, initialVehicle);
      if (colors.length > 0) {
        const firstCol = colors[0];
        setSelectedColor(firstCol.color_code);
      }
    }
  }, [initialVehicle]);

  if (!open || !currentVehicle) return null;

  // Extract model family e.g. "VF 8", "VF 9", "VF 7", "Amio", "Evo"
  const getModelFamilyKey = (v: Vehicle) => {
    const normalizeFamilyText = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd');
    const normalizedIdentity = normalizeFamilyText(`${v.name} ${v.rawSpecs?.vehicle_line || ''}`);
    if (/lac hong/i.test(normalizedIdentity)) {
      return normalizeFamilyText(v.name)
        .replace(/^VinFast\s+/i, '')
        .trim()
        .toUpperCase()
        .replace(/\s+(TIEU CHUAN|CHONG DAN)$/i, '');
    }
    if (v.code && v.code.trim()) return v.code.trim().toUpperCase();
    const match = v.name.match(/VF\s*(MPV\s*)?\d+/i);
    return match ? match[0].toUpperCase() : v.name;
  };

  const familyKey = getModelFamilyKey(currentVehicle);
  const sisterVariants = allVehicles.filter(
    (v) => getModelFamilyKey(v) === familyKey
  );

  const specs = extractVehicleSpecs(currentVehicle);
  const centerColorSelector = specs.vehicleColors.length <= 6;
  const displayName = getVehicleDisplayName(currentVehicle.name, currentVehicle.code);
  const selectedColorData = specs.vehicleColors.find((color) => color.color_code === selectedColor);
  const selectedColorImage = selectedColorData
    ? getVehicleColorImage(currentVehicle, selectedColorData)
    : null;

  const formatVND = (price: number) => {
    return formatVNDPrice(price);
  };

  const categoryLabel = specs.isScooter
    ? 'Xe máy điện'
    : currentVehicle.category === 'commercial'
      ? 'Xe dịch vụ & Thương mại'
      : 'Ô tô điện cá nhân';

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-slate-900/40 backdrop-blur-md flex flex-col overflow-hidden font-sans animate-fadeIn">

      {/* HEADER BAR */}
      <div className="bg-slate-950 text-white px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-extrabold transition-all border border-white/15 shadow-sm active:scale-95"
            title="Quay lại danh mục xe"
          >
            <ArrowRight size={18} className="rotate-180" />
            <span>Quay lại</span>
          </button>

          <div className="h-6 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 border border-blue-400/40 rounded-xl text-blue-400 hidden sm:block">
              <Zap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-2xl font-black text-white tracking-tight">{displayName}</h2>
                <span className="text-[10px] font-extrabold uppercase bg-blue-600 text-white px-2.5 py-0.5 rounded-md shadow-sm">
                  {categoryLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 hidden sm:block">{currentVehicle.tagline}</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shadow-sm hover:rotate-90"
          title="Đóng chi tiết"
        >
          <X size={22} />
        </button>
      </div>

      {/* TRIM / VARIANT SWITCHER BAR */}
      {sisterVariants.length > 1 && (
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 text-white px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-xs font-extrabold text-blue-300 uppercase tracking-wider">
            <Sliders size={15} className="text-blue-400" />
            <span>Các phiên bản {familyKey}:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(sisterVariants || []).map((v) => {
              const isSelected = v.id === currentVehicle.id;
              const variantLabel = v.rawSpecs?.version
                || v.name.replace(`VinFast ${familyKey}`, '').trim()
                || v.name;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setCurrentVehicle(v);
                    const vSpecs = extractVehicleSpecs(v);
                    if (vSpecs.vehicleColors && vSpecs.vehicleColors.length > 0) {
                      const col = vSpecs.vehicleColors[0];
                      setSelectedColor(col.color_code);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${isSelected
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300 scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                    }`}
                >
                  <span>{variantLabel}</span>
                  <span className="text-[10px] opacity-80">({formatVNDPrice(v.basePrice)})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-100">

        {/* TOP PANEL: IMAGE SHOWCASE + PRICING & BUY CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left: Interactive Image Showcase & Color Swatches (7 Columns) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between space-y-5">
            <div className="relative aspect-video bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-white group p-3">
              <img
                src={getImageUrl(selectedColorImage || currentVehicle.image)}
                alt={displayName}
                className="w-full h-full object-contain transition-all duration-700 group-hover:scale-105"
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="px-3 py-1 bg-emerald-500 text-white text-[11px] font-extrabold rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles size={12} /> MỚI 2026
                </span>
                {!specs.isScooter && (
                  <span className="px-3 py-1 bg-amber-500 text-white text-[11px] font-extrabold rounded-full shadow-sm flex items-center gap-1">
                    <Award size={12} /> CHUẨN 5 SAO AN TOÀN
                  </span>
                )}
                {specs.isScooter && (
                  <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-extrabold rounded-full shadow-sm flex items-center gap-1">
                    <Shield size={12} /> CHỐNG NƯỚC IP67
                  </span>
                )}
              </div>
            </div>

            {/* Color Swatch Selector (Strictly 1 Single Row) */}
            {specs.vehicleColors.length > 0 && (
              <div className={`${centerColorSelector ? 'grid grid-cols-[max-content_minmax(0,1fr)]' : 'flex justify-between'} items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 overflow-hidden`}>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Compass size={15} className="text-blue-600 shrink-0" />
                  Màu ngoại thất ({specs.vehicleColors.length}):
                </span>
                <div className={`flex items-center gap-2 flex-nowrap overflow-x-auto py-0.5 scrollbar-none ${centerColorSelector ? 'min-w-0 justify-center' : 'shrink'}`}>
                  {specs.vehicleColors.map((c, idx) => {
                    const colorStr = c.color_code;
                    const { cssColor, cssImage } = resolveVehicleColorSwatch(c, currentVehicle);
                    return (
                      <button
                        key={colorStr + idx}
                        onClick={() => setSelectedColor(colorStr)}
                        className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0 ${selectedColor === colorStr
                            ? 'bg-blue-900 text-white border-blue-900 ring-2 ring-blue-300 scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                          }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                          style={{
                            backgroundColor: cssColor,
                            backgroundImage: c.image_url
                              ? `url(${getImageUrl(c.image_url)})`
                              : cssImage,
                            backgroundPosition: 'center',
                            // Crop the white frame baked into the official swatch image.
                            backgroundSize: c.image_url ? '135% 135%' : undefined,
                            backgroundRepeat: 'no-repeat',
                          }}
                        />
                        <span>{c.name}</span>
                        {c.official_name && <span className="sr-only">{c.official_name}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Key Specs Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 bg-blue-50/80 border border-blue-200/70 rounded-2xl">
                <span className="block text-[10px] text-blue-600 font-bold uppercase tracking-wider">Quãng đường</span>
                <strong className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">{specs.rangeKm}</strong>
                <span className="text-[10px] text-slate-500 font-medium">Sau 1 lần sạc</span>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200/70 rounded-2xl">
                <span className="block text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Công suất</span>
                <strong className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">{specs.powerDisplay}</strong>
                <span className="text-[10px] text-slate-500 font-medium">Tối đa</span>
              </div>

              <div className="p-3 bg-violet-50/80 border border-violet-200/70 rounded-2xl">
                <span className="block text-[10px] text-violet-600 font-bold uppercase tracking-wider">
                  {specs.isScooter ? 'Vận tốc tối đa' : 'Số chỗ ngồi'}
                </span>
                <strong className="text-sm sm:text-base font-black text-slate-900 mt-0.5 block">
                  {specs.isScooter ? specs.topSpeedKmh : specs.seats}
                </strong>
                <span className="text-[10px] text-slate-500 font-medium">{specs.isScooter ? 'Tối đa' : 'Thiết kế cao cấp'}</span>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-2xl">
                <span className="block text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                  {specs.isScooter ? 'Loại Động cơ' : 'Hệ dẫn động'}
                </span>
                <strong className="text-[11px] sm:text-xs font-black text-slate-900 mt-0.5 block leading-snug whitespace-normal break-words">
                  {specs.drivetrain}
                </strong>
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight whitespace-normal break-words">{specs.engineType}</span>
              </div>
            </div>
          </div>

          {/* Right: Price Card & Direct Action Triggers (5 Columns) */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between space-y-5">
            <div>
              <div className="text-xs font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Activity size={15} /> BẢNG GIÁ & THÔNG TIN DÒNG XE
              </div>

              {/* Main Price Tag */}
              <div className="bg-gradient-to-br from-red-500 to-red-700 text-white p-5 sm:p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap size={120} />
                </div>
                <span className="text-xs text-red-100 font-extrabold uppercase tracking-wide block">Giá xe niêm yết</span>
                <div className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                  {formatVND(currentVehicle.basePrice)}
                </div>
                <p className="text-[11px] text-red-100 mt-1">Hỗ trợ trả góp lãi suất ưu đãi. Miễn phí sạc pin 1 năm tại trạm sạc VinFast.</p>
              </div>

              {/* Description & Highlights */}
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  {specs.descriptionText}
                </p>

                <div>
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">Điểm nổi bật chuẩn VinFast:</span>
                  <ul className="space-y-2 text-xs text-slate-700 font-medium">
                    {currentVehicle.highlights?.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  onClose();
                  onRequestQuote(currentVehicle);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-xl active:scale-[0.98]"
              >
                <FileText size={18} />
                <span>Yêu cầu báo giá lăn bánh ngay</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat?.();
                  }}
                  className="py-3 px-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
                >
                  <MessageSquare size={16} className="text-blue-400" />
                  <span>Chat với nhân viên</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenTestDrive?.(currentVehicle);
                  }}
                  className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Calendar size={16} />
                  <span>Đặt lịch lái thử</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM PANEL: DETAILED SPECIFICATIONS MATRIX TAB SYSTEM */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Cpu className="text-blue-600" size={20} />
                Thông số Kỹ thuật Chi tiết: {currentVehicle.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Dữ liệu thông số kỹ thuật chuẩn công bố chính thức bởi VinFast Auto</p>
            </div>

            {/* Spec Matrix Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
              {[
                { id: 'engine', label: '⚡ Động cơ & Pin' },
                { id: 'dimensions', label: '📏 Kích thước & Khung gầm' },
                { id: 'interior', label: '🛋️ Nội thất & Tiện nghi' },
                { id: 'exterior', label: '🚗 Ngoại thất & Khác' },
                { id: 'safety', label: '🛡️ An toàn & Bảo hành' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-blue-900 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENTS MATRIX */}
          <div className="text-xs">

            {/* TAB 1: ENGINE & BATTERY */}
            {activeTab === 'engine' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Loại Động cơ</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.engineType}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Công suất tối đa</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.powerDisplay}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">
                    {specs.isScooter ? 'Vận tốc tối đa' : 'Mô-men xoắn cực đại'}
                  </span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">
                    {specs.isScooter ? specs.topSpeedKmh : specs.torqueNm}
                  </strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Hệ dẫn động</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.drivetrain}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Dung lượng & Loại Pin</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">
                    {specs.batteryCapDisplay}
                  </strong>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                  <span className="text-blue-600 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Quãng đường max/sạc</span>
                  <strong className="text-blue-900 font-black text-sm sm:text-base block">{specs.rangeKm}</strong>
                </div>

                {/* Additional Engine & Battery Specs */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Thời gian tăng tốc</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.accel050}</strong>
                </div>

                {specs.isScooter ? (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Pin tháo rời</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.removableBatteryText}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Hỗ trợ đổi pin</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.batterySwapText}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Vị trí đặt pin</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.batteryLocation}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Phanh tái sinh năng lượng</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.regenBraking}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Sạc tiêu chuẩn</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.standardCharger}</strong>
                    </div>
                  </>
                )}

                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 sm:col-span-2 lg:col-span-3">
                  <span className="text-emerald-700 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Thông tin sạc pin</span>
                  <strong className="text-emerald-950 font-extrabold text-xs sm:text-sm block leading-relaxed">{specs.chargingText}</strong>
                </div>
              </div>
            )}

            {/* TAB 2: DIMENSIONS & CHASSIS */}
            {activeTab === 'dimensions' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Kích thước D x R x C</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.dimensionsStr}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Chiều dài cơ sở</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.wheelbaseMm}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Khoảng sáng gầm xe</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.groundClearanceMm}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Trọng lượng xe / Tải trọng</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.curbWeightKg}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Số chỗ ngồi</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.seats}</strong>
                </div>

                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/80">
                  <span className="text-blue-600 block font-extrabold text-[10px] uppercase tracking-wider mb-1">
                    {specs.isScooter ? 'Thể tích cốp dưới yên' : 'Dung tích khoang hành lý (Cốp)'}
                  </span>
                  <strong className="text-blue-900 font-black text-xs sm:text-sm block">{specs.trunkCapacityText}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Bán kính quay vòng</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.turningDiameter}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Hệ thống phanh</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.brakesDisplay}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2 lg:col-span-3">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">La-zăng & Lốp xe</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.tiresWheels}</strong>
                </div>
              </div>
            )}

            {/* TAB 3: INTERIOR & COMFORT */}
            {activeTab === 'interior' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Màn hình hiển thị / Cảm ứng</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.screenInches}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Hệ thống Âm thanh / Còi</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.speakers}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Ghế lái & Chất liệu</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">
                    {specs.driverSeat} ({specs.seatMaterial})
                  </strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2 lg:col-span-3">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Trợ lý ảo & Tiện ích thông minh</span>
                  {specs.smartTechItems.length > 0 ? (
                    <ul className="space-y-1.5 text-blue-900 text-xs sm:text-sm leading-relaxed">
                      {specs.smartTechItems.map((item) => (
                        <li key={item.key} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" aria-hidden="true" />
                          <span>
                            {item.label}
                            {item.status === 'optional' ? ' (Tùy chọn)' : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-500 text-xs sm:text-sm">Không có</span>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: EXTERIOR & FEATURES (NEW TAB) */}
            {activeTab === 'exterior' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {specs.isScooter ? (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Đèn pha chiếu sáng</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.scooterHeadlight}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Đèn hậu LED</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.scooterTaillight}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Đèn xi-nhan</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.scooterTurnSignals}</strong>
                    </div>

                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/80">
                      <span className="text-blue-600 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Tiêu chuẩn chống nước</span>
                      <strong className="text-blue-950 font-black text-xs sm:text-sm block">{specs.waterResistance}</strong>
                    </div>

                    <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80">
                      <span className="text-amber-700 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Yêu cầu bằng lái</span>
                      <strong className="text-amber-950 font-black text-xs sm:text-sm block">{specs.licenseRequirement}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Đèn pha chiếu sáng</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.headlights}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Đèn hậu nhận diện</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.taillights}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Đèn chiếu sáng ban ngày DRL</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.daytimeRunningLights}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 sm:col-span-2">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Gương chiếu hậu</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.rearviewMirror}</strong>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Sạc tiêu chuẩn đi kèm</span>
                      <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block">{specs.standardCharger}</strong>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 5: SAFETY & WARRANTY */}
            {activeTab === 'safety' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Túi khí an toàn</span>
                  <strong className="text-emerald-700 font-extrabold text-xs sm:text-sm block">{specs.airbagsDisplay}</strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Hệ thống an toàn chủ động</span>
                  <strong className="text-slate-900 font-extrabold text-xs sm:text-sm block leading-normal">
                    {specs.activeSafetyDisplay}
                  </strong>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-slate-400 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Trợ lái ADAS thông minh</span>
                  <strong className="text-blue-700 font-extrabold text-xs sm:text-sm block leading-normal">
                    {specs.adasDisplay}
                  </strong>
                </div>

                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 sm:col-span-2 lg:col-span-3">
                  <span className="text-emerald-700 block font-extrabold text-[10px] uppercase tracking-wider mb-1">Chính sách Bảo hành VinFast</span>
                  <strong className="text-emerald-950 font-extrabold text-xs sm:text-sm block leading-relaxed">
                    {specs.warrantyText}
                  </strong>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
