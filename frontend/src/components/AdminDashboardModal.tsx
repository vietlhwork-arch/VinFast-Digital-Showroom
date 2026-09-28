function renderNumVal(val: any): string | number {
  if (val === 0 || val === '0' || val === null || val === undefined || val === '') return '';
  return val;
}

import { useState, useEffect, useCallback } from 'react';
import {
  X, Users, Car, FileText, Calendar, Plus, Trash2, Edit3, CheckCircle2,
  XCircle, RefreshCw, ShieldCheck, Search, Loader2, UserPlus, Phone, Mail, Award, Lock, Upload, ArrowRight, Download, Zap, AlertTriangle, Eye
} from 'lucide-react';
import { api, getImageUrl, formatVNDPrice, parseVehicleCategory } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface AdminDashboardModalProps {
  open: boolean;
  onClose: () => void;
}

type TabType = 'users' | 'cars' | 'motorbikes' | 'quotes' | 'bookings';

function formatSpecField(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val
        .map((v) => (typeof v === 'object' ? (v.name || v.color || JSON.stringify(v)) : String(v)))
        .filter(Boolean)
        .join(', ');
    }
    return Object.entries(val)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(', ');
  }
  return String(val);
}

export default function AdminDashboardModal({ open, onClose }: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [motorbikes, setMotorbikes] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Sub-Filters states
  const [carCategoryFilter, setCarCategoryFilter] = useState<'all' | 'suv' | 'scooter' | 'commercial'>('all');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCars = cars.filter(
    (c) =>
      !searchQuery ||
      (c.model_name || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.vehicle_line || c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCarsByCategory = filteredCars.filter((c) => {
    if (carCategoryFilter === 'all') return true;
    const cat = parseVehicleCategory(c);
    return cat === carCategoryFilter;
  });

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      !searchQuery ||
      q.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customer_phone?.includes(searchQuery) ||
      q.vehicle_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.status?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (quoteStatusFilter === 'all') return true;
    const st = (q.status || 'pending').toLowerCase();
    return st === quoteStatusFilter.toLowerCase();
  });

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer_phone?.includes(searchQuery) ||
      b.vehicle_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.status?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (bookingStatusFilter === 'all') return true;
    const st = (b.status || 'pending').toLowerCase();
    return st === bookingStatusFilter.toLowerCase();
  });

  // Modals state
  const [showCreateStaff, setShowCreateStaff] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState<any | null>(null);
  const [viewingCar, setViewingCar] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'user' | 'car' | 'motorbike';
    id: string;
    name: string;
  } | null>(null);

  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'add' | 'edit' | 'delete' | 'user';
  } | null>(null);

  const triggerSuccessModal = (title: string, message: string, type: 'add' | 'edit' | 'delete' | 'user' = 'add') => {
    setSuccessModal({ show: true, title, message, type });
  };

  // Forms state
  const [staffForm, setStaffForm] = useState({
    email: '',
    phone: '',
    password: '',
    full_name: '',
    role: 'consultant',
  });

  const [editUserForm, setEditUserForm] = useState({
    full_name: '',
    phone: '',
    role: 'consultant',
    password: '',
  });

  const [carForm, setCarForm] = useState<Record<string, any>>({
    model_name: '',
    vehicle_line: '',
    version: '',
    category: 'Personal',
    list_price: 500000000,
    is_active: true,
    image_url: '',
    description: '',

    // Hard specs & PostgreSQL columns
    range_km: '' as string | number,
    maximum_power_kw: '' as string | number,
    maximum_torque_nm: '' as string | number,
    usable_battery_capacity: '' as string | number,
    seat_count: '' as string | number,
    length_mm: '' as string | number,
    width_mm: '' as string | number,
    height_mm: '' as string | number,
    wheelbase_mm: '' as string | number,

    // Root JSON specs
    body_type: '',
    model_year: '' as string | number,
    maximum_speed_kmh: '' as string | number,
    charging_time_minutes: '' as string | number,
    cargo_capacity_liters: '' as string | number,
    payload_kg: '' as string | number,
    ground_clearance_mm: '' as string | number,
    drivetrain: '',
    warranty_text: '',

    // Brakes & Suspension
    front_brake: '',
    rear_brake: '',
    front_suspension: '',
    rear_suspension: '',

    // Engine, Battery & Hard Specs
    engine_type: '',
    battery_type: '',
    transmission: '',
    curb_weight_kg: '' as string | number,
    standard_charger: '',
    acceleration_0_50_seconds: '',
    motor_power_hp: '' as string | number,

    // Exterior features
    headlights: '',
    wheels: '',
    mirrors: '',
    daytime_running_lights: '',
    rear_spoiler: false,

    // Interior features
    driver_seat: '',
    front_passenger_seat: '',
    steering_wheel: '',
    instrument_cluster_inches: '',
    seat_material: '',
    audio_speakers: '' as string | number,
    air_conditioning: '',
    central_screen_inches: '' as string | number,

    // Safety features
    airbags: '' as string | number,
    ba: false,
    abs: false,
    ebd: false,
    esc: false,
    hsa: false,
    tcs: false,
    tpms: false,
    isofix: false,
    anti_theft_system: false,

    // ADAS features
    rear_camera: false,
    cruise_control: false,
    blind_spot_warning: false,
    rear_parking_sensor: false,
    rear_cross_traffic_alert: false,
    safe_exit_warning: false,
    vietnamese_voice_assistant: false,

    // Additional Root Specs
    tires_wheels: '',
    cargo_capacity_folded_liters: '' as string | number,
    turning_diameter_m: '' as string | number,
    roof_load_capacity_kg: '' as string | number,
    dc_charge_from_percent: '' as string | number,
    dc_charge_to_percent: '' as string | number,
    price_info_text: '',
    charging_info_text: '',
    range_condition_text: '',
    regenerative_braking: '',
    technical_specs_text: '',

    // Scooter Root & Additional Specs
    wet_weight_kg: '' as string | number,
    underseat_storage_liters: '' as string | number,
    water_resistance_standard: '',
    motor_type: '',
    charger_type: '',
    charger_power_w: '' as string | number,
    battery_quantity: '' as string | number,
    battery_voltage_v: '' as string | number,
    battery_capacity_ah: '' as string | number,
    rated_motor_power_w: '' as string | number,
    removable_battery: true as boolean,
    battery_swap_supported: true as boolean,
    front_tire: '',
    rear_tire: '',
    headlight: '',
    tail_light: '',
    turn_signal: '',
    battery_swap: true as boolean,
    smart_management: '',
    license_requirement: '',
    battery_capacity_text: '',
    battery_location: '',

    colors_text: '',
    custom_kv_pairs: [] as { key: string; value: string }[],

    show_raw_json: false,
    additional_specs_json: '{}',
  });

  const [carImageFile, setCarImageFile] = useState<File | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setMsg('');
    try {
      const [uList, cList, sList, qList, bList] = await Promise.all([
        api.getUsers<any[]>().catch(() => []),
        api.getCars<any[]>().catch(() => []),
        api.getMotorbikes<any[]>().catch(() => []),
        api.getQuotes<any[]>().catch(() => []),
        api.getBookings<any[]>().catch(() => []),
      ]);
      setUsers(uList || []);
      setCars(cList || []);
      setMotorbikes(sList || []);
      setQuotes(qList || []);
      setBookings(bList || []);
    } catch (err: any) {
      setMsg(err.message || 'Tải dữ liệu thất bại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchData();
  }, [open, fetchData]);

  // USER HANDLERS
  const handleCreateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    try {
      setLoading(true);
      await api.createStaff(staffForm);
      const roleText = staffForm.role === 'admin' ? 'Quản trị viên (Admin)' : 'Tư vấn viên (Staff)';
      setMsg(`Tạo tài khoản ${roleText} thành công! Email: ${staffForm.email} | Mật khẩu cấp: ${staffForm.password}`);
      setShowCreateStaff(false);
      setStaffForm({ email: '', phone: '', password: '', full_name: '', role: 'consultant' });
      fetchData();
    } catch (err: any) {
      setMsg(err.message || 'Tạo tài khoản thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setLoading(true);
      await api.updateUser(editingUser.id, editUserForm);
      setMsg(`Đã cập nhật tài khoản ${editingUser.email}`);
      setEditingUser(null);
      fetchData();
    } catch (err: any) {
      setMsg(err.message || 'Cập nhật tài khoản thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const targetName = deleteTarget.name;
    const targetType = deleteTarget.type === 'user' ? 'tài khoản' : deleteTarget.type === 'motorbike' ? 'xe máy điện' : 'ô tô';
    const targetId = deleteTarget.id;
    const type = deleteTarget.type;

    try {
      setLoading(true);
      setDeleteTarget(null); // Tự động đóng Modal Xóa

      if (type === 'user') {
        await api.deleteUser(targetId);
      } else if (type === 'car') {
        await api.deleteCar(targetId);
      } else if (type === 'motorbike') {
        await api.deleteMotorbike(targetId);
      }

      const delMsg = `Đã xóa thành công ${targetType} ${targetName} khỏi hệ thống!`;
      setMsg(delMsg);
      triggerSuccessModal('Xóa Thành Công!', delMsg, 'delete');
      fetchData();
    } catch (err: any) {
      setMsg(err.message || `Xóa ${targetType} thất bại.`);
    } finally {
      setLoading(false);
    }
  };

  // ADAS Translation Dictionary Map
  const ADAS_KEY_MAP: Record<string, string> = {
    rear_camera: "Camera lùi",
    cruise_control: "Kiểm soát hành trình (Cruise Control)",
    safe_exit_warning: "Cảnh báo mở cửa an toàn",
    blind_spot_warning: "Cảnh báo điểm mù (BSD)",
    rear_parking_sensor: "Cảm biến đỗ xe phía sau",
    rear_cross_traffic_alert: "Cảnh báo cắt ngang khi lùi (RCTA)",
    vietnamese_voice_assistant: "Trợ lý ảo tiếng Việt ViVi",
    lane_keep_assist: "Hỗ trợ giữ làn đường (LKA)",
    traffic_jam_assist: "Hỗ trợ di chuyển khi ùn tắc (TJA)",
    highway_assist: "Hỗ trợ lái đường cao tốc",
    auto_parking: "Tự động đỗ xe thông minh",
    driver_monitoring: "Giám sát người lái",
  };

  // Robust Spec Field Formatter (Prevents [object Object] rendering & translates boolean flags)
  const formatSpecField = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (Array.isArray(val)) return val.map(item => formatSpecField(item)).filter(Boolean).join(', ');
    if (typeof val === 'object') {
      if (val.description_text && typeof val.description_text === 'string') return val.description_text;
      if (val.features && typeof val.features === 'string') return val.features;
      return Object.entries(val)
        .map(([k, v]) => {
          if (v === true || v === 'true' || v === 1) {
            return ADAS_KEY_MAP[k] || k.replace(/_/g, ' ');
          }
          if (typeof v === 'object' && v !== null) return formatSpecField(v);
          return (v && v !== false && v !== 'false') ? `${ADAS_KEY_MAP[k] || k}: ${v}` : null;
        })
        .filter(Boolean)
        .join(', ');
    }
    return String(val);
  };

  // Dynamic Key-Value Pair Handlers for Custom Specifications
  const handleAddKvPair = () => {
    setCarForm({
      ...carForm,
      custom_kv_pairs: [...carForm.custom_kv_pairs, { key: '', value: '' }]
    });
  };

  const handleUpdateKvPair = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...carForm.custom_kv_pairs];
    updated[index][field] = val;
    setCarForm({ ...carForm, custom_kv_pairs: updated });
  };

  const handleRemoveKvPair = (index: number) => {
    const updated = carForm.custom_kv_pairs.filter((_item: { key: string; value: string }, i: number) => i !== index);
    setCarForm({ ...carForm, custom_kv_pairs: updated });
  };

  const handleLoadVinFastTemplate = () => {
    setCarForm({
      ...carForm,
      range_km: carForm.range_km || 450,
      maximum_power_kw: carForm.maximum_power_kw || 150,
      maximum_torque_nm: carForm.maximum_torque_nm || 310,
      usable_battery_capacity: carForm.usable_battery_capacity || 60.4,
      seat_count: carForm.seat_count || 5,

      length_mm: carForm.length_mm || 4600,
      width_mm: carForm.width_mm || 1900,
      height_mm: carForm.height_mm || 1660,
      wheelbase_mm: carForm.wheelbase_mm || 2800,
      ground_clearance_mm: carForm.ground_clearance_mm || 175,
      cargo_capacity_liters: carForm.cargo_capacity_liters || 350,
      payload_kg: carForm.payload_kg || 400,

      body_type: carForm.body_type || 'C-SUV',
      model_year: carForm.model_year || 2024,
      maximum_speed_kmh: carForm.maximum_speed_kmh || 160,
      charging_time_minutes: carForm.charging_time_minutes || 24,
      wheels_rims: carForm.wheels_rims || '19 inch hợp kim nhôm',
      drivetrain: carForm.drivetrain || 'AWD (Dẫn động 2 cầu toàn thời gian)',

      infotainment_screen: carForm.infotainment_screen || 'Màn hình cảm ứng 15.6 inch + HUD kính lái',
      speakers: carForm.speakers || '10 loa cao cấp Premium Sound',
      seat_material: carForm.seat_material || 'Da Vegan cao cấp kháng khuẩn',

      airbags: carForm.airbags ?? (carForm.seat_count === 4 ? 1 : (carForm.category === 'Scooter' ? 0 : 6)),
      has_adas: true,
      brakes: carForm.brakes || 'Phanh đĩa tản nhiệt / ABS / EBD / BA',
      adas_features: carForm.adas_features || 'Cảnh báo điểm mù, Hỗ trợ di chuyển khi ùn tắc, Trợ lý ảo ViVi, Tự động đỗ xe thông minh',

      smart_key: carForm.smart_key || 'Khóa thông minh Smartkey & Khởi động từ xa',
      gps: carForm.gps || 'Định vị GPS toàn cầu & App VinFast',
      lighting: carForm.lighting || 'Đèn Full LED định vị ban ngày & Đèn pha tự động',
      water_resistance: carForm.water_resistance || 'IP67 chống ngập nước 0.5m',
      warranty_text: carForm.warranty_text || 'Bảo hành chính hãng 10 năm hoặc 200.000 km',
    });
  };

  // CAR HANDLERS (Aligned 100% with PostgreSQL car_catalog & motorbike_catalog schemas)
  const handleOpenAddCar = () => {
    setEditingCar(null);
    const isScooterTab = activeTab === 'motorbikes';
    setCarForm({
      model_name: '',
      vehicle_line: '',
      version: '',
      category: isScooterTab ? 'motorbike' : 'Personal',
      list_price: isScooterTab ? 30000000 : 500000000,
      is_active: true,
      image_url: '',
      description: '',

      range_km: '',
      maximum_power_kw: '',
      maximum_torque_nm: '',
      usable_battery_capacity: '',
      seat_count: isScooterTab ? 2 : 5,
      length_mm: '',
      width_mm: '',
      height_mm: '',
      wheelbase_mm: '',

      body_type: isScooterTab ? 'Xe máy điện (Scooter)' : 'C-SUV',
      model_year: '',
      maximum_speed_kmh: '',
      charging_time_minutes: '',
      cargo_capacity_liters: '',
      payload_kg: '',
      ground_clearance_mm: '',
      drivetrain: '',
      warranty_text: '',

      wet_weight_kg: '',
      underseat_storage_liters: '',
      water_resistance_standard: '',
      motor_type: '',
      battery_type: '',
      charger_type: '',
      charger_power_w: '',
      battery_quantity: '',
      battery_voltage_v: '',
      battery_capacity_ah: '',
      rated_motor_power_w: '',
      removable_battery: true,
      battery_swap_supported: true,

      front_tire: '',
      rear_tire: '',
      front_brake: '',
      rear_brake: '',
      front_suspension: '',
      rear_suspension: '',

      headlight: '',
      tail_light: '',
      turn_signal: '',
      battery_swap: true,
      smart_management: '',
      license_requirement: '',

      price_info_text: '',
      charging_info_text: '',
      range_condition_text: '',
      technical_specs_text: '',
      battery_capacity_text: '',
      battery_location: '',

      engine_type: '',
      transmission: '',
      curb_weight_kg: '',
      standard_charger: '',
      acceleration_0_50_seconds: '',
      motor_power_hp: '',

      headlights: '',
      wheels: '',
      mirrors: '',
      daytime_running_lights: '',
      rear_spoiler: false,

      driver_seat: '',
      front_passenger_seat: '',
      steering_wheel: '',
      instrument_cluster_inches: '',
      seat_material: '',
      audio_speakers: '',
      air_conditioning: '',
      central_screen_inches: '',

      airbags: isScooterTab ? 0 : '',
      ba: false,
      abs: false,
      ebd: false,
      esc: false,
      hsa: false,
      tcs: false,
      tpms: false,
      isofix: false,
      anti_theft_system: false,

      rear_camera: false,
      cruise_control: false,
      blind_spot_warning: false,
      rear_parking_sensor: false,
      rear_cross_traffic_alert: false,
      safe_exit_warning: false,
      vietnamese_voice_assistant: false,

      tires_wheels: '',
      cargo_capacity_folded_liters: '',
      turning_diameter_m: '',
      roof_load_capacity_kg: '',
      dc_charge_from_percent: '',
      dc_charge_to_percent: '',
      regenerative_braking: '',

      colors_text: '',
      custom_kv_pairs: [],

      show_raw_json: false,
      additional_specs_json: '{}',
    });
    setCarImageFile(null);
    setShowCarModal(true);
  };

  const handleOpenEditCar = (car: any) => {
    try {
      if (!car) return;
      setEditingCar(car);

      const specsObj = (car && typeof car.additional_specs === 'object' && car.additional_specs !== null)
        ? car.additional_specs
        : ((car && typeof car.specs === 'object' && car.specs !== null) ? car.specs : {});

      const legacySpecs = (specsObj && specsObj._legacy_source && typeof specsObj._legacy_source.specifications === 'object' && specsObj._legacy_source.specifications !== null)
        ? specsObj._legacy_source.specifications
        : (specsObj || {});

      const addNested = (legacySpecs && typeof legacySpecs.additional_specs === 'object' && legacySpecs.additional_specs !== null)
        ? legacySpecs.additional_specs
        : {};

      const extFeat = (addNested && typeof addNested.exterior_features === 'object') ? addNested.exterior_features : {};
      const intFeat = (addNested && typeof addNested.interior_features === 'object') ? addNested.interior_features : {};
      const safFeat = (addNested && typeof addNested.safety_features === 'object') ? addNested.safety_features : {};
      const adasFeat = (addNested && typeof addNested.driver_assistance_features === 'object') ? addNested.driver_assistance_features : {};

      const catLower = (car.category || '').toLowerCase();
      const isScooter = catLower.includes('scooter') || catLower.includes('xe máy') || activeTab === 'motorbikes';

      const descVal = formatSpecField(car.description || specsObj.description_text || specsObj.description || legacySpecs.description_text || addNested.description_text || '');

      const knownKeys = new Set([
        'body_type', 'model_year', 'maximum_speed_kmh', 'charging_time_minutes',
        'cargo_capacity_liters', 'payload_kg', 'ground_clearance_mm', 'wheels_rims',
        'drivetrain', 'infotainment_screen', 'speakers', 'seat_material', 'climate_control', 'airbags',
        'has_adas', 'brakes', 'suspension', 'adas_features', 'smart_key', 'gps', 'lighting',
        'water_resistance', 'warranty_text', 'description_text', 'description', '_legacy_source',
        'exterior_features', 'interior_features', 'safety_features', 'driver_assistance_features',
        'front_brake', 'rear_brake', 'front_suspension', 'rear_suspension', 'engine_type', 'battery_type',
        'transmission', 'curb_weight_kg', 'standard_charger', 'acceleration_0_50_seconds', 'motor_power_hp',
        'tires_wheels', 'cargo_capacity_folded_liters', 'turning_diameter_m', 'roof_load_capacity_kg',
        'dc_charge_from_percent', 'dc_charge_to_percent', 'price_info_text', 'charging_info_text',
        'range_condition_text', 'regenerative_braking', 'technical_specs_text', 'colors', 'smart_features'
      ]);

      const extraKv: { key: string; value: string }[] = [];
      if (specsObj && typeof specsObj === 'object') {
        Object.entries(specsObj).forEach(([k, v]) => {
          if (!knownKeys.has(k) && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
            extraKv.push({ key: k, value: String(v) });
          }
        });
      }

      const rawColors = addNested.colors || specsObj.colors || car.colors || [];
      let colorsStr = '';
      if (Array.isArray(rawColors) && rawColors.length > 0) {
        colorsStr = rawColors.map((c: any) => (typeof c === 'object' ? (c.name || c.color || '') : String(c))).filter(Boolean).join(', ');
      } else if (typeof rawColors === 'string') {
        colorsStr = rawColors;
      }

      setCarForm({
        model_name: car.model_name || car.name || '',
        vehicle_line: car.vehicle_line || car.code || car.model_name || '',
        version: car.version || '',
        category: isScooter ? 'motorbike' : (car.category || 'Personal'),
        list_price: car.list_price || car.base_price || 0,
        is_active: car.is_active ?? car.is_available ?? true,
        image_url: car.image_url || '',
        description: descVal,

        range_km: car.range_km ?? specsObj.range_km ?? legacySpecs.range_km ?? '',
        maximum_power_kw: car.maximum_power_kw ?? specsObj.maximum_power_kw ?? legacySpecs.motor_power_kw ?? '',
        maximum_torque_nm: car.maximum_torque_nm ?? specsObj.maximum_torque_nm ?? addNested.motor_torque_nm ?? '',
        usable_battery_capacity: car.usable_battery_capacity ?? specsObj.usable_battery_capacity ?? legacySpecs.battery_capacity_kwh ?? '',
        seat_count: car.seat_count ?? specsObj.seat_count ?? legacySpecs.seat_count ?? '',
        length_mm: car.length_mm ?? specsObj.length_mm ?? addNested.length_mm ?? '',
        width_mm: car.width_mm ?? specsObj.width_mm ?? addNested.width_mm ?? '',
        height_mm: car.height_mm ?? specsObj.height_mm ?? addNested.height_mm ?? '',
        wheelbase_mm: car.wheelbase_mm ?? specsObj.wheelbase_mm ?? addNested.wheelbase_mm ?? '',

        body_type: specsObj.body_type || legacySpecs.body_type || '',
        model_year: legacySpecs.model_year ?? specsObj.model_year ?? addNested.model_year ?? '',
        maximum_speed_kmh: legacySpecs.maximum_speed_kmh ?? specsObj.maximum_speed_kmh ?? '',
        charging_time_minutes: legacySpecs.charging_time_minutes ?? specsObj.charging_time_minutes ?? '',
        cargo_capacity_liters: specsObj.cargo_capacity_liters || legacySpecs.cargo_capacity_liters || '',
        payload_kg: specsObj.payload_kg || legacySpecs.payload_kg || '',
        ground_clearance_mm: specsObj.ground_clearance_mm || addNested.ground_clearance_mm || '',
        drivetrain: specsObj.drivetrain || addNested.drivetrain || '',
        warranty_text: addNested.warranty_text || specsObj.warranty_text || legacySpecs.warranty_text || '',

        wet_weight_kg: legacySpecs.wet_weight_kg ?? specsObj.wet_weight_kg ?? addNested.wet_weight_kg ?? '',
        underseat_storage_liters: legacySpecs.underseat_storage_liters ?? specsObj.underseat_storage_liters ?? addNested.underseat_storage_liters ?? '',
        water_resistance_standard: legacySpecs.water_resistance_standard ?? specsObj.water_resistance_standard ?? addNested.water_resistance_standard ?? '',

        motor_type: legacySpecs.motor_type ?? car.motor_type ?? specsObj.motor_type ?? addNested.motor_type ?? '',
        battery_type: legacySpecs.battery_type ?? car.battery_type ?? specsObj.battery_type ?? addNested.battery_type ?? '',
        charger_type: legacySpecs.charger_type ?? specsObj.charger_type ?? addNested.charger_type ?? '',
        charger_power_w: legacySpecs.charger_power_w ?? specsObj.charger_power_w ?? addNested.charger_power_w ?? '',
        battery_quantity: legacySpecs.battery_quantity ?? car.battery_quantity ?? specsObj.battery_quantity ?? addNested.battery_quantity ?? '',
        battery_voltage_v: legacySpecs.battery_voltage_v ?? specsObj.battery_voltage_v ?? addNested.battery_voltage_v ?? '',
        battery_capacity_ah: legacySpecs.battery_capacity_ah ?? specsObj.battery_capacity_ah ?? addNested.battery_capacity_ah ?? '',
        rated_motor_power_w: legacySpecs.rated_motor_power_w ?? specsObj.rated_motor_power_w ?? addNested.rated_motor_power_w ?? '',
        removable_battery: legacySpecs.removable_battery ?? specsObj.removable_battery ?? addNested.removable_battery ?? true,
        battery_swap_supported: legacySpecs.battery_swap_supported ?? specsObj.battery_swap_supported ?? addNested.battery_swap_supported ?? true,

        front_tire: addNested.front_tire ?? specsObj.front_tire ?? '',
        rear_tire: addNested.rear_tire ?? specsObj.rear_tire ?? '',
        front_brake: addNested.front_brake || specsObj.front_brake || '',
        rear_brake: addNested.rear_brake || specsObj.rear_brake || '',
        front_suspension: addNested.front_suspension || specsObj.front_suspension || '',
        rear_suspension: addNested.rear_suspension || specsObj.rear_suspension || '',

        headlight: (addNested.lighting_features && addNested.lighting_features.headlight) || addNested.headlight || specsObj.headlight || extFeat.headlights || '',
        tail_light: (addNested.lighting_features && addNested.lighting_features.tail_light) || addNested.tail_light || specsObj.tail_light || '',
        turn_signal: (addNested.lighting_features && addNested.lighting_features.turn_signal) || addNested.turn_signal || specsObj.turn_signal || '',

        battery_swap: (addNested.technology_features && addNested.technology_features.battery_swap !== undefined) ? addNested.technology_features.battery_swap : (addNested.battery_swap ?? specsObj.battery_swap ?? true),
        smart_management: (addNested.technology_features && addNested.technology_features.smart_management) || addNested.smart_management || specsObj.smart_management || '',
        license_requirement: (addNested.technology_features && addNested.technology_features.license_requirement) || addNested.license_requirement || specsObj.license_requirement || '',

        battery_capacity_text: addNested.battery_capacity_text || specsObj.battery_capacity_text || '',
        battery_location: addNested.battery_location || specsObj.battery_location || '',

        engine_type: addNested.engine_type || specsObj.engine_type || '',
        transmission: addNested.transmission || specsObj.transmission || '',
        curb_weight_kg: addNested.curb_weight_kg || specsObj.curb_weight_kg || '',
        standard_charger: addNested.standard_charger || specsObj.standard_charger || '',
        acceleration_0_50_seconds: addNested.acceleration_0_50_seconds || specsObj.acceleration_0_50_seconds || '',
        motor_power_hp: addNested.motor_power_hp || specsObj.motor_power_hp || '',

        headlights: extFeat.headlights || addNested.headlights || '',
        wheels: extFeat.wheels || addNested.wheels || '',
        mirrors: extFeat.mirrors || addNested.mirrors || '',
        daytime_running_lights: extFeat.daytime_running_lights || addNested.daytime_running_lights || '',
        rear_spoiler: Boolean(extFeat.rear_spoiler || addNested.rear_spoiler),

        driver_seat: intFeat.driver_seat || addNested.driver_seat || '',
        front_passenger_seat: intFeat.front_passenger_seat || addNested.front_passenger_seat || '',
        steering_wheel: intFeat.steering_wheel || addNested.steering_wheel || '',
        instrument_cluster_inches: intFeat.instrument_cluster_inches || addNested.instrument_cluster_inches || '',
        seat_material: intFeat.seat_material || addNested.seat_material || specsObj.seat_material || '',
        audio_speakers: intFeat.audio_speakers || intFeat.speakers || addNested.audio_speakers || addNested.speakers || specsObj.audio_speakers || '',
        air_conditioning: intFeat.air_conditioning || intFeat.climate_control || addNested.air_conditioning || addNested.climate_control || specsObj.air_conditioning || '',
        central_screen_inches: intFeat.central_screen_inches || intFeat.infotainment_screen || addNested.central_screen_inches || addNested.infotainment_screen || specsObj.central_screen_inches || '',

        airbags: safFeat.airbags ?? addNested.airbags ?? specsObj.airbags ?? '',
        ba: Boolean(safFeat.ba ?? addNested.ba),
        abs: Boolean(safFeat.abs ?? addNested.abs),
        ebd: Boolean(safFeat.ebd ?? addNested.ebd),
        esc: Boolean(safFeat.esc ?? addNested.esc),
        hsa: Boolean(safFeat.hsa ?? addNested.hsa),
        tcs: Boolean(safFeat.tcs ?? addNested.tcs),
        tpms: Boolean(safFeat.tpms ?? addNested.tpms),
        isofix: Boolean(safFeat.isofix ?? addNested.isofix),
        anti_theft_system: Boolean(safFeat.anti_theft_system ?? addNested.anti_theft_system),

        pet_mode: Boolean(adasFeat.pet_mode ?? addNested.pet_mode),
        camp_mode: Boolean(adasFeat.camp_mode ?? addNested.camp_mode),
        android_auto: Boolean(adasFeat.android_auto ?? addNested.android_auto),
        apple_carplay: Boolean(adasFeat.apple_carplay ?? addNested.apple_carplay),
        highway_assist: Boolean(adasFeat.highway_assist ?? addNested.highway_assist),
        lane_keep_assist: Boolean(adasFeat.lane_keep_assist ?? addNested.lane_keep_assist),
        safe_exit_warning: Boolean(adasFeat.safe_exit_warning ?? addNested.safe_exit_warning),
        blind_spot_warning: Boolean(adasFeat.blind_spot_warning ?? addNested.blind_spot_warning),
        traffic_jam_assist: Boolean(adasFeat.traffic_jam_assist ?? addNested.traffic_jam_assist),
        emergency_lane_keep: Boolean(adasFeat.emergency_lane_keep ?? addNested.emergency_lane_keep),
        surround_view_camera: Boolean(adasFeat.surround_view_camera ?? addNested.surround_view_camera),
        lane_departure_warning: Boolean(adasFeat.lane_departure_warning ?? addNested.lane_departure_warning),
        adaptive_cruise_control: Boolean(adasFeat.adaptive_cruise_control ?? addNested.adaptive_cruise_control),
        rear_cross_traffic_alert: Boolean(adasFeat.rear_cross_traffic_alert ?? addNested.rear_cross_traffic_alert),
        traffic_sign_recognition: Boolean(adasFeat.traffic_sign_recognition ?? addNested.traffic_sign_recognition),
        forward_collision_warning: Boolean(adasFeat.forward_collision_warning ?? addNested.forward_collision_warning),
        front_rear_parking_sensors: Boolean(adasFeat.front_rear_parking_sensors ?? addNested.front_rear_parking_sensors),
        vietnamese_voice_assistant: Boolean(adasFeat.vietnamese_voice_assistant ?? addNested.vietnamese_voice_assistant),
        automatic_emergency_braking: Boolean(adasFeat.automatic_emergency_braking ?? addNested.automatic_emergency_braking),
        rear_camera: Boolean(adasFeat.rear_camera ?? addNested.rear_camera),
        cruise_control: Boolean(adasFeat.cruise_control ?? addNested.cruise_control),
        rear_parking_sensor: Boolean(adasFeat.rear_parking_sensor ?? addNested.rear_parking_sensor),

        tires_wheels: addNested.tires_wheels || specsObj.tires_wheels || '',
        cargo_capacity_folded_liters: addNested.cargo_capacity_folded_liters || specsObj.cargo_capacity_folded_liters || '',
        turning_diameter_m: addNested.turning_diameter_m || specsObj.turning_diameter_m || '',
        roof_load_capacity_kg: addNested.roof_load_capacity_kg || specsObj.roof_load_capacity_kg || '',
        dc_charge_from_percent: addNested.dc_charge_from_percent || specsObj.dc_charge_from_percent || '',
        dc_charge_to_percent: addNested.dc_charge_to_percent || specsObj.dc_charge_to_percent || '',
        price_info_text: addNested.price_info_text || specsObj.price_info_text || '',
        charging_info_text: addNested.charging_info_text || specsObj.charging_info_text || '',
        range_condition_text: addNested.range_condition_text || specsObj.range_condition_text || '',
        regenerative_braking: addNested.regenerative_braking || specsObj.regenerative_braking || '',
        technical_specs_text: addNested.technical_specs_text || specsObj.technical_specs_text || '',

        colors_text: colorsStr || '',
        custom_kv_pairs: extraKv,
        show_raw_json: false,
        additional_specs_json: car.additional_specs
          ? JSON.stringify(car.additional_specs, null, 2)
          : (car.specs ? JSON.stringify(car.specs, null, 2) : '{}'),
      });
      setCarImageFile(null);
      setShowCarModal(true);
    } catch (err) {
      console.error('Error in handleOpenEditCar:', err);
      setShowCarModal(true);
    }
  };

  const handleSaveCarSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setMsg('');
    setErrorMsg('');

    if (!carForm.model_name || !carForm.model_name.trim()) {
      const emptyMsg = 'Vui lòng nhập Tên mẫu xe (Ví dụ: VinFast VF 8 Plus).';
      setErrorMsg(emptyMsg);
      alert(`⚠️ ${emptyMsg}`);
      return;
    }

    const derivedLine = carForm.vehicle_line && carForm.vehicle_line.trim()
      ? carForm.vehicle_line.trim()
      : carForm.model_name.replace(/VinFast/i, '').trim() || 'VF';

    try {
      setLoading(true);

      const cleanInt = (val: any, defaultVal = 0): number => {
        if (val === null || val === undefined || val === '') return defaultVal;
        if (typeof val === 'number') return isNaN(val) ? defaultVal : Math.round(val);
        const sanitized = String(val).replace(/[^\d-]/g, '');
        const parsed = parseInt(sanitized, 10);
        return isNaN(parsed) ? defaultVal : parsed;
      };

      const cleanFloat = (val: any, defaultVal = 0): number => {
        if (val === null || val === undefined || val === '') return defaultVal;
        if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
        const sanitized = String(val).replace(/,/g, '.').replace(/[^\d.-]/g, '');
        const parsed = parseFloat(sanitized);
        return isNaN(parsed) ? defaultVal : parsed;
      };

      const isValuePresent = (v: any): boolean => {
        if (v === undefined || v === null) return false;
        if (typeof v === 'string' && v.trim() === '') return false;
        return true;
      };

      const cleanObject = (obj: any): any => {
        if (obj === null || obj === undefined) return undefined;
        if (typeof obj !== 'object' || Array.isArray(obj)) return obj;
        const cleaned: any = {};
        for (const [k, v] of Object.entries(obj)) {
          if (isValuePresent(v)) {
            if (typeof v === 'object' && !Array.isArray(v)) {
              const childCleaned = cleanObject(v);
              if (childCleaned && Object.keys(childCleaned).length > 0) {
                cleaned[k] = childCleaned;
              }
            } else {
              cleaned[k] = v;
            }
          }
        }
        return cleaned;
      };

      const parsedPrice = cleanInt(carForm.list_price, 0);

      const formData = new FormData();
      const isScooter = activeTab === 'motorbikes' || carForm.category === 'motorbike' || carForm.category === 'Scooter' || carForm.category === 'scooter' || carForm.category === 'motor bike';
      const finalCategory = isScooter ? 'motorbike' : (carForm.category || 'Personal');

      formData.append('model_name', carForm.model_name.trim());
      formData.append('vehicle_line', derivedLine);
      formData.append('version', carForm.version || 'Plus');
      formData.append('category', finalCategory);
      formData.append('list_price', String(parsedPrice));
      formData.append('base_price', String(parsedPrice));
      const isActiveBool = carForm.is_active === true || carForm.is_active === 'true' || carForm.is_active === 1 || carForm.is_active === '1';
      formData.append('is_active', isActiveBool ? 'true' : 'false');
      formData.append('description', carForm.description || '');

      const appendNum = (key: string, val: any, isFloat = false) => {
        if (val !== null && val !== undefined && val !== '') {
          const num = isFloat ? cleanFloat(val, -1) : cleanInt(val, -1);
          if (num >= 0) {
            formData.append(key, String(num));
          }
        }
      };

      appendNum('range_km', carForm.range_km, true);
      appendNum('maximum_power_kw', carForm.maximum_power_kw, true);
      appendNum('maximum_torque_nm', carForm.maximum_torque_nm, true);
      appendNum('usable_battery_capacity', carForm.usable_battery_capacity, true);
      appendNum('seat_count', carForm.seat_count, false);
      appendNum('length_mm', carForm.length_mm, false);
      appendNum('width_mm', carForm.width_mm, false);
      appendNum('height_mm', carForm.height_mm, false);
      appendNum('wheelbase_mm', carForm.wheelbase_mm, false);

      let packedSpecs: any = {};
      const existingAdditional = editingCar && typeof editingCar.additional_specs === 'object'
        ? editingCar.additional_specs
        : {};
      const existingLegacySpecs = existingAdditional?._legacy_source?.specifications || {};
      const existingLegacyAdditional = existingLegacySpecs.additional_specs || {};
      const existingSmartFeatures = existingLegacyAdditional.smart_features || existingAdditional.smart_features;

      if (!isScooter) {
        const colorsArr = (carForm.colors_text || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
          .map((name: string) => ({ name }));

        const safety_features = {
          airbags: carForm.airbags !== '' && carForm.airbags !== null && carForm.airbags !== undefined ? Number(carForm.airbags) : undefined,
          ba: carForm.ba,
          abs: carForm.abs,
          ebd: carForm.ebd,
          esc: carForm.esc,
          hsa: carForm.hsa,
          tcs: carForm.tcs,
          tpms: carForm.tpms,
          isofix: carForm.isofix,
          anti_theft_system: carForm.anti_theft_system,
        };

        const interior_features = {
          driver_seat: carForm.driver_seat || undefined,
          front_passenger_seat: carForm.front_passenger_seat || undefined,
          steering_wheel: carForm.steering_wheel || undefined,
          instrument_cluster_inches: carForm.instrument_cluster_inches || undefined,
          seat_material: carForm.seat_material || undefined,
          audio_speakers: carForm.audio_speakers !== '' ? Number(carForm.audio_speakers) || carForm.audio_speakers : undefined,
          air_conditioning: carForm.air_conditioning || undefined,
          central_screen_inches: carForm.central_screen_inches !== '' ? carForm.central_screen_inches : undefined,
        };

        const exterior_features = {
          headlights: carForm.headlights || undefined,
          wheels: carForm.wheels || undefined,
          mirrors: carForm.mirrors || undefined,
          daytime_running_lights: carForm.daytime_running_lights || undefined,
          rear_spoiler: carForm.rear_spoiler,
        };

        const driver_assistance_features = {
          pet_mode: carForm.pet_mode,
          camp_mode: carForm.camp_mode,
          android_auto: carForm.android_auto,
          apple_carplay: carForm.apple_carplay,
          highway_assist: carForm.highway_assist,
          lane_keep_assist: carForm.lane_keep_assist,
          safe_exit_warning: carForm.safe_exit_warning,
          blind_spot_warning: carForm.blind_spot_warning,
          traffic_jam_assist: carForm.traffic_jam_assist,
          emergency_lane_keep: carForm.emergency_lane_keep,
          surround_view_camera: carForm.surround_view_camera,
          lane_departure_warning: carForm.lane_departure_warning,
          adaptive_cruise_control: carForm.adaptive_cruise_control,
          rear_cross_traffic_alert: carForm.rear_cross_traffic_alert,
          traffic_sign_recognition: carForm.traffic_sign_recognition,
          forward_collision_warning: carForm.forward_collision_warning,
          front_rear_parking_sensors: carForm.front_rear_parking_sensors,
          vietnamese_voice_assistant: carForm.vietnamese_voice_assistant,
          automatic_emergency_braking: carForm.automatic_emergency_braking,
          rear_camera: carForm.rear_camera,
          cruise_control: carForm.cruise_control,
          rear_parking_sensor: carForm.rear_parking_sensor,
        };

        const additionalSpecs: any = {
          body_type: carForm.body_type || undefined,
          model_year: carForm.model_year !== '' ? Number(carForm.model_year) : undefined,
          maximum_speed_kmh: carForm.maximum_speed_kmh !== '' ? Number(carForm.maximum_speed_kmh) : undefined,
          charging_time_minutes: carForm.charging_time_minutes !== '' ? Number(carForm.charging_time_minutes) : undefined,
          cargo_capacity_liters: carForm.cargo_capacity_liters !== '' ? Number(carForm.cargo_capacity_liters) : undefined,
          payload_kg: carForm.payload_kg !== '' ? Number(carForm.payload_kg) : undefined,
          ground_clearance_mm: carForm.ground_clearance_mm !== '' ? Number(carForm.ground_clearance_mm) : undefined,

          tires_wheels: carForm.tires_wheels || undefined,
          cargo_capacity_folded_liters: carForm.cargo_capacity_folded_liters !== '' ? Number(carForm.cargo_capacity_folded_liters) : undefined,
          turning_diameter_m: carForm.turning_diameter_m !== '' ? carForm.turning_diameter_m : undefined,
          roof_load_capacity_kg: carForm.roof_load_capacity_kg !== '' ? carForm.roof_load_capacity_kg : undefined,
          dc_charge_from_percent: carForm.dc_charge_from_percent !== '' ? Number(carForm.dc_charge_from_percent) : undefined,
          dc_charge_to_percent: carForm.dc_charge_to_percent !== '' ? Number(carForm.dc_charge_to_percent) : undefined,
          price_info_text: carForm.price_info_text || undefined,
          charging_info_text: carForm.charging_info_text || undefined,
          range_condition_text: carForm.range_condition_text || undefined,
          regenerative_braking: carForm.regenerative_braking || undefined,
          technical_specs_text: carForm.technical_specs_text || undefined,

          front_brake: carForm.front_brake || undefined,
          rear_brake: carForm.rear_brake || undefined,
          front_suspension: carForm.front_suspension || undefined,
          rear_suspension: carForm.rear_suspension || undefined,

          engine_type: carForm.engine_type || undefined,
          battery_type: carForm.battery_type || undefined,
          transmission: carForm.transmission || undefined,
          curb_weight_kg: carForm.curb_weight_kg !== '' ? Number(carForm.curb_weight_kg) : undefined,
          standard_charger: carForm.standard_charger || undefined,
          acceleration_0_50_seconds: carForm.acceleration_0_50_seconds || undefined,
          motor_power_hp: carForm.motor_power_hp !== '' ? Number(carForm.motor_power_hp) : undefined,

          drivetrain: carForm.drivetrain || undefined,
          warranty_text: carForm.warranty_text || undefined,
          description_text: carForm.description || undefined,

          colors: colorsArr.length > 0 ? colorsArr : undefined,
          exterior_features,
          interior_features,
          safety_features,
          driver_assistance_features,
          smart_features: existingSmartFeatures,
        };

        packedSpecs = cleanObject(additionalSpecs) || {};
      } else {
        const motorbikeColors = (carForm.colors_text || '')
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);

        const lighting_features = {
          headlight: carForm.headlight || undefined,
          tail_light: carForm.tail_light || undefined,
          turn_signal: carForm.turn_signal || undefined,
        };

        const technology_features = {
          battery_swap: carForm.battery_swap === true || (carForm.battery_swap as any) === 'true',
          smart_management: carForm.smart_management || undefined,
          license_requirement: carForm.license_requirement || undefined,
        };

        const additionalSpecs: any = {
          model_year: carForm.model_year !== '' ? Number(carForm.model_year) : undefined,
          wet_weight_kg: carForm.wet_weight_kg !== '' ? Number(carForm.wet_weight_kg) : undefined,
          underseat_storage_liters: carForm.underseat_storage_liters !== '' ? Number(carForm.underseat_storage_liters) : undefined,
          water_resistance_standard: carForm.water_resistance_standard || undefined,
          motor_type: carForm.motor_type || undefined,
          battery_type: carForm.battery_type || undefined,
          charger_type: carForm.charger_type || undefined,
          charger_power_w: carForm.charger_power_w !== '' ? Number(carForm.charger_power_w) : undefined,
          battery_quantity: carForm.battery_quantity !== '' ? Number(carForm.battery_quantity) : undefined,
          battery_voltage_v: carForm.battery_voltage_v !== '' ? Number(carForm.battery_voltage_v) : undefined,
          battery_capacity_ah: carForm.battery_capacity_ah !== '' ? Number(carForm.battery_capacity_ah) : undefined,
          rated_motor_power_w: carForm.rated_motor_power_w !== '' ? Number(carForm.rated_motor_power_w) : undefined,
          removable_battery: carForm.removable_battery === true || (carForm.removable_battery as any) === 'true',
          battery_swap_supported: carForm.battery_swap_supported === true || (carForm.battery_swap_supported as any) === 'true',

          front_tire: carForm.front_tire || undefined,
          rear_tire: carForm.rear_tire || undefined,
          front_brake: carForm.front_brake || undefined,
          rear_brake: carForm.rear_brake || undefined,
          front_suspension: carForm.front_suspension || undefined,
          rear_suspension: carForm.rear_suspension || undefined,
          warranty_text: carForm.warranty_text || undefined,
          price_info_text: carForm.price_info_text || undefined,
          battery_location: carForm.battery_location || undefined,
          description_text: carForm.description || undefined,
          charging_info_text: carForm.charging_info_text || undefined,
          range_condition_text: carForm.range_condition_text || undefined,
          technical_specs_text: carForm.technical_specs_text || undefined,
          battery_capacity_text: carForm.battery_capacity_text || undefined,

          colors: motorbikeColors.length > 0 ? motorbikeColors : undefined,
          lighting_features,
          technology_features,
          smart_features: existingSmartFeatures,
        };

        packedSpecs = cleanObject(additionalSpecs) || {};
      }

      if (isScooter) {
        if (carForm.battery_type) formData.append('battery_type', carForm.battery_type);
        if (carForm.motor_type) formData.append('motor_type', carForm.motor_type);
        if (carForm.usable_battery_capacity !== '') formData.append('battery_capacity_kwh', String(carForm.usable_battery_capacity));
        if (carForm.maximum_power_kw !== '') formData.append('maximum_motor_power_w', String(carForm.maximum_power_kw));
        if (carForm.battery_quantity !== '') formData.append('battery_quantity', String(carForm.battery_quantity));
        if (carForm.charging_time_minutes !== '') formData.append('charging_time_minutes', String(carForm.charging_time_minutes));
        if (carForm.maximum_speed_kmh !== '') formData.append('maximum_speed_kmh', String(carForm.maximum_speed_kmh));
      }

      const finalSpecsStr = JSON.stringify(packedSpecs);
      formData.append('additional_specs_json', finalSpecsStr);
      formData.append('specs_json', finalSpecsStr);

      if (carImageFile) {
        formData.append('image', carImageFile);
      } else if (carForm.image_url) {
        formData.append('image_url', carForm.image_url);
      }

      // Legacy fallback fields for safety
      formData.append('name', carForm.model_name || '');
      formData.append('code', carForm.vehicle_line || '');
      formData.append('base_price', String(carForm.list_price || 0));
      formData.append('is_available', isActiveBool ? 'true' : 'false');

      let successMsgText = '';
      if (editingCar) {
        const carId = editingCar.car_id || editingCar.id || editingCar.motorbike_id;
        if (isScooter) {
          await api.updateMotorbike(carId, formData);
          successMsgText = `Đã cập nhật xe máy điện ${carForm.model_name || ''}!`;
        } else {
          await api.updateCar(carId, formData);
          successMsgText = `Đã cập nhật ô tô ${carForm.model_name || ''}!`;
        }
      } else {
        if (isScooter) {
          await api.createMotorbike(formData);
          successMsgText = `Đã thêm mẫu xe máy điện mới ${carForm.model_name || ''}!`;
        } else {
          await api.createCar(formData);
          successMsgText = `Đã thêm mẫu ô tô điện mới ${carForm.model_name || ''}!`;
        }
      }

      setMsg(successMsgText);
      setErrorMsg('');
      setShowCarModal(false);
      fetchData();
      triggerSuccessModal(editingCar ? 'Cập Nhật Thành Công!' : 'Thêm Mẫu Xe Thành Công!', successMsgText, editingCar ? 'edit' : 'add');
    } catch (err: any) {
      console.error('Error saving car:', err);
      const errMsgText = err.message || 'Lưu thông tin mẫu xe thất bại.';
      setErrorMsg(errMsgText);
      setMsg(errMsgText);
      alert(`⚠️ Không thể lưu xe: ${errMsgText}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = (carId: string, carName: string) => {
    setDeleteTarget({ type: 'car', id: carId, name: carName });
  };

  const handleToggleCarAvailability = async (car: any) => {
    try {
      const carId = car.car_id || car.id;
      const currentStatus = car.is_active ?? car.is_available;
      const newStatus = !currentStatus;
      const formData = new FormData();
      formData.append('is_available', String(newStatus));
      await api.updateCar(carId, formData);
      setCars((prev) => prev.map((c) => ((c.car_id === carId || c.id === carId) ? { ...c, is_active: newStatus, is_available: newStatus } : c)));
      setMsg(`Đã đổi trạng thái ${car.model_name || car.name} sang: ${newStatus ? 'Đang mở bán' : 'Tạm ngưng'}`);
    } catch {
      setMsg('Lỗi khi cập nhật trạng thái mẫu xe');
    }
  };

  const handleUpdateQuote = async (quoteId: string, status: string) => {
    try {
      setLoading(true);
      const payload = { status, updated_at: new Date().toISOString() };
      let updated = false;

      try {
        await api.updateQuoteStatus(quoteId, payload);
        updated = true;
      } catch (err) {
        console.warn('[AdminDashboard] API updateQuoteStatus failed, syncing Supabase directly:', err);
      }

      try {
        const { error } = await supabase.from('quotes').update(payload).eq('id', quoteId);
        if (!error) updated = true;
      } catch (err) {
        console.warn('[AdminDashboard] Supabase update failed:', err);
      }

      if (updated) {
        setMsg(`Đã cập nhật trạng thái báo giá thành: ${status === 'approved' ? '🟢 Đã duyệt' : status === 'rejected' ? '🔴 Từ chối' : status}`);
        fetchData();
      } else {
        setMsg('Cập nhật báo giá thất bại. Vui lòng kiểm tra lại quyền hạn.');
      }
    } catch (err: any) {
      setMsg(err.message || 'Cập nhật báo giá thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (bookingId: string, status: string) => {
    try {
      setLoading(true);
      await api.updateBookingStatus(bookingId, { status });
      setMsg(`Đã cập nhật trạng thái lịch hẹn thành: ${status}`);
      fetchData();
    } catch (err: any) {
      setMsg(err.message || 'Cập nhật lịch hẹn thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportQuotesCSV = () => {
    if (!quotes || quotes.length === 0) {
      alert('Chưa có dữ liệu báo giá để xuất Excel');
      return;
    }
    let csvContent = '\uFEFFHo va Ten,So Dien Thoai,Mau Xe,Gia Niem Yet,Trang Thai,Ngay Tao\n';
    quotes.forEach((q) => {
      csvContent += `"${q.customer_name || ''}","${q.customer_phone || ''}","${q.vehicle_name || ''}","${q.base_price || 0}","${q.status || 'Chờ xác nhận'}","${q.created_at ? new Date(q.created_at).toLocaleDateString('vi-VN') : ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VinFast_BaoGia_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportBookingsCSV = () => {
    if (!bookings || bookings.length === 0) {
      alert('Chưa có dữ liệu lịch hẹn lái thử để xuất Excel');
      return;
    }
    let csvContent = '\uFEFFHo va Ten,So Dien Thoai,Xe Dang Ky,Ngay Hen,Khung Gio,Trang Thai\n';
    bookings.forEach((b) => {
      csvContent += `"${b.customer_name || ''}","${b.customer_phone || ''}","${b.vehicle_name || ''}","${b.preferred_date || ''}","${b.preferred_time || ''}","${b.status || 'Chờ xác nhận'}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VinFast_LaiThu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCarModal) {
          setShowCarModal(false);
        } else if (showCreateStaff) {
          setShowCreateStaff(false);
        } else if (open) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, showCarModal, showCreateStaff, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-800 font-sans">

      {/* Top Navigation Bar */}
      <div className="bg-slate-950 text-white px-6 py-3 flex items-center justify-between shrink-0 border-b border-slate-800/80 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            {/* VinFast Official V Icon */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-inner border border-white/20">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-widest text-white uppercase font-sans">VINFAST</span>
                <span className="text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full tracking-wider">
                  Admin Center
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium block">Hệ thống Quản trị Doanh nghiệp</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-blue-400' : 'text-slate-400'} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm border border-red-500/50"
          >
            <X size={15} />
            <span>Thoát</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden bg-slate-100">

        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 shrink-0 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Danh mục Quản trị
            </div>
            {[
              { id: 'users', label: 'Tài khoản Staff & Admin', icon: Users, count: users.length },
              { id: 'cars', label: 'Catalog Ô tô & Xe Dịch vụ', icon: Car, count: cars.length },
              { id: 'motorbikes', label: 'Catalog Xe Máy Điện', icon: Zap, count: motorbikes.length },
              { id: 'quotes', label: 'Quản lý Báo giá (HITL)', icon: FileText, count: quotes.length },
              { id: 'bookings', label: 'Lịch Đặt Lái Thử', icon: Calendar, count: bookings.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${active
                      ? 'bg-blue-900 text-white shadow-md font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className={active ? 'text-blue-300' : 'text-slate-500'} />
                    <span>{tab.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs">
            <div className="font-bold text-slate-800">Database Status</div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PostgreSQL Connected
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">

          {/* Top Search Bar */}
          <div className="bg-white px-6 py-3 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Tìm kiếm trong ${activeTab === 'users' ? 'tài khoản nhân viên' : activeTab === 'cars' ? 'catalog xe' : activeTab === 'quotes' ? 'báo giá' : 'lịch lái thử'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-8 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="text-xs font-semibold text-slate-500 hidden sm:block">
              {searchQuery ? (
                <span className="text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Tìm thấy: {activeTab === 'users' ? filteredUsers.length : activeTab === 'cars' ? filteredCars.length : activeTab === 'quotes' ? filteredQuotes.length : filteredBookings.length} kết quả
                </span>
              ) : (
                <span>Tổng số: <strong>{activeTab === 'users' ? users.length : activeTab === 'cars' ? cars.length : activeTab === 'quotes' ? quotes.length : bookings.length}</strong> {activeTab === 'users' ? 'tài khoản' : activeTab === 'cars' ? 'mẫu xe' : activeTab === 'quotes' ? 'báo giá' : 'lịch lái thử'}</span>
              )}
            </div>
          </div>



          {/* Alert Message Banner */}
          {msg && (
            <div className={`mx-6 mt-4 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shrink-0 shadow-sm ${msg.includes('thành công') ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-red-50 text-red-800 border border-red-300'
              }`}>
              <span>{msg}</span>
              <button onClick={() => setMsg('')} className="text-slate-400 hover:text-slate-700"><X size={14} /></button>
            </div>
          )}

          {/* Scrollable Main Area */}
          <div className="flex-1 p-6 overflow-y-auto">

            {/* TAB 1: USERS MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Danh sách Tài khoản & Nhân viên ({users.length})</h3>
                    <p className="text-xs text-slate-500">Quản lý cấp tài khoản, phân quyền và khóa/xóa tài khoản</p>
                  </div>
                  <button
                    onClick={() => setShowCreateStaff(!showCreateStaff)}
                    className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0"
                  >
                    <UserPlus size={16} />
                    <span>Cấp tài khoản Nhân viên mới</span>
                  </button>
                </div>

                {/* Form Create Staff */}
                {showCreateStaff && (
                  <form onSubmit={handleCreateStaffSubmit} className="p-5 bg-white rounded-2xl border-2 border-blue-600 shadow-xl space-y-4">
                    <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">Cấp tài khoản Nhân viên / Quản trị viên mới</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email đăng nhập</label>
                        <input
                          type="email"
                          required
                          placeholder="sale@vinfast.vn"
                          value={staffForm.email}
                          onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-xl focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Họ và tên</label>
                        <input
                          type="text"
                          required
                          placeholder="Nguyễn Văn A"
                          value={staffForm.full_name}
                          onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-xl focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Số điện thoại</label>
                        <input
                          type="text"
                          required
                          placeholder="0901234567"
                          value={staffForm.phone}
                          onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-xl focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vai trò (Role)</label>
                        <select
                          value={staffForm.role}
                          onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-xl bg-white focus:border-blue-600 focus:outline-none font-semibold text-slate-800"
                        >
                          <option value="consultant">Tư vấn viên (Staff)</option>
                          <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700 uppercase">Mật khẩu ban đầu</label>
                          <button
                            type="button"
                            onClick={() => {
                              const randPass = 'Vinfast@' + Math.floor(100000 + Math.random() * 900000);
                              setStaffForm({ ...staffForm, password: randPass });
                            }}
                            className="text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            Tạo ngẫu nhiên
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Nhập mật khẩu"
                          value={staffForm.password}
                          onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-xl focus:border-blue-600 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setShowCreateStaff(false)} className="px-4 py-2 text-xs font-bold border rounded-xl">Hủy</button>
                      <button type="submit" disabled={loading} className="px-5 py-2 text-xs bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 shadow-md">
                        {loading ? 'Đang tạo...' : 'Tạo tài khoản ngay'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit User Form Modal */}
                {editingUser && (
                  <form onSubmit={handleEditUserSubmit} className="p-5 bg-white rounded-2xl border-2 border-amber-500 shadow-xl space-y-4">
                    <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">Chỉnh sửa tài khoản: {editingUser.email}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Họ và tên</label>
                        <input
                          type="text"
                          value={editUserForm.full_name}
                          onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Số điện thoại</label>
                        <input
                          type="text"
                          value={editUserForm.phone}
                          onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phân quyền (Role)</label>
                        <select
                          value={editUserForm.role}
                          onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-xl bg-white"
                        >
                          <option value="customer">Khách hàng (Customer)</option>
                          <option value="consultant">Tư vấn viên (Consultant)</option>
                          <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-xs border rounded-xl">Hủy</button>
                      <button type="submit" disabled={loading} className="px-5 py-2 text-xs bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700">
                        {loading ? 'Đang lưu...' : 'Lưu chỉnh sửa'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Họ và tên</th>
                        <th className="p-3.5">Email VinFast</th>
                        <th className="p-3.5">Số điện thoại</th>
                        <th className="p-3.5">Vai trò (Role)</th>
                        <th className="p-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{u.full_name}</td>
                          <td className="p-3.5 text-slate-600 font-medium">{u.email}</td>
                          <td className="p-3.5 text-slate-600">{u.phone}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.role === 'admin'
                                ? 'bg-red-100 text-red-700 border border-red-300'
                                : u.role === 'consultant'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                              {u.role === 'admin' ? 'ADMIN (Quản trị)' : u.role === 'consultant' ? 'Tư vấn viên (Staff)' : 'Khách hàng'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setEditUserForm({ full_name: u.full_name, phone: u.phone, role: u.role, password: '' });
                              }}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Sửa thông tin"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'user', id: u.id, name: u.email })}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa tài khoản"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: CARS MANAGEMENT */}
            {activeTab === 'cars' && (
              <div className="space-y-5">
                {/* Header & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Danh mục Mẫu xe VinFast ({cars.length})</h3>
                    <p className="text-xs text-slate-500">Quản lý thông số kỹ thuật, bảng giá và phân loại các dòng xe</p>
                  </div>
                  <button
                    onClick={handleOpenAddCar}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0"
                  >
                    <Plus size={18} />
                    <span>+ Thêm Mẫu Xe Mới</span>
                  </button>
                </div>

                {/* Sub-Category Filter Tabs */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                  {[
                    { id: 'all', label: 'Tất cả ô tô', count: cars.length },
                    { id: 'suv', label: 'Ô tô điện cá nhân', count: cars.filter(c => parseVehicleCategory(c) === 'suv').length },
                    { id: 'commercial', label: 'Xe dịch vụ & Thương mại', count: cars.filter(c => parseVehicleCategory(c) === 'commercial').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setCarCategoryFilter(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${carCategoryFilter === tab.id
                          ? 'bg-blue-900 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${carCategoryFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Cars Vertical List Layout */}
                <div className="space-y-3">
                  {filteredCarsByCategory.map((c) => {
                    const specs = c.specs || {};
                    const engine_items = specs.engine_drivetrain?.items || specs.engine_drivetrain || {};
                    const dim_items = specs.dimensions_weight?.items || specs.dimensions_weight || {};

                    return (
                      <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 grid grid-cols-12 gap-4 items-center hover:shadow-md transition-all">

                        {/* Left: Thumbnail & Main Info (Col 1-5) */}
                        <div className="col-span-12 lg:col-span-5 flex items-center gap-3.5 min-w-0">
                          <div className="w-28 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative border border-slate-100 shadow-inner">
                            <img src={getImageUrl(c.image_url)} alt={c.name} className="w-full h-full object-cover" />
                            <span className={`absolute top-1 left-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white shadow-sm uppercase ${(c.is_active ?? c.is_available) ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                              {(c.is_active ?? c.is_available) ? 'Mở bán' : 'Tạm ngưng'}
                            </span>
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-extrabold text-slate-900 truncate">{c.model_name || c.name}</h4>
                              {(c.vehicle_line || c.code) && (
                                <span className="text-[10px] font-mono bg-blue-50 text-blue-800 font-bold px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                                  {c.vehicle_line || c.code}
                                </span>
                              )}
                              <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded uppercase shrink-0">
                                {c.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{c.version ? `Phiên bản: ${c.version}` : (c.description || 'Chưa có mô tả')}</p>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-xs font-black text-red-600 shrink-0">{formatVNDPrice(c.list_price || c.base_price)}</span>
                              {c.battery_buy_price > 0 && (
                                <span className="text-[11px] text-slate-500 font-semibold truncate">| Mua: {formatVNDPrice(c.battery_buy_price)}</span>
                              )}
                              {c.battery_rent_monthly > 0 && (
                                <span className="text-[11px] text-slate-400 font-normal shrink-0">| Thuê: {(c.battery_rent_monthly / 1000).toLocaleString('vi-VN')}k/tháng</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Key Tech Specs Tags (Col 6-9 - Fixed Alignment) */}
                        <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                          {(() => {
                            const isCommercial = parseVehicleCategory(c) === 'commercial';

                            if (isCommercial) {
                              return (
                                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-slate-600">
                                  <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 text-center">
                                    <span className="text-[9px] text-slate-600 font-bold block uppercase truncate">Sức chứa</span>
                                    <strong className="text-slate-900 text-xs font-black truncate block">{c.seat_count || dim_items.seats || specs.seating_capacity || 30} chỗ</strong>
                                  </div>
                                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-100 text-center">
                                    <span className="text-[9px] text-blue-600 font-bold block uppercase truncate">Quãng đường</span>
                                    <strong className="text-blue-900 text-xs font-black truncate block">{c.range_km ? `${c.range_km} km` : (engine_items.range_km || specs.driving_range || '340 km')}</strong>
                                  </div>
                                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100 text-center">
                                    <span className="text-[9px] text-emerald-700 font-bold block uppercase truncate">Ứng dụng</span>
                                    <strong className="text-emerald-900 text-xs font-black truncate block">Dịch Vụ</strong>
                                  </div>
                                  <div className="bg-purple-50 p-2 rounded-xl border border-purple-100 text-center">
                                    <span className="text-[9px] text-purple-700 font-bold block uppercase truncate">Chuẩn sạc</span>
                                    <strong className="text-purple-900 text-xs font-black truncate block">{engine_items.fast_charge_time || 'Sạc DC'}</strong>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-slate-600">
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase truncate">Công suất</span>
                                  <strong className="text-slate-900 text-xs font-extrabold truncate block">{c.maximum_power_kw ? `${c.maximum_power_kw} kW` : (engine_items.power_hp || specs.motor_power || 'N/A')}</strong>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase truncate">Quãng đường</span>
                                  <strong className="text-blue-700 text-xs font-extrabold truncate block">{c.range_km ? `${c.range_km} km` : (engine_items.range_km || specs.driving_range || 'N/A')}</strong>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase truncate">Chỗ ngồi</span>
                                  <strong className="text-slate-900 text-xs font-extrabold truncate block">{c.seat_count ? `${c.seat_count} chỗ` : (dim_items.seats || '5 chỗ')}</strong>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                  <span className="text-[9px] text-slate-400 font-bold block uppercase truncate">Dung lượng Pin</span>
                                  <strong className="text-slate-900 text-xs font-extrabold truncate block">{c.usable_battery_capacity ? `${c.usable_battery_capacity} kWh` : (engine_items.drivetrain || 'Pin LFP')}</strong>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Right: Actions (Col 10-12) */}
                        <div className="col-span-12 lg:col-span-3 flex items-center justify-end gap-2 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 shrink-0">
                          <button
                            onClick={() => handleToggleCarAvailability(c)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all border shadow-sm ${
                              (c.is_active ?? c.is_available)
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Click để Đổi trạng thái Mở bán / Tạm ngưng"
                          >
                            <span className={`w-2 h-2 rounded-full ${(c.is_active ?? c.is_available) ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{(c.is_active ?? c.is_available) ? 'Mở bán' : 'Tạm ngưng'}</span>
                          </button>
                          <button
                            onClick={() => setViewingCar(c)}
                            className="px-3 py-1.5 text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-all border border-blue-200 flex items-center gap-1 shadow-sm"
                            title="Xem chi tiết thông số kỹ thuật"
                          >
                            <Eye size={14} />
                            <span>Chi tiết</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditCar(c)}
                            className="px-3 py-1.5 text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl transition-all border border-amber-200 flex items-center gap-1 shadow-sm"
                            title="Chỉnh sửa thông số & hình ảnh"
                          >
                            <Edit3 size={14} />
                            <span>Sửa xe</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCar(c.car_id || c.id, c.model_name || c.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                            title="Xóa mẫu xe"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: E-SCOOTERS MANAGEMENT */}
            {activeTab === 'motorbikes' && (
              <div className="space-y-5">
                {/* Header & Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Zap className="text-amber-500 fill-amber-500" size={18} />
                      <span>Catalog Xe Máy Điện VinFast ({motorbikes.length})</span>
                    </h3>
                    <p className="text-xs text-slate-500">Quản lý 15 mẫu xe máy điện thông minh, giá niêm yết & tóm tắt RAG</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCar(null);
                      setCarForm({
                        name: '', code: '', category: 'scooter', base_price: 25000000,
                        battery_buy_price: 35000000, battery_rent_monthly: 350000, is_available: true,
                        description: '', image_url: '', engine_type: 'Động cơ BLDC In-hub', power_hp: '1500 W',
                        torque_nm: '70 km/h', drivetrain: 'Pin LFP', battery_capacity_kwh: '3.5 kWh', range_km: '200 km',
                        fast_charge_time: '4 giờ', seats: 22, dimensions_mm: '1910 x 692 x 1083 mm', wheelbase_mm: '770 mm',
                        ground_clearance_mm: '100 kg', wheels_rims: '14 inch', infotainment_screen: 'Phanh đĩa / CBS',
                        speakers: 'Khóa Smartkey', seat_material: 'Eco / Sport', airbags: 0, has_adas: false,
                      });
                      setCarImageFile(null);
                      setShowCarModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0"
                  >
                    <Plus size={18} />
                    <span>+ Thêm Xe Máy Điện Mới</span>
                  </button>
                </div>

                {/* E-Scooters List */}
                <div className="space-y-3">
                  {motorbikes
                    .filter((s) => !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.code?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((s) => {
                      const specs = s.specs || {};
                      return (
                        <div key={s.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 grid grid-cols-12 gap-4 items-center hover:shadow-md transition-all">
                          {/* Left: Thumbnail & Info (Col 1-5) */}
                          <div className="col-span-12 lg:col-span-5 flex items-center gap-3.5 min-w-0">
                            <div className="w-28 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative border border-slate-100 shadow-inner">
                              <img src={getImageUrl(s.image_url)} alt={s.name} className="w-full h-full object-cover" />
                              <span className={`absolute top-1 left-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded text-white uppercase ${s.is_available ? 'bg-emerald-600' : 'bg-slate-600'}`}>
                                {s.is_available ? 'Mở bán' : 'Tạm ngưng'}
                              </span>
                            </div>
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-extrabold text-slate-900 truncate">{s.name}</h4>
                                <span className="text-[10px] font-mono bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                                  {s.code}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-1">{s.description || 'Chưa có mô tả'}</p>
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-xs font-black text-red-600 shrink-0">{formatVNDPrice(s.base_price)}</span>
                                {s.battery_rent_monthly > 0 && (
                                  <span className="text-[11px] text-slate-400 font-medium shrink-0">| Thuê pin: {(s.battery_rent_monthly / 1000).toLocaleString('vi-VN')}k/tháng</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Tech Specs (Col 6-9 - Fixed Alignment) */}
                          <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-4">
                            <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100 text-center">
                                <span className="text-[9px] text-amber-700 font-bold block uppercase truncate">Vận tốc max</span>
                                <strong className="text-amber-950 text-xs font-black truncate block">{specs.top_speed || '70 km/h'}</strong>
                              </div>
                              <div className="bg-blue-50/70 p-2 rounded-xl border border-blue-100 text-center">
                                <span className="text-[9px] text-blue-700 font-bold block uppercase truncate">Tầm xa max</span>
                                <strong className="text-blue-950 text-xs font-black truncate block">{specs.range_km ? `${specs.range_km} km` : '198 km'}</strong>
                              </div>
                              <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100 text-center">
                                <span className="text-[9px] text-emerald-700 font-bold block uppercase truncate">Cốp xe</span>
                                <strong className="text-emerald-950 text-xs font-black truncate block">{specs.trunk_l ? `${specs.trunk_l} Lít` : '22 Lít'}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Actions (Col 10-12) */}
                          <div className="col-span-12 lg:col-span-3 flex items-center justify-end gap-2 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 shrink-0">
                            <button
                              onClick={async () => {
                                const newStatus = !s.is_available;
                                const formData = new FormData();
                                formData.append('is_available', String(newStatus));
                                await api.updateEScooter(s.id, formData);
                                setMotorbikes((prev) => prev.map((item) => (item.id === s.id ? { ...item, is_available: newStatus } : item)));
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all border shadow-sm ${s.is_available ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                            >
                              <span>{s.is_available ? 'Mở bán' : 'Tạm ngưng'}</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditCar(s)}
                              className="px-3.5 py-2 text-xs bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-200 flex items-center gap-1.5 shadow-sm"
                            >
                              <Edit3 size={15} />
                              <span>Sửa xe</span>
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'motorbike', id: s.id, name: s.name })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Xóa xe máy điện"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 3: QUOTES (Enhanced CRM & Filter & Export) */}
            {activeTab === 'quotes' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Quản lý Yêu cầu Báo giá Khách hàng ({quotes.length})</h3>
                    <p className="text-xs text-slate-500">Tiếp nhận yêu cầu báo giá lăn bánh, phê duyệt tư vấn viên (HITL workflow)</p>
                  </div>
                  <button
                    onClick={handleExportQuotesCSV}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shrink-0"
                  >
                    <Download size={16} />
                    <span>Xuất báo cáo Excel (.CSV)</span>
                  </button>
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                  {[
                    { id: 'all', label: 'Tất cả yêu cầu', count: quotes.length },
                    { id: 'pending', label: '🟡 Chờ xác nhận', count: quotes.filter((q) => !q.status || q.status.toLowerCase() === 'pending').length },
                    { id: 'contacted', label: '🔵 Đã liên hệ tư vấn', count: quotes.filter((q) => q.status?.toLowerCase() === 'contacted').length },
                    { id: 'approved', label: '🟢 Đã duyệt & Gửi giá', count: quotes.filter((q) => q.status?.toLowerCase() === 'approved' || q.status?.toLowerCase() === 'completed').length },
                    { id: 'cancelled', label: '🔴 Đã hủy', count: quotes.filter((q) => q.status?.toLowerCase() === 'cancelled').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setQuoteStatusFilter(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${quoteStatusFilter === tab.id
                          ? 'bg-blue-900 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${quoteStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Quotes Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Khách hàng</th>
                        <th className="p-3.5">Số điện thoại</th>
                        <th className="p-3.5">Mẫu xe quan tâm</th>
                        <th className="p-3.5">Giá niêm yết</th>
                        <th className="p-3.5">Trạng thái xử lý</th>
                        <th className="p-3.5 text-right">Cập nhật nhanh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredQuotes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                            Không tìm thấy yêu cầu báo giá phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredQuotes.map((q) => (
                          <tr key={q.id} className="hover:bg-slate-50 transition-all">
                            <td className="p-3.5 font-bold text-slate-900">{q.customer_name}</td>
                            <td className="p-3.5 text-slate-600 font-mono">{q.customer_phone}</td>
                            <td className="p-3.5 font-extrabold text-blue-900">{q.vehicle_name}</td>
                            <td className="p-3.5 text-red-600 font-black">{formatVNDPrice(q.base_price)}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${q.status === 'approved' || q.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : q.status === 'contacted'
                                    ? 'bg-blue-100 text-blue-800'
                                    : q.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                {q.status === 'approved' || q.status === 'completed'
                                  ? '🟢 Đã duyệt'
                                  : q.status === 'contacted'
                                    ? '🔵 Đã liên hệ'
                                    : q.status === 'cancelled'
                                      ? '🔴 Đã hủy'
                                      : '🟡 Chờ xác nhận'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {(q.status === 'pending' || q.status === 'contacted') && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateQuote(q.id, 'rejected')}
                                      disabled={loading}
                                      className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                                    >
                                      Từ chối
                                    </button>
                                    <button
                                      onClick={() => handleUpdateQuote(q.id, 'approved')}
                                      disabled={loading}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                                    >
                                      Duyệt ✓
                                    </button>
                                  </>
                                )}
                                {q.status === 'approved' && (
                                  <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">✅ Đã duyệt</span>
                                )}
                                {q.status === 'rejected' && (
                                  <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold">❌ Đã từ chối</span>
                                )}
                                {q.status === 'cancelled' && (
                                  <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold">❌ Đã hủy</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: BOOKINGS (Enhanced CRM & Filter & Export) */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Quản lý Lịch Đặt Lái Thử Trực Tuyến ({bookings.length})</h3>
                    <p className="text-xs text-slate-500">Điều phối lịch hẹn trải nghiệm thực tế xe tại đại lý VinFast toàn quốc</p>
                  </div>
                  <button
                    onClick={handleExportBookingsCSV}
                    className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shrink-0"
                  >
                    <Download size={16} />
                    <span>Xuất báo cáo Excel (.CSV)</span>
                  </button>
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                  {[
                    { id: 'all', label: 'Tất cả lịch hẹn', count: bookings.length },
                    { id: 'pending', label: '🟡 Chờ xác nhận', count: bookings.filter((b) => !b.status || b.status.toLowerCase() === 'pending').length },
                    { id: 'confirmed', label: '🔵 Đã xác nhận hẹn', count: bookings.filter((b) => b.status?.toLowerCase() === 'confirmed').length },
                    { id: 'completed', label: '🟢 Đã hoàn tất lái thử', count: bookings.filter((b) => b.status?.toLowerCase() === 'completed').length },
                    { id: 'cancelled', label: '🔴 Đã hủy hẹn', count: bookings.filter((b) => b.status?.toLowerCase() === 'cancelled').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setBookingStatusFilter(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${bookingStatusFilter === tab.id
                          ? 'bg-blue-900 text-white shadow-md'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${bookingStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">Khách hàng</th>
                        <th className="p-3.5">Số điện thoại</th>
                        <th className="p-3.5">Xe đăng ký</th>
                        <th className="p-3.5">Ngày & Khung giờ hẹn</th>
                        <th className="p-3.5">Trạng thái</th>
                        <th className="p-3.5 text-right">Cập nhật nhanh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                            Không tìm thấy lịch đặt lái thử phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50 transition-all">
                            <td className="p-3.5 font-bold text-slate-900">{b.customer_name}</td>
                            <td className="p-3.5 text-slate-600 font-mono">{b.customer_phone}</td>
                            <td className="p-3.5 font-extrabold text-blue-900">{b.vehicle_name}</td>
                            <td className="p-3.5 text-slate-700 font-medium">{b.preferred_date} ({b.preferred_time})</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${b.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : b.status === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800 animate-pulse'
                                }`}>
                                {b.status === 'completed'
                                  ? '🟢 Đã lái thử'
                                  : b.status === 'confirmed'
                                    ? '🔵 Đã xác nhận'
                                    : b.status === 'cancelled'
                                      ? '🔴 Đã hủy'
                                      : '🟡 Chờ xác nhận'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <select
                                value={b.status || 'pending'}
                                onChange={(e) => handleUpdateBooking(b.id, e.target.value)}
                                className="text-xs p-1.5 border rounded-xl bg-white font-bold text-slate-800 focus:border-blue-600 focus:outline-none"
                              >
                                <option value="pending">🟡 Chờ xác nhận</option>
                                <option value="confirmed">🔵 Đã xác nhận hẹn</option>
                                <option value="completed">🟢 Hoàn tất lái thử</option>
                                <option value="cancelled">🔴 Hủy lịch hẹn</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Dedicated Full-Screen Edit / Create Vehicle Modal Page */}
      {showCarModal && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto font-sans">
          <form onSubmit={handleSaveCarSubmit} className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">

            {/* Full-screen Edit Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 sm:px-6 sm:py-4 flex items-center justify-between shrink-0 border-b border-emerald-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCarModal(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition-all border border-white/15 shadow-sm"
                >
                  <ArrowRight size={16} className="rotate-180" />
                  <span>Quay lại Catalog</span>
                </button>
                <div className="h-5 w-px bg-white/20 hidden sm:block" />
                <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wide flex items-center gap-2">
                  <Car className="text-emerald-400" size={18} />
                  {editingCar ? `Trang Chỉnh Sửa Thông Số: ${editingCar.model_name || editingCar.name}` : 'Thêm Mẫu Xe VinFast Mới vào PostgreSQL'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveCarSubmit()}
                  disabled={loading}
                  className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCarModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {errorMsg && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                  <button type="button" onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-800 font-black p-1">✕</button>
                </div>
              )}

              {/* SECTION 1: THÔNG TIN CƠ BẢN VÀ GIÁ */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg">
                  1. Thông tin cơ bản & Giá niêm yết (PostgreSQL Catalog)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tên mẫu xe (`model_name`) *</label>
                    <input
                      type="text"
                      placeholder="VD: VinFast VF 8 Plus"
                      value={carForm.model_name || ''}
                      onChange={(e) => setCarForm({ ...carForm, model_name: e.target.value })}
                      className="w-full text-xs p-2.5 border rounded-xl focus:border-emerald-600 focus:outline-none font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Dòng xe (`vehicle_line`) *</label>
                    <input
                      type="text"
                      placeholder="VD: VF 8"
                      value={carForm.vehicle_line || ''}
                      onChange={(e) => setCarForm({ ...carForm, vehicle_line: e.target.value })}
                      className="w-full text-xs p-2.5 border rounded-xl focus:border-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phiên bản (`version`)</label>
                    <input
                      type="text"
                      placeholder="VD: Plus / Eco / Service / Base"
                      value={carForm.version || ''}
                      onChange={(e) => setCarForm({ ...carForm, version: e.target.value })}
                      className="w-full text-xs p-2.5 border rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Phân loại (`category`)</label>
                    {activeTab === 'motorbikes' ? (
                      <select
                        value={carForm.category || 'Scooter'}
                        onChange={(e) => setCarForm({ ...carForm, category: e.target.value })}
                        className="w-full text-xs p-2.5 border rounded-xl bg-white font-semibold"
                      >
                        <option value="motor bike">Xe máy điện cao cấp (Motorbike)</option>
                        <option value="E-Bike">Xe đạp điện trợ lực (E-Bike)</option>
                        <option value="LFP">Xe máy điện Pin LFP (LFP)</option>
                      </select>
                    ) : (
                      <select
                        value={carForm.category || 'Personal'}
                        onChange={(e) => setCarForm({ ...carForm, category: e.target.value })}
                        className="w-full text-xs p-2.5 border rounded-xl bg-white font-semibold"
                      >
                        <option value="Personal">Ô tô điện cá nhân (Personal)</option>
                        <option value="Service">Xe dịch vụ (Service)</option>
                        <option value="Bus">Xe bus điện (Bus)</option>
                        <option value="Commercial">Xe thương mại / Van (Commercial)</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Giá niêm yết (`list_price` - VNĐ)</label>
                    <input
                      type="number"
                      value={renderNumVal(carForm.list_price)}
                      onChange={(e) => setCarForm({ ...carForm, list_price: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full text-xs p-2.5 border rounded-xl font-bold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Màu sắc Ngoại thất (`colors`)</label>
                    <input
                      type="text"
                      placeholder="VD: Trắng, Đen, Xám, Đỏ, Vàng, Xanh Dương, Xanh Mint"
                      value={carForm.colors_text || ''}
                      onChange={(e) => setCarForm({ ...carForm, colors_text: e.target.value })}
                      className="w-full text-xs p-2.5 border rounded-xl focus:border-emerald-600 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Trạng thái kinh doanh (`is_active`)</label>
                    <select
                      value={carForm.is_active ? 'true' : 'false'}
                      onChange={(e) => setCarForm({ ...carForm, is_active: e.target.value === 'true' })}
                      className="w-full text-xs p-2.5 border rounded-xl bg-white font-semibold"
                    >
                      <option value="true">🟢 Đang mở bán (Active)</option>
                      <option value="false">🔴 Tạm ngưng (Inactive)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: HÌNH ẢNH MẪU XE */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg flex items-center justify-between">
                  <span>2. Hình ảnh sản phẩm mẫu xe (`image_url`)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Hỗ trợ URL hoặc Tải tệp từ máy tính</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Đường dẫn URL ảnh trực tuyến</label>
                      <input
                        type="text"
                        placeholder="https://vinfastauto.com/html/vf8/images/vf8-red.png"
                        value={carForm.image_url || ''}
                        onChange={(e) => setCarForm({ ...carForm, image_url: e.target.value })}
                        className="w-full text-xs p-2.5 border rounded-xl focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Hoặc Chọn ảnh từ máy tính (Upload)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCarImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full text-xs p-2 border rounded-xl bg-slate-50 text-slate-600"
                      />
                    </div>
                  </div>
                  <div className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-2 flex items-center justify-center relative overflow-hidden">
                    {carImageFile && carImageFile instanceof Blob ? (
                      <img src={URL.createObjectURL(carImageFile)} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : carForm.image_url ? (
                      <img
                        src={getImageUrl(carForm.image_url)}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getImageUrl('/VINpng/AdsCars/vf8-4k.png');
                        }}
                      />
                    ) : (
                      <div className="text-center text-slate-400 text-xs">
                        <Upload size={24} className="mx-auto mb-1 opacity-50" />
                        <span>Xem trước hình ảnh</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: THÔNG SỐ KỸ THUẬT & TRANG BỊ MỞ RỘNG (ADDITIONAL_SPECS) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider bg-slate-100 px-3.5 py-2.5 rounded-xl flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="flex items-center gap-1.5 font-black text-slate-900 text-xs">3. Chi tiết thông số kỹ thuật &amp; Trang bị xe (Bảo toàn dữ liệu `additional_specs`)</span>
                    <span className="text-[10px] text-slate-500 font-normal block mt-0.5">Dành cho Nhân viên bán hàng &amp; Quản lý đại lý - Hiển thị 100% tiếng Việt rõ ràng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadVinFastTemplate}
                      className="text-[10px] font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                      title="Nạp nhanh bộ thông số tiêu chuẩn VinFast đầy đủ 25+ trường tiếng Việt"
                    >
                      ⚡ Nạp Mẫu Thông Số VinFast
                    </button>
                  </div>
                </div>

                {(activeTab === 'motorbikes' || carForm.category === 'Scooter' || carForm.category === 'motorbike') ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* 1. Thông số cơ bản & Kích thước (specifications root) */}
                    <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-2.5">
                      <span className="block text-[11px] font-black text-sky-900 uppercase">🛵 Thông Số Cơ Bản &amp; Kích Thước</span>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Năm sản xuất (`model_year`)</label>
                        <input
                          type="number"
                          placeholder="VD: 2024"
                          value={renderNumVal(carForm.model_year)}
                          onChange={(e) => setCarForm({ ...carForm, model_year: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Khối lượng ướt / Trọng lượng xe (`wet_weight_kg` - kg)</label>
                        <input
                          type="number"
                          placeholder="VD: 97"
                          value={renderNumVal(carForm.wet_weight_kg)}
                          onChange={(e) => setCarForm({ ...carForm, wet_weight_kg: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Dung tích cốp xe (`underseat_storage_liters` - Lít)</label>
                        <input
                          type="number"
                          placeholder="VD: 22"
                          value={renderNumVal(carForm.underseat_storage_liters)}
                          onChange={(e) => setCarForm({ ...carForm, underseat_storage_liters: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-sky-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Chuẩn kháng nước (`water_resistance_standard`)</label>
                        <input
                          type="text"
                          placeholder="VD: IP67"
                          value={carForm.water_resistance_standard || ''}
                          onChange={(e) => setCarForm({ ...carForm, water_resistance_standard: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-medium focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="text-[9px] font-bold text-slate-700">Dài (`length_mm`)</label>
                          <input
                            type="number"
                            placeholder="1910"
                            value={renderNumVal(carForm.length_mm)}
                            onChange={(e) => setCarForm({ ...carForm, length_mm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-1.5 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-700">Rộng (`width_mm`)</label>
                          <input
                            type="number"
                            placeholder="692"
                            value={renderNumVal(carForm.width_mm)}
                            onChange={(e) => setCarForm({ ...carForm, width_mm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-1.5 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-700">Cao (`height_mm`)</label>
                          <input
                            type="number"
                            placeholder="1083"
                            value={renderNumVal(carForm.height_mm)}
                            onChange={(e) => setCarForm({ ...carForm, height_mm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-1.5 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Động cơ & Pin (specifications root) */}
                    <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2.5">
                      <span className="block text-[11px] font-black text-amber-900 uppercase">⚡ Động Cơ Điện &amp; Bộ Pin</span>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Loại động cơ (`motor_type`)</label>
                        <input
                          type="text"
                          placeholder="VD: Động cơ Inhub / BLDC"
                          value={carForm.motor_type || ''}
                          onChange={(e) => setCarForm({ ...carForm, motor_type: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-medium text-amber-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Công suất danh định (`rated_motor_power_w` - W)</label>
                        <input
                          type="number"
                          placeholder="VD: 1500"
                          value={renderNumVal(carForm.rated_motor_power_w)}
                          onChange={(e) => setCarForm({ ...carForm, rated_motor_power_w: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Công suất tối đa (`maximum_power_kw` - kW / W)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="VD: 2.3"
                          value={renderNumVal(carForm.maximum_power_kw)}
                          onChange={(e) => setCarForm({ ...carForm, maximum_power_kw: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-amber-800 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Vận tốc tối đa (`maximum_speed_kmh` - km/h)</label>
                        <input
                          type="number"
                          placeholder="VD: 78"
                          value={renderNumVal(carForm.maximum_speed_kmh)}
                          onChange={(e) => setCarForm({ ...carForm, maximum_speed_kmh: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Loại Pin (`battery_type`)</label>
                        <input
                          type="text"
                          placeholder="VD: Lithium LFP / Lead-acid"
                          value={carForm.battery_type || ''}
                          onChange={(e) => setCarForm({ ...carForm, battery_type: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-medium focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Pin (kWh)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="VD: 3.5"
                            value={renderNumVal(carForm.usable_battery_capacity)}
                            onChange={(e) => setCarForm({ ...carForm, usable_battery_capacity: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Dung lượng (Ah)</label>
                          <input
                            type="number"
                            placeholder="VD: 22"
                            value={renderNumVal(carForm.battery_capacity_ah)}
                            onChange={(e) => setCarForm({ ...carForm, battery_capacity_ah: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Điện áp (V)</label>
                          <input
                            type="number"
                            placeholder="VD: 72"
                            value={renderNumVal(carForm.battery_voltage_v)}
                            onChange={(e) => setCarForm({ ...carForm, battery_voltage_v: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Số lượng Pin</label>
                          <input
                            type="number"
                            placeholder="VD: 1"
                            value={renderNumVal(carForm.battery_quantity)}
                            onChange={(e) => setCarForm({ ...carForm, battery_quantity: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Pin tháo rời</label>
                          <select
                            value={carForm.removable_battery ? 'true' : 'false'}
                            onChange={(e) => setCarForm({ ...carForm, removable_battery: e.target.value === 'true' })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-medium"
                          >
                            <option value="true">Có (Yes)</option>
                            <option value="false">Không (No)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Hỗ trợ đổi pin</label>
                          <select
                            value={carForm.battery_swap_supported ? 'true' : 'false'}
                            onChange={(e) => setCarForm({ ...carForm, battery_swap_supported: e.target.value === 'true' })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-medium"
                          >
                            <option value="true">Có (Yes)</option>
                            <option value="false">Không (No)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Loại bộ sạc (`charger_type`)</label>
                        <input
                          type="text"
                          placeholder="VD: Bộ sạc tiêu chuẩn 400W"
                          value={carForm.charger_type || ''}
                          onChange={(e) => setCarForm({ ...carForm, charger_type: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Công suất sạc (W)</label>
                          <input
                            type="number"
                            placeholder="VD: 400"
                            value={renderNumVal(carForm.charger_power_w)}
                            onChange={(e) => setCarForm({ ...carForm, charger_power_w: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Thời gian sạc (Phút)</label>
                          <input
                            type="number"
                            placeholder="VD: 270"
                            value={renderNumVal(carForm.charging_time_minutes)}
                            onChange={(e) => setCarForm({ ...carForm, charging_time_minutes: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Quãng đường tối đa (`range_km` - km)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="VD: 198"
                          value={renderNumVal(carForm.range_km)}
                          onChange={(e) => setCarForm({ ...carForm, range_km: e.target.value === '' ? '' : Number(e.target.value) })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-amber-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 3. Khung gầm & Bánh xe (additional_specs root) */}
                    <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2.5">
                      <span className="block text-[11px] font-black text-emerald-900 uppercase">🛞 Khung Gầm, Phanh &amp; Bánh Xe</span>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Lốp trước (`front_tire`)</label>
                        <input
                          type="text"
                          placeholder="VD: 90/90-12 không săm"
                          value={carForm.front_tire || ''}
                          onChange={(e) => setCarForm({ ...carForm, front_tire: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Lốp sau (`rear_tire`)</label>
                        <input
                          type="text"
                          placeholder="VD: 90/90-12 không săm"
                          value={carForm.rear_tire || ''}
                          onChange={(e) => setCarForm({ ...carForm, rear_tire: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Phanh trước (`front_brake`)</label>
                        <input
                          type="text"
                          placeholder="VD: Phanh đĩa"
                          value={carForm.front_brake || ''}
                          onChange={(e) => setCarForm({ ...carForm, front_brake: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Phanh sau (`rear_brake`)</label>
                        <input
                          type="text"
                          placeholder="VD: Phanh cơ / Phanh đĩa"
                          value={carForm.rear_brake || ''}
                          onChange={(e) => setCarForm({ ...carForm, rear_brake: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Giảm xóc trước (`front_suspension`)</label>
                        <input
                          type="text"
                          placeholder="VD: Ống lồng, giảm chấn thủy lực"
                          value={carForm.front_suspension || ''}
                          onChange={(e) => setCarForm({ ...carForm, front_suspension: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Giảm xóc sau (`rear_suspension`)</label>
                        <input
                          type="text"
                          placeholder="VD: Giảm xóc đôi, giảm chấn thủy lực"
                          value={carForm.rear_suspension || ''}
                          onChange={(e) => setCarForm({ ...carForm, rear_suspension: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 4. Hệ thống đèn (lighting_features) */}
                    <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-2.5">
                      <span className="block text-[11px] font-black text-indigo-900 uppercase">💡 Hệ Thống Đèn (`lighting_features`)</span>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Đèn chiếu sáng trước / Pha (`headlight`)</label>
                        <input
                          type="text"
                          placeholder="VD: Đèn Full LED / Projector"
                          value={carForm.headlight || ''}
                          onChange={(e) => setCarForm({ ...carForm, headlight: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Đèn hậu (`tail_light`)</label>
                        <input
                          type="text"
                          placeholder="VD: Đèn hậu LED"
                          value={carForm.tail_light || ''}
                          onChange={(e) => setCarForm({ ...carForm, tail_light: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Đèn xi-nhan (`turn_signal`)</label>
                        <input
                          type="text"
                          placeholder="VD: Đèn xi-nhan LED"
                          value={carForm.turn_signal || ''}
                          onChange={(e) => setCarForm({ ...carForm, turn_signal: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 5. Công nghệ (technology_features) */}
                    <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2.5">
                      <span className="block text-[11px] font-black text-purple-900 uppercase">🚀 Công Nghệ (`technology_features`)</span>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Công nghệ Đổi pin (`battery_swap`)</label>
                        <select
                          value={carForm.battery_swap ? 'true' : 'false'}
                          onChange={(e) => setCarForm({ ...carForm, battery_swap: e.target.value === 'true' })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-semibold"
                        >
                          <option value="true">Có hỗ trợ đổi pin (True)</option>
                          <option value="false">Không (False)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Quản lý thông minh qua App (`smart_management`)</label>
                        <input
                          type="text"
                          placeholder="VD: Quản lý pin, định vị GPS qua App VinFast"
                          value={carForm.smart_management || ''}
                          onChange={(e) => setCarForm({ ...carForm, smart_management: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-medium focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Yêu cầu bằng lái (`license_requirement`)</label>
                        <input
                          type="text"
                          placeholder="VD: Không yêu cầu bằng lái (dưới 50km/h)"
                          value={carForm.license_requirement || ''}
                          onChange={(e) => setCarForm({ ...carForm, license_requirement: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* 6. Ghi chú & Chi tiết (additional_specs root) */}
                    <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2.5">
                      <span className="block text-[11px] font-black text-rose-900 uppercase">📝 Ghi Chú &amp; Chi Tiết</span>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Vị trí đặt pin (`battery_location`)</label>
                        <input
                          type="text"
                          placeholder="VD: Pin đặt dưới cốp xe"
                          value={carForm.battery_location || ''}
                          onChange={(e) => setCarForm({ ...carForm, battery_location: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Mô tả dung lượng pin (`battery_capacity_text`)</label>
                        <input
                          type="text"
                          placeholder="VD: Pin LFP 3.5 kWh; có thể lắp thêm pin phụ."
                          value={carForm.battery_capacity_text || ''}
                          onChange={(e) => setCarForm({ ...carForm, battery_capacity_text: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Thông tin giá bán (`price_info_text`)</label>
                        <input
                          type="text"
                          placeholder="VD: Giá kèm pin: 30.000.000 VNĐ. Đã bao gồm VAT."
                          value={carForm.price_info_text || ''}
                          onChange={(e) => setCarForm({ ...carForm, price_info_text: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Thông tin sạc (`charging_info_text`)</label>
                        <input
                          type="text"
                          placeholder="VD: Sạc đầy từ 0% đến 100% trong 4.5 giờ."
                          value={carForm.charging_info_text || ''}
                          onChange={(e) => setCarForm({ ...carForm, charging_info_text: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Điều kiện quãng đường (`range_condition_text`)</label>
                        <input
                          type="text"
                          placeholder="VD: Khoảng 198 km với 2 pin ở tốc độ tiêu chuẩn."
                          value={carForm.range_condition_text || ''}
                          onChange={(e) => setCarForm({ ...carForm, range_condition_text: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Tóm tắt thông số (`technical_specs_text`)</label>
                        <input
                          type="text"
                          placeholder="VD: Công suất tối đa 2300W, tốc độ 78 km/h."
                          value={carForm.technical_specs_text || ''}
                          onChange={(e) => setCarForm({ ...carForm, technical_specs_text: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700">Chính sách bảo hành (`warranty_text`)</label>
                        <input
                          type="text"
                          placeholder="VD: Bảo hành chính hãng 5 năm."
                          value={carForm.warranty_text || ''}
                          onChange={(e) => setCarForm({ ...carForm, warranty_text: e.target.value })}
                          className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* 1. Động cơ, Pin & Thông số sạc */}
                      <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2.5">
                        <span className="block text-[11px] font-black text-blue-900 uppercase">⚡ Động Cơ, Pin &amp; Thông Số Sạc</span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Loại động cơ (`engine_type`)</label>
                          <input
                            type="text"
                            placeholder="VD: Động cơ điện Synchronous"
                            value={carForm.engine_type || ''}
                            onChange={(e) => setCarForm({ ...carForm, engine_type: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Loại pin (`battery_type`)</label>
                          <input
                            type="text"
                            placeholder="VD: Lithium-ion LFP"
                            value={carForm.battery_type || ''}
                            onChange={(e) => setCarForm({ ...carForm, battery_type: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Hộp số (`transmission`)</label>
                          <input
                            type="text"
                            placeholder="VD: Hộp số đơn cấp"
                            value={carForm.transmission || ''}
                            onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Trọng lượng không tải (kg)</label>
                          <input
                            type="number"
                            placeholder="VD: 1800"
                            value={renderNumVal(carForm.curb_weight_kg)}
                            onChange={(e) => setCarForm({ ...carForm, curb_weight_kg: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Bộ sạc chuẩn (`standard_charger`)</label>
                          <input
                            type="text"
                            placeholder="VD: Sạc chậm AC 6.6 kW"
                            value={carForm.standard_charger || ''}
                            onChange={(e) => setCarForm({ ...carForm, standard_charger: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Tăng tốc 0-100km/h (giây)</label>
                          <input
                            type="text"
                            placeholder="VD: 6.5s"
                            value={carForm.acceleration_0_50_seconds || ''}
                            onChange={(e) => setCarForm({ ...carForm, acceleration_0_50_seconds: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Mã lực (`motor_power_hp`)</label>
                          <input
                            type="number"
                            placeholder="VD: 201"
                            value={renderNumVal(carForm.motor_power_hp)}
                            onChange={(e) => setCarForm({ ...carForm, motor_power_hp: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Quãng đường di chuyển (km/lần sạc)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="VD: 450"
                            value={renderNumVal(carForm.range_km)}
                            onChange={(e) => setCarForm({ ...carForm, range_km: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-blue-700 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Điều kiện đo quãng đường (`range_condition_text`)</label>
                          <input
                            type="text"
                            placeholder="VD: Chuẩn NEDC hoặc WLTP"
                            value={carForm.range_condition_text || ''}
                            onChange={(e) => setCarForm({ ...carForm, range_condition_text: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Công suất tối đa (kW)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="VD: 150"
                            value={renderNumVal(carForm.maximum_power_kw)}
                            onChange={(e) => setCarForm({ ...carForm, maximum_power_kw: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Mô-men xoắn (Nm)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="VD: 310"
                            value={renderNumVal(carForm.maximum_torque_nm)}
                            onChange={(e) => setCarForm({ ...carForm, maximum_torque_nm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Dung lượng Pin khả dụng (kWh)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="VD: 60.4"
                            value={renderNumVal(carForm.usable_battery_capacity)}
                            onChange={(e) => setCarForm({ ...carForm, usable_battery_capacity: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-slate-700">Sạc DC từ %</label>
                            <input
                              type="number"
                              placeholder="10"
                              value={renderNumVal(carForm.dc_charge_from_percent)}
                              onChange={(e) => setCarForm({ ...carForm, dc_charge_from_percent: e.target.value === '' ? '' : Number(e.target.value) })}
                              className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-700">Sạc DC đến %</label>
                            <input
                              type="number"
                              placeholder="70"
                              value={renderNumVal(carForm.dc_charge_to_percent)}
                              onChange={(e) => setCarForm({ ...carForm, dc_charge_to_percent: e.target.value === '' ? '' : Number(e.target.value) })}
                              className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Thời gian sạc 10-70% (`charging_time_minutes` - phút)</label>
                          <input
                            type="number"
                            placeholder="VD: 24"
                            value={renderNumVal(carForm.charging_time_minutes)}
                            onChange={(e) => setCarForm({ ...carForm, charging_time_minutes: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-blue-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Ghi chú sạc (`charging_info_text`)</label>
                          <input
                            type="text"
                            placeholder="VD: Sạc nhanh DC 10-70% trong 24 phút"
                            value={carForm.charging_info_text || ''}
                            onChange={(e) => setCarForm({ ...carForm, charging_info_text: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Phanh tái sinh (`regenerative_braking`)</label>
                          <input
                            type="text"
                            placeholder="VD: 3 mức độ phục hồi năng lượng"
                            value={carForm.regenerative_braking || ''}
                            onChange={(e) => setCarForm({ ...carForm, regenerative_braking: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Tóm tắt động cơ (`technical_specs_text`)</label>
                          <input
                            type="text"
                            placeholder="VD: Động cơ điện đôi AWD 300kW"
                            value={carForm.technical_specs_text || ''}
                            onChange={(e) => setCarForm({ ...carForm, technical_specs_text: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Vận tốc tối đa (km/h)</label>
                          <input
                            type="number"
                            placeholder="VD: 160"
                            value={renderNumVal(carForm.maximum_speed_kmh)}
                            onChange={(e) => setCarForm({ ...carForm, maximum_speed_kmh: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-slate-800 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Hệ thống dẫn động</label>
                          <input
                            type="text"
                            placeholder="VD: AWD (Dẫn động 2 cầu toàn thời gian)"
                            value={carForm.drivetrain || ''}
                            onChange={(e) => setCarForm({ ...carForm, drivetrain: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* 2. Khung gầm, Phanh & Treo */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                        <span className="block text-[11px] font-black text-slate-900 uppercase">🛑 Phanh &amp; Hệ Thống Treo</span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Phanh trước (`front_brake`)</label>
                          <input
                            type="text"
                            placeholder="VD: Phanh đĩa thông gió"
                            value={carForm.front_brake || ''}
                            onChange={(e) => setCarForm({ ...carForm, front_brake: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Phanh sau (`rear_brake`)</label>
                          <input
                            type="text"
                            placeholder="VD: Phanh đĩa"
                            value={carForm.rear_brake || ''}
                            onChange={(e) => setCarForm({ ...carForm, rear_brake: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Hệ thống treo trước (`front_suspension`)</label>
                          <input
                            type="text"
                            placeholder="VD: Độc lập MacPherson"
                            value={carForm.front_suspension || ''}
                            onChange={(e) => setCarForm({ ...carForm, front_suspension: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Hệ thống treo sau (`rear_suspension`)</label>
                          <input
                            type="text"
                            placeholder="VD: Đa điểm độc lập / Dầm xoắn"
                            value={carForm.rear_suspension || ''}
                            onChange={(e) => setCarForm({ ...carForm, rear_suspension: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Chính sách bảo hành xe &amp; Pin (`warranty_text`)</label>
                          <input
                            type="text"
                            placeholder="VD: Bảo hành chính hãng 10 năm hoặc 200.000 km"
                            value={carForm.warranty_text || ''}
                            onChange={(e) => setCarForm({ ...carForm, warranty_text: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* 3. Ngoại thất (exterior_features) */}
                      <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2.5">
                        <span className="block text-[11px] font-black text-teal-900 uppercase">🚘 Ngoại Thất (`exterior_features`)</span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Đèn pha (`headlights`)</label>
                          <input
                            type="text"
                            placeholder="VD: Full LED tự động thích ứng"
                            value={carForm.headlights || ''}
                            onChange={(e) => setCarForm({ ...carForm, headlights: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Mâm lốp ngoại thất (`wheels`)</label>
                          <input
                            type="text"
                            placeholder="VD: 20 inch hợp kim nhôm"
                            value={carForm.wheels || ''}
                            onChange={(e) => setCarForm({ ...carForm, wheels: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Gương chiếu hậu (`mirrors`)</label>
                          <input
                            type="text"
                            placeholder="VD: Chỉnh/gập điện, tích hợp báo rẽ &amp; sấy gương"
                            value={carForm.mirrors || ''}
                            onChange={(e) => setCarForm({ ...carForm, mirrors: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Đèn ban ngày (`daytime_running_lights`)</label>
                          <input
                            type="text"
                            placeholder="VD: Đèn LED cánh chim đặc trưng"
                            value={carForm.daytime_running_lights || ''}
                            onChange={(e) => setCarForm({ ...carForm, daytime_running_lights: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Cánh gió phía sau (`rear_spoiler`)</label>
                          <select
                            value={carForm.rear_spoiler ? 'true' : 'false'}
                            onChange={(e) => setCarForm({ ...carForm, rear_spoiler: e.target.value === 'true' })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-semibold focus:outline-none"
                          >
                            <option value="true">🟢 Có cánh gió thể thao</option>
                            <option value="false">🔴 Không có</option>
                          </select>
                        </div>
                      </div>

                      {/* 4. Nội thất (interior_features) */}
                      <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2.5">
                        <span className="block text-[11px] font-black text-emerald-900 uppercase">🛋️ Nội Thất (`interior_features`)</span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Chất liệu ghế (`seat_material`)</label>
                          <input
                            type="text"
                            placeholder="VD: Da Vegan cao cấp kháng khuẩn"
                            value={carForm.seat_material || ''}
                            onChange={(e) => setCarForm({ ...carForm, seat_material: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Số lượng loa âm thanh (`audio_speakers`)</label>
                          <input
                            type="number"
                            placeholder="VD: 10"
                            value={renderNumVal(carForm.audio_speakers)}
                            onChange={(e) => setCarForm({ ...carForm, audio_speakers: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Hệ thống điều hòa (`air_conditioning`)</label>
                          <input
                            type="text"
                            placeholder="VD: Tự động 2 vùng độc lập, lọc không khí Combi 1.0"
                            value={carForm.air_conditioning || ''}
                            onChange={(e) => setCarForm({ ...carForm, air_conditioning: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Màn hình trung tâm (inch) (`central_screen_inches`)</label>
                          <input
                            type="text"
                            placeholder="VD: 15.6"
                            value={carForm.central_screen_inches || ''}
                            onChange={(e) => setCarForm({ ...carForm, central_screen_inches: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Ghế lái (`driver_seat`)</label>
                          <input
                            type="text"
                            placeholder="VD: Chỉnh điện 8 hướng, nhớ vị trí, sưởi/thông gió"
                            value={carForm.driver_seat || ''}
                            onChange={(e) => setCarForm({ ...carForm, driver_seat: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Ghế phụ (`front_passenger_seat`)</label>
                          <input
                            type="text"
                            placeholder="VD: Chỉnh điện 6 hướng"
                            value={carForm.front_passenger_seat || ''}
                            onChange={(e) => setCarForm({ ...carForm, front_passenger_seat: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Vô lăng (`steering_wheel`)</label>
                          <input
                            type="text"
                            placeholder="VD: Bọc da cao cấp, sưởi vô lăng, tích hợp phím bấm"
                            value={carForm.steering_wheel || ''}
                            onChange={(e) => setCarForm({ ...carForm, steering_wheel: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Đồng hồ / Màn hình phụ (`instrument_cluster_inches`)</label>
                          <input
                            type="text"
                            placeholder="VD: HUD kính lái / Màn hình 8 inch"
                            value={carForm.instrument_cluster_inches || ''}
                            onChange={(e) => setCarForm({ ...carForm, instrument_cluster_inches: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* 5. An toàn (safety_features) */}
                      <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-2.5">
                        <span className="block text-[11px] font-black text-rose-900 uppercase">🛡️ Hệ Thống An Toàn (`safety_features`)</span>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Số túi khí (`airbags`)</label>
                          <input
                            type="number"
                            placeholder="VD: 11"
                            value={renderNumVal(carForm.airbags)}
                            onChange={(e) => setCarForm({ ...carForm, airbags: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-rose-900 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'ba', label: 'Hỗ trợ phanh BA' },
                            { key: 'abs', label: 'Chống bó phanh ABS' },
                            { key: 'ebd', label: 'Phân phối phanh EBD' },
                            { key: 'esc', label: 'Cân bằng điện tử ESC' },
                            { key: 'hsa', label: 'Khởi hành dốc HSA' },
                            { key: 'tcs', label: 'Kiểm soát lực kéo TCS' },
                            { key: 'tpms', label: 'Áp suất lốp TPMS' },
                            { key: 'isofix', label: 'Ghế trẻ em ISOFIX' },
                            { key: 'anti_theft_system', label: 'Hệ thống chống trộm' },
                          ].map((item) => (
                            <div key={item.key}>
                              <label className="text-[9px] font-bold text-slate-700 block truncate">{item.label}</label>
                              <select
                                value={(carForm as any)[item.key] ? 'true' : 'false'}
                                onChange={(e) => setCarForm({ ...carForm, [item.key]: e.target.value === 'true' })}
                                className="w-full text-[11px] p-1.5 border rounded-lg bg-white font-medium focus:outline-none"
                              >
                                <option value="true">🟢 Có</option>
                                <option value="false">🔴 Không</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 6. Trợ lái ADAS (driver_assistance_features) */}
                      <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2.5">
                        <span className="block text-[11px] font-black text-amber-900 uppercase">🤖 Trợ Lái ADAS (`driver_assistance_features`)</span>
                        <div className="space-y-2">
                          {[
                            { key: 'vietnamese_voice_assistant', label: 'Trợ lý giọng nói tiếng Việt ViVi (`vietnamese_voice_assistant`)' },
                            { key: 'pet_mode', label: 'Chế độ thú cưng (`pet_mode`)' },
                            { key: 'camp_mode', label: 'Chế độ cắm trại (`camp_mode`)' },
                            { key: 'android_auto', label: 'Kết nối Android Auto (`android_auto`)' },
                            { key: 'apple_carplay', label: 'Kết nối Apple CarPlay (`apple_carplay`)' },
                            { key: 'highway_assist', label: 'Hỗ trợ lái trên cao tốc (`highway_assist`)' },
                            { key: 'traffic_jam_assist', label: 'Hỗ trợ di chuyển khi ùn tắc TJA (`traffic_jam_assist`)' },
                            { key: 'lane_keep_assist', label: 'Hỗ trợ giữ làn đường LKA (`lane_keep_assist`)' },
                            { key: 'emergency_lane_keep', label: 'Giữ làn đường khẩn cấp ELKA (`emergency_lane_keep`)' },
                            { key: 'lane_departure_warning', label: 'Cảnh báo chệch làn đường LDW (`lane_departure_warning`)' },
                            { key: 'adaptive_cruise_control', label: 'Kiểm soát hành trình thích ứng ACC (`adaptive_cruise_control`)' },
                            { key: 'cruise_control', label: 'Ga tự động Cruise Control (`cruise_control`)' },
                            { key: 'blind_spot_warning', label: 'Cảnh báo điểm mù BSD (`blind_spot_warning`)' },
                            { key: 'safe_exit_warning', label: 'Cảnh báo mở cửa an toàn (`safe_exit_warning`)' },
                            { key: 'surround_view_camera', label: 'Camera 360° toàn cảnh (`surround_view_camera`)' },
                            { key: 'rear_camera', label: 'Camera lùi (`rear_camera`)' },
                            { key: 'front_rear_parking_sensors', label: 'Cảm biến đỗ xe trước & sau (`front_rear_parking_sensors`)' },
                            { key: 'rear_parking_sensor', label: 'Cảm biến lùi (`rear_parking_sensor`)' },
                            { key: 'rear_cross_traffic_alert', label: 'Cảnh báo cắt ngang khi lùi RCTA (`rear_cross_traffic_alert`)' },
                            { key: 'traffic_sign_recognition', label: 'Nhận diện biển báo giao thông TSR (`traffic_sign_recognition`)' },
                            { key: 'forward_collision_warning', label: 'Cảnh báo va chạm phía trước FCW (`forward_collision_warning`)' },
                            { key: 'automatic_emergency_braking', label: 'Phanh khẩn cấp tự động AEB (`automatic_emergency_braking`)' },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-amber-100">
                              <span className="text-[10px] font-bold text-slate-800">{item.label}</span>
                              <select
                                value={(carForm as any)[item.key] ? 'true' : 'false'}
                                onChange={(e) => setCarForm({ ...carForm, [item.key]: e.target.value === 'true' })}
                                className="text-[11px] p-1 border rounded-lg bg-amber-50 font-bold focus:outline-none shrink-0"
                              >
                                <option value="true">🟢 Có</option>
                                <option value="false">🔴 Không</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 7. Kích thước, Tải trọng & Khác */}
                    <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2.5 mt-3">
                      <span className="block text-[11px] font-black text-purple-900 uppercase">📏 Kích Thước, Mâm Lốp, Tải Trọng &amp; Khác</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-700">Thông số mâm lốp đầy đủ (`tires_wheels`)</label>
                          <input
                            type="text"
                            placeholder="VD: 255/50 R20 hợp kim nhôm"
                            value={carForm.tires_wheels || ''}
                            onChange={(e) => setCarForm({ ...carForm, tires_wheels: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-purple-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Số chỗ ngồi (chỗ)</label>
                          <input
                            type="number"
                            placeholder="VD: 5"
                            value={renderNumVal(carForm.seat_count)}
                            onChange={(e) => setCarForm({ ...carForm, seat_count: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-bold text-purple-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Chiều dài (mm)</label>
                          <input
                            type="number"
                            placeholder="VD: 4600"
                            value={renderNumVal(carForm.length_mm)}
                            onChange={(e) => setCarForm({ ...carForm, length_mm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Chiều rộng (mm)</label>
                          <input
                            type="number"
                            placeholder="VD: 1900"
                            value={renderNumVal(carForm.width_mm)}
                            onChange={(e) => setCarForm({ ...carForm, width_mm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Chiều cao (mm)</label>
                          <input
                            type="number"
                            placeholder="VD: 1660"
                            value={renderNumVal(carForm.height_mm)}
                            onChange={(e) => setCarForm({ ...carForm, height_mm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Chiều dài cơ sở (mm)</label>
                          <input
                            type="number"
                            placeholder="VD: 2800"
                            value={renderNumVal(carForm.wheelbase_mm)}
                            onChange={(e) => setCarForm({ ...carForm, wheelbase_mm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Khoảng sáng gầm xe (mm)</label>
                          <input
                            type="number"
                            placeholder="VD: 175"
                            value={renderNumVal(carForm.ground_clearance_mm)}
                            onChange={(e) => setCarForm({ ...carForm, ground_clearance_mm: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Bán kính quay vòng (`turning_diameter_m`)</label>
                          <input
                            type="text"
                            placeholder="VD: 5.6m"
                            value={carForm.turning_diameter_m || ''}
                            onChange={(e) => setCarForm({ ...carForm, turning_diameter_m: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Dung tích cốp xe (Lít)</label>
                          <input
                            type="number"
                            placeholder="VD: 350"
                            value={renderNumVal(carForm.cargo_capacity_liters)}
                            onChange={(e) => setCarForm({ ...carForm, cargo_capacity_liters: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Thể tích cốp gập ghế (`cargo_capacity_folded_liters`)</label>
                          <input
                            type="number"
                            placeholder="VD: 1350"
                            value={renderNumVal(carForm.cargo_capacity_folded_liters)}
                            onChange={(e) => setCarForm({ ...carForm, cargo_capacity_folded_liters: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Tải trọng xe (kg)</label>
                          <input
                            type="number"
                            placeholder="VD: 400"
                            value={renderNumVal(carForm.payload_kg)}
                            onChange={(e) => setCarForm({ ...carForm, payload_kg: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Tải trọng nóc xe (`roof_load_capacity_kg`)</label>
                          <input
                            type="text"
                            placeholder="VD: 75 kg"
                            value={carForm.roof_load_capacity_kg || ''}
                            onChange={(e) => setCarForm({ ...carForm, roof_load_capacity_kg: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Phân khúc xe (`body_type`)</label>
                          <input
                            type="text"
                            placeholder="VD: C-SUV, D-SUV"
                            value={carForm.body_type || ''}
                            onChange={(e) => setCarForm({ ...carForm, body_type: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-700">Năm sản xuất (`model_year`)</label>
                          <input
                            type="number"
                            placeholder="VD: 2024"
                            value={renderNumVal(carForm.model_year)}
                            onChange={(e) => setCarForm({ ...carForm, model_year: e.target.value === '' ? '' : Number(e.target.value) })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-700">Ghi chú giá niêm yết (`price_info_text`)</label>
                          <input
                            type="text"
                            placeholder="VD: Đã bao gồm VAT, chưa bao gồm pin"
                            value={carForm.price_info_text || ''}
                            onChange={(e) => setCarForm({ ...carForm, price_info_text: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold text-slate-700">Tùy chọn màu sắc (ngăn cách bởi dấu phẩy)</label>
                          <input
                            type="text"
                            placeholder="VD: Trắng, Đen, Xám, Đỏ, Vàng"
                            value={carForm.colors_text || ''}
                            onChange={(e) => setCarForm({ ...carForm, colors_text: e.target.value })}
                            className="w-full text-xs p-2 border rounded-lg bg-white font-medium focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* SECTION 4: MÔ TẢ TỔNG QUAN */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mô tả tổng quan mẫu xe</label>
                <textarea
                  rows={2}
                  value={carForm.description || ''}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 border rounded-xl focus:border-emerald-600 focus:outline-none"
                  placeholder="Nhập giới thiệu chi tiết về mẫu xe..."
                />
              </div>

            </div>

            {/* Sticky Footer Action Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setShowCarModal(false)} className="px-5 py-2.5 text-xs font-bold border rounded-xl hover:bg-slate-100">
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleSaveCarSubmit()}
                disabled={loading}
                className="px-6 py-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md cursor-pointer"
              >
                {loading ? 'Đang lưu vào PostgreSQL...' : 'Lưu Thay Đổi Mẫu Xe'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Sleek Custom Vehicle Details Modal */}
      {viewingCar && (
        <div className="fixed inset-0 z-[280] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Car size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">{viewingCar.model_name || viewingCar.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>{viewingCar.vehicle_line || viewingCar.code}</span>
                    {viewingCar.version && <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-300 font-semibold">{viewingCar.version}</span>}
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 uppercase">{viewingCar.category}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingCar(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
              {/* Image & Key Price Banner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="md:col-span-5 h-36 bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                  <img src={getImageUrl(viewingCar.image_url)} alt={viewingCar.model_name || viewingCar.name} className="w-full h-full object-cover" />
                </div>
                <div className="md:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Giá niêm yết</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${(viewingCar.is_active ?? viewingCar.is_available) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      {(viewingCar.is_active ?? viewingCar.is_available) ? '🟢 Đang mở bán' : '🔴 Tạm ngưng'}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-red-600">
                    {formatVNDPrice(viewingCar.list_price || viewingCar.base_price)}
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {viewingCar.description || (viewingCar.version ? `Mẫu xe VinFast phiên bản ${viewingCar.version}` : 'Thông số kỹ thuật được cập nhật chính xác từ VinFast Catalog.')}
                  </p>
                </div>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] text-blue-700 font-extrabold uppercase block">Quãng đường</span>
                  <strong className="text-blue-900 text-sm font-black block mt-0.5">
                    {viewingCar.range_km ? `${viewingCar.range_km} km` : 'Tiêu chuẩn'}
                  </strong>
                </div>
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 font-extrabold uppercase block">Công suất tối đa</span>
                  <strong className="text-emerald-900 text-sm font-black block mt-0.5">
                    {viewingCar.maximum_power_kw ? `${viewingCar.maximum_power_kw} kW` : 'Mô-tơ điện'}
                  </strong>
                </div>
                <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-200 text-center">
                  <span className="text-[10px] text-purple-700 font-extrabold uppercase block">Mô-men xoắn</span>
                  <strong className="text-purple-900 text-sm font-black block mt-0.5">
                    {viewingCar.maximum_torque_nm ? `${viewingCar.maximum_torque_nm} Nm` : 'Tối ưu'}
                  </strong>
                </div>
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] text-amber-700 font-extrabold uppercase block">Số chỗ ngồi</span>
                  <strong className="text-amber-900 text-sm font-black block mt-0.5">
                    {viewingCar.seat_count ? `${viewingCar.seat_count} chỗ` : '5 chỗ'}
                  </strong>
                </div>
              </div>

              {/* Dimensions Table */}
              {(viewingCar.length_mm || viewingCar.width_mm || viewingCar.height_mm || viewingCar.wheelbase_mm || viewingCar.usable_battery_capacity) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">📐 Kích thước & Cấu hình Pin</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {viewingCar.length_mm && viewingCar.width_mm && viewingCar.height_mm && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">Dài x Rộng x Cao</span>
                        <span className="font-bold text-slate-800">{viewingCar.length_mm} x {viewingCar.width_mm} x {viewingCar.height_mm} mm</span>
                      </div>
                    )}
                    {viewingCar.wheelbase_mm && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">Chiều dài cơ sở</span>
                        <span className="font-bold text-slate-800">{viewingCar.wheelbase_mm} mm</span>
                      </div>
                    )}
                    {viewingCar.usable_battery_capacity && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-400 text-[10px] block font-bold">Dung lượng Pin khả dụng</span>
                        <span className="font-bold text-slate-800">{viewingCar.usable_battery_capacity} kWh</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setViewingCar(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[300] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md w-full p-6 text-center space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                Xác Nhận Xóa {deleteTarget.type === 'user' ? 'Tài Khoản' : deleteTarget.type === 'motorbike' ? 'Xe Máy Điện' : 'Mẫu Ô Tô'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Bạn có chắc chắn muốn xóa vĩnh viễn dữ liệu này khỏi hệ thống PostgreSQL?
              </p>
            </div>

            <div className="p-3 bg-red-50/80 rounded-2xl border border-red-200/60 text-xs font-bold text-slate-800 break-words">
              <span className="text-red-700 block text-[10px] uppercase font-black tracking-wider mb-0.5">Đối tượng sẽ xóa:</span>
              <span className="text-slate-900 font-extrabold text-sm">{deleteTarget.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={loading}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Đồng ý xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS NOTIFICATION MODAL */}
      {successModal && successModal.show && (
        <div className="fixed inset-0 z-[250] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn font-sans">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4 animate-scaleUp relative overflow-hidden">
            
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-2 ${
              successModal.type === 'delete' ? 'bg-rose-500' : successModal.type === 'edit' ? 'bg-blue-600' : 'bg-emerald-500'
            }`} />

            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center border-4 mt-2 ${
              successModal.type === 'delete'
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : successModal.type === 'edit'
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              {successModal.type === 'delete' ? (
                <Trash2 size={30} />
              ) : successModal.type === 'edit' ? (
                <Edit3 size={30} />
              ) : (
                <CheckCircle2 size={34} />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900 tracking-tight">{successModal.title}</h4>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-line px-2">
                {successModal.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccessModal(null)}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all transform active:scale-95 ${
                successModal.type === 'delete'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : successModal.type === 'edit'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              Hoàn Tất / Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
