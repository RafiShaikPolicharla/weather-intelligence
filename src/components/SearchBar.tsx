import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, AlertCircle } from 'lucide-react';
import { CitySearchResult } from '../types';
import { searchCities } from '../services/weatherApi';

interface SearchBarProps {
  onSelectCity: (city: CitySearchResult) => void;
  onUseMyLocation: () => void;
  isLocationLoading: boolean;
}

export default function SearchBar({ onSelectCity, onUseMyLocation, isLocationLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide suggestions dropdown if clicked outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce autocomplete search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const matches = await searchCities(query);
        setResults(matches);
        setIsOpen(true);
        if (matches.length === 0) {
          setError("No cities found. Check spelling or try another name.");
        }
      } catch (err) {
        setError("Failed to fetch location suggestions.");
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please type a location name.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const matches = await searchCities(query);
      if (matches.length > 0) {
        onSelectCity(matches[0]);
        setIsOpen(false);
        setQuery('');
      } else {
        setError("City not found. Please try another spelling.");
      }
    } catch (err) {
      setError("An error occurred during search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef} id="search-bar-container">
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400 dark:text-zinc-500">
            {isLoading ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Search size={18} />}
          </span>
          
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            placeholder="Search city (e.g. London, Chennai, Tokyo...)"
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/90 text-sm font-medium text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent shadow-sm transition-all"
          />

          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-blue-550 cursor-pointer active:scale-95 flex items-center justify-center min-w-[80px]"
        >
          Search
        </button>

        <button
          type="button"
          onClick={onUseMyLocation}
          disabled={isLocationLoading}
          className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900 text-gray-700 dark:text-zinc-350 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center"
          title="Use current location"
        >
          {isLocationLoading ? (
            <Loader2 size={18} className="animate-spin text-blue-500" />
          ) : (
            <MapPin size={18} />
          )}
        </button>
      </form>

      {/* Autocomplete Dropdown suggestions list */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-fade-in divide-y divide-gray-100 dark:divide-zinc-800/80 max-h-60 overflow-y-auto">
          {results.map((city) => (
            <button
              key={`${city.id}-${city.latitude}`}
              type="button"
              onClick={() => {
                onSelectCity(city);
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="font-semibold text-sm text-gray-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {city.name}
                </span>
                {city.admin1 && (
                  <span className="text-xs text-gray-500 dark:text-zinc-400 ml-2">
                    {city.admin1}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200/50 dark:border-zinc-700/50">
                {city.country_code || city.country}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Input validations & errors */}
      {error && (
        <div className="mt-2 text-xs text-rose-500 flex items-center gap-1.5 px-1 font-medium bg-rose-50 dark:bg-rose-950/20 py-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
