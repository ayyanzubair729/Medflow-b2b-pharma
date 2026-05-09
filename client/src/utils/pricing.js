export const formatCurrency = (value, currency = "PKR") => {
  if (!Number.isFinite(Number(value))) return "Pricing on request";
  const formatted = Number(value).toLocaleString("en-US");
  return `${currency} ${formatted}`;
};

export const resolveUnitPrice = (tiers, quantity) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return null;
  const qty = Number(quantity);
  if (!Number.isFinite(qty)) return null;

  const tier = tiers
    .filter((item) => qty >= Number(item.min_quantity))
    .filter((item) => item.max_quantity === null || qty <= Number(item.max_quantity))
    .sort((a, b) => Number(b.min_quantity) - Number(a.min_quantity))[0];

  return tier ? Number(tier.price_per_unit) : null;
};

export const getTierRange = (tiers, currency = "PKR") => {
  if (!Array.isArray(tiers) || tiers.length === 0) return "Pricing on request";
  const values = tiers
    .map((tier) => Number(tier.price_per_unit))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  if (values.length === 0) return "Pricing on request";
  if (values.length === 1) return formatCurrency(values[0], currency);
  return `${formatCurrency(values[0], currency)} - ${formatCurrency(values[values.length - 1], currency)}`;
};
