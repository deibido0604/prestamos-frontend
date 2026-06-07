import { createSlice } from "@reduxjs/toolkit";

// Remove hardcoded users; use backend
export const usuariosSlice = createSlice({
  name: "usuarios",
  initialState: {
    list: [],
    selectedUsuario: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUsuarios: (state, action) => {
      state.list = action.payload;
    },
    addUsuario: (state, action) => {
      state.list.push({
        ...action.payload,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split("T")[0],
      });
    },
    updateUsuario: (state, action) => {
      const index = state.list.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteUsuario: (state, action) => {
      state.list = state.list.filter((u) => u.id !== action.payload);
    },
    setSelectedUsuario: (state, action) => {
      state.selectedUsuario = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUsuarios,
  addUsuario,
  updateUsuario,
  deleteUsuario,
  setSelectedUsuario,
  setLoading,
  setError,
} = usuariosSlice.actions;
