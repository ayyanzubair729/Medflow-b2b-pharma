import { AppDataSource } from "../config/data-source.js";
import { QuoteRequestSchema, QuoteStatus } from "../entities/QuoteRequest.js";
import { ProductSchema } from "../entities/Product.js";
import { quoteResponseEmail } from "../utils/emailService.js";

const quoteRepo = () => AppDataSource.getRepository(QuoteRequestSchema);
const productRepo = () => AppDataSource.getRepository(ProductSchema);

const normalizeStatus = (status) => {
  if (!status) return null;
  const normalized = String(status).toLowerCase();
  const values = Object.values(QuoteStatus);
  return values.includes(normalized) ? normalized : null;
};

export const listQuotes = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const where = role === "supplier" ? { supplier_id: userId } : role === "admin" ? {} : { buyer_id: userId };

    const quotes = await quoteRepo().find({
      where,
      relations: ["product", "buyer", "supplier"],
      order: { created_at: "DESC" },
    });

    res.status(200).json(quotes);
  } catch (error) {
    console.error("List quotes error:", error);
    res.status(500).json({ message: "Server error fetching quotes." });
  }
};

export const getQuoteById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const quote = await quoteRepo().findOne({
      where: { id: req.params.id },
      relations: ["product", "buyer", "supplier"],
    });

    if (!quote) {
      res.status(404).json({ message: "Quote request not found." });
      return;
    }

    const isOwner = quote.buyer_id === userId || quote.supplier_id === userId || role === "admin";
    if (!isOwner) {
      res.status(403).json({ message: "Not authorized to view this quote." });
      return;
    }

    res.status(200).json(quote);
  } catch (error) {
    console.error("Get quote error:", error);
    res.status(500).json({ message: "Server error fetching quote." });
  }
};

export const createQuote = async (req, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const { product_id, quantity_requested, message } = req.body;
    const qty = Number(quantity_requested);
    if (!product_id || !Number.isFinite(qty) || qty <= 0) {
      res.status(400).json({ message: "Product and valid quantity are required." });
      return;
    }

    const product = await productRepo().findOne({
      where: { id: product_id, is_active: true },
      relations: ["supplier"],
    });
    if (!product) {
      res.status(404).json({ message: "Product not found or inactive." });
      return;
    }

    const quote = quoteRepo().create({
      buyer_id: buyerId,
      supplier_id: product.supplier_id,
      product_id,
      quantity_requested: qty,
      message: message || null,
      status: QuoteStatus.PENDING,
    });

    await quoteRepo().save(quote);

    const saved = await quoteRepo().findOne({
      where: { id: quote.id },
      relations: ["product", "buyer", "supplier"],
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error("Create quote error:", error);
    res.status(500).json({ message: "Server error creating quote." });
  }
};

export const respondToQuote = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const quote = await quoteRepo().findOne({
      where: { id: req.params.id },
      relations: ["product", "buyer", "supplier"],
    });
    if (!quote) {
      res.status(404).json({ message: "Quote request not found." });
      return;
    }

    if (role !== "supplier" || quote.supplier_id !== userId) {
      res.status(403).json({ message: "Not authorized to respond to this quote." });
      return;
    }

    let status = normalizeStatus(req.body.status);
    if (!status && req.body.quoted_price) {
      status = QuoteStatus.RESPONDED;
    }
    if (![QuoteStatus.RESPONDED, QuoteStatus.REJECTED].includes(status)) {
      res.status(400).json({ message: "Status must be responded or rejected." });
      return;
    }

    if (status === QuoteStatus.RESPONDED) {
      const quotedPrice = Number(req.body.quoted_price);
      if (!Number.isFinite(quotedPrice) || quotedPrice <= 0) {
        res.status(400).json({ message: "Valid quoted_price is required." });
        return;
      }
      quote.quoted_price = quotedPrice;
      quote.supplier_response = req.body.supplier_response || null;
    } else {
      quote.quoted_price = null;
      quote.supplier_response = req.body.supplier_response || null;
    }

    quote.status = status;
    await quoteRepo().save(quote);

    // Send email notification to buyer
    const buyerEmail = quote.buyer?.email;
    if (buyerEmail) {
      quoteResponseEmail(quote, buyerEmail).catch(err => 
        console.error("Failed to send quote response email:", err)
      );
    }

    res.status(200).json(quote);
  } catch (error) {
    console.error("Respond quote error:", error);
    res.status(500).json({ message: "Server error responding to quote." });
  }
};

export const acceptQuote = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const quote = await quoteRepo().findOne({
      where: { id: req.params.id },
    });
    if (!quote) {
      res.status(404).json({ message: "Quote request not found." });
      return;
    }

    if (quote.buyer_id !== userId) {
      res.status(403).json({ message: "Not authorized to accept this quote." });
      return;
    }

    if (quote.status !== QuoteStatus.RESPONDED) {
      res.status(400).json({ message: "Quote must be responded before accepting." });
      return;
    }

    quote.status = QuoteStatus.ACCEPTED;
    await quoteRepo().save(quote);

    res.status(200).json(quote);
  } catch (error) {
    console.error("Accept quote error:", error);
    res.status(500).json({ message: "Server error accepting quote." });
  }
};

export const rejectQuote = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }

    const quote = await quoteRepo().findOne({
      where: { id: req.params.id },
    });
    if (!quote) {
      res.status(404).json({ message: "Quote request not found." });
      return;
    }

    if (quote.buyer_id !== userId) {
      res.status(403).json({ message: "Not authorized to reject this quote." });
      return;
    }

    if (quote.status === QuoteStatus.ACCEPTED) {
      res.status(400).json({ message: "Accepted quotes cannot be rejected." });
      return;
    }

    quote.status = QuoteStatus.REJECTED;
    await quoteRepo().save(quote);

    res.status(200).json(quote);
  } catch (error) {
    console.error("Reject quote error:", error);
    res.status(500).json({ message: "Server error rejecting quote." });
  }
};