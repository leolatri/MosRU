import { Alert, Button, Table, Upload, message } from 'antd';
import {
    DownloadOutlined,
    PlusOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import { memo, useState } from 'react';
import Filters from '../../components/filter/Filters';
import ViolationFormModal from '../../components/violationForm/ViolationFormModal';
import useFilters from '../../hooks/useFilters';
import useViolations from '../../hooks/useViolations';
import type { ViolationPayload } from '../../models/dto';
import type {
    ViolationFilterValues,
    ViolationModel,
} from '../../models/models';
import {
    createViolation,
    deleteViolation,
    exportViolationsXlsx,
    importViolationsXlsx,
    updateViolation,
} from '../../service/api';
import { columns } from './columns';
import st from './style.module.scss';

const Violations = () => {
    const {
        violations,
        meta,
        query,
        loading,
        error,
        setQuery,
        refetch,
    } = useViolations();
    const {
        options,
        loading: loadFilters,
        errors: errorsFilters,
    } = useFilters();

    const [messageApi, messageContextHolder] = message.useMessage();
    const [imported, setImport] = useState(false);
    const [exported, setExport] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedViolation, setSelectedViolation] =
        useState<ViolationModel | null>(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [mutationError, setMutationError] = useState<string | null>(null);

    const handleImport = async (file: File) => {
        setImport(true);

        try {
            await importViolationsXlsx(file);
            void messageApi.success('Файл успешно импортирован');
            refetch();
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Не удалось импортировать файл';

            void messageApi.error(message);
        } finally {
            setImport(false);
        }
    };

    const handleExport = async () => {
        setExport(true);

        try {
            await exportViolationsXlsx(query);
            void messageApi.success('Экспорт начался');
        } catch (exportError: unknown) {
            const message =
                exportError instanceof Error
                    ? exportError.message
                    : 'Не удалось экспортировать файл';

            void messageApi.error(message);
        } finally {
            setExport(false);
        }
    };

    const handleApply = (values: ViolationFilterValues) => {
        setQuery((curr) => ({
            ...curr,
            page: 1,
            search: values.search?.trim() || undefined,
            districtId: values.districtId,
            objectCategoryId: values.objectCategoryId,
            problemTopicId: values.problemTopicId,
            responseStatusId: values.responseStatusId,
        }));
    };

    const handleReset = () => {
        setQuery((curr) => ({
            page: 1,
            limit: curr.limit,
            sortBy: curr.sortBy,
            sortOrder: curr.sortOrder,
        }));
    };

    const handleOpenCreate = () => {
        setSelectedViolation(null);
        setMutationError(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (violation: ViolationModel) => {
        setSelectedViolation(violation);
        setMutationError(null);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        if (saving) return;

        setFormOpen(false);
        setSelectedViolation(null);
        setMutationError(null);
    };

    const handleSubmit = async (payload: ViolationPayload) => {
        setSaving(true);
        setMutationError(null);

        try {
            if (selectedViolation) {
                await updateViolation(selectedViolation.id, payload);
                void messageApi.success('Нарушение обновлено');
            } else {
                await createViolation(payload);
                void messageApi.success('Нарушение создано');
            }

            const wasCreating = selectedViolation === null;

            setFormOpen(false);
            setSelectedViolation(null);

            if (wasCreating && meta.page > 1) {
                setQuery((currentQuery) => ({
                    ...currentQuery,
                    page: 1,
                }));
            } else {
                refetch();
            }
        } catch (requestError: unknown) {
            const errorMessage =
                requestError instanceof Error
                    ? requestError.message
                    : 'Не удалось сохранить нарушение';

            setMutationError(errorMessage);
            void messageApi.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        setMutationError(null);

        try {
            await deleteViolation(id);
            void messageApi.success('Нарушение удалено');

            if (violations.length === 1 && meta.page > 1) {
                setQuery((currentQuery) => ({
                    ...currentQuery,
                    page: meta.page - 1,
                }));
            } else {
                refetch();
            }
        } catch (requestError: unknown) {
            const errorMessage =
                requestError instanceof Error
                    ? requestError.message
                    : 'Не удалось удалить нарушение';

            setMutationError(errorMessage);
            void messageApi.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    const tableColumns = columns({
        deletingId,
        onEdit: handleOpenEdit,
        onDelete: (id) => void handleDelete(id),
    });

    return (
        <div className={st.violations}>
            {messageContextHolder}

            <div className={st.violations__heading}>
                <h1>Нарушения</h1>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreate}
                >
                    Создать нарушение
                </Button>
            </div>

            <div className={st.violations__buttons}>
                <Upload
                    accept=".xlsx"
                    maxCount={1}
                    showUploadList={false}
                    disabled={imported}
                    beforeUpload={(file) => {
                        void handleImport(file);
                        return false;
                    }}
                >
                    <Button
                        icon={<UploadOutlined />}
                        loading={imported}
                    >
                        Импорт XLSX
                    </Button>
                </Upload>

                <Button
                    icon={<DownloadOutlined />}
                    loading={exported}
                    onClick={() => void handleExport()}
                >
                    Экспорт XLSX
                </Button>
            </div>

            <Filters
                options={options}
                optionsLoading={loadFilters}
                initialValues={{
                    search: query.search,
                    districtId: query.districtId,
                    objectCategoryId: query.objectCategoryId,
                    problemTopicId: query.problemTopicId,
                    responseStatusId: query.responseStatusId,
                }}
                onApply={handleApply}
                onReset={handleReset}
            />

            {error && (
                <Alert
                    type="error"
                    title="Ошибка загрузки нарушений"
                    description={error}
                    showIcon
                />
            )}

            {errorsFilters && (
                <Alert
                    type="error"
                    title="Ошибка загрузки фильтров"
                    description={errorsFilters}
                    showIcon
                />
            )}

            {mutationError && (
                <Alert
                    type="error"
                    title="Ошибка операции"
                    description={mutationError}
                    closable
                    onClose={() => setMutationError(null)}
                    showIcon
                />
            )}

            <div className={st.violations__table}>
                <Table<ViolationModel>
                    rowKey="id"
                    columns={tableColumns}
                    dataSource={violations}
                    loading={loading}
                    scroll={{ x: 2000 }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.limit,
                        total: meta.total,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50, 100],
                        showTotal: (total) =>
                            `Всего записей: ${total}`,
                        onChange: (page, limit) => {
                            setQuery((currentQuery) => ({
                                ...currentQuery,
                                page,
                                limit,
                            }));
                        },
                    }}
                />
            </div>

            <ViolationFormModal
                open={formOpen}
                violation={selectedViolation}
                options={options}
                optionsLoading={loadFilters}
                submitting={saving}
                onCancel={handleCloseForm}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default memo(Violations);
