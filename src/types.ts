export interface CitySearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  relativeHumidity: number;
  apparentTemperature?: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

export interface DailyForecastItem {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number;
  windSpeedMax: number;
}

export interface WeatherData {
  city: CitySearchResult;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  timezone: string;
}

export type TempUnit = 'C' | 'F';
export type WindSpeedUnit = 'kmh' | 'mph';

export interface AppPreferences {
  tempUnit: TempUnit;
  windSpeedUnit: WindSpeedUnit;
  theme: 'light' | 'dark';
}
