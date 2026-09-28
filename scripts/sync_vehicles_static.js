const fs = require('fs');
const path = require('path');

async function sync() {
  try {
    const carsRes = await fetch('http://127.0.0.1:8000/api/cars');
    const dbCars = await carsRes.json();

    const scootersRes = await fetch('http://127.0.0.1:8000/api/motorbikes');
    const dbScooters = await scootersRes.json();

    console.log(`Fetched ${dbCars.length} cars and ${dbScooters.length} scooters from backend.`);

    function parseVehicleCategory(item) {
      if (!item) return 'suv';
      const catLower = (item.category || '').toLowerCase();
      const nameLower = (item.name || item.model_name || '').toLowerCase();
      const codeLower = (item.code || item.vehicle_line || '').toLowerCase();

      if (
        catLower.includes('scooter') ||
        catLower.includes('motorbike') ||
        catLower.includes('xe_may') ||
        catLower.includes('xemay')
      ) {
        return 'scooter';
      }

      if (
        catLower.includes('commercial') ||
        catLower.includes('dich_vu') ||
        catLower.includes('dichvu') ||
        catLower.includes('thuong_mai') ||
        nameLower.includes('ebus') ||
        nameLower.includes('limo') ||
        nameLower.includes('nerio') ||
        nameLower.includes('herio') ||
        nameLower.includes('minio') ||
        nameLower.includes('van') ||
        codeLower.includes('ebus') ||
        codeLower.includes('limo') ||
        codeLower.includes('nerio') ||
        codeLower.includes('herio') ||
        codeLower.includes('minio') ||
        codeLower.includes('van')
      ) {
        return 'commercial';
      }

      return 'suv';
    }

    function getImageUrl(url) {
      if (!url) return '/VINpng/AdsCars/vf8-4k.png';
      return url;
    }

    const validCars = Array.isArray(dbCars) ? dbCars : [];
    const validScooters = Array.isArray(dbScooters) ? dbScooters : [];

    const carList = validCars.map((c) => {
      if (!c || typeof c !== 'object') return null;
      const legacySpecs = c.additional_specs?._legacy_source?.specifications?.additional_specs || c.additional_specs || c.specs || {};
      const powerKw = c.maximum_power_kw || legacySpecs.motor_power_kw;
      const powerHp = legacySpecs.motor_power_hp || (powerKw ? Math.round(powerKw * 1.34) : null);
      const torqueNm = c.maximum_torque_nm || legacySpecs.motor_torque_nm;

      const legacySource = c._legacy_source?.specifications?.additional_specs || c.additional_specs?._legacy_source?.specifications?.additional_specs || {};
      const rawColors = c.colors || c.additional_specs?.colors || legacySpecs.colors || legacySource.colors || [];
      const colorsList = Array.isArray(rawColors)
        ? rawColors.map((col) => typeof col === 'string' ? col : (col.name || col.code || String(col)))
        : [];

      return {
        id: c.id || c.car_id || 'unknown_car',
        code: c.code || c.vehicle_line || 'VF',
        name: c.name || c.model_name || 'Xe điện VinFast',
        tagline: c.description || legacySpecs.description_text || 'Mẫu ô tô điện thông minh VinFast',
        category: parseVehicleCategory(c),
        image: getImageUrl(c.image_url),
        basePrice: c.base_price || c.list_price || 0,
        batteryBuyPrice: c.battery_buy_price,
        batteryRentMonthly: c.battery_rent_monthly,
        range: c.range_km || legacySpecs.range_km || 400,
        battery: c.usable_battery_capacity ? `${c.usable_battery_capacity} kWh` : (legacySpecs.battery_type || 'Pin LFP cao cấp'),
        acceleration: legacySpecs.acceleration_0_50_seconds && legacySpecs.acceleration_0_50_seconds !== 'chưa công bố'
          ? `${legacySpecs.acceleration_0_50_seconds}s (0-50 km/h)`
          : (powerHp ? `${powerHp} HP / ${torqueNm || 300} Nm` : 'Tăng tốc mượt mà'),
        topSpeed: legacySpecs.maximum_speed_kmh || c.maximum_speed_kmh || 150,
        seats: c.seat_count || legacySpecs.seat_count || 5,
        isNew: true,
        colors: colorsList,
        description: c.description || legacySpecs.description_text || '',
        highlights: legacySpecs.highlights || [
          'Công nghệ VinFast tiên phong',
          'Sạc siêu nhanh DC',
          'Bảo hành chính hãng 7-10 năm'
        ],
        rawSpecs: c,
      };
    }).filter(Boolean);

    const scooterList = validScooters.map((s) => {
      if (!s || typeof s !== 'object') return null;
      const specsObj = s.specs || s.additional_specs || {};
      const legacySource = s._legacy_source?.specifications?.additional_specs || s.additional_specs?._legacy_source?.specifications?.additional_specs || {};
      const rawColors = s.colors || specsObj.colors || s.additional_specs?.colors || legacySource.colors || [];
      const colorsList = Array.isArray(rawColors)
        ? rawColors.map((col) => typeof col === 'string' ? col : (col.name || col.code || String(col)))
        : [];

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
        highlights: [
          `Công suất tối đa: ${powerW}W`,
          'Kháng nước IP67 (0.5m trong 30p)',
          'Pin LFP tuổi thọ cao',
        ],
        rawSpecs: s,
      };
    }).filter(Boolean);

    const allVehicles = [...carList, ...scooterList];

    const fileContent = `import type { Vehicle } from '@/types';
import { getCloudAssetUrl } from '@/lib/cloudAssets';

export const vehicles: Vehicle[] = ${JSON.stringify(allVehicles, null, 2)};

export const heroSlides = [
  {
    vehicleId: 'vf9',
    modelName: 'VF 9',
    title: 'Lựa Chọn Hạng Thương Gia Đỉnh Cao',
    subtitle: 'Mẫu SUV điện 7 chỗ Flagship thượng lưu, sở hữu trần kính toàn cảnh, ghế thương gia massage & tầm xa di chuyển tới 602 km.',
    imageFallback: '/VINpng/AdsCars/vf9-4k.png',
    badge: 'FLAGSHIP SUV 7 CHỖ',
    stats: [
      { value: '602 km', label: 'Tầm hoạt động' },
      { value: '402 HP', label: 'Công suất cực đại' },
      { value: '6.5s', label: '0-100 km/h' }
    ]
  },
  {
    vehicleId: 'vf8',
    modelName: 'VF 8',
    title: 'Chinh Phục Mọi Hành Trình Đỉnh Cao',
    subtitle: 'SUV điện hạng D toàn cầu với công suất 402 mã lực, hệ thống dẫn động 2 cầu AWD và trợ lý ảo thông minh vượt trội.',
    imageFallback: '/VINpng/AdsCars/vf8-4k.png',
    badge: 'SUV HẠNG D CAO CẤP',
    stats: [
      { value: '471 km', label: 'Tầm hoạt động' },
      { value: '402 HP', label: 'Công suất cực đại' },
      { value: '5.5s', label: '0-100 km/h' }
    ]
  },
  {
    vehicleId: 'vf6',
    modelName: 'VF 6',
    title: 'Tuyệt Phẩm SUV Hạng B Đô Thị',
    subtitle: 'Thiết kế cá tính bởi Torino Design, trang bị màn hình 12.9 inch cùng hệ thống hỗ trợ lái thông minh ADAS cấp độ 2.',
    imageFallback: '/VINpng/AdsCars/vf6-4k.png',
    badge: 'MỚI RA MẮT',
    stats: [
      { value: '485 km', label: 'Tầm hoạt động' },
      { value: '201 HP', label: 'Công suất cực đại' },
      { value: '8.9s', label: '0-100 km/h' }
    ]
  }
];
`;

    const outPath = path.resolve(__dirname, '../frontend/src/data/vehicles.ts');
    fs.writeFileSync(outPath, fileContent, 'utf-8');
    console.log(`✅ Successfully updated ${outPath} with ${allVehicles.length} vehicles!`);
  } catch (err) {
    console.error('❌ Error syncing vehicles:', err);
  }
}

sync();
