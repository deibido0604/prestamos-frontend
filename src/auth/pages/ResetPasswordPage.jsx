import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, Input, Button, Result, Spin, Typography } from "antd";
import { LockOutlined, DollarOutlined } from "@ant-design/icons";
import axios from "axios";
import "../styles.scss";

const { Text } = Typography;

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api-prestamos";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("validating"); // validating | valid | invalid | success
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    axios.get(`${API_BASE}/systemUsers/reset-validate/${token}`)
      .then(({ data }) => {
        if (data.success) { setUserInfo(data.data); setStatus("valid"); }
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const onFinish = async ({ password }) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/systemUsers/reset-password/${token}`, { password });
      if (data.success) setStatus("success");
      else throw new Error(data.message);
    } catch (e) {
      form.setFields([{ name: "password", errors: [e.response?.data?.message || e.message] }]);
    } finally {
      setLoading(false);
    }
  };

  if (status === "validating") {
    return (
      <div className="login-wrapper" style={{ justifyContent: "center" }}>
        <Spin size="large" tip="Verificando enlace..." />
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="login-wrapper" style={{ justifyContent: "center" }}>
        <Result
          status="error"
          title="Enlace inválido o expirado"
          subTitle="El enlace de restablecimiento no es válido o ya fue utilizado. Solicita un nuevo enlace al administrador."
          extra={<Button type="primary" onClick={() => navigate("/auth/login")}>Ir al inicio de sesión</Button>}
        />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="login-wrapper" style={{ justifyContent: "center" }}>
        <Result
          status="success"
          title="¡Contraseña actualizada!"
          subTitle="Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión."
          extra={<Button type="primary" onClick={() => navigate("/auth/login")}>Iniciar sesión</Button>}
        />
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-bg-decor">
        <div className="decor-circle decor-1" />
        <div className="decor-circle decor-2" />
        <div className="decor-circle decor-3" />
      </div>

      <div className="login-left-panel">
        <div className="login-left-content">
          <div className="login-logo-container">
            <div className="login-logo-icon"><DollarOutlined /></div>
          </div>
          <h1 className="login-title">LoanPro</h1>
          <p className="login-subtitle">Gestión inteligente de préstamos</p>
        </div>
      </div>

      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Nueva contraseña</h2>
            {userInfo && (
              <p>
                Hola <strong>{userInfo.username}</strong>, ingresa tu nueva contraseña.
              </p>
            )}
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish} className="login-form">
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Ingresa la nueva contraseña" },
                { min: 6, message: "Mínimo 6 caracteres" },
              ]}
            >
              <Input.Password
                className="login-input"
                size="large"
                placeholder="Nueva contraseña"
                prefix={<LockOutlined className="login-icon" />}
              />
            </Form.Item>
            <Form.Item
              name="confirm"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Confirma la contraseña" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) return Promise.resolve();
                    return Promise.reject("Las contraseñas no coinciden");
                  },
                }),
              ]}
            >
              <Input.Password
                className="login-input"
                size="large"
                placeholder="Confirmar contraseña"
                prefix={<LockOutlined className="login-icon" />}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                className="login-button"
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
              >
                Restablecer contraseña
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <Text type="secondary" style={{ cursor: "pointer" }} onClick={() => navigate("/auth/login")}>
              ← Volver al inicio de sesión
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
