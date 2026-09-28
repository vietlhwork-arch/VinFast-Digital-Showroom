import blobMapping from './blob_mapping.json';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.PROD) return '';
  return 'http://127.0.0.1:8000';
};

const mapping = (blobMapping || {}) as Record<string, string>;

const getCache = new Map<string, { data: any; expiresAt: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    getCache.clear();
    return;
  }
  for (const key of getCache.keys()) {
    if (key.includes(prefix)) {
      getCache.delete(key);
    }
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  // Invalidate cache on mutations
  if (!isGet) {
    if (path.includes('/api/cars')) clearApiCache('/api/cars');
    if (path.includes('/api/motorbikes')) clearApiCache('/api/motorbikes');
    if (path.includes('/api/auth')) clearApiCache('/api/auth');
    if (path.includes('/api/quotes')) clearApiCache('/api/quotes');
    if (path.includes('/api/bookings')) clearApiCache('/api/bookings');
  }

  const cacheKey = `${path}_${localStorage.getItem('vinfast_token') || ''}`;

  // Do not cache real-time quotes, bookings, and location APIs
  const isRealtimePath = path.includes('/api/quotes') || path.includes('/api/bookings') || path.includes('/api/locations');

  if (isGet && !isRealtimePath) {
    const cached = getCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey) as Promise<T>;
    }
  }

  const performFetch = async (): Promise<T> => {
    const token = localStorage.getItem('vinfast_token');
    const headers: Record<string, string> = {
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (!(options?.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const baseUrl = getApiUrl();
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      });
    } catch (err: any) {
      // Retry once after 500ms in case uvicorn server was reloading
      try {
        await new Promise((r) => setTimeout(r, 500));
        response = await fetch(`${baseUrl}${path}`, {
          ...options,
          headers,
        });
      } catch (retryErr: any) {
        console.error(`Network fetch error calling ${baseUrl}${path}:`, retryErr);
        throw new Error(`Lỗi kết nối máy chủ (${baseUrl}). Vui lòng kiểm tra lại dịch vụ Backend đang chạy ở cổng 8000.`);
      }
    }

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!response.ok) {
      let errorMsg = data.detail || data.message || `Lỗi máy chủ (${response.status})`;
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.map((e: any) => (typeof e === 'object' ? (e.msg || JSON.stringify(e)) : String(e))).join(', ');
      } else if (typeof errorMsg === 'object') {
        errorMsg = JSON.stringify(errorMsg);
      }
      throw new Error(String(errorMsg));
    }

    return data as T;
  };

  if (isGet) {
    const p = performFetch();
    inFlightRequests.set(cacheKey, p);
    try {
      const result = await p;
      getCache.set(cacheKey, { data: result, expiresAt: Date.now() + 5 * 60 * 1000 });
      return result;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  }

  return performFetch();
}


export function getImageUrl(url?: string): string {
  if (!url) return '/VINpng/AdsCars/vf8-4k.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const isDev = import.meta.env.DEV || !import.meta.env.PROD;
  const baseUrl = import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:8000');

  // Serve static uploads (cars, escooters catalog images) from local files/backend in DEV
  if (url.includes('/static/uploads/') || url.includes('static/uploads/')) {
    const pathIndex = url.indexOf('/static/uploads/');
    const relative = pathIndex !== -1 ? url.substring(pathIndex) : (url.startsWith('/') ? url : `/${url}`);
    const cleanRel = relative.startsWith('/') ? relative.substring(1) : relative;

    if (isDev) {
      return `${baseUrl}${relative}`;
    }

    if (mapping[cleanRel]) return mapping[cleanRel];
    if (mapping[`frontend/public/${cleanRel}`]) return mapping[`frontend/public/${cleanRel}`];
    return `${baseUrl}${relative}`;
  }

  const clean = url.startsWith('/') ? url.substring(1) : url;
  if (!isDev && mapping[clean]) return mapping[clean];
  if (!isDev && mapping[`frontend/public/${clean}`]) return mapping[`frontend/public/${clean}`];

  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}


