import { Heart, Star } from 'lucide-react';
import { CitySearchResult } from '../types';

interface FavoriteCitiesProps {
  favorites: CitySearchResult[];
  currentCity: CitySearchResult | null;
  onSelectCity: (city: CitySearchResult) => void;
  onToggleFavorite: (city: CitySearchResult) => void;
}

export default function FavoriteCities({ favorites, currentCity, onSelectCity, onToggleFavorite }: FavoriteCitiesProps) {
  const isCurrentFavorite = currentCity && favorites.some(fav => fav.id === currentCity.id);

  return (
    <div className="w-full flex flex-col gap-2.5" id="favorites-section">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 dark:text-cyan-100 uppercase tracking-wider flex items-center gap-1.5">
          <Star size={12} className="text-amber-500 animate-pulse" />
          Favorite Cities
        </span>

        {currentCity && (
          <button
            onClick={() => onToggleFavorite(currentCity)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
              isCurrentFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/15 dark:border-rose-300/20 dark:text-rose-200'
                : 'bg-white border-gray-200 dark:bg-slate-900/90 dark:border-cyan-300/15 text-gray-600 dark:text-cyan-100 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-slate-800'
            }`}
          >
            <Heart size={12} className={isCurrentFavorite ? 'fill-current' : ''} />
            {isCurrentFavorite ? 'Favorited' : 'Add to Favorites'}
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="text-xs text-gray-400 dark:text-slate-300 italic py-2">
          No favorite locations saved. Tap "Add to Favorites" above to pin items here.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {favorites.map((city) => {
            const isActive = currentCity && currentCity.id === city.id;
            return (
              <div
                key={`fav-${city.id}-${city.latitude}`}
                className={`relative group rounded-xl p-2.5 border transition-all flex flex-col justify-between items-start cursor-pointer hover:shadow-sm ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/40 dark:border-cyan-300/30 dark:bg-cyan-400/12'
                    : 'border-gray-200 dark:border-cyan-300/15 bg-white/70 dark:bg-slate-900/75 hover:bg-white dark:hover:bg-slate-800/90'
                }`}
                onClick={() => onSelectCity(city)}
              >
                <div className="w-full flex justify-between items-start gap-1">
                  <span className="font-semibold text-xs text-gray-900 dark:text-white truncate leading-tight">
                    {city.name}
                  </span>
                  
                  {/* Small absolute top delete heart indicator */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(city);
                    }}
                    className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 opacity-60 hover:opacity-100 transition-opacity p-0.5"
                    title="Remove Favorite"
                  >
                    <Heart size={10} className="fill-current" />
                  </button>
                </div>
                
	                <span className="text-[10px] text-gray-500 dark:text-slate-300 truncate mt-1">
                  {city.admin1 || city.country}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
