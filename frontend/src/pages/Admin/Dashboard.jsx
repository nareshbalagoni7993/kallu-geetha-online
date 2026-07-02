import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════
   WEATHER WIDGET
══════════════════════════════════════════════════ */

const WMO = {
  0:  { label: 'Clear Sky',       icon: '☀️',  bg: 'from-amber-400 via-orange-400 to-rose-400' },
  1:  { label: 'Mainly Clear',    icon: '🌤️',  bg: 'from-sky-300 via-amber-300 to-orange-400' },
  2:  { label: 'Partly Cloudy',   icon: '⛅',  bg: 'from-sky-400 via-slate-300 to-blue-400' },
  3:  { label: 'Overcast',        icon: '☁️',  bg: 'from-slate-400 via-gray-400 to-slate-500' },
  45: { label: 'Foggy',           icon: '🌫️',  bg: 'from-gray-300 via-slate-300 to-gray-400' },
  48: { label: 'Icy Fog',         icon: '🌫️',  bg: 'from-gray-300 via-slate-300 to-gray-400' },
  51: { label: 'Light Drizzle',   icon: '🌦️',  bg: 'from-blue-400 via-sky-400 to-indigo-400' },
  53: { label: 'Drizzle',         icon: '🌧️',  bg: 'from-blue-500 via-indigo-400 to-blue-600' },
  55: { label: 'Heavy Drizzle',   icon: '🌧️',  bg: 'from-indigo-500 via-blue-600 to-slate-600' },
  61: { label: 'Light Rain',      icon: '🌧️',  bg: 'from-blue-500 via-indigo-500 to-blue-700' },
  63: { label: 'Rain',            icon: '🌧️',  bg: 'from-blue-600 via-indigo-600 to-blue-800' },
  65: { label: 'Heavy Rain',      icon: '⛈️',  bg: 'from-indigo-700 via-purple-700 to-slate-800' },
  80: { label: 'Rain Showers',    icon: '🌦️',  bg: 'from-blue-500 via-indigo-500 to-blue-700' },
  81: { label: 'Showers',         icon: '🌦️',  bg: 'from-blue-500 via-indigo-500 to-blue-700' },
  82: { label: 'Heavy Showers',   icon: '⛈️',  bg: 'from-indigo-700 via-purple-700 to-slate-800' },
  95: { label: 'Thunderstorm',    icon: '⛈️',  bg: 'from-purple-700 via-indigo-800 to-gray-900' },
  96: { label: 'Thunderstorm',    icon: '⛈️',  bg: 'from-purple-700 via-indigo-800 to-gray-900' },
  99: { label: 'Hail Storm',      icon: '🌩️',  bg: 'from-purple-800 via-slate-800 to-gray-900' },
};
const getWmo = (code) => {
  const exact = WMO[code];
  if (exact) return exact;
  // round down to nearest group
  const groups = [99,96,95,82,81,80,65,63,61,55,53,51,48,45,3,2,1,0];
  for (const g of groups) { if (code >= g) return WMO[g]; }
  return { label: 'Unknown', icon: '🌡️', bg: 'from-gray-400 to-gray-600' };
};

const businessTip = (code, temp, rainProb) => {
  if (code >= 95) return { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', icon: '⛈️',
    msg: 'Severe weather! Deliveries may be disrupted. Alert customers proactively.' };
  if (code >= 61 || rainProb > 70) return { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', icon: '🌧️',
    msg: 'Heavy rain — indoor orders will rise. Consider rain-day discount promotions!' };
  if (code >= 51 || rainProb > 40) return { color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', icon: '🌦️',
    msg: 'Drizzly weather — customers prefer delivery. Stock up & ensure fast service.' };
  if (temp >= 38) return { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', icon: '🥵',
    msg: 'Extreme heat! Palm water & chilled toddy demand will be very HIGH. Restock now!' };
  if (temp >= 33) return { color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: '🔥',
    msg: 'Hot day! Palm water & ice products in peak demand. Perfect sales weather.' };
  if (temp >= 26) return { color: '#15803d', bg: '#dcfce7', border: '#86efac', icon: '🌟',
    msg: 'Excellent toddy weather! Warm & pleasant — expect strong sales today.' };
  if (temp < 18)  return { color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', icon: '🌡️',
    msg: 'Cool day — warm toddy drinks may see higher demand. Promote hot beverages.' };
  return { color: '#15803d', bg: '#dcfce7', border: '#86efac', icon: '✨',
    msg: 'Good weather for business! Comfortable conditions for customers & deliveries.' };
};

