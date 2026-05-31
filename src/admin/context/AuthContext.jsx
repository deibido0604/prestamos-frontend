/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch } from "react-redux";
import { setLogged } from "../../config/store";
import { useLocalStorage } from "@hooks";
import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import { useNavigate } from "react-router-dom";
import { AbilityBuilder } from "@casl/ability";
import { AbilityContext } from "./AbilityContext";
import { openNotification } from "../layout/store/layoutSlice";
import { persistor, resetStore } from "../../store/store";
import LoadingPage from "../components/Loader/LoadingPage";
import axios from "axios"; // ✅ Axios directo

const defaultProvider = {
  user: null,
  loading: false,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
};

const AuthContext = createContext(defaultProvider);

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const ability = useContext(AbilityContext);
  const { setItemWithEncryption, removeItem, getItemWithDecryption } =
    useLocalStorage();
  const navigate = useNavigate();

  const [user, setUser] = useState(defaultProvider.user);
  const [initializing, setInitializing] = useState(true);

  // ✅ Base URL desde variables de entorno
  const API_BASE_URL = "https://prestamos-backend-ten.vercel.app/api-prestamos";

  // =========================
  // INIT AUTH
  // =========================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = getItemWithDecryption("data");

        let userData = storedUser;

        if (typeof storedUser === "string") {
          try {
            userData = JSON.parse(storedUser);
          } catch (e) {
            userData = null;
          }
        }

        if (userData?.user?.id) {
          setUser(userData);
          dispatch(setLogged(true));

          handleUpdateAbility(userData.role?.permissions || []);

          const path = window.location.pathname;

          if (!path.startsWith("/main")) {
            navigate("/main", { replace: true });
          }
        } else {
          const publicPaths = ["/auth/login", "/auth/register"];
          const path = window.location.pathname;

          if (!publicPaths.includes(path)) {
            navigate("/auth/login", { replace: true });
          }
        }
      } catch (err) {
        console.error("INIT AUTH ERROR:", err);
        clearStorage();
        navigate("/auth/login", { replace: true });
      } finally {
        setInitializing(false);
      }
    };

    setTimeout(initAuth, 100);
  }, []);

  // =========================
  // CASL FIXED UPDATE
  // =========================
  const handleUpdateAbility = (permissions = []) => {
    const { can, rules } = new AbilityBuilder();

    permissions.forEach((p) => {
      if (p?.action && p?.subject) {
        can(p.action, p.subject);
      }
    });

    ability.update(rules);
  };

  // =========================
  // USER HANDLING
  // =========================
  const handleSetUser = (data) => setUser(data);

  const clearStorage = () => {
    setUser(null);
    removeItem("data");
    dispatch(setLogged(false));
  };

  // =========================
  // ROLE NORMALIZER
  // =========================
  const setUserRoles = (roles = []) => {
    let permissions = [];

    roles.forEach((role) => {
      permissions = permissions.concat(role.permissions || []);
    });

    const unique = new Map();

    permissions.forEach((p) => {
      if (p?.action && p?.subject) {
        unique.set(`${p.action}-${p.subject}`, p);
      }
    });

    return {
      permissions: Array.from(unique.values())
    };
  };

  // =========================
  // LOGIN CON BACKEND REAL
  // =========================
  const handleLogin = async ({ username, password }) => {
    try {
      // ✅ Usamos axios directamente con la URL completa
      const response = await axios.post(`${API_BASE_URL}/systemUsers/login`, {
        username,
        password,
      });

      // ⚠️ Ajusta según la estructura real de tu backend
      // Si tu backend devuelve { data: { user, token, roles } } usa response.data.data
      const { user, token, roles } = response.data;

      const roleData = setUserRoles(roles || []);

      const userData = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          active: user.active,
        },
        token,
        role: roleData,
        permissions: roleData.permissions,
      };

      setItemWithEncryption("data", userData);
      handleSetUser(userData);
      dispatch(setLogged(true));
      handleUpdateAbility(roleData.permissions);
      navigate("/main", { replace: true });
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || "Credenciales incorrectas";
      } else if (error.request) {
        errorMessage = "No se pudo conectar con el servidor";
      } else {
        errorMessage = error.message;
      }
      // ✅ Usamos 'title' en lugar de 'message'
      dispatch(
        openNotification({
          title: "Error",
          description: errorMessage,
          type: "error",
          placement: "bottom",
          show: true,
        })
      );
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    persistor.purge();
    dispatch(setLogged(false));
    dispatch(resetStore());
    clearStorage();
    navigate("/auth/login", { replace: true });
  };

  // =========================
  // PROVIDER VALUE
  // =========================
  const values = {
    user,
    login: handleLogin,
    logout: handleLogout
  };

  if (initializing) {
    return <LoadingPage />;
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };