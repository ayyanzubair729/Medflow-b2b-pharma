import { apiFetch } from "./client.js";

export const listCartItems = async () => apiFetch("/api/cart");

export const addCartItem = async ({ product_id, quantity }) =>
  apiFetch("/api/cart", {
    method: "POST",
    body: JSON.stringify({ product_id, quantity }),
  });

export const updateCartItem = async ({ id, quantity }) =>
  apiFetch(`/api/cart/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });

export const removeCartItem = async (id) =>
  apiFetch(`/api/cart/${id}`, {
    method: "DELETE",
  });

export const clearCart = async () =>
  apiFetch("/api/cart", {
    method: "DELETE",
  });
