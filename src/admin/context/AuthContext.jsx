/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch } from "react-redux";
import { setLogged } from "../../config/store";
import { useApi, useLocalStorage } from "@hooks";
import { endpoints } from "@utils";
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
  const axios = useApi();
  const { setItemWithEncryption, removeItem, getItemWithDecryption } =
    useLocalStorage();
  const navigate = useNavigate();

  const [user, setUser] = useState(defaultProvider.user);
  const [initializing, setInitializing] = useState(true);

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
  // MOCK LOGIN (SIN BACKEND)
  // =========================
  const handleLogin = async ({ username, password }) => {
    const mockUser = {
      username: "admin",
      password: "admin123",
      data: {
        _id: "1",
        username: "admin",
        email: "admin@prestamos.com",
        name: "Administrador",
        active: true,
        roles: [
          {
            name: "Admin",
            type: "admin",
            permissions: [
              { action: "read", subject: "main" },
              { action: "read", subject: "dashboard" },
              { action: "read", subject: "clientes" },
              { action: "create", subject: "clientes" },
              { action: "update", subject: "clientes" },
              { action: "delete", subject: "clientes" },
              { action: "read", subject: "prestamos" },
              { action: "create", subject: "prestamos" },
              { action: "update", subject: "prestamos" },
              { action: "delete", subject: "prestamos" },
              { action: "read", subject: "administracion" },
              { action: "create", subject: "administracion" },
              { action: "update", subject: "administracion" },
              { action: "delete", subject: "administracion" }
            ]
          }
        ],
        token: "fake-token"
      }
    };

    if (
      username === mockUser.username &&
      password === mockUser.password
    ) {
      const data = mockUser.data;

      const role = setUserRoles(data.roles);

      const userData = {
        user: {
          id: data._id,
          username: data.username,
          email: data.email,
          name: data.name,
          active: data.active
        },
        token: data.token,
        role,
        permissions: role.permissions
      };

      setItemWithEncryption("data", userData);

      handleSetUser(userData);
      dispatch(setLogged(true));

      handleUpdateAbility(role.permissions);

      navigate("/main", { replace: true });
    } else {
      dispatch(
        openNotification({
          message: "Error",
          description: "Credenciales incorrectas",
          type: "error",
          placement: "bottom",
          show: true
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