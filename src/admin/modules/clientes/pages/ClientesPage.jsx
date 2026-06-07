import { useState } from "react";
import { useTranslate, useMountEffect } from "@hooks";
import { permissions } from "@utils";
import { PageTitle, Card } from "@components";
import { useDispatch, useSelector } from "react-redux";
import { Modal, message } from "antd";
import { fetchClientesAction, deleteClienteAction } from "../store/thunks";
import { clearClientesState } from "../store/clientesSlice";
import ClientesTable from "../components/ClientesTable";
import ClientesForm from "./ClientesForm";

const ClientesPage = () => {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { clientesList, isLoading } = useSelector((state) => state.clientes);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  useMountEffect({
    effect: () => {
      dispatch(fetchClientesAction());
    },
    unMount: () => {
      dispatch(clearClientesState());
    },
    deps: [],
  });

  const handleAdd = () => {
    setEditingCliente(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCliente(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteClienteAction(id)).unwrap();
      message.success(t("clientes.delete_success"));
      dispatch(fetchClientesAction());
    } catch (err) {
      message.error(err || t("clientes.delete_error"));
    }
  };

  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditingCliente(null);
    dispatch(fetchClientesAction()); // recargar lista después de guardar
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingCliente(null);
  };

  return (
    <>
      <PageTitle
        title={t("clientes.title")}
        addButton={{
          text: t("clientes.new"),
          onClick: handleAdd,
        }}
        permissions={{
          action: permissions.Actions.CREATE,
          subject: permissions.Subjects.CLIENTES,
        }}
      />
      <Card>
        <ClientesTable
          data={clientesList}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          t={t}
        />
      </Card>

      <Modal
        title={editingCliente ? t("clientes.edit") : t("clientes.new")}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose
        width={600}
      >
        <ClientesForm
          cliente={editingCliente}
          onSuccess={handleModalSuccess}
          onCancel={handleModalCancel}
          t={t}
        />
      </Modal>
    </>
  );
};

export default ClientesPage;