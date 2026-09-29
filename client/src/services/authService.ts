import api from "../lib/api";
import type { Me, Role } from "../lib/types";
import {
  isMockDataEnabled,
  mockCurrentUser,
  setMockCurrentUserProfile,
  setMockCurrentUserRole,
} from "../lib/mockData";

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 250));

export const getMe = () => {
  if (isMockDataEnabled()) {
    return delay({ user: mockCurrentUser });
  }
  return api.get<{ user: Me }>("/auth/me").then((res) => res.data);
};

export const updateProfile = (data: { name?: string; phone?: string }) => {
  if (isMockDataEnabled()) {
    return delay({ user: setMockCurrentUserProfile(data) });
  }
  return api.put<{ user: Me }>("/auth/profile", data).then((res) => res.data);
};

export const updateRole = (data: { role?: Role; phone?: string }) => {
  if (isMockDataEnabled()) {
    const user = data.role ? setMockCurrentUserRole(data.role) : mockCurrentUser;
    return delay({ user });
  }
  return api.put<{ user: Me }>("/auth/role", data).then((res) => res.data);
};

export const applyReferral = (code: string) =>
  api.post<{ message: string }>("/auth/referral/apply", { code }).then((res) => res.data);

export const getReferralStats = () =>
  api
    .get<{ referralCode: string; referralCount: number }>("/auth/referral/stats")
    .then((res) => res.data);
