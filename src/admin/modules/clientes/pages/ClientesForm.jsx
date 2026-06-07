import { Form, Input, Button, Select, Row, Col, InputNumber, Space, message, Card } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createClienteAction, updateClienteAction } from "../store/thunks";

const { Option } = Select;

const ClientesForm = ({ cliente, onSuccess, onCancel, t }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [referencias, setReferencias] = useState([]);
  const isEdit = !!cliente;

  // Cargar referencias existentes o inicializar con 3 vacías
  useEffect(() => {
    if (cliente && cliente.referencias) {
      try {
        let refs = [];
        if (typeof cliente.referencias === "string") {
          if (cliente.referencias.startsWith("[")) {
            refs = JSON.parse(cliente.referencias);
          } else {
            const lines = cliente.referencias.split("\n");
            refs = lines.map(line => {
              const [nombre, telefono] = line.split(":").map(s => s.trim());
              return { nombre, telefono };
            }).filter(r => r.nombre);
          }
        } else if (Array.isArray(cliente.referencias)) {
          refs = cliente.referencias;
        }
        if (refs.length >= 3) {
          setReferencias(refs);
        } else {
          const completas = [...refs];
          while (completas.length < 3) completas.push({ nombre: "", telefono: "" });
          setReferencias(completas);
        }
      } catch (e) {
        console.warn("Error parsing referencias al cargar cliente:", e);
        setReferencias([
          { nombre: "", telefono: "" },
          { nombre: "", telefono: "" },
          { nombre: "", telefono: "" },
        ]);
      }
    } else {
      // Nuevo cliente: 3 filas vacías
      setReferencias([
        { nombre: "", telefono: "" },
        { nombre: "", telefono: "" },
        { nombre: "", telefono: "" },
      ]);
    }
  }, [cliente]);

  const addReferencia = () => {
    setReferencias([...referencias, { nombre: "", telefono: "" }]);
  };

  const removeReferencia = (index) => {
    if (referencias.length <= 3) {
      message.warning(t("clientes.min_referencias"));
      return;
    }
    const newRefs = referencias.filter((_, i) => i !== index);
    setReferencias(newRefs);
  };

  const updateReferencia = (index, field, value) => {
    const newRefs = [...referencias];
    newRefs[index][field] = value;
    setReferencias(newRefs);
  };

  const onFinish = async (values) => {
    // Validar que todas las referencias tengan nombre y teléfono
    const invalidRef = referencias.some(ref => !ref.nombre || !ref.telefono);
    if (invalidRef) {
      message.error(t("clientes.complete_referencias"));
      return;
    }
    if (referencias.length < 3) {
      message.error(t("clientes.min_referencias_error"));
      return;
    }

    const payload = {
      ...values,
      referencias: JSON.stringify(referencias),
    };

    setLoading(true);
    try {
      if (isEdit) {
        await dispatch(updateClienteAction({ id: cliente.id, changes: payload })).unwrap();
        message.success(t("clientes.update_success"));
      } else {
        await dispatch(createClienteAction(payload)).unwrap();
        message.success(t("clientes.create_success"));
      }
      onSuccess();
    } catch (err) {
      message.error(err || (isEdit ? t("clientes.update_error") : t("clientes.create_error")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ estado: "activo" }}>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="nombreCompleto" label={t("clientes.nombre")} rules={[{ required: true }]}>
            <Input placeholder={t("clientes.nombre_placeholder")} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="cedula" label={t("clientes.cedula")} rules={[{ required: true }]}>
            <Input placeholder="0801-1995-12345" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="correo" label={t("clientes.correo")} rules={[{ type: "email" }]}>
            <Input placeholder="cliente@email.com" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="telefono" label={t("clientes.telefono")} rules={[{ required: true }]}>
            <Input placeholder="98765432" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="telefonoSecundario" label={t("clientes.telefono_secundario")}>
            <Input placeholder="98765433" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="profesion" label={t("clientes.profesion")}>
            <Input placeholder={t("clientes.profesion_placeholder")} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="direccion" label={t("clientes.direccion")}>
        <Input.TextArea rows={2} placeholder={t("clientes.direccion_placeholder")} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item name="lugarTrabajo" label={t("clientes.lugar_trabajo")}>
            <Input placeholder={t("clientes.lugar_trabajo_placeholder")} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item name="antiguedad" label={t("clientes.antiguedad")}>
            <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
          </Form.Item>
        </Col>
      </Row>

      {/* Referencias dinámicas */}
      <div className="referencias-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4>{t("clientes.referencias")}</h4>
          <Button type="dashed" icon={<PlusOutlined />} onClick={addReferencia}>
            {t("clientes.add_referencia")}
          </Button>
        </div>

        {referencias.map((ref, idx) => (
          <Row key={idx} gutter={16} style={{ marginBottom: 16 }} align="middle">
            <Col xs={24} sm={10}>
              <Input
                placeholder={t("clientes.ref_nombre_placeholder")}
                value={ref.nombre}
                onChange={(e) => updateReferencia(idx, "nombre", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={10}>
              <Input
                placeholder="Teléfono"
                value={ref.telefono}
                onChange={(e) => updateReferencia(idx, "telefono", e.target.value)}
              />
            </Col>
            <Col xs={24} sm={4} style={{ textAlign: "right" }}>
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeReferencia(idx)}
                disabled={referencias.length <= 3}
              >
                {t("common.delete")}
              </Button>
            </Col>
          </Row>
        ))}
        <div style={{ marginTop: 8, color: "#888" }}>
          {t("clientes.min_referencias_info")}
        </div>
      </div>

      <Form.Item name="estado" label={t("clientes.estado")}>
        <Select>
          <Option value="activo">{t("clientes.active")}</Option>
          <Option value="inactivo">{t("clientes.inactive")}</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? t("common.update") : t("common.create")}
          </Button>
          <Button onClick={onCancel}>{t("common.cancel")}</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ClientesForm;