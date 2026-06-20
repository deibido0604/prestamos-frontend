import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api-prestamos";

// Normaliza el cliente (convierte snake_case a camelCase)
const normalizeClient = (client) => ({
  id: client.id,
  nombreCompleto: client.nombrecompleto,
  cedula: client.cedula,
  correo: client.correo,
  telefono: client.telefono,
  telefonoSecundario: client.telefonosecundario,
  direccion: client.direccion,
  profesion: client.profesion,
  lugarTrabajo: client.lugartrabajo,
  antiguedad: client.antiguedad,
  referencias: client.referencias,
  estado: client.estado,
  fechaCreacion: client.created_at,
});

export const fetchClientesAction = createAsyncThunk(
  "clientes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/clientes`);
      const rows = response.data?.data || [];
      return rows.map(normalizeClient);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchClienteByIdAction = createAsyncThunk(
  "clientes/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/clientes/${id}`);
      return normalizeClient(response.data.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createClienteAction = createAsyncThunk(
  "clientes/create",
  async (payload, { rejectWithValue }) => {
    try {
      // El payload ya viene con camelCase (nombreCompleto, telefonoSecundario, etc.)
      // El servicio backend espera exactamente esas keys.
      const response = await axios.post(`${API_BASE}/clientes`, payload);
      return normalizeClient(response.data.data);
    } catch (error) {
      console.error("Error en createClienteAction:", error);
      if (error.response) {
        return rejectWithValue(error.response.data?.message || error.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateClienteAction = createAsyncThunk(
  "clientes/update",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      // Los cambios vienen en camelCase, exactamente lo que espera el backend
      const response = await axios.put(`${API_BASE}/clientes/${id}`, changes);
      return normalizeClient(response.data.data);
    } catch (error) {
      console.error("Error en updateClienteAction:", error);
      if (error.response) {
        return rejectWithValue(error.response.data?.message || error.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const deleteClienteAction = createAsyncThunk(
  "clientes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/clientes/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
