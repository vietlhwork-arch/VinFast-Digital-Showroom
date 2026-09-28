export type VehicleColor = {
  name: string;
  official_name: string | null;
  color_code: string;
  type: 'solid' | 'two_tone';
  price_tier?: 'basic' | 'advanced';
  price_delta?: number;
  image_url?: string | null;
  /** Optional full-vehicle render; separate from the swatch asset. */
  full_image_url?: string | null;
};

// Keep the Vietnamese label stable even when an older API/database response
// contains a lossy label such as "Tr?ng". The color_code is the stable key.
const CANONICAL_NAMES_BY_CODE: Record<string, string> = {
  'infinity-blanc': 'Trắng',
  'solar-ruby': 'Đỏ',
  'crimson-red': 'Đỏ',
  'desat-silver': 'Bạc',
  'urban-mint': 'Xanh lá nhạt',
  yellow: 'Vàng',
  'summer-yellow': 'Vàng',
  'jet-black': 'Đen',
  'sky-blue': 'Xanh dương',
  'rose-pink': 'Hồng',
  'be-pebble': 'Be',
  'zenith-grey': 'Xám',
  'summer-yellow-infinity-blanc': 'Vàng Trắng',
  'sky-blue-infinity-blanc': 'Xanh dương Trắng',
  'rose-pink-infinity-blanc': 'Hồng Trắng',
};

const CANONICAL_OFFICIAL_NAMES_BY_CODE: Record<string, string> = {
  'sand-yellow': 'Cream Beige',
};

const COMMON_BROKEN_LABELS: Record<string, string> = {
  'tr?ng': 'Trắng',
  '??': 'Đỏ',
  'b?c': 'Bạc',
  'xanh l? nh?t': 'Xanh lá nhạt',
  'v?ng': 'Vàng',
  'xanh d??ng': 'Xanh dương',
  'h?ng': 'Hồng',
};

const NERIO_COLOR_CODES_BY_LABEL: Record<string, string> = {
  do: 'crimson-red',
  'crimson-red': 'crimson-red',
  bac: 'desat-silver',
  'desat-silver': 'desat-silver',
  den: 'jet-black',
  'jet-black': 'jet-black',
  vang: 'summer-yellow',
  'summer-yellow': 'summer-yellow',
};

const NERIO_SWATCH_IMAGES_BY_CODE: Record<string, string> = {
  'crimson-red': '/static/uploads/cars/colors/vf2/vf2-solar-ruby.webp',
  'desat-silver': '/static/uploads/cars/colors/vf2/vf2-desat-silver.webp',
  'jet-black': '/static/uploads/cars/colors/vf8/vf8-jet-black.webp',
  'summer-yellow': '/static/uploads/cars/colors/vf2/vf2-yellow.webp',
};

// Stable aliases for electric motorbike colors. These are deliberately
// separate from car color codes because each vehicle model owns its assets.
const MOTORBIKE_COLOR_CODES_BY_LABEL: Record<string, string> = {
  do: 'red',
  'do-tuoi': 'bright-red',
  'do-den': 'red-black',
  'do-tuoi-den-nham': 'bright-red-matte-black',
  trang: 'white',
  'trang-ngoc-trai': 'pearl-white',
  'trang-den': 'white-black',
  'trang-cam': 'white-orange',
  'trang-tim': 'white-purple',
  den: 'black',
  'den-nham': 'matte-black',
  'den-bong': 'glossy-black',
  xam: 'gray',
  'xam-xi-mang': 'cement-gray',
  'xam-decal-vang': 'gray-yellow-decal',
  xanh: 'green',
  'xanh-ngoc': 'tropical-jade',
  'xanh-reu': 'moss-green',
  'xanh-tim-than': 'navy-blue',
  'xanh-duong': 'blue',
  'xanh-oliu': 'olive-green',
  'lavender-sua': 'milk-lavender',
  vang: 'yellow',
  'vang-cat': 'sand-yellow',
  'nau-anh-kim': 'metallic-brown',
};

const MOTORBIKE_TWO_TONE_CODES = new Set([
  'red-black',
  'bright-red-matte-black',
  'white-black',
  'white-orange',
  'white-purple',
  'gray-yellow-decal',
]);

// A few catalog rows are currently returned with an empty colors array. Keep
// the official fallback local so the UI still shows the model's real palette
// until the source row is repaired in the database.
const MOTORBIKE_FALLBACK_COLORS_BY_VEHICLE: Record<string, readonly string[]> = {
  'evo-grand-lite': ['Tr\u1eafng ng\u1ecdc trai', '\u0110en nh\u00e1m', 'Lavender S\u1eefa', 'V\u00e0ng'],
  'feliz-2025': ['\u0110en b\u00f3ng', 'Xanh R\u00eau', 'Xanh Oliu', 'Tr\u1eafng Ng\u1ecdc Trai'],
};

// Catalog-approved palettes temporarily override stale non-empty API color
// arrays until the corresponding source rows are repaired.
const MOTORBIKE_OFFICIAL_COLORS_BY_VEHICLE: Record<string, readonly string[]> = {
  // Evo and Evo Lite intentionally have separate palette entries. They
  // currently contain the same four official colors, but are not aliased so
  // either model can be updated independently later.
  evo: ['Xanh Oliu', '\u0110\u1ecf t\u01b0\u01a1i', '\u0110en nh\u00e1m', 'Tr\u1eafng ng\u1ecdc trai'],
  'evo-lite': ['Xanh Oliu', '\u0110\u1ecf t\u01b0\u01a1i', '\u0110en nh\u00e1m', 'Tr\u1eafng ng\u1ecdc trai'],
  // Evo Grand Lite is separate from Evo Grand and has no V\u00e0ng c\u00e1t option.
  'evo-grand-lite': ['Tr\u1eafng ng\u1ecdc trai', '\u0110en nh\u00e1m', 'Lavender S\u1eefa', 'V\u00e0ng'],
  // Keep the regular Evo Grand order identical in the card and detail modal.
  'evo-grand': ['Tr\u1eafng ng\u1ecdc trai', '\u0110en nh\u00e1m', 'Xanh Oliu', '\u0110\u1ecf t\u01b0\u01a1i', 'Be Kem'],
  // Match the legacy vehicle-view swatch order shown for these two models.
  kyo: ['N\u00e2u \u00c1nh Kim', 'Tr\u1eafng Ng\u1ecdc Trai', '\u0110\u1ecf', '\u0110en B\u00f3ng', 'Xanh Oliu'],
  kinet: ['X\u00e1m Xi M\u0103ng', 'Tr\u1eafng Ng\u1ecdc Trai', '\u0110\u1ecf \u0110en', '\u0110en B\u00f3ng', 'N\u00e2u \u00c1nh Kim'],
  'feliz-2025': ['\u0110en b\u00f3ng', 'Xanh R\u00eau', 'Xanh Oliu', 'Tr\u1eafng Ng\u1ecdc Trai'],
  'vf-drgnfly': ['\u0110en b\u00f3ng', 'X\u00e1m Decal V\u00e0ng'],
};

function isMotorbikeVehicle(vehicle?: { name?: unknown; code?: unknown }): boolean {
  return /amio|zgoo|evo|flazz|drgnfly|feliz|vero\s*x|kyo|viper|kinet/i.test(
    `${vehicle?.code || ''} ${vehicle?.name || ''}`,
  );
}

function getMotorbikeVehicleSlug(vehicle?: { name?: unknown; code?: unknown }): string | null {
  const label = `${vehicle?.code || ''} ${vehicle?.name || ''}`;
  if (/amio\s*s2/i.test(label)) return 'amio-s2';
  if (/amio\s*s/i.test(label)) return 'amio-s';
  if (/amio/i.test(label)) return 'amio';
  if (/zgoo/i.test(label)) return 'zgoo';
  if (/evo\s+lite\s+neo/i.test(label)) return 'evo-lite-neo';
  if (/evo\s+grand\s+lite/i.test(label)) return 'evo-grand-lite';
  if (/evo\s+grand/i.test(label)) return 'evo-grand';
  if (/evo\s+lite/i.test(label)) return 'evo-lite';
  // Plain "Evo" (including "Evo Kèm pin") owns the separate Evo registry.
  if (/evo/i.test(label)) return 'evo';
  if (/flazz\s+max/i.test(label)) return 'flazz-max';
  if (/flazz/i.test(label)) return 'flazz';
  if (/drgnfly/i.test(label)) return 'vf-drgnfly';
  if (/feliz\s+2025/i.test(label)) return 'feliz-2025';
  if (/feliz\s+ii/i.test(label)) return 'feliz-ii';
  if (/feliz/i.test(label)) return 'feliz';
  if (/vero\s*x/i.test(label)) return 'vero-x';
  if (/kyo/i.test(label)) return 'kyo';
  if (/viper/i.test(label)) return 'viper';
  if (/kinet/i.test(label)) return 'kinet';
  return null;
}

