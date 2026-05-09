import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source.js";
import { UserSchema, UserRole } from "../entities/User.js";

const userRepo = () => AppDataSource.getRepository(UserSchema);

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const buildFrontendRedirect = (token) => {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${baseUrl}/oauth/callback?token=${encodeURIComponent(token)}`;
};

export const register = async (req, res) => {
  try {
    const { email, password, role, business_name, license_number, phone, address } = req.body;

    if (!email || !password || !business_name || !role) {
      res.status(400).json({ message: "Email, password, business name, and role are required." });
      return;
    }

    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: "Role must be buyer or supplier." });
      return;
    }

    if (role === UserRole.ADMIN) {
      res.status(403).json({ message: "Admin registration is not allowed." });
      return;
    }

    if (role === UserRole.SUPPLIER && !license_number) {
      res.status(400).json({ message: "License number is required for supplier accounts." });
      return;
    }

    const existing = await userRepo().findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists." });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = userRepo().create({
      email,
      password_hash,
      role,
      business_name,
      license_number: license_number || null,
      phone: phone || null,
      address: address || null,
      is_verified: role === UserRole.BUYER,
    });

    await userRepo().save(user);

    const token = generateToken(user);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        business_name: user.business_name,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await userRepo().findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ message: "Your account has been deactivated. Contact support." });
      return;
    }

    if (!user.password_hash) {
      res.status(400).json({ message: "Use social login for this account." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        business_name: user.business_name,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      business_name: user.business_name,
      license_number: user.license_number,
      phone: user.phone,
      address: user.address,
      is_verified: user.is_verified,
      created_at: user.created_at,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const { business_name, phone, address } = req.body;

    if (business_name) user.business_name = business_name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await userRepo().save(user);

    res.status(200).json({ message: "Profile updated.", user });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

export const oauthSuccess = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "OAuth authentication failed." });
      return;
    }

    const token = generateToken(user);
    res.redirect(buildFrontendRedirect(token));
  } catch (error) {
    console.error("OAuth error:", error);
    res.status(500).json({ message: "OAuth login failed." });
  }
};
