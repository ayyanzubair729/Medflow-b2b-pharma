import { AppDataSource } from "../config/data-source.js";
import { UserSchema, UserRole } from "../entities/User.js";

const userRepo = () => AppDataSource.getRepository(UserSchema);

export const listSuppliers = async (_req, res) => {
  try {
    const suppliers = await userRepo().find({
      where: { role: UserRole.SUPPLIER, is_active: true },
      order: { business_name: "ASC" },
    });

    const payload = suppliers.map((supplier) => ({
      id: supplier.id,
      business_name: supplier.business_name,
      is_verified: supplier.is_verified,
    }));

    res.status(200).json(payload);
  } catch (error) {
    console.error("List suppliers error:", error);
    res.status(500).json({ message: "Server error fetching suppliers." });
  }
};
