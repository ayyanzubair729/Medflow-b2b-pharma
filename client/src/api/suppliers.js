import { apiFetch } from "./client.js";

export const listSuppliers = async () => apiFetch("/api/suppliers");

// Products
export const listMyProducts = () => apiFetch("/api/supplier/products");
export const updateProductVisibility = (id, is_active) =>
  apiFetch(`/api/supplier/products/${id}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ is_active }),
  });
export const updateProductStock = (id, payload) =>
  apiFetch(`/api/supplier/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

// Orders (supplier view)
export const listSupplierOrders = () => apiFetch("/api/supplier/orders");
export const updateOrderStatus = (id, status) =>
  apiFetch(`/api/supplier/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// Quotes (supplier view)
export const listSupplierQuotes = () => apiFetch("/api/quotes?role=supplier");
export const respondToQuote = (id, payload) =>
  apiFetch(`/api/quotes/${id}/respond`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

// Dashboard summary
export const getSupplierSummary = () => apiFetch("/api/supplier/dashboard");