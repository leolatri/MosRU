import { Button, Card, Form, Input, Select } from 'antd';
import type {ViolationFilterOptions, ViolationFilterValues} from '../../models/models';
import st from './style.module.scss';

interface FiltersProps {
    options: ViolationFilterOptions;
    optionsLoading: boolean;
    initialValues?: ViolationFilterValues;
    onApply: (values: ViolationFilterValues) => void;
    onReset: () => void;
}

const Filters = ({
    options,
    optionsLoading,
    initialValues,
    onApply,
    onReset,
}: FiltersProps) => {
    const [form] = Form.useForm<ViolationFilterValues>();

    const handleReset = () => {
        form.resetFields();
        onReset();
    };

    return (
        <Card title="Фильтры" size="small">
            <Form<ViolationFilterValues>
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={onApply}
            >
                <div className={st.filters__fields}>
                    <Form.Item
                        name="search"
                        label="Текстовый поиск"
                    >
                        <Input
                            placeholder="Объект, номер заявки или ID сообщения"
                            allowClear
                        />
                    </Form.Item>

                    <Form.Item
                        name="districtId"
                        label="Район"
                    >
                        <Select
                            placeholder="Выберите район"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            loading={optionsLoading}
                            options={options.districts.map(
                                (district) => ({
                                    value: district.id,
                                    label: district.name,
                                }),
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        name="objectCategoryId"
                        label="Категория объекта"
                    >
                        <Select
                            placeholder="Выберите категорию"
                            allowClear
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
                    >
                        <Select
                            placeholder="Выберите тему"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            loading={optionsLoading}
                            options={options.problemTopics.map(
                                (topic) => ({
                                    value: topic.id,
                                    label: topic.name,
                                }),
                            )}
                        />
                    </Form.Item>

                    <Form.Item
                        name="responseStatusId"
                        label="Статус ответа"
                    >
                        <Select
                            placeholder="Выберите статус"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            loading={optionsLoading}
                            options={options.responseStatuses.map(
                                (status) => ({
                                    value: status.id,
                                    label: status.name,
                                }),
                            )}
                        />
                    </Form.Item>
                </div>

                <div className={st.filters__actions}>
                    <Button onClick={handleReset}>Сбросить</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                    >
                        Применить
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default Filters;