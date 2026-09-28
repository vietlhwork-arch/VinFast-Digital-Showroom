import blobMapping from './blob_mapping.json';

const CLOUD_STORAGE_BASE_URL = import.meta.env.VITE_CLOUD_STORAGE_URL || 'https://ephwgmkkiqgboncq.public.blob.vercel-storage.com';
const mapping = (blobMapping || {}) as Record<string, string>;

/**
 * Returns absolute Cloud Storage / Vercel Blob URL for any relative asset path
 */
export function getCloudAssetUrl(relativePath: string): string {
  if (!relativePath) return '/VINpng/AdsCars/vf8-4k.png';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  const clean = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  if (mapping[clean]) return mapping[clean];
  if (mapping[`frontend/public/${clean}`]) return mapping[`frontend/public/${clean}`];
  return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
}

export const CLOUD_ASSETS = {
  // Logo
  VINFAST_LOGO: getCloudAssetUrl('/VINpng/Pin/VinFast-logo.png'),

  // Heavy Videos (Vercel Blob)
  VIDEO_NHA_MAY: import.meta.env.VITE_VIDEO_NHA_MAY_URL || getCloudAssetUrl('/VINpng/nangluong/Khám phá nhà máy sản xuất.mp4'),
  VIDEO_NHA_MAY_BLOB: `${CLOUD_STORAGE_BASE_URL}/Kh%C3%A1m%20ph%C3%A1%20nh%C3%A0%20m%C3%A1y%20s%E1%BA%A3n%20xu%E1%BA%A5t.mp4`,

  // 4K Ads & Hero Images
  VF6_4K: getCloudAssetUrl('/VINpng/AdsCars/vf6-4k.png'),
  VF8_4K: getCloudAssetUrl('/VINpng/AdsCars/vf8-4k.png'),
  VF9_4K: getCloudAssetUrl('/VINpng/AdsCars/vf9-4k.png'),
  BANNER_SOSANH: getCloudAssetUrl('/VINpng/AdsCars/banner_sosanh.png'),

  // Energy Assets
  ENERGY_BANNER: getCloudAssetUrl('/VINpng/nangluong/banner.png'),
  ENERGY_GIOI_THIEU: getCloudAssetUrl('/VINpng/nangluong/giới thiệu chung.png'),
  ENERGY_DAN_DUNG: getCloudAssetUrl('/VINpng/nangluong/Giải pháp lưu trữ năng lượng dân dụng.png'),
  ENERGY_DANG_TU: getCloudAssetUrl('/VINpng/nangluong/Giải pháp lưu trữ năng lượng dạng tủ.png'),
  ENERGY_CONTAINER: getCloudAssetUrl('/VINpng/nangluong/Giải pháp lưu trữ năng lượng 20FT Container.png'),

  // Charging & Battery Assets
  CHARGING_BO_SAC_DI_DONG: getCloudAssetUrl('/VINpng/Pin/bộ sạc di động 2,2 kW (ô tô điện).png'),
  CHARGING_BO_SAC_THEO_XE: getCloudAssetUrl('/VINpng/Pin/bộ sạc theo xe 3,5 kW (ô tô điện).png'),
  CHARGING_BO_SAC_TREO_TUONG: getCloudAssetUrl('/VINpng/Pin/bộ sạc treo tường AC 7,4 kW.png'),
  CHARGING_HUONG_DAN_THUE: getCloudAssetUrl('/VINpng/Pin/hướng dẫn thuê sạc.png'),
  CHARGING_LOI_ICH_THUE: getCloudAssetUrl('/VINpng/Pin/lợi ích việc thuê pin.png'),
  CHARGING_QUY_HOACH_VINFAST: getCloudAssetUrl('/VINpng/Pin/quy hoạch trạm sạc vinfast.png'),
  CHARGING_QUY_HOACH_TRAM: getCloudAssetUrl('/VINpng/Pin/quy hoạch trạm sạc.png'),
  CHARGING_QUY_DINH: getCloudAssetUrl('/VINpng/Pin/quy định sử dungj pin.png'),
  CHARGING_TRU_SAC_150KW: getCloudAssetUrl('/VINpng/Pin/trụ sạc ô tô - sạc siêu nhanh DC 150kW.png'),
  CHARGING_TRU_SAC_250KW: getCloudAssetUrl('/VINpng/Pin/trụ sạc ô tô - sạc siêu nhanh DC 250kW.png'),
  CHARGING_TRU_SAC_30KW: getCloudAssetUrl('/VINpng/Pin/trụ sạc ô tô - sạc siêu nhanh DC 30kW.png'),
  CHARGING_TRU_SAC_60KW: getCloudAssetUrl('/VINpng/Pin/trụ sạc ô tô - sạc siêu nhanh DC 60kW.png'),
  CHARGING_DA_DANG: getCloudAssetUrl('/VINpng/Pin/đa dạng giải pháp sạc.png'),
  CHARGING_BANNER: getCloudAssetUrl('/VINpng/Pin/banner.png'),

  // Aftersales Assets
  AFTERSALES_BANNER: getCloudAssetUrl('/VINpng/haumai/banner.png'),
  AFTERSALES_XE_MAY: getCloudAssetUrl('/VINpng/haumai/Dịch vụ hậu mãi của VinFast cho xe máy điện.png'),
  AFTERSALES_XE_MAY_3: getCloudAssetUrl('/VINpng/haumai/Dịch vụ hậu mãi của VinFast cho xe máy điện 3.png'),
  AFTERSALES_CAP_NHAT: getCloudAssetUrl('/VINpng/haumai/Người dùng xe máy điện VinFast được cập nhật phần mềm thường xuyên, đáp ứng nhu cầu sử dụng .png'),
  AFTERSALES_OTO_DIEN: getCloudAssetUrl('/VINpng/haumai/Dịch vụ hậu mãi của VinFast cho ô tô điện.png'),
  AFTERSALES_CUU_HO: getCloudAssetUrl('/VINpng/haumai/Dịch vụ cứu hộ pin 247 giúp người dùng an tâm hơn khi gặp những tình huống bất ngờ.png'),
  AFTERSALES_OTO_XANG: getCloudAssetUrl('/VINpng/haumai/Dịch vụ hậu mãi của VinFast riêng cho ô tô xăng.png'),
};
