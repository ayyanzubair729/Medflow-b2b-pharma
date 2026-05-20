import { AppDataSource } from "../config/data-source.js";
import { UserSchema, UserRole } from "../entities/User.js";
import { ProductSchema } from "../entities/Product.js";
import { OrderSchema, OrderStatus } from "../entities/Order.js";
import { QuoteRequestSchema } from "../entities/QuoteRequest.js";
import { ReturnRequestSchema } from "../entities/ReturnRequest.js";

const userRepo = () => AppDataSource.getRepository(UserSchema);
const productRepo = () => AppDataSource.getRepository(ProductSchema);
const orderRepo = () => AppDataSource.getRepository(OrderSchema);
const quoteRepo = () => AppDataSource.getRepository(QuoteRequestSchema);
const returnRepo = () => AppDataSource.getRepository(ReturnRequestSchema);

const parsePageParams = (page, limit) => {
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  return { pageNumber, pageSize };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    business_name: user.business_name,
    license_number: user.license_number,
    phone: user.phone,
    address: user.address,
    is_verified: user.is_verified,
    is_active: user.is_active,
    created_at: user.created_at,
  };
};

export const getAdminOverview = async (_req, res) => {
  try {
    const [
      total_users,
      total_buyers,
      total_suppliers,
      total_products,
      total_orders,
      total_quotes,
      pending_verifications,
    ] = await Promise.all([
      userRepo().count(),
      userRepo().count({ where: { role: UserRole.BUYER } }),
      userRepo().count({ where: { role: UserRole.SUPPLIER } }),
      productRepo().count(),
      orderRepo().count(),
      quoteRepo().count(),
      userRepo().count({
        where: { role: UserRole.SUPPLIER, is_verified: false, is_active: true },
      }),
    ]);

    const revenueResult = await orderRepo()
      .createQueryBuilder("orders")
      .select("COALESCE(SUM(orders.total_amount), 0)", "total")
      .where("orders.status = :status", { status: OrderStatus.DELIVERED })
      .getRawOne();

    const recent_orders_raw = await orderRepo().find({
      relations: ["buyer", "supplier", "items", "items.product"],
      order: { placed_at: "DESC" },
      take: 5,
    });

    const recent_returns_raw = await returnRepo().find({
      relations: ["order", "buyer", "supplier"],
      order: { created_at: "DESC" },
      take: 5,
    });

    const recent_pending_suppliers_raw = await userRepo().find({
      where: { role: UserRole.SUPPLIER, is_verified: false, is_active: true },
      order: { created_at: "DESC" },
      take: 5,
    });

    const recent_orders = recent_orders_raw.map((order) => ({
      ...order,
      buyer: sanitizeUser(order.buyer),
      supplier: sanitizeUser(order.supplier),
    }));

    const recent_returns = recent_returns_raw.map((rma) => ({
      ...rma,
      buyer: sanitizeUser(rma.buyer),
      supplier: sanitizeUser(rma.supplier),
    }));

    const recent_pending_suppliers = recent_pending_suppliers_raw.map(sanitizeUser);

    res.status(200).json({
      totals: {
        users: total_users,
        buyers: total_buyers,
        suppliers: total_suppliers,
        products: total_products,
        orders: total_orders,
        quotes: total_quotes,
        revenue: Number(revenueResult?.total || 0),
        pending_verifications,
      },
      recent_orders,
      recent_returns,
      recent_pending_suppliers,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { role, search, active, verified, page, limit } = req.query;
    const { pageNumber, pageSize } = parsePageParams(page, limit);

    const qb = userRepo().createQueryBuilder("user");

    if (role) qb.andWhere("user.role = :role", { role });

    if (active !== undefined) {
      qb.andWhere("user.is_active = :active", { active: active === "true" });
    }

    if (verified !== undefined) {
      qb.andWhere("user.is_verified = :verified", { verified: verified === "true" });
    }

    if (search) {
      qb.andWhere(
        "(user.email ILIKE :search OR user.business_name ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    qb.orderBy("user.created_at", "DESC").skip((pageNumber - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    const safeItems = items.map(sanitizeUser);
    res.status(200).json({
      items: safeItems,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const user = await userRepo().findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (req.body.is_active === undefined) {
      return res.status(400).json({ message: "is_active is required." });
    }

    user.is_active = Boolean(req.body.is_active);
    await userRepo().save(user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const listSuppliersAdmin = async (req, res) => {
  try {
    const { status = "all", search } = req.query;
    const qb = userRepo()
      .createQueryBuilder("user")
      .where("user.role = :role", { role: UserRole.SUPPLIER });

    if (status === "pending") {
      qb.andWhere("user.is_verified = false").andWhere("user.is_active = true");
    } else if (status === "verified") {
      qb.andWhere("user.is_verified = true").andWhere("user.is_active = true");
    } else if (status === "inactive") {
      qb.andWhere("user.is_active = false");
    }

    if (search) {
      qb.andWhere(
        "(user.email ILIKE :search OR user.business_name ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    qb.orderBy("user.created_at", "DESC");

    const suppliers = await qb.getMany();
    res.status(200).json(suppliers.map(sanitizeUser));
  } catch (error) {
    console.error("List suppliers admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const listProductsAdmin = async (req, res) => {
  try {
    const { search, status, supplier, category, page, limit } = req.query;
    const { pageNumber, pageSize } = parsePageParams(page, limit);

    const qb = productRepo()
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.supplier", "supplier")
      .leftJoinAndSelect("product.price_tiers", "price_tiers");

    if (status === "active") qb.andWhere("product.is_active = true");
    if (status === "inactive") qb.andWhere("product.is_active = false");
    if (supplier) qb.andWhere("product.supplier_id = :supplier", { supplier });
    if (category) qb.andWhere("product.category_id = :category", { category });

    if (search) {
      qb.andWhere(
        "(product.name ILIKE :search OR product.sku ILIKE :search OR supplier.business_name ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    qb.orderBy("product.created_at", "DESC").skip((pageNumber - 1) * pageSize).take(pageSize).distinct(true);

    const [items, total] = await qb.getManyAndCount();
    const safeItems = items.map((product) => ({
      ...product,
      supplier: sanitizeUser(product.supplier),
    }));
    res.status(200).json({
      items: safeItems,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("List products admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateProductStatus = async (req, res) => {
  try {
    const product = await productRepo().findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: "Product not found." });

    if (req.body.is_active === undefined) {
      return res.status(400).json({ message: "is_active is required." });
    }

    product.is_active = Boolean(req.body.is_active);
    await productRepo().save(product);
    res.status(200).json(product);
  } catch (error) {
    console.error("Update product status error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const listReturnsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const returnsRaw = await returnRepo().find({
      where,
      relations: ["order", "buyer", "supplier"],
      order: { created_at: "DESC" },
    });
    const returns = returnsRaw.map((rma) => ({
      ...rma,
      buyer: sanitizeUser(rma.buyer),
      supplier: sanitizeUser(rma.supplier),
    }));
    res.status(200).json(returns);
  } catch (error) {
    console.error("List returns admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateReturnStatusAdmin = async (req, res) => {
  try {
    const rma = await returnRepo().findOne({ where: { id: req.params.id } });
    if (!rma) return res.status(404).json({ message: "RMA not found." });

    const { status } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    rma.status = status;
    await returnRepo().save(rma);
    res.status(200).json(rma);
  } catch (error) {
    console.error("Update return status admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const cancelOrderAdmin = async (req, res) => {
  try {
    const order = await orderRepo().findOne({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ message: "Order not found." });

    order.status = OrderStatus.CANCELLED;
    await orderRepo().save(order);
    res.status(200).json(order);
  } catch (error) {
    console.error("Cancel order admin error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const listUnverifiedSuppliers = async (_req, res) => {
  try {
    const suppliers = await userRepo().find({
      where: { role: UserRole.SUPPLIER, is_verified: false, is_active: true },
    });
    res.json(suppliers.map(sanitizeUser));
  } catch (error) {
    console.error("List unverified suppliers error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const verifySupplier = async (req, res) => {
  try {
    const user = await userRepo().findOne({ where: { id: req.params.id, role: UserRole.SUPPLIER } });
    if (!user) return res.status(404).json({ message: "Supplier not found." });
    user.is_verified = true;
    user.is_active = true;
    await userRepo().save(user);
    res.json({ message: "Supplier verified." });
  } catch (error) {
    console.error("Verify supplier error:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const rejectSupplier = async (req, res) => {
  try {
    const user = await userRepo().findOne({ where: { id: req.params.id, role: UserRole.SUPPLIER } });
    if (!user) return res.status(404).json({ message: "Supplier not found." });
    user.is_active = false;
    await userRepo().save(user);
    res.json({ message: "Supplier rejected/deactivated." });
  } catch (error) {
    console.error("Reject supplier error:", error);
    res.status(500).json({ message: "Server error." });
  }
};