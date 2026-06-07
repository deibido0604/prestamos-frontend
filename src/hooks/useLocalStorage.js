import { crypto } from "../utils";

export default function useLocalStorage() {
  const removeItem = (key) => window.localStorage.removeItem(key);

  const setItemWithEncryption = (key, value) => {
    try {
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      const secret =
        import.meta.env.REACT_APP_SECRET || "default-secret-for-dev";

      const encryptedValue = crypto.encryptString(stringValue, secret);

      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const getItemWithDecryption = (key) => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;

      const isEncrypted =
        encryptedValue.includes(":") || encryptedValue.length > 100;

      let decryptedValue = encryptedValue;
      if (isEncrypted) {
        const secret = import.meta.env.REACT_APP_SECRET || "default-secret-for-dev";
        try {
          decryptedValue = crypto.decryptString(encryptedValue, secret);
        } catch (e) {
          // fallback to raw value if decryption fails
          decryptedValue = encryptedValue;
        }
      }

      try {
        return JSON.parse(decryptedValue);
      } catch (parseErr) {
        return decryptedValue;
      }
    } catch (error) {
      try {
        const rawValue = localStorage.getItem(key);
        return JSON.parse(rawValue);
      } catch {
        return null;
      }
    }
  };

  const getItemWithDecryptionDash = (key) => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;

      const isEncrypted =
        encryptedValue.includes(":") || encryptedValue.length > 100;

      let decryptedValue;
      if (isEncrypted) {
        const secret =
          import.meta.env.REACT_APP_SECRET || "default-secret-for-dev";
        decryptedValue = crypto.decryptString(encryptedValue, secret);
      } else {
        decryptedValue = encryptedValue;
      }

      try {
        return JSON.parse(decryptedValue);
      } catch (parseError) {
        return decryptedValue;
      }
    } catch (error) {

      try {
        const rawValue = localStorage.getItem(key);
        return JSON.parse(rawValue);
      } catch {
        return null;
      }
    }
  };

  const setItem = (key, value) => {
    localStorage.setItem(key, value);
  };

  const getItem = (key) => {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return value;
  };

  return {
    removeItem,
    getItem,
    setItem,
    setItemWithEncryption,
    getItemWithDecryption,
    getItemWithDecryptionDash,
  };
}