// Full-vehicle renders downloaded from official VinFast product pages and
// visually verified. The registry is per model: a missing color intentionally
// falls back to that model's default image.
const MOTORBIKE_FULL_IMAGES_BY_VEHICLE: Record<string, Record<string, string>> = {
  amio: {
    black: '/static/uploads/motorbikes/colors/amio/full/amio-black.webp',
    white: '/static/uploads/motorbikes/colors/amio/full/amio-white.webp',
    red: '/static/uploads/motorbikes/colors/amio/full/amio-red.webp',
    gray: '/static/uploads/motorbikes/colors/amio/full/amio-gray.webp',
    green: '/static/uploads/motorbikes/colors/amio/full/amio-green.webp',
  },
  flazz: {
    'bright-red': '/static/uploads/motorbikes/colors/flazz/full/flazz-red.webp',
    'matte-black': '/static/uploads/motorbikes/colors/flazz/full/flazz-black.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/flazz/full/flazz-black.webp',
    'moss-green': '/static/uploads/motorbikes/colors/flazz/full/flazz-blue.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/flazz/full/flazz-white.webp',
  },
  'amio-s': {
    'cement-gray': '/static/uploads/motorbikes/colors/amio-s/full/amio-s-cement-gray.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/amio-s/full/amio-s-glossy-black.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/amio-s/full/amio-s-pearl-white.webp',
    'tropical-jade': '/static/uploads/motorbikes/colors/amio-s/full/amio-s-tropical-jade.webp',
    'bright-red': '/static/uploads/motorbikes/colors/amio-s/full/amio-s-bright-red.webp',
  },
  'amio-s2': {
    'glossy-black': '/static/uploads/motorbikes/colors/amio-s2/full/amio-s2-glossy-black.png',
    'white-black': '/static/uploads/motorbikes/colors/amio-s2/full/amio-s2-white-black.png',
    'bright-red': '/static/uploads/motorbikes/colors/amio-s2/full/amio-s2-bright-red.png',
    'tropical-jade': '/static/uploads/motorbikes/colors/amio-s2/full/amio-s2-tropical-jade.png',
    'white-purple': '/static/uploads/motorbikes/colors/amio-s2/full/amio-s2-white-purple.png',
  },
  'evo-lite-neo': {
    'matte-black': '/static/uploads/motorbikes/colors/evo-lite-neo/full/evo-lite-neo-matte-black.webp',
    'bright-red': '/static/uploads/motorbikes/colors/evo-lite-neo/full/evo-lite-neo-bright-red.webp',
    'navy-blue': '/static/uploads/motorbikes/colors/evo-lite-neo/full/evo-lite-neo-navy-blue.webp',
    'moss-green': '/static/uploads/motorbikes/colors/evo-lite-neo/full/evo-lite-neo-moss-green.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/evo-lite-neo/full/evo-lite-neo-pearl-white.webp',
  },
  zgoo: {
    'red-black': '/static/uploads/motorbikes/colors/zgoo/full/zgoo-red-black.webp',
    'bright-red-matte-black': '/static/uploads/motorbikes/colors/zgoo/full/zgoo-red-black.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/zgoo/full/zgoo-glossy-black.webp',
    'moss-green': '/static/uploads/motorbikes/colors/zgoo/full/zgoo-moss-green.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/zgoo/full/zgoo-pearl-white.webp',
  },
  'evo-grand': {
    'bright-red': '/static/uploads/motorbikes/colors/evo-grand/full/evo-grand-bright-red.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/evo-grand/full/evo-grand-pearl-white.webp',
    'matte-black': '/static/uploads/motorbikes/colors/evo-grand/full/evo-grand-matte-black.webp',
    'olive-green': '/static/uploads/motorbikes/colors/evo-grand/full/evo-grand-olive-green.webp',
    'sand-yellow': '/static/uploads/motorbikes/colors/evo-grand/full/evo-grand-sand-yellow.webp',
  },
  // Evo and Evo Lite use separate model-owned registries. The official
  // carousel currently supplies the same four full-color renders for both
  // variants, so the files are duplicated under each model directory.
  evo: {
    'bright-red': '/static/uploads/motorbikes/colors/evo/full/bright-red.webp',
    'olive-green': '/static/uploads/motorbikes/colors/evo/full/olive-green.webp',
    'matte-black': '/static/uploads/motorbikes/colors/evo/full/matte-black.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/evo/full/pearl-white.webp',
  },
  'evo-lite': {
    'bright-red': '/static/uploads/motorbikes/colors/evo-lite/full/bright-red.webp',
    'olive-green': '/static/uploads/motorbikes/colors/evo-lite/full/olive-green.webp',
    'matte-black': '/static/uploads/motorbikes/colors/evo-lite/full/matte-black.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/evo-lite/full/pearl-white.webp',
  },
  'evo-grand-lite': {
    'pearl-white': '/static/uploads/motorbikes/colors/evo-grand-lite/full/evo-grand-lite-pearl-white.webp',
    'matte-black': '/static/uploads/motorbikes/colors/evo-grand-lite/full/evo-grand-lite-matte-black.webp',
    'milk-lavender': '/static/uploads/motorbikes/colors/evo-grand-lite/full/evo-grand-lite-milk-lavender.webp',
    yellow: '/static/uploads/motorbikes/colors/evo-grand-lite/full/evo-grand-lite-yellow.webp',
  },
  kyo: {
    'metallic-brown': '/static/uploads/motorbikes/colors/kyo/full/kyo-metallic-brown.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/kyo/full/kyo-pearl-white.webp',
    red: '/static/uploads/motorbikes/colors/kyo/full/kyo-red.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/kyo/full/kyo-glossy-black.webp',
    'olive-green': '/static/uploads/motorbikes/colors/kyo/full/kyo-olive-green.webp',
  },
  viper: {
    'red-black': '/static/uploads/motorbikes/colors/viper/full/viper-red-black.webp',
    black: '/static/uploads/motorbikes/colors/viper/full/viper-black.webp',
    white: '/static/uploads/motorbikes/colors/viper/full/viper-white.webp',
    'cement-gray': '/static/uploads/motorbikes/colors/viper/full/viper-cement-gray.webp',
    'sand-yellow': '/static/uploads/motorbikes/colors/viper/full/viper-sand-yellow.webp',
  },
  kinet: {
    'red-black': '/static/uploads/motorbikes/colors/kinet/full/kinet-red-black.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/kinet/full/kinet-glossy-black.webp',
    'cement-gray': '/static/uploads/motorbikes/colors/kinet/full/kinet-cement-gray.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/kinet/full/kinet-pearl-white.webp',
    'metallic-brown': '/static/uploads/motorbikes/colors/kinet/full/kinet-metallic-brown.webp',
  },
  'flazz-max': {
    'red-black': '/static/uploads/motorbikes/colors/flazz-max/full/flazz-max-red-black.webp',
    'blue': '/static/uploads/motorbikes/colors/flazz-max/full/flazz-max-blue.webp',
    'white-orange': '/static/uploads/motorbikes/colors/flazz-max/full/flazz-max-white-orange.webp',
    black: '/static/uploads/motorbikes/colors/flazz-max/full/flazz-max-black.webp',
  },
  'feliz-2025': {
    'moss-green': '/static/uploads/motorbikes/colors/feliz-2025/full/feliz-2025-moss-green.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/feliz-2025/full/feliz-2025-glossy-black.webp',
    'matte-black': '/static/uploads/motorbikes/colors/feliz-2025/full/feliz-2025-matte-black.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/feliz-2025/full/feliz-2025-pearl-white.webp',
    'olive-green': '/static/uploads/motorbikes/colors/feliz-2025/full/feliz-2025-olive-green.webp',
  },
  'feliz-ii': {
    'bright-red': '/static/uploads/motorbikes/colors/feliz-ii/full/feliz-ii-bright-red.webp',
    red: '/static/uploads/motorbikes/colors/feliz-ii/full/feliz-ii-bright-red.webp',
    white: '/static/uploads/motorbikes/colors/feliz-ii/full/feliz-ii-white.webp',
    black: '/static/uploads/motorbikes/colors/feliz-ii/full/feliz-ii-black.webp',
    'olive-green': '/static/uploads/motorbikes/colors/feliz-ii/full/feliz-ii-olive-green.webp',
  },
  'vero-x': {
    'olive-green': '/static/uploads/motorbikes/colors/vero-x/full/vero-x-olive-green.webp',
    'matte-black': '/static/uploads/motorbikes/colors/vero-x/full/vero-x-matte-black.webp',
    'moss-green': '/static/uploads/motorbikes/colors/vero-x/full/vero-x-moss-green.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/vero-x/full/vero-x-pearl-white.webp',
  },
  'vf-drgnfly': {
    black: '/static/uploads/motorbikes/colors/vf-drgnfly/full/vf-drgnfly-glossy-black.png',
    'glossy-black': '/static/uploads/motorbikes/colors/vf-drgnfly/full/vf-drgnfly-glossy-black.png',
    'gray-yellow-decal': '/static/uploads/motorbikes/colors/vf-drgnfly/full/vf-drgnfly-gray-yellow-decal.png',
  },
};

