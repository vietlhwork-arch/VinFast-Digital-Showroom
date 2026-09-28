import type { Vehicle } from '@/types';

export type SmartFeatureStatus = 'confirmed' | 'optional' | 'unconfirmed';

export interface SmartFeatureItem {
  key: string;
  label: string;
  status: SmartFeatureStatus;
}

const LEGACY_FALLBACKS = new Set([
  'Trợ lý ảo Tiếng Việt ViVi',
  'Trợ lý ảo ViVi AI Tiếng Việt',
  'Trợ lý ảo ViVi AI Tiếng Việt, Điều khiển từ xa qua App VinFast',
  'Định vị GPS & Khóa Smartkey',
  'Định vị GPS & Khóa Smartkey thông minh',
  'Kết nối App VinFast, Định vị GPS & Khóa Smartkey',
]);

const TECH_LABELS: Record<string, string> = {
  gps: 'Định vị GPS',
  smart_key: 'Khóa Smartkey',
  smartphone_app: 'Ứng dụng VinFast',
  smartphone_connection: 'Kết nối điện thoại',
  smart_management: 'Quản lý thông minh',
  display: 'Màn hình hiển thị',
  digital_display: 'Màn hình kỹ thuật số',
  screen: 'Màn hình hiển thị',
  bluetooth: 'Kết nối Bluetooth',
  auto_hold: 'Auto Hold',
  riding_modes: 'Các chế độ lái',
  ota_update: 'Cập nhật phần mềm OTA',
  battery_management: 'Quản lý pin thông minh',
  battery_swap: 'Hỗ trợ đổi pin',
  battery_configuration: 'Cấu hình pin',
  two_battery_support: 'Hỗ trợ hai pin',
  lock: 'Khóa xe',
  pet_mode: 'Chế độ thú cưng',
  camp_mode: 'Chế độ cắm trại',
  vinfast_remote_app: 'Quản lý xe từ xa qua App VinFast',
};

const OFFICIAL_VIVI_MODELS = [
  'herio green',
  'limo green',
  'vf 5',
  'vf 6',
  'vf 7',
  'vf 8',
  'vf 9',
  'vf mpv 7',
];

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : {};
}

function getSpecContainers(raw: unknown): Record<string, any>[] {
  const root = asRecord(raw);
  const nestedLegacy = asRecord(asRecord(root.additional_specs)._legacy_source);
  const legacy = asRecord(root._legacy_source);
  const nestedLegacySpecs = asRecord(nestedLegacy.specifications);
  const legacySpecs = asRecord(legacy.specifications);
  const directAdditional = asRecord(root.additional_specs);
  const legacyAdditional = asRecord(nestedLegacySpecs.additional_specs || legacySpecs.additional_specs);
  const directSpecs = asRecord(root.specs);
  const nestedCatalog = asRecord(nestedLegacy.catalog);
  const catalog = asRecord(legacy.catalog);
  return [root, nestedCatalog, catalog, directAdditional, directSpecs, legacyAdditional, nestedLegacySpecs, legacySpecs];
}

function firstValue(containers: Record<string, any>[], key: string): unknown {
  for (const container of containers) {
    if (container[key] !== undefined && container[key] !== null) return container[key];
  }
  return undefined;
}

function statusFrom(value: unknown, fallback: SmartFeatureStatus = 'confirmed'): SmartFeatureStatus {
  const text = String(value ?? '').toLowerCase();
  if (text.includes('tùy chọn') || text.includes('optional')) return 'optional';
  if (text.includes('chưa xác nhận') || text.includes('unconfirmed')) return 'unconfirmed';
  return fallback;
}

function valueLabel(key: string, value: unknown): string | null {
  if (value === undefined || value === null || value === false) return null;
  if (typeof value === 'string' && !value.trim()) return null;
  if (value === true || value === 1 || value === 'true') return TECH_LABELS[key] || key;
  if (typeof value === 'object' && value !== null) return null;
  const label = TECH_LABELS[key] || key.split('_').join(' ');
  return key === 'smart_management' || key === 'smartphone_app' || key === 'lock'
    ? String(value)
    : `${label}: ${String(value)}`;
}

