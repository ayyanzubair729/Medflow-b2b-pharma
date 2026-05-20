import { apiFetch } from "./client.js";

export const listReturns = async () => apiFetch("/api/rma");

export const createReturn = async ({ order_id, reason }) =>
  apiFetch("/api/rma", {
    method: "POST",
    body: JSON.stringify({ order_id, reason }),
  });

export const updateReturnStatus = async (id, status) =>
  apiFetch(`/api/rma/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
