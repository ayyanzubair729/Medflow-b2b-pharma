import PDFDocument from "pdfkit";

export const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();
    doc.fontSize(10).text(`Order ID: ${order.id}`);
    doc.text(`Date: ${new Date(order.placed_at).toLocaleDateString()}`);
    doc.text(`Buyer: ${order.buyer?.business_name || "N/A"}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();

    // Items table
    doc.fontSize(10).text("Item", 50, doc.y, { width: 200, continued: true });
    doc.text("Qty", 250, doc.y, { width: 50, continued: true });
    doc.text("Unit Price", 300, doc.y, { width: 80, continued: true });
    doc.text("Subtotal", 400, doc.y);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    let y = doc.y;
    order.items?.forEach(item => {
      doc.text(item.product?.name || "Product", 50, y, { width: 200 });
      doc.text(item.quantity.toString(), 250, y, { width: 50 });
      doc.text(`PKR ${item.unit_price}`, 300, y, { width: 80 });
      doc.text(`PKR ${item.subtotal}`, 400, y);
      y += 20;
    });

    doc.moveDown(2);
    doc.fontSize(12).text(`Total: PKR ${order.total_amount}`, { align: "right" });

    doc.end();
  });
};