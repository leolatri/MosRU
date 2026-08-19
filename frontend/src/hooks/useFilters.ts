import { useEffect, useState } from "react"
import type { ViolationFilterOptions } from "../models/models"
import { getViolationFilterOptions } from "../service/api";

const emptyOptions: ViolationFilterOptions = {
    districts: [],
    objectCategories: [],
    problemTopics: [],
    responseStatuses: [],
};

const useFilters = () => {
    const [options, setOptions] = useState<ViolationFilterOptions>(emptyOptions);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();
        const feachOptions = async() => {
            setLoading(true);
            try {
                const result = await getViolationFilterOptions(abortController.signal);
                setOptions(result);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Не удалось загрузить фильтры';
                setErrors(message);
            } finally {
                setLoading(false);
            }
        }

        feachOptions();
        return () => abortController.abort();
    }, []);
    return {
        options, 
        loading, 
        errors
    };
};

export default useFilters;