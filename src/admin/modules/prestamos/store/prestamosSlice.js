import { createSlice } from "@reduxjs/toolkit";

// Use backend data; remove hardcoded mocks
export const prestamosSlice = createSlice({
  name: "prestamos",
  initialState: {
    list: [],
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
