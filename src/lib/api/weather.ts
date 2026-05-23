const WEATHER_MOODS: Record<number, { label: string; query: string }> = {
  0: { label: 'Clear skies', query: 'chill sunny pop' },
  1: { label: 'Mostly clear', query: 'indie folk' },
  2: { label: 'Partly cloudy', query: 'indie rock' },
  3: { label: 'Overcast', query: 'ambient post rock' },
  45: { label: 'Foggy', query: 'ambient electronic' },
  48: { label: 'Freezing fog', query: 'ambient classical' },
  51: { label: 'Light drizzle', query: 'jazz lofi' },
  53: { label: 'Moderate drizzle', query: 'rainy day jazz' },
  55: { label: 'Heavy drizzle', query: 'smooth jazz' },
  61: { label: 'Light rain', query: 'lofi beats' },
  63: { label: 'Moderate rain', query: 'chill lofi' },
  65: { label: 'Heavy rain', query: 'rain lofi' },
  71: { label: 'Light snow', query: 'winter acoustic' },
  73: { label: 'Moderate snow', query: 'cozy folk' },
  75: { label: 'Heavy snow', query: 'christmas jazz' },
  80: { label: 'Slight rain showers', query: 'indie pop' },
  81: { label: 'Moderate rain showers', query: 'pop rock' },
  82: { label: 'Violent rain showers', query: 'rock energetic' },
  95: { label: 'Thunderstorm', query: 'metal hard rock' },
};

export interface WeatherData {
  temp: number;
  condition: string;
  code: number;
  location: string;
  songMood: string;
  isDay: boolean;
  icon: string;
  high: number;
  low: number;
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '01d';
  if (code <= 2) return '02d';
  if (code === 3) return '04d';
  if (code >= 45 && code <= 48) return '50d';
  if (code >= 51 && code <= 55) return '09d';
  if (code >= 61 && code <= 65) return '10d';
  if (code >= 71 && code <= 75) return '13d';
  if (code >= 80 && code <= 82) return '09d';
  if (code >= 95) return '11d';
  return '03d';
}

export async function getWeather(): Promise<WeatherData | null> {
  try {
    // Try cached first
    const cached = localStorage.getItem('chillpill_weather');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < 10 * 60 * 1000) return parsed.data;
    }

    // Get position
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000, enableHighAccuracy: false,
      });
    });

    const { latitude, longitude } = pos.coords;

    // Reverse geocode via free OSM API
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
      { headers: { 'User-Agent': 'ChillPill/1.0' }, signal: AbortSignal.timeout(5000) }
    );
    const geo = await geoRes.json();
    const loc = geo.address?.city || geo.address?.town || geo.address?.county || 'Your area';

    // Open-Meteo forecast (free, no key)
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&timezone=auto&forecast_days=1`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();

    const code = data.current?.weather_code ?? 0;
    const mood = WEATHER_MOODS[code] || WEATHER_MOODS[0];

    const weather: WeatherData = {
      temp: Math.round(data.current?.temperature_2m ?? 0),
      condition: mood.label,
      code,
      location: loc,
      songMood: mood.query,
      isDay: data.current?.is_day === 1,
      icon: getWeatherIcon(code),
      high: Math.round(data.daily?.temperature_2m_max?.[0] ?? 0),
      low: Math.round(data.daily?.temperature_2m_min?.[0] ?? 0),
    };

    localStorage.setItem('chillpill_weather', JSON.stringify({ data: weather, ts: Date.now() }));
    return weather;
  } catch {
    // Return cached even if stale
    try {
      const cached = localStorage.getItem('chillpill_weather');
      if (cached) return JSON.parse(cached).data;
    } catch {}
    return null;
  }
}