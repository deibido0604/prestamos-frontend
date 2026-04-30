import { createSlice } from "@reduxjs/toolkit";

const mockPrestamos = [
  {
    id: "1",
    clienteId: "1",
    cliente: "Carlos López Martínez",
    montoLps: 50000,
    tasaInteres: 15,
    plazoMeses: 12,
    fechaInicio: "2024-02-01",
    concepto: "Mejora de vivienda",
    estado: "activo",
    interesTotal: 7500,
    montoMensual: 4791.67,
  },
  {
    id: "2",
    clienteId: "2",
    cliente: "Ana Rodríguez García",
    montoLps: 30000,
    tasaInteres: 12,
    plazoMeses: 6,
    fechaInicio: "2024-02-15",
    concepto: "Capital de trabajo",
    estado: "activo",
    interesTotal: 1800,
    montoMensual: 5300,
  },
];

export const prestamosSlice = createSlice({
  name: "prestamos",
  initialState: {
    list: mockPrestamos,
    selectedPrestamo: null,
    loading: false,
    error: null,
  },
  reducers: {
    setPrestamos: (state, action) => {
      state.list = action.payload;
    },
    addPrestamo: (state, action) => {
      const { montoLps, tasaInteres, plazoMeses } = action.payload;
      const interesTotal = (montoLps * tasaInteres * plazoMeses) / 100 / 12;
      const montoMensual = (montoLps + interesTotal) / plazoMeses;

      state.list.push({
        ...action.payload,
        id: Date.now().toString(),
        interesTotal: parseFloat(interesTotal.toFixed(2)),
        montoMensual: parseFloat(montoMensual.toFixed(2)),
        fechaInicio: new Date().toISOString().split("T")[0],
      });
    },
    updatePrestamo: (state, action) => {
      const index = state.list.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        const { montoLps, tasaInteres, plazoMeses } = action.payload;
        const interesTotal = (montoLps * tasaInteres * plazoMeses) / 100 / 12;
        const montoMensual = (montoLps + interesTotal) / plazoMeses;

        state.list[index] = {
          ...action.payload,
          interesTotal: parseFloat(interesTotal.toFixed(2)),
          montoMensual: parseFloat(montoMensual.toFixed(2)),
        };
      }
    },
    deletePrestamo: (state, action) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
    setSelectedPrestamo: (state, action) => {
      state.selectedPrestamo = action.payload;
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
  setPrestamos,
  addPrestamo,
  updatePrestamo,
  deletePrestamo,
  setSelectedPrestamo,
  setLoading,
  setError,
} = prestamosSlice.actions;
