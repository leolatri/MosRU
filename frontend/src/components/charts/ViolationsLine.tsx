import { Empty } from 'antd';
import { ResponsiveLine } from '@nivo/line'
import type { DashboardMonthItem, } from '../../models/models';

interface ViolationsLineProps {
    data: DashboardMonthItem[];
}

const ViolationsLine = ({ data }: ViolationsLineProps) => {
    if (data.length === 0) return <Empty description="Нет данных" />;

    const chartData = [
        {
            id: 'Нарушения',
            data: data.map((item) => ({
                x: item.month,
                y: item.count,
            })),
        },
    ];

    return (
        <ResponsiveLine
            data={chartData}
            margin={{
                top: 30,
                right: 30,
                bottom: 70,
                left: 60,
            }}
            xScale={{
                type: 'point',
            }}
            yScale={{
                type: 'linear',
                min: 0,
                max: 'auto',
                stacked: false,
            }}
            curve="monotoneX"
            axisBottom={{
                tickRotation: -45,
                legend: 'Месяц',
                legendPosition: 'middle',
                legendOffset: 58,
            }}
            axisLeft={{
                legend: 'Количество',
                legendPosition: 'middle',
                legendOffset: -50,
            }}
            pointSize={7}
            pointBorderWidth={2}
            pointBorderColor={{
                from: 'serieColor',
            }}
            useMesh
            enableArea
            areaOpacity={0.08}
            colors={['#0044cc']}
        />
    );
};

export default ViolationsLine;