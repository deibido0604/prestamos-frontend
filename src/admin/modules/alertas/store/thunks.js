import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { alertasUrl } from '@utils/endpoints';
import dayjs from 'dayjs';
import { markAlertaLeida } from './alertasSlice';

const API_URL = (alertasUrl.list || '').replace(/\/alertas\/?$/, '');

export const fetchAlertas = createAsyncThunk(
  'alertas/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/alertas`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createAlerta = createAsyncThunk(
  'alertas/create',
  async (alertaData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/alertas`, alertaData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateAlerta = createAsyncThunk(
  'alertas/update',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/alertas/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAlerta = createAsyncThunk(
  'alertas/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/alertas/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleAlertaActivo = createAsyncThunk(
  'alertas/toggleActivo',
  async ({ id, activo }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/alertas/${id}/toggle`, { activo });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const sendTestEmail = createAsyncThunk(
  'alertas/sendTest',
  async ({ email, evento }, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/alertas/test`, { email, evento });
      return { email, evento };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Marca como leídas las alertas generadas por un préstamo cuya fecha ya pasó.
// Devuelve un array de IDs para que el consumidor los pueda despachar.
export const markAlertaLeidaAuto = createAsyncThunk(
  'alertas/markLeidaAuto',
  async (prestamoId, { getState }) => {
    if (!prestamoId) return [];
    const state = getState();
    const hoy = dayjs().startOf('day');
    const ids = (state.alertas?.list || [])
      .filter(
        (a) =>
          a.prestamo_id === prestamoId &&
          !a.leido &&
          a.fecha &&
          dayjs(a.fecha).isValid() &&
          dayjs(a.fecha).startOf('day').isSame(hoy) ||
          dayjs(a.fecha).startOf('day').isBefore(hoy)
      )
      .map((a) => a.id);
    return ids;
  }
);

// Helper para que el componente despache markAlertaLeida por cada id devuelto.
export const despacharMarcarLeidas = (ids) => (dispatch) => {
  (ids || []).forEach((id) => dispatch(markAlertaLeida(id)));
};
