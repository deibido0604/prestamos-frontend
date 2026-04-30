import { Table, Space, Button, Tag, Tooltip, Statistic, Card, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined, CalculatorOutlined } from "@ant-design/icons";

export const PrestamosList = ({ prestamos, onEdit, onDelete }) => {
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

      <Table
        columns={columns}
        dataSource={prestamos}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
        className="prestamos-table"
      />
    </div>
  );
};
