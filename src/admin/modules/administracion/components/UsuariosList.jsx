import { Table, Space, Button, Tag, Card, Row, Col, Pagination } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";

export const UsuariosList = ({ usuarios, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsuarios = usuarios.slice(startIndex, startIndex + itemsPerPage);

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

  // Vista de Cards para móvil
  const CardView = () => (
    <>
      <Row gutter={[16, 16]}>
        {paginatedUsuarios.map((usuario) => (
          <Col xs={24} sm={12} md={8} key={usuario.id}>
            <Card className="usuario-card" hoverable>
              <div className="card-content">
                <h3>{usuario.nombre}</h3>
                <p className="card-label"><strong>Usuario:</strong> {usuario.username}</p>
                <p className="card-label"><strong>Correo:</strong> {usuario.email}</p>
                <div className="card-tags">
                  <Tag color={usuario.rol === "admin" ? "red" : "blue"}>
                    {usuario.rol}
                  </Tag>
                  <Tag color={usuario.activo === "activo" || usuario.activo === true ? "green" : "red"}>
                    {usuario.activo === "activo" || usuario.activo === true ? "Activo" : "Inactivo"}
                  </Tag>
                </div>
                <Space className="card-actions">
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(usuario)}
                  >
                    Editar
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(usuario.id)}
                  >
                    Eliminar
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="pagination-wrapper">
        <Pagination
          current={currentPage}
          total={usuarios.length}
          pageSize={itemsPerPage}
          onChange={setCurrentPage}
          showSizeChanger={false}
          style={{ textAlign: "center", marginTop: 16 }}
        />
      </div>
    </>
  );

  // Vista de Table para desktop
  const TableView = () => (
    <Table
      columns={columns}
      dataSource={usuarios}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      scroll={{ x: 800 }}
      className="usuarios-table"
    />
  );

  return (
    <div className="usuarios-list">
      <div className="desktop-view">
        <TableView />
      </div>
      <div className="mobile-view">
        <CardView />
      </div>
    </div>
  );
};