// Official color swatches are separate from full-vehicle renders. Keeping
// them keyed by model and color_code prevents a similarly named color on
// another motorbike model from being reused accidentally.
const MOTORBIKE_SWATCH_IMAGES_BY_VEHICLE: Record<string, Record<string, string>> = {
  kyo: {
    'metallic-brown': '/static/uploads/motorbikes/colors/kyo/metallic-brown.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/kyo/pearl-white.webp',
    red: '/static/uploads/motorbikes/colors/kyo/red.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/kyo/glossy-black.webp',
    'olive-green': '/static/uploads/motorbikes/colors/kyo/olive-green.webp',
  },
  kinet: {
    'cement-gray': '/static/uploads/motorbikes/colors/kinet/cement-gray.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/kinet/pearl-white.webp',
    'red-black': '/static/uploads/motorbikes/colors/kinet/red-black.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/kinet/glossy-black.webp',
    'metallic-brown': '/static/uploads/motorbikes/colors/kinet/metallic-brown.webp',
  },
  amio: {
    black: '/static/uploads/motorbikes/colors/amio/amio-black.png',
    gray: '/static/uploads/motorbikes/colors/amio/amio-gray.png',
    green: '/static/uploads/motorbikes/colors/amio/amio-green.png',
    white: '/static/uploads/motorbikes/colors/amio/amio-white.png',
    red: '/static/uploads/motorbikes/colors/amio/amio-red.png',
  },
  'amio-s': {
    'cement-gray': '/static/uploads/motorbikes/colors/amio-s/amio-s-cement-gray.webp',
    'glossy-black': '/static/uploads/motorbikes/colors/amio-s/amio-s-glossy-black.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/amio-s/amio-s-pearl-white.webp',
    'tropical-jade': '/static/uploads/motorbikes/colors/amio-s/amio-s-tropical-jade.webp',
    'bright-red': '/static/uploads/motorbikes/colors/amio-s/amio-s-bright-red.webp',
  },
  'amio-s2': {
    'glossy-black': '/static/uploads/motorbikes/colors/amio-s2/amio-s2-glossy-black.webp',
    'white-black': '/static/uploads/motorbikes/colors/amio-s2/amio-s2-white-black.webp',
    'bright-red': '/static/uploads/motorbikes/colors/amio-s2/amio-s2-bright-red.webp',
    'tropical-jade': '/static/uploads/motorbikes/colors/amio-s2/amio-s2-tropical-jade.webp',
    'white-purple': '/static/uploads/motorbikes/colors/amio-s2/amio-s2-white-purple.png',
  },
  'evo-lite-neo': {
    'matte-black': '/static/uploads/motorbikes/colors/evo-lite-neo/matte-black.webp',
    'bright-red': '/static/uploads/motorbikes/colors/evo-lite-neo/bright-red.webp',
    'navy-blue': '/static/uploads/motorbikes/colors/evo-lite-neo/navy-blue.webp',
    'moss-green': '/static/uploads/motorbikes/colors/evo-lite-neo/moss-green.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/evo-lite-neo/pearl-white.webp',
  },
  evo: {
    'bright-red': '/static/uploads/motorbikes/colors/evo/bright-red.webp',
    'olive-green': '/static/uploads/motorbikes/colors/evo/olive-green.webp',
    'matte-black': '/static/uploads/motorbikes/colors/evo/matte-black.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/evo/pearl-white.webp',
  },
  'evo-lite': {
    'bright-red': '/static/uploads/motorbikes/colors/evo-lite/bright-red.webp',
    'olive-green': '/static/uploads/motorbikes/colors/evo-lite/olive-green.webp',
    'matte-black': '/static/uploads/motorbikes/colors/evo-lite/matte-black.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/evo-lite/pearl-white.webp',
  },
  flazz: {
    'bright-red': '/static/uploads/motorbikes/colors/flazz/bright-red.webp',
    'matte-black': '/static/uploads/motorbikes/colors/flazz/matte-black.webp',
    'moss-green': '/static/uploads/motorbikes/colors/flazz/moss-green.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/flazz/pearl-white.webp',
  },
  'flazz-max': {
    'red-black': '/static/uploads/motorbikes/colors/flazz-max/red-black.webp',
    black: '/static/uploads/motorbikes/colors/flazz-max/black.webp',
    blue: '/static/uploads/motorbikes/colors/flazz-max/blue.webp',
    'white-orange': '/static/uploads/motorbikes/colors/flazz-max/white-orange.webp',
  },
  zgoo: {
    'bright-red-matte-black': '/static/uploads/motorbikes/colors/zgoo/bright-red-matte-black.png',
    'glossy-black': '/static/uploads/motorbikes/colors/zgoo/glossy-black.webp',
    'moss-green': '/static/uploads/motorbikes/colors/zgoo/moss-green.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/zgoo/pearl-white.webp',
  },
  viper: {
    'red-black': '/static/uploads/motorbikes/colors/viper/red-black.png',
    'sand-yellow': '/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-yellow-swatch.webp',
  },
  'evo-grand-lite': {
    'pearl-white': '/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-pearl-white-swatch.webp',
    'matte-black': '/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-matte-black-swatch.webp',
    'milk-lavender': '/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-milk-lavender-swatch.webp',
    yellow: '/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-yellow-swatch.webp',
  },
  'evo-grand': {
    // Reuse verified small swatches from the matching Evo family colors.
    'pearl-white': '/static/uploads/motorbikes/colors/evo/pearl-white.webp',
    'matte-black': '/static/uploads/motorbikes/colors/evo/matte-black.webp',
    'olive-green': '/static/uploads/motorbikes/colors/evo/olive-green.webp',
    'bright-red': '/static/uploads/motorbikes/colors/evo/bright-red.webp',
    'sand-yellow': '/static/uploads/motorbikes/colors/evo-grand-lite/evo-grand-lite-yellow-swatch.webp',
  },
  'feliz-2025': {
    'moss-green': '/static/uploads/motorbikes/colors/feliz-2025/moss-green.png',
    'glossy-black': '/static/uploads/motorbikes/colors/feliz-2025/glossy-black.png',
    'matte-black': '/static/uploads/motorbikes/colors/feliz-2025/matte-black.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/feliz-2025/pearl-white.png',
    'olive-green': '/static/uploads/motorbikes/colors/feliz-2025/olive-green.png',
  },
  'feliz-ii': {
    'bright-red': '/static/uploads/motorbikes/colors/feliz-ii/bright-red.webp',
    white: '/static/uploads/motorbikes/colors/feliz-ii/white.webp',
    black: '/static/uploads/motorbikes/colors/feliz-ii/black.webp',
    'olive-green': '/static/uploads/motorbikes/colors/feliz-ii/olive-green.webp',
  },
  'vero-x': {
    'olive-green': '/static/uploads/motorbikes/colors/vero-x/olive-green.webp',
    'matte-black': '/static/uploads/motorbikes/colors/vero-x/matte-black.webp',
    'moss-green': '/static/uploads/motorbikes/colors/vero-x/moss-green.webp',
    'pearl-white': '/static/uploads/motorbikes/colors/vero-x/pearl-white.webp',
  },
  'vf-drgnfly': {
    black: '/static/uploads/motorbikes/colors/vf-drgnfly/glossy-black.png',
    'glossy-black': '/static/uploads/motorbikes/colors/vf-drgnfly/glossy-black.png',
    'gray-yellow-decal': '/static/uploads/motorbikes/colors/vf-drgnfly/gray-yellow-decal.png',
  },
};

