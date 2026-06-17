import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  CheckCircle, 
  HelpCircle, 
  AlertTriangle,
  Lightbulb, 
  Coffee,
  Heart
} from 'lucide-react';
import { WeatherData } from '../types';
import { generateInsights, WeatherRecommendation } from '../utils/recommendations';

interface RecommendationsProps {
  data: WeatherData;
}

export default function Recommendations({ data }: RecommendationsProps) {
  const { recommendations, alerts, activityScore, activityText } = generateInsights(data);

  // Pick Comfort dial color schemes based on activity score
  const getComfortColor = (score: number) => {
    if (score >= 75) return { stroke: 'stroke-teal-500', bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-600 dark:text-teal-400' };
    if (score >= 50) return { stroke: 'stroke-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/10', text: 'text-amber-600 dark:text-amber-400' };
    return { stroke: 'stroke-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-600 dark:text-rose-450' };
  };

  const scheme = getComfortColor(activityScore);

  // SVG Gauge Calculations
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (activityScore / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="recommendations-container">
      {/* 1. Comfort Score Circular Meter */}
      <div className="md:col-span-1 rounded-3xl border border-gray-150 dark:border-zinc-850 bg-white/70 dark:bg-zinc-900/85 p-6 flex flex-col items-center justify-between text-center min-h-[260px] shadow-sm">
        <div className="w-full">
          <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Heart size={12} className="text-rose-500 animate-pulse" />
            Comfort Meter
          </span>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">
            Realtime outdoor comfort level
          </p>
        </div>

        {/* Circular SVG Progress */}
        <div className="relative w-32 h-32 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Dial Track */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-gray-100 dark:stroke-zinc-800"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated foreground score */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              className={`${scheme.stroke}`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-gray-900 dark:text-zinc-150 font-mono leading-none">
              {activityScore}
            </span>
            <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider mt-1.5 leading-none">
              Comfort
            </span>
          </div>
        </div>

        {/* Short Text status description */}
        <div
  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${scheme.bg} ${scheme.text} text-center`}
>
  {activityText}
</div>
      </div>

      {/* 2. Planning Recommendations Checklist */}
      <div className="md:col-span-2 rounded-3xl border border-gray-150 dark:border-zinc-850 bg-white/70 dark:bg-zinc-900/85 p-6 flex flex-col gap-4 shadow-sm">
        <div>
          <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Lightbulb size={13} className="text-amber-500 animate-bounce" />
            Planning Intel
          </span>
          <p className="text-xs text-gray-400 dark:text-zinc-505 mt-0.5">
            Action items and recommendations calculated from weather variables
          </p>
        </div>

        {/* Suggestions list */}
        <div className="flex flex-col gap-2.5 flex-grow">
          {recommendations.map((rec, idx) => {
            const isWarning = rec.type === 'danger' || rec.type === 'warning';
            return (
              <div
                key={`rec-${idx}-${rec.title}`}
                className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                  rec.type === 'danger'
                    ? 'border-rose-100 bg-rose-50/30 text-rose-800 dark:border-rose-950/20 dark:bg-rose-950/5 dark:text-rose-400'
                    : rec.type === 'warning'
                    ? 'border-amber-100 bg-amber-50/20 text-amber-800 dark:border-amber-950/30 dark:bg-amber-950/5 dark:text-amber-400'
                    : rec.type === 'success'
                    ? 'border-emerald-100 bg-emerald-50/25 text-emerald-800 dark:border-emerald-950/20 dark:bg-emerald-950/5 dark:text-emerald-400'
                    : 'border-gray-100 bg-gray-50/40 text-gray-800 dark:border-zinc-800 dark:bg-zinc-850/20 dark:text-zinc-350'
                }`}
              >
                {/* Visual Icon Bullet */}
                <span className="mt-0.5 p-1 rounded-lg shrink-0">
                  {rec.type === 'danger' ? (
                    <ShieldAlert size={14} className="text-rose-500" />
                  ) : rec.type === 'warning' ? (
                    <AlertTriangle size={14} className="text-amber-500" />
                  ) : rec.type === 'success' ? (
                    <CheckCircle size={14} className="text-emerald-500" />
                  ) : (
                    <Coffee size={14} className="text-slate-400" />
                  )}
                </span>
                
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold tracking-tight">
                    {rec.title}
                  </span>
                  <span className="text-xs text-gray-650 dark:text-zinc-400 leading-relaxed mt-0.5">
                    {rec.suggestion}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warnings & Advisories block below */}
        {alerts.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {alerts.map((al, idx) => (
              <div
                key={`alert-${idx}`}
                className={`p-3 rounded-2xl border text-xs flex gap-3 items-center ${
                  al.severity === 'danger'
                    ? 'border-rose-600 bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'border-amber-500/50 bg-amber-500/5 text-amber-600 dark:text-amber-400'
                }`}
              >
                <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                <div className="flex flex-col">
                  <span className="font-extrabold uppercase tracking-wide text-[10px]">
                    ⚠️ ADVISORY: {al.title}
                  </span>
                  <p className="text-gray-700 dark:text-zinc-300 font-medium mt-0.5 leading-snug">
                    {al.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
