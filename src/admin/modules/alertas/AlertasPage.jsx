/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Switch,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tabs,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  BellOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import { CardContent } from "../../../admin/components";
import { useMediaQuery } from "../../../admin/hooks/useMediaQuery";
import {
  fetchAlertas,
  createAlerta,
  updateAlerta,
  deleteAlerta,
  toggleAlertaActivo,
  sendTestEmail,
} from "./store/thunks";

import { clearError, clearTestStatus } from "./store/alertasSlice";
import "./AlertasPage.scss";

const { Option } = Select;
const { TabPane } = Tabs;

const EVENTOS = [
  { value: "prestamo_vencido", label: "Préstamo vencido" },
  { value: "pago_proximo", label: "Pago próximo (3 días antes)" },
  { value: "prestamo_aprobado", label: "Préstamo aprobado" },
  { value: "cuota_pagada", label: "Cuota pagada" },
];

const AlertasPage = () => {
  const dispatch = useDispatch();
  const { list: alertas, loading, error, testEmailSending, testEmailSuccess } = useSelector(
    (state) => state.alertas
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [testEmailVisible, setTestEmailVisible] = useState(false);
  const [testForm] = Form.useForm();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Cargar alertas al montar el componente
  useEffect(() => {
    dispatch(fetchAlertas());
  }, [dispatch]);

  // Manejar errores globales
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Manejar éxito de envío de correo de prueba
  useEffect(() => {
    if (testEmailSuccess) {
      message.success("Correo de prueba enviado correctamente");
      dispatch(clearTestStatus());
      setTestEmailVisible(false);
      testForm.resetFields();
    }
  }, [testEmailSuccess, dispatch, testForm]);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ activo: true, frecuencia: "diaria" });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      nombre: record.nombre,
      evento: record.evento,
      destinatarios: record.destinatarios.join(","),
      activo: record.activo,
      plantilla: record.plantilla,
      frecuencia: record.frecuencia,
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    dispatch(deleteAlerta(id)).then(() => {
      message.success("Alerta eliminada");
    });
  };

  const handleToggleActivo = (id, checked) => {
    dispatch(toggleAlertaActivo({ id, activo: checked }));
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const destinatarios = values.destinatarios
        .split(",")
        .map((email) => email.trim())
        .filter((e) => e);
      const alertaData = {
        nombre: values.nombre,
        evento: values.evento,
        destinatarios,
        activo: values.activo,
        plantilla: values.plantilla,
        frecuencia: values.frecuencia,
      };
      if (editingId) {
        dispatch(updateAlerta({ id: editingId, ...alertaData }))
          .unwrap()
          .then(() => {
            message.success("Alerta actualizada");
            setModalVisible(false);
          });
      } else {
        dispatch(createAlerta(alertaData))
          .unwrap()
          .then(() => {
            message.success("Alerta creada");
            setModalVisible(false);
          });
      }
    });
  };

  const handleTestEmail = () => {
    testForm.validateFields().then((values) => {
      dispatch(sendTestEmail({ email: values.testEmail, evento: values.testEvento }));
    });
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      width: isMobile ? "100%" : "auto",
      ellipsis: true,
    },
    {
      title: "Evento",
      dataIndex: "evento",
      key: "evento",
      render: (ev) => (
        <Tag color="blue">{EVENTOS.find((e) => e.value === ev)?.label || ev}</Tag>
      ),
      hidden: isMobile,
    },
    {
      title: "Frecuencia",
      dataIndex: "frecuencia",
      key: "frecuencia",
      render: (freq) => {
        const map = { diaria: "Diaria", semanal: "Semanal", mensual: "Mensual" };
        return <Tag>{map[freq] || freq}</Tag>;
      },
      hidden: isMobile,
    },
    {
      title: "Destinatarios",
      dataIndex: "destinatarios",
      key: "destinatarios",
      render: (emails) => (
        <Space direction="vertical" size="small">
          {emails.slice(0, isMobile ? 1 : 2).map((email, idx) => (
            <Tag key={idx} icon={<MailOutlined />} color="geekblue">
              {isMobile ? (email.substring(0, 15) + (email.length > 15 ? "..." : "")) : email}
            </Tag>
          ))}
          {emails.length > (isMobile ? 1 : 2) && <Tag>+{emails.length - (isMobile ? 1 : 2)}</Tag>}
        </Space>
      ),
      hidden: isMobile,
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      render: (activo, record) => (
        <Switch
          checked={activo}
          onChange={(checked) => handleToggleActivo(record.id, checked)}
          size={isMobile ? "small" : "default"}
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space size={isMobile ? "small" : "middle"}>
          <Button
            icon={<EditOutlined />}
            size={isMobile ? "small" : "default"}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="¿Eliminar esta alerta?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size={isMobile ? "small" : "default"} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ].filter((col) => !col.hidden);

  if (loading && alertas.length === 0) {
    return (
      <CardContent className="alertas-page">
        <Spin size="large" style={{ display: "block", margin: "50px auto" }} />
      </CardContent>
    );
  }

  return (
    <CardContent className="alertas-page">
      <div className="alertas-header">
        <h1>
          <BellOutlined /> Configuración de Alertas por Correo
        </h1>
        <p className="subtitle">
          Administra las reglas de notificación y prueba el envío de correos
        </p>
      </div>

      <Tabs defaultActiveKey="config" className="alertas-tabs">
        <TabPane tab="Reglas de Alerta" key="config">
          <Card className="alertas-card">
            <div className="alertas-actions">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                block={isMobile}
              >
                Nueva Alerta
              </Button>
            </div>
            {isMobile ? (
              <div className="alertas-mobile-list">
                {alertas.map((alerta) => (
                  <Card key={alerta.id} className="alerta-mobile-card" size="small">
                    <div className="alerta-mobile-row">
                      <strong>{alerta.nombre}</strong>
                      <Switch
                        checked={alerta.activo}
                        onChange={(checked) => handleToggleActivo(alerta.id, checked)}
                        size="small"
                      />
                    </div>
                    <div className="alerta-mobile-row">
                      <Tag color="blue">
                        {EVENTOS.find((e) => e.value === alerta.evento)?.label || alerta.evento}
                      </Tag>
                    </div>
                    <div className="alerta-mobile-row">
                      <Tag>
                        {alerta.frecuencia === "diaria"
                          ? "Diaria"
                          : alerta.frecuencia === "semanal"
                          ? "Semanal"
                          : "Mensual"}
                      </Tag>
                    </div>
                    <div className="alerta-mobile-row">
                      <small>
                        <MailOutlined /> {alerta.destinatarios.join(", ")}
                      </small>
                    </div>
                    <div className="alerta-mobile-actions">
                      <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(alerta)}
                      />
                      <Popconfirm
                        title="¿Eliminar esta alerta?"
                        onConfirm={() => handleDelete(alerta.id)}
                        okText="Sí"
                        cancelText="No"
                      >
                        <Button icon={<DeleteOutlined />} size="small" danger />
                      </Popconfirm>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={alertas}
                rowKey="id"
                pagination={false}
                scroll={{ x: true }}
              />
            )}
          </Card>
        </TabPane>

        <TabPane tab="Prueba de Envío" key="test">
          <Card className="alertas-card">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <p>
                  Envía un correo de prueba para verificar que la configuración
                  SMTP funciona correctamente.
                </p>
                <Button
                  type="primary"
                  icon={<ExperimentOutlined />}
                  onClick={() => setTestEmailVisible(true)}
                  loading={testEmailSending}
                  block={isMobile}
                >
                  Enviar correo de prueba
                </Button>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal para crear/editar alerta */}
      <Modal
        title={editingId ? "Editar Alerta" : "Nueva Alerta"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={isMobile ? "95vw" : 600}
      >
        <Form form={form} layout="vertical" initialValues={{ activo: true, frecuencia: "diaria" }}>
          <Form.Item
            name="nombre"
            label="Nombre de la alerta"
            rules={[{ required: true, message: "Ingrese un nombre" }]}
          >
            <Input placeholder="Ej: Alerta vencimiento" />
          </Form.Item>
          <Form.Item
            name="evento"
            label="Evento disparador"
            rules={[{ required: true }]}
          >
            <Select placeholder="Seleccione un evento">
              {EVENTOS.map((e) => (
                <Option key={e.value} value={e.value}>
                  {e.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="destinatarios"
            label="Correos electrónicos (separados por coma)"
            rules={[{ required: true, message: "Ingrese al menos un correo" }]}
            tooltip="Ej: admin@dominio.com, cobranza@dominio.com"
          >
            <Input placeholder="correo1@ejemplo.com, correo2@ejemplo.com" />
          </Form.Item>
          <Form.Item
            name="frecuencia"
            label="Frecuencia de notificación"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="diaria">Diaria</Option>
              <Option value="semanal">Semanal</Option>
              <Option value="mensual">Mensual</Option>
            </Select>
          </Form.Item>
          <Form.Item name="activo" label="Activo" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="plantilla"
            label="Plantilla del mensaje (opcional)"
            tooltip="Puedes usar variables como {monto}, {nombreCliente}, {fecha}"
          >
            <Input.TextArea rows={3} placeholder="Mensaje personalizado..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para prueba de correo */}
      <Modal
        title="Enviar correo de prueba"
        open={testEmailVisible}
        onOk={handleTestEmail}
        onCancel={() => setTestEmailVisible(false)}
        confirmLoading={testEmailSending}
        width={isMobile ? "95vw" : 500}
      >
        <Form form={testForm} layout="vertical">
          <Form.Item
            name="testEmail"
            label="Correo destino"
            rules={[{ required: true, type: "email", message: "Correo válido requerido" }]}
          >
            <Input placeholder="tu@correo.com" />
          </Form.Item>
          <Form.Item
            name="testEvento"
            label="Evento simulado"
            rules={[{ required: true }]}
          >
            <Select placeholder="Selecciona un evento">
              {EVENTOS.map((e) => (
                <Option key={e.value} value={e.value}>
                  {e.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </CardContent>
  );
};

export default AlertasPage;
