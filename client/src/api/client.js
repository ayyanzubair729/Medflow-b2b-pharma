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

  const isFormData = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
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

export const apiFetchBlob = async (path, options = {}) => {
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
        ...authHeader,
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (_error) {
    throw new Error("Unable to reach the API. Check the server and VITE_API_BASE_URL.");
  }

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch (_error) {
      message = "Request failed";
    }
    throw new Error(message);
  }

  return response.blob();
};
