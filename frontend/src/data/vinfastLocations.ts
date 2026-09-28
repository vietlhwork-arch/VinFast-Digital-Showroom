export type LocationDemandType =
  | 'showroom_car'         // Showroom Ô tô
  | 'showroom_scooter'     // Showroom Xe máy điện
  | 'workshop_car'         // Xưởng dịch vụ Ô tô
  | 'workshop_partner'     // Xưởng dịch vụ Ô tô - Đối Tác
  | 'workshop_bus'         // Xưởng dịch vụ Bus
  | 'workshop_gsm'         // Xưởng dịch vụ GSM
  | 'workshop_scooter'     // Xưởng dịch vụ Xe máy điện
  | 'charging_car'         // Trạm sạc Ô tô điện
  | 'charging_scooter'     // Trạm sạc Xe máy điện
  | 'battery_swap';        // Trạm đổi pin Xe máy điện

export interface DemandFilterOption {
  id: LocationDemandType;
  label: string;
  iconType: 'car_v' | 'scooter_v' | 'wrench' | 'wrench_partner' | 'bus' | 'gsm' | 'wrench_scooter' | 'charging_car' | 'charging_scooter' | 'battery_swap';
  defaultChecked: boolean;
}

export const DEMAND_FILTER_OPTIONS: DemandFilterOption[] = [
  { id: 'showroom_car', label: 'Showroom Ô tô', iconType: 'car_v', defaultChecked: true },
  { id: 'showroom_scooter', label: 'Showroom Xe máy điện', iconType: 'scooter_v', defaultChecked: true },
  { id: 'workshop_car', label: 'Xưởng dịch vụ Ô tô', iconType: 'wrench', defaultChecked: true },
  { id: 'workshop_partner', label: 'Xưởng dịch vụ Ô tô - Đối Tác', iconType: 'wrench_partner', defaultChecked: true },
  { id: 'workshop_bus', label: 'Xưởng dịch vụ Bus', iconType: 'bus', defaultChecked: true },
  { id: 'workshop_gsm', label: 'Xưởng dịch vụ GSM', iconType: 'gsm', defaultChecked: true },
  { id: 'workshop_scooter', label: 'Xưởng dịch vụ Xe máy điện', iconType: 'wrench_scooter', defaultChecked: true },
  { id: 'charging_car', label: 'Trạm sạc Ô tô điện', iconType: 'charging_car', defaultChecked: true },
  { id: 'charging_scooter', label: 'Trạm sạc Xe máy điện', iconType: 'charging_scooter', defaultChecked: true },
  { id: 'battery_swap', label: 'Trạm đổi pin Xe máy điện', iconType: 'battery_swap', defaultChecked: true },
];

export interface MapPoint {
  id: string;
  name: string;
  types: LocationDemandType[];
  typeLabel: string;
  province: string;
  district: string;
  ward?: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  hotlineService?: string;
  openingHours: string;
  chargingInfo?: {
    totalPorts: number;
    availablePorts: number;
    maxPower: string;
    powerLevels: string[];
    pricePerKwh: number;
  };
  source?: string;
}

