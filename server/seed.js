require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const ProviderProfile = require("./models/ProviderProfile");

const demoProviders = [
  {
    name: "Ramesh Kumar",
    email: "demo.ramesh@nearbee.app",
    phone: "9800000001",
    category: "Plumber",
    bio: "15+ years fixing leaks, installing fittings, and handling emergency plumbing repairs across the city.",
    location: { country: "India", state: "Delhi", city: "New Delhi", area: "Karol Bagh" },
    priceRange: { min: 300, max: 1500 },
    avgRating: 4.7,
    reviewCount: 32,
    isVerified: true,
  },
  {
    name: "Suresh Electricals",
    email: "demo.suresh@nearbee.app",
    phone: "9800000002",
    category: "Electrician",
    bio: "Licensed electrician for wiring, switchboard repairs, inverter installation, and home safety checks.",
    location: { country: "India", state: "Maharashtra", city: "Mumbai", area: "Andheri" },
    priceRange: { min: 250, max: 2000 },
    avgRating: 4.5,
    reviewCount: 21,
    isVerified: true,
  },
  {
    name: "Priya Sharma",
    email: "demo.priya@nearbee.app",
    phone: "9800000003",
    category: "Tutor",
    bio: "Experienced tutor for Class 6-12 Maths and Science, focused on building strong fundamentals.",
    location: { country: "India", state: "Karnataka", city: "Bengaluru", area: "Koramangala" },
    priceRange: { min: 500, max: 1200 },
    avgRating: 4.9,
    reviewCount: 45,
    isVerified: true,
  },
  {
    name: "Sparkle Home Cleaning",
    email: "demo.sparkle@nearbee.app",
    phone: "9800000004",
    category: "Cleaner",
    bio: "Deep cleaning, sofa shampooing, and regular home cleaning services with trained staff.",
    location: { country: "India", state: "Telangana", city: "Hyderabad", area: "Gachibowli" },
    priceRange: { min: 400, max: 3000 },
    avgRating: 4.3,
    reviewCount: 18,
    isVerified: false,
  },
  {
    name: "CoolFix AC Services",
    email: "demo.coolfix@nearbee.app",
    phone: "9800000005",
    category: "AC Repair",
    bio: "AC installation, gas refilling, and annual maintenance for split and window units.",
    location: { country: "India", state: "Tamil Nadu", city: "Chennai", area: "T. Nagar" },
    priceRange: { min: 350, max: 2500 },
    avgRating: 4.6,
    reviewCount: 27,
    isVerified: true,
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding");

  for (const demo of demoProviders) {
    let user = await User.findOne({ email: demo.email });
    if (!user) {
      user = await User.create({
        clerkId: `seed_${demo.email}`,
        name: demo.name,
        email: demo.email,
        phone: demo.phone,
        role: "provider",
      });
    }

    const existingProfile = await ProviderProfile.findOne({ userId: user._id });
    if (existingProfile) {
      console.log(`Skipping ${demo.name}, profile already exists`);
      continue;
    }

    await ProviderProfile.create({
      userId: user._id,
      category: demo.category,
      bio: demo.bio,
      location: demo.location,
      priceRange: demo.priceRange,
      avgRating: demo.avgRating,
      reviewCount: demo.reviewCount,
      isVerified: demo.isVerified,
    });
    console.log(`Created provider: ${demo.name}`);
  }

  console.log("Seeding complete");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
