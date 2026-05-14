import { AppDataSource } from "../config/data-source.js";
import { OrderSchema } from "../entities/Order.js";

export const listInvoices = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) return res.status(401).json({ message: "Not authenticated." });

    const orderRepo = AppDataSource.getRepository(OrderSchema);
    const orders = await orderRepo.find({
      where: { supplier_id: supplierId, status: "delivered" },
      relations: ["buyer", "items", "items.product"],
      order: { updated_at: "DESC" },
    });
    res.json(orders);
  } catch (error) {
    console.error("List invoices error:", error);
    res.status(500).json({ message: "Server error." });
  }
};