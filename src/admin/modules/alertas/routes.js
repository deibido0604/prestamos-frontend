import { lazy } from "react";
import { permissions } from "@utils";

const AlertasPage = lazy(() => import("./AlertasPage"));

export default [
  {
    path: "alertas",
    children: [
      {
        index: true,
        element: AlertasPage,
        subject: permissions.Subjects.ALERTAS,
        action: permissions.Actions.READ,
      },
    ],
  },
];
