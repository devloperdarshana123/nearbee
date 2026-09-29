const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProviderFilter = ({ category, city, state, country, minPrice, maxPrice, verified }) => {
  const filter = {};

  if (category) filter.category = new RegExp(escapeRegExp(category), "i");
  if (city) filter["location.city"] = new RegExp(escapeRegExp(city), "i");
  if (state) filter["location.state"] = new RegExp(escapeRegExp(state), "i");
  if (country) filter["location.country"] = new RegExp(escapeRegExp(country), "i");
  if (verified !== undefined) filter.isVerified = verified === "true" || verified === true;

  if (minPrice || maxPrice) {
    filter["priceRange.min"] = {};
    if (maxPrice) filter["priceRange.min"].$lte = Number(maxPrice);
    if (minPrice) filter["priceRange.max"] = { $gte: Number(minPrice) };
  }

  return filter;
};

module.exports = { escapeRegExp, buildProviderFilter };