function explicitItems(value: unknown): SmartFeatureItem[] {
  const container = asRecord(value);
  const items = Array.isArray(container.items) ? container.items : [];
  return items.flatMap((item: any) => {
    if (typeof item === 'string') return [{ key: item, label: item, status: 'confirmed' as const }];
    if (!item || typeof item !== 'object') {
      const serialized = JSON.stringify(item);
      return serialized ? [{ key: serialized, label: serialized, status: 'confirmed' as const }] : [];
    }
    // Keep a database item intact even when an older row has no `label` key.
    // JSON is only a lossless presentation fallback for that malformed shape.
    const label = item.label
      ? String(item.label)
      : JSON.stringify(item);
    if (!label) return [];
    const status = statusFrom(item.status, 'confirmed');
    return [{ key: String(item.key || label), label, status }];
  });
}

function explicitSmartFeatureContainer(containers: Record<string, any>[]): Record<string, any> | null {
  return containers.find((container) => {
    const smart = asRecord(container.smart_features);
    return Array.isArray(smart.items);
  }) || null;
}

export function getSmartFeatureItems(raw: unknown): SmartFeatureItem[] {
  const containers = getSpecContainers(raw);
  const explicitContainer = explicitSmartFeatureContainer(containers);
  // The catalog's smart_features.items is the source of truth. Preserve its
  // exact order and every item, including unconfirmed entries. Do not merge
  // inferred fields into an explicitly curated database list.
  if (explicitContainer) return explicitItems(explicitContainer.smart_features);

  const items: SmartFeatureItem[] = [];

  const tech = containers.find((container) => container.technology_features && typeof container.technology_features === 'object');
  const techFeatures = asRecord(tech?.technology_features);
  for (const key of Object.keys(TECH_LABELS)) {
    const label = valueLabel(key, techFeatures[key]);
    if (label) items.push({ key, label, status: statusFrom(techFeatures[key]) });
  }

  const driver = asRecord(firstValue(containers, 'driver_assistance_features'));
  for (const key of ['vietnamese_voice_assistant', 'voice_assistant', 'vinfast_remote_app', 'pet_mode', 'camp_mode']) {
    const label = valueLabel(key, driver[key]);
    if (label) {
      items.push({
        key,
        label: key === 'vietnamese_voice_assistant' || key === 'voice_assistant'
          ? (typeof driver[key] === 'string' ? String(driver[key]) : 'Trợ lý ảo ViVi Tiêu chuẩn')
          : label,
        status: statusFrom(driver[key]),
      });
    }
  }

  const identity = containers
    .flatMap((container) => [container.model_name, container.vehicle_line])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (OFFICIAL_VIVI_MODELS.some((model) => identity.includes(model)) && !items.some((item) => item.key === 'vivi')) {
    items.unshift({ key: 'vivi', label: 'Trợ lý ảo ViVi Tiêu chuẩn', status: 'confirmed' });
  }

  const deduped = new Map<string, SmartFeatureItem>();
  for (const item of items) {
    if (item.status === 'unconfirmed') continue;
    const identity = item.label.trim().toLowerCase();
    if (!deduped.has(identity)) deduped.set(identity, item);
  }
  return [...deduped.values()];
}

export function getSmartFeatureDisplay(raw: unknown): string | null {
  const explicitContainer = explicitSmartFeatureContainer(getSpecContainers(raw));
  if (explicitContainer) {
    const items = explicitItems(explicitContainer.smart_features);
    return items.length > 0 ? items.map((item) => item.label).join(', ') : null;
  }
  const items = getSmartFeatureItems(raw);
  if (!items.length) return null;
  return items.map((item) => item.status === 'optional' ? `${item.label} (Tùy chọn)` : item.label).join(', ');
}

export function normalizeVehicleHighlights(base: unknown, raw: unknown): string[] {
  const original = Array.isArray(base)
    ? base.filter((item): item is string => typeof item === 'string' && !LEGACY_FALLBACKS.has(item))
    : [];
  const smart = getSmartFeatureItems(raw).map((item) => item.status === 'optional' ? `${item.label} (Tùy chọn)` : item.label);
  return [...new Set([...original, ...smart])];
}

export function normalizeStaticVehicle(vehicle: Vehicle): Vehicle {
  return { ...vehicle, highlights: normalizeVehicleHighlights(vehicle.highlights, vehicle.rawSpecs) };
}
