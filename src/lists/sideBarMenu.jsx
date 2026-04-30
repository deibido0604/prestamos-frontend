import {
  PieChartOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
  DollarOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { permissions } from "@utils";
import { Link } from "react-router-dom";

export const sideBarMenu = ({ t }) => [
  {
    key: "dashboard",
    icon: <PieChartOutlined />,
    label: <Link to="/main/dashboard">{t("app.dashboard")}</Link>,
    subject: permissions.Subjects.DASHBOARD,
    action: permissions.Actions.READ,
  },
  {
    key: "clientes",
    icon: <TeamOutlined />,
    label: <Link to="/main/clientes">Clientes</Link>,
    subject: permissions.Subjects.CLIENTES,
    action: permissions.Actions.READ,
  },
  {
    key: "prestamos",
    icon: <DollarOutlined />,
    label: <Link to="/main/prestamos">Préstamos</Link>,
    subject: permissions.Subjects.PRESTAMOS,
    action: permissions.Actions.READ,
  },
  {
    key: "administracion",
    icon: <SettingOutlined />,
    label: <Link to="/main/administracion">Usuarios</Link>,
    subject: permissions.Subjects.ADMINISTRACION,
    action: permissions.Actions.READ,
  },
];