function WeatherWidget({ shopLat, shopLng }) {
  const [weather, setWeather]   = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const fetchWeather = useCallback(async (lat, lng) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
        + `&current_weather=true`
        + `&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,windspeed_10m,weathercode`
        + `&timezone=Asia%2FKolkata&forecast_days=1`;
      const res  = await fetch(url);
      const data = await res.json();

      // find current hour index
      const nowStr = new Date().toISOString().substring(0, 13) + ':00';
      const idx = (data.hourly?.time || []).findIndex((t) => t === nowStr);
      const safeIdx = idx >= 0 ? idx : 0;

      setWeather({
        temp:       Math.round(data.current_weather.temperature),
        windspeed:  Math.round(data.current_weather.windspeed),
        code:       data.current_weather.weathercode,
        humidity:   data.hourly?.relativehumidity_2m?.[safeIdx] ?? '—',
        rainProb:   data.hourly?.precipitation_probability?.[safeIdx] ?? 0,
        // next 5 hours
        forecast: Array.from({ length: 5 }, (_, k) => {
          const fi = safeIdx + k + 1;
          const time = data.hourly?.time?.[fi];
          return {
            hour:  time ? new Date(time).toLocaleTimeString('en-IN', { hour: '2-digit', hour12: true }) : '',
            temp:  Math.round(data.hourly?.temperature_2m?.[fi] ?? 0),
            code:  data.hourly?.weathercode?.[fi] ?? 0,
            rain:  data.hourly?.precipitation_probability?.[fi] ?? 0,
          };
        }).filter((f) => f.hour),
      });
    } catch {
      setError('Could not load weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } });
      const d = await r.json();
      const a = d.address || {};
      setLocation([a.city || a.town || a.village || a.county, a.state].filter(Boolean).join(', '));
    } catch { setLocation(''); }
  }, []);

  useEffect(() => {
    const tryGeo = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords: c }) => {
            reverseGeocode(c.latitude, c.longitude);
            fetchWeather(c.latitude, c.longitude);
          },
          () => {
            if (shopLat && shopLng && shopLat !== 0) {
              fetchWeather(shopLat, shopLng);
              reverseGeocode(shopLat, shopLng);
            } else {
              setError('Enable location to see weather');
              setLoading(false);
            }
          }
        );
      } else if (shopLat && shopLat !== 0) {
        fetchWeather(shopLat, shopLng);
        reverseGeocode(shopLat, shopLng);
      } else {
        setError('Location not available');
        setLoading(false);
      }
    };
    tryGeo();
  }, [shopLat, shopLng, fetchWeather, reverseGeocode]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 p-5 text-white animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-24 h-3 bg-white/30 rounded" />
        </div>
        <div className="w-16 h-10 bg-white/30 rounded mb-2" />
        <div className="w-32 h-3 bg-white/20 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-400 to-gray-600 p-5 text-white">
        <p className="font-semibold">🌡️ Weather</p>
        <p className="text-sm opacity-75 mt-1">{error}</p>
        <p className="text-xs opacity-60 mt-1">Allow location access or set shop GPS coordinates.</p>
      </div>
    );
  }

  if (!weather) return null;

  const wmo  = getWmo(weather.code);
  const tip  = businessTip(weather.code, weather.temp, weather.rainProb);

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${wmo.bg} text-white shadow-xl overflow-hidden`}>
      {/* Top Section */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs">📍</span>
              <span className="text-xs font-medium opacity-90">{location || 'Your Location'}</span>
            </div>
            <p className="text-sm font-semibold opacity-80">Live Weather Report</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] opacity-70 mb-0.5">Updated now</div>
            <div className="text-xs font-semibold opacity-90">{wmo.label}</div>
          </div>
        </div>

        {/* Main temp + icon */}
        <div className="flex items-center gap-4">
          <div className="text-7xl sm:text-8xl leading-none drop-shadow-lg">{wmo.icon}</div>
          <div>
            <div className="text-5xl sm:text-6xl font-black leading-none">
              {weather.temp}°<span className="text-3xl font-semibold opacity-80">C</span>
            </div>
            <p className="text-sm opacity-80 mt-1">{wmo.label}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5">
            <span className="text-base">💨</span>
            <div>
              <p className="text-xs opacity-75">Wind</p>
              <p className="text-sm font-bold">{weather.windspeed} km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5">
            <span className="text-base">💧</span>
            <div>
              <p className="text-xs opacity-75">Humidity</p>
              <p className="text-sm font-bold">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5">
            <span className="text-base">🌧️</span>
            <div>
              <p className="text-xs opacity-75">Rain</p>
              <p className="text-sm font-bold">{weather.rainProb}%</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 rounded-xl px-3 py-1.5">
            <span className="text-base">🌡️</span>
            <div>
              <p className="text-xs opacity-75">Feels</p>
              <p className="text-sm font-bold">{weather.temp > 0 ? `${weather.temp}°` : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Insight */}
      <div className="mx-4 mb-4 rounded-xl p-3" style={{ backgroundColor: tip.bg, border: `1px solid ${tip.border}` }}>
        <div className="flex items-start gap-2">
          <span className="text-lg flex-shrink-0">{tip.icon}</span>
          <div>
            <p className="text-xs font-bold" style={{ color: tip.color }}>Business Impact</p>
            <p className="text-xs mt-0.5" style={{ color: tip.color, opacity: 0.85 }}>{tip.msg}</p>
          </div>
        </div>
      </div>

      {/* Hourly forecast */}
      {weather.forecast?.length > 0 && (
        <div className="bg-black/20 px-4 py-3">
          <p className="text-[10px] opacity-60 mb-2 uppercase tracking-wide font-semibold">Next Hours</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {weather.forecast.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1 bg-white/10 rounded-xl px-3 py-2 flex-shrink-0 min-w-[52px]">
                <span className="text-[10px] opacity-70">{f.hour}</span>
                <span className="text-base">{getWmo(f.code).icon}</span>
                <span className="text-sm font-bold">{f.temp}°</span>
                {f.rain > 0 && <span className="text-[9px] text-blue-200">{f.rain}%💧</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CHART COMPONENTS
══════════════════════════════════════════════════ */

function BarChart({ data, color = '#15803d', accent = '#d97706' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const N = data.length, W = N * 24, H = 80;
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full" style={{ height: 110 }}>
      {data.map((d, i) => {
        const bh = Math.max((d.value / max) * H * 0.85, d.value > 0 ? 3 : 1);
        const x  = i * 24 + 4; const y = H - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={16} height={bh} fill={d.value > 0 ? color : '#e5e7eb'} rx="3" opacity="0.9" />
            {d.value > 0 && (
              <text x={x + 8} y={y - 3} textAnchor="middle" fontSize="5.5" fill={accent} fontWeight="600">
                {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
              </text>
            )}
            <text x={x + 8} y={H + 14} textAnchor="middle" fontSize="6" fill="#9ca3af">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, color = '#d97706' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const N = data.length, W = 100, H = 60;
  if (N < 2) return null;
  const pts = data.map((d, i) => {
    const x = (i / (N - 1)) * W;
    const y = H - (d.value / max) * H * 0.8 - H * 0.1;
    return [x, y];
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 14}`} className="w-full" style={{ height: 90 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#lg)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={data[i].value > 0 ? 2.5 : 0} fill={color} />)}
      {data.map((d, i) => {
        const x = (i / (N - 1)) * (W - 8) + 2;
        return <text key={i} x={x} y={H + 12} textAnchor="middle" fontSize="6" fill="#9ca3af">{d.label}</text>;
      })}
    </svg>
  );
}

