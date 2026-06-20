import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, message, Table, Space, Popconfirm, Tag, Checkbox, Form, Input, Card, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMountEffect, useTranslate } from "@hooks";
import { PageTitle } from "@components";
import { CardContent } from "../../../components";
import { permissions } from "@utils";
import { Can } from "@components";
import { fetchRolesAction, fetchPermissionsAction, createRolAction, updateRolAction, deleteRolAction } from "../store/rolesThunks";
import { clearRolesState } from "../store/rolesSlice";

// ─── Form de Rol ─────────────────────────────────────────────────────────────
const RolForm = ({ rol, permissionsList, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const isEdit = !!rol;

  const [selectedPerms, setSelectedPerms] = useState(() => {
    if (!rol?.permissions) return {};
    const map = {};
    rol.permissions.forEach((p) => { map[p.resource] = p.actions || []; });
    return map;
  });

  const allActions = ["read", "create", "update", "delete"];

  const toggleAction = (resource, action) => {
    setSelectedPerms((prev) => {
      const current = prev[resource] || [];
      const next = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: next };
    });
  };

  const toggleAll = (resource, permsEntry) => {
    setSelectedPerms((prev) => {
      const available = permsEntry.actions || allActions;
      const current = prev[resource] || [];
      const hasAll = available.every((a) => current.includes(a));
      return { ...prev, [resource]: hasAll ? [] : [...available] };
    });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const permissionsPayload = Object.entries(selectedPerms)
        .filter(([, acts]) => acts.length > 0)
        .map(([resource, acts]) => ({ resource, actions: acts }));

      const payload = { ...values, permissions: permissionsPayload };
      if (isEdit) {
        await dispatch(updateRolAction({ id: rol.id, changes: payload })).unwrap();
        message.success("Rol actualizado correctamente");
      } else {
        await dispatch(createRolAction(payload)).unwrap();
        message.success("Rol creado correctamente");
      }
      onSuccess();
    } catch (err) {
      message.error(err || "Error al guardar rol");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}
      initialValues={{ name: rol?.name || "", type: rol?.type || "custom" }}>
      <Form.Item name="name" label="Nombre del Rol" rules={[{ required: true }]}>
        <Input placeholder="Ej: Supervisor" />
      </Form.Item>

      <Form.Item label="Permisos">
        <div style={{ border: "1px solid #f0f0f0", borderRadius: 6 }}>
          {permissionsList.map((perm, idx) => {
            const current = selectedPerms[perm.resource] || [];
            const available = perm.actions || allActions;
            const allSelected = available.every((a) => current.includes(a));
            return (
              <div
                key={perm.id}
                style={{
                  padding: "10px 12px",
                  borderTop: idx === 0 ? "none" : "1px solid #f0f0f0",
                  background: idx % 2 === 0 ? "#fff" : "#fafafa",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontWeight: 500, minWidth: 90 }}>{perm.label}</span>
                  <Space wrap size={[8, 4]}>
                    {allActions.map((a) =>
                      available.includes(a) ? (
                        <label key={a} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", textTransform: "capitalize", fontSize: 13 }}>
                          <Checkbox checked={current.includes(a)} onChange={() => toggleAction(perm.resource, a)} />
                          {a}
                        </label>
                      ) : null
                    )}
                    <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 13, color: "#1677ff" }}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={current.length > 0 && !allSelected}
                        onChange={() => toggleAll(perm.resource, perm)}
                      />
                      Todo
                    </label>
                  </Space>
                </div>
              </div>
            );
          })}
        </div>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>{isEdit ? "Actualizar" : "Crear"}</Button>
          <Button onClick={onCancel}>Cancelar</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

// ─── Cards para móvil ─────────────────────────────────────────────────────────
const RolesMobileView = ({ data, onEdit, onDelete }) => (
  <Row gutter={[16, 16]}>
    {data.map((rol) => (
      <Col xs={24} key={rol.id}>
        <Card
          hoverable
          actions={[
            <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(rol)}>Editar</Button>,
            <Can I={permissions.Actions.DELETE} a={permissions.Subjects.ADMINISTRACION} passThrough>
              {(allowed) => allowed && (
                <Popconfirm title="¿Eliminar este rol?" onConfirm={() => onDelete(rol.id)}>
                  <Button type="link" danger icon={<DeleteOutlined />}>Eliminar</Button>
                </Popconfirm>
              )}
            </Can>,
          ]}
        >
          <Card.Meta
            title={rol.name}
            description={
              <Space direction="vertical" size="small">
                <div><Tag>{rol.type}</Tag></div>
                <Space wrap>
                  {(rol.permissions || []).map((p) => (
                    <Tag key={p.resource} color="blue">{p.resource}</Tag>
                  ))}
                </Space>
              </Space>
            }
          />
        </Card>
      </Col>
    ))}
  </Row>
);

// ─── Página principal ─────────────────────────────────────────────────────────
const RolesPage = () => {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((s) => s.roles);
  const [permissionsList, setPermissionsList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 768px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useMountEffect({
    effect: () => {
      dispatch(fetchRolesAction());
      dispatch(fetchPermissionsAction()).then((action) => {
        if (action.payload) setPermissionsList(action.payload);
      });
    },
    unMount: () => dispatch(clearRolesState()),
    deps: [],
  });

  const handleEdit = (record) => { setEditingRol(record); setModalVisible(true); };
  const handleAdd  = () => { setEditingRol(null); setModalVisible(true); };
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteRolAction(id)).unwrap();
      message.success("Rol eliminado");
    } catch (err) {
      message.error(err || "Error al eliminar");
    }
  };

  const columns = [
    { title: "#", dataIndex: "id", width: 60 },
    { title: "Nombre", dataIndex: "name" },
    { title: "Tipo", dataIndex: "type", render: (v) => <Tag>{v}</Tag> },
    {
      title: "Permisos",
      dataIndex: "permissions",
      render: (perms = []) => <Space wrap>{perms.map((p) => <Tag key={p.resource} color="blue">{p.resource}</Tag>)}</Space>,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Can I={permissions.Actions.DELETE} a={permissions.Subjects.ADMINISTRACION} passThrough>
            {(allowed) => allowed && (
              <Popconfirm title="¿Eliminar este rol?" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageTitle
        title="Gestión de Roles"
        addButton={{ text: "Nuevo Rol", onClick: handleAdd }}
        permissions={{ action: permissions.Actions.CREATE, subject: permissions.Subjects.ADMINISTRACION }}
      />
      <CardContent>
        {isMobile
          ? <RolesMobileView data={list} onEdit={handleEdit} onDelete={handleDelete} />
          : (
            <Table
              columns={columns}
              dataSource={list}
              loading={isLoading}
              rowKey="id"
              pagination={{ pageSize: 10, showTotal: (total) => `Total: ${total}` }}
            />
          )
        }
      </CardContent>

      <Modal
        title={editingRol ? "Editar Rol" : "Nuevo Rol"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
        width="95%"
        style={{ maxWidth: 680 }}
      >
        <RolForm
          rol={editingRol}
          permissionsList={permissionsList}
          onSuccess={() => { setModalVisible(false); dispatch(fetchRolesAction()); }}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </>
  );
};

export default RolesPage;