export const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Hà Nội': { lat: 21.0285, lng: 105.8542, zoom: 11 },
  'TP. Hồ Chí Minh': { lat: 10.7769, lng: 106.7009, zoom: 11 },
  'Hải Phòng': { lat: 20.8449, lng: 106.6881, zoom: 12 },
  'Đà Nẵng': { lat: 16.0544, lng: 108.2022, zoom: 12 },
  'Cần Thơ': { lat: 10.0452, lng: 105.7469, zoom: 12 },
  'An Giang': { lat: 10.3854, lng: 105.4312, zoom: 11 },
  'Bà Rịa - Vũng Tàu': { lat: 10.3541, lng: 107.0863, zoom: 12 },
  'Bắc Giang': { lat: 21.2731, lng: 106.1946, zoom: 11 },
  'Bắc Kạn': { lat: 22.1471, lng: 105.8348, zoom: 11 },
  'Bạc Liêu': { lat: 9.2941, lng: 105.7278, zoom: 11 },
  'Bắc Ninh': { lat: 21.1867, lng: 106.0741, zoom: 12 },
  'Bến Tre': { lat: 10.2412, lng: 106.3756, zoom: 11 },
  'Bình Định': { lat: 13.7543, lng: 109.2156, zoom: 11 },
  'Bình Dương': { lat: 10.9845, lng: 106.6712, zoom: 11 },
  'Bình Phước': { lat: 11.5333, lng: 106.8833, zoom: 11 },
  'Bình Thuận': { lat: 10.9321, lng: 108.1023, zoom: 11 },
  'Cà Mau': { lat: 9.1834, lng: 105.1512, zoom: 11 },
  'Cao Bằng': { lat: 22.6657, lng: 106.2579, zoom: 11 },
  'Đắk Lắk': { lat: 12.6845, lng: 108.0412, zoom: 11 },
  'Đắk Nông': { lat: 12.0044, lng: 107.6908, zoom: 11 },
  'Điện Biên': { lat: 21.3854, lng: 103.0212, zoom: 11 },
  'Đồng Nai': { lat: 10.9512, lng: 106.8412, zoom: 11 },
  'Đồng Tháp': { lat: 10.4578, lng: 105.6321, zoom: 11 },
  'Gia Lai': { lat: 13.9833, lng: 108.0000, zoom: 11 },
  'Hà Giang': { lat: 22.8233, lng: 104.9833, zoom: 11 },
  'Hà Nam': { lat: 20.5456, lng: 105.9123, zoom: 12 },
  'Hà Tĩnh': { lat: 18.3345, lng: 105.9012, zoom: 11 },
  'Hải Dương': { lat: 20.9389, lng: 106.3156, zoom: 12 },
  'Hậu Giang': { lat: 9.7845, lng: 105.4712, zoom: 11 },
  'Hòa Bình': { lat: 20.8178, lng: 105.3389, zoom: 11 },
  'Hưng Yên': { lat: 20.6467, lng: 106.0512, zoom: 12 },
  'Khánh Hòa': { lat: 12.2388, lng: 109.1967, zoom: 12 },
  'Kiên Giang': { lat: 10.0123, lng: 105.0812, zoom: 10 },
  'Kon Tum': { lat: 14.3541, lng: 108.0067, zoom: 11 },
  'Lai Châu': { lat: 22.3956, lng: 103.4612, zoom: 11 },
  'Lâm Đồng': { lat: 11.9404, lng: 108.4445, zoom: 12 },
  'Lạng Sơn': { lat: 21.8456, lng: 106.7589, zoom: 11 },
  'Lào Cai': { lat: 22.4854, lng: 103.9707, zoom: 11 },
  'Long An': { lat: 10.5345, lng: 106.4123, zoom: 11 },
  'Nam Định': { lat: 20.4345, lng: 106.1756, zoom: 12 },
  'Nghệ An': { lat: 18.6734, lng: 105.6813, zoom: 11 },
  'Ninh Bình': { lat: 20.2543, lng: 105.9745, zoom: 12 },
  'Ninh Thuận': { lat: 11.5645, lng: 108.9876, zoom: 11 },
  'Phú Thọ': { lat: 21.3212, lng: 105.3987, zoom: 12 },
  'Phú Yên': { lat: 13.0889, lng: 109.3089, zoom: 11 },
  'Quảng Bình': { lat: 17.4712, lng: 106.6212, zoom: 11 },
  'Quảng Nam': { lat: 15.5689, lng: 108.4789, zoom: 11 },
  'Quảng Ngãi': { lat: 15.1205, lng: 108.7923, zoom: 11 },
  'Quảng Ninh': { lat: 20.9505, lng: 107.0844, zoom: 11 },
  'Quảng Trị': { lat: 16.8167, lng: 107.1000, zoom: 11 },
  'Sóc Trăng': { lat: 9.6033, lng: 105.9800, zoom: 11 },
  'Sơn La': { lat: 21.3256, lng: 103.9145, zoom: 11 },
  'Tây Ninh': { lat: 11.3123, lng: 106.1012, zoom: 11 },
  'Thái Bình': { lat: 20.4467, lng: 106.3367, zoom: 12 },
  'Thái Nguyên': { lat: 21.5938, lng: 105.8389, zoom: 12 },
  'Thanh Hóa': { lat: 19.8067, lng: 105.7765, zoom: 11 },
  'Thừa Thiên Huế': { lat: 16.4678, lng: 107.5945, zoom: 12 },
  'Tiền Giang': { lat: 10.3589, lng: 106.3612, zoom: 11 },
  'Trà Vinh': { lat: 9.9345, lng: 106.3456, zoom: 11 },
  'Tuyên Quang': { lat: 21.8234, lng: 105.2156, zoom: 11 },
  'Vĩnh Long': { lat: 10.2534, lng: 105.9723, zoom: 11 },
  'Vĩnh Phúc': { lat: 21.3089, lng: 105.6045, zoom: 12 },
  'Yên Bái': { lat: 21.7167, lng: 104.8978, zoom: 11 },
};

export const PROVINCES_LIST = [
  'Tất cả Tỉnh thành',
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Hải Phòng',
  'Đà Nẵng',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái'
];

export const PROVINCE_OPTIONS = PROVINCES_LIST;
