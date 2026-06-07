import { createSlice } from "@reduxjs/toolkit";
import { fetchClientes, createCliente, updateCliente, deleteCliente } from './thunks';

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

      .addCase(updateCliente.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateCliente.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.list.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateCliente.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(deleteCliente.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteCliente.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCliente.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { setSelectedCliente } = clientesSlice.actions;

export default clientesSlice.reducer;