// When an official page does not expose a separate swatch, reuse a verified
// color chip only for the small circle. Full-vehicle images remain model-owned.
const GENERIC_MOTORBIKE_SWATCH_IMAGES_BY_CODE: Record<string, string> = {
  black: '/static/uploads/motorbikes/colors/amio/amio-black.png',
  white: '/static/uploads/motorbikes/colors/amio/amio-white.png',
  red: '/static/uploads/motorbikes/colors/amio/amio-red.png',
  gray: '/static/uploads/motorbikes/colors/amio/amio-gray.png',
  green: '/static/uploads/motorbikes/colors/amio/amio-green.png',
  'bright-red': '/static/uploads/motorbikes/colors/flazz/bright-red.webp',
  'matte-black': '/static/uploads/motorbikes/colors/flazz/matte-black.webp',
  'glossy-black': '/static/uploads/motorbikes/colors/zgoo/glossy-black.webp',
  'moss-green': '/static/uploads/motorbikes/colors/flazz/moss-green.webp',
  'pearl-white': '/static/uploads/motorbikes/colors/flazz/pearl-white.webp',
  'olive-green': '/static/uploads/motorbikes/colors/evo/olive-green.webp',
  'cement-gray': '/static/uploads/motorbikes/colors/amio-s/amio-s-cement-gray.webp',
  'white-black': '/static/uploads/motorbikes/colors/amio-s2/amio-s2-white-black.webp',
  'white-orange': '/static/uploads/motorbikes/colors/flazz-max/white-orange.webp',
  'white-purple': '/static/uploads/motorbikes/colors/amio-s2/amio-s2-white-purple.png',
  'navy-blue': '/static/uploads/motorbikes/colors/evo-lite-neo/navy-blue.webp',
};

function getMotorbikeSwatchImage(
  vehicle: { name?: unknown; code?: unknown } | undefined,
  colorCode: string,
): string | null {
  const motorbikeSlug = getMotorbikeVehicleSlug(vehicle);
  // These catalog rows previously contained motorcycle renders as swatches.
  // Keep the small circle as CSS and reserve full_image_url for the vehicle
  // render shown after selecting a color.
  if (
    motorbikeSlug === 'vf-drgnfly'
  ) return null;
  return motorbikeSlug
    ? MOTORBIKE_SWATCH_IMAGES_BY_VEHICLE[motorbikeSlug]?.[colorCode]
      || GENERIC_MOTORBIKE_SWATCH_IMAGES_BY_CODE[colorCode]
      || null
    : null;
}

export type VehicleColorSwatch = {
  cssColor: string;
  cssImage?: string;
};

const VF5_COLOR_CODES_BY_LABEL: Record<string, string> = {
  trang: 'infinity-blanc',
  den: 'jet-black',
  xam: 'zenith-grey',
  do: 'solar-ruby',
  vang: 'summer-yellow-jet-black',
  'xanh-duong': 'sky-blue-infinity-blanc',
  'xanh-mint': 'urban-mint',
};

const SWATCH_COLORS_BY_CODE: Record<string, string> = {
  black: '#0F172A',
  'jet-black': '#0F172A',
  'matte-black': '#0F172A',
  'glossy-black': '#000000',
  white: '#FFFFFF',
  'infinity-blanc': '#FFFFFF',
  'pearl-white': '#F8FAFC',
  red: '#DC2626',
  'solar-ruby': '#B91C35',
  'bright-red': '#EF4444',
  blue: '#2563EB',
  green: '#16A34A',
  'olive-green': '#2E8B57',
  'urban-mint': '#A9B9A4',
  'moss-green': '#3F6212',
  'tropical-jade': '#0EA5A6',
  'navy-blue': '#1E3A5F',
  gray: '#64748B',
  'zenith-grey': '#64748B',
  'cement-gray': '#94A3B8',
  'metallic-brown': '#8B5E3C',
  yellow: '#EAB308',
  'sand-yellow': '#D4A72C',
  'milk-lavender': '#C4B5FD',
  orange: '#F97316',
};

/**
 * One swatch renderer for both the vehicle card and detail modal.
 * The normalized color_code is authoritative, so labels and encoding issues
 * cannot produce different circles in the two views.
 */
