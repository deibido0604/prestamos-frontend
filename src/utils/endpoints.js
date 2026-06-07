// Centralized API base for all thunks and services
export const API_BASE = import.meta.env.VITE_API_URL || "https://prestamos-backend-ten.vercel.app/api-prestamos";
// For local development set VITE_API_URL=http://localhost:3000/api-prestamos in .env.local
// For production set VITE_API_URL to your deployed backend URL in .env.production

export const authUrl = {
  login: `${API_BASE}/systemUsers/login`,
  logout: `${API_BASE}/systemUsers/logout`,
};

export const roleUrl = {
  byId: `${API_BASE}/roles`,
  list: `${API_BASE}/roles/list`,
  delete: `${API_BASE}/roles/delete`,
  create: `${API_BASE}/roles/create`,
  update: `${API_BASE}/roles/update`,
};

export const permissionUrl = {
  byId: `${API_BASE}/permission`,
  list: `${API_BASE}/permission/list`,
  delete: `${API_BASE}/permission/delete`,
  create: `${API_BASE}/permission/create`,
  update: `${API_BASE}/permission/update`,
};