import { motion } from 'motion/react';
import { CloudRain, Compass, Clock } from 'lucide-react';
import { WeatherData, TempUnit } from '../types';
import { getWeatherCondition } from '../utils/weatherCode';
import { formatTemperature } from '../utils/format';

interface HourlyForecastProps {
  data: WeatherData;
  tempUnit: TempUnit;
}

export default function HourlyForecast({ data, tempUnit }: HourlyForecastProps) {
  const hourlyItems = data.hourly;

  const formatHour = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="flex flex-col gap-3" id="hourly-forecast-strip">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} className="text-blue-500" />
          24-Hour Forecast
        </h3>
        <span className="text-xs text-gray-400 dark:text-zinc-550 italic">
          Swipe or drag to scroll hours
        </span>
      </div>

      {/* Horizontal Scroll Containers */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth custom-scrollbar-horizontal select-none">
        {hourlyItems.map((item, index) => {
          const condition = getWeatherCondition(item.weatherCode);
          const ConditionIcon = condition.icon;
          
          // Check if it's currently the first hour
          const isFirst = index === 0;

          return (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: index * 0.02 }}
              className={`flex-shrink-0 w-28 snap-center rounded-2xl p-3.5 border transition-all flex flex-col items-center justify-between text-center gap-2.5 hover:shadow-md ${
                isFirst
                  ? 'bg-blue-500/10 border-blue-500/40 dark:bg-blue-950/20 dark:border-blue-700/40'
                  : 'bg-white/60 dark:bg-zinc-900/60 border-gray-150 dark:border-zinc-850 hover:bg-white dark:hover:bg-zinc-900'
              }`}
            >
              {/* Hourly Label */}
              <span className="text-[10px] font-black tracking-wide text-gray-400 dark:text-zinc-500 uppercase">
                {isFirst ? 'Now' : formatHour(item.time)}
              </span>

              {/* Graphical representation of the condition */}
              <div className={`p-2.5 rounded-full bg-gradient-to-br ${condition.colorClass} shadow-sm text-white`}>
                <ConditionIcon size={18} />
              </div>

              {/* Temperature Degree */}
              <div className="flex flex-col">
                <span className="text-base font-black text-gray-950 dark:text-zinc-100 font-mono">
                  {formatTemperature(item.temperature, tempUnit)}
                </span>
                <span className="text-[10px] font-semibold text-gray-450 dark:text-zinc-450 truncate max-w-[90px]">
                  {condition.description}
                </span>
              </div>

              {/* Precipitation Rate */}
              <div 
                className={`flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                  item.precipitationProbability > 40
                    ? 'bg-blue-100/70 text-blue-650 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-450'
                }`}
                title="Rain probability"
              >
                <CloudRain size={11} className={item.precipitationProbability > 40 ? "text-blue-500" : "text-gray-450"} />
                <span>{item.precipitationProbability}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
