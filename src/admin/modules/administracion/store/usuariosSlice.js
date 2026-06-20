import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUsuariosAction,
  createUsuarioAction,
  updateUsuarioAction,
  deleteUsuarioAction,
} from "./thunks";

const initialState = {
  list: [],
  isLoading: false,
  error: null,
};

const usuariosSlice = createSlice({
  name: "usuarios",
  initialState,
  reducers: {
    clearUsuariosError: (state) => {
      state.error = null;
    },
    clearUsuariosState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuariosAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsuariosAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsuariosAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createUsuarioAction.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateUsuarioAction.fulfilled, (state, action) => {
        const index = state.list.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteUsuarioAction.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearUsuariosError, clearUsuariosState } = usuariosSlice.actions;
export default usuariosSlice;
