import type { Booking, Me, Provider, Review } from "./types";

/**
 * Temporary stand-in data so the UI can be reviewed before MongoDB is
 * connected. Toggled by VITE_MOCK_DATA in .env.local — flip it to "false"
 * (or delete the var) once the real API is wired up, no component changes
 * needed since services/*.ts branch on isMockDataEnabled().
 */
export function isMockDataEnabled() {
  return import.meta.env.VITE_MOCK_DATA === "true";
}

const providerUsers = [
  { _id: "mock-u1", name: "Ramesh Kumar", email: "ramesh@example.com", phone: "9876500001" },
  { _id: "mock-u2", name: "Sunita Sharma", email: "sunita@example.com", phone: "9876500002" },
  { _id: "mock-u3", name: "Vikram Singh", email: "vikram@example.com", phone: "9876500003" },
  { _id: "mock-u4", name: "Priya Verma", email: "priya@example.com", phone: "9876500004" },
  { _id: "mock-u5", name: "Amit Yadav", email: "amit@example.com", phone: "9876500005" },
  { _id: "mock-u6", name: "Neha Joshi", email: "neha@example.com", phone: "9876500006" },
  { _id: "mock-u7", name: "Kavita Rao", email: "kavita@example.com", phone: "9876500007" },
  { _id: "mock-u8", name: "Deepak Malhotra", email: "deepak@example.com", phone: "9876500008" },
  { _id: "mock-u9", name: "Farah Sheikh", email: "farah@example.com", phone: "9876500009" },
  { _id: "mock-u10", name: "Sanjay Patil", email: "sanjay@example.com", phone: "9876500010" },
];

export const mockProviders: Provider[] = [
  {
    _id: "mock-p1",
    userId: providerUsers[0],
    category: "Plumber",
    bio: "15 years fixing leaks, installing fittings, and emergency plumbing across the city.",
    location: { country: "India", state: "Maharashtra", city: "Pune", area: "Kothrud" },
    priceRange: { min: 200, max: 800 },
    profilePhoto: "",
    isVerified: true,
    avgRating: 4.7,
    reviewCount: 38,
    completedBookings: 61,
  },
  {
    _id: "mock-p2",
    userId: providerUsers[1],
    category: "Electrician",
    bio: "Licensed electrician for wiring, fan/AC installation, and short-circuit troubleshooting.",
    location: { country: "India", state: "Maharashtra", city: "Pune", area: "Baner" },
    priceRange: { min: 250, max: 1000 },
    profilePhoto: "",
    isVerified: true,
    avgRating: 4.9,
    reviewCount: 52,
    completedBookings: 90,
  },
  {
    _id: "mock-p3",
    userId: providerUsers[2],
    category: "Carpenter",
    bio: "Custom furniture, door/window repair, and modular kitchen fittings.",
    location: { country: "India", state: "Maharashtra", city: "Mumbai", area: "Andheri" },
    priceRange: { min: 300, max: 1500 },
    profilePhoto: "",
    isVerified: false,
    avgRating: 4.2,
    reviewCount: 9,
    completedBookings: 14,
  },
  {
    _id: "mock-p4",
    userId: providerUsers[3],
    category: "Tutor",
    bio: "Maths and Science tutor for grades 6-10, 8 years of teaching experience.",
    location: { country: "India", state: "Maharashtra", city: "Pune", area: "Viman Nagar" },
    priceRange: { min: 400, max: 900 },
    profilePhoto: "",
    isVerified: true,
    avgRating: 5,
    reviewCount: 21,
    completedBookings: 35,
  },
  {
    _id: "mock-p5",
    userId: providerUsers[4],
    category: "Cook",
    bio: "Home-style North and South Indian cooking, daily or event-based.",
    location: { country: "India", state: "Maharashtra", city: "Mumbai", area: "Powai" },
    priceRange: { min: 500, max: 2000 },
    profilePhoto: "",
    isVerified: false,
    avgRating: 0,
    reviewCount: 0,
    completedBookings: 0,
  },
  {
    _id: "mock-p6",
    userId: providerUsers[5],
    category: "Beautician",
    bio: "At-home salon services — haircuts, facials, and bridal packages.",
    location: { country: "India", state: "Maharashtra", city: "Pune", area: "Kothrud" },
    priceRange: { min: 300, max: 3000 },
    profilePhoto: "",
    isVerified: true,
    avgRating: 4.5,
    reviewCount: 17,
    completedBookings: 22,
  },
  {
    _id: "mock-p7",
    userId: providerUsers[6],
    category: "Babysitter",
    bio: "Certified in child first-aid, 6 years experience with toddlers and school-age kids.",
    location: { country: "India", state: "Maharashtra", city: "Pune", area: "Baner" },
    priceRange: { min: 150, max: 400 },
    profilePhoto: "",
    isVerified: true,
    avgRating: 4.8,
    reviewCount: 29,
    completedBookings: 47,
  },
  {
    _id: "mock-p8",
    userId: providerUsers[7],
    category: "Elderly Care",
    bio: "Trained caregiver for elderly assistance, medication reminders, and companionship.",
    location: { country: "India", state: "Maharashtra", city: "Mumbai", area: "Andheri" },
    priceRange: { min: 400, max: 1200 },
    profilePhoto: "",
    isVerified: true,
    avgRating: 4.6,
    reviewCount: 13,
    completedBookings: 20,
  },
  {
    _id: "mock-p9",
    userId: providerUsers[8],
    category: "Pet Sitter",
    bio: "Daily dog walking and pet sitting, comfortable with all breeds and sizes.",
    location: { country: "India", state: "Maharashtra", city: "Pune", area: "Kothrud" },
    priceRange: { min: 100, max: 350 },
    profilePhoto: "",
    isVerified: false,
    avgRating: 4.3,
    reviewCount: 6,
    completedBookings: 8,
  },
  {
    _id: "mock-p10",
    userId: providerUsers[9],
    category: "Mobile Repair",
    bio: "Screen replacement, battery swap, and water-damage repair for all major brands.",
    location: { country: "India", state: "Maharashtra", city: "Mumbai", area: "Powai" },
    priceRange: { min: 200, max: 2500 },
    profilePhoto: "",
    isVerified: true,
    avgRating: 4.4,
    reviewCount: 24,
    completedBookings: 40,
  },
];

