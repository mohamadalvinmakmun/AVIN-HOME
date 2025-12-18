import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { OrderProvider } from './context/OrderContext';

import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';

import AdminLogin from './pages/Auth/AdminLogin/AdminLogin';
import CustomerLogin from './pages/Auth/CustomerLogin/CustomerLogin';
import AuthLayout from './pages/Auth/AuthLayout';

import Dashboard from './pages/Admin/Dashboard/Dashboard';
import AdminProducts from './pages/Admin/AdminProducts/AdminProducts';
import AdminSales from './pages/Admin/AdminSales/AdminSales';
import AdminOrders from './pages/Admin/AdminOrders/AdminOrders';

import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Profile from './pages/Profile/Profile';
import CustomerOrders from './pages/CustomerOrders/CustomerOrders';

import PrivateRoute from './components/PrivateRoute';
import './App.css';

const AppContent = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {/* LOADING */}
      <div className={`loading-overlay ${loading ? 'active' : ''}`}>
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Memuat...</p>
        </div>
      </div>

      <Header />

      <main className="main-content">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* AUTH */}
          <Route element={<AuthLayout />}>
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
          </Route>

          {/* CUSTOMER (PROTECTED) */}
          <Route path="/customer" element={<PrivateRoute />}>
            <Route path="home" element={<Home />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
            <Route path="orders" element={<CustomerOrders />} />
          </Route>

          {/* ADMIN (PROTECTED) */}
          <Route path="/admin" element={<PrivateRoute adminOnly />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>

          {/* REDIRECT */}
          <Route path="/login" element={<Navigate to="/customer/login" replace />} />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <CartProvider>
          <OrderProvider>
            <div className="App">
              <AppContent />
            </div>
          </OrderProvider>
        </CartProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}

export default App;