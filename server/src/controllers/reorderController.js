import { AppDataSource } from "../config/data-source.js";
import { OrderSchema } from "../entities/Order.js";
import { OrderItemSchema } from "../entities/OrderItem.js";
import { CartItemSchema } from "../entities/CartItem.js";

const orderRepo = () => AppDataSource.getRepository(OrderSchema);
const cartRepo = () => AppDataSource.getRepository(CartItemSchema);
const orderItemRepo = () => AppDataSource.getRepository(OrderItemSchema);

export const reorderFromOrder = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const order = await orderRepo().findOne({
      where: { id: req.params.id, buyer_id: buyerId },
      relations: ["items"],
    });
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    const items = await orderItemRepo().find({ where: { order_id: order.id } });
    if (items.length === 0) {
      res.status(400).json({ message: "Order has no items to reorder." });
      return;
    }

    const cartItems = items.map((item) =>
      cartRepo().create({
        buyer_id: buyerId,
        product_id: item.product_id,
        quantity: item.quantity,
      })
    );

    await cartRepo().save(cartItems);

    res.status(201).json({ message: "Items added to cart for reorder." });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ message: "Server error reordering items." });
  }
};
