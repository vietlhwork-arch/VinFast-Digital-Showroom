import { apiFetch } from '@/lib/api';
import type { MapPoint } from '@/data/vinfastLocations';

export interface LocationsResponse {
  status: string;
  total: number;
  data: MapPoint[];
}

export async function fetchLocationsApi(params?: {
  demandType?: string;
  province?: string;
  search?: string;
}): Promise<MapPoint[]> {
  const query = new URLSearchParams();
  if (params?.demandType) query.set('demand_type', params.demandType);
  if (params?.province && params.province !== 'Tất cả Tỉnh thành') {
    query.set('province', params.province);
  }
  if (params?.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const response = await apiFetch<LocationsResponse>(`/api/locations${queryString}`);
  return response.data || [];
}

export async function syncLocationsApi(): Promise<{ status: string; message: string; total_synced?: number }> {
  return await apiFetch('/api/locations/sync', { method: 'POST' });
}
