import { createSlice } from "@reduxjs/toolkit";
import {
  fetchClientesAction,
  fetchClienteByIdAction,
  createClienteAction,
  updateClienteAction,
  deleteClienteAction,
} from "./thunks";

const initialState = {
  clientesList: [],
  clienteDetail: null,
  isLoading: false,
  error: null,
};

const clientesSlice = createSlice({
  name: "clientes",
  initialState,
  reducers: {
    clearClientesState: () => initialState,
    clearClientesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder.addCase(fetchClientesAction.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchClientesAction.fulfilled, (state, action) => {
      state.isLoading = false;
      state.clientesList = action.payload;
    });
    builder.addCase(fetchClientesAction.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    // Fetch by id
    builder.addCase(fetchClienteByIdAction.pending, (state) => {
      state.isLoading = true;
      state.clienteDetail = null;
    });
    builder.addCase(fetchClienteByIdAction.fulfilled, (state, action) => {
      state.isLoading = false;
      state.clienteDetail = action.payload;
    });
    builder.addCase(fetchClienteByIdAction.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    // Create
    builder.addCase(createClienteAction.fulfilled, (state, action) => {
      state.clientesList.unshift(action.payload);
    });
    // Update
    builder.addCase(updateClienteAction.fulfilled, (state, action) => {
      const index = state.clientesList.findIndex(c => c.id === action.payload.id);
      if (index !== -1) state.clientesList[index] = action.payload;
      if (state.clienteDetail?.id === action.payload.id) {
        state.clienteDetail = action.payload;
      }
    });
    // Delete
    builder.addCase(deleteClienteAction.fulfilled, (state, action) => {
      state.clientesList = state.clientesList.filter(c => c.id !== action.payload);
    });
  },
});

export const { clearClientesState, clearClientesError } = clientesSlice.actions;
export default clientesSlice.reducer;