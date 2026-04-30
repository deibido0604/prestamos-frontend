import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Input, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { ClientesForm } from "./components/ClientesForm";
import { ClientesList } from "./components/ClientesList";
import { addCliente, updateCliente, deleteCliente } from "./store/clientesSlice";
import "./styles.scss";

const ClientesPage = () => {
  const dispatch = useDispatch();
  const clientes = useSelector((state) => state.clientes.list);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchText, setSearchText] = useState("");

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombreCompleto.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.cedula.includes(searchText) ||
      cliente.correo.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddCliente = () => {
    setEditingCliente(null);
    setIsModalVisible(true);
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setIsModalVisible(true);
  };

  const handleDeleteCliente = (id) => {
    Modal.confirm({
      title: "Eliminar Cliente",
      content: "¿Está seguro de que desea eliminar este cliente?",
      okText: "Sí",
      cancelText: "No",
      onOk() {
        dispatch(deleteCliente(id));
      },
    });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingCliente(null);
  };

  const handleSaveCliente = (values) => {
    if (editingCliente) {
      dispatch(updateCliente({ ...editingCliente, ...values }));
    } else {
      dispatch(addCliente(values));
    }
    handleModalClose();
  };

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <div>
          <h1>Gestión de Clientes</h1>
          <p className="subtitle">Administra todos tus clientes</p>
        </div>
        <Space>
          <Input
            placeholder="Buscar cliente..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddCliente}
          >
            Nuevo Cliente
          </Button>
        </Space>
      </div>

      <div className="clientes-content">
        <ClientesList
          clientes={filteredClientes}
          onEdit={handleEditCliente}
          onDelete={handleDeleteCliente}
        />
      </div>

      <Modal
        title={editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <ClientesForm
          cliente={editingCliente}
          onSave={handleSaveCliente}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default ClientesPage;
