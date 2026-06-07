import { Space, Table, Tag, Button, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { permissions } from "@utils";
import { Can } from "@components";

const ClientesTable = ({ data, loading, onEdit, onDelete, t }) => {
  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: "5%",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t("clientes.nombre"),
      dataIndex: "nombreCompleto",
      key: "nombreCompleto",
      width: "20%",
      sorter: (a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto),
    },
    {
      title: t("clientes.cedula"),
      dataIndex: "cedula",
      key: "cedula",
      width: "12%",
    },
    {
      title: t("clientes.telefono"),
      dataIndex: "telefono",
      key: "telefono",
      width: "10%",
    },
    {
      title: t("clientes.correo"),
      dataIndex: "correo",
      key: "correo",
      width: "15%",
      ellipsis: true,
    },
    {
      title: t("clientes.profesion"),
      dataIndex: "profesion",
      key: "profesion",
      width: "12%",
    },
    {
      title: t("clientes.estado"),
      dataIndex: "estado",
      key: "estado",
      width: "8%",
      render: (estado) => (
        <Tag color={estado === "activo" ? "green" : "red"}>
          {estado === "activo" ? t("clientes.active") : t("clientes.inactive")}
        </Tag>
      ),
      filters: [
        { text: t("clientes.active"), value: "activo" },
        { text: t("clientes.inactive"), value: "inactivo" },
      ],
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: t("clientes.acciones"),
      key: "action",
      width: "10%",
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="table-button-edit"
          />
          <Can
            I={permissions.Actions.DELETE}
            a={permissions.Subjects.CLIENTES}
            passThrough
          >
            {(allowed) =>
              allowed && (
                <Popconfirm
                  title={t("popConfirm.eliminate")}
                  description={t("clientes.delete_confirm")}
                  onConfirm={() => onDelete(record.id)}
                  okText={t("common.yes")}
                  cancelText={t("common.no")}
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    className="table-button-delete"
                  />
                </Popconfirm>
              )
            }
          </Can>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={{
        showTotal: (total) => `${t("clientes.total")}: ${total}`,
        pageSize: 10,
        showSizeChanger: true,
      }}
      scroll={{ x: 1000 }}
    />
  );
};

export default ClientesTable;