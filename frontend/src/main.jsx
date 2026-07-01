import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './style.css';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
