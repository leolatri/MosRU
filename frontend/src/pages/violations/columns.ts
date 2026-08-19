import type { TableColumnsType } from "antd";
import type { ViolationModel } from "../../models/models";

export const columns: TableColumnsType<ViolationModel> = [
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
];