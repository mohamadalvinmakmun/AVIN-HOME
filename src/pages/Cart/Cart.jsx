import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CartItem from '../../components/CartItem/CartItem';
import { 
  FaShoppingCart, 
  FaTrash, 
  FaArrowRight, 
  FaShoppingBag,
  FaTruck,
  FaShieldAlt,
  FaExchangeAlt
} from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const { cartItems, getCartTotal, getItemCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCheckout = () => {
    if (!user) {
      // Redirect ke login dengan state untuk kembali ke checkout setelah login
      navigate('/customer/login', { 
        state: { from: { pathname: '/customer/checkout' } } 
      });
      return;
    }
    // PERBAIKAN DI SINI: arahkan ke /customer/checkout (bukan /checkout)
    navigate('/customer/checkout');
  };

  const handleClearCart = () => {
    clearCart();
    setShowConfirmClear(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="container">
          <div className="empty-cart-content">
            <div className="empty-cart-icon">
              <FaShoppingCart />
            </div>
            <h2>Keranjang Belanja Kosong</h2>
            <p>Tambahkan produk terlebih dahulu sebelum melanjutkan belanja</p>
            <Link to="/products" className="btn btn-primary">
              <FaShoppingBag style={{ marginRight: '10px' }} />
              Lihat Produk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 2000000 ? 0 : 50000;
  const tax = subtotal * 0.11;
  const total = subtotal + shippingFee + tax;

  return (
    <div className="cart-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Keranjang Belanja</h1>
          <p className="page-subtitle">Anda memiliki {getItemCount()} item di keranjang</p>
        </div>

        <div className="cart-content">
          <div className="cart-items-section">
            <div className="cart-header">
              <h2>Produk di Keranjang</h2>
              <button 
                className="clear-cart-btn"
                onClick={() => setShowConfirmClear(true)}
              >
                <FaTrash /> Kosongkan Keranjang
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Ringkasan Belanja</h3>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                
                <div className="summary-row">
                  <span>Biaya Pengiriman</span>
                  <span className={shippingFee === 0 ? 'free-shipping' : ''}>
                    {shippingFee === 0 ? 'Gratis' : `Rp ${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                
                <div className="summary-row">
                  <span>PPN (11%)</span>
                  <span>Rp {tax.toLocaleString()}</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-row total">
                  <strong>Total</strong>
                  <strong className="total-amount">Rp {total.toLocaleString()}</strong>
                </div>
              </div>

              <div className="summary-actions">
                <button 
                  className="btn btn-primary checkout-btn"
                  onClick={handleCheckout}
                >
                  Lanjut ke Checkout <FaArrowRight />
                </button>
                
                {!isMobile && (
                  <Link to="/products" className="continue-shopping">
                    Lanjutkan Belanja
                  </Link>
                )}
              </div>

              {shippingFee > 0 && (
                <div className="shipping-info">
                  <p>
                    <strong>Bebas ongkir!</strong> Tambah belanja Rp {(2000000 - subtotal).toLocaleString()} 
                    lagi untuk mendapatkan gratis ongkir.
                  </p>
                </div>
              )}
            </div>

            <div className="cart-features">
              <div className="feature">
                <div className="feature-icon">
                  <FaShieldAlt style={{ color: '#4c6ef5' }} />
                </div>
                <div className="feature-text">
                  <strong>Garansi 2 Tahun</strong>
                  <p>Semua produk dilindungi garansi</p>
                </div>
              </div>
              
              <div className="feature">
                <div className="feature-icon">
                  <FaTruck style={{ color: '#4c6ef5' }} />
                </div>
                <div className="feature-text">
                  <strong>Pengiriman Cepat</strong>
                  <p>Estimasi 3-7 hari kerja</p>
                </div>
              </div>
              
              <div className="feature">
                <div className="feature-icon">
                  <FaExchangeAlt style={{ color: '#4c6ef5' }} />
                </div>
                <div className="feature-text">
                  <strong>Pengembalian Mudah</strong>
                  <p>14 hari pengembalian</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showConfirmClear && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Kosongkan Keranjang?</h3>
            <p>Semua item di keranjang akan dihapus. Tindakan ini tidak dapat dibatalkan.</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowConfirmClear(false)}
              >
                Batal
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleClearCart}
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;