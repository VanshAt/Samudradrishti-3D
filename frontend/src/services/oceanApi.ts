import type { DataSourceId, SourceStatus, SourceMetadata, ApiLayerResponse, ApiObservationStation } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_OCEAN_API_BASE_URL ?? "http://localhost:8000";

export class OceanApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'OceanApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      let detail = "Unknown API error";
      try {
        const errorData = await response.json();
        detail = errorData.detail || detail;
      } catch (e) {
        // Not JSON
      }
      throw new OceanApiError(response.status, detail);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof OceanApiError) throw error;
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
       throw new Error("Backend API is unreachable. Is the server running?");
    }
    throw error;
  }
}

export const oceanApi = {
  getSources: (signal?: AbortSignal) =>
    fetchApi<SourceStatus[]>('/api/sources', { signal }),

  getMetadata: (source: DataSourceId, signal?: AbortSignal) =>
    fetchApi<SourceMetadata>(`/api/metadata?source=${source}`, { signal }),

  getLayer: (params: { source: DataSourceId, variable: string, depthM: number, timeIndex: number }, signal?: AbortSignal) => {
    const query = new URLSearchParams({
      source: params.source,
      variable: params.variable,
      depth_m: params.depthM.toString(),
      time_index: params.timeIndex.toString()
    });
    if (params.source === "archived_dataset") {
      query.set("stride", "3");
    }
    return fetchApi<ApiLayerResponse>(`/api/layers?${query.toString()}`, { signal });
  },

  getStations: (params: { source: DataSourceId, timeIndex: number, type?: string }, signal?: AbortSignal) => {
    const query = new URLSearchParams({
      source: params.source,
      time_index: params.timeIndex.toString()
    });
    if (params.type) query.append("type", params.type);
    return fetchApi<ApiObservationStation[]>(`/api/stations?${query.toString()}`, { signal });
  },

  getStation: (params: { source: DataSourceId, stationId: string, timeIndex: number }, signal?: AbortSignal) => {
    const query = new URLSearchParams({
      source: params.source,
      time_index: params.timeIndex.toString()
    });
    return fetchApi<ApiObservationStation>(`/api/stations/${params.stationId}?${query.toString()}`, { signal });
  }
};
