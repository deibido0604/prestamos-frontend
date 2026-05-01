import { Layout, Menu } from "antd";
import { useTranslate, useMenu } from "@hooks";
import { useState, useEffect } from "react";
const { Sider } = Layout;
import { sideBarMenu } from "@lists/sideBarMenu";
import "./styles.scss";

export const SiderBarComponent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { t } = useTranslate();
  const menu = sideBarMenu({ t });
  const items = useMenu(menu);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOverlayClick = () => {
    setCollapsed(true);
  };

  return (
    <>
      {/* Overlay para cerrar el sidebar en móvil */}
      {isMobile && !collapsed && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}
      
      <Sider
        className="sidenav"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className={`profile-container ${collapsed ? "collapsed" : ""}`}>
          <img
            src="/img/brand_icon_halftone-02.png"
            alt="Logo"
            className="sidebar-logo"
          />
        </div>
        <Menu
          theme="light"
          mode="inline"
          items={items}
          className="sidebar_menu"
          onClick={() => {
            if (isMobile) {
              setCollapsed(true);
            }
          }}
        />
      </Sider>
    </>
  );
};
