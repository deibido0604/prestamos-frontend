/* eslint-disable react-hooks/rules-of-hooks */
import { useApi } from "@hooks";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { endpoints } from "@utils";

const { callService } = useApi();

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

export const fetchClientes = createAsyncThunk(
  'clientes/fetch',
  async (_, { rejectWithValue }) => {
    return await callService({
      url: endpoints.clientsUrl.list,
      errorCallback: rejectWithValue,
    }).get().then(data => {
      const rows = Array.isArray(data) ? data : data?.data || [];
      return rows.map(normalize);
    });
  }
);

export const createCliente = createAsyncThunk(
  'clientes/create',
  async (payload, { rejectWithValue }) => {
    return await callService({
      url: endpoints.clientsUrl.create,
      errorCallback: rejectWithValue,
    }).post(payload).then(data => normalize(data));
  }
);

export const updateCliente = createAsyncThunk(
  'clientes/update',
  async ({ id, changes }, { rejectWithValue }) => {
    return await callService({
      url: endpoints.clientsUrl.update(id),
      errorCallback: rejectWithValue,
    }).put(changes).then(data => normalize(data));
  }
);

export const deleteCliente = createAsyncThunk(
  'clientes/delete',
  async (id, { rejectWithValue }) => {
    await callService({
      url: endpoints.clientsUrl.delete(id),
      errorCallback: rejectWithValue,
    }).delete();
    return id;
  }
);