import { AppDataSource } from "../config/data-source.js";
import { ReturnRequestSchema } from "../entities/ReturnRequest.js";
import { OrderSchema } from "../entities/Order.js";

const rmaRepo = () => AppDataSource.getRepository(ReturnRequestSchema);
const orderRepo = () => AppDataSource.getRepository(OrderSchema);

export const createReturn = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return res.status(401).json({ message: "Not authenticated." });

    const { order_id, reason } = req.body;
    if (!order_id || !reason) return res.status(400).json({ message: "Order ID and reason required." });

    const order = await orderRepo().findOne({ where: { id: order_id, buyer_id: buyerId } });
    if (!order) return res.status(404).json({ message: "Order not found." });

    const rma = rmaRepo().create({ 
      order_id, 
      buyer_id: buyerId, 
      supplier_id: order.supplier_id, 
      reason 
    });
    await rmaRepo().save(rma);
    res.status(201).json(rma);
  } catch (error) {
    console.error("Create return error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const listReturns = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ message: "Not authenticated." });

    const where = role === "supplier" ? { supplier_id: userId } : { buyer_id: userId };
    const returns = await rmaRepo().find({ where, relations: ["order", "buyer", "supplier"] });
    res.json(returns);
  } catch (error) {
    console.error("List returns error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateReturnStatus = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) return res.status(401).json({ message: "Not authenticated." });

    const rma = await rmaRepo().findOne({ where: { id: req.params.id } });
    if (!rma) return res.status(404).json({ message: "RMA not found." });
    if (rma.supplier_id !== supplierId) return res.status(403).json({ message: "Not authorized." });

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid status." });
    
    rma.status = status;
    await rmaRepo().save(rma);
    res.json(rma);
  } catch (error) {
    console.error("Update return status error:", error);
    res.status(500).json({ message: "Server error." });
  }
};