// Centralized API base for all thunks and services
export const API_BASE = import.meta.env.VITE_API_URL || "https://prestamos-backend-ten.vercel.app/api-prestamos";
// For local development set VITE_API_URL=http://localhost:3000/api-prestamos in .env.local
// For production set VITE_API_URL to your deployed backend URL in .env.production

export const clientsUrl = {
  list: "/clients",
  getById: (id) => `/clients/${id}`,
  create: "/clients",
  update: (id) => `/clients/${id}`,
  delete: (id) => `/clients/${id}`,
};

export const alertasUrl = {
  list: "/alertas",
  getById: (id) => `/alertas/${id}`,
  create: "/alertas",
  update: (id) => `/alertas/${id}`,
  delete: (id) => `/alertas/${id}`,
  toggle: (id) => `/alertas/${id}/toggle`,
  test: "/alertas/test",
};

export const authUrl = {
  login: `/systemUsers/login`,
  logout: `/systemUsers/logout`,
};

export const roleUrl = {
  byId: `/roles`,
  list: `/roles/list`,
  delete: `/roles/delete`,
  create: `/roles/create`,
  update: `/roles/update`,
};

export const permissionUrl = {
  byId: `/permission`,
  list: `/permission/list`,
  delete: `/permission/delete`,
  create: `/permission/create`,
  update: `/permission/update`,
};