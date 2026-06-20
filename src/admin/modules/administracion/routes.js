import { lazy } from "react";
import { permissions } from "@utils";

const AdminPage = lazy(() => import("./pages/AdminPage"));
const RolesPage = lazy(() => import("./pages/RolesPage"));

export default [
  {
    path: "administracion",
    children: [
      {
        index: true,
        element: AdminPage,
        subject: permissions.Subjects.ADMINISTRACION,
        action: permissions.Actions.READ,
      },
      {
        path: "roles",
        element: RolesPage,
        subject: permissions.Subjects.ADMINISTRACION,
        action: permissions.Actions.READ,
      },
    ],
  },
];
