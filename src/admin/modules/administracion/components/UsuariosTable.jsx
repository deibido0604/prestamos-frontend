import { useState, useEffect } from "react";
import { Table, Space, Tag, Button, Popconfirm, Card, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { permissions } from "@utils";
import { Can } from "@components";

const MobileCardView = ({ data, onEdit, onDelete, t }) => (
  <Row gutter={[16, 16]}>
    {data.map((user) => (
      <Col xs={24} key={user.id}>
        <Card
          hoverable
          className="usuario-card"
          actions={[
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(user)}>
              {t("usuarios.edit")}
            </Button>,
            <Popconfirm
              title={t("popConfirm.eliminate")}
              description={t("usuarios.delete_confirm")}
              onConfirm={() => onDelete(user.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
          ]}
        >
          <Card.Meta
            title={user.nombre}
            description={
              <Space direction="vertical" size="small">
                <div><strong>{t("usuarios.username")}:</strong> {user.username}</div>
                <div><strong>{t("usuarios.email")}:</strong> {user.email}</div>
                <div>
                  <Tag color={user.active ? "green" : "red"}>
                    {user.active ? t("usuarios.active") : t("usuarios.inactive")}
                  </Tag>
                </div>
              </Space>
            }
          />
        </Card>
      </Col>
    ))}
  </Row>
);

const UsuariosTable = ({ data, loading, onEdit, onDelete, t }) => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 768px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const columns = [
    { title: "#", dataIndex: "id", width: "5%", sorter: (a, b) => a.id - b.id },
    { title: t("usuarios.nombre"), dataIndex: "nombre", sorter: (a, b) => a.nombre.localeCompare(b.nombre) },
    { title: t("usuarios.username"), dataIndex: "username" },
    { title: t("usuarios.email"), dataIndex: "email", ellipsis: true },
    {
      title: t("usuarios.active"),
      dataIndex: "active",
      render: (active) => <Tag color={active ? "green" : "red"}>{active ? t("usuarios.active") : t("usuarios.inactive")}</Tag>,
      filters: [{ text: t("usuarios.active"), value: true }, { text: t("usuarios.inactive"), value: false }],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: t("usuarios.acciones"),
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Can I={permissions.Actions.DELETE} a={permissions.Subjects.ADMINISTRACION} passThrough>
            {(allowed) => allowed && (
              <Popconfirm title={t("popConfirm.eliminate")} description={t("usuarios.delete_confirm")} onConfirm={() => onDelete(record.id)}>
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Can>
        </Space>
      ),
    },
  ];

  if (isMobile) {
    return <MobileCardView data={data} onEdit={onEdit} onDelete={onDelete} t={t} />;
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{ showTotal: (total) => `${t("usuarios.total")}: ${total}`, pageSize: 10, showSizeChanger: true }}
      scroll={{ x: 800 }}
    />
  );
};

export default UsuariosTable;
