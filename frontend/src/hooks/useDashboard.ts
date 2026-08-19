import { useEffect, useState } from "react";
import type { DashboardResponse, ViolationFilterValues } from "../models/models";
import { getDashboard } from "../service/api";

const emptyDashboard: DashboardResponse = {
    summary: { total: 0 },
    byStatus: [],
    byCategory: [],
    byMonth: [],
    districtCompleteness: [],
};


const useDashboard = () => {
    const [errors, setErrors] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<ViolationFilterValues>({});
    const [data, setData] = useState<DashboardResponse>(emptyDashboard);

    useEffect(() => {
        const abortController = new AbortController();

        const loadingDashboard = async () => {
            setLoading(true);
            try {
                const responce = await getDashboard(filters, abortController.signal);
                setData(responce);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Не удалось загрузить дашборд';
                setErrors(message);
            } finally {
                setLoading(false);
            }
        }

        loadingDashboard();
        return () => abortController.abort();
    }, [filters]);

    return {
        data,
        filters,
        loading,
        errors,
        setFilters,
    };

};

export default useDashboard;