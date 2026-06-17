/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  AlertCircle,
  CloudSun,
  Info,
  Loader2,
  ShieldCheck,
  Sparkles,
  Bell
} from 'lucide-react';

import { CitySearchResult, WeatherData, TempUnit, WindSpeedUnit, AppPreferences } from './types';
import { fetchWeatherForCity, getCityFromCoordinates } from './services/weatherApi';

import SearchBar from './components/SearchBar';
import RecentSearches from './components/RecentSearches';
import FavoriteCities from './components/FavoriteCities';
import CurrentWeather from './components/CurrentWeather';
import ForecastCards from './components/ForecastCards';
import HourlyForecast from './components/HourlyForecast';
import WeatherCharts from './components/WeatherCharts';
import Recommendations from './components/Recommendations';
import CompareCities from './components/CompareCities';
import ThemeToggle from './components/ThemeToggle';

const DEFAULT_CITY: CitySearchResult = {
  id: 2643743,
  name: "London",
  latitude: 51.50853,
  longitude: -0.12574,
  country: "United Kingdom",
  country_code: "GB",
  admin1: "England",
  timezone: "Europe/London"
};

export default function App() {
  // 1. App preferences from localStorage
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    const cachedTemp = localStorage.getItem('weather_pref_temp') as TempUnit;
    const cachedWind = localStorage.getItem('weather_pref_wind') as WindSpeedUnit;
    const cachedTheme = localStorage.getItem('weather_pref_theme') as 'light' | 'dark';

    return {
      tempUnit: cachedTemp === 'F' ? 'F' : 'C',
      windSpeedUnit: cachedWind === 'mph' ? 'mph' : 'kmh',
      theme: cachedTheme === 'dark' ? 'dark' : 'light'
    };
  });

  // 2. Favorites List from localStorage
  const [favorites, setFavorites] = useState<CitySearchResult[]>(() => {
    try {
      const cachedFavs = localStorage.getItem('weather_favorites');
      return cachedFavs ? JSON.parse(cachedFavs) : [];
    } catch {
      return [];
    }
  });

  // 3. Recent searches List from localStorage
  const [recents, setRecents] = useState<CitySearchResult[]>(() => {
    try {
      const cachedRec = localStorage.getItem('weather_recents');
      return cachedRec ? JSON.parse(cachedRec) : [];
    } catch {
      return [];
    }
  });

  // 4. Primary Selected City (starts with London unless cached)
  const [currentCity, setCurrentCity] = useState<CitySearchResult>(() => {
    try {
      const cachedActiveCity = localStorage.getItem('weather_active_city');
      return cachedActiveCity ? JSON.parse(cachedActiveCity) : DEFAULT_CITY;
    } catch {
      return DEFAULT_CITY;
    }
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply dark mode on mount / preference shifts
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('weather_pref_theme', preferences.theme);
  }, [preferences.theme]);

  // Persist units settings
  useEffect(() => {
    localStorage.setItem('weather_pref_temp', preferences.tempUnit);
  }, [preferences.tempUnit]);

  useEffect(() => {
    localStorage.setItem('weather_pref_wind', preferences.windSpeedUnit);
  }, [preferences.windSpeedUnit]);

  // Sync active city to local storage
  useEffect(() => {
    if (currentCity) {
      localStorage.setItem('weather_active_city', JSON.stringify(currentCity));
    }
  }, [currentCity]);

  // Fetch forecast upon current selected location changes
  useEffect(() => {
    let active = true;

    const loadWeather = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchWeatherForCity(currentCity);
        if (active) {
          setWeatherData(result);

          // Store successful non-geolocation queries to recent searches history
          if (currentCity.name !== "My Location") {
            addToRecents(currentCity);
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load meteorological forecast diagnostic datasets.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadWeather();

    return () => {
      active = false;
    };
  }, [currentCity]);

  // Geolocation trigger
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Browser Geolocation is not supported in the active environment.");
      return;
    }

    setIsLocationLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const geoCity = getCityFromCoordinates(lat, lon);
        setCurrentCity(geoCity);
        setIsLocationLoading(false);
      },
      (err) => {
        console.error("Geolocation error callback:", err);
        setError("Unable to obtain device coordinates. Please inspect dynamic privacy settings or search manually.");
        setIsLocationLoading(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Caching arrays modifications helpers
  const addToRecents = (city: CitySearchResult) => {
    setRecents((prev) => {
      const filtered = prev.filter((item) => item.id !== city.id);
      const updated = [city, ...filtered].slice(0, 5);
      localStorage.setItem('weather_recents', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearRecents = () => {
    setRecents([]);
    localStorage.removeItem('weather_recents');
  };

  const handleToggleFavorite = (city: CitySearchResult) => {
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.id === city.id);
      let updated;

      if (exists) {
        updated = prev.filter((fav) => fav.id !== city.id);
      } else {
        if (prev.length >= 5) {
          updated = [...prev.slice(1), city]; // displace oldest if capping max 5 limit
        } else {
          updated = [...prev, city];
        }
      }

      localStorage.setItem('weather_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleTheme = () => {
    setPreferences((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const toggleTempUnit = () => {
    setPreferences((prev) => ({
      ...prev,
      tempUnit: prev.tempUnit === 'C' ? 'F' : 'C'
    }));
  };

  const toggleWindUnit = () => {
    setPreferences((prev) => ({
      ...prev,
      windSpeedUnit: prev.windSpeedUnit === 'kmh' ? 'mph' : 'kmh'
    }));
  };

  // Dynamic glow colors for gorgeous atmospheric display
  const getGlowColors = () => {
    const code = weatherData?.current.weatherCode;
    const isDark = preferences.theme === 'dark';
    if (code === undefined) {
      return {
        primary: isDark ? 'bg-blue-600/5' : 'bg-blue-400/10',
        secondary: isDark ? 'bg-purple-600/5' : 'bg-indigo-400/10'
      };
    }

    if (code === 0 || code === 1) { // sunny
      return {
        primary: isDark ? 'bg-amber-500/8' : 'bg-amber-200/20',
        secondary: isDark ? 'bg-orange-600/4' : 'bg-orange-100/15'
      };
    }
    if (code === 2 || code === 3) { // cloudy
      return {
        primary: isDark ? 'bg-slate-600/5' : 'bg-slate-205/30',
        secondary: isDark ? 'bg-zinc-700/4' : 'bg-zinc-150/20'
      };
    }
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) { // rain
      return {
        primary: isDark ? 'bg-sky-500/8' : 'bg-blue-150/25',
        secondary: isDark ? 'bg-indigo-900/6' : 'bg-indigo-100/20'
      };
    }
    if ([71, 73, 75, 85, 86].includes(code)) { // snow
      return {
        primary: isDark ? 'bg-sky-400/8' : 'bg-sky-200/25',
        secondary: isDark ? 'bg-slate-500/5' : 'bg-blue-105/15'
      };
    }
    return {
      primary: isDark ? 'bg-purple-950/20' : 'bg-purple-200/15',
      secondary: isDark ? 'bg-indigo-950/15' : 'bg-indigo-150/15'
    };
  };

  const glows = getGlowColors();

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-800 dark:text-zinc-100 transition-colors duration-500 pb-16 pt-6">
      {/* Absolute Dynamic Colored Glow Spheres */}
      <div className={`absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full ${glows.primary} blur-[120px] pointer-events-none transition-all duration-700`} />
      <div className={`absolute bottom-[10%] right-[-150px] w-[500px] h-[500px] rounded-full ${glows.secondary} blur-[120px] pointer-events-none transition-all duration-700`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">

        <header className="relative overflow-hidden rounded-[2rem] border border-white/60 dark:border-cyan-300/15 bg-white/78 dark:bg-slate-950/78 shadow-glow-blue backdrop-blur-2xl" id="main-header">
          <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-blue-500/5 to-indigo-600/10 dark:from-cyan-400/12 dark:via-indigo-500/10 dark:to-fuchsia-500/12 pointer-events-none" />
          <div className="relative flex flex-col gap-4 p-5 sm:p-5 lg:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <span className="p-3 rounded-3xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-violet-600 shadow-lg shadow-blue-500/25 text-white">
                  <CloudSun size={30} className="animate-pulse" />
                </span>
                <div className="flex flex-col">
                  {/* <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
                    <Sparkles size={12} />
                    Open-Meteo Live Intelligence
                  </div> */}
                  <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-display text-gray-950 dark:text-white">
                    Weather Intelligence
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm sm:text-base font-medium leading-relaxed text-slate-600 dark:text-slate-200">
                    Real-time forecasts, comfort insights, city comparisons, and intelligent weather planning.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={toggleTempUnit}
                  className="px-4 py-2.5 rounded-2xl border border-white/70 dark:border-cyan-300/15 bg-white/85 dark:bg-slate-900/85 text-xs font-bold hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer text-gray-800 dark:text-cyan-100"
                  title="Toggle Celsius / Fahrenheit scale"
                >
                  {preferences.tempUnit === 'C' ? '°Celsius' : '°Fahrenheit'}
                </button>

                <button
                  onClick={toggleWindUnit}
                  className="px-4 py-2.5 rounded-2xl border border-white/70 dark:border-cyan-300/15 bg-white/85 dark:bg-slate-900/85 text-xs font-bold hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer text-gray-800 dark:text-cyan-100"
                  title="Toggle wind metric limits"
                >
                  Wind: {preferences.windSpeedUnit === 'kmh' ? 'km/h' : 'mph'}
                </button>

                <ThemeToggle theme={preferences.theme} onToggle={toggleTheme} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/70 dark:border-violet-300/15 bg-white/70 dark:bg-violet-300/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Sparkles size={14} className="text-violet-500" />
                  AI Insights
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                  Personalized weather summaries and recommendations
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 dark:border-red-300/15 bg-white/70 dark:bg-red-300/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Bell size={14} className="text-red-500" />
                  Weather Alerts
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                  Instant warnings for storms, heatwaves, and severe conditions
                </p>
              </div>

              <div className="rounded-2xl border border-white/70 dark:border-amber-300/15 bg-white/70 dark:bg-amber-300/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <CloudSun size={14} className="text-amber-500" />
                  Smart Planning
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                  Forecasts, alerts, and city comparison tools
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* METEO BROADCAST IN PROGRESS BANNER OR SEARCH ALERTS */}
        {error && (
          <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 dark:border-rose-950/40 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 flex items-center gap-3 animate-fade-in text-sm font-semibold">
            <AlertCircle className="shrink-0 text-rose-500" />
            <div className="flex-1">
              <strong>Meteorological Diagnostic Alert:</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-bold hover:underline cursor-pointer uppercase py-1 px-2 rounded hover:bg-rose-100/40"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Compact control ribbon */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="dashboard-controls">
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl border border-gray-150 dark:border-zinc-850 bg-white/75 dark:bg-slate-950/64 shadow-xs flex flex-col justify-center gap-4 backdrop-blur-xl">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Search Weather
            </span>
            <SearchBar
              onSelectCity={setCurrentCity}
              onUseMyLocation={handleUseMyLocation}
              isLocationLoading={isLocationLoading}
            />
          </div>

          <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl border border-gray-150 dark:border-zinc-850 bg-white/75 dark:bg-slate-950/64 shadow-xs flex flex-col gap-4 backdrop-blur-xl">
            <FavoriteCities
              favorites={favorites}
              currentCity={currentCity}
              onSelectCity={setCurrentCity}
              onToggleFavorite={handleToggleFavorite}
            />

            <div className="border-t border-gray-150/60 dark:border-zinc-800/60 pt-4">
              <RecentSearches
                searches={recents}
                onSelectCity={setCurrentCity}
                onClear={handleClearRecents}
              />
            </div>
          </div>
        </section>

        {/* Main dashboard: live weather beside planning intelligence */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Weather Overview
              </h2>
            </div>
            {isLoading ? (
              <div className="rounded-3xl border border-gray-150 dark:border-zinc-850 bg-white/75 dark:bg-slate-950/64 p-12 flex flex-col items-center justify-center text-center gap-3 backdrop-blur-xl">
                <Loader2 size={36} className="animate-spin text-blue-500" />
                <span className="text-xs font-extrabold text-gray-400 dark:text-zinc-500 animate-pulse uppercase tracking-wider">
                  Fetching latest Open-Meteo forecast...
                </span>
              </div>
            ) : weatherData ? (
              <CurrentWeather
                data={weatherData}
                tempUnit={preferences.tempUnit}
                windSpeedUnit={preferences.windSpeedUnit}
              />
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-250 dark:border-zinc-800 bg-gray-50/10 dark:bg-zinc-900/20 p-8 text-center italic text-sm text-gray-450 dark:text-zinc-550">
                Search a city or use your location to open the weather dashboard.
              </div>
            )}

            {!isLoading && weatherData && (
              <div className="p-5 sm:p-6 rounded-3xl border border-gray-150 dark:border-zinc-850 bg-white/75 dark:bg-slate-950/64 shadow-xs backdrop-blur-xl">
                <HourlyForecast
                  data={weatherData}
                  tempUnit={preferences.tempUnit}
                />
              </div>
            )}
          </div>

          <div className="xl:col-span-6 flex flex-col gap-6" id="dashboard-analytics">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Planning Intelligence
            </h2>
            {!isLoading && weatherData && (
              <Recommendations data={weatherData} />
            )}

            
            {!isLoading && weatherData && (
              <WeatherCharts
                data={weatherData}
                tempUnit={preferences.tempUnit}
              />
            )}
          </div>
        </section>

        {/* Bottom analytics row: no empty side gutters */}
        {!isLoading && weatherData && (
          <div className="xl:col-span-7 flex flex-col gap-6">
                <ForecastCards
                data={weatherData}
                tempUnit={preferences.tempUnit}
                windSpeedUnit={preferences.windSpeedUnit}
              />
              <CompareCities
                city1Data={weatherData}
                tempUnit={preferences.tempUnit}
                windSpeedUnit={preferences.windSpeedUnit}
              />
           
          </div>
        )}
        {/* SYSTEM RECOVERY INFO PANEL FOOTER */}
        <footer className="mt-8 border-t border-gray-150 dark:border-zinc-850 pt-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                24h
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hourly Forecast
              </p>
            </div>

            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                7 Days
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extended Outlook
              </p>
            </div>

            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                Smart
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Weather Intelligence
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 flex flex-col items-center text-center gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-400">
              <Info size={12} className="text-emerald-500 shrink-0" />
              <span>
                Compare cities, monitor conditions, and discover the best times for outdoor activities.
              </span>
            </div>

            <span className="text-[10px] font-mono text-gray-400 dark:text-zinc-600">
              Data-driven weather insights for everyday planning
            </span>
          </div>
        </footer>

      </div>
    </div>
  );
}
