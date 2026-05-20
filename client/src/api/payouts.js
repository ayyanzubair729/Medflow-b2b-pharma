import { apiFetch, apiFetchBlob } from "./client.js";

export const listInvoices = async () => apiFetch("/api/payouts/invoices");

export const downloadInvoicePdf = async (invoiceId) =>
  apiFetchBlob(`/api/payouts/invoices/${invoiceId}/pdf`);
