import axios from 'axios';
import { env } from '../config/env';

export interface WeatherData {
  city: string;
  zone: string;
  condition: 'clear' | 'light_rain' | 'moderate_rain' | 'heavy_rain' | 'red_alert';
  rainfall_mm: number;
  temperature: number;
  humidity: number;
  alert_level: string | null;
  description: string;
  timestamp: Date;
}

interface OpenWeatherResponse {
  weather: Array<{ id: number; main: string; description: string }>;
  main: { temp: number; humidity: number };
  rain?: { '1h'?: number; '3h'?: number };
  name: string;
}

function classifyWeather(data: OpenWeatherResponse): WeatherData['condition'] {
  const weatherId = data.weather[0]?.id ?? 800;
  const rainfall = data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0;

  // OpenWeather codes: 2xx thunderstorm, 3xx drizzle, 5xx rain, 9xx extreme
  if (weatherId >= 900 || rainfall > 50) return 'red_alert';
  if (weatherId >= 500 && weatherId < 510 && rainfall > 15) return 'heavy_rain';
  if (weatherId >= 500 && weatherId < 520 && rainfall > 5) return 'moderate_rain';
  if (weatherId >= 300 && weatherId < 600) return 'light_rain';
  return 'clear';
}

function mockWeatherData(city: string, zone: string): WeatherData {
  const rand = Math.random();
  let condition: WeatherData['condition'] = 'clear';
  let rainfall_mm = 0;
  let alert_level: string | null = null;

  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const isMonsoon = month >= 6 && month <= 9;
  const rainProbability = isMonsoon ? 0.45 : 0.1;

  if (rand < rainProbability * 0.05) {
    condition = 'red_alert';
    rainfall_mm = 55 + Math.random() * 50;
    alert_level = 'RED';
  } else if (rand < rainProbability * 0.2) {
    condition = 'heavy_rain';
    rainfall_mm = 16 + Math.random() * 39;
  } else if (rand < rainProbability * 0.5) {
    condition = 'moderate_rain';
    rainfall_mm = 6 + Math.random() * 9;
  } else if (rand < rainProbability) {
    condition = 'light_rain';
    rainfall_mm = 0.5 + Math.random() * 5;
  }

  return {
    city,
    zone,
    condition,
    rainfall_mm: parseFloat(rainfall_mm.toFixed(2)),
    temperature: 20 + Math.random() * 20,
    humidity: 50 + Math.random() * 40,
    alert_level,
    description: condition.replace('_', ' '),
    timestamp: new Date(),
  };
}

export async function getWeatherForCity(city: string, zone: string): Promise<WeatherData> {
  if (env.USE_MOCK_SERVICES || !env.OPENWEATHER_API_KEY) {
    return mockWeatherData(city, zone);
  }

  try {
    const response = await axios.get<OpenWeatherResponse>(
      `${env.OPENWEATHER_BASE_URL}/weather`,
      {
        params: {
          q: city,
          appid: env.OPENWEATHER_API_KEY,
          units: 'metric',
        },
        timeout: 5000,
      }
    );

    const data = response.data;
    const rainfall = data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0;
    const condition = classifyWeather(data);

    return {
      city: data.name,
      zone,
      condition,
      rainfall_mm: parseFloat(rainfall.toFixed(2)),
      temperature: data.main.temp,
      humidity: data.main.humidity,
      alert_level: condition === 'red_alert' ? 'RED' : null,
      description: data.weather[0]?.description ?? '',
      timestamp: new Date(),
    };
  } catch (err) {
    console.warn('[WeatherService] API call failed, using mock data:', err);
    return mockWeatherData(city, zone);
  }
}
