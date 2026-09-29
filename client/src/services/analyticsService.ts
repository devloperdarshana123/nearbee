import api from "../lib/api";

export interface ProviderAnalytics {
  totalBookings: number;
  statusCounts: { pending: number; accepted: number; rejected: number; completed: number };
  completedBookings: number;
  estimatedEarnings: number;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
  monthlyBookings: { label: string; bookings: number }[];
  recentReviews: { _id: string; rating: number; comment?: string; customerId?: { name: string } }[];
}

export const getProviderAnalytics = () =>
  api.get<ProviderAnalytics>("/analytics/provider").then((res) => res.data);
