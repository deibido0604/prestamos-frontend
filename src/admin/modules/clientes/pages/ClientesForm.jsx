import { useMountEffect, useTranslate } from "@hooks";
import { permissions } from "@utils";
import { PageTitle, Card } from "@components";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, Row, Col, InputNumber, Space, message } from "antd";
import { useEffect } from "react";
import { fetchClienteByIdAction, createClienteAction, updateClienteAction } from "../store/thunks";
import { clearClientesState } from "../store/clientesSlice";

const { Option } = Select;

const ClientesFormPage = () => {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const { clienteDetail, isLoading } = useSelector((state) => state.clientes);
  const isEdit = Boolean(id);

  useMountEffect({
    effect: () => {
      if (isEdit && id) {
        dispatch(fetchClienteByIdAction(id));
      }
    },
    unMount: () => {
      dispatch(clearClientesState());
    },
    deps: [id],
  });

  useEffect(() => {
    if (clienteDetail && isEdit) {
      form.setFieldsValue({
        nombreCompleto: clienteDetail.nombreCompleto,
        cedula: clienteDetail.cedula,
        correo: clienteDetail.correo,
        telefono: clienteDetail.telefono,
        telefonoSecundario: clienteDetail.telefonoSecundario,
        direccion: clienteDetail.direccion,
        profesion: clienteDetail.profesion,
        lugarTrabajo: clienteDetail.lugarTrabajo,
        antiguedad: clienteDetail.antiguedad,
        referencias: clienteDetail.referencias,
        estado: clienteDetail.estado,
      });
    } else if (!isEdit) {
      form.setFieldsValue({ estado: "activo" });
    }
  }, [clienteDetail, form, isEdit]);

  const onFinish = async (values) => {
    try {
      if (isEdit) {
        await dispatch(updateClienteAction({ id, changes: values })).unwrap();
        message.success(t("clientes.update_success"));
      } else {
        await dispatch(createClienteAction(values)).unwrap();
        message.success(t("clientes.create_success"));
      }
      navigate("/clientes");
    } catch (err) {
      message.error(err || (isEdit ? t("clientes.update_error") : t("clientes.create_error")));
    }
  };

  return (
    <>
      <PageTitle
        title={isEdit ? t("clientes.edit") : t("clientes.new")}
        permissions={{
          action: isEdit ? permissions.Actions.UPDATE : permissions.Actions.CREATE,
          subject: permissions.Subjects.CLIENTES,
        }}
      />
      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ estado: "activo" }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="nombreCompleto" label={t("clientes.nombre")} rules={[{ required: true }]}>
                <Input placeholder={t("clientes.nombre_placeholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="cedula" label={t("clientes.cedula")} rules={[{ required: true }]}>
                <Input placeholder="0801-1995-12345" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="correo" label={t("clientes.correo")} rules={[{ type: "email" }]}>
                <Input placeholder="cliente@email.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="telefono" label={t("clientes.telefono")} rules={[{ required: true }]}>
                <Input placeholder="98765432" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="telefonoSecundario" label={t("clientes.telefono_secundario")}>
                <Input placeholder="98765433" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="profesion" label={t("clientes.profesion")}>
                <Input placeholder={t("clientes.profesion_placeholder")} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="direccion" label={t("clientes.direccion")}>
            <Input.TextArea rows={2} placeholder={t("clientes.direccion_placeholder")} />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="lugarTrabajo" label={t("clientes.lugar_trabajo")}>
                <Input placeholder={t("clientes.lugar_trabajo_placeholder")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="antiguedad" label={t("clientes.antiguedad")}>
                <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="referencias" label={t("clientes.referencias")}>
            <Input.TextArea rows={2} placeholder={t("clientes.referencias_placeholder")} />
          </Form.Item>
          <Form.Item name="estado" label={t("clientes.estado")}>
            <Select>
              <Option value="activo">{t("clientes.active")}</Option>
              <Option value="inactivo">{t("clientes.inactive")}</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {isEdit ? t("common.update") : t("common.create")}
              </Button>
              <Button onClick={() => navigate("/clientes")}>{t("common.cancel")}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default ClientesFormPage;