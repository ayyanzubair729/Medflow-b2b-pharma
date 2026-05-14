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

  export const createProduct = (data) =>
  apiFetch("/api/supplier/products", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProduct = (id, data) =>
  apiFetch(`/api/supplier/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteProduct = (id) =>
  apiFetch(`/api/supplier/products/${id}`, {
    method: "DELETE",
  });

// Orders (supplier view)
export const listSupplierOrders = () => apiFetch("/api/supplier/orders");

// Keep old function name - your existing SupplierOrders.jsx uses this
export const updateOrderStatus = (id, status) =>
  apiFetch(`/api/supplier/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// New advance function
export const advanceOrderStatus = (id) =>
  apiFetch(`/api/supplier/orders/${id}/advance`, {
    method: "POST",
  });

// Quotes (supplier view)
export const listSupplierQuotes = () => apiFetch("/api/quotes");
export const respondToQuote = (id, payload) =>
  apiFetch(`/api/quotes/${id}/respond`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

// Dashboard summary
export const getSupplierSummary = () => apiFetch("/api/supplier/dashboard");