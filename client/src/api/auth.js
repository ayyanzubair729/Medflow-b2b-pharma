import { apiFetch } from "./client.js";

export const loginRequest = async ({ email, password }) => {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const registerRequest = async ({
  email,
  password,
  role,
  business_name,
  license_number,
  phone,
  address,
}) => {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      role,
      business_name,
      license_number,
      phone,
      address,
    }),
  });
};
