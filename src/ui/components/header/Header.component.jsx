import { GlobalOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";
import { Badge, Button, Layout, Popover, List, Typography, Empty, Tag } from "antd";
import { useContext, useState, useEffect, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AuthContext } from "../../../admin/context";
import { setLocale } from "../../../config/store";
import { fetchAlertas } from "../../../admin/modules/alertas/store/thunks";
import { markAlertaLeida } from "../../../admin/modules/alertas/store/alertasSlice";
import "./styles.scss";

const { Header } = Layout;
const { Text } = Typography;

export const HeaderComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const alertas = useSelector((s) => s.alertas?.list || []);

  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAlertas()).catch(() => {});
    const t = setInterval(() => {
      dispatch(fetchAlertas()).catch(() => {});
    }, 60_000);
    return () => clearInterval(t);
  }, [dispatch]);

  const recientes = useMemo(
    () =>
      [...alertas]
        .sort((a, b) => {
          const fa = a.fecha ? new Date(a.fecha).getTime() : 0;
          const fb = b.fecha ? new Date(b.fecha).getTime() : 0;
          return fb - fa;
        })
        .slice(0, 8),
    [alertas]
  );

  const noLeidas = alertas.filter((a) => !a.leido).length;

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

  const handleClickAlerta = (alerta) => {
    if (!alerta?.leido) dispatch(markAlertaLeida(alerta.id));
    setPopoverOpen(false);
    if (alerta?.prestamo_id) {
      navigate(`/main/prestamos`);
    } else {
      navigate("/main/alertas");
    }
  };

  const contentAlertas = (
    <div style={{ width: 300 }}>
      <div style={{ padding: "8px 4px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text strong>Alertas recientes</Text>
        {noLeidas > 0 && <Badge count={noLeidas} />}
      </div>
      {recientes.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin alertas pendientes"
          style={{ padding: "16px 0" }}
        />
      ) : (
        <List
          size="small"
          dataSource={recientes}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: "pointer" }}
              onClick={() => handleClickAlerta(item)}
            >
              <List.Item.Meta
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Text ellipsis style={{ maxWidth: 200 }}>
                      {item.mensaje || item.nombre || "Alerta"}
                    </Text>
                    {!item.leido && <Badge status="processing" />}
                  </div>
                }
                description={
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    {item.frecuencia && (
                      <Tag color="blue" style={{ margin: 0 }}>
                        {item.frecuencia}
                      </Tag>
                    )}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.fecha ? dayjs(item.fecha).format("DD/MM/YYYY") : "—"}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      <div style={{ borderTop: "1px solid #f0f0f0", padding: "8px 0 0" }}>
        <Button type="link" block onClick={handleVerTodas}>
          Ver todas las alertas
        </Button>
      </div>
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
              <Button icon={<BellOutlined />} aria-label="Notificaciones" />
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