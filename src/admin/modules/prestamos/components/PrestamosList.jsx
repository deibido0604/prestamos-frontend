import { Table, Space, Button, Tag, Tooltip, Statistic, Card, Row, Col, Pagination } from "antd";
import { EditOutlined, DeleteOutlined, CalculatorOutlined } from "@ant-design/icons";
import { useState } from "react";

export const PrestamosList = ({ prestamos, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrestamos = prestamos.slice(startIndex, startIndex + itemsPerPage);

  const columns = [
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      responsive: ["sm"],
    },
    {
      title: "Monto (LPS)",
      dataIndex: "montoLps",
      key: "montoLps",
      responsive: ["md"],
      render: (monto) => `L ${monto.toLocaleString()}`,
    },
    {
      title: "Tasa %",
      dataIndex: "tasaInteres",
      key: "tasaInteres",
      render: (tasa) => `${tasa}%`,
    },
    {
      title: "Plazo (meses)",
      dataIndex: "plazoMeses",
      key: "plazoMeses",
      responsive: ["lg"],
    },
    {
      title: "Mensual (LPS)",
      dataIndex: "montoMensual",
      key: "montoMensual",
      responsive: ["lg"],
      render: (monto) => `L ${monto.toLocaleString()}`,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        let color = "blue";
        if (estado === "pagado") color = "green";
        if (estado === "vencido") color = "red";
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              type="primary"
              size="small"
              icon={<CalculatorOutlined />}
              onClick={() => {
                const interesTotal = record.montoMensual * record.plazoMeses - record.montoLps;
                alert(
                  `Detalles del Préstamo\n\nMonto Original: L ${record.montoLps.toLocaleString()}\nTasa: ${record.tasaInteres}%\nPlazo: ${record.plazoMeses} meses\nCuota Mensual: L ${record.montoMensual.toLocaleString()}\nInterés Total: L ${interesTotal.toLocaleString()}`
                );
              }}
            >
              Detalles
            </Button>
          </Tooltip>
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

  const totalMonto = prestamos.reduce((sum, p) => sum + p.montoLps, 0);
  const totalInteres = prestamos.reduce(
    (sum, p) => sum + (p.montoMensual * p.plazoMeses - p.montoLps),
    0
  );

  // Vista de Cards para móvil
  const CardView = () => (
    <>
      <Row gutter={[16, 16]}>
        {paginatedPrestamos.map((prestamo) => {
          const interesTotal = prestamo.montoMensual * prestamo.plazoMeses - prestamo.montoLps;
          return (
            <Col xs={24} sm={12} md={8} key={prestamo.id}>
              <Card className="prestamo-card" hoverable>
                <div className="card-content">
                  <h3>{prestamo.cliente}</h3>
                  <p className="card-label"><strong>Concepto:</strong> {prestamo.concepto}</p>
                  <p className="card-label"><strong>Monto:</strong> L {prestamo.montoLps.toLocaleString()}</p>
                  <p className="card-label"><strong>Tasa:</strong> {prestamo.tasaInteres}%</p>
                  <p className="card-label"><strong>Plazo:</strong> {prestamo.plazoMeses} meses</p>
                  <p className="card-label"><strong>Cuota:</strong> L {prestamo.montoMensual.toLocaleString()}</p>
                  <p className="card-label"><strong>Interés:</strong> L {interesTotal.toLocaleString()}</p>
                  <div className="card-footer">
                    <Tag color={prestamo.estado === "pagado" ? "green" : prestamo.estado === "vencido" ? "red" : "blue"}>
                      {prestamo.estado}
                    </Tag>
                  </div>
                  <Space className="card-actions">
                    <Button
                      type="primary"
                      size="small"
                      icon={<CalculatorOutlined />}
                      onClick={() => {
                        alert(
                          `Detalles del Préstamo\n\nMonto Original: L ${prestamo.montoLps.toLocaleString()}\nTasa: ${prestamo.tasaInteres}%\nPlazo: ${prestamo.plazoMeses} meses\nCuota Mensual: L ${prestamo.montoMensual.toLocaleString()}\nInterés Total: L ${interesTotal.toLocaleString()}`
                        );
                      }}
                    >
                      Detalles
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit(prestamo)}
                    >
                      Editar
                    </Button>
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(prestamo.id)}
                    >
                      Eliminar
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      <div className="pagination-wrapper">
        <Pagination
          current={currentPage}
          total={prestamos.length}
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
      dataSource={prestamos}
      rowKey="id"
      pagination={{ pageSize: 10 }}
      scroll={{ x: 1000 }}
      className="prestamos-table"
    />
  );

  return (
    <div className="prestamos-list">
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Préstamos"
              value={prestamos.length}
              suffix="préstamos"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Capital Total"
              value={totalMonto}
              prefix="L"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Interés Total"
              value={totalInteres}
              prefix="L"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <div className="desktop-view">
        <TableView />
      </div>
      <div className="mobile-view">
        <CardView />
      </div>
    </div>
  );
};
