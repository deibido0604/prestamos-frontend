import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Button,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { CardContent } from "../../../admin/components";
import "./ReportsPage.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ReportsPage = () => {
  const prestamos = useSelector((state) => state.prestamos.list);
  const clientes = useSelector((state) => state.clientes.list);

  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [filtroClienteId, setFiltroClienteId] = useState(null);
  const [fechas, setFechas] = useState(null);

  // Aplicar filtros
  const prestamosFiltrados = useMemo(() => {
    let filtered = [...prestamos];

    if (filtroEstado) {
      filtered = filtered.filter((p) => p.estado === filtroEstado);
    }

    if (filtroClienteId) {
      filtered = filtered.filter((p) => p.clienteId === filtroClienteId);
    }

    if (fechas && fechas[0] && fechas[1]) {
      const start = dayjs(fechas[0]).startOf("day");
      const end = dayjs(fechas[1]).endOf("day");
      filtered = filtered.filter((p) => {
        if (!p.fechaInicio) return false;
        const fecha = dayjs(p.fechaInicio);
        return fecha.isBetween(start, end, null, "[]");
      });
    }

    return filtered;
  }, [prestamos, filtroEstado, filtroClienteId, fechas]);

  // Métricas generales
  const totalCapital = useMemo(
    () => prestamosFiltrados.reduce((sum, p) => sum + (p.montoLps || 0), 0),
    [prestamosFiltrados]
  );
  const totalInteres = useMemo(
    () => prestamosFiltrados.reduce((sum, p) => sum + (p.interesTotal || 0), 0),
    [prestamosFiltrados]
  );
  const totalPrestamos = prestamosFiltrados.length;

  // Datos para gráfico de pastel (por estado)
  const datosEstado = useMemo(() => {
    const conteo = {};
    prestamosFiltrados.forEach((p) => {
      const estado = p.estado || "desconocido";
      conteo[estado] = (conteo[estado] || 0) + 1;
    });
    return Object.keys(conteo).map((key) => ({
      name: key,
      value: conteo[key],
    }));
  }, [prestamosFiltrados]);

  // Datos para gráfico de barras (montos por mes de inicio)
  const datosPorMes = useMemo(() => {
    const meses = {};
    prestamosFiltrados.forEach((p) => {
      if (p.fechaInicio) {
        const mes = dayjs(p.fechaInicio).format("YYYY-MM");
        meses[mes] = (meses[mes] || 0) + (p.montoLps || 0);
      }
    });
    return Object.entries(meses)
      .map(([mes, monto]) => ({ mes, monto }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [prestamosFiltrados]);

  // Columnas para la tabla
  const columns = [
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      sorter: (a, b) => a.cliente.localeCompare(b.cliente),
    },
    {
      title: "Monto (LPS)",
      dataIndex: "montoLps",
      key: "montoLps",
      render: (val) => `L ${val?.toLocaleString()}`,
      sorter: (a, b) => (a.montoLps || 0) - (b.montoLps || 0),
    },
    {
      title: "Interés Total",
      dataIndex: "interesTotal",
      key: "interesTotal",
      render: (val) => `L ${val?.toLocaleString()}`,
    },
    {
      title: "Cuota Mensual",
      dataIndex: "montoMensual",
      key: "montoMensual",
      render: (val) => `L ${val?.toLocaleString()}`,
    },
    {
      title: "Plazo (meses)",
      dataIndex: "plazoMeses",
      key: "plazoMeses",
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
      title: "Fecha Inicio",
      dataIndex: "fechaInicio",
      key: "fechaInicio",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
  ];

  // Exportar a Excel
  const exportToExcel = () => {
    const dataToExport = prestamosFiltrados.map((p) => ({
      Cliente: p.cliente,
      Monto: p.montoLps,
      "Interés Total": p.interesTotal,
      "Cuota Mensual": p.montoMensual,
      Plazo: p.plazoMeses,
      Estado: p.estado,
      "Fecha Inicio": p.fechaInicio
        ? dayjs(p.fechaInicio).format("DD/MM/YYYY")
        : "",
      Concepto: p.concepto,
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Prestamos");
    XLSX.writeFile(wb, `reporte_prestamos_${dayjs().format("YYYYMMDD")}.xlsx`);
    message.success("Excel exportado correctamente");
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Reporte de Préstamos", 14, 15);
    doc.text(`Generado: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 25);

    const tableData = prestamosFiltrados.map((p) => [
      p.cliente,
      `L ${p.montoLps?.toLocaleString()}`,
      `L ${p.interesTotal?.toLocaleString()}`,
      `L ${p.montoMensual?.toLocaleString()}`,
      p.plazoMeses,
      p.estado,
      p.fechaInicio ? dayjs(p.fechaInicio).format("DD/MM/YYYY") : "-",
    ]);

    autoTable(doc, {
      head: [["Cliente", "Monto", "Interés Total", "Cuota Mensual", "Plazo", "Estado", "Fecha Inicio"]],
      body: tableData,
      startY: 35,
      theme: "striped",
      headStyles: { fillColor: [72, 91, 255] },
    });

    doc.save(`reporte_prestamos_${dayjs().format("YYYYMMDD")}.pdf`);
    message.success("PDF exportado correctamente");
  };

  const limpiarFiltros = () => {
    setFiltroEstado(null);
    setFiltroClienteId(null);
    setFechas(null);
  };

  return (
    <CardContent className="reports-page">
      <div className="reports-header">
        <h1>Reportes de Préstamos</h1>
        <p className="subtitle">Análisis y exportación de datos</p>
      </div>

      {/* Filtros */}
      <Card className="filters-card">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={8}>
            <label>Estado</label>
            <Select
              allowClear
              placeholder="Todos"
              style={{ width: "100%" }}
              value={filtroEstado}
              onChange={setFiltroEstado}
            >
              <Option value="activo">Activo</Option>
              <Option value="pagado">Pagado</Option>
              <Option value="vencido">Vencido</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <label>Cliente</label>
            <Select
              allowClear
              placeholder="Seleccionar cliente"
              style={{ width: "100%" }}
              value={filtroClienteId}
              onChange={setFiltroClienteId}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {clientes.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.nombreCompleto}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <label>Rango de fechas (inicio)</label>
            <RangePicker
              style={{ width: "100%" }}
              value={fechas}
              onChange={setFechas}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={limpiarFiltros}>
                Limpiar
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={exportToExcel}
              >
                Excel
              </Button>
              <Button
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={exportToPDF}
                style={{ background: "#ff4d4f", borderColor: "#ff4d4f" }}
              >
                PDF
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tarjetas de resumen */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Préstamos"
              value={totalPrestamos}
              suffix="préstamos"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Capital Total"
              value={totalCapital}
              prefix="L"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Interés Total Generado"
              value={totalInteres}
              prefix="L"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Montos por Mes de Inicio" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => `L ${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="monto" fill="#485bff" name="Monto (LPS)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Distribución por Estado" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={datosEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {datosEstado.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Tabla de datos */}
      <Card title="Detalle de Préstamos" className="table-card">
        <Table
          columns={columns}
          dataSource={prestamosFiltrados}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </CardContent>
  );
};

export default ReportsPage;
