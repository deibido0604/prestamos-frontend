import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Input, Space } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { CardContent } from "../../../admin/components";
import { PrestamosForm } from "./components/PrestamosForm";
import { PrestamosList } from "./components/PrestamosList";
import { addPrestamo, updatePrestamo, deletePrestamo } from "./store/prestamosSlice";
import "./styles.scss";

const PrestamosPage = () => {
  const dispatch = useDispatch();
  const prestamos = useSelector((state) => state.prestamos.list);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPrestamo, setEditingPrestamo] = useState(null);
  const [searchText, setSearchText] = useState("");

  const filteredPrestamos = prestamos.filter(
    (prestamo) =>
      prestamo.cliente.toLowerCase().includes(searchText.toLowerCase()) ||
      prestamo.concepto.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddPrestamo = () => {
    setEditingPrestamo(null);
    setIsModalVisible(true);
  };

  const handleEditPrestamo = (prestamo) => {
    setEditingPrestamo(prestamo);
    setIsModalVisible(true);
  };

  const handleDeletePrestamo = (id) => {
    Modal.confirm({
      title: "Eliminar Préstamo",
      content: "¿Está seguro de que desea eliminar este préstamo?",
      okText: "Sí",
      cancelText: "No",
      onOk() {
        dispatch(deletePrestamo(id));
      },
    });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingPrestamo(null);
  };

  const handleSavePrestamo = (values) => {
    if (editingPrestamo) {
      dispatch(updatePrestamo({ ...editingPrestamo, ...values }));
    } else {
      dispatch(addPrestamo(values));
    }
    handleModalClose();
  };

  return (
    <CardContent className="prestamos-page">
      <div className="prestamos-header">
        <div>
          <h1>Gestión de Préstamos</h1>
          <p className="subtitle">Administra todos tus préstamos en LPS</p>
        </div>
        <Space>
          <Input
            placeholder="Buscar préstamo..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddPrestamo}
          >
            Nuevo Préstamo
          </Button>
        </Space>
      </div>

      <PrestamosList
        prestamos={filteredPrestamos}
        onEdit={handleEditPrestamo}
        onDelete={handleDeletePrestamo}
      />

      <Modal
        title={editingPrestamo ? "Editar Préstamo" : "Nuevo Préstamo"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={650}
      >
        <PrestamosForm
          prestamo={editingPrestamo}
          onSave={handleSavePrestamo}
          onCancel={handleModalClose}
        />
      </Modal>
    </CardContent>
  );
};

export default PrestamosPage;
