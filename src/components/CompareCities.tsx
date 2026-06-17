import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeftRight, 
  Search, 
  Loader2, 
  AlertCircle, 
  CloudRain, 
  Wind, 
  Compass, 
  CheckCircle,
  TrendingDown,
  X 
} from 'lucide-react';
import { WeatherData, CitySearchResult, TempUnit, WindSpeedUnit } from '../types';
import { searchCities, fetchWeatherForCity } from '../services/weatherApi';
import { getWeatherCondition } from '../utils/weatherCode';
import { formatTemperature, formatWindSpeed } from '../utils/format';
import { generateInsights } from '../utils/recommendations';

interface CompareCitiesProps {
  city1Data: WeatherData | null;
  tempUnit: TempUnit;
  windSpeedUnit: WindSpeedUnit;
  onComparisonChange?: (hasComparison: boolean) => void;
}

export default function CompareCities({
  city1Data,
  tempUnit,
  windSpeedUnit,
  onComparisonChange
}: CompareCitiesProps) {
  const [search2Query, setSearch2Query] = useState('');
  const [results2, setResults2] = useState<CitySearchResult[]>([]);
  const [isSearching2, setIsSearching2] = useState(false);
  const [city2Data, setCity2Data] = useState<WeatherData | null>(null);
  const [isFetching2, setIsFetching2] = useState(false);
  const [error2, setError2] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
  onComparisonChange?.(!!city2Data);
}, [city2Data, onComparisonChange]);
  // Auto-search for City 2 autocomplete
  useEffect(() => {
    if (search2Query.trim().length < 2) {
      setResults2([]);
      setError2(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching2(true);
      setError2(null);
      try {
        const matches = await searchCities(search2Query);
        setResults2(matches);
        setIsMenuOpen(true);
      } catch (err) {
        setError2("Failed to grab matches.");
      } finally {
        setIsSearching2(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search2Query]);

  const handleSelectCity2 = async (city: CitySearchResult) => {
    setIsFetching2(true);
    setError2(null);
    setIsMenuOpen(false);
    setSearch2Query('');
    setResults2([]);
    try {
      const weather = await fetchWeatherForCity(city);
      setCity2Data(weather);
    } catch (err) {
      setError2("Fail to fetch weather for selected comparison city.");
    } finally {
      setIsFetching2(false);
    }
  };

  const handleClearCity2 = () => {
    setCity2Data(null);
  };

  const code1 = city1Data?.current.weatherCode ?? 0;
  const code2 = city2Data?.current.weatherCode ?? 0;

  const cond1 = getWeatherCondition(code1);
  const cond2 = getWeatherCondition(code2);

  const insights1 = city1Data ? generateInsights(city1Data) : null;
  const insights2 = city2Data ? generateInsights(city2Data) : null;

  return (
    <div className="rounded-3xl shadow-glow-blue border border-gray-200/50 dark:border-stone-800/80 bg-white/80 dark:bg-stone-900/85 backdrop-blur-xl p-6 sm:p-8 shadow-xl flex flex-col gap-6" id="comparison-dashboard">
      <div>
        <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
          <ArrowLeftRight size={16} className="text-blue-500 animate-pulse" />
          Side-by-Side Weather Comparison
        </h3>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
          Compare real-time climate conditions, rain probabilities, wind benchmarks, and rule-based planning guides side-by-side.
        </p>
      </div>

      {/* Inputs Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City 1 (Presumed from search) */}
        <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-zinc-850/40 border border-gray-100 dark:border-zinc-850 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Primary City </span>
            <span className="text-sm font-extrabold text-gray-900 dark:text-zinc-150 mt-1">
              {city1Data ? city1Data.city.name : 'No City Selected'}
            </span>
          </div>
          <span className="text-xs font-black dark:text-blue text-blue-500 bg-blue-500/10 dark:bg-white px-2 py-1 rounded">Active</span>
        </div>

        {/* City 2 (Search and Load) */}
        <div className="relative">
          {city2Data ? (
            <div className="p-4 rounded-2xl bg-gray-50/50 dark:bg-zinc-850/40 border border-gray-100 dark:border-zinc-855 flex items-center justify-between animate-fade-in">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">Comparison City (City B)</span>
                <span className="text-sm font-extrabold text-rose-500 dark:text-rose-400 mt-1">
                  {city2Data.city.name}
                </span>
              </div>
              <button
                onClick={handleClearCity2}
                className="p-1 px-1.5 rounded-lg border border-gray-200 hover:border-gray-300 dark:border-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-colors cursor-pointer text-xs flex items-center gap-0.5 font-bold"
              >
                <X size={12} />
                Clear
              </button>
            </div>
          ) : (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                {isSearching2 ? (
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                ) : (
                  <Search size={16} />
                )}
              </span>
              <input
                type="text"
                value={search2Query}
                onChange={(e) => setSearch2Query(e.target.value)}
                placeholder="Compare with another city..."
                className="w-full pl-9 pr-6 py-3.5 rounded-2xl border border-gray-200 dark:border-zinc-805 bg-white dark:bg-zinc-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-zinc-150"
              />

              {isMenuOpen && results2.length > 0 && (
                <div className="absolute z-30 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-850 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
                  {results2.map((c) => (
                    <button
                      key={`compare-${c.id}`}
                      onClick={() => handleSelectCity2(c)}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-gray-150 dark:hover:bg-zinc-800 transition-colors font-medium text-gray-800 dark:text-zinc-200 flex justify-between cursor-pointer"
                    >
                      <span className="font-semibold">{c.name}, {c.admin1 || ''}</span>
                      <span className="text-[10px] opacity-70 bg-gray-150 dark:bg-zinc-800 rounded px-1">{c.country_code || c.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {error2 && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-500 font-semibold bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded">
              <AlertCircle size={12} />
              <span>{error2}</span>
            </div>
          )}
        </div>
      </div>

      {/* Comparisons Resulting Table Block */}
      <AnimatePresence mode="wait">
        {city1Data && city2Data ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border border-gray-150 dark:border-zinc-850 rounded-2xl bg-white dark:bg-zinc-900/60 p-4 sm:p-5 flex flex-col gap-4"
          >
            {/* Headers titles */}
            <div className="grid grid-cols-2 gap-4 text-center pb-2 border-b border-gray-150 dark:border-zinc-800">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-blue-500 tracking-wider bg-blue-500/10 px-2.5 py-0.5 rounded uppercase">City A</span>
                <span className="text-base font-black text-gray-900 dark:text-zinc-100 mt-1 truncate max-w-full">{city1Data.city.name}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-rose-500 tracking-wider bg-rose-500/10 px-2.5 py-0.5 rounded uppercase">City B</span>
                <span className="text-base font-black text-gray-900 dark:text-zinc-100 mt-1 truncate max-w-full">{city2Data.city.name}</span>
              </div>
            </div>

            {/* Metrics Comparisons Grid rows */}
            <div className="flex flex-col gap-3">
              {/* Row 1: Temperature */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 text-center uppercase tracking-wider block">Temperature</span>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="text-2xl font-black text-gray-900 dark:text-zinc-100 font-sans">
                    {formatTemperature(city1Data.current.temperature, tempUnit)}
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-zinc-100 font-sans">
                    {formatTemperature(city2Data.current.temperature, tempUnit)}
                  </div>
                </div>
              </div>

              {/* Row 2: Condition */}
              <div className="flex flex-col gap-1 py-1.5 border-y border-gray-100 dark:border-zinc-800/40">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 text-center uppercase tracking-wider block">Condition</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`p-1 rounded bg-gradient-to-br ${cond1.colorClass} text-white`}>
                      <cond1.icon size={14} />
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-zinc-350">{cond1.description}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`p-1 rounded bg-gradient-to-br ${cond2.colorClass} text-white`}>
                      <cond2.icon size={14} />
                    </span>
                    <span className="text-xs font-semibold text-gray-800 dark:text-zinc-350">{cond2.description}</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Rain Probability / Precip */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 text-center uppercase tracking-wider block">Rain Probability & Precip.</span>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-700 dark:text-zinc-200 font-semibold">
                    <CloudRain size={13} className="text-blue-400" />
                    <span>{city1Data.daily[0]?.precipitationProbability ?? 0}% ({city1Data.current.precipitation} mm)</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-700 dark:text-zinc-200 font-semibold">
                    <CloudRain size={13} className="text-blue-400" />
                    <span>{city2Data.daily[0]?.precipitationProbability ?? 0}% ({city2Data.current.precipitation} mm)</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Wind Speed */}
              <div className="flex flex-col gap-1 py-1.5 border-t border-gray-100 dark:border-zinc-800/40">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 text-center uppercase tracking-wider block">Wind Speed</span>
                <div className="grid grid-cols-2 gap-4 text-center text-xs font-semibold text-gray-700 dark:text-zinc-200">
                  <div className="flex items-center justify-center gap-1">
                    <Wind size={13} className="text-teal-400" />
                    <span>{formatWindSpeed(city1Data.current.windSpeed, windSpeedUnit)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Wind size={13} className="text-teal-400" />
                    <span>{formatWindSpeed(city2Data.current.windSpeed, windSpeedUnit)}</span>
                  </div>
                </div>
              </div>

              {/* Row 5: Top Advice */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-150 dark:border-zinc-805">
                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 text-center uppercase tracking-wider block">Top Recommendation Plan</span>
                <div className="grid grid-cols-2 gap-4 text-xs font-medium leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-blue-50/20 dark:bg-blue-950/15 border border-blue-100/30 text-gray-650 dark:text-zinc-300">
                    <CheckCircle size={11} className="text-blue-500 mb-1 shrink-0" />
                    {insights1?.recommendations[0]?.suggestion || 'Proceed.'}
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/20 dark:bg-rose-950/15 border border-rose-100/30 text-gray-650 dark:text-zinc-300">
                    <CheckCircle size={11} className="text-rose-500 mb-1 shrink-0" />
                    {insights2?.recommendations[0]?.suggestion || 'Proceed.'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : isFetching2 ? (
          <div className="h-32 flex flex-col items-center justify-center gap-2 border border-gray-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/50">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
            <span className="text-xs text-gray-400 dark:text-zinc-505 font-bold">Querying weather diagnostics...</span>
          </div>
        ) : (
          <div className="h-20 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-250 dark:border-zinc-800 rounded-2xl bg-gray-50/20 dark:bg-zinc-900/40">
            <span className="text-xs text-gray-400 dark:text-zinc-500 font-bold">Select a city to compare.</span>
            <p className="text-[11px] text-gray-450 dark:text-zinc-550 max-w-[320px] mt-1">
              Search and select a secondary city in the search box above to inspect side-by-side.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
