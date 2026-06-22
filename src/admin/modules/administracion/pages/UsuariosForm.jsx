import { Form, Input, Button, Select, Space, message, Switch, Divider, Typography } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CopyOutlined, KeyOutlined } from "@ant-design/icons";
import { createUsuarioAction, updateUsuarioAction } from "../store/thunks";
import { assignRolesToUserAction, generateResetTokenAction, fetchRolesAction } from "../store/rolesThunks";

const { Text } = Typography;

const UsuariosForm = ({ usuario, onSuccess, onCancel, t }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { list: rolesList } = useSelector((s) => s.roles);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const isEdit = !!usuario;

  useEffect(() => {
    if (!rolesList.length) dispatch(fetchRolesAction());
  }, []);

  useEffect(() => {
    if (usuario) {
      form.setFieldsValue({
        name: usuario.nombre,
        username: usuario.username,
        email: usuario.email,
        active: usuario.active,
        roleIds: (usuario.roles || []).map((r) => r.id),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ active: true });
    }
    setResetToken(null);
  }, [usuario, form]);


  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { roleIds, ...userFields } = values;
      let userId = usuario?.id;

      if (isEdit) {
        await dispatch(updateUsuarioAction({ id: userId, changes: userFields })).unwrap();
        message.success(t("usuarios.update_success"));
      } else {
        const tempPassword = Math.random().toString(36).slice(-12) + "Aa1!";
        const created = await dispatch(createUsuarioAction({ ...userFields, password: tempPassword })).unwrap();
        userId = created.id;
        // El backend ya envió el correo y devuelve el token por si acaso
        setResetToken(created.resetToken);
        message.success("Usuario creado. Se envió un correo con el enlace de acceso.");
      }

      if (roleIds !== undefined && userId) {
        await dispatch(assignRolesToUserAction({ userId, roleIds: roleIds || [] })).unwrap();
      }

      if (!isEdit) return; // Mantener modal abierto para mostrar el enlace de respaldo
      onSuccess();
    } catch (err) {
      message.error(err || (isEdit ? t("usuarios.update_error") : t("usuarios.create_error")));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReset = async () => {
    setResetLoading(true);
    try {
      const result = await dispatch(generateResetTokenAction(usuario.id)).unwrap();
      setResetToken(result.token);
    } catch (err) {
      message.error(err || "Error al generar token de reset");
    } finally {
      setResetLoading(false);
    }
  };

  const resetUrl = resetToken
    ? `${window.location.origin}/auth/reset-password?token=${resetToken}`
    : null;

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label={t("usuarios.nombre")} rules={[{ required: true }]}>
        <Input placeholder="Juan Pérez" />
      </Form.Item>
      {isEdit && (
        <Form.Item name="username" label={t("usuarios.username")}>
          <Input disabled />
        </Form.Item>
      )}
      <Form.Item name="email" label={t("usuarios.email")} rules={[{ required: true, type: "email" }]}>
        <Input placeholder="correo@ejemplo.com" />
      </Form.Item>

      <Form.Item name="roleIds" label="Roles">
        <Select
          mode="multiple"
          placeholder="Seleccionar roles..."
          optionFilterProp="label"
          options={rolesList.map((r) => ({ value: r.id, label: r.name }))}
        />
      </Form.Item>

      <Form.Item name="active" label={t("usuarios.active")} valuePropName="checked">
        <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
      </Form.Item>

      {/* Enlace de acceso / reset — siempre visible si hay token */}
      {(isEdit || resetToken) && (
        <>
          <Divider />
          <Form.Item label={isEdit ? "Restablecer contraseña" : "Enlace de primer acceso"}>
            <Space direction="vertical" style={{ width: "100%" }}>
              {isEdit && (
                <Button icon={<KeyOutlined />} onClick={handleGenerateReset} loading={resetLoading}>
                  Generar enlace de restablecimiento
                </Button>
              )}
              {resetToken && (
                <div style={{ background: "#f6ffed", border: "1px solid #b7eb8f", padding: 12, borderRadius: 6 }}>
                  <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                    {isEdit
                      ? "Comparte este enlace con el usuario (expira en 1 hora):"
                      : "✅ Correo enviado. Enlace de respaldo (expira en 1 hora):"}
                  </Text>
                  <Space wrap>
                    <Text code style={{ fontSize: 11, wordBreak: "break-all" }}>{resetUrl}</Text>
                    <Button size="small" icon={<CopyOutlined />} onClick={() => { navigator.clipboard.writeText(resetUrl); message.success("Enlace copiado"); }} />
                  </Space>
                  {!isEdit && (
                    <Button type="primary" style={{ marginTop: 12 }} block onClick={onSuccess}>
                      Cerrar
                    </Button>
                  )}
                </div>
              )}
            </Space>
          </Form.Item>
        </>
      )}

      {!resetToken && (
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? t("common.update") : t("common.create")}
            </Button>
            <Button onClick={onCancel}>{t("common.cancel")}</Button>
          </Space>
        </Form.Item>
      )}
    </Form>
  );
};

export default UsuariosForm;
