import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { FaUser, FaLock, FaShieldAlt, FaChartBar, FaBox, FaClipboardList } from 'react-icons/fa';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (user && user.role === 'admin') {
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
      
      if (loggedInUser.role !== 'admin') {
        setError('Akses ditolak. Hanya administrator yang dapat login di sini.');
        return;
      }
      
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('admin@avinhome.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="admin-login-page">
      {/* Left Panel - Hidden on Mobile */}
      <div className="admin-left-panel">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <FaShieldAlt />
          </div>
          <h1>Admin Portal</h1>
        </div>

        <h2>Sistem Manajemen AVIN HOME</h2>
        <p>
          Panel administrasi untuk mengelola seluruh operasional
          toko furniture AVIN HOME dengan aman dan efisien.
        </p>

        <div className="admin-highlights">
          <div className="admin-highlight">
            <strong>Dashboard Analitik</strong>
            Monitor performa toko
          </div>
          <div className="admin-highlight">
            <strong>Manajemen Produk</strong>
            Kelola inventaris
          </div>
        </div>
      </div>

      {/* Right Panel - Always Visible */}
      <div className="admin-right-panel">
        {/* Mobile Header - Only on Mobile */}
        <div className="admin-mobile-header">
          <div className="admin-mobile-logo">
            <div className="admin-mobile-logo-icon">
              <FaShieldAlt />
            </div>
            <h1>Admin Portal</h1>
          </div>
          <p className="admin-mobile-subtitle">Sistem Manajemen AVIN HOME</p>
        </div>

        {/* Desktop Titles - Only on Desktop */}
        <h3>Masuk ke Admin Portal</h3>
        <p className="subtitle">Silakan login untuk melanjutkan</p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="admin-email">
              <FaUser className="admin-label-icon" /> Email Admin
            </label>
            <input
              type="email"
              id="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@avinhome.com"
              required
              className="admin-input"
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">
              <FaLock className="admin-label-icon" /> Password
            </label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="admin-input"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="admin-error-message">
              <div className="admin-error-icon">!</div>
              {error}
            </div>
          )}

          <div className="admin-form-options">
            <label className="admin-checkbox-label">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
                <span class="remember-text">Ingat Saya</span>

            </label>
            <Link to="/forgot-password" className="admin-forgot-password">
              Lupa Password?
            </Link>
          </div>

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-spinner"></span>
                Memproses...
              </>
            ) : (
              'Masuk sebagai Admin'
            )}
          </button>

          <div className="demo-section">
            <br></br><p className="demo-label">Login Demo:</p>
            <button 
              type="button" 
              className="admin-demo-btn"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              <FaShieldAlt /> Akun Admin Demo
            </button>
          </div>
        </form>

        {/* Mobile Features - Only on Mobile */}
        <div className="admin-mobile-features">
          <h3><FaChartBar /> Fitur Admin</h3>
          <ul>
            <li><FaBox /> Kelola Produk & Stok</li>
            <li><FaChartBar /> Dashboard Analitik</li>
            <li><FaClipboardList /> Manajemen Pesanan</li>
            <li><FaUser /> Kelola Pengguna</li>
          </ul>
        </div>

        {/* Desktop Features - Only on Desktop */}
        <div className="admin-features">
          <h3><FaChartBar /> Fitur Admin</h3>
          <ul>
            <li><FaBox /> Kelola Produk & Stok</li>
            <li><FaChartBar /> Dashboard Analitik</li>
            <li><FaClipboardList /> Manajemen Pesanan</li>
            <li><FaUser /> Kelola Pengguna</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="admin-login-footer">
          <p>
            Bukan admin?{' '}
            <Link to="/customer/login" className="admin-customer-link">
              Login sebagai Customer
            </Link>
          </p>
          <p className="admin-security-note">
            <FaShieldAlt /> Akses terbatas untuk staf terotorisasi
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;