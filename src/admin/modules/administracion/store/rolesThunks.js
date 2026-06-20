import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api-prestamos";

export const fetchRolesAction = createAsyncThunk(
  "roles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/roles`);
      return data.data || [];
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const fetchPermissionsAction = createAsyncThunk(
  "roles/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE}/permission`);
      return data.data || [];
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const createRolAction = createAsyncThunk(
  "roles/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/roles`, payload);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const updateRolAction = createAsyncThunk(
  "roles/update",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_BASE}/roles/${id}`, changes);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const deleteRolAction = createAsyncThunk(
  "roles/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/roles/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const assignRolesToUserAction = createAsyncThunk(
  "roles/assignToUser",
  async ({ userId, roleIds }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/roles/user/${userId}`, { roleIds });
      return { userId, roles: data.data };
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);

export const generateResetTokenAction = createAsyncThunk(
  "usuarios/resetToken",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE}/systemUsers/reset-token/${userId}`);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || e.message);
    }
  }
);
