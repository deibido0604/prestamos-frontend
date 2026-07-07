import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchAlertas } from "../../alertas/store/thunks";
// placeholder

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api-prestamos";

// ─── Thunks préstamos ──────────────────────────────────────────────────────
export const fetchPrestamos = createAsyncThunk("prestamos/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${BASE}/prestamos`, { params });
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const createPrestamo = createAsyncThunk("prestamos/create", async (payload, { rejectWithValue, dispatch }) => {
  try {
    const { data } = await axios.post(`${BASE}/prestamos`, payload);
    // Refrescar la lista de alertas: el backend generó N avisos según la frecuencia.
    dispatch(fetchAlertas());
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const updatePrestamo = createAsyncThunk("prestamos/update", async ({ id, changes }, { rejectWithValue }) => {
  try {
    const { data } = await axios.put(`${BASE}/prestamos/${id}`, changes);
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const deletePrestamo = createAsyncThunk("prestamos/delete", async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${BASE}/prestamos/${id}`);
    return id;
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const renovarPrestamo = createAsyncThunk("prestamos/renovar", async ({ id, ...body }, { rejectWithValue, dispatch }) => {
  try {
    const { data } = await axios.post(`${BASE}/prestamos/${id}/renovar`, body);
    // Refrescar alertas: la renovación también genera N avisos nuevos.
    dispatch(fetchAlertas());
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

// ─── Thunks abonos ─────────────────────────────────────────────────────────
export const fetchAbonos = createAsyncThunk("prestamos/fetchAbonos", async (prestamoId, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${BASE}/abonos/prestamo/${prestamoId}`);
    return { prestamoId, abonos: data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const createAbono = createAsyncThunk("prestamos/createAbono", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`${BASE}/abonos`, payload);
    return { prestamoId: payload.prestamo_id, abono: data.data };
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

export const deleteAbono = createAsyncThunk("prestamos/deleteAbono", async ({ id, prestamoId }, { rejectWithValue }) => {
  try {
    await axios.delete(`${BASE}/abonos/${id}`);
    return { id, prestamoId };
  } catch (e) { return rejectWithValue(e.response?.data?.message || e.message); }
});

// ─── Cálculo de alertas por préstamo ───────────────────────────────────────
// Genera los avisos para cada cuota según la frecuencia (semanal/quincenal/mensual).
// `fechaInicio` puede ser Date o string ISO; `frecuencia` ∈ semanal|quincenal|mensual.
export const calcularFechasAlertas = ({ fechaInicio, frecuencia, numeroCuotas = 1 }) => {
  if (!fechaInicio) return [];
  const inicio = new Date(fechaInicio);
  if (Number.isNaN(inicio.getTime())) return [];
  const fechas = [];
  const diasPorPeriodo =
    frecuencia === "semanal" ? 7 :
    frecuencia === "quincenal" ? 15 :
    30; // mensual
  for (let i = 1; i <= Math.max(1, Number(numeroCuotas) || 1); i++) {
    const f = new Date(inicio);
    f.setDate(f.getDate() + diasPorPeriodo * i);
    fechas.push(f);
  }
  return fechas;
};

// ─── Slice ─────────────────────────────────────────────────────────────────
export const prestamosSlice = createSlice({
  name: "prestamos",
  initialState: { list: [], abonos: {}, loading: false, error: null },
  reducers: {
    clearPrestamos: () => ({ list: [], abonos: {}, loading: false, error: null }),
  },
  extraReducers: (b) => {
    b
      .addCase(fetchPrestamos.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchPrestamos.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
      .addCase(fetchPrestamos.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createPrestamo.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      .addCase(updatePrestamo.fulfilled, (s, a) => {
        const i = s.list.findIndex(p => p.id === a.payload.id);
        if (i !== -1) s.list[i] = { ...s.list[i], ...a.payload };
      })
      .addCase(deletePrestamo.fulfilled, (s, a) => { s.list = s.list.filter(p => p.id !== a.payload); })
      .addCase(renovarPrestamo.fulfilled, (s, a) => {
        // Marcar el original como renovado y agregar el nuevo
        const i = s.list.findIndex(p => p.id === a.payload.renovacion_de);
        if (i !== -1) s.list[i] = { ...s.list[i], estado: 'renovado' };
        s.list.unshift(a.payload);
      })
      .addCase(fetchAbonos.fulfilled, (s, a) => {
        if (!s.abonos) s.abonos = {};
        s.abonos[a.payload.prestamoId] = a.payload.abonos;
      })
      .addCase(createAbono.fulfilled,  (s, a) => {
        if (!s.abonos) s.abonos = {};
        const list = s.abonos[a.payload.prestamoId] || [];
        s.abonos[a.payload.prestamoId] = [a.payload.abono, ...list];
      })
      .addCase(deleteAbono.fulfilled, (s, a) => {
        if (!s.abonos) s.abonos = {};
        const list = s.abonos[a.payload.prestamoId] || [];
        s.abonos[a.payload.prestamoId] = list.filter(ab => ab.id !== a.payload.id);
      });
  },
});

export const { clearPrestamos } = prestamosSlice.actions;
