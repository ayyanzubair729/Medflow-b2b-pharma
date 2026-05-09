const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

export const apiFetch = async (path, options = {}) => {
  let authHeader = {};
  try {
    const raw = localStorage.getItem("medflow_auth");
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed?.token) {
      authHeader = { Authorization: `Bearer ${parsed.token}` };
    }
  } catch (_error) {
    authHeader = {};
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (_error) {
    throw new Error("Unable to reach the API. Check the server and VITE_API_BASE_URL.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_error) {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }

  return data;
};
