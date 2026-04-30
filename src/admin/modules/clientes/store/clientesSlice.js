import { createSlice } from "@reduxjs/toolkit";

const mockClientes = [
  {
    id: "1",
    nombreCompleto: "Carlos López Martínez",
    cedula: "0801-1995-12345",
    correo: "carlos@email.com",
    telefono: "9876543210",
    direccion: "Calle 5, Apartado 123, Tegucigalpa",
    profesion: "Ingeniero",
    referencias: "Juan Pérez",
    estado: "activo",
    fechaCreacion: "2024-02-10",
  },
  {
    id: "2",
    nombreCompleto: "Ana Rodríguez García",
    cedula: "0801-1992-54321",
    correo: "ana@email.com",
    telefono: "9123456789",
    direccion: "Avenida 10, Comayagüela",
    profesion: "Contadora",
    referencias: "María Gómez",
    estado: "activo",
    fechaCreacion: "2024-02-15",
  },
];

export const clientesSlice = createSlice({
  name: "clientes",
  initialState: {
    list: mockClientes,
    selectedCliente: null,
    loading: false,
    error: null,
  },
  reducers: {
    setClientes: (state, action) => {
      state.list = action.payload;
    },
    addCliente: (state, action) => {
      state.list.push({
        ...action.payload,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split("T")[0],
      });
    },
    updateCliente: (state, action) => {
      const index = state.list.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteCliente: (state, action) => {
      state.list = state.list.filter((c) => c.id !== action.payload);
    },
    setSelectedCliente: (state, action) => {
      state.selectedCliente = action.payload;
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
  setClientes,
  addCliente,
  updateCliente,
  deleteCliente,
  setSelectedCliente,
  setLoading,
  setError,
} = clientesSlice.actions;
