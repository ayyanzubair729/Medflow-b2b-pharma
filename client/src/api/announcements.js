import { apiFetch } from "./client.js";

export const listAnnouncements = (role) =>
  apiFetch(`/api/announcements${role ? `?role=${role}` : ""}`);

export const createAnnouncement = (title, body, target_audience = "all") =>
  apiFetch("/api/announcements", {
    method: "POST",
    body: JSON.stringify({ title, body, target_audience }),
  });
