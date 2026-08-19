import {Alert, Card, Spin, Statistic} from 'antd';
import CategoryBar from '../../components/charts/CategoryBar';
import DistrictWaffle from '../../components/charts/DistrictWaffle';
import StatusPie from '../../components/charts/StatusPie';
import ViolationsLine from '../../components/charts/ViolationsLine';
import useDashboard from '../../hooks/useDashboard';
import useFilters from '../../hooks/useFilters';
import type {ViolationFilterValues} from '../../models/models';
import st from './style.module.scss';
import Filters from '../../components/filter/Filters';

const Dashboard = () => {
    const {
        data,
        filters,
        loading,
        errors,
        setFilters,
    } = useDashboard();

    const {
        options,
        loading: optionsLoading,
        errors: optionsError,
    } = useFilters();

    const handleApplyFilters = (
        values: ViolationFilterValues,
    ) => {
        setFilters({
            ...values,
            search: values.search?.trim() || undefined,
        });
    };

    const handleResetFilters = () => {
        setFilters({});
    };

    return (
        <main className={st.dashboard}>
            <h1>Дашборд</h1>

            <Filters
                options={options}
                optionsLoading={optionsLoading}
                initialValues={filters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            {optionsError && (
                <Alert
                    type="error"
                    title="Ошибка загрузки фильтров"
                    description={optionsError}
                    showIcon
                />
            )}

            {errors && (
                <Alert
                    type="error"
                    title="Ошибка загрузки dashboard"
                    description={errors}
                    showIcon
                />
            )}

            <Card>
                <Statistic
                    title="Количество нарушений"
                    value={data.summary.total}
                    loading={loading}
                />
            </Card>

            {loading ? (
                <div className={st.dashboard__loader}>
                    <Spin size="large" />
                </div>
            ) : (
                <div className={st.dashboard__charts}>
                    <Card
                        title="Распределение по статусам"
                        className={st.dashboard__chartCard}
                    >
                        <div className={st.dashboard__chart}>
                            <StatusPie data={data.byStatus} />
                        </div>
                    </Card>

                    <Card
                        title="Топ категорий объектов"
                        className={st.dashboard__chartCard}
                    >
                        <div className={st.dashboard__chart}>
                            <CategoryBar data={data.byCategory} />
                        </div>
                    </Card>

                    <Card
                        title="Динамика по месяцам"
                        className={st.dashboard__chartCard}
                    >
                        <div className={st.dashboard__chart}>
                            <ViolationsLine data={data.byMonth} />
                        </div>
                    </Card>

                    <Card
                        title="Заполненность района"
                        className={st.dashboard__chartCard}
                    >
                        <div className={st.dashboard__chart}>
                            <DistrictWaffle
                                data={data.districtCompleteness}
                            />
                        </div>
                    </Card>
                </div>
            )}
        </main>
    );
};

export default Dashboard;