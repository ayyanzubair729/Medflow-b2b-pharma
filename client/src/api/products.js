import { apiFetch } from "./client.js";

export const listProducts = async ({
  search = "",
  page = 1,
  limit = 9,
  category,
  supplier,
  stock_status,
  price_min,
  price_max,
  sort_by,
  sort_order,
} = {}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (supplier) params.set("supplier", supplier);
  if (stock_status) params.set("stock_status", stock_status);
  if (price_min) params.set("price_min", price_min);
  if (price_max) params.set("price_max", price_max);
  if (sort_by) params.set("sort_by", sort_by);
  if (sort_order) params.set("sort_order", sort_order);
  params.set("page", String(page));
  params.set("limit", String(limit));
  const query = params.toString();
  return apiFetch(`/api/products${query ? `?${query}` : ""}`);
};

export const getProductById = async (id) => apiFetch(`/api/products/${id}`);