export let mockCurrentUser: Me = {
  id: "mock-me",
  name: "Jamie Adams",
  email: "jamesadams202610@gmail.com",
  phone: "",
  role: "customer",
};

export function setMockCurrentUserRole(role: Me["role"]) {
  mockCurrentUser = { ...mockCurrentUser, role };
  return mockCurrentUser;
}

export function setMockCurrentUserProfile(data: { name?: string; phone?: string }) {
  mockCurrentUser = { ...mockCurrentUser, ...data };
  return mockCurrentUser;
}

export const mockBookings: Booking[] = [
  {
    _id: "mock-b1",
    customerId: {
      _id: mockCurrentUser.id,
      name: mockCurrentUser.name,
      email: mockCurrentUser.email,
    },
    providerId: {
      _id: "mock-p1",
      category: "Plumber",
      location: { city: "Pune", area: "Kothrud" },
      userId: { _id: providerUsers[0]._id, name: providerUsers[0].name },
    },
    serviceDescription: "Kitchen sink is leaking from the base, needs urgent fix.",
    requestedDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    requestedTime: "11:00",
    status: "pending",
  },
  {
    _id: "mock-b2",
    customerId: {
      _id: mockCurrentUser.id,
      name: mockCurrentUser.name,
      email: mockCurrentUser.email,
    },
    providerId: {
      _id: "mock-p2",
      category: "Electrician",
      location: { city: "Pune", area: "Baner" },
      userId: { _id: providerUsers[1]._id, name: providerUsers[1].name },
    },
    serviceDescription: "Install two new ceiling fans in the bedroom.",
    requestedDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    requestedTime: "16:30",
    status: "accepted",
  },
  {
    _id: "mock-b3",
    customerId: {
      _id: mockCurrentUser.id,
      name: mockCurrentUser.name,
      email: mockCurrentUser.email,
    },
    providerId: {
      _id: "mock-p4",
      category: "Tutor",
      location: { city: "Pune", area: "Viman Nagar" },
      userId: { _id: providerUsers[3]._id, name: providerUsers[3].name },
    },
    serviceDescription: "Weekly Maths tuition for a 9th grade student.",
    requestedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    requestedTime: "18:00",
    status: "completed",
  },
];

export const mockReviews: Record<string, Review[]> = {
  "mock-p1": [
    {
      _id: "mock-r1",
      bookingId: "mock-b-old-1",
      customerId: { _id: "mock-c1", name: "Anjali Deshpande" },
      providerId: "mock-p1",
      rating: 5,
      comment: "Fixed the leak in 20 minutes, very professional.",
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      _id: "mock-r2",
      bookingId: "mock-b-old-2",
      customerId: { _id: "mock-c2", name: "Rohit Kulkarni" },
      providerId: "mock-p1",
      rating: 4,
      comment: "Good work, arrived a bit late.",
      createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
  ],
  "mock-p2": [
    {
      _id: "mock-r3",
      bookingId: "mock-b-old-3",
      customerId: { _id: "mock-c3", name: "Sneha Iyer" },
      providerId: "mock-p2",
      rating: 5,
      comment: "Extremely knowledgeable, fixed our wiring issue for good.",
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  ],
};
