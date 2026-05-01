import { StandardChartProps } from '../../types/Chart';
import { createContext } from 'react';

interface ChartContextType {
    chartMapping: { [key: number]: React.FC<StandardChartProps> },
    globalCategories: Set<string>,
    globalPageSize: number
}

const ChartContext = createContext<ChartContextType>(
    { chartMapping: {}, globalCategories: new Set(), globalPageSize: 0 }
)

export default ChartContext;