export function resolveVehicleColorSwatch(
  color: Pick<VehicleColor, 'color_code' | 'name' | 'official_name'>,
  vehicle?: { name?: unknown; code?: unknown },
): VehicleColorSwatch {
  const code = slugify(String(color.color_code || color.name || ''));
  if (code === 'red-black') {
    const useLegacyRedBlackDirection = /viper|zgoo|flazz\s*max/i.test(`${vehicle?.code || ''} ${vehicle?.name || ''}`);
    return {
      cssColor: '#DC2626',
      cssImage: useLegacyRedBlackDirection
        ? 'linear-gradient(135deg, #0F172A 0 50%, #DC2626 50% 100%)'
        : 'linear-gradient(135deg, #DC2626 0 50%, #0F172A 50% 100%)',
    };
  }
  if (code === 'bright-red-matte-black') {
    const useLegacyRedBlackDirection = /viper|zgoo|flazz\s*max/i.test(`${vehicle?.code || ''} ${vehicle?.name || ''}`);
    return {
      cssColor: '#EF4444',
      cssImage: useLegacyRedBlackDirection
        ? 'linear-gradient(135deg, #334155 0 50%, #EF4444 50% 100%)'
        : 'linear-gradient(135deg, #EF4444 0 50%, #334155 50% 100%)',
    };
  }
  if (code === 'summer-yellow-jet-black') {
    return {
      cssColor: '#EAB308',
      cssImage: 'linear-gradient(135deg, #EAB308 0 50%, #0F172A 50% 100%)',
    };
  }
  if (code === 'sky-blue-infinity-blanc') {
    return {
      cssColor: '#22B8D6',
      cssImage: 'linear-gradient(135deg, #22B8D6 0 50%, #FFFFFF 50% 100%)',
    };
  }
  if (code === 'gray-yellow-decal') {
    return {
      cssColor: '#94A3B8',
      cssImage: 'linear-gradient(135deg, #94A3B8 0 50%, #EAB308 50% 100%)',
    };
  }
  if (code === 'white-black') {
    return {
      cssColor: '#FFFFFF',
      cssImage: 'linear-gradient(135deg, #FFFFFF 0 50%, #0F172A 50% 100%)',
    };
  }
  if (code === 'white-orange') {
    return {
      cssColor: '#FFFFFF',
      cssImage: 'linear-gradient(135deg, #FFFFFF 0 50%, #F97316 50% 100%)',
    };
  }
  if (code === 'white-purple') {
    return {
      cssColor: '#FFFFFF',
      cssImage: 'linear-gradient(135deg, #FFFFFF 0 50%, #9333EA 50% 100%)',
    };
  }
  return { cssColor: SWATCH_COLORS_BY_CODE[code] || '#64748B' };
}

function isNerioVehicle(vehicle?: { name?: unknown; code?: unknown }): boolean {
  return /nerio\s*green/i.test(`${vehicle?.code || ''} ${vehicle?.name || ''}`);
}

function isVF5Vehicle(vehicle?: { name?: unknown; code?: unknown }): boolean {
  return /vf\s*5/i.test(`${vehicle?.code || ''} ${vehicle?.name || ''}`);
}

function isDatabaseBackedCarVehicle(vehicle?: { name?: unknown; code?: unknown }): boolean {
  return /vf\s*[2-9]|vf\s*mpv\s*7|minio\s*green|herio\s*green|limo\s*green|ec\s*van/i.test(
    `${vehicle?.code || ''} ${vehicle?.name || ''}`,
  );
}

function normalizeColorCodeForVehicle(
  rawCode: string,
  rawName: string,
  vehicle?: { name?: unknown; code?: unknown },
): string {
  if (isMotorbikeVehicle(vehicle)) {
    return MOTORBIKE_COLOR_CODES_BY_LABEL[slugify(rawCode)]
      || MOTORBIKE_COLOR_CODES_BY_LABEL[slugify(rawName)]
      || slugify(rawCode);
  }
  if (isVF5Vehicle(vehicle)) {
    return VF5_COLOR_CODES_BY_LABEL[slugify(rawCode)]
      || VF5_COLOR_CODES_BY_LABEL[slugify(rawName)]
      || rawCode;
  }
  if (!isNerioVehicle(vehicle)) return rawCode;
  return NERIO_COLOR_CODES_BY_LABEL[slugify(rawCode)]
    || NERIO_COLOR_CODES_BY_LABEL[slugify(rawName)]
    || rawCode;
}

function inferColorType(
  rawName: string,
  colorCode: string,
  vehicle?: { name?: unknown; code?: unknown },
): VehicleColor['type'] {
  if (isMotorbikeVehicle(vehicle)) {
    return MOTORBIKE_TWO_TONE_CODES.has(colorCode) ? 'two_tone' : 'solid';
  }
  return rawName.split(/\s+/).length > 1 ? 'two_tone' : 'solid';
}

// Official full-vehicle renders downloaded from VinFast and stored locally so
// production does not depend on a third-party hotlink.
const VF2_FULL_IMAGES_BY_CODE: Record<string, string> = {
  'infinity-blanc': '/static/uploads/cars/colors/vf2/full/vf2-infinity-blanc.webp',
  'solar-ruby': '/static/uploads/cars/colors/vf2/full/vf2-solar-ruby.webp',
  'desat-silver': '/static/uploads/cars/colors/vf2/full/vf2-desat-silver.webp',
  'urban-mint': '/static/uploads/cars/colors/vf2/full/vf2-urban-mint.webp',
  yellow: '/static/uploads/cars/colors/vf2/full/vf2-yellow.webp',
  'sky-blue': '/static/uploads/cars/colors/vf2/full/vf2-sky-blue.webp',
  'rose-pink': '/static/uploads/cars/colors/vf2/full/vf2-rose-pink.webp',
  'be-pebble': '/static/uploads/cars/colors/vf2/full/vf2-pebble-beige.webp',
};

const VF3_FULL_IMAGES_BY_CODE: Record<string, string> = {
  'infinity-blanc': '/static/uploads/cars/colors/vf3/full/vf3-infinity-blanc.webp',
  'zenith-grey': '/static/uploads/cars/colors/vf3/full/vf3-zenith-grey.webp',
  'solar-ruby': '/static/uploads/cars/colors/vf3/full/vf3-solar-ruby.webp',
  'summer-yellow-infinity-blanc': '/static/uploads/cars/colors/vf3/full/vf3-summer-yellow-infinity-blanc.webp',
  'sky-blue-infinity-blanc': '/static/uploads/cars/colors/vf3/full/vf3-sky-blue-infinity-blanc.webp',
  'rose-pink-infinity-blanc': '/static/uploads/cars/colors/vf3/full/vf3-rose-pink-infinity-blanc.webp',
  'urban-mint': '/static/uploads/cars/colors/vf3/full/vf3-urban-mint.webp',
};

const VF5_FULL_IMAGES_BY_CODE: Record<string, string> = {
  'infinity-blanc': '/static/uploads/cars/colors/vf5/full/vf5-infinity-blanc.webp',
  // Verified legacy catalog render for the black VF5.
  'jet-black': '/static/uploads/cars/VF5.jpg',
  'zenith-grey': '/static/uploads/cars/colors/vf5/full/vf5-zenith-grey.webp',
  'solar-ruby': '/static/uploads/cars/colors/vf5/full/vf5-solar-ruby.webp',
  'summer-yellow-jet-black': '/static/uploads/cars/colors/vf5/full/vf5-summer-yellow-jet-black.webp',
  'sky-blue-infinity-blanc': '/static/uploads/cars/colors/vf5/full/vf5-sky-blue-infinity-blanc.webp',
  'urban-mint': '/static/uploads/cars/colors/vf5/full/vf5-urban-mint.webp',
};

