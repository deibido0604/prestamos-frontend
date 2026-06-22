import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api-prestamos";

const normalizeUser = (user) => ({
  id: user.id,
  nombre: user.full_name || user.name || "",
  username: user.username,
  email: user.email,
  lastName: "",
  phone: user.phone || "",
  active: user.active,
  roles: user.roles || [],
  fechaCreacion: user.created_at,
  resetToken: user.resetToken || null,
});

export const fetchUsuariosAction = createAsyncThunk(
  "usuarios/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/systemUsers`);
      const rows = response.data?.data || [];
      return rows.map(normalizeUser);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createUsuarioAction = createAsyncThunk(
  "usuarios/create",
  async (payload, { rejectWithValue }) => {
    try {
      // El backend espera: username, email, password, name, lastName, phone, department, active
      const response = await axios.post(`${API_BASE}/systemUsers/create`, payload);
      return normalizeUser(response.data.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateUsuarioAction = createAsyncThunk(
  "usuarios/update",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE}/systemUsers/${id}`, changes);
      return normalizeUser(response.data.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteUsuarioAction = createAsyncThunk(
  "usuarios/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/systemUsers/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
