import { Table, Space, Button, Tag, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";

export const ClientesList = ({ clientes, onEdit, onDelete }) => {
  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombreCompleto",
      key: "nombreCompleto",
      responsive: ["sm"],
    },
    {
      title: "Cédula",
      dataIndex: "cedula",
      key: "cedula",
      responsive: ["md"],
    },
    {
      title: "Contacto",
      key: "contacto",
      responsive: ["md"],
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.correo}>
            <MailOutlined style={{ cursor: "pointer" }} />
          </Tooltip>
          <Tooltip title={record.telefono}>
            <PhoneOutlined style={{ cursor: "pointer" }} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Profesión",
      dataIndex: "profesion",
      key: "profesion",
      responsive: ["lg"],
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => (
        <Tag color={estado === "activo" ? "green" : "red"}>
          {estado === "activo" ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          >
            Editar
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record.id)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={clientes}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      scroll={{ x: 900 }}
      className="clientes-table"
    />
  );
};
