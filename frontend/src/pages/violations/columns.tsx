import { Button, Popconfirm, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { ViolationModel } from '../../models/models';

interface ViolationColumnsOptions {
  deletingId: string | null;
  onEdit: (violation: ViolationModel) => void;
  onDelete: (id: string) => void;
}

export const columns = ({
  deletingId,
  onEdit,
  onDelete,
}: ViolationColumnsOptions): TableColumnsType<ViolationModel> => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: 'ID сообщения',
    dataIndex: 'sourceMessageId',
    key: 'sourceMessageId',
    width: 150,
  },
  {
    title: 'Номер заявки',
    dataIndex: 'applicationNumber',
    key: 'applicationNumber',
    width: 150,
  },
  {
    title: 'Дата публикации',
    dataIndex: 'publicationDate',
    key: 'publicationDate',
    width: 160,
  },
  {
    title: 'Округ',
    dataIndex: 'administrativeOkrugCode',
    key: 'administrativeOkrugCode',
    width: 110,
    render: (value: string | null) => value ?? '—',
  },
  {
    title: 'Район',
    dataIndex: 'districtName',
    key: 'districtName',
    width: 180,
    render: (value: string | null) => value ?? '—',
  },
  {
    title: 'Объект',
    dataIndex: 'objectName',
    key: 'objectName',
    width: 300,
  },
  {
    title: 'Категория объекта',
    dataIndex: 'objectCategoryName',
    key: 'objectCategoryName',
    width: 240,
  },
  {
    title: 'Проблемная тема',
    dataIndex: 'problemTopicName',
    key: 'problemTopicName',
    width: 260,
  },
  {
    title: 'Срок ответа',
    dataIndex: 'responseDeadline',
    key: 'responseDeadline',
    width: 150,
    render: (value: string | null) => value ?? '—',
  },
  {
    title: 'Статус',
    dataIndex: 'responseStatusName',
    key: 'responseStatusName',
    width: 200,
  },
  {
    title: 'Действия',
    key: 'actions',
    width: 170,
    fixed: 'right',
    render: (_, violation) => (
      <Space>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => onEdit(violation)}
        >
          Изменить
        </Button>

        <Popconfirm
          title="Удалить нарушение?"
          description="Это действие нельзя отменить."
          okText="Удалить"
          cancelText="Отмена"
          okButtonProps={{
            danger: true,
            loading: deletingId === violation.id,
          }}
          onConfirm={() => onDelete(violation.id)}
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            loading={deletingId === violation.id}
          >
            Удалить
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];
