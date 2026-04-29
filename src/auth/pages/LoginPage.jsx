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
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Notification } from "@components";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [form] = Form.useForm();

  const handleValuesChange = (_, allValues) => {
    const { username, password } = allValues;
    setButtonDisabled(!(username && password));
  };

  const onLogin = async () => {
    try {
      const values = form.getFieldsValue();
      await login(values);
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  return (
    <div className="wraper">
      <div className="login-container">
        <Notification />

        {/* 🔹 LADO IZQUIERDO */}
        <div className="image-login">
          <h3 className="product_name">Sistema de Prestamos</h3>
          <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            Credenciales de demo:<br/>
            Usuario: <strong>admin</strong><br/>
            Contraseña: <strong>admin123</strong>
          </p>
          <img
            src="/img/brand_icon_halftone-02.png"
            className="brand-icon"
            alt="Brand"
            style={{ marginTop: '40px' }}
          />
        </div>

        {/* 🔹 LADO DERECHO */}
        <div className="form-container">
          <h3 className="login-text">Inicio de sesión</h3>

          <Form
            form={form}
            autoComplete="off"
            onValuesChange={handleValuesChange}
            layout="vertical"
          >
            {/* USERNAME */}
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Ingrese su usuario" }]}
            >
              <Input
                className="login-input"
                size="large"
                placeholder="Usuario o correo"
                prefix={<UserOutlined />}
              />
            </Form.Item>

            {/* PASSWORD */}
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Ingrese su contraseña" }]}
            >
              <Input.Password
                className="login-input"
                size="large"
                placeholder="Contraseña"
                prefix={<LockOutlined />}
              />
            </Form.Item>

            {/* BUTTON */}
            <Form.Item>
              <Button
                className="login-button"
                size="large"
                type="primary"
                htmlType="button"
                onClick={onLogin}
                disabled={isButtonDisabled}
                block
              >
                Entrar
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
