import { Router } from "express";
import passport from "passport";
import { register, login, getMe, updateMe, oauthSuccess } from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

const hasGoogleOAuth = Boolean(
	process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
const hasFacebookOAuth = Boolean(
	process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET
);

router.post("/register", register);
router.post("/login", login);
router.get("/google", (req, res, next) => {
  if (!hasGoogleOAuth) {
    res.status(503).json({ message: "Google OAuth is not configured." });
    return;
  }
	passport.authenticate("google", {
		scope: ["profile", "email"],
		session: false,
		prompt: "select_account",
	})(req, res, next);
});
router.get(
	"/google/callback",
	(req, res, next) => {
		if (!hasGoogleOAuth) {
			res.status(503).json({ message: "Google OAuth is not configured." });
			return;
		}
		passport.authenticate("google", {
			session: false,
			failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth`,
		})(req, res, next);
	},
	oauthSuccess
);
router.get("/facebook", (req, res, next) => {
  if (!hasFacebookOAuth) {
    res.status(503).json({ message: "Facebook OAuth is not configured." });
    return;
  }
  passport.authenticate("facebook", { scope: ["email"], session: false })(req, res, next);
});
router.get(
	"/facebook/callback",
	(req, res, next) => {
		if (!hasFacebookOAuth) {
			res.status(503).json({ message: "Facebook OAuth is not configured." });
			return;
		}
		passport.authenticate("facebook", {
			session: false,
			failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth`,
		})(req, res, next);
	},
	oauthSuccess
);
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMe);

export default router;
