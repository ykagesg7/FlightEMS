import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';

// Load env: prefer server-specific file, then fallback to .env.local
const serverEnvPath = fs.existsSync('.env.server.local') ? '.env.server.local' : '.env.local';
dotenv.config({ path: serverEnvPath });

const app = express();
const PORT = Number(process.env.PORT || 3001);

// CORS
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin === '*' ? undefined : allowedOrigin }));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Weather endpoint (mirrors api/weather.ts)
app.get('/api/weather', async (req, res) => {
  const lat = req.query.lat as string | undefined;
  const lon = req.query.lon as string | undefined;

  if (!lat || !lon) {
    return res.status(400).json({ error: '緯度と経度が必要です', code: 'MISSING_PARAMS' });
  }

  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
    return res.status(400).json({ error: '緯度と経度は数値である必要があります', code: 'INVALID_NUMERIC_PARAMS' });
  }
  if (Math.abs(latNum) > 90 || Math.abs(lonNum) > 180) {
    return res.status(400).json({ error: '緯度は-90〜90、経度は-180〜180の範囲である必要があります', code: 'OUT_OF_RANGE' });
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '天気データの取得に失敗しました', code: 'API_KEY_MISSING', message: 'サーバー設定エラー' });
  }

  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latNum},${lonNum}&days=1&aqi=no`;
    const upstream = await fetch(url, { method: 'GET' as const });
    if (!upstream.ok) {
      const code = upstream.status === 401 ? 'API_KEY_INVALID' : upstream.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'UPSTREAM_ERROR';
      return res.status(500).json({ error: '天気データの取得に失敗しました', code, message: `外部APIエラー: ${upstream.status}` });
    }
    const data = await upstream.json();

    // Minimal filter (reuse server-side structure)
    const current = data.current;
    const forecast = data.forecast?.forecastday?.[0];
    const astro = forecast?.astro;

    const conditionMap: Record<string, string> = {
      'Sunny': '晴れ', 'Clear': '快晴', 'Partly cloudy': '晴れ時々曇り', 'Cloudy': '曇り', 'Overcast': '曇天',
      'Mist': '霧', 'Fog': '濃霧', 'Freezing fog': '着氷性霧', 'Patchy rain possible': '所により雨の可能性',
      'Patchy snow possible': '所により雪の可能性', 'Patchy sleet possible': '所によりみぞれの可能性',
      'Patchy freezing drizzle possible': '所により着氷性の霧雨の可能性', 'Thundery outbreaks possible': '雷雨の可能性',
      'Blowing snow': '吹雪', 'Blizzard': '猛吹雪', 'Rain': '雨', 'Light rain': '小雨', 'Moderate rain': '雨',
      'Heavy rain': '大雨', 'Light freezing rain': '弱い着氷性の雨', 'Moderate or heavy freezing rain': '中～強い着氷性の雨',
      'Light sleet': '弱いみぞれ', 'Moderate or heavy sleet': '中～強いみぞれ', 'Light snow': '小雪', 'Moderate snow': '雪',
      'Heavy snow': '大雪', 'Patchy light rain': '所により小雨', 'Patchy moderate rain': '所により雨', 'Patchy heavy rain': '所により大雨',
      'Patchy light snow': '所により小雪', 'Patchy moderate snow': '所により雪', 'Patchy heavy snow': '所により大雪'
    };

    const formatTime = (timeStr: string) => {
      if (!timeStr) return '';
      const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!match) return timeStr;
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };

    const filtered = {
      current: {
        condition: {
          text: current.condition.text,
          japanese: conditionMap[current.condition.text] || current.condition.text,
          icon: current.condition.icon,
        },
        temp_c: current.temp_c,
        wind: { degree: current.wind_degree, kph: current.wind_kph, knots: Math.round(current.wind_kph * 0.539957) },
        pressure: { mb: current.pressure_mb, inch: (current.pressure_mb * 0.02953).toFixed(2) },
        visibility_km: current.vis_km,
        humidity: current.humidity,
        last_updated: current.last_updated,
      },
      astronomy: astro ? { sunrise: formatTime(astro.sunrise), sunset: formatTime(astro.sunset) } : null,
      location: data.location,
    };

    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.json(filtered);
  } catch (err: any) {
    return res.status(500).json({ error: '天気データの取得に失敗しました', code: 'UNKNOWN_ERROR', message: err?.message || 'unknown' });
  }
});

app.listen(PORT, () => {
  console.log(`[dev-weather-server] listening on http://localhost:${PORT} (env: ${serverEnvPath})`);
});
