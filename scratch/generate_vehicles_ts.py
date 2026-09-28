import urllib.request
import json
import os

req_cars = urllib.request.urlopen('http://localhost:8000/api/cars')
cars = json.loads(req_cars.read().decode('utf-8'))
req_scooters = urllib.request.urlopen('http://localhost:8000/api/motorbikes')
scooters = json.loads(req_scooters.read().decode('utf-8'))

def parse_category(c):
    cat = (c.get('category') or '').lower()
    name = (c.get('name') or c.get('model_name') or '').lower()
    code = (c.get('code') or c.get('vehicle_line') or '').lower()
    if 'scooter' in cat or 'motorbike' in cat or 'xe_may' in cat:
        return 'scooter'
    if 'commercial' in cat or 'dich_vu' in cat or 'ebus' in name or 'limo' in name or 'nerio' in name or 'herio' in name or 'minio' in name or 'van' in name or 'ebus' in code:
        return 'commercial'
    return 'suv'

vehicles = []

for c in cars:
    legacy_specs = c.get('additional_specs', {}).get('_legacy_source', {}).get('specifications', {}).get('additional_specs') or c.get('additional_specs') or c.get('specs') or {}
    power_kw = c.get('maximum_power_kw') or legacy_specs.get('motor_power_kw')
    power_hp = legacy_specs.get('motor_power_hp') or (round(power_kw * 1.34) if power_kw else None)
    torque_nm = c.get('maximum_torque_nm') or legacy_specs.get('motor_torque_nm')
    raw_colors = c.get('colors') or c.get('additional_specs', {}).get('colors') or legacy_specs.get('colors') or []
    colors_list = [col if isinstance(col, str) else (col.get('name') or col.get('code') or str(col)) for col in raw_colors] if isinstance(raw_colors, list) else []

    accel = legacy_specs.get('acceleration_0_50_seconds')
    if accel and accel != 'chưa công bố':
        accel_str = f'{accel}s (0-50 km/h)'
    elif power_hp:
        accel_str = f'{power_hp} HP / {torque_nm or 300} Nm'
    else:
        accel_str = 'Tăng tốc mượt mà'

    v = {
        'id': c.get('id') or c.get('car_id') or 'unknown_car',
        'code': c.get('code') or c.get('vehicle_line') or 'VF',
        'name': c.get('name') or c.get('model_name') or 'Xe điện VinFast',
        'tagline': c.get('description') or legacy_specs.get('description_text') or 'Mẫu ô tô điện thông minh VinFast',
        'category': parse_category(c),
        'image': c.get('image_url') or '',
        'basePrice': c.get('base_price') or c.get('list_price') or 0,
        'batteryBuyPrice': c.get('battery_buy_price'),
        'batteryRentMonthly': c.get('battery_rent_monthly'),
        'range': c.get('range_km') or legacy_specs.get('range_km') or 400,
        'battery': f"{c.get('usable_battery_capacity')} kWh" if c.get('usable_battery_capacity') else (legacy_specs.get('battery_type') or 'Pin LFP cao cấp'),
        'acceleration': accel_str,
        'topSpeed': legacy_specs.get('maximum_speed_kmh') or c.get('maximum_speed_kmh') or 150,
        'seats': c.get('seat_count') or legacy_specs.get('seat_count') or 5,
        'isNew': True,
        'colors': colors_list,
        'description': c.get('description') or legacy_specs.get('description_text') or '',
        'highlights': legacy_specs.get('highlights') or [
            'Công nghệ VinFast tiên phong',
            'Trợ lý ảo Tiếng Việt ViVi',
            'Sạc siêu nhanh DC',
            'Bảo hành chính hãng 7-10 năm'
        ],
        'rawSpecs': c
    }
    vehicles.append(v)

