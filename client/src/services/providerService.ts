import api from "../lib/api";
import type { Provider } from "../lib/types";
import { isMockDataEnabled, mockCurrentUser, mockProviders } from "../lib/mockData";

export interface ProviderFilters {
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  verified?: string;
  page?: number;
  limit?: number;
  near?: string;
}

let mockOwnProvider: Provider | null = null;

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 250));

export const getProviders = (params?: ProviderFilters) => {
  if (isMockDataEnabled()) {
    const pool = mockOwnProvider
      ? [mockOwnProvider, ...mockProviders.filter((p) => p._id !== mockOwnProvider!._id)]
      : mockProviders;

    const filtered = pool.filter((p) => {
      if (params?.category && !p.category.toLowerCase().includes(String(params.category).toLowerCase())) {
        return false;
      }
      if (params?.city && !p.location.city.toLowerCase().includes(String(params.city).toLowerCase())) {
        return false;
      }
      if (
        params?.state &&
        !p.location.state.toLowerCase().includes(String(params.state).toLowerCase())
      ) {
        return false;
      }
      if (
        params?.country &&
        !p.location.country.toLowerCase().includes(String(params.country).toLowerCase())
      ) {
        return false;
      }
      if (params?.minPrice && p.priceRange.max < Number(params.minPrice)) return false;
      if (params?.maxPrice && p.priceRange.min > Number(params.maxPrice)) return false;
      return true;
    });
    return delay({ providers: filtered, page: 1, totalPages: 1, total: filtered.length });
  }
  return api
    .get<{ providers: Provider[]; page: number; totalPages: number; total: number }>("/providers", { params })
    .then((res) => res.data);
};

export const getProviderById = (id: string) => {
  if (isMockDataEnabled()) {
    const provider =
      (mockOwnProvider?._id === id ? mockOwnProvider : null) ??
      mockProviders.find((p) => p._id === id) ??
      mockProviders[0];
    return delay({ provider });
  }
  return api.get<{ provider: Provider }>(`/providers/${id}`).then((res) => res.data);
};

export interface ProviderProfilePayload {
  category: string;
  bio?: string;
  location: { country: string; state: string; city: string; area: string; lat?: number; lng?: number };
  priceRange: { min: number; max: number };
}

export const createProviderProfile = (data: ProviderProfilePayload) => {
  if (isMockDataEnabled()) {
    mockOwnProvider = {
      _id: "mock-own-provider",
      userId: { _id: mockCurrentUser.id, name: mockCurrentUser.name, email: mockCurrentUser.email },
      category: data.category,
      bio: data.bio,
      location: data.location,
      priceRange: data.priceRange,
      profilePhoto: "",
      isVerified: false,
      avgRating: 0,
      reviewCount: 0,
      completedBookings: 0,
    };
    return delay({ provider: mockOwnProvider });
  }
  return api.post<{ provider: Provider }>("/providers", data).then((res) => res.data);
};

export const submitVerificationDocument = (id: string, documentUrl: string) => {
  if (isMockDataEnabled()) {
    return delay({ provider: mockOwnProvider! });
  }
  return api
    .post<{ provider: Provider }>(`/providers/${id}/verification-document`, { documentUrl })
    .then((res) => res.data);
};

export const updateProviderProfile = (id: string, data: ProviderProfilePayload) => {
  if (isMockDataEnabled()) {
    if (mockOwnProvider) {
      mockOwnProvider = { ...mockOwnProvider, ...data };
    }
    return delay({ provider: mockOwnProvider! });
  }
  return api.put<{ provider: Provider }>(`/providers/${id}`, data).then((res) => res.data);
};
