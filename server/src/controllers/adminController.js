import { AppDataSource } from "../config/data-source.js";
import { UserSchema, UserRole } from "../entities/User.js";

const userRepo = () => AppDataSource.getRepository(UserSchema);

export const listUnverifiedSuppliers = async (_req, res) => {
  try {
    const suppliers = await userRepo().find({
      where: { role: UserRole.SUPPLIER, is_verified: false, is_active: true },
    });
    res.json(suppliers);
  } catch (error) {
    console.error("List unverified suppliers error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const verifySupplier = async (req, res) => {
  try {
    const user = await userRepo().findOne({ where: { id: req.params.id, role: UserRole.SUPPLIER } });
    if (!user) return res.status(404).json({ message: "Supplier not found." });
    user.is_verified = true;
    await userRepo().save(user);
    res.json({ message: "Supplier verified." });
  } catch (error) {
    console.error("Verify supplier error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const rejectSupplier = async (req, res) => {
  try {
    const user = await userRepo().findOne({ where: { id: req.params.id, role: UserRole.SUPPLIER } });
    if (!user) return res.status(404).json({ message: "Supplier not found." });
    user.is_active = false;
    await userRepo().save(user);
    res.json({ message: "Supplier rejected/deactivated." });
  } catch (error) {
    console.error("Reject supplier error:", error);
    res.status(500).json({ message: "Server error." });
  }
};