export function formatVNDPrice(price: number): string {
  if (!price || price <= 0) return 'Liên hệ báo giá';
  let vnd = price;
  if (vnd < 10000) {
    vnd = vnd * 1000000;
  }
  return `${Math.round(vnd).toLocaleString('vi-VN')} VNĐ`;
}

export function parseVehicleCategory(item: {
  category?: string;
  name?: string;
  model_name?: string;
  code?: string;
  vehicle_line?: string;
}): 'suv' | 'scooter' | 'commercial' {
  if (!item) return 'suv';
  const catLower = (item.category || '').toLowerCase();
  const nameLower = (item.name || item.model_name || '').toLowerCase();
  const codeLower = (item.code || item.vehicle_line || '').toLowerCase();

  if (
    catLower.includes('scooter') ||
    catLower.includes('motorbike') ||
    catLower.includes('xe_may') ||
    catLower.includes('máy điện')
  ) {
    return 'scooter';
  }

  const isCommercial =
    catLower.includes('commercial') ||
    catLower.includes('dịch vụ') ||
    catLower.includes('thương mại') ||
    catLower.includes('service') ||
    catLower.includes('bus') ||
    catLower.includes('van') ||
    nameLower.includes('van') ||
    nameLower.includes('bus') ||
    nameLower.includes('ebus') ||
    nameLower.includes('green') ||
    codeLower.includes('van') ||
    codeLower.includes('bus') ||
    codeLower.includes('ebus') ||
    codeLower.includes('green');

  if (isCommercial) {
    return 'commercial';
  }

  return 'suv';
}

export function broadcastQuoteChange(id: string, status: string) {
  try {
    const bc = new BroadcastChannel('vinfast_realtime_sync');
    bc.postMessage({ type: 'QUOTE_STATUS_CHANGED', id, status, time: Date.now() });
    bc.close();
  } catch { }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vinfast_quote_updated', { detail: { id, status } }));
    try {
      localStorage.setItem('vinfast_realtime_ping', `${id}:${status}:${Date.now()}`);
    } catch { }
  }
}

