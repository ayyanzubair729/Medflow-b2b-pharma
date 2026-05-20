import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { AppDataSource } from "../config/data-source.js";
import { verifyToken } from "../middleware/verifyToken.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/avatars");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const files = fs.readdirSync(UPLOAD_DIR);
    for (const f of files) {
      if (f.startsWith(req.user.id + ".")) {
        fs.unlinkSync(path.join(UPLOAD_DIR, f));
      }
    }
    cb(null, `${req.user.id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error("Only image files (jpg, png, webp, gif) are allowed."));
  },
});

const router = Router();

router.post("/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const avatar_url = `/uploads/avatars/${req.file.filename}`;
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
    const userId = req.user.id;
    const files = fs.readdirSync(UPLOAD_DIR);
    for (const f of files) {
      if (f.startsWith(userId)) {
        fs.unlinkSync(path.join(UPLOAD_DIR, f));
      }
    }
    const repo = AppDataSource.getRepository("User");
    await repo.update(userId, { avatar_url: null });
    res.json({ message: "Avatar removed." });
  } catch (e) {
    console.error("Delete avatar error:", e);
    res.status(500).json({ message: "Failed to remove avatar." });
  }
});

export default router;
