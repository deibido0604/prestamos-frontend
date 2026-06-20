import { lazy } from "react";
import { permissions } from "@utils";

const ReportsPage = lazy(() => import("./ReportsPage"));

export default [
  {
    path: "reportes",
    children: [
      {
        index: true,
        element: ReportsPage,
        subject: permissions.Subjects.REPORTS,
        action: permissions.Actions.READ,
      },
    ],
  },
];
