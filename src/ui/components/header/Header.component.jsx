import { GlobalOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";
import { Badge, Button, Layout, Popover, List, Typography } from "antd";
import { useContext, useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../admin/context";
import { setLocale } from "../../../config/store";
import "./styles.scss";

const { Header } = Layout;
const { Text } = Typography;

export const HeaderComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [alertas, setAlertas] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const mockAlertas = [
      { id: 1, mensaje: "Préstamo vencido: Juan Pérez", fecha: "2025-03-20", leido: false },
      { id: 2, mensaje: "Recordatorio: cuota de María López vence en 3 días", fecha: "2025-03-19", leido: false },
      { id: 3, mensaje: "Nuevo préstamo aprobado", fecha: "2025-03-18", leido: true },
    ];
    setAlertas(mockAlertas);
  }, []);

  const noLeidas = alertas.filter(a => !a.leido).length;

  const handleLocale = (locale) => {
    localStorage.setItem("locale", locale);
    dispatch(setLocale(locale));
  };

  const handleLogout = () => {
    logout();
  };

  const handleVerTodas = () => {
    setPopoverOpen(false);
    navigate("/main/alertas");
  };

  const contentAlertas = (
    <div style={{ width: 280 }}>
      <List
        size="small"
        header={<strong>Alertas recientes</strong>}
        footer={
          <Button type="link" block onClick={handleVerTodas}>
            Ver todas las alertas
          </Button>
        }
        dataSource={alertas.slice(0, 5)}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<Text ellipsis style={{ maxWidth: 200 }}>{item.mensaje}</Text>}
              description={item.fecha}
            />
            {!item.leido && <Badge status="processing" />}
          </List.Item>
        )}
        locale={{ emptyText: "No hay alertas" }}
      />
    </div>
  );

  const contentIdioma = (
    <div>
      <Button onClick={() => handleLocale("en-US")} type="text" block>
        EN
      </Button>
      <Button onClick={() => handleLocale("es-ES")} type="text" block>
        ES
      </Button>
    </div>
  );

  return (
    <>
      <Header style={{ background: "#ffff" }}>
        <div className="nav-container" style={{ display: "flex", justifyContent: "flex-end" }}>
          <Popover placement="bottom" content={contentIdioma} trigger="click">
            <Button icon={<GlobalOutlined />} />
          </Popover>

          <Popover
            placement="bottom"
            content={contentAlertas}
            trigger="click"
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
          >
            <Badge count={noLeidas} offset={[-5, 5]}>
              <Button icon={<BellOutlined />} />
            </Badge>
          </Popover>

          <Button onClick={handleLogout} icon={<LogoutOutlined />}>
            <FormattedMessage id="app.userinfo.logout" />
          </Button>
        </div>
      </Header>
    </>
  );
};