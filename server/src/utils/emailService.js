import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@medflow.pk",
    to,
    subject,
    html,
  });
};

export const orderStatusEmail = async (order, buyerEmail) => {
  const status = order.status;
  const subject = `Order ${order.id} is now ${status}`;
  const html = `<p>Your order <strong>${order.id}</strong> has been updated to <strong>${status}</strong>.</p>`;
  await sendEmail({ to: buyerEmail, subject, html });
};

export const quoteResponseEmail = async (quote, buyerEmail) => {
  const subject = `Quote ${quote.id} has been responded`;
  const html = `<p>Your quote request for <strong>${quote.product?.name}</strong> has been responded with price PKR ${quote.quoted_price}.</p>`;
  await sendEmail({ to: buyerEmail, subject, html });
};