import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { 
  FaLock, FaCreditCard, FaTruck, FaCheckCircle, 
  FaShoppingBag, FaHome, FaShoppingCart, FaBox, 
  FaShippingFast, FaMoneyBillWave, FaMobileAlt 
} from 'react-icons/fa';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { createOrder } = useOrder();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('bank-transfer');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    province: '',
    postalCode: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const subtotal = getCartTotal();
  const shippingFee = subtotal > 2000000 ? 0 : 50000;
  const tax = subtotal * 0.11;
  const total = subtotal + shippingFee + tax;

  const provinces = [
    'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Bali',
    'Sumatera Utara', 'Sumatera Selatan', 'Kalimantan Timur', 'Sulawesi Selatan'
  ];

  // Auto-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [cartItems.length, orderComplete, navigate]);

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email tidak valid';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    else if (!/^[0-9+\-\s]+$/.test(formData.phone)) newErrors.phone = 'Nomor telepon tidak valid';
    if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
    if (!formData.city.trim()) newErrors.city = 'Kota wajib diisi';
    if (!formData.province) newErrors.province = 'Provinsi wajib dipilih';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Kode pos wajib diisi';
    else if (!/^\d+$/.test(formData.postalCode)) newErrors.postalCode = 'Kode pos harus angka';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmitOrder = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Buat order data
      const orderData = {
        userId: user?.id || `guest_${Date.now()}`,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          province: formData.province,
          postalCode: formData.postalCode,
          notes: formData.notes
        },
        paymentMethod: paymentMethod,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity,
          image: item.image,
          total: (item.discountPrice || item.price) * item.quantity
        })),
        subtotal: subtotal,
        shippingFee: shippingFee,
        tax: tax,
        totalAmount: total,
        status: 'pending',
        paymentStatus: 'pending'
      };

      // Create order in context
      const newOrder = createOrder(orderData);
      setOrderNumber(newOrder.id);
      setOrderComplete(true);
      
      // Clear cart after delay
      setTimeout(() => {
        clearCart();
        setIsProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
      setIsProcessing(false);
    }
  };

  // Jika keranjang kosong dan belum selesai order
  if (cartItems.length === 0 && !orderComplete) {
    return (
      <div className="empty-checkout-page">
        <div className="container">
          <div className="empty-checkout-content">
            <div className="empty-checkout-icon">
              <FaShoppingBag />
            </div>
            <h2>Keranjang Belanja Kosong</h2>
            <p>Tambahkan produk terlebih dahulu sebelum melanjutkan ke checkout</p>
            <div className="empty-checkout-actions">
              <button onClick={() => navigate('/products')} className="btn btn-primary">
                <FaShoppingCart style={{ marginRight: '10px' }} />
                Lihat Produk
              </button>
              <button onClick={() => navigate('/')} className="btn btn-secondary">
                <FaHome style={{ marginRight: '10px' }} />
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="order-complete">
        <div className="container">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <h2>Pesanan Berhasil!</h2>
            <p className="order-number">Nomor Pesanan: {orderNumber}</p>
            <p className="success-message">
              Terima kasih telah berbelanja di AVIN HOME. Kami telah mengirimkan konfirmasi 
              pesanan ke email {formData.email}. Pesanan Anda akan diproses dalam 1x24 jam.
            </p>
            <div className="success-actions">
              <button onClick={() => navigate('/')} className="btn btn-primary">
                <FaHome style={{ marginRight: '10px' }} />
                Kembali ke Beranda
              </button>
              <button onClick={() => navigate('/customer/orders')} className="btn btn-secondary">
                <FaBox style={{ marginRight: '10px' }} />
                Lihat Pesanan Saya
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Checkout</h1>
          <p className="page-subtitle">Langkah terakhir untuk mendapatkan produk impian Anda</p>
        </div>

        {/* Checkout Steps */}
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-info">
              <h3>Informasi Pengiriman</h3>
              <p>Lengkapi data diri Anda</p>
            </div>
          </div>
          
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-info">
              <h3>Metode Pembayaran</h3>
              <p>Pilih cara pembayaran</p>
            </div>
          </div>
          
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-info">
              <h3>Konfirmasi Pesanan</h3>
              <p>Review dan selesaikan</p>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form-section">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="form-step">
                <h2 className="form-title">
                  <FaShippingFast style={{ marginRight: '10px' }} />
                  Informasi Pengiriman
                </h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="fullName">Nama Lengkap *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={errors.fullName ? 'error' : ''}
                      placeholder="Masukkan nama lengkap"
                      disabled={isProcessing}
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                      placeholder="contoh@email.com"
                      disabled={isProcessing}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Nomor Telepon *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="081234567890"
                      disabled={isProcessing}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="address">Alamat Lengkap *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={errors.address ? 'error' : ''}
                      placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan"
                      rows="3"
                      disabled={isProcessing}
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="city">Kota *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={errors.city ? 'error' : ''}
                      placeholder="Nama kota"
                      disabled={isProcessing}
                    />
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="province">Provinsi *</label>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className={errors.province ? 'error' : ''}
                      disabled={isProcessing}
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {errors.province && <span className="error-message">{errors.province}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="postalCode">Kode Pos *</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={errors.postalCode ? 'error' : ''}
                      placeholder="12345"
                      disabled={isProcessing}
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                  </div>
                  
                  <div className="form-group full-width">
                    <label htmlFor="notes">Catatan (Opsional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Catatan tambahan untuk pengiriman"
                      rows="2"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="form-step">
                <h2 className="form-title">
                  <FaMoneyBillWave style={{ marginRight: '10px' }} />
                  Metode Pembayaran
                </h2>
                
                <div className="payment-methods">
                  <div 
                    className={`payment-method ${paymentMethod === 'bank-transfer' ? 'selected' : ''}`}
                    onClick={() => !isProcessing && setPaymentMethod('bank-transfer')}
                  >
                    <div className="payment-icon">
                      🏦
                    </div>
                    <div className="payment-info">
                      <h4>Transfer Bank</h4>
                      <p>BCA, Mandiri, BRI, BNI</p>
                      <small>Transfer manual ke rekening kami</small>
                    </div>
                    <div className="payment-check"></div>
                  </div>
                  
                  <div 
                    className={`payment-method ${paymentMethod === 'credit-card' ? 'selected' : ''}`}
                    onClick={() => !isProcessing && setPaymentMethod('credit-card')}
                  >
                    <div className="payment-icon">
                      <FaCreditCard />
                    </div>
                    <div className="payment-info">
                      <h4>Kartu Kredit/Debit</h4>
                      <p>Visa, Mastercard, JCB</p>
                      <small>Pembayaran instan</small>
                    </div>
                    <div className="payment-check"></div>
                  </div>
                  
                  <div 
                    className={`payment-method ${paymentMethod === 'e-wallet' ? 'selected' : ''}`}
                    onClick={() => !isProcessing && setPaymentMethod('e-wallet')}
                  >
                    <div className="payment-icon">
                      <FaMobileAlt />
                    </div>
                    <div className="payment-info">
                      <h4>E-Wallet</h4>
                      <p>OVO, GoPay, Dana, LinkAja</p>
                      <small>Pembayaran cepat via QRIS</small>
                    </div>
                    <div className="payment-check"></div>
                  </div>
                  
                  <div 
                    className={`payment-method ${paymentMethod === 'cod' ? 'selected' : ''}`}
                    onClick={() => !isProcessing && setPaymentMethod('cod')}
                  >
                    <div className="payment-icon">
                      <FaTruck />
                    </div>
                    <div className="payment-info">
                      <h4>COD (Cash on Delivery)</h4>
                      <p>Bayar saat barang sampai</p>
                      <small>Tambahan biaya Rp 10.000</small>
                    </div>
                    <div className="payment-check"></div>
                  </div>
                </div>

                {/* Payment Instructions */}
                {paymentMethod === 'bank-transfer' && (
                  <div className="payment-instructions">
                    <h4>Instruksi Pembayaran:</h4>
                    <div className="bank-details">
                      <p><strong>Bank:</strong> BCA (Bank Central Asia)</p>
                      <p><strong>No. Rekening:</strong> 123 456 7890</p>
                      <p><strong>Atas Nama:</strong> AVIN HOME FURNITURE</p>
                      <p><strong>Total Transfer:</strong> Rp {total.toLocaleString()}</p>
                    </div>
                    <p className="instruction-note">
                      Silakan transfer tepat sesuai total pesanan. Pesanan akan diproses setelah pembayaran terverifikasi.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Order Review */}
            {step === 3 && (
              <div className="form-step">
                <h2 className="form-title">
                  <FaCheckCircle style={{ marginRight: '10px' }} />
                  Konfirmasi Pesanan
                </h2>
                
                <div className="order-review">
                  <div className="review-section">
                    <h4>Informasi Pengiriman</h4>
                    <div className="review-info">
                      <p><strong>{formData.fullName}</strong></p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.province} {formData.postalCode}</p>
                      <p>📱 {formData.phone}</p>
                      <p>📧 {formData.email}</p>
                    </div>
                  </div>
                  
                  <div className="review-section">
                    <h4>Metode Pembayaran</h4>
                    <div className="review-info">
                      <p><strong>
                        {paymentMethod === 'credit-card' && 'Kartu Kredit/Debit'}
                        {paymentMethod === 'bank-transfer' && 'Transfer Bank'}
                        {paymentMethod === 'e-wallet' && 'E-Wallet'}
                        {paymentMethod === 'cod' && 'COD (Cash on Delivery)'}
                      </strong></p>
                      {paymentMethod === 'bank-transfer' && (
                        <p className="bank-info">
                          <small>BCA: 123 456 7890 a.n AVIN HOME</small>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="review-section">
                    <h4>Pesanan Anda</h4>
                    <div className="order-items">
                      {cartItems.map(item => (
                        <div key={item.id} className="order-item">
                          <div className="item-info">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                          <span className="item-total">
                            Rp {((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="secure-checkout">
                    <FaLock />
                    <span>Transaksi Anda aman dan terenkripsi</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {step > 1 && (
                <button 
                  onClick={handlePrevStep} 
                  className="btn btn-secondary"
                  disabled={isProcessing}
                >
                  Kembali
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  onClick={handleNextStep} 
                  className="btn btn-primary"
                  disabled={isProcessing}
                >
                  Lanjut
                </button>
              ) : (
                <button 
                  onClick={handleSubmitOrder} 
                  className="btn btn-success"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-small"></span>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaLock /> Konfirmasi & Bayar
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-card">
              <h3>Ringkasan Pesanan</h3>
              
              <div className="order-items-preview">
                {cartItems.slice(0, 3).map(item => (
                  <div key={item.id} className="preview-item">
                    <img src={item.image} alt={item.name} />
                    <div className="preview-info">
                      <span className="preview-name">{item.name}</span>
                      <span className="preview-price">
                        {item.quantity} x Rp {(item.discountPrice || item.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                
                {cartItems.length > 3 && (
                  <div className="more-items">
                    +{cartItems.length - 3} produk lainnya
                  </div>
                )}
              </div>
              
              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Pengiriman</span>
                  <span className={shippingFee === 0 ? 'free' : ''}>
                    {shippingFee === 0 ? 'Gratis' : `Rp ${shippingFee.toLocaleString()}`}
                  </span>
                </div>
                <div className="total-row">
                  <span>PPN (11%)</span>
                  <span>Rp {tax.toLocaleString()}</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="total-row">
                    <span>Biaya COD</span>
                    <span>Rp 10.000</span>
                  </div>
                )}
                <div className="total-divider"></div>
                <div className="total-row grand-total">
                  <strong>Total</strong>
                  <strong>Rp {(paymentMethod === 'cod' ? total + 10000 : total).toLocaleString()}</strong>
                </div>
              </div>
              
              <div className="summary-footer">
                <p>
                  <FaLock /> Pembayaran aman dengan enkripsi 256-bit
                </p>
                <p>
                  Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan kami
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;