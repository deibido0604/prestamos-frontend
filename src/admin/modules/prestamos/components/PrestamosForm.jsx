import { Form, Input, Button, Select, Space, message, InputNumber, Row, Col } from "antd";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const estados = [
  { value: "activo", label: "Activo" },
  { value: "pagado", label: "Pagado" },
  { value: "vencido", label: "Vencido" },
];

export const PrestamosForm = ({ prestamo, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [calculos, setCalculos] = useState({ interesTotal: 0, montoMensual: 0 });
  const clientes = useSelector((state) => state.clientes.list);

  const clienteOptions = clientes.map((c) => ({
    value: c.id,
    label: c.nombreCompleto,
  }));

  const calcularInteres = (values) => {
    const { montoLps, tasaInteres, plazoMeses } = values;
    if (montoLps && tasaInteres && plazoMeses) {
      const interesTotal = (montoLps * tasaInteres * plazoMeses) / 100 / 12;
      const montoMensual = (montoLps + interesTotal) / plazoMeses;
      setCalculos({
        interesTotal: parseFloat(interesTotal.toFixed(2)),
        montoMensual: parseFloat(montoMensual.toFixed(2)),
      });
    } else {
      // Si falta algún dato, reseteamos los cálculos
      setCalculos({ interesTotal: 0, montoMensual: 0 });
    }
  };

  // ========== NUEVO: Inicializar cálculos cuando se edita ==========
  useEffect(() => {
    if (prestamo) {
      // Si el préstamo trae valores guardados, los mostramos en los campos deshabilitados
      setCalculos({
        interesTotal: prestamo.interesTotal || 0,
        montoMensual: prestamo.montoMensual || 0,
      });
      // También forzamos recalcular para asegurar consistencia (por si cambia la fórmula)
      const { montoLps, tasaInteres, plazoMeses } = prestamo;
      if (montoLps && tasaInteres && plazoMeses) {
        calcularInteres({ montoLps, tasaInteres, plazoMeses });
      }
    } else {
      setCalculos({ interesTotal: 0, montoMensual: 0 });
    }
  }, [prestamo]); // Se ejecuta cada vez que cambia el préstamo (al abrir edición)

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const clienteSeleccionado = clientes.find((c) => c.id === values.clienteId);
      const datosCompletos = {
        ...values,
        cliente: clienteSeleccionado?.nombreCompleto,
        ...calculos, // Aquí ya están los cálculos actualizados
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
      initialValues={prestamo || { estado: "activo", tasaInteres: 12 }}
      onFinish={onFinish}
      onValuesChange={calcularInteres}
    >
      {/* ... el resto del formulario se mantiene igual ... */}
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
            label="Tasa de Interés (%)"
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
            rules={[{ required: true, message: "Ingrese el plazo" }]}
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
          <Form.Item label="Interés Total">
            <InputNumber
              disabled
              value={calculos.interesTotal}
              style={{ width: "100%" }}
              formatter={(value) => `L ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Monto Mensual">
        <InputNumber
          disabled
          value={calculos.montoMensual}
          style={{ width: "100%" }}
          formatter={(value) => `L ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        />
      </Form.Item>

      <Form.Item
        label="Concepto"
        name="concepto"
        rules={[{ required: true, message: "Ingrese el concepto" }]}
      >
        <Input.TextArea placeholder="Mejora de vivienda" rows={2} />
      </Form.Item>

      <Form.Item
        label="Estado"
        name="estado"
        rules={[{ required: true }]}
      >
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