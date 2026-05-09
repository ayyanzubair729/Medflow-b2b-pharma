import { AppDataSource } from "../config/data-source.js";
import { OrderSchema, OrderStatus } from "../entities/Order.js";
import { OrderItemSchema } from "../entities/OrderItem.js";
import { CartItemSchema } from "../entities/CartItem.js";
import { ProductSchema } from "../entities/Product.js";

const orderRepo = (manager) => (manager || AppDataSource.manager).getRepository(OrderSchema);
const orderItemRepo = (manager) => (manager || AppDataSource.manager).getRepository(OrderItemSchema);
const cartRepo = (manager) => (manager || AppDataSource.manager).getRepository(CartItemSchema);
const productRepo = (manager) => (manager || AppDataSource.manager).getRepository(ProductSchema);

const resolveUnitPrice = (product, quantity) => {
  if (!product.price_tiers || product.price_tiers.length === 0) {
    return null;
  }

  const tier = product.price_tiers
    .filter((t) => quantity >= t.min_quantity && (t.max_quantity === null || quantity <= t.max_quantity))
    .sort((a, b) => b.min_quantity - a.min_quantity)[0];

  return tier ? Number(tier.price_per_unit) : null;
};

const normalizeStatus = (status) => {
  if (!status) return null;
  const normalized = String(status).toLowerCase();
  const values = Object.values(OrderStatus);
  return values.includes(normalized) ? normalized : null;
};

export const listOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const where = role === "supplier" ? { supplier_id: userId } : role === "admin" ? {} : { buyer_id: userId };

    const orders = await orderRepo().find({
      where,
      relations: ["items", "items.product", "buyer", "supplier"],
      order: { placed_at: "DESC" },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({ message: "Server error fetching orders." });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const order = await orderRepo().findOne({
      where: { id: req.params.id },
      relations: ["items", "items.product", "buyer", "supplier"],
    });

    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    const isOwner = order.buyer_id === userId || order.supplier_id === userId || role === "admin";
    if (!isOwner) {
      res.status(403).json({ message: "Not authorized to view this order." });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error fetching order." });
  }
};

export const createOrderFromCart = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const { delivery_address, notes } = req.body;

    const cartItems = await cartRepo().find({
      where: { buyer_id: buyerId },
      relations: ["product", "product.price_tiers"],
      order: { added_at: "ASC" },
    });

    if (cartItems.length === 0) {
      res.status(400).json({ message: "Cart is empty." });
      return;
    }

    const grouped = cartItems.reduce((acc, item) => {
      const supplierId = item.product?.supplier_id;
      if (!supplierId) return acc;
      acc[supplierId] = acc[supplierId] || [];
      acc[supplierId].push(item);
      return acc;
    }, {});

    const results = await AppDataSource.transaction(async (manager) => {
      const createdOrders = [];

      for (const [supplierId, items] of Object.entries(grouped)) {
        let total = 0;
        const order = orderRepo(manager).create({
          buyer_id: buyerId,
          supplier_id: supplierId,
          status: OrderStatus.PLACED,
          total_amount: 0,
          delivery_address: delivery_address || null,
          notes: notes || null,
        });

        await orderRepo(manager).save(order);

        const orderItems = [];
        for (const cartItem of items) {
          const product = cartItem.product;
          if (!product || !product.is_active) {
            throw new Error("Inactive product in cart");
          }

          const unitPrice = resolveUnitPrice(product, cartItem.quantity);
          if (unitPrice === null) {
            throw new Error("No applicable price tier for product");
          }

          const subtotal = unitPrice * cartItem.quantity;
          total += subtotal;

          orderItems.push(
            orderItemRepo(manager).create({
              order_id: order.id,
              product_id: product.id,
              quantity: cartItem.quantity,
              unit_price: unitPrice,
              subtotal,
            })
          );
        }

        await orderItemRepo(manager).save(orderItems);

        order.total_amount = total;
        await orderRepo(manager).save(order);

        createdOrders.push(order);
      }

      await cartRepo(manager).delete({ buyer_id: buyerId });

      return createdOrders;
    });

    res.status(201).json({ orders: results });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error creating order." });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const status = normalizeStatus(req.body.status);
    if (!status) {
      res.status(400).json({ message: "Invalid status provided." });
      return;
    }

    const order = await orderRepo().findOne({ where: { id: req.params.id } });
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    const isSupplier = role === "supplier" && order.supplier_id === userId;
    const isAdmin = role === "admin";
    if (!isSupplier && !isAdmin) {
      res.status(403).json({ message: "Not authorized to update this order." });
      return;
    }

    order.status = status;
    await orderRepo().save(order);

    res.status(200).json(order);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error updating order status." });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const order = await orderRepo().findOne({ where: { id: req.params.id } });
    if (!order) {
      res.status(404).json({ message: "Order not found." });
      return;
    }

    if (order.buyer_id !== userId) {
      res.status(403).json({ message: "Not authorized to cancel this order." });
      return;
    }

    if (![OrderStatus.DRAFT, OrderStatus.PLACED, OrderStatus.CONFIRMED].includes(order.status)) {
      res.status(400).json({ message: "Order cannot be cancelled in its current status." });
      return;
    }

    order.status = OrderStatus.CANCELLED;
    await orderRepo().save(order);

    res.status(200).json(order);
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error cancelling order." });
  }
};
