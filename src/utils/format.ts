export function formatTemperature(celsius: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWindSpeed(kmh: number, unit: 'kmh' | 'mph'): string {
  if (unit === 'mph') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatTimeUTC(isoString: string, timezone: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + timezone.split('/').pop()?.replace('_', ' ') + ')';
  } catch {
    return 'Just now';
  }
}

export function formatDate(dateString: string): string {
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
    const d = new Date(dateString);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
}
