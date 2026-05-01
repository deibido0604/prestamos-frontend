// import { Button, Form, Input } from "antd";
// import { useContext, useState } from "react";
// import "../styles.scss";
// import { AuthContext } from "../../admin/context";
// import { UserOutlined, LockOutlined } from "@ant-design/icons";
// import { Notification } from "@components";

// const LoginPage = () => {
//   const { login } = useContext(AuthContext);
//   const [isButtonDisabled, setButtonDisabled] = useState(true);
//   const [emailErrorMessage, setEmailErrorMessage] = useState("");
//   const [form] = Form.useForm();

//   const validateEmail = (value) => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@inventario\.com$/;
//     return value && emailRegex.test(value);
//   };

//   const handleValuesChange = (_, allValues) => {
//     const { username, password } = allValues;
//     const isEmailValid = validateEmail(username);
//     const isFieldsFilled = username && password;

//     setEmailErrorMessage(
//       isEmailValid
//         ? ""
//         : "Please input a valid email with the authorized domain",
//     );

//     setButtonDisabled(!(isEmailValid && isFieldsFilled));
//   };

//   const onLogin = () => {
//     login(form.getFieldsValue());
//   };

//   return (
//     <div className="wraper">
//       <div className="login-container">
//         <Notification />

//         <div className="image-login">
//           <h3 className="product_name">Inventory System</h3>
//           <img
//             src="/img/brand_icon_halftone-02.png"
//             className="brand-icon"
//             alt="Brand"
//           />
//         </div>

//         <div className="form-container">
//           <h3 className="login-text">Inicio de sesión</h3>

//           <Form
//             form={form}
//             autoComplete="on"
//             onValuesChange={handleValuesChange}
//           >
//             <Form.Item
//               name="username"
//               rules={[{ type: "email", required: true }]}
//               validateStatus={emailErrorMessage ? "error" : ""}
//               help={emailErrorMessage}
//             >
//               <Input
//                 size="large"
//                 placeholder="Usuario"
//                 prefix={<UserOutlined />}
//               />
//             </Form.Item>

//             <Form.Item
//               name="password"
//               rules={[
//                 { required: true, message: "Please input your password!" },
//               ]}
//             >
//               <Input.Password
//                 size="large"
//                 placeholder="Contraseña"
//                 prefix={<LockOutlined />}
//               />
//             </Form.Item>

//             <Form.Item>
//               <Button
//                 size="large"
//                 type="primary"
//                 htmlType="submit"
//                 onClick={onLogin}
//                 disabled={isButtonDisabled}
//                 block
//               >
//                 Entrar
//               </Button>
//             </Form.Item>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;


import { Button, Form, Input } from "antd";
import { useContext, useState } from "react";
import "../styles.scss";
import { AuthContext } from "../../admin/context";
import { UserOutlined, LockOutlined, DollarOutlined } from "@ant-design/icons";
import { Notification } from "@components";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleValuesChange = (_, allValues) => {
    const { username, password } = allValues;
    setButtonDisabled(!(username && password));
  };

  const onLogin = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      await login(values);
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Notification />
      
      {/* Elementos decorativos de fondo */}
      <div className="login-bg-decor">
        <div className="decor-circle decor-1"></div>
        <div className="decor-circle decor-2"></div>
        <div className="decor-circle decor-3"></div>
      </div>

      {/* Panel izquierdo - Branding */}
      <div className="login-left-panel">
        <div className="login-left-content">
          <div className="login-logo-container">
            <div className="login-logo-icon">
              <DollarOutlined />
            </div>
          </div>

          <h1 className="login-title">LoanPro</h1>
          <p className="login-subtitle">
            Gestión inteligente de préstamos y financiamientos
          </p>

          {/* Caja de información con características */}
          <div className="login-info-box">
            <div className="info-item">
              <span className="info-icon">👥</span>
              <p>Gestión de clientes</p>
            </div>
            <div className="info-item">
              <span className="info-icon">📊</span>
              <p>Análisis de créditos</p>
            </div>
            <div className="info-item">
              <span className="info-icon">📈</span>
              <p>Cálculo automático</p>
            </div>
            <div className="info-item">
              <span className="info-icon">🔔</span>
              <p>Alertas inteligentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario de login */}
      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Bienvenido</h2>
            <p>Inicia sesión para acceder a tu cuenta</p>
          </div>

          <Form
            form={form}
            autoComplete="off"
            onValuesChange={handleValuesChange}
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Por favor ingresa tu usuario" }]}
            >
              <Input
                className="login-input"
                size="large"
                placeholder="Usuario"
                prefix={<UserOutlined className="login-icon" />}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Por favor ingresa tu contraseña" }]}
            >
              <Input.Password
                className="login-input"
                size="large"
                placeholder="Contraseña"
                prefix={<LockOutlined className="login-icon" />}
              />
            </Form.Item>

            {/* Información de demo */}
            <div className="login-demo-info">
              <p>
                <strong>Demo:</strong> Usuario: <code>admin</code> | Contraseña: <code>admin123</code>
              </p>
            </div>

            {/* Botón de login */}
            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button
                className="login-button"
                type="primary"
                size="large"
                htmlType="button"
                onClick={onLogin}
                disabled={isButtonDisabled}
                loading={loading}
                block
              >
                {loading ? "Autenticando..." : "Iniciar Sesión"}
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div className="login-footer">
            <p>© 2024 Sistema de Control de Préstamos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
