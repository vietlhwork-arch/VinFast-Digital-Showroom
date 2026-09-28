import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Car,
  Bike,
  Wrench,
  Bus,
  Zap,
  RefreshCw,
  MapPin,
  Phone,
  Clock,
  Navigation,
  X,
  Maximize2,
  Minimize2,
  Check
} from 'lucide-react';
import {
  PROVINCES_LIST,
  DEMAND_FILTER_OPTIONS,
  PROVINCE_COORDINATES,
  type MapPoint,
  type LocationDemandType
} from '@/data/vinfastLocations';
import { fetchLocationsApi, syncLocationsApi } from '@/services/locationsApi';

interface StationMapFinderProps {
  onOpenTestDrive?: (locationName?: string) => void;
  onOpenChat?: () => void;
}

export default function StationMapFinder({ onOpenTestDrive, onOpenChat }: StationMapFinderProps) {
  const [locations, setLocations] = useState<MapPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Tất cả Tỉnh thành');
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả Quận huyện / Phường xã');
  const [checkedDemands, setCheckedDemands] = useState<Record<LocationDemandType, boolean>>({
    showroom_car: true,
    showroom_scooter: true,
    workshop_car: true,
    workshop_partner: true,
    workshop_bus: true,
    workshop_gsm: true,
    workshop_scooter: true,
    charging_car: true,
    charging_scooter: true,
    battery_swap: true,
  });

  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Load locations from Supabase via Backend API (Real-time live sync)
  const loadLocations = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await fetchLocationsApi();
      if (data && Array.isArray(data)) {
        setLocations(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu vị trí từ Supabase Backend:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial load + Realtime Polling + Focus event
  useEffect(() => {
    loadLocations(false);

    // Auto sync from Supabase every 15 seconds
    const interval = setInterval(() => {
      loadLocations(true);
    }, 15000);

    // Auto reload when user switches back to this browser tab
    const handleFocus = () => {
      loadLocations(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncLocationsApi();
      await loadLocations();
    } catch (err) {
      console.error('Failed to sync locations:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle checkbox
  const handleToggleDemand = (id: LocationDemandType) => {
    setCheckedDemands((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Get available districts/wards for selected province
  const availableDistricts = useMemo(() => {
    if (selectedProvince === 'Tất cả Tỉnh thành') return ['Tất cả Quận huyện / Phường xã'];
    const districts = Array.from(
      new Set(
        locations
          .filter((p) => p.province === selectedProvince)
          .map((p) => `${p.district}${p.ward ? ' - ' + p.ward : ''}`)
      )
    );
    return ['Tất cả Quận huyện / Phường xã', ...districts];
  }, [selectedProvince, locations]);

  // Filtered Points
  const filteredPoints = useMemo(() => {
    const activeTypes = Object.entries(checkedDemands)
      .filter(([_, isChecked]) => isChecked)
      .map(([type]) => type as LocationDemandType);

    if (activeTypes.length === 0) {
      return [];
    }

    return locations.filter((point) => {
      // Filter by Demand Type
      const hasMatchingType = point.types.some((t) => activeTypes.includes(t));
      if (!hasMatchingType) return false;

      // Filter by Province
      if (selectedProvince !== 'Tất cả Tỉnh thành' && point.province !== selectedProvince) {
        return false;
      }

      // Filter by District
      if (
        selectedDistrict !== 'Tất cả Quận huyện / Phường xã' &&
        !selectedDistrict.includes(point.district)
      ) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = point.name.toLowerCase().includes(q);
        const matchAddress = point.address.toLowerCase().includes(q);
        const matchProvince = point.province.toLowerCase().includes(q);
        if (!matchName && !matchAddress && !matchProvince) return false;
      }

      return true;
    });
  }, [checkedDemands, selectedProvince, selectedDistrict, searchQuery, locations]);

  // Auto Pan / Zoom Map on Province Change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (selectedProvince !== 'Tất cả Tỉnh thành' && PROVINCE_COORDINATES[selectedProvince]) {
      const { lat, lng, zoom } = PROVINCE_COORDINATES[selectedProvince];
      map.flyTo([lat, lng], zoom, { duration: 1.2 });
    } else if (selectedProvince === 'Tất cả Tỉnh thành') {
      map.flyTo([16.0471, 107.5], 6, { duration: 1.2 });
    }
  }, [selectedProvince]);

  // Load Leaflet dynamically
  useEffect(() => {
    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Center Vietnam overview as in the user screenshot
    const map = L.map(mapContainerRef.current, {
      center: [16.0471, 107.5],
      zoom: 6,
      zoomControl: false, // Clean look like the screenshot
    });

    // Sleek Positron Light Grayscale Tiles (identical to the VinFast clean map design)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Create a layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapLoaded]);

  // Render Blue Dot Markers matching VinFast UI
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !mapLoaded) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    filteredPoints.forEach((point) => {
      const isSelected = selectedPoint?.id === point.id;

      // Clean VinFast Blue Circular Dot Icon matching the screenshot
      const dotIcon = L.divIcon({
        className: 'vinfast-blue-dot-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-3.5 h-3.5 bg-[#1877F2] rounded-full border-2 border-white shadow-md transition-all duration-200 transform group-hover:scale-150 ${
              isSelected ? 'scale-150 ring-4 ring-[#1877F2]/30 bg-blue-700 z-50' : 'z-10'
            }"></div>
            ${
              isSelected
                ? `<div class="absolute -inset-1 rounded-full bg-blue-400 opacity-60 animate-ping pointer-events-none"></div>`
                : ''
            }
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10],
      });

      const marker = L.marker([point.coordinates.lat, point.coordinates.lng], {
        icon: dotIcon,
      });

      // Custom Popup HTML
      const popupHtml = `
        <div class="p-1 max-w-[280px] font-sans text-slate-800">
          <div class="flex items-center gap-1.5 mb-1.5">
            <span class="text-[11px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-[#1877F2] border border-blue-200">
              ${point.typeLabel}
            </span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-tight mb-1.5">${point.name}</h4>
          <p class="text-xs text-slate-600 mb-2 leading-relaxed">📍 ${point.address}</p>
          ${
            point.chargingInfo
              ? `<div class="mb-2 p-2 bg-emerald-50 rounded-lg text-xs font-semibold text-emerald-900 border border-emerald-100 flex items-center justify-between">
                  <span>⚡ <strong>${point.chargingInfo.availablePorts}/${point.chargingInfo.totalPorts}</strong> cổng sẵn sàng</span>
                  <span class="font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded text-[10px] border border-emerald-200">${point.chargingInfo.maxPower}</span>
                </div>`
              : ''
          }
          <div class="flex items-center gap-1.5 mt-2">
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${point.coordinates.lat},${point.coordinates.lng}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex-1 text-center bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-2 rounded-lg transition shadow-2xs"
            >
              🧭 Chỉ đường
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedPoint(point);
      });

      markersLayer.addLayer(marker);
    });
  }, [filteredPoints, selectedPoint, mapLoaded]);

  // Helper function to render demand icon
  const renderDemandIcon = (iconType: string, isChecked: boolean) => {
    const bgClass = isChecked ? 'bg-[#1877F2] text-white' : 'bg-gray-400 text-white';

    switch (iconType) {
      case 'car_v':
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center text-[10px] font-black shrink-0 transition-colors`}>
            V
          </div>
        );
      case 'scooter_v':
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center text-[10px] font-black shrink-0 transition-colors`}>
            V
          </div>
        );
      case 'wrench':
      case 'wrench_scooter':
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center shrink-0 transition-colors`}>
            <Wrench size={10} />
          </div>
        );
      case 'wrench_partner':
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center shrink-0 transition-colors`}>
            <Wrench size={10} />
          </div>
        );
      case 'bus':
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center shrink-0 transition-colors`}>
            <Bus size={11} />
          </div>
        );
      case 'gsm':
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center text-[9px] font-black shrink-0 transition-colors`}>
            G
          </div>
        );
      case 'charging_car':
      case 'charging_scooter':
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center shrink-0 transition-colors`}>
            <Zap size={11} className="fill-current" />
          </div>
        );
      case 'battery_swap':
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center shrink-0 transition-colors`}>
            <RefreshCw size={10} />
          </div>
        );
      default:
        return (
          <div className={`w-5 h-5 rounded-full ${bgClass} flex items-center justify-center shrink-0 transition-colors`}>
            <MapPin size={10} />
          </div>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-none md:rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'
      }`}
    >
      <div className="flex flex-col lg:flex-row min-h-[680px] lg:min-h-[760px]">
        {/* ================= LEFT SIDEBAR (Controls & Demands) ================= */}
        <div className="w-full lg:w-[380px] xl:w-[410px] bg-white p-6 lg:p-8 flex flex-col justify-start border-r border-gray-100 shrink-0">
          {/* Main Title: Exact VinFast style */}
          <h2 className="text-[26px] sm:text-[28px] font-normal text-slate-800 leading-[1.2] mb-6 tracking-tight">
            Hệ thống Showroom<br />
            và Trạm sạc
          </h2>

          {/* Search Input */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tên địa điểm"
              className="w-full bg-[#f8f9fa] border border-gray-200/90 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1877F2] focus:border-[#1877F2] transition pr-10"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            ) : (
              <Search
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1877F2] pointer-events-none"
                size={18}
              />
            )}
          </div>

          {/* Section 1: Khu vực tìm kiếm */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Khu vực tìm kiếm</h3>

            {/* Dropdown 1: Tỉnh thành */}
            <div className="relative mb-3">
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedDistrict('Tất cả Quận huyện / Phường xã');
                }}
                className="w-full bg-[#f8f9fa] border border-gray-200/90 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1877F2] focus:border-[#1877F2] transition pr-10"
              >
                {PROVINCES_LIST.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov === 'Tất cả Tỉnh thành' ? 'Tỉnh thành' : prov}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={18}
              />
            </div>

            {/* Dropdown 2: Phường xã */}
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={selectedProvince === 'Tất cả Tỉnh thành'}
                className="w-full bg-[#f8f9fa] border border-gray-200/90 rounded-xl px-4 py-3 text-sm text-gray-700 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1877F2] focus:border-[#1877F2] transition pr-10 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {availableDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist === 'Tất cả Quận huyện / Phường xã' ? 'Phường xã' : dist}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Section 2: Tìm theo nhu cầu */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-semibold text-slate-800">Tìm theo nhu cầu</h3>
              <button
                type="button"
                onClick={() => {
                  const allChecked = Object.values(checkedDemands).every(Boolean);
                  const nextState = { ...checkedDemands };
                  DEMAND_FILTER_OPTIONS.forEach((opt) => {
                    nextState[opt.id] = !allChecked;
                  });
                  setCheckedDemands(nextState);
                }}
                className="text-xs text-[#1877F2] hover:text-blue-700 font-medium cursor-pointer transition"
              >
                {Object.values(checkedDemands).every(Boolean) ? 'Bỏ chọn hết' : 'Chọn tất cả'}
              </button>
            </div>

            <div className="space-y-3">
              {DEMAND_FILTER_OPTIONS.map((demand) => {
                const isChecked = checkedDemands[demand.id];

                return (
                  <div
                    key={demand.id}
                    onClick={() => handleToggleDemand(demand.id)}
                    className="flex items-center justify-between py-1 cursor-pointer select-none group"
                  >
                    {/* Left: Icon + Label */}
                    <div className="flex items-center gap-3">
                      {renderDemandIcon(demand.iconType, isChecked)}
                      <span
                        className={`text-[13.5px] transition-colors ${
                          isChecked
                            ? 'font-medium text-slate-800'
                            : 'font-normal text-slate-600 group-hover:text-slate-900'
                        }`}
                      >
                        {demand.label}
                      </span>
                    </div>

                    {/* Right: Checkbox */}
                    <div
                      className={`w-[18px] h-[18px] rounded flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-[#1877F2] border border-[#1877F2] text-white'
                          : 'border border-gray-300 bg-white group-hover:border-gray-400'
                      }`}
                    >
                      {isChecked && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom count badge & Sync */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Live: <strong className="text-[#1877F2]">{filteredPoints.length}/{locations.length}</strong> điểm</span>
              {isLoading && (
                <span className="inline-block w-3 h-3 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin"></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadLocations(false)}
                disabled={isLoading}
                className="text-gray-600 hover:text-[#1877F2] flex items-center gap-1 transition px-2 py-1 rounded bg-gray-100 hover:bg-blue-50 font-medium cursor-pointer"
                title="Lấy dữ liệu mới nhất trực tiếp từ Supabase"
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin text-[#1877F2]' : ''} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT MAP VIEW ================= */}
        <div className="flex-1 relative bg-[#f2f4f8] min-h-[500px] lg:min-h-[760px] flex flex-col">
          {/* Leaflet Map Canvas */}
          <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

          {/* Loading overlay if fetching */}
          {isLoading && locations.length === 0 && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
              <div className="w-8 h-8 border-3 border-[#1877F2] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-semibold text-slate-700">Đang tải vị trí Showroom & Trạm sạc VinFast...</span>
            </div>
          )}

          {/* Fullscreen & Reset Controls */}
          <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="w-10 h-10 bg-white/95 hover:bg-white text-gray-700 rounded-xl shadow-md border border-gray-200 flex items-center justify-center transition hover:scale-105"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>

          {/* Bottom Left "Google" watermark-like text as in screenshot */}
          <div className="absolute bottom-2 left-4 z-10 flex items-center gap-3 text-[11px] text-gray-500 pointer-events-none select-none bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded">
            <span className="font-bold text-slate-700">VinFast Maps</span>
            <span className="text-[10px] text-gray-400">Dữ liệu thực tế ©2026</span>
          </div>

          {/* Selected Point Bottom Floating Card */}
          {selectedPoint && (
            <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-20 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded bg-blue-50 text-[#1877F2] border border-blue-200">
                    {selectedPoint.typeLabel}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1.5 leading-snug">
                    {selectedPoint.name}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-xs text-gray-600 mb-3 leading-relaxed flex items-start gap-1.5">
                <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{selectedPoint.address}</span>
              </p>

              {selectedPoint.chargingInfo && (
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-950 font-medium mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-emerald-600 fill-emerald-500" />
                    <span>
                      <strong>{selectedPoint.chargingInfo.availablePorts}/{selectedPoint.chargingInfo.totalPorts}</strong> cổng khả dụng
                    </span>
                  </div>
                  <span className="font-bold text-[11px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {selectedPoint.chargingInfo.maxPower}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.coordinates.lat},${selectedPoint.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition"
                >
                  <Navigation size={13} />
                  <span>Chỉ đường</span>
                </a>

                {selectedPoint.phone && (
                  <a
                    href={`tel:${selectedPoint.phone.replace(/\s/g, '')}`}
                    className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center gap-1 transition"
                  >
                    <Phone size={13} />
                    <span>Gọi</span>
                  </a>
                )}

                {selectedPoint.types.includes('showroom_car') && onOpenTestDrive && (
                  <button
                    onClick={() => onOpenTestDrive(selectedPoint.name)}
                    className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs transition"
                  >
                    Lái thử
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
