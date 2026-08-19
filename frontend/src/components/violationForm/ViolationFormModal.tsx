import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { ViolationPayload } from '../../models/dto';
import type {
    ViolationFilterOptions,
    ViolationModel,
} from '../../models/models';
import st from './style.module.scss';

interface ViolationFormModalProps {
    open: boolean;
    violation: ViolationModel | null;
    options: ViolationFilterOptions;
    optionsLoading: boolean;
    submitting: boolean;
    onCancel: () => void;
    onSubmit: (values: ViolationPayload) => Promise<void>;
}

const ViolationFormModal = ({
    open,
    violation,
    options,
    optionsLoading,
    submitting,
    onCancel,
    onSubmit,
}: ViolationFormModalProps) => {
    const [form] = Form.useForm<ViolationPayload>();
    const isEditing = violation !== null;

    useEffect(() => {
        if (!open) return;

        if (violation) {
            form.setFieldsValue({
                sourceMessageId: Number(violation.sourceMessageId),
                applicationNumber: Number(violation.applicationNumber),
                publicationDate: violation.publicationDate,
                districtId: violation.districtId,
                objectName: violation.objectName,
                objectCategoryId: violation.objectCategoryId,
                problemTopicId: violation.problemTopicId,
                responseDeadline: violation.responseDeadline,
                responseStatusId: violation.responseStatusId,
            });
            return;
        }

        form.resetFields();
    }, [form, open, violation]);

    const handleFinish = (values: ViolationPayload) => {
        void onSubmit({
            ...values,
            districtId: values.districtId ?? null,
            objectName: values.objectName.trim(),
            responseDeadline: values.responseDeadline || null,
        });
    };

    return (
        <Modal
            open={open}
            title={isEditing ? 'Редактирование нарушения' : 'Новое нарушение'}
            okText={isEditing ? 'Сохранить' : 'Создать'}
            cancelText="Отмена"
            confirmLoading={submitting}
            onOk={() => form.submit()}
            onCancel={onCancel}
            destroyOnHidden
            width={760}
        >
            <Form<ViolationPayload>
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                disabled={submitting}
            >
                <div className={st.formGrid}>
                    <Form.Item
                        name="sourceMessageId"
                        label="ID исходного сообщения"
                        rules={[
                            {
                                required: true,
                                message: 'Укажите ID исходного сообщения',
                            },
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={Number.MAX_SAFE_INTEGER}
                            precision={0}
                            className={st.fullWidth}
                        />
                    </Form.Item>

                    <Form.Item
                        name="applicationNumber"
                        label="Номер заявки"
                        rules={[
                            {
                                required: true,
                                message: 'Укажите номер заявки',
                            },
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={Number.MAX_SAFE_INTEGER}
                            precision={0}
                            className={st.fullWidth}
                        />
                    </Form.Item>

                    <Form.Item
                        name="publicationDate"
                        label="Дата публикации"
                        rules={[
                            {
                                required: true,
                                message: 'Укажите дату публикации',
                            },
                        ]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        name="responseDeadline"
                        label="Срок подготовки ответа"
                        dependencies={['publicationDate']}
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value?: string) {
                                    const publicationDate =
                                        getFieldValue('publicationDate') as
                                            | string
                                            | undefined;

                                    if (
                                        value &&
                                        publicationDate &&
                                        value < publicationDate
                                    ) {
                                        return Promise.reject(
                                            new Error(
                                                'Срок ответа не может быть раньше даты публикации',
                                            ),
                                        );
                                    }

                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        name="districtId"
                        label="Район"
                    >
                        <Select
                            placeholder="Район не указан"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            loading={optionsLoading}
                            options={options.districts.map((district) => ({
                                value: district.id,
                                label: district.name,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="responseStatusId"
                        label="Статус ответа"
                        rules={[
                            {
                                required: true,
                                message: 'Выберите статус ответа',
                            },
                        ]}
                    >
                        <Select
                            placeholder="Выберите статус"
                            showSearch
                            optionFilterProp="label"
                            loading={optionsLoading}
                            options={options.responseStatuses.map((status) => ({
                                value: status.id,
                                label: status.name,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="objectCategoryId"
                        label="Категория объекта"
                        rules={[
                            {
                                required: true,
                                message: 'Выберите категорию объекта',
                            },
                        ]}
                    >
                        <Select
                            placeholder="Выберите категорию"
                            showSearch
                            optionFilterProp="label"
                            loading={optionsLoading}
                            options={options.objectCategories.map(
                                (category) => ({
                                    value: category.id,
                                    label: category.name,
                                }),
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        name="problemTopicId"
                        label="Проблемная тема"
                        rules={[
                            {
                                required: true,
                                message: 'Выберите проблемную тему',
                            },
                        ]}
                    >
                        <Select
                            placeholder="Выберите тему"
                            showSearch
                            optionFilterProp="label"
                            loading={optionsLoading}
                            options={options.problemTopics.map((topic) => ({
                                value: topic.id,
                                label: topic.name,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="objectName"
                        label="Название или адрес объекта"
                        className={st.fullRow}
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: 'Укажите объект',
                            },
                            {
                                max: 1000,
                                message: 'Название объекта слишком длинное',
                            },
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Введите название или адрес объекта"
                            maxLength={1000}
                            showCount
                        />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default ViolationFormModal;
