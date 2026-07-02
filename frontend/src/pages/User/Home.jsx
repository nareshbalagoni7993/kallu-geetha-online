import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

export default function Home() {
  const [shops, setShops]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [catMap, setCatMap]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch]     = useState('');
  const [searching, setSearching] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [locMsg, setLocMsg]     = useState('');
  const [locLoading, setLocLoading] = useState(false);

  // Load all shops immediately on mount — don't wait for location
  const loadShops = useCallback((lat, lng, cat) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (lat != null) { params.set('lat', lat); params.set('lng', lng); }
    if (cat) params.set('category', cat);
    API.get(`/user/shops/nearby?${params}`)
      .then((r) => setShops(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    API.get('/user/categories').then(({ data }) => {
      setCategories(data);
      const m = {};
      data.forEach((c) => { m[c.value] = `${c.icon} ${c.label}`; });
      setCatMap(m);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // Immediately load all shops without location
    loadShops(null, null, category);

    // Then request location in background to sort by distance
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: c }) => {
          setUserCoords({ lat: c.latitude, lng: c.longitude });
          setLocMsg('📍 Showing shops near you');
          loadShops(c.latitude, c.longitude, category);
        },
        () => setLocMsg('📍 Showing all available shops')
      );
    } else {
      setLocMsg('📍 Showing all available shops');
    }
  }, []);

  useEffect(() => {
    if (userCoords) loadShops(userCoords.lat, userCoords.lng, category);
    else loadShops(null, null, category);
  }, [category]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) { loadShops(userCoords?.lat, userCoords?.lng, category); return; }
    setSearching(true);
    try {
      const r = await API.get(`/user/shops/search?q=${encodeURIComponent(search)}`);
      setShops(r.data);
    } finally { setSearching(false); }
  };

  const clearSearch = () => { setSearch(''); loadShops(userCoords?.lat, userCoords?.lng, category); };

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error('Location not supported'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setUserCoords({ lat: c.latitude, lng: c.longitude });
        setLocMsg('📍 Showing shops near you');
        loadShops(c.latitude, c.longitude, category);
        setLocLoading(false);
      },
      () => { toast.error('Could not detect location. Please allow access.'); setLocLoading(false); }
    );
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-800 via-green-700 to-amber-800 rounded-2xl p-4 sm:p-7 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-2 text-7xl sm:text-8xl opacity-10 select-none pointer-events-none">🌴</div>
        <h1 className="text-xl sm:text-3xl font-bold mb-1 relative">🌴 Fresh Toddy Delivered!</h1>
        <p className="text-green-200 text-sm mb-3 relative">Palm Toddy · Palm Water · Ice · Apples & More</p>
        {locMsg && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-green-300 text-xs">{locMsg}</span>
            {userCoords && <span className="text-green-400 text-xs">· Sorted by distance</span>}
          </div>
        )}
        <form onSubmit={handleSearch} className="flex gap-2 mb-3 relative">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-gray-800 text-sm focus:outline-none shadow-inner min-w-0"
            placeholder="Search shops..." />
          {search && (
            <button type="button" onClick={clearSearch}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0">✕</button>
          )}
          <button type="submit" disabled={searching}
            className="bg-secondary hover:bg-secondary-dark text-white px-3 sm:px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 shadow flex-shrink-0">
            {searching ? '⏳' : '🔍'}
          </button>
        </form>
        <button onClick={detectLocation} disabled={locLoading}
          className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-2 rounded-full transition-colors disabled:opacity-60 border border-white/20">
          {locLoading ? '⏳ Detecting...' : '📍 Detect Location'}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        <button onClick={() => { setCategory(''); setSearch(''); }}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === '' ? 'bg-primary text-white' : 'bg-white text-gray-600 border hover:bg-green-50'}`}>
          🏠 All
        </button>
        {categories.map((c) => (
          <button key={c.value} onClick={() => { setCategory(c.value); setSearch(''); }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c.value ? 'bg-primary text-white' : 'bg-white text-gray-600 border hover:bg-green-50'}`}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner size="lg" /> : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {shops.length === 0 ? 'No shops found' : `${shops.length} shop${shops.length !== 1 ? 's' : ''} available`}
          </p>

          {shops.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-3">🌴</div>
              <p className="text-lg font-medium">No shops available right now</p>
              <p className="text-sm mt-1">Try a different search or check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shops.map((shop) => (
                <Link to={`/shop/${shop._id}`} key={shop._id}
                  className="bg-white rounded-2xl shadow hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden group border border-gray-100">
                  {/* Image */}
                  <div className="h-44 relative overflow-hidden">
                    {shop.image ? (
                      <img src={shop.image} alt={shop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-700 via-green-600 to-amber-700 flex flex-col items-center justify-center gap-1">
                        <span className="text-6xl drop-shadow-lg">🌴</span>
                        <span className="text-white/70 text-xs font-medium">{catMap[shop.category] || shop.category}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-bold shadow ${shop.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {shop.isOpen ? '● Open' : '● Closed'}
                    </span>
                    {shop.distance > 0 && (
                      <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                        📍 {shop.distance} km
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors text-base">{shop.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 mb-2">📍 {shop.address?.city} · {catMap[shop.category] || shop.category}</p>
                    <div className="flex gap-3 text-sm">
                      <span className="flex items-center gap-1 text-amber-600 font-medium">⭐ {shop.rating?.toFixed(1)}</span>
                      <span className="text-gray-400">·</span>
                      <span className="flex items-center gap-1 text-gray-600">🕒 {shop.deliveryTime} min</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {shop.deliveryCharge > 0
                        ? <p className="text-xs text-gray-500">Delivery: ₹{shop.deliveryCharge}</p>
                        : <p className="text-xs text-green-600 font-semibold">🚚 Free Delivery</p>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
