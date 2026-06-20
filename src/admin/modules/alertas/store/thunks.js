import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { endpoints } from '@utils';

const API_URL = endpoints.API_BASE || '';

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
