import { Form, Input, Button, Select, Space, message, Row, Col, InputNumber } from "antd";
import { useState } from "react";

const estados = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

export const ClientesForm = ({ cliente, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      onSave(values);
      message.success(cliente ? "Cliente actualizado" : "Cliente creado");
    } catch (error) {
      message.error("Error al guardar el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={cliente || { estado: "activo" }}
      onFinish={onFinish}
    >
      <Form.Item
        label="Nombre Completo"
        name="nombreCompleto"
        rules={[{ required: true, message: "Ingrese el nombre" }]}
      >
        <Input placeholder="Carlos López Martínez" />
      </Form.Item>

      <Form.Item
        label="Cédula/Identidad"
        name="cedula"
        rules={[{ required: true, message: "Ingrese la cédula" }]}
      >
        <Input placeholder="0801-1995-12345" />
      </Form.Item>

      <Form.Item
        label="Correo Electrónico"
        name="correo"
        rules={[
          { required: true, message: "Ingrese el correo" },
          { type: "email", message: "Correo inválido" },
        ]}
      >
        <Input placeholder="cliente@email.com" />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Teléfono Principal"
            name="telefono"
            rules={[{ required: true, message: "Ingrese el teléfono" }]}
          >
            <Input placeholder="9876543210" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            label="Teléfono Secundario (opcional)"
            name="telefonoSecundario"
            rules={[]}
          >
            <Input placeholder="9876543211" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Dirección"
        name="direccion"
        rules={[{ required: true, message: "Ingrese la dirección" }]}
      >
        <Input.TextArea placeholder="Calle 5, Apartado 123" rows={2} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Profesión/Ocupación"
            name="profesion"
            rules={[{ required: true, message: "Ingrese la profesión" }]}
          >
            <Input placeholder="Ingeniero" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Lugar de Trabajo"
            name="lugarTrabajo"
            rules={[{ required: true, message: "Ingrese el lugar de trabajo" }]}
          >
            <Input placeholder="Empresa ABC" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            label="Antigüedad (años)"
            name="antiguedad"
            rules={[]} 
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="5"
              min={0}
              step={1}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Referencias"
        name="referencias"
        rules={[{ required: true, message: "Ingrese referencias" }]}
      >
        <Input.TextArea placeholder="Nombre de referencias" rows={2} />
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