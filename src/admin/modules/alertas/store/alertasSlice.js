import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAlertas,
  createAlerta,
  updateAlerta,
  deleteAlerta,
  toggleAlertaActivo,
  sendTestEmail,
} from './thunks';

const initialState = {
  list: [],
  loading: false,
  error: null,
  testEmailSending: false,
  testEmailSuccess: false,
};

const alertasSlice = createSlice({
  name: 'alertas',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTestStatus: (state) => {
      state.testEmailSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlertas.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAlertas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAlerta.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateAlerta.fulfilled, (state, action) => {
        const index = state.list.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteAlerta.fulfilled, (state, action) => {
        state.list = state.list.filter(a => a.id !== action.payload);
      })
      .addCase(toggleAlertaActivo.fulfilled, (state, action) => {
        const index = state.list.findIndex(a => a.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(sendTestEmail.pending, (state) => {
        state.testEmailSending = true;
        state.testEmailSuccess = false;
      })
      .addCase(sendTestEmail.fulfilled, (state) => {
        state.testEmailSending = false;
        state.testEmailSuccess = true;
      })
      .addCase(sendTestEmail.rejected, (state, action) => {
        state.testEmailSending = false;
        state.error = action.payload;
      });
  },
});

// Exportar acciones síncronas
export const { clearError, clearTestStatus } = alertasSlice.actions;

// Exportar el reducer por defecto
export default alertasSlice.reducer;
