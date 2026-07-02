import { useEffect, useState, useCallback } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { useLang } from '../../context/LanguageContext';

/* ══════════════════════════════════════════════════
   WEATHER (reused from Admin dashboard)
══════════════════════════════════════════════════ */
const WMO = {
  0:  { label: 'Clear Sky',      icon: '☀️',  bg: 'from-amber-400 via-orange-400 to-rose-400' },
  1:  { label: 'Mainly Clear',   icon: '🌤️',  bg: 'from-sky-300 via-amber-300 to-orange-400' },
  2:  { label: 'Partly Cloudy',  icon: '⛅',  bg: 'from-sky-400 via-slate-300 to-blue-400' },
  3:  { label: 'Overcast',       icon: '☁️',  bg: 'from-slate-400 via-gray-400 to-slate-500' },
  51: { label: 'Drizzle',        icon: '🌦️',  bg: 'from-blue-400 via-sky-400 to-indigo-400' },
  61: { label: 'Rain',           icon: '🌧️',  bg: 'from-blue-600 via-indigo-600 to-blue-800' },
  65: { label: 'Heavy Rain',     icon: '⛈️',  bg: 'from-indigo-700 via-purple-700 to-slate-800' },
  80: { label: 'Showers',        icon: '🌦️',  bg: 'from-blue-500 via-indigo-500 to-blue-700' },
  95: { label: 'Thunderstorm',   icon: '⛈️',  bg: 'from-purple-700 via-indigo-800 to-gray-900' },
};
const getWmo = (code) => {
  const exact = WMO[code];
  if (exact) return exact;
  const groups = [95,80,65,61,51,3,2,1,0];
  for (const g of groups) { if (code >= g) return WMO[g]; }
  return { label: 'Unknown', icon: '🌡️', bg: 'from-gray-400 to-gray-600' };
};
const businessTip = (code, temp, rainProb) => {
  if (code >= 95) return { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', icon: '⛈️', msg: 'Severe weather! Deliveries across all shops may be disrupted.' };
  if (code >= 61 || rainProb > 70) return { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', icon: '🌧️', msg: 'Heavy rain — expect surge in delivery orders platform-wide.' };
  if (temp >= 35) return { color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: '🔥', msg: 'Hot weather! Palm water & ice demand surging across all shops. Check stock!' };
  if (temp >= 28) return { color: '#15803d', bg: '#dcfce7', border: '#86efac', icon: '🌟', msg: 'Perfect toddy weather! Excellent platform-wide sales conditions today.' };
  return { color: '#15803d', bg: '#dcfce7', border: '#86efac', icon: '✨', msg: 'Good business conditions across all shops today.' };
};

function WeatherMini() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading]   = useState(true);

  const fetch_ = useCallback(async (lat, lng) => {
    try {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability,weathercode,temperature_2m&timezone=Asia%2FKolkata&forecast_days=1`
      );
      const d = await r.json();
      const nowStr = new Date().toISOString().substring(0, 13) + ':00';
      const idx = Math.max((d.hourly?.time || []).findIndex((t) => t === nowStr), 0);
      setWeather({
        temp:     Math.round(d.current_weather.temperature),
        wind:     Math.round(d.current_weather.windspeed),
        code:     d.current_weather.weathercode,
        humidity: d.hourly?.relativehumidity_2m?.[idx] ?? '—',
        rain:     d.hourly?.precipitation_probability?.[idx] ?? 0,
      });
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async ({ coords: c }) => {
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${c.latitude}&lon=${c.longitude}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const g = await r.json();
          setLocation([g.address?.city || g.address?.town, g.address?.state].filter(Boolean).join(', '));
        } catch { /* ignore */ }
        fetch_(c.latitude, c.longitude);
      },
      () => setLoading(false)
    );
  }, [fetch_]);

  if (loading) return <div className="rounded-2xl h-32 bg-gradient-to-br from-sky-400 to-blue-600 animate-pulse" />;
  if (!weather) return null;

  const wmo = getWmo(weather.code);
  const tip = businessTip(weather.code, weather.temp, weather.rain);

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${wmo.bg} text-white shadow-xl overflow-hidden`}>
      <div className="p-4 pb-3">
        {location && <p className="text-xs opacity-75 mb-2">📍 {location}</p>}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl">{wmo.icon}</span>
          <div>
            <p className="text-4xl font-black">{weather.temp}°C</p>
            <p className="text-xs opacity-80">{wmo.label}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap text-xs">
          <span className="bg-white/20 rounded-lg px-2 py-1">💨 {weather.wind} km/h</span>
          <span className="bg-white/20 rounded-lg px-2 py-1">💧 {weather.humidity}%</span>
          <span className="bg-white/20 rounded-lg px-2 py-1">🌧️ {weather.rain}%</span>
        </div>
      </div>
      <div className="mx-3 mb-3 rounded-xl p-2.5 flex items-start gap-2"
        style={{ backgroundColor: tip.bg, border: `1px solid ${tip.border}` }}>
        <span>{tip.icon}</span>
        <p className="text-[11px] font-medium leading-tight" style={{ color: tip.color }}>{tip.msg}</p>
      </div>
    </div>
  );
}

/* ── Charts ── */
function BarChart({ data, color = '#15803d' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const N = data.length, W = N * 22, H = 70;
  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full" style={{ height: 95 }}>
      {data.map((d, i) => {
        const bh = Math.max((d.value / max) * H * 0.85, d.value > 0 ? 3 : 1);
        const x = i * 22 + 4;
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={14} height={bh} fill={d.value > 0 ? color : '#e5e7eb'} rx="2.5" />
            <text x={x + 7} y={H + 13} textAnchor="middle" fontSize="5.5" fill="#9ca3af">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, color = '#15803d' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const N = data.length, W = 100, H = 55;
  if (N < 2) return null;
  const pts = data.map((d, i) => [(i / (N - 1)) * W, H - (d.value / max) * H * 0.8 - H * 0.1]);
  const linePath = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 14}`} className="w-full" style={{ height: 82 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="slg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#slg)" />
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

function KpiCard({ title, value, icon, gradient, growth, sub }) {
  return (
    <div className={`rounded-2xl p-4 text-white shadow-lg ${gradient}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        {growth !== undefined && <GrowthBadge value={growth} />}
      </div>
      <p className="text-2xl font-bold">{value}</p>
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
   MAIN SUPER ADMIN DASHBOARD
══════════════════════════════════════════════════ */
export default function SADashboard() {
  const { t }               = useLang();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/superadmin/dashboard').then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner size="lg" />;
  if (!data)   return null;

  const statusList = ['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'];
  const statusCfg  = {
    pending:          { color: 'bg-yellow-400', label: `⏳ ${t('status_pending')}` },
    confirmed:        { color: 'bg-blue-400',   label: `✅ ${t('status_confirmed')}` },
    preparing:        { color: 'bg-purple-400', label: `🍺 ${t('status_preparing')}` },
    out_for_delivery: { color: 'bg-orange-400', label: `🛵 ${t('status_out_for_delivery')}` },
    delivered:        { color: 'bg-green-500',  label: `🎉 ${t('status_delivered')}` },
    cancelled:        { color: 'bg-red-400',    label: `❌ ${t('status_cancelled')}` },
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="rounded-2xl overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #166534 100%)' }}>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">🌴</div>
            <div>
              <h1 className="text-xl font-bold text-white">Geetha Online — Super Admin</h1>
              <p className="text-green-200 text-sm">Platform Overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title={t('totalRevenue')}  value={`₹${(data.totalRevenue||0).toLocaleString()}`}    icon="💰" gradient="bg-gradient-to-br from-green-600 to-green-800" />
        <KpiCard title={t('thisWeekRevenue')} value={`₹${(data.thisWeekRevenue||0).toLocaleString()}`} icon="📈" gradient="bg-gradient-to-br from-emerald-500 to-emerald-700"
          growth={data.revenueGrowth} sub={`vs ₹${(data.lastWeekRevenue||0).toLocaleString()} ${t('vsLastWeek')}`} />
        <KpiCard title={t('totalOrders')}   value={data.totalOrders}  icon="📦" gradient="bg-gradient-to-br from-blue-600 to-blue-800" />
        <KpiCard title={t('totalShops')}    value={data.totalShops}   icon="🏪" gradient="bg-gradient-to-br from-amber-600 to-amber-800" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title={t('totalAdmins')}   value={data.totalAdmins}  icon="👨‍💼" gradient="bg-gradient-to-br from-purple-600 to-purple-800" />
        <KpiCard title={t('totalUsers')}    value={data.totalUsers}   icon="👥"   gradient="bg-gradient-to-br from-sky-500 to-sky-700" />
        <KpiCard title={t('thisWeek')}      value={data.thisWeekOrders} icon="🛵" gradient="bg-gradient-to-br from-orange-500 to-orange-700" />
        <KpiCard title={t('lastWeek')}      value={data.lastWeekOrders} icon="📊" gradient="bg-gradient-to-br from-slate-500 to-slate-700" />
      </div>

      {/* ── Weather + Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2">
          <WeatherMini />
        </div>
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-bold text-gray-800">{t('revenueChart')}</h2>
                <p className="text-xs text-gray-400">{t('shops')}</p>
              </div>
              <GrowthBadge value={data.revenueGrowth} />
            </div>
            <BarChart data={data.dailyChart || []} color="#15803d" />
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-800">{t('monthlyTrend')}</h2>
              <p className="font-bold text-green-700 text-sm">₹{(data.totalRevenue||0).toLocaleString()}</p>
            </div>
            <LineChart data={data.monthlyChart || []} color="#15803d" />
          </div>
        </div>
      </div>

      {/* ── Shop Performance + Order Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top Shops */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">{t('topShops')}</h2>
          {data.shopPerformance?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">{t('noShopData')}</p>
          ) : (
            <div className="space-y-3">
              {(data.shopPerformance || []).map((s, i) => {
                const maxRev = data.shopPerformance[0]?.revenue || 1;
                const pct = Math.round((s.revenue / maxRev) * 100);
                const medals = ['🥇','🥈','🥉'];
                return (
                  <div key={s._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate">
                        {medals[i] || `#${i+1}`} {s.shopName}
                      </span>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="font-bold text-green-700">₹{(s.revenue||0).toLocaleString()}</span>
                        <span className="text-gray-400 text-xs ml-1">· {s.orders} orders</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Status Funnel */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">{t('platformOrders')}</h2>
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

      {/* ── Platform Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-black text-green-700">₹{(data.thisWeekRevenue||0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{t('thisWeekRevenue')}</p>
          <GrowthBadge value={data.revenueGrowth} />
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-black text-blue-700">{data.thisWeekOrders}</p>
          <p className="text-sm text-gray-500 mt-1">{t('thisWeek')} {t('orders')}</p>
          <p className="text-xs text-gray-400 mt-0.5">vs {data.lastWeekOrders} {t('vsLastWeek')}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-black text-amber-700">
            {data.totalOrders > 0 ? `₹${Math.round((data.totalRevenue || 0) / data.totalOrders)}` : '₹0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">{t('avgOrderValue')}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('platformAverage')}</p>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-800">{t('recentPlatformOrders')}</h2>
        </div>
        {data.recentOrders?.length === 0 ? (
          <p className="text-gray-400 text-center py-6">{t('noOrdersAdmin')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs">
                  <th className="pb-3 font-semibold">{t('customer')}</th>
                  <th className="pb-3 font-semibold">{t('shop')}</th>
                  <th className="pb-3 font-semibold text-right">{t('amount')}</th>
                  <th className="pb-3 font-semibold">{t('status')}</th>
                  <th className="pb-3 font-semibold">{t('time')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-800">
                          {o.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-gray-800">{o.user?.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-gray-600">{o.shop?.name}</td>
                    <td className="py-2.5 font-bold text-gray-800 text-right">₹{o.grandTotal}</td>
                    <td className="py-2.5"><OrderStatusBadge status={o.status} /></td>
                    <td className="py-2.5 text-xs text-gray-400">{timeAgo(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
