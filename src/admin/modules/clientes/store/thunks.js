/* eslint-disable react-hooks/rules-of-hooks */
import { useApi } from "@hooks";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { endpoints } from "@utils";

const { callService } = useApi();

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
  async (params = {}, { rejectWithValue }) => {
    return await callService({
      url: endpoints.clientes.list,
      errorCallback: rejectWithValue,
    }).get({ params }).then(data => {
      const rows = Array.isArray(data) ? data : data?.data || [];
      return rows.map(normalizeClient);
    });
  }
);

export const fetchClienteByIdAction = createAsyncThunk(
  "clientes/fetchById",
  async (id, { rejectWithValue }) => {
    return await callService({
      url: endpoints.clientes.byId(id),
      errorCallback: rejectWithValue,
    }).get().then(data => normalizeClient(data));
  }
);

export const createClienteAction = createAsyncThunk(
  "clientes/create",
  async (payload, { rejectWithValue }) => {
    return await callService({
      url: endpoints.clientes.create,
      errorCallback: rejectWithValue,
    }).post(payload).then(data => normalizeClient(data));
  }
);

export const updateClienteAction = createAsyncThunk(
  "clientes/update",
  async ({ id, changes }, { rejectWithValue }) => {
    return await callService({
      url: endpoints.clientes.update(id),
      errorCallback: rejectWithValue,
    }).put(changes).then(data => normalizeClient(data));
  }
);

export const deleteClienteAction = createAsyncThunk(
  "clientes/delete",
  async (id, { rejectWithValue }) => {
    await callService({
      url: endpoints.clientes.delete(id),
      errorCallback: rejectWithValue,
    }).delete();
    return id;
  }
);