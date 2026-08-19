import { Alert, Button, Table, Upload } from "antd"
import useViolations from "../../hooks/useViolations";
import { memo, useState } from "react";
import { exportViolationsXlsx, importViolationsXlsx } from "../../service/api";
import {
    DownloadOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import type { ViolationFilterValues, ViolationModel } from "../../models/models";
import { columns } from "./columns";
import st from './style.module.scss';
import useFilters from "../../hooks/useFilters";
import Filters from "../../components/filter/Filters";

const Violations = () => {
    const { violations, meta, query, loading, error, setQuery, refetch } = useViolations();
    const { options, loading: loadFilters, errors: errorsFilters } = useFilters();
    const [imported, setImport] = useState(false);
    const [exported, setExport] = useState(false);

    const handleImport = async (file: File) => {
        setImport(true);
        try {
            await importViolationsXlsx(file);
            alert('Файл импортирован');

            refetch();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Не удалось импортировать файл';
            alert(message);
        } finally {
            setImport(false);
        }
    };

    const handleExport = async () => {
        setExport(true);

        try {
            await exportViolationsXlsx(query);
        } catch (exportError: unknown) {
            const message = exportError instanceof Error ? exportError.message : 'Не удалось экспортировать файл';
            alert(message);
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
            responseStatusId: values.responseStatusId
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

    return (
        <div className={st.violations}>
            <h1>Нарушения</h1>
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
                    title="Ошибка загрузки"
                    description={error}
                    showIcon
                />
            )}
            {error && (
                <Alert
                    type="error"
                    title="Ошибка загрузки фильтров"
                    description={errorsFilters}
                    showIcon
                />
            )}
            <div className={st.violations__table}>
                <Table<ViolationModel>
                    rowKey="id"
                    columns={columns}
                    dataSource={violations}
                    loading={loading}
                    scroll={{ x: 1800 }}
                    pagination={{
                        current: meta.page,
                        pageSize: meta.limit,
                        total: meta.total,
                        showSizeChanger: true,
                        pageSizeOptions: [10, 20, 50, 100],
                        showTotal: (total) => `Всего записей: ${total}`,
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

        </div>
    );
};



export default memo(Violations);