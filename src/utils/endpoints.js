// Base URL del backend (desde variable de entorno o por defecto)
const API_URL = import.meta.env.VITE_API_URL || "https://prestamos-backend-ten.vercel.app/api-prestamos";

// ==============================
// AUTENTICACIÓN
// ==============================
export const authUrl = {
  login: `${API_URL}/systemUsers/login`,
  logout: `${API_URL}/systemUsers/logout`,
};

// ==============================
// ROLES Y PERMISOS
// ==============================
export const roleUrl = {
  byId: `${API_URL}/roles`,
  list: `${API_URL}/roles/list`,
  delete: `${API_URL}/roles/delete`,
  create: `${API_URL}/roles/create`,
  update: `${API_URL}/roles/update`,
};

export const permissionUrl = {
  byId: `${API_URL}/permission`,
  list: `${API_URL}/permission/list`,
  delete: `${API_URL}/permission/delete`,
  create: `${API_URL}/permission/create`,
  update: `${API_URL}/permission/update`,
};

// ==============================
// CLIENTES
// ==============================
export const clientsUrl = {
  list: `${API_URL}/clientes`,
  byId: (id) => `${API_URL}/clientes/${id}`,
  create: `${API_URL}/clientes`,
  update: (id) => `${API_URL}/clientes/${id}`,
  delete: (id) => `${API_URL}/clientes/${id}`,
  stats: `${API_URL}/clientes/stats`,       // Para estadísticas (opcional)
};

// ==============================
// ALERTAS
// ==============================
export const alertasUrl = {
  list: `${API_URL}/alertas`,
  byId: (id) => `${API_URL}/alertas/${id}`,
  create: `${API_URL}/alertas`,
  update: (id) => `${API_URL}/alertas/${id}`,
  delete: (id) => `${API_URL}/alertas/${id}`,
  toggle: (id) => `${API_URL}/alertas/${id}/toggle`,
  test: `${API_URL}/alertas/test`,
};