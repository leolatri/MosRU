import { Alert, Button, Table, Upload } from "antd"
import useViolations from "../../hooks/useViolations";
import { memo, useState } from "react";
import { exportViolationsXlsx, importViolationsXlsx } from "../../service/api";
import {
    DownloadOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import type { ViolationModel } from "../../models/models";
import { columns } from "./columns";
import st from './style.module.scss';

const Violations = () => {
    const { violations, meta, query, loading, error, setQuery, refetch } = useViolations();
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

            {error && (
                <Alert
                    type="error"
                    title="Ошибка загрузки"
                    description={error}
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