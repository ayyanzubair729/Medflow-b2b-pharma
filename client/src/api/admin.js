import { apiFetch } from "./client.js";

const buildQuery = (params = {}) => {
	const query = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === "") return;
		query.set(key, String(value));
	});
	const queryString = query.toString();
	return queryString ? `?${queryString}` : "";
};

export const getAdminOverview = async () => apiFetch("/api/admin/overview");

export const listUsers = async (params = {}) =>
	apiFetch(`/api/admin/users${buildQuery(params)}`);

export const updateUserStatus = async (id, is_active) =>
	apiFetch(`/api/admin/users/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify({ is_active }),
	});

export const listSuppliersAdmin = async (params = {}) =>
	apiFetch(`/api/admin/suppliers${buildQuery(params)}`);

export const verifySupplierAdmin = async (id) =>
	apiFetch(`/api/admin/suppliers/${id}/verify`, { method: "PATCH" });

export const rejectSupplierAdmin = async (id) =>
	apiFetch(`/api/admin/suppliers/${id}/reject`, { method: "PATCH" });

export const listProductsAdmin = async (params = {}) =>
	apiFetch(`/api/admin/products${buildQuery(params)}`);

export const updateProductStatus = async (id, is_active) =>
	apiFetch(`/api/admin/products/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify({ is_active }),
	});

export const listReturnsAdmin = async (params = {}) =>
	apiFetch(`/api/admin/returns${buildQuery(params)}`);

export const updateReturnStatusAdmin = async (id, status) =>
	apiFetch(`/api/admin/returns/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify({ status }),
	});

export const cancelOrderAdmin = async (id) =>
	apiFetch(`/api/admin/orders/${id}/cancel`, { method: "PATCH" });
