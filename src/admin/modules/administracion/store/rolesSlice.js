import { createSlice } from "@reduxjs/toolkit";
import {
  fetchRolesAction,
  createRolAction,
  updateRolAction,
  deleteRolAction,
} from "./rolesThunks";

const rolesSlice = createSlice({
  name: "roles",
  initialState: { list: [], isLoading: false, error: null },
  reducers: {
    clearRolesState: () => ({ list: [], isLoading: false, error: null }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolesAction.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchRolesAction.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload; })
      .addCase(fetchRolesAction.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload; })
      .addCase(createRolAction.fulfilled,  (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateRolAction.fulfilled,  (s, a) => {
        const i = s.list.findIndex((r) => r.id === a.payload.id);
        if (i !== -1) s.list[i] = a.payload;
      })
      .addCase(deleteRolAction.fulfilled, (s, a) => {
        s.list = s.list.filter((r) => r.id !== a.payload);
      });
  },
});

export const { clearRolesState } = rolesSlice.actions;
export default rolesSlice;
