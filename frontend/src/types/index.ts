export type Role = 'customer' | 'staff' | 'admin';


export type VehicleCategory = 'suv' | 'scooter' | 'motorbike' | 'commercial';
export type FilterCategory = 'all' | 'suv' | 'scooter' | 'commercial';

export type VehicleColor = {
  name: string;
  official_name: string | null;
  color_code: string;
  type: 'solid' | 'two_tone';
  price_tier?: 'basic' | 'advanced';
  price_delta?: number;
  image_url?: string | null;
};

export interface Vehicle {
  id: string;
  code?: string;
  name: string;
  tagline: string;
  category: VehicleCategory;
  image: string;
  heroImage?: string;
  basePrice: number;
  batteryBuyPrice?: number | null;
  batteryRentMonthly?: number | null;
  range: number | string;
  battery: string;
  acceleration: string;
  topSpeed: number | string;
  seats: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors: Array<VehicleColor | string> | null;
  description: string;
  highlights: string[];
  rawSpecs?: any;
}

export interface Quote {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  vehicle_id: string;
  vehicle_name: string;
  base_price: number;
  discount: number;
  final_price: number;
  ai_summary?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TestDriveBooking {
  id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_id: string;
  vehicle_name: string;
  preferred_date: string;
  preferred_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface ChatMessageAction {
  type: string;
  vehicle_id?: string;
  vehicle_name?: string;
  base_price?: number;
  status?: 'idle' | 'loading' | 'success' | 'error';
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  statusText?: string;
  action?: ChatMessageAction;
}

export type ChatStage =
  | 'greeting'
  | 'asking_budget'
  | 'asking_usage'
  | 'recommendation'
  | 'asking_quote'
  | 'collecting_name'
  | 'collecting_phone'
  | 'quote_saved'
  | 'free';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  employeeId?: string;
  showroom?: string;
  position?: string;
  staffRole?: string;
  memberLevel?: 'Standard' | 'Gold' | 'Platinum' | 'VIP';
}

