import type { Rule } from "antd/es/form";
import type { valueType } from "antd/es/statistic/utils";

export interface FieldProps {
    label: string,
    placeholder: string,
    rules?: Rule[];
    value?: valueType;
    private: boolean;
}