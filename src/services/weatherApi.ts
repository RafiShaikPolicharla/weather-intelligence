import { WeatherData, CitySearchResult, CurrentWeather, HourlyForecastItem, DailyForecastItem } from '../types';

/**
 * Searches for cities by name using Open-Meteo Geocoding API.
 */
export async function searchCities(query: string): Promise<CitySearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error("City name cannot be empty.");
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to search city due to network error.");
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return [];
    }

    return data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || '',
      country_code: item.country_code,
      admin1: item.admin1,
      timezone: item.timezone
    }));
  } catch (error) {
    console.error("Geocoding API error:", error);
    throw error instanceof Error ? error : new Error("An unexpected error occurred while searching.");
  }
}

/**
 * Fetches weather forecast data for coordinates using Open-Meteo Forecast API.
 */
export async function fetchWeatherForCity(city: CitySearchResult): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch weather forecast data.");
    }

    const data = await response.json();
    
    // Parse current weather
    const current: CurrentWeather = {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      relativeHumidity: data.current.relative_humidity_2m,
      apparentTemperature: data.current.apparent_temperature,
      isDay: data.current.is_day === 1,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m
    };

    // Parse hourly weather (take next 24 elements for a full day)
    const hourly: HourlyForecastItem[] = [];
    const hourlyTimes = data.hourly.time || [];
    // We want to slice starting from current weather hour or next 24 elements starting close to now.
    // Standard hourly outputs 168 elements, we can just grab the first 24 or filter by current hour.
    // Let's filter elements that are from current hour onwards, up to 24 hours.
    const currentTimeMs = new Date(data.current.time).getTime();
    let startIndex = hourlyTimes.findIndex((t: string) => new Date(t).getTime() >= currentTimeMs);
    if (startIndex === -1) {
      startIndex = 0;
    }
    
    const count = Math.min(24, hourlyTimes.length - startIndex);
    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      hourly.push({
        time: data.hourly.time[idx],
        temperature: data.hourly.temperature_2m[idx],
        precipitationProbability: data.hourly.precipitation_probability[idx] ?? 0,
        weatherCode: data.hourly.weather_code[idx],
        windSpeed: data.hourly.wind_speed_10m[idx],
        humidity: data.hourly.relative_humidity_2m[idx] ?? 0
      });
    }

    // Parse daily forecast (7 days)
    const daily: DailyForecastItem[] = [];
    const dailyTimes = data.daily.time || [];
    const dailyCount = Math.min(7, dailyTimes.length);
    for (let i = 0; i < dailyCount; i++) {
      daily.push({
        date: data.daily.time[i],
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        weatherCode: data.daily.weather_code[i],
        precipitationProbability: data.daily.precipitation_probability_max[i] ?? 0,
        windSpeedMax: data.daily.wind_speed_10m_max[i]
      });
    }

    return {
      city,
      current,
      hourly,
      daily,
      timezone: data.timezone || city.timezone || 'UTC'
    };
  } catch (error) {
    console.error("Forecast API error:", error);
    throw error instanceof Error ? error : new Error("Failed to fetch weather forecast data.");
  }
}

/**
 * Resolves a city description (e.g. coordinates name) when browser Geolocation is used
 */
export function getCityFromCoordinates(lat: number, lon: number): CitySearchResult {
  return {
    id: Math.floor(lat * 1000 + lon * 1000), // temp pseudo ID
    name: `My Location`,
    latitude: lat,
    longitude: lon,
    country: `Coordinates: ${lat.toFixed(3)}, ${lon.toFixed(3)}`,
    admin1: "Browser Geolocation"
  };
}
