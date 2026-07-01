import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart]     = useState([]);
  const [shopId, setShopId] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);

  const addToCart = (product, shop) => {
    if (shopId && shopId !== shop._id) {
      if (!window.confirm('Your cart has items from another shop. Clear cart and add this item?')) return;
      setCart([]);
      setShopId(null);
      setShopInfo(null);
    }
    setShopId(shop._id);
    setShopInfo(shop);
    setCart((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (exists) return prev.map((i) => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const updated = prev.map((i) => i._id === productId ? { ...i, qty: i.qty - 1 } : i).filter((i) => i.qty > 0);
      if (updated.length === 0) { setShopId(null); setShopInfo(null); }
      return updated;
    });
  };

  const deleteFromCart = (productId) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i._id !== productId);
      if (updated.length === 0) { setShopId(null); setShopInfo(null); }
      return updated;
    });
  };

  const clearCart = () => { setCart([]); setShopId(null); setShopInfo(null); };

  const totalItems  = cart.reduce((s, i) => s + i.qty, 0);
  const totalAmount = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, shopId, shopInfo, addToCart, removeFromCart, deleteFromCart, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
