import { apiFetch } from "./client.js";

export const listQuotes = async () => apiFetch("/api/quotes");

export const createQuote = async ({ product_id, quantity_requested, message }) =>
  apiFetch("/api/quotes", {
    method: "POST",
    body: JSON.stringify({ product_id, quantity_requested, message }),
  });

export const acceptQuote = async (id) =>
  apiFetch(`/api/quotes/${id}/accept`, {
    method: "PATCH",
  });

export const rejectQuote = async (id) =>
  apiFetch(`/api/quotes/${id}/reject`, {
    method: "PATCH",
  });
