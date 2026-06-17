import { WeatherData } from '../types';

export interface WeatherRecommendation {
  type: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  title: string;
  suggestion: string;
}

export interface PlanningInsights {
  recommendations: WeatherRecommendation[];
  alerts: {
    type: 'heat' | 'cold' | 'rain' | 'wind' | 'storm' | 'none';
    severity: 'info' | 'warning' | 'danger';
    title: string;
    message: string;
  }[];
  activityScore: number; // 0 to 100 for overall comfort
  activityText: string;
}

export function generateInsights(data: WeatherData): PlanningInsights {
  const current = data.current;
  const temp = current.temperature;
  const rainProb = data.daily[0]?.precipitationProbability ?? 0;
  const prec = current.precipitation;
  const wind = current.windSpeed;
  const code = current.weatherCode;

  const recommendations: WeatherRecommendation[] = [];
  const alerts: PlanningInsights['alerts'] = [];

  // Comfort & Activity Score Calculation (out of 100)
  let score = 90;
  
  // Temperature penalties
  if (temp > 32) score -= 25;
  else if (temp > 28) score -= 10;
  else if (temp < 10) score -= 25;
  else if (temp < 16) score -= 10;
  
  // Rain penalties
  if (prec > 5 || rainProb > 70) score -= 45;
  else if (prec > 0 || rainProb > 30) score -= 20;

  // Wind penalties
  if (wind > 35) score -= 30;
  else if (wind > 20) score -= 10;

  // Storm/Severe code penalties
  const isStormCode = [95, 96, 99].includes(code);
  const isSevereRainSnow = [65, 75, 82].includes(code);
  
  if (isStormCode) score -= 60;
  else if (isSevereRainSnow) score -= 40;

  score = Math.max(0, Math.min(100, score));

  let activityText = "Ideal conditions for outdoor events!";
  if (score < 30) {
    activityText = "Avoid outdoors. Stay comfortable inside.";
  } else if (score < 55) {
    activityText = "Unfavorable conditions. Indoor plans recommended.";
  } else if (score < 75) {
    activityText = "Moderate comfort. Bring appropriate clothing.";
  }

  // 1. Temperature-based planning
  if (temp >= 30) {
    recommendations.push({
      type: 'warning',
      title: 'High Temperature Action',
      suggestion: 'Stay hydrated, limit exposure under direct sunshine, and seek air-conditioned environments.'
    });
    alerts.push({
      type: 'heat',
      severity: temp >= 35 ? 'danger' : 'warning',
      title: temp >= 35 ? 'Extreme Heat Warning' : 'High Heat Advisory',
      message: `The current temperature is ${temp}°C. Reduce heavy outdoor exercises and drink plenty of fluids.`
    });
  } else if (temp <= 10) {
    recommendations.push({
      type: 'info',
      title: 'Cold Layering Alert',
      suggestion: 'Consider wearing a dense winter coat, thermal layers, and keep extremities insulated.'
    });
    alerts.push({
      type: 'cold',
      severity: temp <= 2 ? 'danger' : 'info',
      title: temp <= 2 ? 'Freezing Temperatures' : 'Cold Weather Advisory',
      message: `A temperature of ${temp}°C is observed. Frost or wind chill may occur; dress in insulating layers.`
    });
  }

  // 2. Precipitation & Humidity based planning
  if (prec > 0 || rainProb >= 45) {
    recommendations.push({
      type: 'danger',
      title: 'Precipitation Gear Required',
      suggestion: 'Carry a heavy-duty umbrella, wear waterproof or water-repellent footwear, and slow down your commute.'
    });
    alerts.push({
      type: 'rain',
      severity: prec > 2.5 || rainProb > 75 ? 'warning' : 'info',
      title: 'Active Precipitation / Rain Risk',
      message: `Precipitation probability is peaking at ${rainProb}%. Wet roads and dynamic flight delays are typical.`
    });
  }

  // 3. Wind speed planning
  if (wind >= 24) {
    recommendations.push({
      type: 'warning',
      title: 'Caution: Strong Winds',
      suggestion: 'Secure light outdoor equipment, watch for flying debris, and brace yourself if cycling.'
    });
    alerts.push({
      type: 'wind',
      severity: wind >= 40 ? 'danger' : 'warning',
      title: wind >= 40 ? 'Gale Force Winds' : 'Breezy Weather Advisory',
      message: `Wind gusts are around ${wind} km/h. Outdoor structures may sway, and high vehicles should take caution.`
    });
  }

  // 4. Storms or special severe weather
  if (isStormCode) {
    recommendations.push({
      type: 'danger',
      title: 'Severe Thunderstorm Plan',
      suggestion: 'Stay entirely indoors, avoid tall metal structures, separate dynamic chargers, and unplug precious appliances.'
    });
    alerts.push({
      type: 'storm',
      severity: 'danger',
      title: 'Severe Storm Alert',
      message: 'Active lightning strikes and heavy downpours detected. Avoid maritime, aviation, or surface travel.'
    });
  }

  // Mild weather success recommendation
  if (temp >= 16 && temp <= 26 && prec === 0 && rainProb < 25 && wind < 20) {
    recommendations.push({
      type: 'success',
      title: 'Fantastic Weather conditions',
      suggestion: 'Mild temperatures and gentle winds are perfect for cycling, running, sports, or outdoor dining.'
    });
  }

  return {
    recommendations: recommendations.length > 0 ? recommendations : [{
      type: 'neutral',
      title: 'Moderate Weather',
      suggestion: 'No extreme risks. Dress for standard local comfort and proceed with daily plans.'
    }],
    alerts,
    activityScore: score,
    activityText
  };
}
