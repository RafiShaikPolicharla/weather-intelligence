import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wind, 
  Droplet, 
  CloudRain, 
  Copy, 
  Check, 
  Thermometer, 
  Clock, 
  Share2, 
  Radio
} from 'lucide-react';
import { WeatherData, TempUnit, WindSpeedUnit } from '../types';
import { getWeatherCondition } from '../utils/weatherCode';
import { formatTemperature, formatWindSpeed, formatTimeUTC } from '../utils/format';
import { generateInsights } from '../utils/recommendations';

interface CurrentWeatherProps {
  data: WeatherData;
  tempUnit: TempUnit;
  windSpeedUnit: WindSpeedUnit;
}

export default function CurrentWeather({ data, tempUnit, windSpeedUnit }: CurrentWeatherProps) {
  const [copied, setCopied] = useState(false);
  const condition = getWeatherCondition(data.current.weatherCode);
  const insights = generateInsights(data);
  const topRec = insights.recommendations[0]?.suggestion || 'Proceed with daily plans.';

  const handleCopySummary = async () => {
    const tempStr = formatTemperature(data.current.temperature, tempUnit);
    const feelStr = data.current.apparentTemperature !== undefined 
      ? `(Feels like ${formatTemperature(data.current.apparentTemperature, tempUnit)})` 
      : '';
    const windStr = formatWindSpeed(data.current.windSpeed, windSpeedUnit);
    const rainChance = data.daily[0]?.precipitationProbability ?? 0;

    const summaryText = `Weather Intelligence Report 🌦️\n` +
      `📍 City: ${data.city.name}, ${data.city.country || data.city.admin1 || ''}\n` +
      `🌡️ Current Temp: ${tempStr} ${feelStr}\n` +
      `☁️ Condition: ${condition.description}\n` +
      `💨 Wind: ${windStr}\n` +
      `💧 Humidity: ${data.current.relativeHumidity}%\n` +
      `☔ Rain Chance: ${rainChance}%\n` +
      `💡 Recommended Plan: ${topRec}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const WeatherIcon = condition.icon;

  return (
    <motion.div
      id="current-weather-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-gray-200/50 dark:border-cyan-300/15 bg-white/85 dark:bg-slate-950/72 backdrop-blur-xl shadow-xl shadow-glow-blue p-5 sm:p-6 flex flex-col gap-5"
    >
      {/* Decorative colored glow on top left corner mimicking current weather mood */}
      <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${condition.colorClass} opacity-10 dark:opacity-20 blur-3xl rounded-full pointer-events-none`} />

      {/* Primary Details Panel */}
      <div className="flex flex-col justify-between z-10 relative flex-grow min-w-0">
        <div>
          <div className="flex items-center gap-2">
              <Radio color="red"  size={14}/>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 border border-zinc-200/40 dark:border-zinc-700/50">
              Live Conditions
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-zinc-100 mt-3 truncate">
            {data.city.name}
          </h2>

          <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
            <span>{data.city.country}</span>
            {data.city.admin1 && (
              <>
                <span className="opacity-40">•</span>
                <span>{data.city.admin1}</span>
              </>
            )}
          </p>
        </div>

        {/* Current degrees count */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-end gap-2 min-w-0">
          <span className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white font-sans tracking-tighter leading-none">
            {formatTemperature(data.current.temperature, tempUnit)}
          </span>
          
          {data.current.apparentTemperature !== undefined && (
            <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-slate-300 flex items-center gap-1">
              <Thermometer size={14} />
              Feels like <strong className="font-semibold text-gray-500 dark:text-white">{formatTemperature(data.current.apparentTemperature, tempUnit)}</strong>
            </span>
          )}
        </div>

        {/* Condition details */}
        <div className="mt-4 flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${condition.colorClass}`} />
          <span className="text-md sm:text-lg font-bold text-gray-800 dark:text-zinc-200 tracking-tight">
            {condition.description}
          </span>
        </div>

        {/* Time Stamp */}
        <div className="mt-3 text-[11px] text-gray-400 dark:text-zinc-500 font-mono flex items-center gap-1">
          <Clock size={12} />
          Updated: {formatTimeUTC(data.current.time, data.timezone)}
        </div>
      </div>

      {/* Middle Interactive Icon Stage */}
      <div className="z-10 flex items-center justify-between gap-4 rounded-2xl border border-gray-100 dark:border-cyan-300/10 bg-gray-50/60 dark:bg-white/5 p-4">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`h-20 w-20 shrink-0 rounded-full bg-gradient-to-br ${condition.colorClass} flex items-center justify-center text-white shadow-lg shadow-blue-500/10`}
        >
          <WeatherIcon size={38} strokeWidth={1.8} />
        </motion.div>
        
        <div className="min-w-0 text-right">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-400">
            Weather Mood
          </span>
          <span className="block truncate text-sm font-extrabold text-gray-700 dark:text-white capitalize">
            {condition.textMood}
          </span>
        </div>
      </div>

      {/* Right Column: Mini Metric Tiles & Shortcuts */}
      <div className="z-10 flex w-full flex-col justify-between gap-4" id="weather-parameters-list">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Humidity tile */}
          <div className="min-w-0 p-3 rounded-xl border border-gray-100 dark:border-cyan-300/10 bg-gray-50/70 dark:bg-white/5 flex items-center gap-3">
            <span className="shrink-0 p-1.5 rounded-lg bg-sky-200/60 dark:bg-sky-500/15 text-sky-600 dark:text-sky-200">
              <Droplet size={16} />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest leading-none">Humidity</span>
              <span className="truncate text-sm font-black text-gray-800 dark:text-white mt-1">{data.current.relativeHumidity}%</span>
            </div>
          </div>

          {/* Wind Speed Tile */}
          <div className="min-w-0 p-3 rounded-xl border border-gray-100 dark:border-cyan-300/10 bg-gray-50/70 dark:bg-white/5 flex items-center gap-3">
            <span className="shrink-0 p-1.5 rounded-lg bg-teal-200/60 dark:bg-teal-500/15 text-teal-600 dark:text-teal-200">
              <Wind size={16} />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest leading-none">Wind</span>
              <span className="truncate text-sm font-black text-gray-800 dark:text-white mt-1">
                {formatWindSpeed(data.current.windSpeed, windSpeedUnit)}
              </span>
            </div>
          </div>

          {/* Precipitation Tile */}
          <div className="min-w-0 p-3 rounded-xl border border-gray-100 dark:border-cyan-300/10 bg-gray-50/70 dark:bg-white/5 flex items-center gap-3">
            <span className="shrink-0 p-1.5 rounded-lg bg-blue-200/60 dark:bg-blue-500/15 text-blue-600 dark:text-blue-200">
              <CloudRain size={16} />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest leading-none">Precip.</span>
              <span className="truncate text-sm font-black text-gray-800 dark:text-white mt-1">{data.current.precipitation} mm</span>
            </div>
          </div>
        </div>

        {/* Copy Report Trigger */}
        <button
          onClick={handleCopySummary}
          className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-2 ${
            copied
              ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200'
              : 'border-blue-105 bg-blue-50/70 hover:bg-blue-50 dark:border-cyan-300/15 dark:bg-cyan-400/10 dark:hover:bg-cyan-400/15 text-blue-600 dark:text-cyan-100 hover:text-blue-700'
          }`}
          title="Copy short intelligence report text to clipboard"
        >
          {copied ? (
            <>
              <Check size={14} className="animate-scale-up" />
              Report Copied!
            </>
          ) : (
            <>
              <Copy size={14}/>
              Copy Intelligence Report
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
