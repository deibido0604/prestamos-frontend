import { Form, Input, Button, Select, Space, message } from "antd";
import { useState } from "react";

const roles = [
  { value: "admin", label: "Administrador" },
  { value: "user", label: "Usuario" },
  { value: "viewer", label: "Visor" },
];

const estados = [
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

export const UsuariosForm = ({ usuario, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      onSave(values);
      message.success(usuario ? "Usuario actualizado" : "Usuario creado");
    } catch (error) {
      message.error("Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={usuario || { activo: "activo", rol: "user" }}
      onFinish={onFinish}
    >
      <Form.Item
        label="Nombre Completo"
        name="nombre"
        rules={[{ required: true, message: "Ingrese el nombre" }]}
      >
        <Input placeholder="Juan Pérez" />
      </Form.Item>

      <Form.Item
        label="Correo Electrónico"
        name="email"
        rules={[
          { required: true, message: "Ingrese el correo" },
          { type: "email", message: "Correo inválido" },
        ]}
      >
        <Input placeholder="correo@prestamos.com" />
      </Form.Item>

      <Form.Item
        label="Usuario"
        name="username"
        rules={[{ required: true, message: "Ingrese el usuario" }]}
      >
        <Input placeholder="juanperez" />
      </Form.Item>

      <Form.Item
        label="Rol"
        name="rol"
        rules={[{ required: true, message: "Seleccione un rol" }]}
      >
        <Select options={roles} />
      </Form.Item>

      <Form.Item
        label="Estado"
        name="activo"
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
