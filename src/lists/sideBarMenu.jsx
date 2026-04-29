import {
  PieChartOutlined,
} from "@ant-design/icons";
import { permissions } from "@utils";
import { Link } from "react-router-dom";

export const sideBarMenu = ({ t }) => [
  {
    key: "dashboard",
    icon: <PieChartOutlined />,
    label: <Link to="/main"> {t("app.dashboard")} </Link>,
    subject: permissions.Subjects.DASHBOARD,
    action: permissions.Actions.READ,
  },
 
];
