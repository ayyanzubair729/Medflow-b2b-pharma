import { apiFetch } from "./client.js";

export const listCategories = async () => apiFetch("/api/categories");
