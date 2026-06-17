import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, CloudRain } from 'lucide-react';
import { WeatherData, TempUnit } from '../types';
import { formatDate, formatTemperature } from '../utils/format';

interface WeatherChartsProps {
  data: WeatherData;
  tempUnit: TempUnit;
}

export default function WeatherCharts({ data, tempUnit }: WeatherChartsProps) {
  const [activeTab, setActiveTab] = useState<'temp' | 'rain'>('temp');
  const dList = data.daily;

  // Converts Celsius to Fahrenheit if the current unit is F, for accurate chart plotting
  const getVal = (c: number) => {
    if (tempUnit === 'F') {
      return (c * 9) / 5 + 32;
    }
    return c;
  };

  // Dimensions of the responsive custom SVG graph
  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 35;
  
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Plotting data calculations: Temperature
  const plottedMax = dList.map(d => getVal(d.tempMax));
  const plottedMin = dList.map(d => getVal(d.tempMin));

  const allTemps = [...plottedMax, ...plottedMin];
  const maxBoundary = Math.max(...allTemps) + 2;
  const minBoundary = Math.min(...allTemps) - 2;
  const tempSpan = maxBoundary - minBoundary || 1;

  // Plotting data calculations: Rain Prob
  const plottedRain = dList.map(d => d.precipitationProbability);

  // Generate coordinates for temperature pathways
  const getCoords = (index: number, value: number) => {
    const x = paddingX + (index * (chartW / (dList.length - 1)));
    const y = paddingY + chartH - ((value - minBoundary) / tempSpan) * chartH;
    return { x, y };
  };

  const maxPoints = plottedMax.map((val, idx) => getCoords(idx, val));
  const minPoints = plottedMin.map((val, idx) => getCoords(idx, val));

  // Build SVG Path strings
  const getPathD = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  };

  const maxPathD = getPathD(maxPoints);
  const minPathD = getPathD(minPoints);

  // Generate Area/fill polygon coordinate lines
  const maxAreaD = maxPoints.length > 0 
    ? `${maxPathD} L ${maxPoints[maxPoints.length - 1].x} ${height - paddingY} L ${maxPoints[0].x} ${height - paddingY} Z`
    : '';

  const minAreaD = minPoints.length > 0 
    ? `${minPathD} L ${minPoints[minPoints.length - 1].x} ${height - paddingY} L ${minPoints[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="rounded-3xl border border-gray-150 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/85 p-5 sm:p-6 shadow-md flex flex-col gap-4" id="weather-trends-charts">
      {/* Chart Headers and Toggles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-blue-500" />
            Forecast Analytics
          </h3>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
            Compare temperature trends and rainfall chances over the next week
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-gray-100 dark:bg-zinc-805 p-1 rounded-xl items-center self-start sm:self-auto border border-gray-200/40 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'temp'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
            }`}
          >
            Temperature Trend
          </button>
          
          <button
            onClick={() => setActiveTab('rain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'rain'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
            }`}
          >
            Rain Probability
          </button>
        </div>
      </div>

      {/* Main Graph Canvas Area */}
      <div className="relative w-full aspect-[2.5/1] min-h-[190px] pt-2" id="canvas-wrapper">
        {activeTab === 'temp' ? (
          /* TEMPERATURE SVG */
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-gray-400 overflow-visible">
            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const yVal = paddingY + ratio * chartH;
              const repVal = Math.round(maxBoundary - ratio * tempSpan);
              return (
                <g key={`grid-y-${ratio}`} className="opacity-40">
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={width - paddingX}
                    y2={yVal}
                    className="stroke-gray-100 dark:stroke-zinc-800"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                  {/* Left Label */}
                  <text
                    x={paddingX - 8}
                    y={yVal + 3}
                    className="text-[9px] font-mono fill-gray-400 text-right font-medium"
                    textAnchor="end"
                  >
                    {repVal}°
                  </text>
                </g>
              );
            })}

            {/* Fills & Curves Area high */}
            <path
              d={maxAreaD}
              fill="url(#maxGradient)"
              className="opacity-15 dark:opacity-10 pointer-events-none"
            />
            {/* High Temp line */}
            <path
              d={maxPathD}
              fill="none"
              stroke="url(#maxLineGradient)"
              strokeWidth={3}
              className="stroke-orange-500"
              strokeLinecap="round"
            />

            {/* Fills & Curves Area low */}
            <path
              d={minAreaD}
              fill="url(#minGradient)"
              className="opacity-15 dark:opacity-10 pointer-events-none"
            />
            {/* Low Temp line */}
            <path
              d={minPathD}
              fill="none"
              stroke="url(#minLineGradient)"
              strokeWidth={3}
              className="stroke-blue-500"
              strokeLinecap="round"
            />

            {/* High Dots & labels */}
            {maxPoints.map((pt, idx) => (
              <g key={`high-dot-${idx}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={4.5}
                  className="fill-white stroke-amber-500 dark:fill-zinc-900"
                  strokeWidth={2}
                />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  className="text-[10px] font-extrabold fill-gray-700 dark:fill-zinc-350 font-mono"
                >
                  {Math.round(plottedMax[idx])}°
                </text>
              </g>
            ))}

            {/* Low Dots & labels */}
            {minPoints.map((pt, idx) => (
              <g key={`low-dot-${idx}`}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={4.5}
                  className="fill-white stroke-blue-500 dark:fill-zinc-900"
                  strokeWidth={2}
                />
                <text
                  x={pt.x}
                  y={pt.y + 15}
                  textAnchor="middle"
                  className="text-[10px] font-extrabold fill-gray-600 dark:fill-zinc-400 font-mono"
                >
                  {Math.round(plottedMin[idx])}°
                </text>
              </g>
            ))}

            {/* X Axis Labels */}
            {dList.map((d, idx) => {
              const xCoord = paddingX + (idx * (chartW / (dList.length - 1)));
              const showText = formatDate(d.date).split(',')[0]; // grab abbreviation (e.g. "Mon")
              return (
                <text
                  key={`xAxis-${idx}`}
                  x={xCoord}
                  y={height - 12}
                  textAnchor="middle"
                  className="text-[10px] font-black fill-gray-400 dark:fill-zinc-550 uppercase font-sans"
                >
                  {showText}
                </text>
              );
            })}

            {/* SVG Gradient Grids definitions */}
            <defs>
              <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        ) : (
          /* RAIN PROBABILITY BAR SVG */
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-gray-400 overflow-visible">
            {/* Gridlines */}
            {[0, 25, 50, 75, 100].map((step) => {
              const yVal = paddingY + chartH - (step / 100) * chartH;
              return (
                <g key={`grid-rain-y-${step}`} className="opacity-40">
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={width - paddingX}
                    y2={yVal}
                    className="stroke-gray-150 dark:stroke-zinc-800"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                  <text
                    x={paddingX - 8}
                    y={yVal + 3}
                    className="text-[9px] font-mono fill-gray-400 font-medium"
                    textAnchor="end"
                  >
                    {step}%
                  </text>
                </g>
              );
            })}

            {/* Render 3D-feeling flat Bars for each day */}
            {dList.map((d, idx) => {
              const colWidth = 28;
              const startX = paddingX + idx * (chartW / (dList.length - 1)) - colWidth / 2;
              const barH = (d.precipitationProbability / 100) * chartH;
              const startY = paddingY + chartH - barH;

              return (
                <g key={`rain-bar-${idx}`} className="group">
                  {/* Decorative background column bar */}
                  <rect
                    x={startX}
                    y={paddingY}
                    width={colWidth}
                    height={chartH}
                    className="fill-gray-50/20 dark:fill-zinc-800/10 hover:fill-blue-50/10 rounded-xl"
                    rx={4}
                  />

                  {/* Reactive actual probability metric fill */}
                  <rect
                    x={startX}
                    y={startY}
                    width={colWidth}
                    height={barH}
                    className="fill-blue-500/80 group-hover:fill-blue-500 transition-colors"
                    rx={4}
                  />

                  {/* Percentage label directly over the block */}
                  <text
                    x={startX + colWidth / 2}
                    y={startY - 6}
                    textAnchor="middle"
                    className="text-[10px] font-black fill-blue-600 dark:fill-blue-400 font-mono"
                  >
                    {d.precipitationProbability}%
                  </text>

                  {/* X Axis label day shortcut */}
                  <text
                    x={startX + colWidth / 2}
                    y={height - 12}
                    textAnchor="middle"
                    className="text-[10px] font-black fill-gray-400 dark:fill-zinc-550 uppercase font-sans"
                  >
                    {formatDate(d.date).split(',')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Chart legends */}
      <div className="flex items-center gap-4 text-xs font-bold text-gray-500 dark:text-zinc-400 justify-center">
        {activeTab === 'temp' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Day Max Temp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Day Min Temp</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded-md bg-blue-500/80" />
            <span>Precipitation Likelihood (%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
