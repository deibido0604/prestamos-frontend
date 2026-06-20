import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, message } from "antd";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { CardContent } from "../../../components";
import { useMountEffect, useTranslate } from "@hooks";
import { permissions } from "@utils";
import { PageTitle } from "@components";
import { fetchUsuariosAction, deleteUsuarioAction } from "../store/thunks";
import { clearUsuariosState } from "../store/usuariosSlice";
import UsuariosTable from "../components/UsuariosTable";
import UsuariosForm from "./UsuariosForm";

const AdminPage = () => {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, isLoading } = useSelector((state) => state.usuarios);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  useMountEffect({
    effect: () => {
      dispatch(fetchUsuariosAction());
    },
    unMount: () => {
      dispatch(clearUsuariosState());
    },
    deps: [],
  });

  const handleAdd = () => {
    setEditingUsuario(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUsuario(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteUsuarioAction(id)).unwrap();
      message.success(t("usuarios.delete_success"));
      dispatch(fetchUsuariosAction());
    } catch (err) {
      message.error(err || t("usuarios.delete_error"));
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditingUsuario(null);
    dispatch(fetchUsuariosAction());
  };

  return (
    <>
      <PageTitle
        title={t("usuarios.title")}
        addButton={{
          text: t("usuarios.new"),
          onClick: handleAdd,
        }}
        permissions={{
          action: permissions.Actions.CREATE,
          subject: permissions.Subjects.ADMINISTRACION,
        }}
      />
      <CardContent className="admin-page">
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Button icon={<TeamOutlined />} onClick={() => navigate("/main/administracion/roles")}>
            Gestionar Roles
          </Button>
        </div>
        <UsuariosTable
          data={list}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          t={t}
        />
      </CardContent>

      <Modal
        title={editingUsuario ? t("usuarios.edit") : t("usuarios.new")}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width="95%"
        style={{ maxWidth: 600 }}
      >
        <UsuariosForm
          usuario={editingUsuario}
          onSuccess={handleModalSuccess}
          onCancel={() => setModalVisible(false)}
          t={t}
        />
      </Modal>
    </>
  );
};

export default AdminPage;