function GrowthBadge({ value }) {
  if (value === null || value === undefined) return <span className="text-xs text-gray-400">—</span>;
  const v = parseFloat(value), up = v >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {up ? '▲' : '▼'} {Math.abs(v)}%
    </span>
  );
}

function KpiCard({ title, value, sub, icon, gradient, growth }) {
  return (
    <div className={`rounded-2xl p-4 text-white shadow-lg ${gradient}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {growth !== undefined && <GrowthBadge value={growth} />}
      </div>
      <p className="text-xl sm:text-2xl font-bold leading-tight">{value}</p>
      <p className="text-sm opacity-80 mt-0.5">{title}</p>
      {sub && <p className="text-[11px] opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

const timeAgo = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

/* ══════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    API.get('/admin/dashboard').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const testNotif = async () => {
    setTesting(true);
    try {
      await API.post('/admin/test-notification');
      toast.success('Test notification sent! Check the bell 🔔');
    } catch { toast.error('Failed to send test notification'); }
    finally { setTesting(false); }
  };

  if (loading) return <Spinner size="lg" />;

  if (!data?.hasShop) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Complete Your Shop Setup</h2>
        <p className="text-gray-500 mb-6">Add your shop details and go live</p>
        <Link to="/admin/shop" className="btn-primary text-base px-6 py-3">Setup Shop →</Link>
      </div>
    );
  }

  const codData    = data.paymentBreakdown?.find((p) => p._id === 'cod');
  const onlineData = data.paymentBreakdown?.find((p) => p._id !== 'cod');
  const statusList = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
  const statusCfg  = {
    pending:          { color: 'bg-yellow-400', label: '⏳ Pending' },
    confirmed:        { color: 'bg-blue-400',   label: '✅ Confirmed' },
    preparing:        { color: 'bg-purple-400', label: '🍺 Preparing' },
    out_for_delivery: { color: 'bg-orange-400', label: '🛵 Out for Delivery' },
    delivered:        { color: 'bg-green-500',  label: '🎉 Delivered' },
    cancelled:        { color: 'bg-red-400',    label: '❌ Cancelled' },
  };

  return (
    <div className="space-y-5">

      {/* ── Shop Header ── */}
      <div className="rounded-2xl overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)' }}>
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 flex-shrink-0 shadow">
              {data.shop?.image
                ? <img src={data.shop.image} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-amber-600 flex items-center justify-center text-2xl">🏪</div>}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{data.shop?.name}</h1>
              <p className="text-amber-200 text-sm">📍 {data.shop?.address?.city}</p>
              <p className="text-amber-300 text-xs mt-0.5">
                🕒 {data.shop?.deliveryTime} min · 🚚 {data.shop?.deliveryCharge > 0 ? `₹${data.shop.deliveryCharge}` : 'Free delivery'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${data.shop?.isOpen ? 'bg-green-400 text-green-900' : 'bg-red-400 text-white'}`}>
              {data.shop?.isOpen ? '● Open' : '● Closed'}
            </span>
            <button onClick={testNotif} disabled={testing}
              className="text-[10px] text-amber-200 hover:text-white border border-amber-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50">
              {testing ? '...' : '🔔 Test Notif'}
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Total Revenue"  value={`₹${(data.totalRevenue||0).toLocaleString()}`}    icon="💰" gradient="bg-gradient-to-br from-green-600 to-green-800" />
        <KpiCard title="This Week"      value={`₹${(data.thisWeekRevenue||0).toLocaleString()}`} icon="📈" gradient="bg-gradient-to-br from-amber-600 to-amber-800"
          growth={data.revenueGrowth} sub={`vs ₹${(data.lastWeekRevenue||0).toLocaleString()} last week`} />
        <KpiCard title="Total Orders"   value={data.totalOrders}   icon="📦" gradient="bg-gradient-to-br from-blue-600 to-blue-800" />
        <KpiCard title="Pending Orders" value={data.pendingOrders} icon="⏳" gradient="bg-gradient-to-br from-orange-500 to-orange-700" growth={data.ordersGrowth} />
      </div>

      {/* ── Weather + Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Weather Widget — 2 cols */}
        <div className="lg:col-span-2">
          <WeatherWidget
            shopLat={data.shop?.address?.lat}
            shopLng={data.shop?.address?.lng}
          />
        </div>

        {/* Charts — 3 cols */}
        <div className="lg:col-span-3 space-y-5">
          {/* Daily Revenue */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-bold text-gray-800">📊 Last 7 Days Revenue</h2>
                <p className="text-xs text-gray-400">Daily sales breakdown</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-700">₹{(data.thisWeekRevenue||0).toLocaleString()}</p>
                <GrowthBadge value={data.revenueGrowth} />
              </div>
            </div>
            <BarChart data={data.dailyChart || []} color="#15803d" accent="#d97706" />
          </div>

          {/* Monthly Trend */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-bold text-gray-800">📉 6-Month Revenue Trend</h2>
                <p className="text-xs text-gray-400">Monthly performance overview</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-amber-700">₹{(data.totalRevenue||0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">all time</p>
              </div>
            </div>
            <LineChart data={data.monthlyChart || []} color="#d97706" />
          </div>
        </div>
      </div>

      {/* ── Week Comparison + Order Funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Week vs Week */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">📅 Week-over-Week</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 font-medium">This Week</p>
                <p className="text-2xl font-bold text-green-700">₹{(data.thisWeekRevenue||0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{data.thisWeekOrders} orders</p>
              </div>
              <GrowthBadge value={data.revenueGrowth} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 font-medium">Last Week</p>
                <p className="text-2xl font-bold text-gray-500">₹{(data.lastWeekRevenue||0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{data.lastWeekOrders} orders</p>
              </div>
            </div>
            <div className="pt-1 border-t flex gap-2">
              <div className="flex-1 bg-amber-50 rounded-xl p-2.5 text-center">
                <p className="font-bold text-amber-700">💵 ₹{(codData?.total||0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">COD · {codData?.count || 0} orders</p>
              </div>
              <div className="flex-1 bg-blue-50 rounded-xl p-2.5 text-center">
                <p className="font-bold text-blue-700">📱 ₹{(onlineData?.total||0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Online · {onlineData?.count || 0} orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Funnel */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">🔄 Order Status Breakdown</h2>
          <div className="space-y-2.5">
            {statusList.map((s) => {
              const count = data.statusBreakdown?.[s] || 0;
              const pct   = data.totalOrders > 0 ? Math.round((count / data.totalOrders) * 100) : 0;
              const cfg   = statusCfg[s];
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{cfg.label}</span>
                    <span className="font-bold text-gray-800">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${cfg.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Stock Overview ── */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">📦 Stock Overview</h2>
          <Link to="/admin/products" className="text-primary text-sm hover:underline font-medium">Manage →</Link>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{data.totalStockQty || 0}</p>
            <p className="text-xs text-green-600 mt-0.5">Total Units</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-700">₹{(data.totalStockValue||0).toLocaleString()}</p>
            <p className="text-xs text-amber-600 mt-0.5">Stock Value</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{data.outOfStockCount || 0}</p>
            <p className="text-xs text-red-500 mt-0.5">Out of Stock</p>
          </div>
        </div>
        {data.lowStockProducts?.length > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl mb-3 flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-semibold text-orange-700">⚠️ Low Stock:</span>
            {data.lowStockProducts.map((p) => (
              <span key={p._id} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                {p.name} ({p.stockQty})
              </span>
            ))}
          </div>
        )}
        {data.allProducts?.length > 0 && (
          <div className="overflow-auto max-h-44">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left pb-2">Product</th>
                  <th className="text-right pb-2">Price</th>
                  <th className="text-right pb-2">Qty</th>
                  <th className="text-right pb-2">Value</th>
                  <th className="text-right pb-2">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.allProducts.map((p) => (
                  <tr key={p._id} className={p.stockQty === 0 ? 'opacity-40' : ''}>
                    <td className="py-1.5 font-medium text-gray-800 max-w-[110px] truncate">{p.name}</td>
                    <td className="py-1.5 text-right text-gray-600">₹{p.price}</td>
                    <td className={`py-1.5 text-right font-bold ${p.stockQty <= 5 && p.stockQty > 0 ? 'text-orange-500' : p.stockQty === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                      {p.stockQty || 0}{p.stockQty > 0 && p.stockQty <= 5 && ' ⚠'}
                    </td>
                    <td className="py-1.5 text-right text-gray-600">₹{((p.stockQty||0)*p.price).toLocaleString()}</td>
                    <td className="py-1.5 text-right">
                      <span className={p.inStock ? 'text-green-600 font-bold' : 'text-red-500'}>{p.inStock ? '✓' : '✗'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recent Orders ── */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">🕐 Recent Orders</h2>
          <Link to="/admin/orders" className="text-primary text-sm hover:underline font-medium">View all →</Link>
        </div>
        {data.recentOrders?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {data.recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-800 flex-shrink-0">
                    {o.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{o.user?.name}</p>
                    <p className="text-gray-400 text-xs">{o.items?.length} item(s) · {timeAgo(o.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-bold text-sm">₹{o.grandTotal}</p>
                  <OrderStatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