export const api = {
  health: () => apiFetch<{ status: string; database: string }>('/health'),

  // Auth & Admin User Management APIs
  register: <T>(payload: any) => apiFetch<T>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: <T>(payload: any) => apiFetch<T>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  loginWithGoogle: <T>(idToken: string) => apiFetch<T>('/api/auth/google', { method: 'POST', body: JSON.stringify({ id_token: idToken }) }),
  getMe: <T>() => apiFetch<T>('/api/auth/me'),
  updateMe: <T>(payload: any) => apiFetch<T>('/api/auth/me', { method: 'PUT', body: JSON.stringify(payload) }),
  getUsers: <T>() => apiFetch<T>('/api/auth/users'),
  createStaff: <T>(payload: any) => apiFetch<T>('/api/auth/create-staff', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: <T>(id: string, payload: any) => apiFetch<T>(`/api/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteUser: <T>(id: string) => apiFetch<T>(`/api/auth/users/${id}`, { method: 'DELETE' }),


  // Cars Catalog & Specs APIs
  getCars: <T>(category?: string) => apiFetch<T>(`/api/cars${category ? `?category=${category}` : ''}`),
  getCarDetail: <T>(idOrCode: string) => apiFetch<T>(`/api/cars/${idOrCode}`),
  createCar: <T>(formData: FormData) => apiFetch<T>('/api/cars', { method: 'POST', body: formData }),
  updateCar: <T>(id: string, body: any) => apiFetch<T>(`/api/cars/${id}`, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  deleteCar: <T>(id: string) => apiFetch<T>(`/api/cars/${id}`, { method: 'DELETE' }),

  // Motorbikes / E-Scooters Catalog APIs
  getMotorbikes: <T>(category?: string) => apiFetch<T>(`/api/motorbikes${category ? `?category=${category}` : ''}`),
  createMotorbike: <T>(formData: FormData) => apiFetch<T>('/api/motorbikes', { method: 'POST', body: formData }),
  updateMotorbike: <T>(id: string, body: any) => apiFetch<T>(`/api/motorbikes/${id}`, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  deleteMotorbike: <T>(id: string) => apiFetch<T>(`/api/motorbikes/${id}`, { method: 'DELETE' }),

  getEScooters: <T>(category?: string) => apiFetch<T>(`/api/motorbikes${category ? `?category=${category}` : ''}`),
  createEScooter: <T>(formData: FormData) => apiFetch<T>('/api/motorbikes', { method: 'POST', body: formData }),
  updateEScooter: <T>(id: string, body: any) => apiFetch<T>(`/api/motorbikes/${id}`, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  deleteEScooter: <T>(id: string) => apiFetch<T>(`/api/motorbikes/${id}`, { method: 'DELETE' }),

  // Quotes & Bookings
  createQuote: <T>(payload: T) => apiFetch<T>('/api/quotes', { method: 'POST', body: JSON.stringify(payload) }),
  getQuotes: <T>(userId?: string, email?: string, phone?: string) => {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (email) params.set('email', email);
    if (phone) params.set('phone', phone);
    const q = params.toString();
    return apiFetch<T>(`/api/quotes${q ? `?${q}` : ''}`);
  },
  updateQuoteStatus: async <T>(id: string, payload: any) => {
    const res = await apiFetch<T>(`/api/quotes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    broadcastQuoteChange(id, payload?.status || 'updated');
    return res;
  },
  createBooking: <T>(payload: T) => apiFetch<T>('/api/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getBookings: <T>(phone?: string, email?: string, status?: string) => {
    const params = new URLSearchParams();
    if (phone) params.set('phone', phone);
    if (email) params.set('email', email);
    if (status) params.set('status', status);
    const q = params.toString();
    return apiFetch<T>(`/api/bookings${q ? `?${q}` : ''}`);
  },
  updateBookingStatus: async <T>(id: string, payload: any) => {
    const res = await apiFetch<T>(`/api/bookings/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    broadcastQuoteChange(id, payload?.status || 'updated');
    return res;
  },

  // AI Agent Chat API
  chat: <T>(payload: { message: string; session_id?: string; user_id?: string; user_email?: string }) =>
    apiFetch<T>('/api/chat', { method: 'POST', body: JSON.stringify(payload) }),
  chatStream: async (
    payload: { message: string; session_id?: string; user_id?: string; user_email?: string },
    onToken: (token: string) => void,
    onDone?: (data: { stage?: string; session_id?: string; action?: any; updated_user?: { phone?: string } }) => void,
    onStatus?: (status: string) => void
  ) => {
    const baseUrl = getApiUrl();
    const token = localStorage.getItem('vinfast_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...payload, stream: true }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let buffer = '';

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data:')) {
            const jsonStr = trimmed.replace(/^data:\s*/, '');
            if (!jsonStr) continue;
            let data: any;
            try {
              data = JSON.parse(jsonStr);
            } catch {
              continue;
            }

            if (data.status && onStatus) {
              onStatus(data.status);
            }
            if (data.token !== undefined) {
              onToken(data.token);
            }
            if (data.done && onDone) {
              onDone(data);
            }
            if (data.error) {
              throw new Error(data.error);
            }
          }
        }
      }
    }
  },
  bindUserSession: <T>(payload: { session_id: string; user_id: string }) =>
    apiFetch<T>('/api/chat/session/bind-user', { method: 'POST', body: JSON.stringify(payload) }),
  endChatSession: <T>(payload: { session_id: string; user_id?: string }) =>
    apiFetch<T>('/api/chat/session/end', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    }),
};

export function endChatSessionOnPageHide(payload: {
  session_id: string;
  user_id?: string;
}): boolean {
  const url = `${getApiUrl()}/api/chat/session/page-close`;
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator.sendBeacon === 'function') {
      const queued = navigator.sendBeacon(
        url,
        new Blob([body], { type: 'text/plain;charset=UTF-8' }),
      );
      if (queued) return true;
    }

    void fetch(url, {
      method: 'POST',
      body,
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    }).catch(() => undefined);
    return true;
  } catch {
    return false;
  }
}




