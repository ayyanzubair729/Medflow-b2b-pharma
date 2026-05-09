import { apiFetch } from "./client.js";

export const getDashboardSummary = async () => apiFetch("/api/dashboard/summary");
