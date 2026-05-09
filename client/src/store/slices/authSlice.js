import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginRequest, registerRequest } from "../../api/auth.js";

const storedAuth = (() => {
  try {
    const raw = localStorage.getItem("medflow_auth");
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
})();

const initialState = {
  token: storedAuth?.token || null,
  role: storedAuth?.role || null,
  user: storedAuth?.user || null,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, persist }, { rejectWithValue }) => {
    try {
      const data = await loginRequest({ email, password });
      return { ...data, persist };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await registerRequest(payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload?.token || null;
      state.role = action.payload?.role || null;
      state.user = action.payload?.user || null;
      state.error = null;
      state.loading = false;
      if (state.token && action.payload?.persist !== false) {
        localStorage.setItem(
          "medflow_auth",
          JSON.stringify({ token: state.token, role: state.role, user: state.user })
        );
      }
    },
    clearCredentials: (state) => {
      state.token = null;
      state.role = null;
      state.user = null;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("medflow_auth");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
        state.role = action.payload?.user?.role || null;
        state.error = null;
        if (state.token && action.payload?.persist !== false) {
          localStorage.setItem(
            "medflow_auth",
            JSON.stringify({ token: state.token, role: state.role, user: state.user })
          );
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = action.payload?.user || null;
        state.role = null;
        state.error = null;
        localStorage.removeItem("medflow_auth");
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
