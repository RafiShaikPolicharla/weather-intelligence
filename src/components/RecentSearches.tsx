import { Clock, Trash2 } from 'lucide-react';
import { CitySearchResult } from '../types';

interface RecentSearchesProps {
  searches: CitySearchResult[];
  onSelectCity: (city: CitySearchResult) => void;
  onClear: () => void;
}

export default function RecentSearches({ searches, onSelectCity, onClear }: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2" id="recent-searches">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={12} />
          Recent Searches
        </span>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-0.5"
          title="Clear search history"
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((city) => (
          <button
            key={`recent-${city.id}-${city.latitude}`}
            onClick={() => onSelectCity(city)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-150 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 text-gray-700 dark:text-zinc-350 hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs"
          >
            <span>{city.name}</span>
            <span className="opacity-60 text-[10px] bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded uppercase">
              {city.country_code || (city.country.length > 5 ? city.country.substring(0, 3) : city.country)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
