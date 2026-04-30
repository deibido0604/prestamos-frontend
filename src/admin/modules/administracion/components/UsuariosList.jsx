import { Table, Space, Button, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

export const UsuariosList = ({ usuarios, onEdit, onDelete }) => {
  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      responsive: ["sm"],
    },
    {
      title: "Correo",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
    },
    {
      title: "Usuario",
      dataIndex: "username",
      key: "username",
      responsive: ["md"],
    },
    {
      title: "Rol",
      dataIndex: "rol",
      key: "rol",
      render: (rol) => (
        <Tag color={rol === "admin" ? "red" : "blue"}>{rol}</Tag>
      ),
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      render: (activo) => (
        <Tag color={activo === "activo" || activo === true ? "green" : "red"}>
          {activo === "activo" || activo === true ? "Activo" : "Inactivo"}
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
      dataSource={usuarios}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      scroll={{ x: 800 }}
      className="usuarios-table"
    />
  );
};
