import { apiFetch } from "./client.js";

export const listSuppliers = async () => apiFetch("/api/suppliers");
