import { AppDataSource } from "../config/data-source.js";
import { CartItemSchema } from "../entities/CartItem.js";
import { ProductSchema } from "../entities/Product.js";
import { PriceTierSchema } from "../entities/PriceTier.js";

const cartRepo = () => AppDataSource.getRepository(CartItemSchema);
const productRepo = () => AppDataSource.getRepository(ProductSchema);
const priceTierRepo = () => AppDataSource.getRepository(PriceTierSchema);

const getMoq = async (productId) => {
  const tiers = await priceTierRepo().find({ where: { product_id: productId } });
  if (!tiers.length) return 1;
  return Math.min(...tiers.map((tier) => Number(tier.min_quantity) || 1));
};

export const listCartItems = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const items = await cartRepo().find({
      where: { buyer_id: buyerId },
      relations: ["product", "product.price_tiers"],
      order: { added_at: "DESC" },
    });

    res.status(200).json(items);
  } catch (error) {
    console.error("List cart items error:", error);
    res.status(500).json({ message: "Server error fetching cart items." });
  }
};

export const addCartItem = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const { product_id, quantity } = req.body;
    const qty = Number(quantity);
    if (!product_id || !Number.isFinite(qty) || qty <= 0) {
      res.status(400).json({ message: "Product and valid quantity are required." });
      return;
    }

    const product = await productRepo().findOne({ where: { id: product_id, is_active: true } });
    if (!product) {
      res.status(404).json({ message: "Product not found or inactive." });
      return;
    }

    const moq = await getMoq(product_id);
    if (qty < moq) {
      res.status(400).json({ message: `MOQ for this product is ${moq}.` });
      return;
    }

    const existing = await cartRepo().findOne({ where: { buyer_id: buyerId, product_id } });
    if (existing) {
      existing.quantity += qty;
      await cartRepo().save(existing);
      res.status(200).json(existing);
      return;
    }

    const item = cartRepo().create({
      buyer_id: buyerId,
      product_id,
      quantity: qty,
    });

    await cartRepo().save(item);
    res.status(201).json(item);
  } catch (error) {
    console.error("Add cart item error:", error);
    res.status(500).json({ message: "Server error adding cart item." });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const { quantity } = req.body;
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      res.status(400).json({ message: "Valid quantity is required." });
      return;
    }

    const item = await cartRepo().findOne({ where: { id: req.params.id, buyer_id: buyerId } });
    if (!item) {
      res.status(404).json({ message: "Cart item not found." });
      return;
    }

    const moq = await getMoq(item.product_id);
    if (qty < moq) {
      res.status(400).json({ message: `MOQ for this product is ${moq}.` });
      return;
    }

    item.quantity = qty;
    await cartRepo().save(item);
    res.status(200).json(item);
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ message: "Server error updating cart item." });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const item = await cartRepo().findOne({ where: { id: req.params.id, buyer_id: buyerId } });
    if (!item) {
      res.status(404).json({ message: "Cart item not found." });
      return;
    }

    await cartRepo().remove(item);
    res.status(200).json({ message: "Cart item removed." });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ message: "Server error removing cart item." });
  }
};

export const clearCart = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    await cartRepo().delete({ buyer_id: buyerId });
    res.status(200).json({ message: "Cart cleared." });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Server error clearing cart." });
  }
};
