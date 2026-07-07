import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button, Modal, Form, Input, InputNumber, Select, DatePicker, Radio,
  Table, Tag, Space, Popconfirm, message, Drawer, Descriptions,
  Divider, List, Typography, Row, Col, Card, Statistic, Alert,
} from "antd";
import {
  ReloadOutlined, DeleteOutlined, EyeOutlined, SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PageTitle } from "@components";
import { CardContent } from "../../components";
import { useMountEffect } from "@hooks";
import { fetchClientesAction } from "../clientes/store/thunks";
import {
  fetchPrestamos, createPrestamo, deletePrestamo,
  renovarPrestamo, fetchAbonos, createAbono, deleteAbono, clearPrestamos,
  calcularFechasAlertas,
} from "./store/prestamosSlice";
import { addAlertasLocal } from "../alertas/store/alertasSlice";
import { markAlertaLeidaAuto, despacharMarcarLeidas } from "../alertas/store/thunks";

const { Text } = Typography;

const LPS = (v) => `L ${parseFloat(v || 0).toLocaleString("es-HN", { minimumFractionDigits: 2 })}`;

const ESTADO_COLOR = { activo: "green", pagado: "blue", vencido: "red", renovado: "orange" };
const TASA_INTERES_SEMANAL = 5;
const TASA_INTERES_MENSUAL = 20;
const PLAZO_CONTRATO_MESES = 3;
const getTasaMensual = (tasaSemanal) => Number.parseFloat((Number(tasaSemanal || 0) * 4).toFixed(2));

const FRECUENCIA_LABEL = {
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
};
const CUOTAS_POR_PLAZO = {
  semanal: PLAZO_CONTRATO_MESES * 4,
  quincenal: PLAZO_CONTRATO_MESES * 2,
  mensual: PLAZO_CONTRATO_MESES,
};

const construirAlertasParaPrestamo = (prestamo) => {
  if (!prestamo?.id) return [];
  const frecuencia = prestamo.frecuencia_pago || "mensual";
  const fechaInicio = prestamo.fecha_inicio || prestamo.fechaInicio;
  const cuotas =
    frecuencia === "semanal" ? Number(prestamo.plazo_meses || 3) * 4 :
    frecuencia === "quincenal" ? Number(prestamo.plazo_meses || 3) * 2 :
    Number(prestamo.plazo_meses || 3);
  const fechas = calcularFechasAlertas({ fechaInicio, frecuencia, numeroCuotas: cuotas });
  return fechas.map((f, idx) => ({
    id: `local-prestamo-${prestamo.id}-${idx + 1}`,
    nombre: `Pago #${idx + 1} â€” ${prestamo.cliente_nombre || prestamo.cliente || "Cliente"}`,
    evento: "pago_proximo",
    mensaje: `Cuota #${idx + 1} de ${cuotas} prÃ³xima a vencer (${frecuencia})`,
    fecha: dayjs(f).format("YYYY-MM-DD"),
    destinatarios: [],
    activo: true,
    frecuencia,
    prestamo_id: prestamo.id,
    leido: false,
    origen: "prestamo",
  }));
};

const APLICA_A_LABEL = {
  interes: "Solo InterÃ©s",
  capital: "Solo Capital (Saldo)",
  mixto: "Mixto (InterÃ©s + Capital)",
};

