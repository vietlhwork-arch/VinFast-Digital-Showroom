/**
 * CẤU HÌNH TỈ LỆ PHÓNG TO / THU NHỎ (SCALE) RIÊNG BIỆT CHO 2 NỀN TẢNG:
 * - scaleLocal: Áp dụng khi chạy trên Localhost (http://localhost:5173)
 * - scaleVercel: Áp dụng khi xem trên Vercel (https://p-101.vercel.app)
 * - scale: Giá trị mặc định chung nếu không cấu hình riêng
 * 
 * Thay đổi tại đây CHỈ áp dụng cho các thẻ xe (Card) trong phần "Khám phá thế giới điện",
 * KHÔNG làm biến đổi file ảnh gốc và KHÔNG ảnh hưởng tới các vị trí khác (Hero, Modal, Chi tiết...).
 */

export interface VehicleScaleItem {
  scaleLocal?: number;   // Scale riêng khi chạy trên Local (localhost)
  scaleVercel?: number;  // Scale riêng khi chạy trên Vercel (production)
  scale?: number;        // Scale dự phòng (nếu không set riêng lẻ)
  note?: string;
}

export const VEHICLE_CARD_SCALE_CONFIG: Record<string, VehicleScaleItem> = {
  // =========================================================================
  // --- 1. DÒNG Ô TÔ ĐIỆN VINFAST ---
  // =========================================================================
  VF2: {
    scaleLocal: 1.4,
    scaleVercel: 1.1,
    note: 'VinFast VF 2',
  },
  VF3: {
    scaleLocal: 1.5,
    scaleVercel: 1.3,
    note: 'VinFast VF 3 (Mẫu chuẩn - Giữ nguyên cả 2 nơi)',
  },
  VF5: {
    scaleLocal: 1.8,
    scaleVercel: 1.2,
    note: 'VinFast VF 5',
  },
  VF6: {
    scaleLocal: 1.6,
    scaleVercel: 1.2,
    note: 'VinFast VF 6',
  },
  VF7: {
    scaleLocal: 1.3,
    scaleVercel: 1.0,
    note: 'VinFast VF 7',
  },
  VF_MPV_7: {
    scaleLocal: 1.1,
    scaleVercel: 1.1,
    note: 'VinFast VF MPV 7 Tiêu chuẩn gia đình',
  },
  VF8: {
    scaleLocal: 1.5,
    scaleVercel: 1.0,
    note: 'VinFast VF 8',
  },
  VF9: {
    scaleLocal: 1.5,
    scaleVercel: 1.0,
    note: 'VinFast VF 9',
  },

  // =========================================================================
  // --- 2. DÒNG XE DỊCH VỤ & THƯƠNG MẠI ---
  // =========================================================================
  MINIO: {
    scaleLocal: 1.2,
    scaleVercel: 1.05,
    note: 'VinFast Minio Green',
  },
  HERIO: {
    scaleLocal: 1.1,
    scaleVercel: 1.05,
    note: 'VinFast Herio Green',
  },
  NERIO: {
    scaleLocal: 1.1,
    scaleVercel: 1.05,
    note: 'VinFast Nerio Green',
  },
  LIMO: {
    scaleLocal: 1.3,
    scaleVercel: 1.0,
    note: 'VinFast Limo Green',
  },
  EC_VAN: {
    scaleLocal: 1.2,
    scaleVercel: 1.05,
    note: 'VinFast EC Van',
  },
  EBUS: {
    scaleLocal: 1.1,
    scaleVercel: 0.85,
    note: 'VinFast EBus',
  },

  // =========================================================================
  // --- 3. DÒNG XE MÁY ĐIỆN & XE ĐẠP ĐIỆN ---
  // =========================================================================
  AMIO: {
    scaleLocal: 1.1,
    scaleVercel: 0.95,
    note: 'VinFast Amio Tiêu chuẩn',
  },
  AMIO_S: {
    scaleLocal: 1.4,
    scaleVercel: 0.95,
    note: 'VinFast Amio S',
  },
  AMIO_S2: {
    scaleLocal: 1.1,
    scaleVercel: 0.95,
    note: 'VinFast Amio S2',
  },
  ZGOO: {
    scaleLocal: 1.2,
    scaleVercel: 0.95,
    note: 'VinFast ZGoo Tiêu chuẩn',
  },
  EVO_LITE_NEO: {
    scaleLocal: 1.1,
    scaleVercel: 0.90,
    note: 'VinFast Evo Lite Neo',
  },
  FLAZZ: {
    scaleLocal: 1.2,
    scaleVercel: 0.85,
    note: 'VinFast Flazz Tiêu chuẩn',
  },
  FLAZZ_MAX: {
    scaleLocal: 1.2,
    scaleVercel: 1.0,
    note: 'VinFast Flazz Max',
  },
  VF_DRGNFLY: {
    scaleLocal: 1.0,
    scaleVercel: 0.85,
    note: 'VinFast VF DrgnFly eBike',
  },
  DRGNFLY: {
    scaleLocal: 0.85,
    scaleVercel: 0.7,
    note: 'Xe đạp điện DrgnFly',
  },
  EVO_LITE: {
    scaleLocal: 1.2,
    scaleVercel: 0.9,
    note: 'VinFast Evo Lite',
  },
  EVO_GRAND_LITE: {
    scaleLocal: 1.2,
    scaleVercel: 0.85,
    note: 'VinFast Evo Grand Lite',
  },
  EVO_GRAND: {
    scaleLocal: 1.2,
    scaleVercel: 0.95,
    note: 'VinFast Evo Grand',
  },
  EVO: {
    scaleLocal: 1.2,
    scaleVercel: 0.85,
    note: 'VinFast Evo',
  },
  FELIZ_2025: {
    scaleLocal: 1.2,
    scaleVercel: 0.85,
    note: 'VinFast Feliz 2025',
  },
  FELIZ_II: {
    scaleLocal: 1.3,
    scaleVercel: 0.85,
    note: 'VinFast Feliz II',
  },
  FELIZ: {
    scaleLocal: 1.2,
    scaleVercel: 0.85,
    note: 'VinFast Feliz',
  },
  VERO_X: {
    scaleLocal: 1.2,
    scaleVercel: 0.9,
    note: 'VinFast Vero X Tiêu chuẩn',
  },
  KYO: {
    scaleLocal: 1.2,
    scaleVercel: 0.85,
    note: 'VinFast Kyo',
  },
  VIPER: {
    scaleLocal: 1.2,
    scaleVercel: 0.9,
    note: 'VinFast Viper',
  },
  KINET: {
    scaleLocal: 1.2,
    scaleVercel: 0.85,
    note: 'VinFast Kinet',
  },
  KLARA: {
    scaleLocal: 0.85,
    scaleVercel: 0.7,
    note: 'Xe máy điện Klara',
  },
  VENTO: {
    scaleLocal: 0.85,
    scaleVercel: 0.7,
    note: 'Xe máy điện Vento',
  },
  THEON: {
    scaleLocal: 0.85,
    scaleVercel: 0.7,
    note: 'Xe máy điện Theon',
  },
};

