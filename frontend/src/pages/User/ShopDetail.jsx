import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import { useCart } from '../../context/CartContext';
import { useLang } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  'Palm Toddy': '🍺', 'Sweet Toddy': '🍯', 'Palm Water': '💧',
  'Palm Ice': '🧊', 'Apples': '🍎', 'Palm Jaggery': '🍬',
  'Palm Sugar': '🧂', 'Other': '🌴',
};

const PRODUCT_BG = [
  'from-amber-50 to-amber-100', 'from-green-50 to-green-100',
  'from-yellow-50 to-yellow-100', 'from-orange-50 to-orange-100',
];

export default function ShopDetail() {
  const { t }      = useLang();
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { cart, addToCart, removeFromCart, totalItems, totalAmount, shopId } = useCart();
  const [shop, setShop]           = useState(null);
  const [products, setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      API.get(`/user/shop/${id}`),
      API.get(`/user/shop/${id}/products`),
    ]).then(([shopRes, prodRes]) => {
      setShop(shopRes.data);
      setProducts(prodRes.data.products);
      setCategories(['All', ...prodRes.data.categories]);
    }).finally(() => setLoading(false));
  }, [id]);

  const getQty = (productId) => cart.find((i) => i._id === productId)?.qty || 0;

  const handleAdd = (product) => {
    if (!shop.isOpen) { toast.error('This shop is currently closed'); return; }
    addToCart(product, shop);
    toast.success(`Added to cart`, { duration: 1200, icon: '🛒' });
  };

  const filtered = activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  if (loading) return <Spinner size="lg" text="Loading shop..." />;
  if (!shop)   return <div className="text-center py-20 text-gray-400">Shop not found</div>;

  return (
    <div>
      {/* Shop Header */}
      <div className="card mb-6 overflow-hidden">
        <div className="h-52 relative">
          {shop.image ? (
            <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-700 via-green-600 to-amber-600 flex flex-col items-center justify-center gap-2">
              <span className="text-7xl drop-shadow-xl">🌴</span>
              <span className="text-white/80 text-sm font-medium tracking-wide">{shop.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold shadow ${shop.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {shop.isOpen ? `🟢 ${t('openStatus')}` : `🔴 ${t('closedStatus')}`}
          </span>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-gray-800">{shop.name}</h1>
          {shop.description && <p className="text-gray-500 mt-1 text-sm">{shop.description}</p>}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
              <span>⭐</span><span className="text-sm font-semibold text-amber-700">{shop.rating?.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
              <span>🕒</span><span className="text-sm font-semibold text-blue-700">{shop.deliveryTime} min</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
              <span>📍</span><span className="text-sm font-semibold text-purple-700">{shop.address?.city}</span>
            </div>
            {shop.deliveryCharge > 0
              ? <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                  <span>🚚</span><span className="text-sm font-semibold text-gray-700">₹{shop.deliveryCharge} {t('delivery')}</span>
                </div>
              : <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                  <span>🚚</span><span className="text-sm font-semibold text-green-700">{t('freeDelivery')}</span>
                </div>}
          </div>
          {shop.minOrder > 0 && (
            <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 w-fit">
              <span>⚠️</span>
              <span className="text-sm text-amber-700 font-medium">Min order: ₹{shop.minOrder}</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {categories.map((c) => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === c ? 'bg-primary text-white shadow-md scale-105' : 'bg-white border text-gray-600 hover:bg-green-50'}`}>
            {CATEGORY_ICONS[c] || '🌴'} {c}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="space-y-3 mb-28">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">🍺</div>
            <p>{t('noProducts')}</p>
          </div>
        ) : filtered.map((p, idx) => {
          const qty = getQty(p._id);
          const bg  = PRODUCT_BG[idx % PRODUCT_BG.length];
          return (
            <div key={p._id} className={`card p-0 overflow-hidden flex ${!p.inStock ? 'opacity-60' : ''}`}>
              {/* Info side */}
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={p.isVeg ? 'text-green-600' : 'text-red-500'} title={p.isVeg ? 'Veg' : 'Non-veg'}>
                      {p.isVeg ? '🟢' : '🔴'}
                    </span>
                    <h3 className="font-bold text-gray-800 text-base">{p.name}</h3>
                  </div>
                  {p.description && <p className="text-sm text-gray-500 mb-1 line-clamp-2">{p.description}</p>}
                  {p.quantity && <p className="text-xs text-gray-400 mb-2">📦 {p.quantity}</p>}
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="font-extrabold text-gray-800 text-lg">₹{p.price}</span>
                    {p.originalPrice > 0 && (
                      <>
                        <span className="text-sm text-gray-400 line-through">₹{p.originalPrice}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-semibold">
                          {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% off
                        </span>
                      </>
                    )}
                  </div>
                  {!p.inStock ? (
                    <span className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-full font-medium">{t('outOfStock')}</span>
                  ) : qty === 0 ? (
                    <button onClick={() => handleAdd(p)}
                      className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-sm active:scale-95">
                      {t('addToCart')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-0 border-2 border-primary rounded-xl overflow-hidden w-fit">
                      <button onClick={() => removeFromCart(p._id)}
                        className="px-3.5 py-2 text-primary font-bold text-lg hover:bg-primary hover:text-white transition-colors leading-none">−</button>
                      <span className="px-4 py-2 font-bold text-primary text-base min-w-[2rem] text-center">{qty}</span>
                      <button onClick={() => handleAdd(p)}
                        className="px-3.5 py-2 text-primary font-bold text-lg hover:bg-primary hover:text-white transition-colors leading-none">+</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Image side */}
              <div className={`w-24 sm:w-36 h-auto flex-shrink-0 bg-gradient-to-br ${bg} flex items-center justify-center relative overflow-hidden`}>
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-5xl drop-shadow">{CATEGORY_ICONS[p.category] || '🍺'}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && shopId === shop._id && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
          <button onClick={() => navigate('/cart')}
            className="bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 font-semibold text-base hover:bg-primary-dark transition-all active:scale-95 w-full max-w-sm justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-white text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">{totalItems}</span>
              <span>{t('viewCart')}</span>
            </div>
            <span className="font-bold text-lg">₹{totalAmount}</span>
          </button>
        </div>
      )}
    </div>
  );
}
