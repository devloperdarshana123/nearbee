import api from "../lib/api";
import type { Booking, BookingStatus } from "../lib/types";
import { isMockDataEnabled, mockBookings, mockCurrentUser, mockProviders } from "../lib/mockData";

export interface CreateBookingPayload {
  providerId: string;
  serviceDescription: string;
  requestedDate: string;
  requestedTime: string;
}

const delay = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), 250));

export const createBooking = (data: CreateBookingPayload) => {
  if (isMockDataEnabled()) {
    const provider = mockProviders.find((p) => p._id === data.providerId) ?? mockProviders[0];
    const booking: Booking = {
      _id: `mock-b-${Date.now()}`,
      customerId: {
        _id: mockCurrentUser.id,
        name: mockCurrentUser.name,
        email: mockCurrentUser.email,
      },
      providerId: {
        _id: provider._id,
        category: provider.category,
        location: provider.location,
        userId: { _id: provider.userId._id, name: provider.userId.name },
      },
      serviceDescription: data.serviceDescription,
      requestedDate: data.requestedDate,
      requestedTime: data.requestedTime,
      status: "pending",
    };
    mockBookings.unshift(booking);
    return delay({ booking });
  }
  return api.post<{ booking: Booking }>("/bookings", data).then((res) => res.data);
};

export const getMyBookings = () => {
  if (isMockDataEnabled()) {
    return delay({ bookings: mockBookings });
  }
  return api.get<{ bookings: Booking[] }>("/bookings/my").then((res) => res.data);
};

export const updateBookingStatus = (id: string, status: BookingStatus) => {
  if (isMockDataEnabled()) {
    const booking = mockBookings.find((b) => b._id === id);
    if (booking) booking.status = status;
    return delay({ booking: booking! });
  }
  return api.put<{ booking: Booking }>(`/bookings/${id}/status`, { status }).then((res) => res.data);
};
