import { AppDataSource } from "../config/data-source.js";
import { ProductSchema, StockStatus, ProductUnit } from "../entities/Product.js";
import { PriceTierSchema } from "../entities/PriceTier.js";

const productRepo = () => AppDataSource.getRepository(ProductSchema);
const priceTierRepo = () => AppDataSource.getRepository(PriceTierSchema);

const allowedSortFields = new Set(["created_at", "name", "stock_quantity"]);

const parseSort = (sortBy, sortOrder) => {
  const field = allowedSortFields.has(sortBy) ? sortBy : "created_at";
  const order = sortOrder && sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";
  return { field, order };
};

export const listProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      supplier,
      stock_status,
      price_min,
      price_max,
      sort_by,
      sort_order,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const { field, order } = parseSort(sort_by, sort_order);

    const qb = productRepo()
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.supplier", "supplier")
      .leftJoinAndSelect("product.price_tiers", "price_tiers")
      .where("product.is_active = :active", { active: true });

    if (search) {
      qb.andWhere(
        "(product.name ILIKE :search OR product.sku ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    if (category) {
      qb.andWhere("product.category_id = :category", { category });
    }

    if (supplier) {
      qb.andWhere("product.supplier_id = :supplier", { supplier });
    }

    if (stock_status) {
      qb.andWhere("product.stock_status = :stock_status", { stock_status });
    }

    if (price_min || price_max) {
      const min = price_min ? parseFloat(price_min) : 0;
      const max = price_max ? parseFloat(price_max) : Number.MAX_SAFE_INTEGER;
      qb.andWhere("price_tiers.price_per_unit BETWEEN :min AND :max", {
        min,
        max,
      });
    }

    qb.orderBy(`product.${field}`, order).skip((pageNumber - 1) * pageSize).take(pageSize).distinct(true);

    const [items, total] = await qb.getManyAndCount();

    res.status(200).json({
      items,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("List products error:", error);
    res.status(500).json({ message: "Server error fetching products." });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productRepo().findOne({
      where: { id: req.params.id },
      relations: ["category", "supplier", "price_tiers"],
    });

    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error fetching product." });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      sku,
      unit,
      stock_quantity,
      stock_status,
      requires_prescription,
      is_active,
      price_tiers,
    } = req.body;

    const supplierId = req.user?.id;
    if (!supplierId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    if (!category_id || !name || !sku) {
      res.status(400).json({ message: "Category, name, and SKU are required." });
      return;
    }

    const existing = await productRepo().findOne({ where: { sku } });
    if (existing) {
      res.status(409).json({ message: "SKU already exists." });
      return;
    }

    const product = productRepo().create({
      supplier_id: supplierId,
      category_id,
      name,
      description: description || null,
      sku,
      unit: Object.values(ProductUnit).includes(unit) ? unit : ProductUnit.BOX,
      stock_quantity: Number.isFinite(stock_quantity) ? Number(stock_quantity) : 0,
      stock_status: Object.values(StockStatus).includes(stock_status)
        ? stock_status
        : StockStatus.IN_STOCK,
      requires_prescription: Boolean(requires_prescription),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    await productRepo().save(product);

    if (Array.isArray(price_tiers) && price_tiers.length > 0) {
      const tiers = price_tiers.map((tier) =>
        priceTierRepo().create({
          product_id: product.id,
          min_quantity: Number(tier.min_quantity),
          max_quantity: tier.max_quantity === null || tier.max_quantity === undefined
            ? null
            : Number(tier.max_quantity),
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
    const product = await productRepo().findOne({
      where: { id: req.params.id },
      relations: ["price_tiers"],
    });
    if (!product) {
      res.status(404).json({ message: "Product not found." });
      return;
    }

    const supplierId = req.user?.id;
    if (!supplierId || product.supplier_id !== supplierId) {
      res.status(403).json({ message: "Not authorized to update this product." });
      return;
    }

    const {
      category_id,
      name,
      description,
      sku,
      unit,
      stock_quantity,
      stock_status,
      requires_prescription,
      is_active,
      price_tiers,
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
          max_quantity: tier.max_quantity === null || tier.max_quantity === undefined
            ? null
            : Number(tier.max_quantity),
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
