import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRoles.js";

const router = Router();

const announcements = [
  {
    id: "1",
    title: "New cold-chain facility operational",
    body: "Our Lahore cold-chain hub is now live, reducing dispatch times for temperature-sensitive products across northern regions.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: "Admin",
    target_audience: "all",
  },
  {
    id: "2",
    title: "Platform maintenance — 2 May",
    body: "MedFlow will undergo scheduled maintenance on 2 May from 2:00 AM to 5:00 AM PKT. Order processing may be delayed.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author: "Admin",
    target_audience: "all",
  },
  {
    id: "3",
    title: "New supplier onboarding feature",
    body: "Suppliers can now upload product catalogs in bulk via CSV. Check the catalog section for details.",
    created_at: new Date().toISOString(),
    author: "Admin",
    target_audience: "supplier",
  },
];

router.get("/", verifyToken, (_req, res) => {
  let { role } = _req.query;
  let filtered = [...announcements];
  if (role && role !== "all") {
    filtered = filtered.filter((a) => a.target_audience === role || a.target_audience === "all");
  }
  res.json(filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

router.post("/", verifyToken, requireRole("admin"), (req, res) => {
  const { title, body, target_audience } = req.body;
  if (!title || !body) return res.status(400).json({ message: "Title and body are required." });
  const audience = ["buyer", "supplier", "all"].includes(target_audience) ? target_audience : "all";
  const announcement = {
    id: String(Date.now()),
    title,
    body,
    created_at: new Date().toISOString(),
    author: "Admin",
    target_audience: audience,
  };
  announcements.unshift(announcement);
  res.status(201).json(announcement);
});

export default router;
