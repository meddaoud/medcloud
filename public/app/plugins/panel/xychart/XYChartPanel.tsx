import React, { useCallback, useMemo } from 'react';
import { Button, GraphNGLegendEvent, TimeSeries, TooltipPlugin } from '@grafana/ui';
import { PanelProps } from '@grafana/data';
import { Options } from './types';
import { hideSeriesConfigFactory } from '../timeseries/overrides/hideSeriesConfigFactory';
import { getXYDimensions } from './dims';
import { prepareDimensions } from './utils';

interface XYChartPanelProps extends PanelProps<Options> {}

export const XYChartPanel: React.FC<XYChartPanelProps> = ({
  data,
  timeRange,
  timeZone,
  width,
  height,
  options,
  fieldConfig,
  onFieldConfigChange,
}) => {
  const dims = useMemo(() => getXYDimensions(options.dims, data.series), [options.dims, data.series]);

  const frames = useMemo(() => [dims.frame], [dims]);

  const onLegendClick = useCallback(
    (event: GraphNGLegendEvent) => {
      onFieldConfigChange(hideSeriesConfigFactory(event, fieldConfig, frames));
    },
    [fieldConfig, onFieldConfigChange, frames]
  );

  if (dims.error) {
    return (
      <div>
        <div>ERROR: {dims.error}</div>
        {dims.hasData && (
          <div>
            <Button onClick={() => alert('TODO, switch vis')}>Show as Table</Button>
            {dims.hasTime && <Button onClick={() => alert('TODO, switch vis')}>Show as Time series</Button>}
          </div>
        )}
      </div>
    );
  }

  if (options.mode === 'scatter') {
    const trace = prepareDimensions(options, data.series)[0];
    return (
      <div style={{ height, overflow: 'scroll' }}>
        <h2>TODO, scatter {trace.name}</h2>
        {trace.x!.values.toArray().map((v, i) => (
          <div key={i}>
            {`${v}`} -- color: {trace.color.get(i)} -- size: {trace.size!.get(i)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <TimeSeries
      frames={frames}
      structureRev={data.structureRev}
      fields={dims.fields}
      timeRange={timeRange}
      timeZone={timeZone}
      width={width}
      height={height}
      legend={options.legend}
      onLegendClick={onLegendClick}
    >
      {(config, alignedDataFrame) => {
        return (
          <TooltipPlugin
            config={config}
            data={alignedDataFrame}
            mode={options.tooltip.mode as any}
            timeZone={timeZone}
          />
        );
      }}
    </TimeSeries>
  );
};
