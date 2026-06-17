import { 
  Sun, 
  CloudSun, 
  Cloud, 
  CloudFog, 
  CloudDrizzle, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';

export interface WeatherConditionInfo {
  description: string;
  icon: LucideIcon;
  colorClass: string; // Tailwind bg gradient class
  themeColor: string; // for border/text highlights
  textMood: string;   // e.g. sunny, stormy, etc.
}

export function getWeatherCondition(code: number): WeatherConditionInfo {
  // 0: Clear sky
  if (code === 0) {
    return {
      description: "Clear Sky",
      icon: Sun,
      colorClass: "from-amber-400 to-orange-500",
      themeColor: "amber-500",
      textMood: "sunny"
    };
  }
  
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if (code === 1) {
    return {
      description: "Mainly Clear",
      icon: CloudSun,
      colorClass: "from-amber-300 to-sky-400",
      themeColor: "sky-400",
      textMood: "sunny"
    };
  }
  if (code === 2) {
    return {
      description: "Partly Cloudy",
      icon: CloudSun,
      colorClass: "from-sky-300 to-slate-400",
      themeColor: "slate-400",
      textMood: "cloudy"
    };
  }
  if (code === 3) {
    return {
      description: "Overcast",
      icon: Cloud,
      colorClass: "from-slate-400 to-slate-600",
      themeColor: "slate-500",
      textMood: "cloudy"
    };
  }
  
  // 45, 48: Fog and depositing rime fog
  if (code === 45 || code === 48) {
    return {
      description: "Foggy",
      icon: CloudFog,
      colorClass: "from-zinc-300 to-gray-500",
      themeColor: "gray-400",
      textMood: "foggy"
    };
  }
  
  // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
  if (code === 51 || code === 53 || code === 55) {
    return {
      description: "Drizzle",
      icon: CloudDrizzle,
      colorClass: "from-sky-400 to-indigo-500",
      themeColor: "indigo-400",
      textMood: "rainy"
    };
  }
  
  // 56, 57: Freezing Drizzle
  if (code === 56 || code === 57) {
    return {
      description: "Freezing Drizzle",
      icon: CloudSnow,
      colorClass: "from-sky-200 to-blue-400",
      themeColor: "blue-300",
      textMood: "snowy"
    };
  }
  
  // 61, 63, 65: Rain: Slight, moderate and heavy intensity
  if (code === 61 || code === 63 || code === 65) {
    const desc = code === 65 ? "Heavy Rain" : "Rain";
    return {
      description: desc,
      icon: CloudRain,
      colorClass: "from-blue-400 to-blue-700",
      themeColor: "blue-600",
      textMood: "rainy"
    };
  }
  
  // 66, 67: Freezing Rain
  if (code === 66 || code === 67) {
    return {
      description: "Freezing Rain",
      icon: CloudSnow,
      colorClass: "from-slate-300 to-blue-500",
      themeColor: "blue-400",
      textMood: "snowy"
    };
  }
  
  // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
  if (code === 71 || code === 73 || code === 75) {
    const desc = code === 75 ? "Heavy Snow" : "Snowfall";
    return {
      description: desc,
      icon: CloudSnow,
      colorClass: "from-blue-100 to-slate-300",
      themeColor: "slate-300",
      textMood: "snowy"
    };
  }
  
  // 77: Snow grains
  if (code === 77) {
    return {
      description: "Snow Grains",
      icon: CloudSnow,
      colorClass: "from-zinc-100 to-slate-400",
      themeColor: "zinc-400",
      textMood: "snowy"
    };
  }
  
  // 80, 81, 82: Rain showers: Slight, moderate, and violent
  if (code === 80 || code === 81 || code === 82) {
    return {
      description: "Rain Showers",
      icon: CloudRain,
      colorClass: "from-indigo-400 to-violet-600",
      themeColor: "violet-500",
      textMood: "rainy"
    };
  }
  
  // 85, 86: Snow showers slight and heavy
  if (code === 85 || code === 86) {
    return {
      description: "Snow Showers",
      icon: CloudSnow,
      colorClass: "from-blue-200 to-indigo-300",
      themeColor: "indigo-300",
      textMood: "snowy"
    };
  }
  
  // 95: Thunderstorm: Slight or moderate
  if (code === 95) {
    return {
      description: "Thunderstorm",
      icon: CloudLightning,
      colorClass: "from-slate-700 to-slate-900",
      themeColor: "slate-800",
      textMood: "stormy"
    };
  }
  
  // 96, 99: Thunderstorm with slight and heavy hail
  if (code === 96 || code === 99) {
    return {
      description: "Storm with Hail",
      icon: CloudLightning,
      colorClass: "from-slate-800 to-purple-950",
      themeColor: "purple-900",
      textMood: "stormy"
    };
  }
  
  // Fallback
  return {
    description: "Unknown",
    icon: HelpCircle,
    colorClass: "from-gray-400 to-gray-500",
    themeColor: "gray-500",
    textMood: "mild"
  };
}
