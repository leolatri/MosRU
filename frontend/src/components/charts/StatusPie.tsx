import { Empty } from 'antd';
import { ResponsivePie } from '@nivo/pie';
import type { DashboardChartItem, } from '../../models/models';

interface StatusPieProps {
    data: DashboardChartItem[];
}

const StatusPie = ({ data }: StatusPieProps) => {
    if (data.length === 0) return <Empty description="Нет данных" />;

    return (
        <ResponsivePie
            data={data}
            margin={{
                top: 30,
                right: 80,
                bottom: 80,
                left: 80,
            }}
            innerRadius={0.55}
            padAngle={1}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            arcLinkLabelsSkipAngle={10}
            arcLabelsSkipAngle={10}
            arcLabel={(item) => String(item.value)}
            legends={[
                {
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 60,
                    itemWidth: 120,
                    itemHeight: 18,
                    symbolShape: 'circle',
                },
            ]}
        />
    );
};

export default StatusPie;