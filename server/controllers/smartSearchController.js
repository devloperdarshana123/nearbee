const ProviderProfile = require("../models/ProviderProfile");
const { buildProviderFilter } = require("../utils/providerFilters");

const VALID_CATEGORIES = [
  "Plumber", "Electrician", "Carpenter", "Painter", "AC Repair", "Appliance Repair",
  "Pest Control", "Gardener", "Locksmith", "Cleaner", "Deep Cleaning", "Laundry",
  "Beautician", "Massage Therapist", "Yoga Instructor", "Personal Trainer", "Babysitter",
  "Nanny", "Elderly Care", "Pet Sitter", "Tutor", "Music Teacher", "Cook", "Caterer",
  "Driver", "Movers & Packers", "Photographer", "Event Decorator", "Mobile Repair", "Tailor",
];

const EXTRACTION_PROMPT = `You turn a customer's natural-language request for a local service into a JSON filter.
Respond with ONLY a JSON object, no prose, matching this shape:
{"category": string|null, "city": string|null, "state": string|null, "maxPrice": number|null, "minPrice": number|null}

Rules:
- category MUST be exactly one of this list (pick the closest match), or null if none fit:
  ${VALID_CATEGORIES.join(", ")}
- Only fill a field if the user's message actually implies it. Use null otherwise.
- Prices are in Indian Rupees (INR).`;

const smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ message: "query is required" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          { role: "user", content: query },
        ],
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    });

    let interpreted = {};
    if (response.ok) {
      const data = await response.json();
      try {
        interpreted = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      } catch {
        interpreted = {};
      }
    } else {
      console.error("Groq smart search error:", await response.text());
    }

    const filter = buildProviderFilter({
      category: interpreted.category || undefined,
      city: interpreted.city || undefined,
      state: interpreted.state || undefined,
      minPrice: interpreted.minPrice || undefined,
      maxPrice: interpreted.maxPrice || undefined,
    });

    const providers = await ProviderProfile.find(filter)
      .populate("userId", "name email phone")
      .sort({ avgRating: -1, createdAt: -1 })
      .limit(20);

    res.json({ providers, interpreted });
  } catch (err) {
    next(err);
  }
};

module.exports = { smartSearch };
