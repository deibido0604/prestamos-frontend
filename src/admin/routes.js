import { Navigate } from "react-router-dom";
import childAdminRoutes from "./routes/ChildAdminRoutes";

export default [
  ...childAdminRoutes,
  { path: "*", to: "dashboard", element: Navigate },
];
