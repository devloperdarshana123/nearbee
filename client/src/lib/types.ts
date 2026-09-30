export type Role = "customer" | "provider" | "admin";

export interface Me {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  referralCode?: string;
  hasBeenReferred?: boolean;
}

export interface ProviderUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Provider {
  _id: string;
  userId: ProviderUser;
  category: string;
  bio?: string;
  location: {
    country: string;
    state: string;
    city: string;
    area: string;
    geo?: { type: string; coordinates: [number, number] };
  };
  priceRange: { min: number; max: number };
  availability?: { day: string; startTime: string; endTime: string }[];
  profilePhoto?: string;
  workPhotos?: string[];
  isVerified: boolean;
  verificationDocument?: string;
  verificationStatus?: "none" | "pending" | "approved" | "rejected";
  avgRating: number;
  reviewCount: number;
  completedBookings: number;
}

export type BookingStatus = "pending" | "accepted" | "rejected" | "completed";

export interface Booking {
  _id: string;
  customerId: { _id: string; name: string; email: string; phone?: string };
  providerId: {
    _id: string;
    category: string;
    location: { city: string; area?: string };
    userId?: { _id: string; name: string };
  };
  serviceDescription: string;
  requestedDate: string;
  requestedTime: string;
  status: BookingStatus;
}

export interface Review {
  _id: string;
  bookingId: string;
  customerId: { _id: string; name: string; email?: string };
  providerId: string | { _id: string; category: string; userId?: { name: string } };
  rating: number;
  comment?: string;
  photos?: string[];
  isFlagged?: boolean;
  flagReason?: string;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isBanned: boolean;
}
