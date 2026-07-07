import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import { CardContent } from "../../components";
import { fetchClientesAction } from "../clientes/store/thunks";
import { fetchAbonos, fetchPrestamos } from "../prestamos/store/prestamosSlice";
import "./ReportsPage.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"];
const ESTADO_COLOR = { activo: "green", pagado: "blue", vencido: "red", renovado: "orange" };
const PLAZO_CONTRATO_MESES = 3;
const TASA_INTERES_SEMANAL = 5;
const TASA_INTERES_MENSUAL = TASA_INTERES_SEMANAL * 4;

const moneyValue = (value) => Number.parseFloat(value || 0);
const LPS = (value) =>
  `L ${moneyValue(value).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const pick = (item, ...keys) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) return item[key];
  }
  return undefined;
};

const buildLoanReportRow = (prestamo, abonos = []) => {
  const monto = moneyValue(pick(prestamo, "monto", "montoLps"));
  const tasaInteresSemanal = moneyValue(pick(prestamo, "tasa_interes_semanal", "tasaInteresSemanal") ?? TASA_INTERES_SEMANAL);
  const tasaInteres = moneyValue(pick(prestamo, "tasa_interes", "tasaInteres") ?? tasaInteresSemanal * 4);
  const plazoMeses = Number(pick(prestamo, "plazo_meses", "plazoMeses")) || PLAZO_CONTRATO_MESES;
  const interesTotal = moneyValue(
    pick(prestamo, "interes_total", "interesTotal") ?? monto * (tasaInteres / 100) * plazoMeses
  );
  const totalPagar = moneyValue(pick(prestamo, "total_pagar", "totalPagar") ?? monto + interesTotal);
  const cuotaMensual = moneyValue(pick(prestamo, "cuota_mensual", "montoMensual", "cuotaPeriodica") ?? totalPagar / plazoMeses);
  const abonadoDesdeAbonos = abonos.reduce((sum, abono) => sum + moneyValue(abono.monto), 0);
  const totalAbonado = abonadoDesdeAbonos || moneyValue(pick(prestamo, "total_abonado", "totalAbonado"));
  const saldoReportado = pick(prestamo, "saldo_pendiente", "saldo");
  const saldoPendiente = saldoReportado !== undefined ? moneyValue(saldoReportado) : Math.max(totalPagar - totalAbonado, 0);
  const fechaInicio = pick(prestamo, "fecha_inicio", "fechaInicio");
  const fechaVencimiento = pick(prestamo, "fecha_vencimiento", "fechaFin") || (fechaInicio ? dayjs(fechaInicio).add(plazoMeses, "month").format("YYYY-MM-DD") : null);

  return {
    id: prestamo.id,
    clienteId: pick(prestamo, "cliente_id", "clienteId"),
    cliente: pick(prestamo, "cliente_nombre", "cliente", "nombreCliente") || "-",
    concepto: prestamo.concepto || "",
    monto,
    tasaInteresSemanal,
    tasaInteres,
    tipoInteres: pick(prestamo, "tipo_interes", "tipoInteres") || "semanal",
    plazoMeses,
    interesTotal,
    totalPagar,
    cuotaMensual,
    totalAbonado,
    saldoPendiente,
    estado: prestamo.estado || "activo",
    fechaInicio,
    fechaVencimiento,
    renovacionDe: pick(prestamo, "renovacion_de", "renovacionDe"),
    renovacion: pick(prestamo, "renovacion_de", "renovacionDe") ? "Renovado" : "Manual",
  };
};

const ReportsPage = () => {
  const dispatch = useDispatch();
  const prestamos = useSelector((state) => state.prestamos.list || []);
  const abonosPorPrestamo = useSelector((state) => state.prestamos.abonos || {});
  const clientes = useSelector((state) => state.clientes.clientesList || state.clientes.list || []);

  const [filtroEstado, setFiltroEstado] = useState(null);
  const [filtroClienteId, setFiltroClienteId] = useState(null);
  const [fechas, setFechas] = useState(null);

  useEffect(() => {
    dispatch(fetchPrestamos());
    dispatch(fetchClientesAction());
  }, [dispatch]);

  useEffect(() => {
    prestamos.forEach((prestamo) => {
      if (prestamo.id && !abonosPorPrestamo[prestamo.id]) {
        dispatch(fetchAbonos(prestamo.id));
      }
    });
  }, [dispatch, prestamos, abonosPorPrestamo]);

  const reportePrestamos = useMemo(
    () => prestamos.map((prestamo) => buildLoanReportRow(prestamo, abonosPorPrestamo[prestamo.id] || [])),
    [prestamos, abonosPorPrestamo]
  );

  const prestamosFiltrados = useMemo(() => {
    return reportePrestamos.filter((prestamo) => {
      if (filtroEstado && prestamo.estado !== filtroEstado) return false;
      if (filtroClienteId && prestamo.clienteId !== filtroClienteId) return false;

      if (fechas?.[0] && fechas?.[1]) {
        if (!prestamo.fechaInicio) return false;
        const fecha = dayjs(prestamo.fechaInicio).valueOf();
        const start = dayjs(fechas[0]).startOf("day").valueOf();
        const end = dayjs(fechas[1]).endOf("day").valueOf();
        if (fecha < start || fecha > end) return false;
      }

      return true;
    });
  }, [reportePrestamos, filtroEstado, filtroClienteId, fechas]);

  const resumen = useMemo(() => {
    return prestamosFiltrados.reduce(
      (acc, prestamo) => ({
        capital: acc.capital + prestamo.monto,
        interes: acc.interes + prestamo.interesTotal,
        totalPagar: acc.totalPagar + prestamo.totalPagar,
        abonado: acc.abonado + prestamo.totalAbonado,
        saldo: acc.saldo + prestamo.saldoPendiente,
      }),
      { capital: 0, interes: 0, totalPagar: 0, abonado: 0, saldo: 0 }
    );
  }, [prestamosFiltrados]);

  const datosEstado = useMemo(() => {
    const conteo = {};
    prestamosFiltrados.forEach((prestamo) => {
      conteo[prestamo.estado] = (conteo[prestamo.estado] || 0) + 1;
    });
    return Object.entries(conteo).map(([name, value]) => ({ name, value }));
  }, [prestamosFiltrados]);

  const datosPorMes = useMemo(() => {
    const meses = {};
    prestamosFiltrados.forEach((prestamo) => {
      if (!prestamo.fechaInicio) return;
      const mes = dayjs(prestamo.fechaInicio).format("YYYY-MM");
      meses[mes] = meses[mes] || { mes, capital: 0, abonado: 0, saldo: 0 };
      meses[mes].capital += prestamo.monto;
      meses[mes].abonado += prestamo.totalAbonado;
      meses[mes].saldo += prestamo.saldoPendiente;
    });
    return Object.values(meses).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [prestamosFiltrados]);

  const columns = [
    { title: "Cliente", dataIndex: "cliente", key: "cliente", sorter: (a, b) => a.cliente.localeCompare(b.cliente) },
    { title: "Monto", dataIndex: "monto", key: "monto", render: LPS, sorter: (a, b) => a.monto - b.monto },
    { title: "Tasa", dataIndex: "tasaInteres", key: "tasaInteres", render: (value, row) => `${row.tasaInteresSemanal}% sem / ${value}% mes` },
    { title: "Interes", dataIndex: "interesTotal", key: "interesTotal", render: LPS },
    { title: "Total", dataIndex: "totalPagar", key: "totalPagar", render: LPS },
    { title: "Abonado", dataIndex: "totalAbonado", key: "totalAbonado", render: LPS },
    { title: "Saldo", dataIndex: "saldoPendiente", key: "saldoPendiente", render: LPS },
    { title: "Cuota mensual", dataIndex: "cuotaMensual", key: "cuotaMensual", render: LPS },
    { title: "Contrato", dataIndex: "plazoMeses", key: "plazoMeses", render: (value) => `${value} meses` },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => <Tag color={ESTADO_COLOR[estado] || "default"}>{estado}</Tag>,
    },
    { title: "Inicio", dataIndex: "fechaInicio", key: "fechaInicio", render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-") },
    { title: "Vence", dataIndex: "fechaVencimiento", key: "fechaVencimiento", render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-") },
    { title: "Renovacion", dataIndex: "renovacion", key: "renovacion" },
  ];

  const exportRows = () => prestamosFiltrados.map((prestamo) => ({
    Cliente: prestamo.cliente,
    Monto: prestamo.monto,
    "Tasa semanal": `${prestamo.tasaInteresSemanal}%`,
    "Tasa mensual": `${prestamo.tasaInteres}%`,
    "Interes total": prestamo.interesTotal,
    "Total a pagar": prestamo.totalPagar,
    "Cuota mensual": prestamo.cuotaMensual,
    Abonado: prestamo.totalAbonado,
    Saldo: prestamo.saldoPendiente,
    "Contrato meses": prestamo.plazoMeses,
    "Tipo interes": prestamo.tipoInteres,
    Estado: prestamo.estado,
    "Fecha inicio": prestamo.fechaInicio ? dayjs(prestamo.fechaInicio).format("DD/MM/YYYY") : "",
    "Fecha vencimiento": prestamo.fechaVencimiento ? dayjs(prestamo.fechaVencimiento).format("DD/MM/YYYY") : "",
    Renovacion: prestamo.renovacion,
    "Renovado de": prestamo.renovacionDe || "",
    Concepto: prestamo.concepto,
  }));

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportRows());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Prestamos");
    XLSX.writeFile(wb, `reporte_prestamos_${dayjs().format("YYYYMMDD")}.xlsx`);
    message.success("Excel exportado correctamente");
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Reporte de Prestamos", 14, 15);
    doc.text(`Generado: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 25);

    autoTable(doc, {
      head: [["Cliente", "Monto", "Tasa", "Interes", "Total", "Abonado", "Saldo", "Cuota", "Contrato", "Estado", "Inicio", "Vence"]],
      body: prestamosFiltrados.map((p) => [
        p.cliente,
        LPS(p.monto),
        `${p.tasaInteresSemanal}% sem / ${p.tasaInteres}% mes`,
        LPS(p.interesTotal),
        LPS(p.totalPagar),
        LPS(p.totalAbonado),
        LPS(p.saldoPendiente),
        LPS(p.cuotaMensual),
        `${p.plazoMeses} meses`,
        p.estado,
        p.fechaInicio ? dayjs(p.fechaInicio).format("DD/MM/YYYY") : "-",
        p.fechaVencimiento ? dayjs(p.fechaVencimiento).format("DD/MM/YYYY") : "-",
      ]),
      startY: 35,
      theme: "striped",
      headStyles: { fillColor: [22, 119, 255] },
      styles: { fontSize: 8 },
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
        <h1>Reportes de Prestamos</h1>
        <p className="subtitle">Prestamos, abonos, saldos y renovaciones</p>
      </div>

      <Card className="filters-card">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={8}>
            <label>Estado</label>
            <Select allowClear placeholder="Todos" style={{ width: "100%" }} value={filtroEstado} onChange={setFiltroEstado}>
              <Option value="activo">Activo</Option>
              <Option value="pagado">Pagado</Option>
              <Option value="vencido">Vencido</Option>
              <Option value="renovado">Renovado</Option>
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
              optionFilterProp="children"
            >
              {clientes.map((cliente) => (
                <Option key={cliente.id} value={cliente.id}>
                  {cliente.nombreCompleto || cliente.nombrecompleto}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <label>Rango de fechas de inicio</label>
            <RangePicker style={{ width: "100%" }} value={fechas} onChange={setFechas} format="DD/MM/YYYY" />
          </Col>
          <Col xs={24}>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={limpiarFiltros}>Limpiar</Button>
              <Button type="primary" icon={<FileExcelOutlined />} onClick={exportToExcel}>Excel</Button>
              <Button type="primary" danger icon={<FilePdfOutlined />} onClick={exportToPDF}>PDF</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={4}><Card><Statistic title="Prestamos" value={prestamosFiltrados.length} /></Card></Col>
        <Col xs={24} sm={12} lg={5}><Card><Statistic title="Capital" value={resumen.capital} prefix="L" precision={2} /></Card></Col>
        <Col xs={24} sm={12} lg={5}><Card><Statistic title="Interes" value={resumen.interes} prefix="L" precision={2} /></Card></Col>
        <Col xs={24} sm={12} lg={5}><Card><Statistic title="Abonado" value={resumen.abonado} prefix="L" precision={2} valueStyle={{ color: "#52c41a" }} /></Card></Col>
        <Col xs={24} sm={12} lg={5}><Card><Statistic title="Saldo pendiente" value={resumen.saldo} prefix="L" precision={2} valueStyle={{ color: "#fa8c16" }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Capital, abonos y saldo por mes" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => LPS(value)} />
                <Bar dataKey="capital" fill="#1677ff" name="Capital" />
                <Bar dataKey="abonado" fill="#52c41a" name="Abonado" />
                <Bar dataKey="saldo" fill="#fa8c16" name="Saldo" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Distribucion por estado" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={datosEstado} cx="50%" cy="50%" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={86} dataKey="value">
                  {datosEstado.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Detalle de prestamos" className="table-card">
        <Table columns={columns} dataSource={prestamosFiltrados} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 1400 }} />
      </Card>
    </CardContent>
  );
};

export default ReportsPage;
