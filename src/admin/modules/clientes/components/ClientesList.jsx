import { Table, Space, Button, Tag, Tooltip, Card, Row, Col, Pagination } from "antd";
import { EditOutlined, DeleteOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { useState } from "react";

export const ClientesList = ({ clientes, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClientes = clientes.slice(startIndex, startIndex + itemsPerPage);

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

  // Vista de Cards para móvil
  const CardView = () => (
    <>
      <Row gutter={[16, 16]}>
        {paginatedClientes.map((cliente) => (
          <Col xs={24} sm={12} md={8} key={cliente.id}>
            <Card className="cliente-card" hoverable>
              <div className="card-content">
                <h3>{cliente.nombreCompleto}</h3>
                <p className="card-label"><strong>Cédula:</strong> {cliente.cedula}</p>
                <p className="card-label"><strong>Correo:</strong> {cliente.correo}</p>
                <p className="card-label"><strong>Teléfono:</strong> {cliente.telefono}</p>
                <p className="card-label"><strong>Profesión:</strong> {cliente.profesion}</p>
                <p className="card-label"><strong>Dirección:</strong> {cliente.direccion}</p>
                <div className="card-footer">
                  <Tag color={cliente.estado === "activo" ? "green" : "red"}>
                    {cliente.estado === "activo" ? "Activo" : "Inactivo"}
                  </Tag>
                </div>
                <Space className="card-actions">
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(cliente)}
                  >
                    Editar
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDelete(cliente.id)}
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
          total={clientes.length}
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
      dataSource={clientes}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      scroll={{ x: 900 }}
      className="clientes-table"
    />
  );

  return (
    <div className="clientes-list">
      <div className="desktop-view">
        <TableView />
      </div>
      <div className="mobile-view">
        <CardView />
      </div>
    </div>
  );
};