/**
 * Tỉ lệ scale mặc định nếu xe không có tên trong cấu hình
 */
export const DEFAULT_LOCAL_SCALE = 0.88;
export const DEFAULT_VERCEL_SCALE = 0.85;
export const DEFAULT_VEHICLE_CARD_SCALE = 0.88;

/**
 * Kiểm tra xem ứng dụng hiện đang chạy trên môi trường Local hay Vercel (Production)
 */
export function isLocalEnvironment(): boolean {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.');
  }
  return import.meta.env.DEV ?? false;
}

/**
 * Hàm lấy tỉ lệ scale cho thẻ xe dựa theo mã xe (code) hoặc tên xe (name)
 * Tự động phát hiện môi trường: Local sẽ dùng scaleLocal, Vercel sẽ dùng scaleVercel.
 */
export function getVehicleCardScale(code?: string, name?: string): number {
  const isLocal = isLocalEnvironment();
  const target = `${code || ''} ${name || ''}`.toUpperCase().replace(/[\s-_]/g, '');

  // Sắp xếp các key dài hơn lên trước để ưu tiên match chính xác nhất (ví dụ EVO_GRAND_LITE trước EVO, AMIO_S2 trước AMIO)
  const entries = Object.entries(VEHICLE_CARD_SCALE_CONFIG).sort(
    (a, b) => b[0].replace(/[\s-_]/g, '').length - a[0].replace(/[\s-_]/g, '').length
  );

  for (const [key, item] of entries) {
    const cleanKey = key.toUpperCase().replace(/[\s-_]/g, '');
    if (target.includes(cleanKey)) {
      if (isLocal) {
        return item.scaleLocal ?? item.scale ?? DEFAULT_LOCAL_SCALE;
      } else {
        return item.scaleVercel ?? item.scale ?? DEFAULT_VERCEL_SCALE;
      }
    }
  }

  return isLocal ? DEFAULT_LOCAL_SCALE : DEFAULT_VERCEL_SCALE;
}
