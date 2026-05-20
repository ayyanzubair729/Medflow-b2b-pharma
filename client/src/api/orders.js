import { apiFetch, apiFetchBlob } from "./client.js";

export const listOrders = async () => apiFetch("/api/orders");

export const createOrder = async ({ delivery_address, notes }) =>
  apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify({ delivery_address, notes }),
  });

export const cancelOrder = async (id) =>
  apiFetch(`/api/orders/${id}/cancel`, {
    method: "PATCH",
  });

export const reorderFromOrder = async (id) =>
  apiFetch(`/api/reorder/orders/${id}`, {
    method: "POST",
  });

export const downloadInvoicePdf = async (orderId) =>
  apiFetchBlob(`/api/orders/${orderId}/invoice`);
