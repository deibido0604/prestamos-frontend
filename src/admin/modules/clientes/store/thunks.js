import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Obtén la URL base desde las variables de entorno o usa localhost
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

// Convierte camelCase a snake_case para enviar al backend
const toSnakeCase = (obj) => {
  const result = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
};

export const fetchClientesAction = createAsyncThunk(
  "clientes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/clientes`);
      const rows = response.data?.data || [];
      return rows.map(normalizeClient);
    } catch (error) {
      console.error("Fetch error:", error);
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
      const snakePayload = toSnakeCase(payload);
      console.log("📤 Enviando:", snakePayload);
      const response = await axios.post(`${API_BASE}/clientes`, snakePayload);
      console.log("✅ Respuesta:", response.data);
      return normalizeClient(response.data.data);
    } catch (error) {
      console.error("❌ Error detallado:", error);
      if (error.response) {
        console.error("📄 Respuesta del backend:", error.response.data);
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
      const snakeChanges = toSnakeCase(changes);
      const response = await axios.put(`${API_BASE}/clientes/${id}`, snakeChanges);
      return normalizeClient(response.data.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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