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
  FaExchangeAlt,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const { cartItems, getCartTotal, getItemCount, clearCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);
  const [showStockFixedAlert, setShowStockFixedAlert] = useState(false);

  // Deteksi ukuran layar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Validasi stok sebelum checkout
  const validateStock = () => {
    const errors = [];
    
    cartItems.forEach(item => {
      if (item.quantity > item.stock) {
        errors.push({
          productId: item.id,
          productName: item.name,
          requested: item.quantity,
          available: item.stock
        });
      }
    });
    
    setStockErrors(errors);
    return errors.length === 0;
  };

  // Fungsi untuk menambah quantity dengan validasi stok
  const handleIncreaseQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.quantity < item.stock) {
      updateQuantity(itemId, item.quantity + 1);
      // Reset error jika ada
      setStockErrors(prev => prev.filter(error => error.productId !== itemId));
      // Tampilkan alert jika semua stok sudah valid
      if (stockErrors.length === 1 && cartItems.every(item => item.quantity <= item.stock)) {
        setShowStockFixedAlert(true);
        setTimeout(() => setShowStockFixedAlert(false), 3000);
      }
    }
  };

  // Fungsi untuk mengurangi quantity
  const handleDecreaseQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
      // Reset error jika ada
      if (item.quantity - 1 <= item.stock) {
        setStockErrors(prev => prev.filter(error => error.productId !== itemId));
      }
    }
  };

  // Fungsi untuk mengubah quantity manual dengan validasi
  const handleManualQuantityChange = (itemId, newQuantity) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      // Validasi: tidak boleh lebih dari stok
      const quantity = Math.min(Math.max(1, parseInt(newQuantity) || 1), item.stock);
      updateQuantity(itemId, quantity);
      
      // Reset error jika ada
      if (quantity <= item.stock) {
        setStockErrors(prev => prev.filter(error => error.productId !== itemId));
      }
    }
  };

  const handleCheckout = () => {
    // Validasi stok terlebih dahulu
    if (!validateStock()) {
      return; // Jangan lanjutkan jika ada stok yang tidak mencukupi
    }
    
    if (!user) {
      // Redirect ke login dengan state untuk kembali ke checkout setelah login
      navigate('/customer/login', { 
        state: { from: { pathname: '/customer/checkout' } } 
      });
      return;
    }
    navigate('/customer/checkout');
  };

  const handleClearCart = () => {
    clearCart();
    setShowConfirmClear(false);
    setStockErrors([]); // Reset error saat cart dikosongkan
  };

  const closeStockAlert = () => {
    setStockErrors([]);
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

  // Hitung berapa item yang melebihi stok
  const itemsExceedingStock = cartItems.filter(item => item.quantity > item.stock).length;

  return (
    <div className="cart-page">
      <div className="container">
        {/* Alert untuk stok tidak mencukupi */}
        {stockErrors.length > 0 && (
          <div className="stock-alert">
            <div className="stock-alert-content">
              <div className="stock-alert-header">
                <FaExclamationTriangle className="stock-alert-icon" />
                <h4>Stok Tidak Mencukupi</h4>
                <button className="stock-alert-close" onClick={closeStockAlert}>
                  ×
                </button>
              </div>
              <p>Beberapa produk di keranjang melebihi stok yang tersedia:</p>
              <ul className="stock-alert-list">
                {stockErrors.map((error, index) => (
                  <li key={index}>
                    <strong>{error.productName}</strong>: 
                    Anda memesan {error.requested} item, 
                    tetapi stok hanya {error.available} item
                  </li>
                ))}
              </ul>
              <p className="stock-alert-note">
                Silahkan kurangi jumlah item atau hapus produk dari keranjang sebelum melanjutkan checkout.
                <br />
                <small>Quantity telah dibatasi sesuai stok yang tersedia.</small>
              </p>
            </div>
          </div>
        )}

        {/* Alert ketika stok sudah diperbaiki */}
        {showStockFixedAlert && (
          <div className="stock-fixed-alert">
            <div className="stock-fixed-alert-content">
              <FaCheckCircle className="stock-fixed-alert-icon" />
              <span>Semua produk sudah sesuai dengan stok yang tersedia!</span>
              <button className="stock-fixed-alert-close" onClick={() => setShowStockFixedAlert(false)}>
                ×
              </button>
            </div>
          </div>
        )}

        <div className="page-header">
          <h1 className="page-title">Keranjang Belanja</h1>
          <p className="page-subtitle">
            Anda memiliki {getItemCount()} item di keranjang
            {itemsExceedingStock > 0 && (
              <span className="stock-exceed-badge">
                ({itemsExceedingStock} produk melebihi stok)
              </span>
            )}
          </p>
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

            {/* Notifikasi stok untuk setiap item */}
            {cartItems.some(item => item.quantity > item.stock) && (
              <div className="cart-stock-warning">
                <FaExclamationTriangle />
                <span>
                  {itemsExceedingStock} produk melebihi stok yang tersedia. 
                  Quantity telah dibatasi otomatis.
                </span>
              </div>
            )}

            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item-wrapper">
                  <CartItem 
                    item={item}
                    onIncreaseQuantity={handleIncreaseQuantity}
                    onDecreaseQuantity={handleDecreaseQuantity}
                    onManualQuantityChange={handleManualQuantityChange}
                    maxQuantity={item.stock}
                    isExceedingStock={item.quantity > item.stock}
                  />
                  {item.quantity > item.stock && (
                    <div className="item-stock-error">
                      <FaExclamationTriangle />
                      <span>
                        Stok hanya {item.stock} item. Quantity telah dibatasi.
                      </span>
                    </div>
                  )}
                  {item.quantity === item.stock && (
                    <div className="item-stock-limit">
                      <FaExclamationTriangle />
                      <span>
                        Stok maksimum tercapai ({item.stock} item)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Informasi tambahan tentang pembatasan stok */}
            <div className="stock-limit-info">
              <h4>Informasi Stok:</h4>
              <ul>
                <li>Quantity produk secara otomatis dibatasi sesuai stok yang tersedia</li>
                <li>Tidak dapat menambah quantity melebihi stok yang ada</li>
                <li>Jika stok habis, produk akan dihapus dari keranjang</li>
                <li>Checkout hanya dapat dilakukan jika semua produk memiliki stok yang cukup</li>
              </ul>
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
                  className={`btn checkout-btn ${cartItems.some(item => item.quantity > item.stock) ? 'btn-disabled' : 'btn-primary'}`}
                  onClick={handleCheckout}
                  disabled={cartItems.some(item => item.quantity > item.stock)}
                >
                  {cartItems.some(item => item.quantity > item.stock) ? (
                    <>
                      <FaExclamationTriangle style={{ marginRight: '8px' }} />
                      Perbaiki Stok Terlebih Dahulu
                    </>
                  ) : (
                    <>
                      Lanjut ke Checkout <FaArrowRight />
                    </>
                  )}
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

              {/* Informasi tambahan tentang validasi stok */}
              {cartItems.some(item => item.quantity > item.stock) && (
                <div className="stock-validation-info">
                  <p>
                    <FaExclamationTriangle style={{ marginRight: '8px', color: '#ef4444' }} />
                    <strong>Checkout Diblokir:</strong> {itemsExceedingStock} produk melebihi stok.
                  </p>
                  <p className="stock-validation-sub">
                    Kurangi quantity atau hapus produk yang melebihi stok untuk melanjutkan.
                  </p>
                </div>
              )}

              {/* Statistik stok */}
              <div className="stock-statistics">
                <div className="stat-item">
                  <span className="stat-label">Total Produk:</span>
                  <span className="stat-value">{cartItems.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Stok Valid:</span>
                  <span className="stat-value valid">
                    {cartItems.filter(item => item.quantity <= item.stock).length}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Melebihi Stok:</span>
                  <span className="stat-value invalid">
                    {itemsExceedingStock}
                  </span>
                </div>
              </div>
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