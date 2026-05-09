import { AppDataSource } from "../config/data-source.js";
import { In } from "typeorm";
import { OrderSchema, OrderStatus } from "../entities/Order.js";
import { QuoteRequestSchema, QuoteStatus } from "../entities/QuoteRequest.js";

const orderRepo = () => AppDataSource.getRepository(OrderSchema);
const quoteRepo = () => AppDataSource.getRepository(QuoteRequestSchema);

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const isSupplier = role === "supplier";
    const isBuyer = role === "buyer";
    const isAdmin = role === "admin";

    const orderWhere = isSupplier
      ? { supplier_id: userId }
      : isBuyer
      ? { buyer_id: userId }
      : {};

    const recentOrders = await orderRepo().find({
      where: orderWhere,
      relations: ["items", "buyer", "supplier"],
      order: { placed_at: "DESC" },
      take: 5,
    });

    const pendingOrderStatus = [OrderStatus.PLACED, OrderStatus.CONFIRMED];
    const pendingOrders = await orderRepo().count({
      where: isSupplier
        ? { supplier_id: userId, status: In(pendingOrderStatus) }
        : isBuyer
        ? { buyer_id: userId, status: In(pendingOrderStatus) }
        : { status: In(pendingOrderStatus) },
    });

    const pendingQuotes = await quoteRepo().count({
      where: isSupplier
        ? { supplier_id: userId, status: QuoteStatus.PENDING }
        : isBuyer
        ? { buyer_id: userId, status: QuoteStatus.PENDING }
        : { status: QuoteStatus.PENDING },
    });

    const revenueResult = await orderRepo()
      .createQueryBuilder("orders")
      .select("COALESCE(SUM(orders.total_amount), 0)", "total")
      .where(isSupplier ? "orders.supplier_id = :userId" : "1=1", { userId })
      .andWhere(isBuyer ? "orders.buyer_id = :userId" : "1=1", { userId })
      .getRawOne();

    res.status(200).json({
      recent_orders: recentOrders,
      pending_orders: pendingOrders,
      pending_quotes: pendingQuotes,
      total_revenue: Number(revenueResult?.total || 0),
      role,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ message: "Server error fetching dashboard summary." });
  }
};
