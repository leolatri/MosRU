import { Empty } from 'antd';
import { ResponsiveBar, type BarDatum } from '@nivo/bar';
import type { DashboardCategoryItem } from '../../models/models';

interface CategoryBarProps {
    data: DashboardCategoryItem[];
}

const CategoryBar = ({ data }: CategoryBarProps) => {
    if (data.length === 0) return <Empty description="Нет данных" />;

    const chartData: BarDatum[] = data.map(
        (item) => ({
            category: item.category,
            count: item.count,
        }),
    );
    
    return (
        <ResponsiveBar
            data={chartData}
            keys={['count']}
            indexBy="category"
            layout="horizontal"
            margin={{
                top: 20,
                right: 30,
                bottom: 50,
                left: 170,
            }}
            padding={0.3}
            valueScale={{
                type: 'linear',
                min: 0,
            }}
            indexScale={{
                type: 'band',
                round: true,
            }}
            colors={['#0044cc']}
            borderRadius={3}
            axisBottom={{
                legend: 'Количество',
                legendPosition: 'middle',
                legendOffset: 36,
            }}
            axisLeft={{
                format: (value) => {
                    const text = String(value);

                    return text.length > 22
                        ? `${text.slice(0, 22)}…`
                        : text;
                },
            }}
            enableLabel={false}
            role="application"
            ariaLabel="Нарушения по категориям"
        />
    );
};

export default CategoryBar;