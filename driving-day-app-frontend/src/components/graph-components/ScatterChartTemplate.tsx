import React from 'react';
import { StandardChartProps } from '../../types/Chart';
import ReusableChartTemplate from './ReusableChartTemplate';

// Register necessary components from Chart.js

// TODO: Make components reusable
// TODO: Implement page BUTTONS

const ScatterChartTemplate: React.FC<StandardChartProps> = ({
    verticalLabel,
    horizontalLabel,
    chartPoints,
    pageNumber
}) => {

  return (
    <ReusableChartTemplate
      verticalLabel={verticalLabel}
      horizontalLabel={horizontalLabel}
      chartPoints={chartPoints}
      pageNumber={pageNumber}
      chartType={'scatter'}
      />
  )
};

export default ScatterChartTemplate;
