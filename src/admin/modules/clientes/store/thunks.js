import { createAsyncThunk } from '@reduxjs/toolkit';

const API = import.meta.env.VITE_API_URL || '';

export const fetchClientes = createAsyncThunk('clientes/fetch', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${API}/clients`);
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.message || 'Error fetching clientes');
    const rows = data.data || [];
    const normalize = (c) => ({
      id: c.id,
      nombreCompleto: c.nombrecompleto || c.nombreCompleto || '',
      cedula: c.cedula || '',
      correo: c.correo || '',
      telefono: c.telefono || '',
      telefonoSecundario: c.telefonosecundario || c.telefonoSecundario || '',
      direccion: c.direccion || '',
      profesion: c.profesion || '',
      lugarTrabajo: c.lugartrabajo || c.lugarTrabajo || '',
      antiguedad: c.antiguedad || null,
      referencias: c.referencias || '',
      estado: c.estado || 'activo',
      fechaCreacion: c.created_at || c.fechaCreacion || '',
    });
    return rows.map(normalize);
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message);
  }
});

export const createCliente = createAsyncThunk('clientes/create', async (payload, thunkAPI) => {
  try {
    const res = await fetch(`${API}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.message || 'Error creating cliente');
    const c = data.data;
    const cliente = {
      id: c.id,
      nombreCompleto: c.nombrecompleto || c.nombreCompleto || '',
      cedula: c.cedula || '',
      correo: c.correo || '',
      telefono: c.telefono || '',
      telefonoSecundario: c.telefonosecundario || c.telefonoSecundario || '',
      direccion: c.direccion || '',
      profesion: c.profesion || '',
      lugarTrabajo: c.lugartrabajo || c.lugarTrabajo || '',
      antiguedad: c.antiguedad || null,
      referencias: c.referencias || '',
      estado: c.estado || 'activo',
      fechaCreacion: c.created_at || c.fechaCreacion || '',
    };
    return cliente;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message);
  }
});

export const updateCliente = createAsyncThunk('clientes/update', async ({ id, changes }, thunkAPI) => {
  try {
    const res = await fetch(`${API}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.message || 'Error updating cliente');
    const c = data.data;
    const cliente = {
      id: c.id,
      nombreCompleto: c.nombrecompleto || c.nombreCompleto || '',
      cedula: c.cedula || '',
      correo: c.correo || '',
      telefono: c.telefono || '',
      telefonoSecundario: c.telefonosecundario || c.telefonoSecundario || '',
      direccion: c.direccion || '',
      profesion: c.profesion || '',
      lugarTrabajo: c.lugartrabajo || c.lugarTrabajo || '',
      antiguedad: c.antiguedad || null,
      referencias: c.referencias || '',
      estado: c.estado || 'activo',
      fechaCreacion: c.created_at || c.fechaCreacion || '',
    };
    return cliente;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message);
  }
});

export const deleteCliente = createAsyncThunk('clientes/delete', async (id, thunkAPI) => {
  try {
    const res = await fetch(`${API}/clients/${id}`, { method: 'DELETE' });
    if (res.status === 204 || res.status === 200) return id;
    const data = await res.json();
    if (!res.ok) return thunkAPI.rejectWithValue(data.message || 'Error deleting cliente');
    return id;
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message);
  }
});