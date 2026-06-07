import { useTranslate, useMountEffect } from "@hooks";
import { permissions } from "@utils";
import { PageTitle, Card } from "@components";
import { useDispatch, useSelector } from "react-redux";
import { Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchClientesAction, deleteClienteAction } from "../store/thunks";
import { clearClientesState } from "../store/clientesSlice";
import ClientesTable from "../components/ClientesTable";

const ClientesPage = () => {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clientesList, isLoading } = useSelector((state) => state.clientes);

  useMountEffect({
    effect: () => {
      dispatch(fetchClientesAction());
    },
    unMount: () => {
      dispatch(clearClientesState());
    },
    deps: [],
  });

  const handleEdit = (record) => {
    navigate(`/clientes/edit/${record.id}`);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteClienteAction(id)).unwrap();
      message.success(t("clientes.delete_success"));
      dispatch(fetchClientesAction()); // Recargar lista
    } catch (err) {
      message.error(err || t("clientes.delete_error"));
    }
  };

  return (
    <>
      <PageTitle
        title={t("clientes.title")}
        permissions={{
          action: permissions.Actions.READ,
          subject: permissions.Subjects.CLIENTES,
        }}
      />
      <Card
        title={t("clientes.list_title")}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/clientes/new")}
          >
            {t("clientes.new")}
          </Button>
        }
      >
        <ClientesTable
          data={clientesList}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          t={t}
        />
      </Card>
    </>
  );
};

export default ClientesPage;