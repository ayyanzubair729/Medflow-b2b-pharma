import { AppDataSource } from "../config/data-source.js";
import { ProductSchema, StockStatus } from "../entities/Product.js";
import { OrderSchema, OrderStatus } from "../entities/Order.js";
const orderRepo = () => AppDataSource.getRepository(OrderSchema);

export const listSupplierOrders = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) return res.status(401).json({ message: "Not authenticated." });

    const orders = await orderRepo().find({
      where: { supplier_id: supplierId },
      relations: ["buyer", "items", "items.product"],
      order: { placed_at: "DESC" },
    });
    res.status(200).json(orders);
  } catch (err) {
    console.error("Supplier orders error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

export const advanceOrderStatus = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    const order = await orderRepo().findOne({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.supplier_id !== supplierId) return res.status(403).json({ message: "Not authorized." });

    const FLOW = [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
    const idx  = FLOW.indexOf(order.status);
    if (idx === -1 || idx >= FLOW.length - 1)
      return res.status(400).json({ message: "Cannot advance order from this status." });

    order.status = FLOW[idx + 1];
    await orderRepo().save(order);
    res.status(200).json(order);
  } catch (err) {
    console.error("Advance order error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
const productRepo = () => AppDataSource.getRepository(ProductSchema);

export const listMyProducts = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const products = await productRepo().find({
      where: { supplier_id: supplierId },
      relations: ["category", "price_tiers"],
      order: { created_at: "DESC" },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("List supplier products error:", error);
    res.status(500).json({ message: "Server error fetching supplier products." });
  }
};

export const updateProductVisibility = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const product = await productRepo().findOne({ where: { id: req.params.id } });
    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    if (product.supplier_id !== supplierId) {
      res.status(403).json({ message: "Not authorized to update this product." });
      return;
    }

    if (req.body.is_active === undefined) {
      res.status(400).json({ message: "is_active is required." });
      return;
    }

    product.is_active = Boolean(req.body.is_active);
    await productRepo().save(product);

    res.status(200).json(product);
  } catch (error) {
    console.error("Update product visibility error:", error);
    res.status(500).json({ message: "Server error updating visibility." });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const product = await productRepo().findOne({ where: { id: req.params.id } });
    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    if (product.supplier_id !== supplierId) {
      res.status(403).json({ message: "Not authorized to update this product." });
      return;
    }

    const { stock_quantity, stock_status } = req.body;

    if (stock_quantity !== undefined) {
      const qty = Number(stock_quantity);
      if (!Number.isFinite(qty) || qty < 0) {
        res.status(400).json({ message: "Valid stock_quantity is required." });
        return;
      }
      product.stock_quantity = qty;
    }

    if (stock_status !== undefined) {
      if (!Object.values(StockStatus).includes(stock_status)) {
        res.status(400).json({ message: "Invalid stock_status." });
        return;
      }
      product.stock_status = stock_status;
    }

    await productRepo().save(product);
    res.status(200).json(product);
  } catch (error) {
    console.error("Update product stock error:", error);
    res.status(500).json({ message: "Server error updating stock." });
  }
};
