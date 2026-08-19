import { useCallback, useEffect, useState } from "react";
import type { ViolationModel, ViolationsMeta, ViolationsQuery } from "../models/models";
import { getViolations } from "../service/api";

const initialMeta: ViolationsMeta = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
};

const defaultQuery: ViolationsQuery = {
    page: 1,
    limit: 20,
    sortBy: 'id',
    sortOrder: 'desc',
};

const useViolations = (initQuery: ViolationsQuery = {}) => {
    const [query, setQuery] = useState<ViolationsQuery>(
        () => ({
            ...defaultQuery,
            ...initQuery,
        }),
    );
    const [violations, setViolations] = useState<ViolationModel[]>([]);
    const [meta, setMeta] = useState<ViolationsMeta>(initialMeta);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadIdx, setReloadIdx] = useState(0);

    const refetch = useCallback(() => {
        setReloadIdx((curr) => curr + 1);
    }, []);

    useEffect(() => {
        const abortController = new AbortController();

        async function loadViolations() {
            setLoading(true);
            setError(null);

            try {
                const result = await getViolations(query, abortController.signal);

                setViolations(result.items);
                setMeta(result.meta);
            } catch (requestError: unknown) {
                if (
                    requestError instanceof DOMException &&
                    requestError.name === 'AbortError'
                ) {
                    return;
                }

                const message =
                    requestError instanceof Error
                        ? requestError.message
                        : 'Не удалось загрузить нарушения';

                setError(message);
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        loadViolations();

        return () => {
            abortController.abort();
        };
    }, [query, reloadIdx]);

    return {
        violations,
        meta,
        query,
        loading,
        error,
        setQuery,
        refetch,
    }

};

export default useViolations;