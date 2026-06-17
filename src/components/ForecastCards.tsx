import { motion } from 'motion/react';
import { CloudRain, Wind, ArrowUp, ArrowDown } from 'lucide-react';
import { WeatherData, TempUnit, WindSpeedUnit } from '../types';
import { getWeatherCondition } from '../utils/weatherCode';
import { formatTemperature, formatWindSpeed, formatDate } from '../utils/format';

interface ForecastCardsProps {
  data: WeatherData;
  tempUnit: TempUnit;
  windSpeedUnit: WindSpeedUnit;
}

export default function ForecastCards({ data, tempUnit, windSpeedUnit }: ForecastCardsProps) {
  const dailyForecasts = data.daily;

  return (
    <div className="flex flex-col gap-3" id="forecast-cards-section">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          7-Day Forecast
        </h3>
        <span className="text-xs text-gray-400 dark:text-zinc-550 italic">
          Localized Open-Meteo predictions
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {dailyForecasts.map((forecast, index) => {
          const condition = getWeatherCondition(forecast.weatherCode);
          const ConditionIcon = condition.icon;
          
          // Identify if it's today
          const isToday = index === 0;

          return (
            <motion.div
              key={forecast.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className={`rounded-2xl p-4 border transition-all flex flex-col gap-3 overflow-hidden ${
                isToday
                  ? 'bg-blue-50/40 border-blue-200/60 dark:bg-blue-500/10 dark:border-blue-300/20 shadow-xs'
                  : 'bg-white/65 dark:bg-slate-950/50 border-gray-150 dark:border-zinc-850 hover:bg-white dark:hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                {/* Day Name / Label */}
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{formatDate(forecast.date)}</span>
                    {isToday && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-blue-500 text-white leading-none">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-400 leading-none mt-1">
                    {forecast.date}
                  </div>
                </div>

                {/* Weather info */}
                <div className="flex items-center gap-2 min-w-0 max-w-[55%]">
                  <span className={`shrink-0 p-2 rounded-xl bg-gradient-to-br ${condition.colorClass} text-white`}>
                    <ConditionIcon size={18} />
                  </span>
                  <span className="truncate text-sm font-bold text-gray-800 dark:text-slate-100">
                    {condition.description}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gray-100 dark:border-cyan-300/10">
                <div className="min-w-0 rounded-xl bg-white/55 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                    <ArrowDown size={12} className="text-blue-500 shrink-0" />
                    Min
                  </div>
                  <span className="block truncate text-sm font-extrabold text-gray-900 dark:text-white">
                    {formatTemperature(forecast.tempMin, tempUnit)}
                  </span>
                </div>

                <div className="min-w-0 rounded-xl bg-white/55 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-2.5 py-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                    <ArrowUp size={12} className="text-amber-500 shrink-0" />
                    Max
                  </div>
                  <span className="block truncate text-sm font-extrabold text-gray-900 dark:text-white">
                    {formatTemperature(forecast.tempMax, tempUnit)}
                  </span>
                </div>

                <div className="min-w-0 rounded-xl bg-white/55 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-2.5 py-2" title="Precipitation Probability">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                    <CloudRain size={12} className="text-blue-400 shrink-0" />
                    Rain
                  </div>
                  <span className="block truncate text-sm font-extrabold text-gray-900 dark:text-white">
                    {forecast.precipitationProbability}%
                  </span>
                </div>

                <div className="min-w-0 rounded-xl bg-white/55 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-2.5 py-2" title="Maximum Wind Speed">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                    <Wind size={12} className="text-teal-400 shrink-0" />
                    Wind
                  </div>
                  <span className="block truncate text-sm font-extrabold text-gray-900 dark:text-white">
                    {formatWindSpeed(forecast.windSpeedMax, windSpeedUnit)}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
