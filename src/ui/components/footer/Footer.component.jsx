import { Layout } from 'antd';
const { Footer } = Layout;

export const FooterComponent = () => {
  return (
    <Footer
      style={{
        textAlign: 'center',
      }}
    >
      {`Sistema de Prestamos  ${new Date().getFullYear()}`}
    </Footer>
  );
};
