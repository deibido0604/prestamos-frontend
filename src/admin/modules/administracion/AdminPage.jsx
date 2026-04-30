import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { CardContent } from "../../../ui/index";
import { UsuariosForm } from "./components/UsuariosForm";
import { UsuariosList } from "./components/UsuariosList";
import { addUsuario, updateUsuario, deleteUsuario } from "./store/usuariosSlice";
import "./styles.scss";

const AdminPage = () => {
  const dispatch = useDispatch();
  const usuarios = useSelector((state) => state.usuarios.list);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  const handleAddUsuario = () => {
    setEditingUsuario(null);
    setIsModalVisible(true);
  };

  const handleEditUsuario = (usuario) => {
    setEditingUsuario(usuario);
    setIsModalVisible(true);
  };

  const handleDeleteUsuario = (id) => {
    Modal.confirm({
      title: "Eliminar Usuario",
      content: "¿Está seguro de que desea eliminar este usuario?",
      okText: "Sí",
      cancelText: "No",
      onOk() {
        dispatch(deleteUsuario(id));
      },
    });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingUsuario(null);
  };

  const handleSaveUsuario = (values) => {
    if (editingUsuario) {
      dispatch(updateUsuario({ ...editingUsuario, ...values }));
    } else {
      dispatch(addUsuario(values));
    }
    handleModalClose();
  };

  return (
    <CardContent className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p className="subtitle">Administra los usuarios del sistema</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAddUsuario}
        >
          Nuevo Usuario
        </Button>
      </div>

      <UsuariosList
        usuarios={usuarios}
        onEdit={handleEditUsuario}
        onDelete={handleDeleteUsuario}
      />

      <Modal
        title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={500}
      >
        <UsuariosForm
          usuario={editingUsuario}
          onSave={handleSaveUsuario}
          onCancel={handleModalClose}
        />
      </Modal>
    </CardContent>
  );
};

export default AdminPage;
