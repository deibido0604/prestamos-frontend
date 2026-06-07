import { decryptString } from './crypto';

export const getTokenFromStorage = () => {
  try {
    const raw = localStorage.getItem('data');
    if (!raw) return null;

    // detect encrypted value
    const isEncrypted = raw.includes(":") || raw.length > 100;
    let decrypted = raw;
    if (isEncrypted) {
      const secret = import.meta.env.VITE_APP_SECRET_KEY || import.meta.env.REACT_APP_SECRET || 'default-secret-for-dev';
      try {
        decrypted = decryptString(raw, secret);
      } catch (e) {
        // fall back to raw
        decrypted = raw;
      }
    }

    try {
      const parsed = JSON.parse(decrypted);
      return parsed?.token || null;
    } catch (e) {
      return null;
    }
  } catch (e) {
    return null;
  }
};
