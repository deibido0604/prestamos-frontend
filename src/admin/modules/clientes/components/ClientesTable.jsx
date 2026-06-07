import { useState, useEffect } from "react";
import { Space, Table, Tag, Button, Popconfirm, Card, Typography, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { permissions } from "@utils";
import { Can } from "@components";

const { Text } = Typography;

// Componente de vista móvil (definido FUERA del componente principal)
const MobileCardView = ({ data, onEdit, onDelete, renderReferencias, t }) => (
  <Row gutter={[16, 16]}>
    {data.map((cliente) => (
      <Col xs={24} key={cliente.id}>
        <Card
          hoverable
          className="cliente-card"
          actions={[
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(cliente)}>
              {t("clientes.edit")}
            </Button>,
            <Popconfirm
              title={t("popConfirm.eliminate")}
              description={t("clientes.delete_confirm")}
              onConfirm={() => onDelete(cliente.id)}
              okText={t("common.yes")}
              cancelText={t("common.no")}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                {t("common.delete")}
              </Button>
            </Popconfirm>
          ]}
        >
          <Card.Meta
            title={cliente.nombreCompleto}
            description={
              <Space direction="vertical" size="small">
                <div><strong>{t("clientes.cedula")}:</strong> {cliente.cedula}</div>
                <div><strong>{t("clientes.telefono")}:</strong> {cliente.telefono}</div>
                <div><strong>{t("clientes.correo")}:</strong> {cliente.correo || "-"}</div>
                <div><strong>{t("clientes.estado")}:</strong> <Tag color={cliente.estado === "activo" ? "green" : "red"}>{cliente.estado === "activo" ? t("clientes.active") : t("clientes.inactive")}</Tag></div>
                <div><strong>{t("clientes.referencias")}:</strong> {renderReferencias(cliente.referencias)}</div>
              </Space>
            }
          />
        </Card>
      </Col>
    ))}
  </Row>
);

const ClientesTable = ({ data, loading, onEdit, onDelete, t }) => {
  // Estado inicial calculado directamente (sin setState síncrono en efecto)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 768px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Formatear referencias para mostrar
  const renderReferencias = (referencias) => {
    if (!referencias) return "-";
    let refs = [];
    try {
      if (typeof referencias === 'string') {
        if (referencias.startsWith('[')) {
          refs = JSON.parse(referencias);
        } else {
          const lines = referencias.split('\n');
          refs = lines.map(line => {
            const [nombre, telefono] = line.split(':').map(s => s.trim());
            return { nombre, telefono };
          }).filter(r => r.nombre);
        }
      } else if (Array.isArray(referencias)) {
        refs = referencias;
      }
    } catch (e) {
      console.error("Error parsing referencias:", e);
      refs = [];
    }
    if (refs.length === 0) return "-";
    return (
      <Space direction="vertical" size="small">
        {refs.map((ref, idx) => (
          <div key={idx}>
            <Tag icon={<UserOutlined />}>{ref.nombre}</Tag>
            <Tag icon={<PhoneOutlined />}>{ref.telefono}</Tag>
          </div>
        ))}
      </Space>
    );
  };

  const columns = [
    { title: "#", dataIndex: "id", width: "5%", sorter: (a, b) => a.id - b.id },
    { title: t("clientes.nombre"), dataIndex: "nombreCompleto", sorter: (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto) },
    { title: t("clientes.cedula"), dataIndex: "cedula" },
    { title: t("clientes.telefono"), dataIndex: "telefono" },
    { title: t("clientes.correo"), dataIndex: "correo", ellipsis: true },
    { title: t("clientes.referencias"), dataIndex: "referencias", render: renderReferencias, ellipsis: true },
    {
      title: t("clientes.estado"),
      dataIndex: "estado",
      render: (estado) => <Tag color={estado === "activo" ? "green" : "red"}>{estado === "activo" ? t("clientes.active") : t("clientes.inactive")}</Tag>,
      filters: [{ text: t("clientes.active"), value: "activo" }, { text: t("clientes.inactive"), value: "inactivo" }],
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: t("clientes.acciones"),
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Can I={permissions.Actions.DELETE} a={permissions.Subjects.CLIENTES} passThrough>
            {(allowed) => allowed && (
              <Popconfirm title={t("popConfirm.eliminate")} description={t("clientes.delete_confirm")} onConfirm={() => onDelete(record.id)}>
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Can>
        </Space>
      ),
    },
  ];

  if (isMobile) {
    return <MobileCardView data={data} onEdit={onEdit} onDelete={onDelete} renderReferencias={renderReferencias} t={t} />;
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{ showTotal: (total) => `${t("clientes.total")}: ${total}`, pageSize: 10, showSizeChanger: true }}
      scroll={{ x: 1000 }}
    />
  );
};

export default ClientesTable;