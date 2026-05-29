
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api-prestamos";
// For local development set VITE_API_URL=http://localhost:3000/api-prestamos in .env.local
// For production set VITE_API_URL to your deployed backend URL in .env.production

export const authUrl = {
  login: `${API_URL}/systemUsers/login`,
  logout: `${API_URL}/systemUsers/logout`,
};

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