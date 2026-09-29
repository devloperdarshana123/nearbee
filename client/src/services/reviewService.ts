import api from "../lib/api";
import type { Review } from "../lib/types";
import { isMockDataEnabled, mockCurrentUser, mockReviews } from "../lib/mockData";

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 250));

export const createReview = (data: {
  bookingId: string;
  rating: number;
  comment?: string;
  photos?: string[];
}) => {
  if (isMockDataEnabled()) {
    const review: Review = {
      _id: `mock-r-${Date.now()}`,
      bookingId: data.bookingId,
      customerId: { _id: mockCurrentUser.id, name: mockCurrentUser.name },
      providerId: "mock-p1",
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };
    return delay({ review });
  }
  return api.post<{ review: Review }>("/reviews", data).then((res) => res.data);
};

export const getReviewsForProvider = (providerId: string) => {
  if (isMockDataEnabled()) {
    return delay({ reviews: mockReviews[providerId] ?? [] });
  }
  return api.get<{ reviews: Review[] }>(`/reviews/provider/${providerId}`).then((res) => res.data);
};

export const reportReview = (id: string, reason?: string) =>
  api.post<{ review: Review }>(`/reviews/${id}/report`, { reason }).then((res) => res.data);
