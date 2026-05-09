import { AppDataSource } from "../config/data-source.js";
import { CategorySchema } from "../entities/Category.js";

const categoryRepo = () => AppDataSource.getRepository(CategorySchema);

export const listCategories = async (_req, res) => {
  try {
    const categories = await categoryRepo().find({
      order: { name: "ASC" },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("List categories error:", error);
    res.status(500).json({ message: "Server error fetching categories." });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await categoryRepo().findOne({
      where: { id: req.params.id },
    });
    if (!category) {
      res.status(404).json({ message: "Category not found." });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({ message: "Server error fetching category." });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon_url, parent_id, is_active } = req.body;

    if (!name || !slug) {
      res.status(400).json({ message: "Name and slug are required." });
      return;
    }

    const existing = await categoryRepo().findOne({ where: [{ name }, { slug }] });
    if (existing) {
      res.status(409).json({ message: "Category name or slug already exists." });
      return;
    }

    const category = categoryRepo().create({
      name,
      slug,
      description: description || null,
      icon_url: icon_url || null,
      parent_id: parent_id || null,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
    });

    await categoryRepo().save(category);
    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Server error creating category." });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await categoryRepo().findOne({ where: { id: req.params.id } });
    if (!category) {
      res.status(404).json({ message: "Category not found." });
      return;
    }

    const { name, slug, description, icon_url, parent_id, is_active } = req.body;

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (icon_url !== undefined) category.icon_url = icon_url;
    if (parent_id !== undefined) category.parent_id = parent_id;
    if (is_active !== undefined) category.is_active = Boolean(is_active);

    await categoryRepo().save(category);
    res.status(200).json(category);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Server error updating category." });
  }
};