for s in scooters:
    specs_obj = s.get('specs') or s.get('additional_specs') or {}
    legacy_source = s.get('_legacy_source', {}).get('specifications', {}).get('additional_specs') or s.get('additional_specs', {}).get('_legacy_source', {}).get('specifications', {}).get('additional_specs') or {}
    raw_colors = s.get('colors') or specs_obj.get('colors') or s.get('additional_specs', {}).get('colors') or legacy_source.get('colors') or []
    colors_list = [col if isinstance(col, str) else (col.get('name') or col.get('code') or str(col)) for col in raw_colors] if isinstance(raw_colors, list) else []

    range_val = s.get('range_km') or specs_obj.get('range_km') or 150
    speed_val = s.get('maximum_speed_kmh') or specs_obj.get('maximum_speed_kmh') or specs_obj.get('top_speed') or 70
    power_w = s.get('maximum_power_w') or specs_obj.get('maximum_power_w') or 2000

    v = {
        'id': s.get('id') or s.get('motorbike_id') or 'unknown_scooter',
        'code': s.get('code') or s.get('vehicle_line') or 'EVO',
        'name': s.get('name') or s.get('model_name') or 'Xe máy điện VinFast',
        'tagline': s.get('description') or specs_obj.get('description_text') or 'Mẫu xe máy điện thông minh VinFast',
        'category': 'scooter',
        'image': s.get('image_url') or '',
        'basePrice': s.get('base_price') or s.get('list_price') or 0,
        'batteryBuyPrice': s.get('battery_buy_price'),
        'batteryRentMonthly': s.get('battery_rent_monthly'),
        'range': range_val,
        'battery': s.get('battery_type') or specs_obj.get('battery_type') or 'Pin LFP chống cháy',
        'acceleration': f'Vận tốc max: {speed_val} km/h',
        'topSpeed': speed_val,
        'seats': 2,
        'isNew': True,
        'colors': colors_list,
        'description': s.get('description') or specs_obj.get('description_text') or '',
        'highlights': [
            f'Công suất tối đa: {power_w}W',
            'Kháng nước IP67 (0.5m trong 30p)',
            'Pin LFP tuổi thọ cao',
            'Định vị GPS & Khóa Smartkey'
        ],
        'rawSpecs': s
    }
    vehicles.append(v)

ts_content = f"""import type {{ Vehicle }} from '@/types';
import {{ getCloudAssetUrl }} from '@/lib/cloudAssets';

export const vehicles: Vehicle[] = {json.dumps(vehicles, ensure_ascii=False, indent=2)};

export const heroSlides = [
  {{
    id: 1,
    title: 'VinFast VF 7',
    subtitle: 'Định Nghĩa Lại Trải Nghiệm Lái Điện',
    tagline: 'Mẫu SUV điện thể thao thời thượng với công nghệ tiên tiến',
    price: '850.000.000 VNĐ',
    range: '431 km',
    acceleration: '5.8s',
    image: getCloudAssetUrl('/VINpng/AdsCars/vf6-4k.png'),
    cta: 'Khám phá ngay',
    section: 'showcase'
  }},
  {{
    id: 2,
    title: 'VinFast VF 8',
    subtitle: 'Đẳng Cấp Doanh Nhân',
    tagline: 'SUV hạng D sang trọng, vận hành mạnh mẽ, đẳng cấp quốc tế',
    price: '1.090.000.000 VNĐ',
    range: '471 km',
    acceleration: '5.5s',
    image: getCloudAssetUrl('/VINpng/AdsCars/vf8-4k.png'),
    cta: 'Tìm hiểu thêm',
    section: 'showcase'
  }},
  {{
    id: 3,
    title: 'VinFast VF 9',
    subtitle: 'Đỉnh Cao Công Nghệ & Tiện Nghi',
    tagline: 'SUV điện full-size 7 chỗ hạng sang đỉnh cao của VinFast',
    price: '1.499.000.000 VNĐ',
    range: '626 km',
    acceleration: '6.5s',
    image: getCloudAssetUrl('/VINpng/AdsCars/vf9-4k.png'),
    cta: 'Đặt cọc ngay',
    section: 'showcase'
  }}
];
"""

with open('frontend/src/data/vehicles.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f'Successfully wrote {len(vehicles)} vehicles to frontend/src/data/vehicles.ts')
