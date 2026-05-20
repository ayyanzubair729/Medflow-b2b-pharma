import PDFDocument from "pdfkit";

const COLORS = {
  primary: "#1e3a5f",
  accent: "#0d9488",
  lightGray: "#f1f5f9",
  mediumGray: "#94a3b8",
  darkGray: "#334155",
  black: "#0f172a",
  white: "#ffffff",
};

const MARGIN = 50;
const FOOTER_HEIGHT = 70;

function drawHeaderBar(doc) {
  doc.rect(0, 0, doc.page.width, 130).fill(COLORS.primary);
  doc.fillColor(COLORS.white).fontSize(28).font("Helvetica-Bold")
    .text("INVOICE", MARGIN, 35);
  doc.fontSize(11).font("Helvetica")
    .text("MedFlow — B2B Pharmaceutical Platform", MARGIN, 72);
  doc.text("Blue Area, Islamabad, Pakistan", MARGIN, 88);
  doc.text("support@medflow.pk | +92 318 5411636", MARGIN, 104);
}

function drawFooter(doc) {
  const fy = doc.page.height - FOOTER_HEIGHT;
  doc.rect(0, fy, doc.page.width, FOOTER_HEIGHT).fill(COLORS.primary);
  doc.fillColor(COLORS.white).fontSize(8).font("Helvetica");
  doc.text("MedFlow — Secure B2B Pharma Procurement", MARGIN, fy + 12, { align: "center" });
  doc.text("Blue Area, Islamabad, Pakistan | support@medflow.pk | +92 318 5411636", MARGIN, fy + 26, { align: "center" });
  doc.text("Thank you for your business.", MARGIN, fy + 40, { align: "center" });
}

function drawTableHeader(doc, pw, y) {
  doc.rect(MARGIN, y, pw, 24).fill(COLORS.accent);
  doc.fillColor(COLORS.white).fontSize(10).font("Helvetica-Bold");
  doc.text("#", MARGIN + 10, y + 6, { width: 30 });
  doc.text("Item", MARGIN + 40, y + 6, { width: 180 });
  doc.text("Qty", MARGIN + 230, y + 6, { width: 50, align: "center" });
  doc.text("Unit Price", MARGIN + 290, y + 6, { width: 80, align: "right" });
  doc.text("Subtotal", MARGIN + 390, y + 6, { width: 90, align: "right" });
}

function shortId(id) {
  if (!id) return "—";
  return id.length > 10 ? id.slice(0, 10) + "…" : id;
}

export const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4" });
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pw = doc.page.width - MARGIN * 2;
    const rx = doc.page.width - MARGIN;
    const breakY = () => doc.page.height - MARGIN - FOOTER_HEIGHT - 20;

    let cy = 0;

    function newPage() {
      doc.addPage();
      drawHeaderBar(doc);
      cy = 160;
    }

    function pageBreak(n) {
      if (cy + n > breakY()) {
        drawFooter(doc);
        newPage();
        drawTableHeader(doc, pw, cy);
        cy += 30;
      }
    }

    // ── Page 1 ──
    drawHeaderBar(doc);

    // Right-aligned meta inside header bar — constrain width so long UUIDs don't overflow
    doc.fontSize(9).font("Helvetica").fillColor(COLORS.white);
    doc.text(`Invoice #: ${shortId(order.id)}`, MARGIN, 130, { width: pw, align: "right" });
    doc.text(`Date: ${new Date(order.placed_at).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}`, MARGIN, 142, { width: pw, align: "right" });
    doc.text(`Status: ${(order.status || "pending").toUpperCase()}`, MARGIN, 154, { width: pw, align: "right" });

    // ── Buyer / Supplier info ──
    cy = 180;
    doc.fillColor(COLORS.black).fontSize(11).font("Helvetica-Bold")
      .text("Bill To", MARGIN, cy);
    cy += 16;
    doc.fontSize(10).font("Helvetica")
      .text(order.buyer?.business_name || "Buyer", MARGIN, cy);
    cy += 14;
    doc.fontSize(9).fillColor(COLORS.darkGray)
      .text(`Email: ${order.buyer?.email || "—"}`, MARGIN, cy);
    cy += 14;
    doc.text(`Phone: ${order.buyer?.phone || "—"}`, MARGIN, cy);
    cy += 14;
    doc.text(`Address: ${order.buyer?.address || "—"}`, MARGIN, cy);

    if (order.supplier) {
      let sy = 180;
      doc.fillColor(COLORS.black).fontSize(11).font("Helvetica-Bold")
        .text("Supplied By", rx, sy, { align: "right" });
      sy += 16;
      doc.fontSize(10).font("Helvetica")
        .text(order.supplier.business_name || "Supplier", rx, sy, { align: "right" });
      sy += 14;
      doc.fontSize(9).fillColor(COLORS.darkGray)
        .text(`Email: ${order.supplier.email || "—"}`, rx, sy, { align: "right" });
      sy += 14;
      doc.text(`Phone: ${order.supplier.phone || "—"}`, rx, sy, { align: "right" });
    }

    // ── Items table ──
    cy += 40;
    pageBreak(24);
    drawTableHeader(doc, pw, cy);
    cy += 30;

    doc.font("Helvetica").fontSize(9).fillColor(COLORS.black);
    (order.items || []).forEach((item, i) => {
      pageBreak(22);
      const bg = i % 2 === 0 ? COLORS.lightGray : COLORS.white;
      doc.rect(MARGIN, cy - 4, pw, 22).fill(bg);
      doc.fillColor(COLORS.black);
      doc.text(String(i + 1), MARGIN + 10, cy, { width: 30 });
      doc.text(item.product?.name || "Product", MARGIN + 40, cy, { width: 180 });
      doc.text(String(item.quantity), MARGIN + 230, cy, { width: 50, align: "center" });
      doc.text(`PKR ${Number(item.unit_price).toLocaleString()}`, MARGIN + 290, cy, { width: 80, align: "right" });
      doc.text(`PKR ${Number(item.subtotal).toLocaleString()}`, MARGIN + 390, cy, { width: 90, align: "right" });
      cy += 22;
    });

    // ── Totals ──
    cy += 8;
    pageBreak(90);
    doc.rect(MARGIN + 290, cy, 190, 60).fill(COLORS.lightGray);
    doc.fillColor(COLORS.darkGray).fontSize(9).font("Helvetica");
    doc.text("Subtotal:", MARGIN + 300, cy + 6, { width: 80, align: "left" });
    doc.text(`PKR ${Number(order.total_amount).toLocaleString()}`, MARGIN + 390, cy + 6, { width: 80, align: "right" });
    doc.text("Tax (0%):", MARGIN + 300, cy + 22, { width: 80, align: "left" });
    doc.text("PKR 0", MARGIN + 390, cy + 22, { width: 80, align: "right" });

    cy += 42;
    doc.rect(MARGIN + 290, cy, 190, 28).fill(COLORS.accent);
    doc.fillColor(COLORS.white).fontSize(12).font("Helvetica-Bold");
    doc.text("Total:", MARGIN + 300, cy + 6, { width: 80, align: "left" });
    doc.text(`PKR ${Number(order.total_amount).toLocaleString()}`, MARGIN + 390, cy + 6, { width: 80, align: "right" });

    drawFooter(doc);
    doc.end();
  });
};