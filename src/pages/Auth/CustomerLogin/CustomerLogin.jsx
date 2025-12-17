import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  FaUser, FaLock, FaHome, FaShoppingCart, 
  FaTruck, FaShieldAlt, FaStar, FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import './CustomerLogin.css';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user && user.role === 'customer') {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Harap masukkan email dan password');
      return;
    }
    
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      
      if (loggedInUser.role !== 'customer') {
        setError('Akun ini bukan customer. Silakan login melalui halaman admin.');
        return;
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('customer@example.com');
    setPassword('customer123');
    setError('');
  };

  return (
    <div className="customer-login-page">
      {/* Left Panel - Hidden on Mobile */}
      <div className="customer-left-panel">
        <div className="customer-brand">
          <div className="customer-brand-icon">
            <FaHome />
          </div>
          <h1>AVIN HOME</h1>
        </div>

        <h2>Selamat Datang, Pelanggan</h2>
        <p>
          Harmoni antara perhatian dan visi untuk menghadirkan
          pengalaman belanja furniture terbaik dan nyaman untuk rumah Anda.
        </p>

        <div className="customer-highlights">
          <div className="customer-highlight">
            <strong>Belanja Mudah</strong>
            Produk berkualitas
          </div>
          <div className="customer-highlight">
            <strong>Gratis Ongkir</strong>
            Min. Rp500.000
          </div>
          <div className="customer-highlight">
            <strong>Garansi 2 Tahun</strong>
            Semua produk
          </div>
        </div>
      </div>

      {/* Right Panel - Always Visible */}
      <div className="customer-right-panel">
        {/* Mobile Header - Only on Mobile */}
        <div className="customer-mobile-header">
          <div className="customer-mobile-logo">
            <div className="customer-mobile-logo-icon">
              <FaHome />
            </div>
            <h1>AVIN HOME</h1>
          </div>
          <p className="customer-mobile-welcome">Selamat Datang, Pelanggan!</p>
          <p className="customer-mobile-tagline">
            Harmoni antara perhatian & visi untuk menciptakan rumah yang lebih nyaman.
          </p>
        </div>

        {/* Desktop Titles - Only on Desktop */}

        {/* Mobile Form Title */}
        <div className="form-title-mobile">
          <h2>Masuk ke Akun Anda</h2>
          <p>Silakan login untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="customer-form-group">
            <div className="customer-input-with-icon">
              <FaUser className="customer-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Anda"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="customer-form-group">
            <div className="customer-input-with-icon">
              <FaLock className="customer-input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="customer-error-message">
              <FaExclamationCircle /> {error}
            </div>
          )}

          <div className="customer-form-options">
            <label className="customer-checkbox-label">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
             <span class="customer-remember-text">Ingat Saya</span>
            </label>
            <Link to="/forgot-password" className="customer-forgot-password">
              Lupa Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="customer-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="customer-spinner"></span>
                Memproses...
              </>
            ) : (
              <>
                <FaCheckCircle /> Masuk ke Akun Saya
              </>
            )}
          </button>

          <button 
            type="button" 
            className="customer-demo-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <FaUser /> Login Demo Pelanggan
          </button>
        </form>

        {/* Mobile Benefits - Only on Mobile */}
        <div className="customer-mobile-benefits">
          <h3><FaStar /> Keuntungan Bergabung</h3>
          <div className="customer-benefits-grid">
            <div className="customer-mobile-benefit">
              <div className="customer-benefit-icon">
                <FaShoppingCart />
              </div>
              <h4>Belanja Mudah</h4>
              <p>Produk berkualitas dengan harga terbaik</p>
            </div>
            <div className="customer-mobile-benefit">
              <div className="customer-benefit-icon">
                <FaTruck />
              </div>
              <h4>Gratis Ongkir</h4>
              <p>Untuk pembelian di atas Rp 500.000</p>
            </div>
            <div className="customer-mobile-benefit">
              <div className="customer-benefit-icon">
                <FaShieldAlt />
              </div>
              <h4>Garansi 2 Tahun</h4>
              <p>Untuk semua produk furniture</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="customer-login-footer">
          <p>
            Belum punya akun?{' '}
            <Link to="/register" className="customer-register-link">
              Daftar Gratis
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;