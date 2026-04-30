import { lazy } from "react";
import { permissions } from "@utils";

const PrestamosPage = lazy(() => import("./PrestamosPage"));

export default [
  {
    path: "prestamos",
    children: [
      {
        index: true,
        element: PrestamosPage,
        subject: permissions.Subjects.PRESTAMOS,
        action: permissions.Actions.READ,
      },
    ],
  },
];
