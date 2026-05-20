import { Router } from "express";
import multer from "multer";
import { AppDataSource } from "../config/data-source.js";
import { verifyToken } from "../middleware/verifyToken.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only image files (jpg, png, webp, gif) are allowed."));
  },
});

const router = Router();

router.post("/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const base64 = req.file.buffer.toString("base64");
    const mime = req.file.mimetype;
    const avatar_url = `data:${mime};base64,${base64}`;
    const repo = AppDataSource.getRepository("User");
    await repo.update(req.user.id, { avatar_url });
    res.json({ message: "Avatar updated.", avatar_url });
  } catch (e) {
    console.error("Upload avatar error:", e);
    res.status(500).json({ message: "Upload failed." });
  }
});

router.delete("/avatar", verifyToken, async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("User");
    await repo.update(req.user.id, { avatar_url: null });
    res.json({ message: "Avatar removed." });
  } catch (e) {
    console.error("Delete avatar error:", e);
    res.status(500).json({ message: "Failed to remove avatar." });
  }
});

export default router;
