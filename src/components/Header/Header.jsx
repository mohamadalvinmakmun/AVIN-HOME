import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { 
  FaShoppingCart, 
  FaUser, 
  FaSearch, 
  FaBars, 
  FaTimes,
  FaHeart,
  FaHome,
  FaBox,
  FaChartBar,
  FaSignOutAlt,
  FaArrowRight,
  FaCouch,
  FaStar,
  FaShieldAlt,
  FaUsers,
  FaStore,
  FaShoppingBag,
  FaInfoCircle,
  FaPhoneAlt,
  FaUserPlus
} from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminMenu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { path: '/admin/products', label: 'Produk', icon: <FaBox /> },
    { path: '/admin/orders', label: 'Pesanan', icon: <FaShoppingBag /> },
    { path: '/admin/users', label: 'Pengguna', icon: <FaUsers /> },
  ];

  const customerMenu = [
    { path: '/', label: 'Beranda', icon: <FaHome /> },
    { path: '/products', label: 'Produk', icon: <FaBox /> },
    { path: '/cart', label: 'Keranjang', icon: <FaShoppingCart /> },
    { path: '/customer/orders', label: 'Pesanan Saya', icon: <FaShoppingBag /> },
    { path: '/customer/profile', label: 'Profil', icon: <FaUser /> },
  ];

  const quickSearchTerms = ['Sofa', 'Meja Makan', 'Tempat Tidur', 'Lemari', 'Kursi', 'Lampu', 'Dapur'];

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo">
              <Link to="/" className="logo-link">
                <div className="logo-icon-container">
                  <div className="logo-icon">
                    <FaCouch className="couch-icon" />
                    <div className="logo-sparkle">
                      <FaStar className="sparkle-star" />
                    </div>
                  </div>
                  <div className="logo-glow"></div>
                </div>
                <div className="logo-text">
                  <h1 className="logo-title">
                    <span className="logo-avin">AVIN</span>
                    <span className="logo-home">HOME</span>
                  </h1>
                  <p className="tagline">Rumah Impian, Nyata dalam Genggaman</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              <ul className="nav-list">
                <li><Link to="/" className="nav-link"><FaHome /> Beranda</Link></li>
                <li><Link to="/products" className="nav-link"><FaBox /> Produk</Link></li>
                <li><Link to="/about" className="nav-link"><FaInfoCircle /> Tentang</Link></li>
                <li><Link to="/contact" className="nav-link"><FaPhoneAlt /> Kontak</Link></li>
                {user?.role === 'admin' && (
                  <li className="nav-dropdown">
                    <span className="nav-link"><FaChartBar /> Admin</span>
                    <div className="dropdown-menu">
                      {adminMenu.map((item) => (
                        <Link key={item.path} to={item.path} className="dropdown-item">
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="dropdown-item logout">
                        <FaSignOutAlt />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </li>
                )}
              </ul>
            </nav>

            {/* Header Actions */}
            <div className="header-actions">
              {/* Search Toggle */}
              <button 
                className="action-btn search-toggle"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
              >
                <FaSearch />
              </button>

              {/* Cart */}
              <Link to="/cart" className="action-btn cart-btn">
                <FaShoppingCart />
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </Link>

              {/* User Menu - Desktop */}
              <div className="user-menu">
                {user ? (
                  <>
                    <button className="action-btn user-btn">
                      <div className={`user-avatar ${user.role}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className={`user-avatar ${user.role}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <h4>{user.name}</h4>
                          <p className="user-role">
                            {user.role === 'admin' ? 'Administrator' : 'Pelanggan'}
                          </p>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      {user.role === 'admin' ? (
                        <>
                          {adminMenu.map((item) => (
                            <Link key={item.path} to={item.path} className="dropdown-item">
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          ))}
                          <div className="dropdown-divider"></div>
                        </>
                      ) : (
                        <>
                          {customerMenu.map((item) => (
                            <Link key={item.path} to={item.path} className="dropdown-item">
                              {item.icon}
                              <span>{item.label}</span>
                            </Link>
                          ))}
                          <div className="dropdown-divider"></div>
                        </>
                      )}
                      <button onClick={handleLogout} className="dropdown-item logout">
                        <FaSignOutAlt />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="login-dropdown">
                    <button className="action-btn user-btn">
                      <FaUser />
                    </button>
                    <div className="user-dropdown">
                      <div className="dropdown-header">
                        <h4>Masuk ke Akun</h4>
                        <p>Akses belanja & transaksi</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/customer/login" className="dropdown-item customer-login">
                        <FaUsers />
                        <div>
                          <strong>Login Pelanggan</strong><br />
                          <small>Mulai berbelanja sekarang</small>
                        </div>
                      </Link>
                      <div className="dropdown-divider"></div>
                      <Link to="/register" className="dropdown-item">
                        <FaUserPlus />
                        <div>
                          <strong>Daftar Pelanggan</strong><br />
                          <small>Buat akun baru</small>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Navigation */}
        <div className={`mobile-sidebar ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-sidebar-header">
            {user ? (
              <div className="mobile-user-info">
                <div className={`mobile-user-avatar ${user.role}`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{user.name}</h4>
                  <p>{user.role === 'admin' ? 'Administrator' : 'Pelanggan'}</p>
                </div>
              </div>
            ) : (
              <div className="auth-buttons-header">
                <h4>Masuk ke Akun</h4>
                <p>Akses belanja & transaksi</p>
              </div>
            )}
            <button className="close-sidebar" onClick={() => setIsMenuOpen(false)}>
              <FaTimes />
            </button>
          </div>

          {!user && (
            <div className="mobile-sidebar-auth">
              <div className="mobile-auth-buttons">
                <Link to="/customer/login" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                  <FaUsers /> Login Pelanggan
                </Link>
                <div className="divider-text">
                  <span>ATAU</span>
                </div>
                <Link to="/register" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
                  <FaUserPlus /> Daftar Pelanggan
                </Link>
              </div>
            </div>
          )}

          <nav className="mobile-sidebar-nav">
            {/* Menu Utama */}
            <Link to="/" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
              <span className="mobile-nav-icon"><FaHome /></span>
              <span className="mobile-nav-label">Beranda</span>
            </Link>
            
            <Link to="/products" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
              <span className="mobile-nav-icon"><FaBox /></span>
              <span className="mobile-nav-label">Produk</span>
            </Link>

            <Link to="/cart" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
              <span className="mobile-nav-icon"><FaShoppingCart /></span>
              <span className="mobile-nav-label">Keranjang</span>
              {cartItemCount > 0 && (
                <span className="mobile-badge">{cartItemCount}</span>
              )}
            </Link>
            
            <Link to="/about" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
              <span className="mobile-nav-icon"><FaInfoCircle /></span>
              <span className="mobile-nav-label">Tentang Kami</span>
            </Link>
            
            <Link to="/contact" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
              <span className="mobile-nav-icon"><FaPhoneAlt /></span>
              <span className="mobile-nav-label">Kontak</span>
            </Link>
            
            {/* Menu Customer */}
            {user && user.role === 'customer' && (
              <>
                <div className="mobile-nav-divider">Akun Saya</div>
                <Link to="/customer/orders" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                  <span className="mobile-nav-icon"><FaShoppingBag /></span>
                  <span className="mobile-nav-label">Pesanan Saya</span>
                </Link>
                <Link to="/customer/profile" className="mobile-nav-item" onClick={() => setIsMenuOpen(false)}>
                  <span className="mobile-nav-icon"><FaUser /></span>
                  <span className="mobile-nav-label">Profil Saya</span>
                </Link>
              </>
            )}
            
            {/* Menu Admin */}
            {user?.role === 'admin' && (
              <>
                <div className="mobile-nav-divider">Admin Panel</div>
                {adminMenu.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className="mobile-nav-item admin"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <span className="mobile-nav-label">{item.label}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="mobile-sidebar-footer">
            {user ? (
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="btn btn-secondary logout-btn">
                <FaSignOutAlt /> Keluar
              </button>
            ) : (
              <div className="guest-footer">
                <p>Belum punya akun?</p>
                <Link to="/register" className="btn btn-outline" onClick={() => setIsMenuOpen(false)}>
                  Daftar Sekarang
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isMenuOpen && (
          <div className="sidebar-overlay" onClick={() => setIsMenuOpen(false)}></div>
        )}
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h3>Cari Produk</h3>
              <button className="close-search" onClick={() => setIsSearchOpen(false)}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="search-modal-form">
              <div className="search-input-group">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Cari produk, kategori, atau brand..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="search-modal-input"
                />
                <button type="submit" className="search-modal-submit">
                  Cari
                </button>
              </div>
            </form>
            
            <div className="search-suggestions">
              <h4>Pencarian Populer</h4>
              <div className="suggestion-tags">
                {quickSearchTerms.map((term, index) => (
                  <button 
                    key={index}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/products?search=${encodeURIComponent(term)}`);
                      setIsSearchOpen(false);
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;