// Each model has its own full-vehicle image set. The color code list is kept
// separate from the path resolver so a model never falls through to another
// model's render when an official image is unavailable.
const FULL_IMAGE_CODES_BY_VEHICLE: Record<string, readonly string[]> = {
  vf5: ['infinity-blanc', 'jet-black', 'zenith-grey', 'solar-ruby', 'summer-yellow-jet-black', 'sky-blue-infinity-blanc', 'urban-mint'],
  vf6: ['infinity-blanc', 'jet-black', 'zenith-grey', 'urban-mint', 'solar-ruby'],
  vf7: ['infinity-blanc', 'jet-black', 'zenith-grey', 'solar-ruby', 'urban-mint'],
  vf8: ['infinity-blanc', 'jet-black', 'crimson-red', 'ivy-green', 'crimson-velvet-mystery-bronze', 'zenith-grey-desat-silver', 'infinity-blanc-zenith-grey', 'jet-black-mystery-bronze'],
  vf9: ['infinity-blanc', 'jet-black', 'urban-mint', 'crimson-red', 'ivy-green', 'zenith-grey', 'desat-silver'],
  'vf8-the-all-new': ['infinity-blanc', 'starburst-blue', 'solar-ruby', 'jet-black', 'solar-ruby-jet-black', 'vitality-orange-jet-black', 'starburst-blue-infinity-blanc', 'mysterioso-purple-stealth-gray', 'jet-black-stealth-gray', 'vitality-orange-infinity-blanc', 'vitality-orange', 'mysterioso-purple'],
  'vf-mpv-7': ['infinity-blanc', 'jet-black', 'zenith-grey', 'solar-ruby', 'moonlit-ocean', 'introspective-brown'],
  'limo-green': ['desat-silver', 'jet-black', 'infinity-blanc', 'solar-ruby'],
  'herio-green': ['jet-black', 'desat-silver', 'solar-ruby', 'infinity-blanc'],
  'nerio-green': ['crimson-red', 'desat-silver', 'jet-black', 'summer-yellow'],
  'minio-green': ['jet-black', 'desat-silver', 'infinity-blanc', 'solar-ruby', 'jet-black-summer-yellow', 'desat-silver-jet-black', 'summer-yellow-infinity-blanc', 'tropical-jade', 'rose-metallic', 'rose-metallic-infinity-blanc', 'rose-metallic-aqua-blue', 'tropical-jade-infinity-blanc', 'tropical-jade-summer-yellow', 'solar-ruby-infinity-blanc'],
  'ec-van': ['urban-mint', 'solar-ruby', 'yellow', 'infinity-blanc'],
};

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Vietnamese D-with-stroke does not decompose under NFD. Without this
    // explicit mapping, labels such as "Đỏ - Đen" never become stable keys.
    .replace(/[\u0110\u00d0]/g, 'D')
    .replace(/[\u0111\u00f0]/g, 'd')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeDisplayName(name: string, colorCode: string, officialName: string | null): string {
  const canonical = CANONICAL_NAMES_BY_CODE[slugify(colorCode)]
    || (officialName ? CANONICAL_NAMES_BY_CODE[slugify(officialName)] : undefined);

  // Do not replace valid labels. Only repair labels that visibly lost Unicode
  // characters, while using the stable code/official name as the source of truth.
  if (canonical && /[?�]/.test(name)) return canonical;
  if (/[?�]/.test(name)) return COMMON_BROKEN_LABELS[name.toLowerCase()] || name;
  return name;
}

// Keep the internal `yellow` code and its image mapping stable, but use a
// more visually accurate label for the cream/beige Evo Grand Lite swatch.
const VEHICLE_COLOR_DISPLAY_OVERRIDES: Record<string, Record<string, string>> = {
  'evo-grand-lite': { yellow: 'Be Kem' },
  'evo-grand': { 'sand-yellow': 'Be Kem' },
  viper: { 'sand-yellow': 'Be Kem' },
};

function getVehicleColorDisplayName(
  name: string,
  colorCode: string,
  officialName: string | null,
  vehicle?: { name?: unknown; code?: unknown },
): string {
  const motorbikeSlug = isMotorbikeVehicle(vehicle) ? getMotorbikeVehicleSlug(vehicle) : null;
  return (motorbikeSlug && VEHICLE_COLOR_DISPLAY_OVERRIDES[motorbikeSlug]?.[colorCode])
    || normalizeDisplayName(name, colorCode, officialName);
}

