import { Empty } from 'antd';
import { ResponsiveWaffle } from '@nivo/waffle';

import type { DashboardChartItem, } from '../../models/models';

interface DistrictWaffleProps {
    data: DashboardChartItem[];
}

const DistrictWaffle = ({ data, }: DistrictWaffleProps) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) return <Empty description="Нет данных" />;

    return (
        <ResponsiveWaffle
            data={data}
            total={total}
            rows={10}
            columns={10}
            margin={{
                top: 20,
                right: 20,
                bottom: 70,
                left: 20,
            }}
            padding={1}
            colors={['#0044cc', '#d9d9d9']}
            borderRadius={2}
            borderColor={{
                from: 'color',
                modifiers: [['darker', 0.3]],
            }}
            legends={[
                {
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 55,
                    itemWidth: 140,
                    itemHeight: 18,
                    symbolShape: 'square',
                },
            ]}
        />
    );
};

export default DistrictWaffle;