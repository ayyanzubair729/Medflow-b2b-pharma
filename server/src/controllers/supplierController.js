import { AppDataSource } from "../config/data-source.js";
import { ProductSchema, StockStatus, ProductUnit } from "../entities/Product.js";
import { PriceTierSchema } from "../entities/PriceTier.js";
import { OrderSchema, OrderStatus } from "../entities/Order.js";
import { orderStatusEmail } from "../utils/emailService.js";

const productRepo = () => AppDataSource.getRepository(ProductSchema);
const priceTierRepo = () => AppDataSource.getRepository(PriceTierSchema);
const orderRepo = () => AppDataSource.getRepository(OrderSchema);

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
    if (!supplierId) return res.status(401).json({ message: "Not authenticated." });

    const order = await orderRepo().findOne({ 
      where: { id: req.params.id },
      relations: ["items", "items.product"]
    });
    
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.supplier_id !== supplierId) {
      return res.status(403).json({ message: "Not authorized to update this order." });
    }

    // Define the status flow
    const FLOW = [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED];
    const currentIdx = FLOW.indexOf(order.status);
    
    if (currentIdx === -1) {
      return res.status(400).json({ 
        message: `Cannot advance from "${order.status}" status.` 
      });
    }
    
    if (currentIdx >= FLOW.length - 1) {
      return res.status(400).json({ 
        message: "Order is already at final status." 
      });
    }

    const nextStatus = FLOW[currentIdx + 1];
    order.status = nextStatus;
    await orderRepo().save(order);
  const buyerEmail = order.buyer?.email;
  if (buyerEmail) await orderStatusEmail(order, buyerEmail).catch(console.error);
    // Return updated order with relations
    const updatedOrder = await orderRepo().findOne({
      where: { id: order.id },
      relations: ["buyer", "items", "items.product"]
    });

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error("Advance order error:", err);
    res.status(500).json({ message: "Server error advancing order." });
  }
};
// ... (existing code)

export const createProduct = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) return res.status(401).json({ message: "Not authenticated." });

    const {
      category_id, name, description, sku, unit, stock_quantity,
      stock_status, requires_prescription, is_active, price_tiers
    } = req.body;

    if (!category_id || !name || !sku) {
      return res.status(400).json({ message: "Category, name, and SKU are required." });
    }

    const existing = await productRepo().findOne({ where: { sku } });
    if (existing) {
      return res.status(409).json({ message: "SKU already exists." });
    }

    const product = productRepo().create({
      supplier_id: supplierId,
      category_id,
      name,
      description: description || null,
      sku,
      unit: Object.values(ProductUnit).includes(unit) ? unit : ProductUnit.BOX,
      stock_quantity: Number.isFinite(stock_quantity) ? Number(stock_quantity) : 0,
      stock_status: Object.values(StockStatus).includes(stock_status) ? stock_status : StockStatus.IN_STOCK,
      requires_prescription: Boolean(requires_prescription),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    await productRepo().save(product);

    if (Array.isArray(price_tiers) && price_tiers.length > 0) {
      const tiers = price_tiers.map((tier) =>
        priceTierRepo().create({
          product_id: product.id,
          min_quantity: Number(tier.min_quantity),
          max_quantity: tier.max_quantity === null || tier.max_quantity === undefined ? null : Number(tier.max_quantity),
          price_per_unit: Number(tier.price_per_unit),
        })
      );
      await priceTierRepo().save(tiers);
    }

    const saved = await productRepo().findOne({
      where: { id: product.id },
      relations: ["category", "supplier", "price_tiers"],
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error creating product." });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) return res.status(401).json({ message: "Not authenticated." });

    const product = await productRepo().findOne({
      where: { id: req.params.id },
      relations: ["price_tiers"],
    });
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.supplier_id !== supplierId) return res.status(403).json({ message: "Not authorized." });

    const {
      category_id, name, description, sku, unit, stock_quantity,
      stock_status, requires_prescription, is_active, price_tiers
    } = req.body;

    if (category_id) product.category_id = category_id;
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (sku) product.sku = sku;
    if (unit && Object.values(ProductUnit).includes(unit)) product.unit = unit;
    if (stock_quantity !== undefined) product.stock_quantity = Number(stock_quantity);
    if (stock_status && Object.values(StockStatus).includes(stock_status)) product.stock_status = stock_status;
    if (requires_prescription !== undefined) product.requires_prescription = Boolean(requires_prescription);
    if (is_active !== undefined) product.is_active = Boolean(is_active);

    await productRepo().save(product);

    if (Array.isArray(price_tiers)) {
      await priceTierRepo().delete({ product_id: product.id });
      const tiers = price_tiers.map((tier) =>
        priceTierRepo().create({
          product_id: product.id,
          min_quantity: Number(tier.min_quantity),
          max_quantity: tier.max_quantity === null || tier.max_quantity === undefined ? null : Number(tier.max_quantity),
          price_per_unit: Number(tier.price_per_unit),
        })
      );
      await priceTierRepo().save(tiers);
    }

    const saved = await productRepo().findOne({
      where: { id: product.id },
      relations: ["category", "supplier", "price_tiers"],
    });

    res.status(200).json(saved);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error updating product." });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const supplierId = req.user?.id;
    if (!supplierId) return res.status(401).json({ message: "Not authenticated." });

    const product = await productRepo().findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.supplier_id !== supplierId) return res.status(403).json({ message: "Not authorized." });

    product.is_active = false; // soft delete
    await productRepo().save(product);

    res.status(200).json({ message: "Product deactivated." });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error deleting product." });
  }
};