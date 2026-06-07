import { lazy } from "react";
import { permissions } from "@utils";

const ClientesPage = lazy(() => import("./pages/ClientesPage"));
const ClientesFormPage = lazy(() => import("./pages/ClientesForm"));

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
      {
        path: "new",
        element: ClientesFormPage,
        subject: permissions.Subjects.CLIENTES,
        action: permissions.Actions.CREATE,
      },
      {
        path: "edit/:id",
        element: ClientesFormPage,
        subject: permissions.Subjects.CLIENTES,
        action: permissions.Actions.UPDATE,
      },
    ],
  },
];