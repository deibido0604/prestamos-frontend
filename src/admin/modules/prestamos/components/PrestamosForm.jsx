import { Form, Input, Button, Select, Space, message, InputNumber, Row, Col, DatePicker } from "antd";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

const estados = [
  { value: "activo", label: "Activo" },
  { value: "pagado", label: "Pagado" },
  { value: "vencido", label: "Vencido" },
];

const tiposPago = [
  { value: "mensual", label: "Mensual" },
  { value: "quincenal", label: "Quincenal" },
  { value: "semanal", label: "Semanal" },
];

export const PrestamosForm = ({ prestamo, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [calculos, setCalculos] = useState({
    interesTotal: 0,
    totalPagar: 0,
    numeroCuotas: 0,
    cuotaPeriodica: 0,
    fechaFin: null,
  });
  const clientes = useSelector((state) => state.clientes.list);

  const clienteOptions = clientes.map((c) => ({
    value: c.id,
    label: c.nombreCompleto,
  }));

  // Función para recalcular todo
  const recalcularTodo = (values) => {
    const { montoLps, tasaInteres, plazoMeses, frecuenciaPago, fechaInicio } = values;
    if (montoLps && tasaInteres && plazoMeses && frecuenciaPago) {
      // Interés total simple
      const interesTotal = (montoLps * tasaInteres * plazoMeses) / 100 / 12;
      const totalPagar = montoLps + interesTotal;

      // Número de cuotas según frecuencia
      let numeroCuotas;
      if (frecuenciaPago === "mensual") numeroCuotas = plazoMeses;
      else if (frecuenciaPago === "quincenal") numeroCuotas = plazoMeses * 2;
      else if (frecuenciaPago === "semanal") numeroCuotas = plazoMeses * 4; // aprox 4 semanas por mes

      const cuotaPeriodica = numeroCuotas > 0 ? totalPagar / numeroCuotas : 0;

      // Calcular fecha de fin estimada
      let fechaFin = null;
      if (fechaInicio && dayjs(fechaInicio).isValid()) {
        let diasPlazo;
        if (frecuenciaPago === "mensual") diasPlazo = plazoMeses * 30;
        else if (frecuenciaPago === "quincenal") diasPlazo = plazoMeses * 30; // mismo total de días, pero cuotas quincenales
        else if (frecuenciaPago === "semanal") diasPlazo = plazoMeses * 30;
        fechaFin = dayjs(fechaInicio).add(diasPlazo, "day");
      }

      setCalculos({
        interesTotal: parseFloat(interesTotal.toFixed(2)),
        totalPagar: parseFloat(totalPagar.toFixed(2)),
        numeroCuotas: Math.floor(numeroCuotas),
        cuotaPeriodica: parseFloat(cuotaPeriodica.toFixed(2)),
        fechaFin: fechaFin,
      });
    } else {
      setCalculos({
        interesTotal: 0,
        totalPagar: 0,
        numeroCuotas: 0,
        cuotaPeriodica: 0,
        fechaFin: null,
      });
    }
  };

  // Recalcular cada vez que cambian los valores del formulario
  const onValuesChange = (changedValues, allValues) => {
    recalcularTodo(allValues);
  };

  // Inicializar cálculos cuando se edita un préstamo existente
  useEffect(() => {
    if (prestamo) {
      // Si el préstamo ya tiene valores guardados, los usamos para mostrarlos
      const valoresIniciales = {
        ...prestamo,
        fechaInicio: prestamo.fechaInicio ? dayjs(prestamo.fechaInicio) : null,
      };
      form.setFieldsValue(valoresIniciales);
      recalcularTodo(valoresIniciales);
    } else {
      // Resetear cálculos al crear nuevo
      setCalculos({
        interesTotal: 0,
        totalPagar: 0,
        numeroCuotas: 0,
        cuotaPeriodica: 0,
        fechaFin: null,
      });
    }
  }, [prestamo, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const clienteSeleccionado = clientes.find((c) => c.id === values.clienteId);
      // Formatear fechas a string ISO
      const datosCompletos = {
        ...values,
        cliente: clienteSeleccionado?.nombreCompleto,
        fechaInicio: values.fechaInicio ? values.fechaInicio.toISOString() : null,
        fechaFin: calculos.fechaFin ? calculos.fechaFin.toISOString() : null,
        interesTotal: calculos.interesTotal,
        totalPagar: calculos.totalPagar,
        numeroCuotas: calculos.numeroCuotas,
        cuotaPeriodica: calculos.cuotaPeriodica,
      };
      onSave(datosCompletos);
      message.success(prestamo ? "Préstamo actualizado" : "Préstamo creado");
    } catch (error) {
      message.error("Error al guardar el préstamo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={
        prestamo || {
          estado: "activo",
          tasaInteres: 12,
          frecuenciaPago: "mensual",
          plazoMeses: 12,
        }
      }
      onFinish={onFinish}
      onValuesChange={onValuesChange}
    >
      <Form.Item
        label="Cliente"
        name="clienteId"
        rules={[{ required: true, message: "Seleccione un cliente" }]}
      >
        <Select placeholder="Seleccione un cliente" options={clienteOptions} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Monto en LPS"
            name="montoLps"
            rules={[{ required: true, message: "Ingrese el monto" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="50000"
              min={0}
              formatter={(value) => `L ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/L\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="Tasa de Interés (%) anual"
            name="tasaInteres"
            rules={[{ required: true, message: "Ingrese la tasa" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="15"
              min={0}
              max={100}
              step={0.5}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Plazo (meses)"
            name="plazoMeses"
            rules={[{ required: true, message: "Ingrese el plazo en meses" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="12"
              min={1}
              max={360}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item
            label="Frecuencia de pago"
            name="frecuenciaPago"
            rules={[{ required: true, message: "Seleccione la frecuencia" }]}
          >
            <Select options={tiposPago} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Fecha de Inicio"
            name="fechaInicio"
            rules={[{ required: true, message: "Seleccione la fecha de inicio" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item label="Fecha de Fin (estimada)">
            <Input
              disabled
              value={calculos.fechaFin ? calculos.fechaFin.format("DD/MM/YYYY") : ""}
              placeholder="Se calculará automáticamente"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Interés Total">
            <InputNumber
              disabled
              value={calculos.interesTotal}
              style={{ width: "100%" }}
              formatter={(value) => `L ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item label="Total a Pagar">
            <InputNumber
              disabled
              value={calculos.totalPagar}
              style={{ width: "100%" }}
              formatter={(value) => `L ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item label="Número de Cuotas">
            <InputNumber
              disabled
              value={calculos.numeroCuotas}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12}>
          <Form.Item label="Cuota periódica">
            <InputNumber
              disabled
              value={calculos.cuotaPeriodica}
              style={{ width: "100%" }}
              formatter={(value) => `L ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Concepto"
        name="concepto"
        rules={[{ required: true, message: "Ingrese el concepto" }]}
      >
        <Input.TextArea placeholder="Mejora de vivienda" rows={2} />
      </Form.Item>

      <Form.Item label="Estado" name="estado" rules={[{ required: true }]}>
        <Select options={estados} />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: "100%" }} justify="end">
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Guardar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};