export function parseVehicleColors(
  value: unknown,
  vehicle?: { name?: unknown; code?: unknown },
): VehicleColor[] {
  const motorbikeSlug = isMotorbikeVehicle(vehicle) ? getMotorbikeVehicleSlug(vehicle) : null;
  const officialPalette = motorbikeSlug ? MOTORBIKE_OFFICIAL_COLORS_BY_VEHICLE[motorbikeSlug] : undefined;
  // Catalog rows that already contain color objects are the source of truth,
  // just like the VF5 row. Legacy motorbike rows contain only strings and may
  // still use the temporary official palette until the DB migration runs.
  const hasDatabaseColorObjects = Array.isArray(value)
    && value.some((item) => item && typeof item === 'object');
  const colorsValue = hasDatabaseColorObjects
    ? value
    : (officialPalette
      || (Array.isArray(value) && value.length > 0
        ? value
        : (motorbikeSlug ? MOTORBIKE_FALLBACK_COLORS_BY_VEHICLE[motorbikeSlug] : value)));
  if (!Array.isArray(colorsValue)) return [];

  const colors: VehicleColor[] = [];
  colorsValue.forEach((item, index) => {
    if (typeof item === 'string' && item.trim()) {
      const rawName = item.trim();
      const colorCode = normalizeColorCodeForVehicle(slugify(rawName), rawName, vehicle);
      colors.push({
        name: isNerioVehicle(vehicle)
          ? (CANONICAL_NAMES_BY_CODE[colorCode] || rawName)
          : getVehicleColorDisplayName(rawName, colorCode, null, vehicle),
        official_name: null,
        color_code: colorCode || `color-${index + 1}`,
        type: inferColorType(rawName, colorCode, vehicle),
        image_url: isNerioVehicle(vehicle)
          ? (NERIO_SWATCH_IMAGES_BY_CODE[colorCode] || null)
          : getMotorbikeSwatchImage(vehicle, colorCode),
        full_image_url: null,
      });
      return;
    }

    if (!item || typeof item !== 'object') return;
    const record = item as Record<string, unknown>;
    const rawName = typeof record.name === 'string' ? record.name.trim() : '';
    const storedOfficialName = typeof record.official_name === 'string' ? record.official_name : null;
    const rawCode = typeof record.color_code === 'string'
      ? record.color_code
      : typeof record.code === 'string' ? record.code : slugify(rawName);
    const code = normalizeColorCodeForVehicle(rawCode, rawName, vehicle);
    const officialName = CANONICAL_OFFICIAL_NAMES_BY_CODE[code] || storedOfficialName;
    const name = getVehicleColorDisplayName(rawName, code, officialName, vehicle);
    if (!name) return;
    const type: VehicleColor['type'] = record.type === 'two_tone' ? 'two_tone' : 'solid';
    const priceTier: VehicleColor['price_tier'] = record.price_tier === 'advanced' ? 'advanced' : record.price_tier === 'basic' ? 'basic' : undefined;
    const priceDelta = typeof record.price_delta === 'number' ? record.price_delta : undefined;
    // Prefer the URL persisted in the catalog. The hard-coded mappings remain
    // only as a compatibility fallback for old/offline records.
    const databaseImageUrl = typeof record.image_url === 'string' ? record.image_url : null;
    const imageUrl = databaseImageUrl
      || (isNerioVehicle(vehicle)
        ? NERIO_SWATCH_IMAGES_BY_CODE[code]
        : getMotorbikeSwatchImage(vehicle, code));
    const fullImageUrl = typeof record.full_image_url === 'string' ? record.full_image_url : null;
    colors.push({
      name: isNerioVehicle(vehicle) ? (CANONICAL_NAMES_BY_CODE[code] || name) : name,
      official_name: officialName,
      color_code: code || `color-${index + 1}`,
      type,
      ...(priceTier ? { price_tier: priceTier } : {}),
      ...(priceDelta !== undefined ? { price_delta: priceDelta } : {}),
      image_url: imageUrl,
      full_image_url: fullImageUrl,
    });
  });
  return colors;
}

export function getVehicleColorImage(
  vehicle: { name?: string; code?: string },
  color: Pick<VehicleColor, 'color_code' | 'image_url' | 'full_image_url'>,
): string | null {
  const vehicleLabel = `${vehicle.code || ''} ${vehicle.name || ''}`;
  const colorCode = slugify(color.color_code);
  // The catalog owns the selected full-color image. This is the same
  // database-first contract used for VF5 and all migrated car rows.
  if (color.full_image_url) return color.full_image_url;
  // Motorbike images are owned by the model/color registry. Legacy
  // records without full_image_url still use the model-specific compatibility
  // mapping until their catalog row is migrated.
  if (isMotorbikeVehicle(vehicle)) {
    const motorbikeSlug = getMotorbikeVehicleSlug(vehicle);
    return motorbikeSlug ? MOTORBIKE_FULL_IMAGES_BY_VEHICLE[motorbikeSlug]?.[colorCode] || null : null;
  }
  // These catalog rows now carry the complete per-color image URL in the
  // database. Do not silently substitute a frontend folder mapping when a
  // database value is missing; the missing catalog asset must stay visible as
  // a data problem instead of showing the wrong color/model.
  if (isDatabaseBackedCarVehicle(vehicle)) return null;
  if (/vf\s*2/i.test(vehicleLabel)) return VF2_FULL_IMAGES_BY_CODE[colorCode] || null;
  if (/vf\s*3/i.test(vehicleLabel)) return VF3_FULL_IMAGES_BY_CODE[colorCode] || null;
  if (/vf\s*5/i.test(vehicleLabel)) return VF5_FULL_IMAGES_BY_CODE[colorCode] || null;
  let vehicleSlug: string | null = null;
  if (/vf\s*6/i.test(vehicleLabel)) vehicleSlug = 'vf6';
  else if (/vf\s*7/i.test(vehicleLabel)) vehicleSlug = 'vf7';
  else if (/vf\s*8/i.test(vehicleLabel) && /the\s+all\s+new/i.test(vehicleLabel)) vehicleSlug = 'vf8-the-all-new';
  else if (/vf\s*8/i.test(vehicleLabel)) vehicleSlug = 'vf8';
  else if (/vf\s*9/i.test(vehicleLabel)) vehicleSlug = 'vf9';
  else if (/vf\s*mpv\s*7/i.test(vehicleLabel)) vehicleSlug = 'vf-mpv-7';
  else if (/limo\s*green/i.test(vehicleLabel)) vehicleSlug = 'limo-green';
  else if (/herio\s*green/i.test(vehicleLabel)) vehicleSlug = 'herio-green';
  else if (/nerio\s*green/i.test(vehicleLabel)) vehicleSlug = 'nerio-green';
  else if (/minio\s*green/i.test(vehicleLabel)) vehicleSlug = 'minio-green';
  else if (/ec\s*van/i.test(vehicleLabel)) vehicleSlug = 'ec-van';

  if (vehicleSlug && FULL_IMAGE_CODES_BY_VEHICLE[vehicleSlug]?.includes(colorCode)) {
    return `/static/uploads/cars/colors/${vehicleSlug}/full/${vehicleSlug}-${colorCode}.webp`;
  }
  return null;
}

export function isEBus(vehicle: { name?: string; code?: string; rawSpecs?: unknown }): boolean {
  const raw = vehicle.rawSpecs || {};
  const rawRecord = typeof raw === 'object' && raw !== null ? raw as Record<string, unknown> : {};
  return /ebus/i.test(`${vehicle.name || ''} ${vehicle.code || ''} ${rawRecord.model_name || ''} ${rawRecord.vehicle_line || ''}`);
}
