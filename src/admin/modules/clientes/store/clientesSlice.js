import { createSlice } from "@reduxjs/toolkit";
import { fetchClientes, createCliente, updateCliente as updateClienteThunk, deleteCliente as deleteClienteThunk } from './thunks';

const mockClientes = [];

export const clientesSlice = createSlice({
  name: "clientes",
  initialState: {
    list: mockClientes,
    selectedCliente: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedCliente: (state, action) => {
      state.selectedCliente = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClientes.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchClientes.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createCliente.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createCliente.fulfilled, (state, action) => { state.loading = false; state.list.unshift(action.payload); })
      .addCase(createCliente.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateClienteThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateClienteThunk.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateClienteThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteClienteThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteClienteThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(c => c.id !== action.payload);
      })
      .addCase(deleteClienteThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { setSelectedCliente } = clientesSlice.actions;

export default clientesSlice.reducer;
