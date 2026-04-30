import { lazy } from "react";
import { permissions } from "@utils";

const ClientesPage = lazy(() => import("./ClientesPage"));

export default [
  {
    path: "clientes",
    children: [
      {
        index: true,
        element: ClientesPage,
        subject: permissions.Subjects.CLIENTES,
        action: permissions.Actions.READ,
      },
    ],
  },
];
