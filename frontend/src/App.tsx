import { useState, useEffect, useCallback } from 'react';
import { api, getImageUrl, parseVehicleCategory } from '@/lib/api';
import { getVehicleDisplayName } from '@/lib/vehicleDisplay';
import { parseVehicleColors } from '@/lib/vehicleColors';
import { normalizeStaticVehicle, normalizeVehicleHighlights } from '@/lib/smartFeatures';

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import VehicleShowcase from '@/components/VehicleShowcase';
import CompareBar from '@/components/CompareBar';
import SupportChatWidget from '@/components/SupportChatWidget';
import StaffDrawer from '@/components/StaffDrawer';
import AdminDashboardModal from '@/components/AdminDashboardModal';
import AdminPortalModal from '@/components/AdminPortalModal';
import AuthModal from '@/components/AuthModal';
import UserProfileModal from '@/components/UserProfileModal';
import AftersalesPage from '@/pages/AftersalesPage';
import ChargingPage from '@/pages/ChargingPage';
import EnergyPage from '@/pages/EnergyPage';
import StaffPortalPage from '@/pages/StaffPortalPage';
import VehicleDetailModal from '@/components/VehicleDetailModal';
import TestDriveModal from '@/components/TestDriveModal';
import CompareModal from '@/components/CompareModal';
import UserMailboxDrawer from '@/components/UserMailboxDrawer';
import { Mail, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { CLOUD_ASSETS } from '@/lib/cloudAssets';
const logoVinFast = CLOUD_ASSETS.VINFAST_LOGO;
import type { Role, Vehicle, FilterCategory, UserAccount } from '@/types';
import { useImagePreloader } from '@/lib/useImagePreloader';
import { isSameComparisonCategory } from '@/lib/vehicleComparison';

import { vehicles as staticVehicles } from '@/data/vehicles';

const PRICING_CATALOG_DATA = [
  // --- Ô tô điện VinFast (Chuẩn DB) ---
  { type: 'car', model: 'VF 2', version: 'Tiêu chuẩn', price: 188000000, battery: '18,3 kWh', range: '210 km', seats: '4 chỗ' },
  { type: 'car', model: 'VF 3', version: 'Eco', price: 285000000, battery: '18,64 kWh', range: '215 km', seats: '4 chỗ' },
  { type: 'car', model: 'VF 3', version: 'Plus', price: 296000000, battery: '18,64 kWh', range: '215 km', seats: '4 chỗ' },
  { type: 'car', model: 'VF 5', version: 'Tiêu chuẩn', price: 496000000, battery: '37,23 kWh', range: '326 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF 6', version: 'Eco', price: 646000000, battery: '59,6 kWh', range: '485 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF 6', version: 'Plus', price: 699000000, battery: '59,6 kWh', range: '460 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF 7', version: 'Eco', price: 740000000, battery: '59,6 kWh', range: '440 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF 7', version: 'Plus AWD (Trần thép)', price: 830000000, battery: '70,0 kWh', range: '500 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF 7', version: 'Plus AWD (Trần kính toàn cảnh)', price: 850000000, battery: '70,0 kWh', range: '500 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF MPV 7', version: 'Tiêu chuẩn gia đình', price: 819000000, battery: '60,13 kWh', range: '450 km', seats: '7 chỗ' },
  { type: 'car', model: 'VF 8', version: 'Eco', price: 898000000, battery: '87,7 kWh', range: '562 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF 8', version: 'The All New', price: 999000000, battery: '60,13 kWh', range: '490 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF 8', version: 'Plus', price: 1079000000, battery: '87,7 kWh', range: '457 km', seats: '5 chỗ' },
  { type: 'car', model: 'VF 9', version: 'Eco', price: 1348000000, battery: '123,0 kWh', range: '626 km', seats: '7 chỗ' },
  { type: 'car', model: 'VF 9', version: 'Plus', price: 1529000000, battery: '123,0 kWh', range: '602 km', seats: '7 chỗ' },

  // --- Xe máy điện & Xe đạp điện VinFast (Chuẩn DB) ---
  { type: 'scooter', model: 'VinFast Amio', version: 'Tiêu chuẩn', price: 11600000, battery: '1,024 kWh', range: '65 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Amio S', version: 'Amio S', price: 11600000, battery: '1,024 kWh', range: '65 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Amio S2', version: 'Amio S2', price: 12000000, battery: '1,024 kWh', range: '65 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast ZGoo', version: 'Tiêu chuẩn', price: 13300000, battery: '1,2 kWh', range: '70 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Evo Lite Neo', version: 'Kèm ắc quy', price: 14400000, battery: '1,26 kWh', range: '78 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Flazz', version: 'Tiêu chuẩn', price: 16000000, battery: '1,2 kWh', range: '135 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Flazz Max', version: 'Flazz Max', price: 17300000, battery: '1,5 kWh', range: '87 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast VF DrgnFly', version: 'eBike', price: 18690000, battery: '0,64 kWh', range: '110 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Evo Lite', version: 'Kèm pin', price: 18900000, battery: '1,5 kWh', range: '165 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Evo Grand Lite', version: 'Kèm pin', price: 19900000, battery: '1,2 kWh', range: '198 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Evo Grand', version: 'Kèm pin', price: 22500000, battery: '2,4 kWh', range: '262 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Evo', version: 'Kèm pin', price: 24100000, battery: '1,5 kWh', range: '165 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Feliz 2025', version: 'Kèm pin', price: 27900000, battery: '2,4 kWh', range: '262 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Feliz II', version: 'Kèm pin', price: 28700000, battery: '1,5 kWh', range: '156 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Vero X', version: 'Tiêu chuẩn', price: 34900000, battery: '2,4 kWh', range: '262 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Kyo', version: 'Kèm pin', price: 35300000, battery: '1,5 kWh', range: '160 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Viper', version: 'Kèm pin', price: 45500000, battery: '1,5 kWh', range: '156 km', seats: '2 chỗ' },
  { type: 'scooter', model: 'VinFast Kinet', version: 'Kèm pin', price: 49900000, battery: '3,0 kWh', range: '145 km', seats: '2 chỗ' },
];

export default function App() {
  // Auth & Profile Modal States (Instant 0ms Hydration from Storage)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const u = localStorage.getItem('vinfast_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<Role>(() => {
    try {
      const u = localStorage.getItem('vinfast_user');
      return u ? JSON.parse(u).role || 'customer' : 'customer';
    } catch {
      return 'customer';
    }
  });

  const [compareList, setCompareList] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [staffDrawerOpen, setStaffDrawerOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [currentView, setCurrentView] = useState<'home' | 'aftersales' | 'charging' | 'energy' | 'compare' | 'staff'>(() => {
    try {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#aftersales')) return 'aftersales';
      if (hash.startsWith('#charging')) return 'charging';
      if (hash.startsWith('#energy')) return 'energy';
      if (hash.startsWith('#compare')) return 'compare';
      if (hash.startsWith('#staff')) return 'staff';

      const saved = sessionStorage.getItem('vinfast_current_view');
      if (saved && ['home', 'aftersales', 'charging', 'energy', 'compare', 'staff'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'home';
  });

  // Detail Modal States
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => staticVehicles.map(normalizeStaticVehicle));
  const [pricingTab, setPricingTab] = useState<'all' | 'car' | 'scooter'>('all');
  const [showAllPricing, setShowAllPricing] = useState(false);

  // Test Drive Modal States
  const [testDriveOpen, setTestDriveOpen] = useState(false);
  const [testDriveVehicle, setTestDriveVehicle] = useState<Vehicle | null>(null);
  const [pendingTestDriveVehicle, setPendingTestDriveVehicle] = useState<Vehicle | null>(null);

  const handleOpenTestDrive = useCallback((vehicle?: Vehicle | null) => {
    if (!currentUser) {
      setPendingTestDriveVehicle(vehicle || null);
      setAuthDefaultRole('customer');
      setAuthModalOpen(true);
      return;
    }
    setTestDriveVehicle(vehicle || null);
    setTestDriveOpen(true);
  }, [currentUser]);

  // Preload all images (hero + vehicles) into memory immediately
  useImagePreloader(vehicles);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<Role>('customer');

  const handleViewDetail = useCallback((vehicle: Vehicle) => {
    setDetailVehicle(vehicle);
    setDetailModalOpen(true);
    window.history.pushState({ modal: 'detail', vehicleId: vehicle.id }, '', `#detail-${vehicle.id}`);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailModalOpen(false);
    if (window.location.hash.startsWith('#detail')) {
      window.history.back();
    }
  }, []);

  const handleOpenCompare = useCallback(() => {
    setCurrentView('compare');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (!window.location.hash.startsWith('#compare')) {
      window.history.pushState({ view: 'compare' }, '', '#compare');
    }
  }, []);

  const handleCloseCompare = useCallback(() => {
    setCurrentView('home');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (window.location.hash.startsWith('#compare')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  }, []);

  // Sync currentView with sessionStorage and URL hash
  useEffect(() => {
    try {
      sessionStorage.setItem('vinfast_current_view', currentView);
      if (currentView === 'home') {
        if (window.location.hash && !window.location.hash.startsWith('#detail-') && !window.location.hash.startsWith('#pricing') && !window.location.hash.startsWith('#showcase')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        if (!window.location.hash.startsWith(`#${currentView}`)) {
          window.history.replaceState(null, '', `#${currentView}`);
        }
      }
    } catch {}
  }, [currentView]);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.toLowerCase();
      if (!hash.startsWith('#detail')) {
        setDetailModalOpen(false);
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      if (hash.startsWith('#aftersales')) setCurrentView('aftersales');
      else if (hash.startsWith('#charging')) setCurrentView('charging');
      else if (hash.startsWith('#energy')) setCurrentView('energy');
      else if (hash.startsWith('#compare')) setCurrentView('compare');
      else if (hash.startsWith('#staff')) setCurrentView('staff');
      else if (!hash.startsWith('#detail')) setCurrentView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleCheckHash = () => {
      if (window.location.hash.startsWith('#detail-') && vehicles.length > 0) {
        const rawTarget = window.location.hash.replace('#detail-', '').toLowerCase().trim();
        const cleanTarget = rawTarget.replace(/[^a-z0-9]/g, '');
        const found = vehicles.find((v) => {
          const vId = (v.id || '').toLowerCase();
          const vCode = (v.code || '').toLowerCase();
          const vName = (v.name || '').toLowerCase();
          const cleanCode = vCode.replace(/[^a-z0-9]/g, '');
          const cleanName = vName.replace(/[^a-z0-9]/g, '');
          return (
            vId === rawTarget ||
            vCode === rawTarget ||
            cleanCode === cleanTarget ||
            cleanName.includes(cleanTarget) ||
            cleanTarget.includes(cleanCode)
          );
        });
        if (found) {
          setDetailVehicle(found);
          setDetailModalOpen(true);
        }
      }
    };

    handleCheckHash();
    window.addEventListener('hashchange', handleCheckHash);
    return () => window.removeEventListener('hashchange', handleCheckHash);
  }, [vehicles]);

  const handleToggleCompare = useCallback((id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 3) return prev;
      const candidate = vehicles.find((vehicle) => vehicle.id === id);
      const firstSelected = vehicles.find((vehicle) => vehicle.id === prev[0]);
      if (!candidate || !isSameComparisonCategory(firstSelected, candidate)) return prev;
      return [...prev, id];
    });
  }, [vehicles]);

  const handleRemoveCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((v) => v !== id));
  }, []);

  const handleClearCompare = useCallback(() => setCompareList([]), []);

  const handleAddCompare = useCallback((id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 3) return prev;
      const candidate = vehicles.find((vehicle) => vehicle.id === id);
      const firstSelected = vehicles.find((vehicle) => vehicle.id === prev[0]);
      if (!candidate || !isSameComparisonCategory(firstSelected, candidate)) return prev;
      return [...prev, id];
    });
  }, [vehicles]);

  const handleReplaceCompare = useCallback((oldId: string, newId: string) => {
    setCompareList((prev) => {
      const candidate = vehicles.find((vehicle) => vehicle.id === newId);
      const remaining = prev.filter((item) => item !== oldId);
      const firstRemaining = vehicles.find((vehicle) => vehicle.id === remaining[0]);
      if (!candidate || !isSameComparisonCategory(firstRemaining, candidate)) return prev;
      return prev.map((item) => (item === oldId ? newId : item));
    });
  }, [vehicles]);

  // Remove any mixed-category IDs that may have been left by an older session
  // before the comparison rule was introduced.
  useEffect(() => {
    setCompareList((prev) => {
      const firstSelected = vehicles.find((vehicle) => vehicle.id === prev[0]);
      if (!firstSelected) return prev;
      const normalized = prev.filter((id) => {
        const vehicle = vehicles.find((candidate) => candidate.id === id);
        return Boolean(vehicle) && isSameComparisonCategory(firstSelected, vehicle);
      });
      return normalized.length === prev.length ? prev : normalized;
    });
  }, [vehicles]);

  const handleNavClick = useCallback((section: string) => {
    if (section === 'chat') {
      setChatOpen(true);
      return;
    }

    if (section === 'compare') {
      handleOpenCompare();
      return;
    }

    if (section === 'aftersales' || section === 'charging' || section === 'energy' || section === 'staff') {
      setCurrentView(section as any);
      if (!window.location.hash.startsWith(`#${section}`)) {
        window.history.pushState({ view: section }, '', `#${section}`);
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    const isCurrentlyHome = currentView === 'home';

    if (isCurrentlyHome) {
      if (section === 'hero' || section === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetId = section;
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      setCurrentView('home');
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      if (section !== 'hero' && section !== 'top') {
        setTimeout(() => {
          const el = document.getElementById(section);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 50);
      }
    }
  }, [currentView, handleOpenCompare]);

  const handleSelectCategory = useCallback((category: FilterCategory) => {
    setActiveCategory(category);
    handleNavClick('showcase');
  }, [handleNavClick]);

  const handleRoleChange = useCallback((newRole: Role) => {
    setRole(newRole);
    if (newRole === 'customer') setStaffDrawerOpen(false);
  }, []);

  const handleOpenAuthModal = useCallback((defaultRole?: Role) => {
    setAuthDefaultRole(defaultRole || role);
    setAuthModalOpen(true);
  }, [role]);

  useEffect(() => {
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
        setVehicles([...carList, ...scooterList]);
      }
    });
  }, []);

  // Silent Background Token Verification
  useEffect(() => {
    const token = localStorage.getItem('vinfast_token');
    if (token) {
      api.getMe<any>()
        .then((me) => {
          if (!me || !me.id || me.detail) {
            localStorage.removeItem('vinfast_token');
            localStorage.removeItem('vinfast_user');
            setCurrentUser(null);
            setRole('customer');
            return;
          }
          const verifiedRole: Role = me.role === 'admin' ? 'admin' : (me.role === 'consultant' ? 'staff' : 'customer');
          const userAcc: UserAccount = {
            id: me.id,
            name: me.full_name || me.name || 'Người dùng VinFast',
            email: me.email,
            phone: me.phone,
            role: verifiedRole,
            staffRole: me.role === 'admin' ? 'Quản trị viên Hệ thống' : (me.role === 'consultant' ? 'Tư vấn bán hàng' : undefined),
            employeeId: verifiedRole === 'admin' ? 'VF-ADMIN' : (verifiedRole === 'staff' ? 'VF-STAFF' : undefined),
            showroom: 'VinFast Landmark 81',
            memberLevel: 'Gold',
          };
          localStorage.setItem('vinfast_user', JSON.stringify(userAcc));
          setCurrentUser(userAcc);
          setRole(verifiedRole);
        })
        .catch(() => {
          // Keep offline cached user if network temporarily failed
        });
    }
  }, []);

  const handleLoginSuccess = useCallback((user: UserAccount, token?: string) => {
    if (token) {
      localStorage.setItem('vinfast_token', token);
    }
    localStorage.setItem('vinfast_user', JSON.stringify(user));
    setCurrentUser(user);
    setRole(user.role);

    if (user.role === 'admin') {
      setAdminDashboardOpen(true);
    } else if (user.role === 'staff') {
      setCurrentView('staff');
      window.location.hash = '#staff';
    }

    if (pendingTestDriveVehicle !== null) {
      setTestDriveVehicle(pendingTestDriveVehicle);
      setTestDriveOpen(true);
      setPendingTestDriveVehicle(null);
    }
  }, [pendingTestDriveVehicle]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('vinfast_token');
    localStorage.removeItem('vinfast_user');

    setCurrentUser(null);
    setRole('customer');
    setStaffDrawerOpen(false);
    setAdminDashboardOpen(false);
    setProfileModalOpen(false);
  }, []);


  const handleRequestQuote = useCallback((_vehicle: Vehicle) => {
    setChatOpen(true);
  }, []);

  return (
    <div id="top" className="min-h-screen bg-white font-sans antialiased">
      <Header
        role={role}
        onRoleChange={handleRoleChange}
        onOpenStaff={() => {
          if (currentUser?.role === 'admin') {
            setAdminDashboardOpen(true);
          } else {
            handleNavClick('staff');
          }
        }}
        onNavClick={handleNavClick}
        onSelectCategory={handleSelectCategory}
        currentView={currentView}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenAdminPortal={() => setAdminPortalOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenTestDrive={() => handleOpenTestDrive(null)}
        onLogout={handleLogout}
      />

      <main className="min-h-screen">
        {currentView === 'staff' && (
          <div key="staff" className="animate-fadeIn">
            <StaffPortalPage
              onBackToHome={() => handleNavClick('top')}
            />
          </div>
        )}

        {currentView === 'aftersales' && (
          <div key="aftersales" className="animate-fadeIn">
            <AftersalesPage
              onBackToHome={() => handleNavClick('top')}
              onOpenChat={() => setChatOpen(true)}
            />
          </div>
        )}

        {currentView === 'charging' && (
          <div key="charging" className="animate-fadeIn">
            <ChargingPage
              onBackToHome={() => handleNavClick('top')}
              onOpenChat={() => setChatOpen(true)}
              onOpenTestDrive={() => setTestDriveOpen(true)}
            />
          </div>
        )}

        {currentView === 'energy' && (
          <div key="energy" className="animate-fadeIn">
            <EnergyPage
              onBackToHome={() => handleNavClick('top')}
              onOpenChat={() => setChatOpen(true)}
            />
          </div>
        )}

        {currentView === 'compare' && (
          <div key="compare" className="animate-fadeIn">
            <CompareModal
              open={true}
              onClose={() => handleNavClick('top')}
              selectedIds={compareList}
              allVehicles={vehicles}
              onRemoveVehicle={handleRemoveCompare}
              onAddVehicle={handleAddCompare}
              onReplaceVehicle={handleReplaceCompare}
              onRequestQuote={handleRequestQuote}
              onOpenChatWithCompare={() => setChatOpen(true)}
            />
          </div>
        )}

        {currentView === 'home' && (
          <div key="home" className="animate-fadeIn">
            <Hero
              onExplore={() => handleNavClick('showcase')}
              onChat={() => setChatOpen(true)}
            />

            <VehicleShowcase
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
              onRequestQuote={handleRequestQuote}
              onViewDetail={handleViewDetail}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              vehicles={vehicles}
              onOpenChat={() => setChatOpen(true)}
              onOpenTestDrive={handleOpenTestDrive}
            />

            {/* Pricing section */}
            <section id="pricing" className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-blue-600" />
                  <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Bảng giá</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Giá bán lẻ đề xuất</h2>
                <p className="text-gray-500 mb-8 max-w-xl mx-auto">Giá chưa bao gồm phí đăng ký, bảo hiểm. Liên hệ showroom để biết ưu đãi mới nhất.</p>

                {/* Filter Tabs for Pricing Table */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'car', label: 'Ô tô điện' },
                    { id: 'scooter', label: 'Xe máy điện' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPricingTab(tab.id as 'all' | 'car' | 'scooter')}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${pricingTab === tab.id
                          ? 'bg-blue-700 text-white shadow-md shadow-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {(() => {
                  const filteredRows = PRICING_CATALOG_DATA.filter(
                    (row) => (pricingTab === 'all' ? true : row.type === pricingTab)
                  );
                  const visibleRows = showAllPricing ? filteredRows : filteredRows.slice(0, 10);
                  const remainingCount = filteredRows.length - 10;

                  return (
                    <>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="bg-blue-900 text-white">
                              {['Dòng xe', 'Phiên bản', 'Phân loại', 'Giá niêm yết', 'Dung lượng pin', 'Phạm vi hoạt động', 'Số chỗ'].map((h) => (
                                <th key={h} className="px-5 py-4 font-bold text-xs uppercase tracking-wider">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {visibleRows.map((row, i) => (
                              <tr
                                key={`${row.model}-${row.version}`}
                                className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'
                                  }`}
                              >
                                <td className="px-5 py-3.5 font-bold text-gray-900">{row.model}</td>
                                <td className="px-5 py-3.5 text-gray-600 font-medium">{row.version}</td>
                                <td className="px-5 py-3.5">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${row.type === 'car'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                  >
                                    {row.type === 'car' ? 'Ô tô điện' : 'Xe máy điện'}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 font-black text-blue-700">
                                  {row.price.toLocaleString('vi-VN')} VNĐ
                                </td>
                                <td className="px-5 py-3.5 text-gray-700">{row.battery}</td>
                                <td className="px-5 py-3.5 text-gray-700">{row.range}</td>
                                <td className="px-5 py-3.5 text-gray-700">{row.seats}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {filteredRows.length > 10 && (
                        <div className="mt-6 flex justify-center">
                          <button
                            onClick={() => setShowAllPricing(!showAllPricing)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm rounded-xl border border-blue-200 transition-all hover:shadow-md hover:scale-105"
                          >
                            <span>{showAllPricing ? 'Thu gọn bảng giá' : `Xem thêm (${remainingCount} mẫu xe khác)`}</span>
                            {showAllPricing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </section>

            {/* Test drive section */}
            <section id="testdrive" className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="absolute rounded-full border-2 border-white"
                    style={{ width: `${200 + i * 150}px`, height: `${200 + i * 150}px`, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
                ))}
              </div>
              <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="inline-block px-3 py-1 bg-white/10 text-blue-200 text-xs font-bold rounded-full tracking-widest uppercase mb-4 border border-white/20">
                  Lái thử miễn phí
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Trải nghiệm VinFast<br />tại showroom gần bạn
                </h2>
                <p className="text-blue-200 text-base mb-8 max-w-xl mx-auto">
                  Đặt lịch lái thử ngay hôm nay — hoàn toàn miễn phí. Chúng tôi sẽ liên hệ xác nhận trong vòng 2 giờ.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => handleOpenTestDrive(null)}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-base font-extrabold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
                    <span>Đăng Ký Lái Thử Trực Tuyến</span>
                  </button>
                  <button
                    onClick={() => setChatOpen(true)}
                    className="px-8 py-4 bg-white text-blue-900 text-base font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:scale-105"
                  >
                    Chat với nhân viên
                  </button>
                  <button
                    onClick={() => handleNavClick('showcase')}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white text-base font-semibold rounded-xl border border-white/25 transition-all hover:scale-105"
                  >
                    Xem dòng xe
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ fontFamily: '"Mulish", serif' }} className="bg-slate-950 text-white pt-14 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Quick Navigation Links */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={logoVinFast}
                alt="VinFast Logo"
                className="h-8 w-auto object-contain brightness-0 invert"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('/VINpng/')) {
                    target.src = '/VINpng/Pin/VinFast-logo.png';
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-bold text-slate-300">
              <a href="https://vinfastauto.com/vn_vi/ve-vinfast" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors uppercase">VỀ VINFAST</a>
              <span className="text-slate-700">|</span>
              <a href="https://vingroup.net" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors uppercase">VỀ VINGROUP</a>
              <span className="text-slate-700">|</span>
              <a href="https://vinfastauto.com/vn_vi/tin-tuc" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors uppercase">TIN TỨC</a>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => {
                  handleNavClick('charging');
                  setTimeout(() => {
                    document.getElementById('section-network-map')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="hover:text-blue-400 transition-colors uppercase cursor-pointer"
              >
                SHOWROOM & ĐẠI LÝ
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => handleNavClick('aftersales')}
                className="hover:text-blue-400 transition-colors uppercase cursor-pointer"
              >
                ĐIỀU KHOẢN CHÍNH SÁCH
              </button>
            </div>
          </div>

          {/* Main Footer Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10 text-xs text-slate-400 leading-relaxed border-b border-slate-800">
            {/* Column 1: Legal Company Info */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-white text-sm">Công ty TNHH Kinh doanh Thương mại và Dịch vụ VinFast</h4>
              <p>
                <strong>MST/MSDN:</strong> 0108926276 do Sở KHĐT TP Hà Nội cấp lần đầu ngày 01/10/2019 và các lần thay đổi tiếp theo.
              </p>
              <p>
                <strong>Địa chỉ trụ sở chính:</strong> Số 7, Đường Bằng Lăng 1, Khu đô thị Vinhomes Riverside, Phường Phúc Lợi, Thành phố Hà Nội, Việt Nam.
              </p>
              <p>
                <strong>Người đại diện theo pháp luật:</strong> Nguyễn Mai Hoa.
              </p>
              <p>
                <strong>Chức vụ:</strong> Chủ tịch Hội đồng thành viên.
              </p>
            </div>

            {/* Column 2: Customer Service & Speak-Up */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Dịch Vụ Khách Hàng</h4>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <div className="text-white font-bold">📞 Tổng đài CSKH 24/7</div>
                <div className="text-blue-400 text-sm font-extrabold">1900 23 23 89 - Nhánh 1</div>
                <div>Email: <a href="mailto:support.vn@vinfastauto.com" className="text-slate-300 hover:text-white underline">support.vn@vinfastauto.com</a></div>
              </div>

              <div className="pt-1">
                <h4 className="font-bold text-white text-xs mb-1 uppercase tracking-wider">SPEAK-UP HOTLINE</h4>
                <p>Website: <a href="https://vinfast.ethicspoint.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">vinfast.ethicspoint.com</a></p>
                <p>Email: <a href="mailto:v.speakup@vinfast.vn" className="text-slate-300 hover:text-white underline">v.speakup@vinfast.vn</a></p>
              </div>
            </div>

            {/* Column 3: Vingroup Ecosystem */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Hệ Sinh Thái Vingroup</h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <a href="https://vinhomes.vn" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Vinhomes</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <a href="https://vinmec.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Vinmec</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <a href="https://vinpearl.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Vinpearl</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <a href="https://vinschool.edu.vn" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Vinschool</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  <a href="https://vinuni.edu.vn" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">VinUni</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                  <a href="https://vinbus.vn" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">VinBus</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  <a href="https://xanhsm.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Xanh SM</a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  <a href="https://vinfastauto.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">VinFast Toàn cầu</a>
                </li>
              </ul>
            </div>

            {/* Column 4: Social & MoIT Certification */}
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm mb-2">Kết Nối Với VinFast</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Facebook', url: 'https://www.facebook.com/VinFastAuto.Official', color: 'hover:bg-blue-600 hover:border-blue-500' },
                    { name: 'YouTube', url: 'https://www.youtube.com/@vinfastauto.official', color: 'hover:bg-red-600 hover:border-red-500' },
                    { name: 'TikTok', url: 'https://www.tiktok.com/@vinfastofficial', color: 'hover:bg-neutral-800 hover:border-neutral-600' },
                    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/vinfastauto', color: 'hover:bg-sky-700 hover:border-sky-600' },
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-lg transition-all hover:text-white hover:scale-105 shadow-sm inline-flex items-center gap-1.5 ${social.color}`}
                    >
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <a
                  href="http://online.gov.vn/Home/WebDetails/68412"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-500 text-red-500 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    ✓
                  </div>
                  <div>
                    <div className="text-white font-bold text-[11px] group-hover:text-blue-400 transition-colors">Đã Đăng Ký Bộ Công Thương</div>
                    <div className="text-[10px] text-slate-400">Chứng nhận thương mại điện tử</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>© Copyright 2025 VinFast. All rights reserved.</div>
            <div>Tiên phong tương lai di chuyển xanh</div>
          </div>
        </div>
      </footer>

      {/* Compare bar */}
      {currentView !== 'compare' && (
        <CompareBar
          compareList={compareList}
          allVehicles={vehicles}
          onClear={handleClearCompare}
          onRemove={handleRemoveCompare}
          onOpenCompare={handleOpenCompare}
        />
      )}

      {/* Floating Action Button for Logged-In User Mailbox */}
      {currentUser && (
        <button
          type="button"
          onClick={() => setMailboxOpen(true)}
          className="fixed bottom-24 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer bg-blue-700 hover:bg-blue-600"
          title="Hòm thư báo giá"
        >
          <Mail size={22} className="text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* User Mailbox Drawer */}
      <UserMailboxDrawer
        open={mailboxOpen}
        onClose={() => setMailboxOpen(false)}
        user={currentUser}
      />

      {/* Human customer support chat */}
      <SupportChatWidget
        externalOpen={chatOpen}
        onExternalOpenChange={setChatOpen}
        currentUser={currentUser}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboardModal
        open={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
      />

      {/* Staff drawer */}
      <StaffDrawer
        open={staffDrawerOpen}
        onClose={() => setStaffDrawerOpen(false)}
      />

      {/* Auth Modal for Customers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={authDefaultRole}
      />

      {/* Admin & Corporate Staff Portal Modal */}
      <AdminPortalModal
        isOpen={adminPortalOpen}
        onClose={() => setAdminPortalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={currentUser}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            try {
              localStorage.setItem('vinfast_user', JSON.stringify(updated));
            } catch {}
          }}
          onLogout={handleLogout}
          onOpenStaffConsole={() => {
            setProfileModalOpen(false);
            if (currentUser.role === 'admin') {
              setAdminDashboardOpen(true);
            } else {
              handleNavClick('staff');
            }
          }}
          onOpenChat={() => setChatOpen(true)}
        />
      )}


      {/* Vehicle Detail Modal for Guest */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        allVehicles={vehicles}
        open={detailModalOpen}
        onClose={handleCloseDetail}
        onRequestQuote={handleRequestQuote}
        onOpenChat={() => setChatOpen(true)}
        onOpenTestDrive={handleOpenTestDrive}
      />

      {/* Test Drive Modal */}
      <TestDriveModal
        isOpen={testDriveOpen}
        onClose={() => {
          setTestDriveOpen(false);
          setPendingTestDriveVehicle(null);
        }}
        initialVehicle={testDriveVehicle}
        allVehicles={vehicles}
        user={currentUser}
        onOpenAuth={handleOpenAuthModal}
      />
    </div>
  );
}


