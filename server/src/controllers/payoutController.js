import { AppDataSource } from "../config/data-source.js";
import { OrderSchema } from "../entities/Order.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";

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

export const downloadInvoice = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) return res.status(401).json({ message: "Not authenticated." });

    const orderRepo = AppDataSource.getRepository(OrderSchema);
    const order = await orderRepo.findOne({
      where: { id: req.params.id, supplier_id: supplierId },
      relations: ["buyer", "items", "items.product"],
    });

    if (!order) return res.status(404).json({ message: "Invoice not found." });

    const pdfBuffer = await generateInvoicePDF(order);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.id}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Download invoice error:", error);
    res.status(500).json({ message: "Server error." });
  }
};