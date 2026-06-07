import { Form, Input, Button, Select, Row, Col, InputNumber, Space, message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createClienteAction, updateClienteAction } from "../store/thunks";

const { Option } = Select;

const ClientesForm = ({ cliente, onSuccess, onCancel, t }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const isEdit = !!cliente;

  useEffect(() => {
    if (cliente) {
      form.setFieldsValue({
        nombreCompleto: cliente.nombreCompleto,
        cedula: cliente.cedula,
        correo: cliente.correo,
        telefono: cliente.telefono,
        telefonoSecundario: cliente.telefonoSecundario,
        direccion: cliente.direccion,
        profesion: cliente.profesion,
        lugarTrabajo: cliente.lugarTrabajo,
        antiguedad: cliente.antiguedad,
        referencias: cliente.referencias,
        estado: cliente.estado,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ estado: "activo" });
    }
  }, [cliente, form]);

  const onFinish = async (values) => {
    console.log("📝 Formulario enviado, valores:", values);
    setLoading(true);
    try {
      if (isEdit) {
        console.log("✏️ Editando cliente:", cliente.id, values);
        const result = await dispatch(updateClienteAction({ id: cliente.id, changes: values })).unwrap();
        console.log("✅ Cliente actualizado:", result);
        message.success(t("clientes.update_success"));
      } else {
        console.log("➕ Creando cliente:", values);
        const result = await dispatch(createClienteAction(values)).unwrap();
        console.log("✅ Cliente creado:", result);
        message.success(t("clientes.create_success"));
      }
      onSuccess(); // cierra modal y recarga lista
    } catch (err) {
      console.error("❌ Error en ClientesForm:", err);
      // Intenta extraer el mensaje de error de diferentes formas
      const errorMsg = err?.response?.data?.message || err?.message || err?.toString() || (isEdit ? t("clientes.update_error") : t("clientes.create_error"));
      message.error(errorMsg);
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
      <Form.Item name="referencias" label={t("clientes.referencias")}>
        <Input.TextArea rows={2} placeholder={t("clientes.referencias_placeholder")} />
      </Form.Item>
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