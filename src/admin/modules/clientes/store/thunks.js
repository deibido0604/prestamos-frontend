// src/admin/modules/clientes/store/thunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Obtén la URL base desde las variables de entorno o usa localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api-prestamos";

// Normaliza el cliente (convierte snake_case a camelCase para el frontend)
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

// Obtener todos los clientes
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

// Obtener un cliente por ID
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

// Crear cliente (envía el payload directamente, sin conversión a snake_case)
export const createClienteAction = createAsyncThunk(
  "clientes/create",
  async (payload, { rejectWithValue }) => {
    try {
      console.log("📤 Enviando payload al backend:", payload);
      const response = await axios.post(`${API_BASE}/clientes`, payload);
      console.log("✅ Respuesta:", response.data);
      return normalizeClient(response.data.data);
    } catch (error) {
      console.error("❌ Error en createClienteAction:", error);
      if (error.response) {
        console.error("📄 Detalle del error:", error.response.data);
        return rejectWithValue(error.response.data?.message || error.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Actualizar cliente (envía los cambios directamente, sin conversión)
export const updateClienteAction = createAsyncThunk(
  "clientes/update",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      console.log("✏️ Enviando cambios para actualizar:", changes);
      const response = await axios.put(`${API_BASE}/clientes/${id}`, changes);
      return normalizeClient(response.data.data);
    } catch (error) {
      console.error("❌ Error en updateClienteAction:", error);
      if (error.response) {
        return rejectWithValue(error.response.data?.message || error.message);
      }
      return rejectWithValue(error.message);
    }
  }
);

// Eliminar cliente
export const deleteClienteAction = createAsyncThunk(
  "clientes/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/clientes/${id}`);
      return id;
    } catch (error) {
      console.error("❌ Error en deleteClienteAction:", error);
      if (error.response) {
        return rejectWithValue(error.response.data?.message || error.message);
      }
      return rejectWithValue(error.message);
    }
  }
);