import { lazy } from "react";
import { permissions } from "@utils";

const AdminPage = lazy(() => import("./AdminPage"));

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
    ],
  },
];