const normalizarDestino = (a) => {
  const raw = String(a?.aplica_a || a?.tipo_abono || a?.destino_abono || a?.tipo || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (!raw) return "interes";
  if (raw.includes("interes")) return "interes";
  if (raw.includes("capital") || raw.includes("saldo")) return "capital";
  if (raw.includes("mixto") || raw.includes("ambos")) return "mixto";
  return "interes";
};

const calcularMontoAbono = (a) => {
  const destino = normalizarDestino(a);
  const mi = parseFloat(a?.monto_interes || 0);
  const mc = parseFloat(a?.monto_capital || 0);
  const total = parseFloat(a?.monto || 0);
  if (mi > 0 || mc > 0) return { mi, mc };
  if (destino === "interes") return { mi: total, mc: 0 };
  if (destino === "capital") return { mi: 0, mc: total };
  return { mi: total / 2, mc: total / 2 };
};

const PrestamoForm = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const clientes = useSelector((s) => s.clientes.clientesList || s.clientes.list || []);
  const [loading, setLoading] = useState(false);
  const [calculos, setCalculos] = useState({});

  const recalcular = (vals) => {
    const { monto, tasa_interes_semanal, frecuencia_pago } = vals;
    const tasaMensual = getTasaMensual(tasa_interes_semanal);
    const frecuencia = frecuencia_pago || "mensual";
    const numCuotas = CUOTAS_POR_PLAZO[frecuencia] || PLAZO_CONTRATO_MESES;
    if (monto && tasaMensual > 0) {
      const interes_total = parseFloat((monto * (tasaMensual / 100) * PLAZO_CONTRATO_MESES).toFixed(2));
      const total_pagar = parseFloat((monto + interes_total).toFixed(2));
      const cuota_por_periodo = parseFloat((total_pagar / numCuotas).toFixed(2));
      setCalculos({
        interes_total,
        total_pagar,
        cuota_mensual: cuota_por_periodo,
        tasa_interes_mensual: tasaMensual,
        frecuencia,
        numCuotas,
      });
    } else setCalculos({});
  };

  const handleClose = () => {
    form.resetFields();
    setCalculos({});
    onClose();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const frecuenciaSeleccionada = values.frecuencia_pago || "mensual";
      const prestamoCreado = await dispatch(createPrestamo({
        ...values,
        tasa_interes_semanal: Number(values.tasa_interes_semanal),
        tasa_interes: getTasaMensual(values.tasa_interes_semanal),
        fecha_inicio: values.fecha_inicio.format("YYYY-MM-DD"),
        fecha_vencimiento: values.fecha_inicio.add(PLAZO_CONTRATO_MESES, "month").format("YYYY-MM-DD"),
        plazo_meses: PLAZO_CONTRATO_MESES,
        tipo_interes: "semanal",
        frecuencia_pago: frecuenciaSeleccionada,
      })).unwrap();
      const nuevasAlertas = construirAlertasParaPrestamo(prestamoCreado);
      if (nuevasAlertas.length > 0) {
        dispatch(addAlertasLocal(nuevasAlertas));
        message.success(`PrÃ©stamo creado â€” ${nuevasAlertas.length} alerta(s) generada(s)`);
      } else {
        message.success("PrÃ©stamo creado");
      }
      handleClose();
      onSuccess();
    } catch (e) {
      message.error(e || "Error al crear prÃ©stamo");
    } finally { setLoading(false); }
  };

  return (
    <Modal
      title="Nuevo PrÃ©stamo"
      open={open}
      onCancel={handleClose}
      footer={null}
      width="95%"
      style={{ maxWidth: 560 }}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={(_, all) => recalcular(all)}
        initialValues={{ fecha_inicio: dayjs(), tasa_interes_semanal: TASA_INTERES_SEMANAL, frecuencia_pago: "mensual" }}
      >
        <Form.Item
          name="frecuencia_pago"
          label="Frecuencia de pago"
          tooltip="Define cada cuánto el cliente abonará. Las alertas se generan automáticamente según esta frecuencia."
          rules={[{ required: true, message: "Seleccione la frecuencia de pago" }]}
        >
          <Radio.Group
            options={[
              { label: "Semanal", value: "semanal" },
              { label: "Quincenal", value: "quincenal" },
              { label: "Mensual", value: "mensual" },
            ]}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>
        <Form.Item name="cliente_id" label="Cliente" rules={[{ required: true, message: "Seleccione un cliente" }]}>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Seleccionar cliente"
            loading={clientes.length === 0}
            notFoundContent={clientes.length === 0 ? "Cargando clientes..." : "Sin clientes"}
            options={clientes.map((c) => {
              const nombre = c.nombreCompleto || c.nombrecompleto || c.nombre || "Sin nombre";
              return { value: c.id, label: `${nombre} â€” ${c.cedula || ""}` };
            })}
          />
        </Form.Item>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item name="monto" label="Monto (LPS)" rules={[{ required: true }]}>
              <InputNumber style={{ width: "100%" }} min={1}
                formatter={(v) => `L ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(v) => v.replace(/L\s?|(,*)/g, "")} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="tasa_interes_semanal" label="Tasa interÃ©s semanal (%)">
              <InputNumber style={{ width: "100%" }} min={0} max={100} step={0.25} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Equivalente mensual (%)">
          <InputNumber style={{ width: "100%" }} value={calculos.tasa_interes_mensual || getTasaMensual(TASA_INTERES_SEMANAL)} disabled />
        </Form.Item>
        <Form.Item name="fecha_inicio" label="Fecha de inicio" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item name="concepto" label="Concepto">
          <Input.TextArea rows={2} placeholder="Motivo del prÃ©stamo" />
        </Form.Item>
        {calculos.total_pagar > 0 && (
          <Row gutter={12} style={{ marginBottom: 16 }}>
            <Col xs={8}><Statistic title="Interés total" value={calculos.interes_total} prefix="L" precision={2} valueStyle={{ fontSize: 14 }} /></Col>
            <Col xs={8}><Statistic title="Total a pagar" value={calculos.total_pagar} prefix="L" precision={2} valueStyle={{ fontSize: 14 }} /></Col>
            <Col xs={8}><Statistic title={`Cuota ${FRECUENCIA_LABEL[calculos.frecuencia] || "mensual"}`} value={calculos.cuota_mensual} prefix="L" precision={2} valueStyle={{ fontSize: 14 }} /></Col>
          </Row>
        )}
        {calculos.total_pagar > 0 && (
          <Text type="secondary" style={{ display: "block", marginBottom: 16, fontSize: 12 }}>
            Se generarán {calculos.numCuotas} alerta(s) de pago {FRECUENCIA_LABEL[calculos.frecuencia] || "mensual"} automáticamente.
          </Text>
        )}
        <Text type="secondary" style={{ display: "block", marginBottom: 16, fontSize: 12 }}>
          Interes semanal editable. Por defecto 5%, equivalente a 20% mensual. Contrato fijo de 3 meses. Renovacion manual.
        </Text>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>Crear PrÃ©stamo</Button>
          <Button onClick={handleClose}>Cancelar</Button>
        </Space>
      </Form>
    </Modal>
  );
};

const PrestamoDetalle = ({ prestamo, open, onClose, onRenovar, isMobile }) => {
  const dispatch = useDispatch();
  const abonos = useSelector((s) => s.prestamos.abonos?.[prestamo?.id] || []);
  const [abonoForm] = Form.useForm();
  const [loadingAbono, setLoadingAbono] = useState(false);
  const [abonoModalOpen, setAbonoModalOpen] = useState(false);

  useEffect(() => {
    if (prestamo?.id) dispatch(fetchAbonos(prestamo.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prestamo?.id]);

  const interesTotalContrato = parseFloat(prestamo?.interes_total || 0);
  const capitalInicial = parseFloat(prestamo?.monto || 0);

  // Para calcular los topes DINÃMICOS del formulario de abonos (lo ya abonado se resta)
  const totalAbonado = useMemo(
    () => abonos.reduce((sum, a) => sum + parseFloat(a?.monto || 0), 0),
    [abonos]
  );

  const interesAbonado = useMemo(
    () => abonos.reduce((s, a) => s + calcularMontoAbono(a).mi, 0),
    [abonos]
  );
  const capitalAbonado = useMemo(
    () => abonos.reduce((s, a) => s + calcularMontoAbono(a).mc, 0),
    [abonos]
  );

  const saldoInteres = Math.max(interesTotalContrato - interesAbonado, 0);
  const saldoCapital = Math.max(capitalInicial - capitalAbonado, 0);

  const handleAbono = async (values) => {
    setLoadingAbono(true);
    try {
      const interesCuota = parseFloat(prestamo?.cuota_mensual || prestamo?.interes_total || 0) /
        Math.max(Number(prestamo?.plazo_meses || 1), 1);
      const { a_interes, a_capital } = distribuirAbonoMixto(
        values, interesCuota, Math.max(saldoCapital, 0)
      );
      await dispatch(createAbono({
        prestamo_id: prestamo.id,
        monto: values.monto,
        aplica_a: values.aplica_a,
        tipo_abono: values.aplica_a,
        destino_abono: values.aplica_a,
        monto_interes: a_interes,
        monto_capital: a_capital,
        nota: values.nota,
        fecha: values.fecha ? values.fecha.format("YYYY-MM-DD") : undefined,
      })).unwrap();
      const idsLeidas = await dispatch(markAlertaLeidaAuto(prestamo.id)).unwrap();
      dispatch(despacharMarcarLeidas(idsLeidas));
      await dispatch(fetchAbonos(prestamo.id));
      dispatch(fetchPrestamos());
      abonoForm.resetFields();
      setAbonoModalOpen(false);
      message.success("Abono registrado");
    } catch (e) {
      message.error(e || "Error al registrar abono");
    } finally { setLoadingAbono(false); }
  };

  const handleEliminarAbono = async (abono) => {
    try {
      await dispatch(deleteAbono({ id: abono.id, prestamoId: prestamo.id })).unwrap();
      await dispatch(fetchAbonos(prestamo.id));
      dispatch(fetchPrestamos());
      message.success("Abono eliminado y saldos recalculados");
    } catch (e) {
      message.error(e || "Error al eliminar el abono");
    }
  };

  if (!prestamo) return null;

  return (
    <Drawer
      title={`PrÃ©stamo #${prestamo.id} â€” ${prestamo.cliente_nombre || prestamo.cliente}`}
      open={open}
      onClose={onClose}
      width={isMobile ? "100%" : 720}
    >
      <Descriptions size="small" column={isMobile ? 1 : 2} bordered>
        <Descriptions.Item label="Monto (capital)">{LPS(prestamo.monto)}</Descriptions.Item>
        <Descriptions.Item label="InterÃ©s total">{LPS(prestamo.interes_total)}</Descriptions.Item>
        <Descriptions.Item label="Total a pagar">{LPS(prestamo.total_pagar)}</Descriptions.Item>
        <Descriptions.Item label="Cuota">{LPS(prestamo.cuota_mensual)}</Descriptions.Item>
        <Descriptions.Item label="Tasa semanal">{prestamo.tasa_interes_semanal || TASA_INTERES_SEMANAL}%</Descriptions.Item>
        <Descriptions.Item label="Equivalente mensual">{prestamo.tasa_interes || TASA_INTERES_MENSUAL}%</Descriptions.Item>
        <Descriptions.Item label="Plazo contrato">{prestamo.plazo_meses || PLAZO_CONTRATO_MESES} meses</Descriptions.Item>
        <Descriptions.Item label="Renovacion">Manual</Descriptions.Item>
        <Descriptions.Item label="Estado"><Tag color={ESTADO_COLOR[prestamo.estado]}>{prestamo.estado}</Tag></Descriptions.Item>
        <Descriptions.Item label="Inicio">{dayjs(prestamo.fecha_inicio).format("DD/MM/YYYY")}</Descriptions.Item>
        <Descriptions.Item label="Vence">{dayjs(prestamo.fecha_vencimiento).format("DD/MM/YYYY")}</Descriptions.Item>
        {prestamo.renovacion_de && (
          <Descriptions.Item label="Renovado de">#{prestamo.renovacion_de}</Descriptions.Item>
        )}
      </Descriptions>

      <Divider orientation="left">Cuentas del prÃ©stamo</Divider>
      <Row gutter={12}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ background: "#f6ffed", borderColor: "#b7eb8f" }}>
            <Statistic
              title="Total abonado"
              value={totalAbonado}
              prefix="L"
              precision={2}
              valueStyle={{ color: "#52c41a", fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ background: "#fff7e6", borderColor: "#ffd591" }}>
            <Statistic
              title="Saldo Capital"
              value={saldoCapital}
              prefix="L"
              precision={2}
              valueStyle={{ color: saldoCapital <= 0 ? "#52c41a" : "#d46b08", fontSize: 18 }}
              suffix={saldoCapital <= 0 ? <Tag color="green">Pagado</Tag> : null}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Capital abonado: {LPS(capitalAbonado)} / {LPS(capitalInicial)}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ background: "#fff1f0", borderColor: "#ffa39e" }}>
            <Statistic
              title="Saldo InterÃ©s"
              value={saldoInteres}
              prefix="L"
              precision={2}
              valueStyle={{ color: saldoInteres <= 0 ? "#52c41a" : "#cf1322", fontSize: 18 }}
              suffix={saldoInteres <= 0 ? <Tag color="green">Pagado</Tag> : null}
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              InterÃ©s abonado: {LPS(interesAbonado)} / {LPS(interesTotalContrato)}
            </Text>
          </Card>
        </Col>
      </Row>

      {prestamo.estado === "activo" && (
        <Button
          type="primary"
          block={isMobile}
          style={{ marginTop: 16 }}
          onClick={() => setAbonoModalOpen(true)}
        >
          Registrar Abono
        </Button>
      )}

      <Divider orientation="left">Historial de abonos</Divider>
      <List
        size="small"
        dataSource={abonos}
        locale={{ emptyText: "Sin abonos registrados" }}
        renderItem={(a) => {
          const mi = parseFloat(a.monto_interes || 0);
          const mc = parseFloat(a.monto_capital || 0);
          const destino = normalizarDestino(a);
          let badgeDesglose;
          if (mi > 0 || mc > 0) {
            badgeDesglose = (
              <Space size={4} wrap>
                <Tag color="orange">InterÃ©s {LPS(mi)}</Tag>
                <Tag color="blue">Capital {LPS(mc)}</Tag>
              </Space>
            );
          } else if (destino === "interes") {
            badgeDesglose = <Tag color="orange">Solo InterÃ©s</Tag>;
          } else if (destino === "capital") {
            badgeDesglose = <Tag color="blue">Solo Capital (Saldo)</Tag>;
          } else if (destino === "mixto") {
            badgeDesglose = <Tag color="purple">Mixto</Tag>;
          }
          return (
            <List.Item
              key={a.id}
              actions={[
                <Popconfirm
                  key="del"
                  title="Â¿Eliminar este abono?"
                  description="Se recalcularÃ¡n los saldos de capital e interÃ©s al instante."
                  okText="Eliminar"
                  cancelText="Cancelar"
                  onConfirm={() => handleEliminarAbono(a)}
                >
                  <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space size={6} wrap>
                    <Text strong>{LPS(a.monto)}</Text>
                    {badgeDesglose}
                  </Space>
                }
                description={
                  <Space size={6} wrap>
                    <Text type="secondary">{dayjs(a.fecha).format("DD/MM/YYYY")}</Text>
                    {a.nota && <Text type="secondary">Â· {a.nota}</Text>}
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />

      {prestamo.estado === "activo" && (
        <>
          <Divider />
          <Popconfirm
            title="Â¿Renovar este prÃ©stamo?"
            description="Se cerrarÃ¡ el actual y se crearÃ¡ uno nuevo con el mismo monto."
            onConfirm={() => onRenovar(prestamo)}
          >
            <Button icon={<ReloadOutlined />} block>Renovar PrÃ©stamo</Button>
          </Popconfirm>
        </>
      )}

      <Modal
        title="Registrar Abono"
        open={abonoModalOpen}
        onCancel={() => { setAbonoModalOpen(false); abonoForm.resetFields(); }}
        footer={null}
        width="95%"
        style={{ maxWidth: 540 }}
      >
        <Form
          form={abonoForm}
          layout="vertical"
          onFinish={handleAbono}
          initialValues={{ fecha: dayjs(), aplica_a: "interes" }}
        >
          {/* Resumen rÃ¡pido de saldos disponibles */}
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message={
              <Space size={6} wrap>
                <Text>Saldo capital:</Text>
                <Text strong style={{ color: "#d46b08" }}>{LPS(saldoCapital)}</Text>
                <Text>Â·</Text>
                <Text>Saldo interÃ©s:</Text>
                <Text strong style={{ color: "#cf1322" }}>{LPS(saldoInteres)}</Text>
                <Text>Â·</Text>
                <Text>Total pendiente:</Text>
                <Text strong style={{ color: "#fa8c16" }}>{LPS(saldoCapital + saldoInteres)}</Text>
              </Space>
            }
          />

          <Form.Item
            name="monto"
            label="Monto total del abono"
            dependencies={["aplica_a"]}
            rules={[
              { required: true, message: "Ingrese el monto del abono" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const total = Number(value || 0);
                  if (!total || total <= 0) return Promise.resolve();
                  const destino = getFieldValue("aplica_a") || "interes";
                  // El tope depende del destino seleccionado y de los saldos dinÃ¡micos
                  const tope =
                    destino === "interes" ? saldoInteres :
                    destino === "capital" ? saldoCapital :
                    saldoCapital + saldoInteres;
                  if (total > tope + 0.01) {
                    const msgDestino =
                      destino === "interes" ? "saldo de interÃ©s" :
                      destino === "capital" ? "saldo de capital" :
                      "total pendiente";
                    return Promise.reject(
                      new Error(`El monto (L ${total.toFixed(2)}) excede el ${msgDestino} disponible (L ${tope.toFixed(2)})`)
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              placeholder="Monto"
              min={1}
              style={{ width: "100%" }}
              formatter={(v) => `L ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v.replace(/L\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item name="fecha" label="Fecha">
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="aplica_a"
            label="Â¿A quÃ© aplica este abono?"
            tooltip="Define si el monto se aplica al InterÃ©s, al Capital (saldo) o se reparte entre ambos."
            rules={[{ required: true, message: "Seleccione a quÃ© aplica el abono" }]}
          >
            <Radio.Group
              options={[
                { label: APLICA_A_LABEL.interes, value: "interes" },
                { label: APLICA_A_LABEL.capital, value: "capital" },
                { label: APLICA_A_LABEL.mixto, value: "mixto" },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>

          <Form.Item shouldUpdate noStyle>
            {() => {
              const aplica = abonoForm.getFieldValue("aplica_a") || "interes";
              if (aplica !== "mixto") return null;
              return (
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="monto_interes"
                      label="Monto a InterÃ©s"
                      dependencies={["monto_capital"]}
                      rules={[
                        // eslint-disable-next-line no-unused-vars
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const v = Number(value || 0);
                            if (v < 0) return Promise.reject(new Error("No puede ser negativo"));
                            if (v > saldoInteres + 0.01) {
                              return Promise.reject(
                                new Error(`MÃ¡ximo: L ${saldoInteres.toFixed(2)}`)
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={parseFloat(saldoInteres.toFixed(2))}
                        style={{ width: "100%" }}
                        formatter={(v) => `L ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(v) => v.replace(/L\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="monto_capital"
                      label="Monto a Capital (Saldo)"
                      dependencies={["monto_interes"]}
                      rules={[
                        // eslint-disable-next-line no-unused-vars
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const v = Number(value || 0);
                            if (v < 0) return Promise.reject(new Error("No puede ser negativo"));
                            if (v > saldoCapital + 0.01) {
                              return Promise.reject(
                                new Error(`MÃ¡ximo: L ${saldoCapital.toFixed(2)}`)
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={parseFloat(saldoCapital.toFixed(2))}
                        style={{ width: "100%" }}
                        formatter={(v) => `L ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(v) => v.replace(/L\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              );
            }}
          </Form.Item>

          <Form.Item name="nota" label="Nota">
            <Input.TextArea rows={3} placeholder="Nota opcional" />
          </Form.Item>
          <Space
            direction={isMobile ? "vertical" : "horizontal"}
            style={{ width: "100%", justifyContent: isMobile ? "stretch" : "flex-end" }}
          >
            <Button onClick={() => setAbonoModalOpen(false)} block={isMobile}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={loadingAbono} block={isMobile}>Guardar Abono</Button>
          </Space>
        </Form>
      </Modal>
    </Drawer>
  );
};

// Helper para distribuir el monto cuando se elige mixto
const distribuirAbonoMixto = (values, saldoCapitalDisponible, saldoInteresDisponible) => {
  const total = Number(values.monto || 0);
  let a_interes = Number(values.monto_interes || 0);
  let a_capital = Number(values.monto_capital || 0);
  if (values.aplica_a === "interes") {
    a_interes = total;
    a_capital = 0;
  } else if (values.aplica_a === "capital") {
    a_interes = 0;
    a_capital = total;
  } else if (values.aplica_a === "mixto") {
    const restante = Math.max(total - a_interes - a_capital, 0);
    if (a_interes > 0 && a_capital === 0) {
      a_capital = Math.min(restante, saldoCapitalDisponible);
    } else if (a_capital > 0 && a_interes === 0) {
      a_interes = Math.min(restante, saldoInteresDisponible);
    }
  }
  return { a_interes, a_capital };
};

const PrestamosPage = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.prestamos);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 768px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const h = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useMountEffect({
    effect: () => {
      dispatch(fetchPrestamos());
      dispatch(fetchClientesAction());
    },
    unMount: () => { dispatch(clearPrestamos()); },
    deps: [],
  });

  const filtered = list.filter((p) =>
    (p.cliente_nombre || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.concepto || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      await dispatch(deletePrestamo(id)).unwrap();
      message.success("PrÃ©stamo eliminado");
    } catch (e) { message.error(e || "Error al eliminar"); }
  };

  const handleRenovar = async (prestamo) => {
    try {
      // Normalizar tipos: el backend devuelve DECIMAL como string, lo que
      // rompe .toFixed() en operaciones como (monto + interes).toFixed(2).
      // Parseamos a Number antes de enviar para evitar concatenaciÃ³n de strings.
      const toNum = (v, def = 0) => {
        if (v === null || v === undefined || v === "") return def;
        const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
        return Number.isFinite(n) ? n : def;
      };
      const toInt = (v, def = 0) => {
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : def;
      };

      const nuevoPrestamo = await dispatch(renovarPrestamo({
        cliente_id: prestamo.cliente_id ?? prestamo.clienteId,
        monto: toNum(prestamo.monto),
        tasa_interes: toNum(prestamo.tasa_interes ?? TASA_INTERES_MENSUAL),
        tasa_interes_semanal: toNum(prestamo.tasa_interes_semanal ?? TASA_INTERES_SEMANAL),
        plazo_meses: toInt(prestamo.plazo_meses ?? PLAZO_CONTRATO_MESES, PLAZO_CONTRATO_MESES),
        tipo_interes: prestamo.tipo_interes ?? "semanal",
        frecuencia_pago: prestamo.frecuencia_pago ?? "mensual",
        concepto: prestamo.concepto,
        fecha_inicio: dayjs().format("YYYY-MM-DD"),
        fecha_vencimiento: dayjs().add(PLAZO_CONTRATO_MESES, "month").format("YYYY-MM-DD"),
        renovacion_de: prestamo.id,
        id: prestamo.id, // lo destructura el thunk para armar la URL
      })).unwrap();
      // El backend a veces responde con el préstamo viejo modificado en vez
      // del nuevo. Para garantizar consistencia SIEMPRE refrescamos la lista
      // completa y generamos las alertas del nuevo préstamo.
      await dispatch(fetchPrestamos());
      try {
        const frec = nuevoPrestamo?.frecuencia_pago || prestamo.frecuencia_pago || "mensual";
        const plazoMeses = toInt(nuevoPrestamo?.plazo_meses ?? prestamo.plazo_meses ?? PLAZO_CONTRATO_MESES, PLAZO_CONTRATO_MESES);
        const numeroCuotas =
          frec === "semanal" ? plazoMeses * 4 :
          frec === "quincenal" ? plazoMeses * 2 :
          plazoMeses;
        const fechaInicio = nuevoPrestamo?.fecha_inicio || new Date().toISOString();
        const fechas = calcularFechasAlertas({ fechaInicio, frecuencia: frec, numeroCuotas });
        const idCliente = nuevoPrestamo?.cliente_id ?? nuevoPrestamo?.clienteId ?? prestamo.cliente_id;
        const nombreCliente = nuevoPrestamo?.cliente_nombre || prestamo.cliente_nombre || "";
        const nuevasAlertas = fechas.map((f, idx) => ({
          id: `alerta-renov-${nuevoPrestamo?.id || prestamo.id}-${Date.now()}-${idx}`,
          prestamo_id: nuevoPrestamo?.id || prestamo.id,
          cliente_id: idCliente,
          cliente_nombre: nombreCliente,
          fecha: f.toISOString(),
          frecuencia: frec,
          cuota: idx + 1,
          total_cuotas: numeroCuotas,
          tipo: "vencimiento",
          estado: "pendiente",
        }));
        if (nuevasAlertas.length > 0) dispatch(addAlertasLocal(nuevasAlertas));
      } catch { /* no bloquear el flujo principal */ }
      message.success("Préstamo renovado");
      setDetalle(null);
    } catch (e) { message.error(e || "Error al renovar"); }
  };

  // Sin filtros: se muestran todos los prÃ©stamos por defecto
  const columns = [
    { title: "Cliente", dataIndex: "cliente_nombre", ellipsis: true },
    { title: "Monto", dataIndex: "monto", render: LPS, responsive: ["md"] },
    { title: "Interes", dataIndex: "interes_total", render: LPS, responsive: ["lg"] },
    { title: "Total", dataIndex: "total_pagar", render: LPS },
    { title: "Cuota", dataIndex: "cuota_mensual", render: LPS, responsive: ["lg"] },
    { title: "Abonado", dataIndex: "total_abonado", render: LPS, responsive: ["lg"] },
    { title: "Tasa", dataIndex: "tasa_interes", render: (v, r) => `${r.tasa_interes_semanal || TASA_INTERES_SEMANAL}% sem / ${v || TASA_INTERES_MENSUAL}% mes`, responsive: ["lg"] },
    { title: "Plazo", dataIndex: "plazo_meses", render: (v) => `${v || PLAZO_CONTRATO_MESES} meses`, responsive: ["lg"] },
    { title: "Vence", dataIndex: "fecha_vencimiento", render: (v) => dayjs(v).format("DD/MM/YY"), responsive: ["sm"] },
    { title: "Estado", dataIndex: "estado", render: (v) => <Tag color={ESTADO_COLOR[v]}>{v}</Tag> },
    {
      title: "", key: "actions",
      render: (_, r) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setDetalle(r)} />
          <Popconfirm title="Â¿Eliminar prÃ©stamo?" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageTitle
        title="PrÃ©stamos"
        addButton={{ text: "Nuevo PrÃ©stamo", onClick: () => setModalOpen(true) }}
        permissions={{ action: "create", subject: "prestamos" }}
      />
      <CardContent>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Buscar por cliente o concepto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: isMobile ? "100%" : 340 }}
        />
        {isMobile ? (
          <Row gutter={[12, 12]}>
            {filtered.map((p) => (
              <Col xs={24} key={p.id}>
                <Card size="small" onClick={() => setDetalle(p)} hoverable
                  extra={<Tag color={ESTADO_COLOR[p.estado]}>{p.estado}</Tag>}
                  title={p.cliente_nombre}>
                  <Space direction="vertical" size={2} style={{ width: "100%" }}>
                    <Text>Total: <Text strong>{LPS(p.total_pagar)}</Text></Text>
                    <Text>Cuota: {LPS(p.cuota_mensual)}</Text>
                    <Text type="secondary">Vence: {dayjs(p.fecha_vencimiento).format("DD/MM/YYYY")}</Text>
                    <Text type="secondary">Abonado: {LPS(p.total_abonado)}</Text>
                    <Text type="secondary">Saldo: {LPS(p.saldo_pendiente ?? p.saldo ?? (parseFloat(p.total_pagar || 0) - parseFloat(p.total_abonado || 0)))}</Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showTotal: (t) => `Total: ${t}` }}
            onRow={(r) => ({ onDoubleClick: () => setDetalle(r) })}
          />
        )}
      </CardContent>

      <PrestamoForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { dispatch(fetchPrestamos()); }}
      />

      <PrestamoDetalle
        prestamo={detalle}
        open={!!detalle}
        onClose={() => setDetalle(null)}
        onRenovar={handleRenovar}
        isMobile={isMobile}
      />
    </>
  );
};

export default PrestamosPage;