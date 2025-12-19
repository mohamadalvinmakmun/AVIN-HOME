import React, { useState, useEffect, useRef } from 'react';
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
  FaUserPlus,
  FaCog,
  FaHistory,
  FaBell
} from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null); // Tambah ref untuk sidebar

  const cartItemCount = getItemCount();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const adminMenu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { path: '/admin/products', label: 'Produk', icon: <FaBox /> },
    { path: '/admin/orders', label: 'Pesanan', icon: <FaShoppingBag /> },
    { path: '/admin/users', label: 'Pengguna', icon: <FaUsers /> },
    { path: '/admin/settings', label: 'Pengaturan', icon: <FaCog /> },
  ];

  const customerMenu = [
    { path: '/customer/orders', label: 'Pesanan Saya', icon: <FaHistory /> },
    { path: '/customer/profile', label: 'Profil Saya', icon: <FaUser /> },
    { path: '/customer/notifications', label: 'Notifikasi', icon: <FaBell />, },
  ];

  const publicMenu = [
    { path: '/', label: 'Beranda', icon: <FaHome /> },
    { path: '/products', label: 'Produk', icon: <FaBox /> },
    { path: '/about', label: 'Tentang', icon: <FaInfoCircle /> },
    { path: '/contact', label: 'Kontak', icon: <FaPhoneAlt /> },
  ];

  const quickSearchTerms = ['Sofa', 'Meja Makan', 'Tempat Tidur', 'Lemari', 'Kursi', 'Lampu', 'Dapur'];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  // Toggle user dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
                {/* Public Menu Items */}
                {publicMenu.map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                ))}

                {/* Customer Menu Items when logged in */}
                {user && user.role === 'customer' && (
                  <>
                    <li>
                      <Link 
                        to="/customer/orders" 
                        className={`nav-link ${location.pathname.includes('/customer/orders') ? 'active' : ''}`}
                      >
                        <FaShoppingBag />
                        Pesanan Saya
                      </Link>
                    </li>
                  </>
                )}
                
                {/* Admin Dropdown */}
                {user?.role === 'admin' && (
                  <li className="nav-dropdown">
                    <span className="nav-link">
                      <FaChartBar />
                      Admin
                    </span>
                    <div className="dropdown-menu">
                      {adminMenu.map((item) => (
                        <Link 
                          key={item.path} 
                          to={item.path} 
                          className="dropdown-item"
                        >
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
                title="Cari produk"
              >
                <FaSearch />
              </button>

              {/* Cart */}
              <Link to="/cart" className="action-btn cart-btn" title="Keranjang Belanja">
                <FaShoppingCart />
                {cartItemCount > 0 && (
                  <span className="cart-badge">{cartItemCount}</span>
                )}
              </Link>

              {/* User Menu - Desktop */}
              <div className="user-menu" ref={dropdownRef}>
                {user ? (
                  <>
                    <button 
                      className="action-btn user-btn"
                      onClick={toggleDropdown}
                      aria-label="User menu"
                      title={`Akun ${user.name}`}
                    >
                      <div className={`user-avatar ${user.role}`}>
                        {getUserInitials()}
                      </div>
                    </button>
                    {isDropdownOpen && (
                      <div className="user-dropdown">
                        <div className="user-info">
                          <div className={`user-avatar ${user.role}`}>
                            {getUserInitials()}
                          </div>
                          <div className="user-details">
                            <h4 className="user-name-full">{user.name}</h4>
                            <p className="user-role">
                              {user.role === 'admin' ? 'Administrator' : 'Pelanggan'}
                            </p>
                          </div>
                        </div>
                        <div className="dropdown-divider"></div>
                        
                        {/* Customer Dropdown Menu */}
                        {user.role === 'customer' ? (
                          <>
                            {customerMenu.map((item) => (
                              <Link 
                                key={item.path} 
                                to={item.path} 
                                className="dropdown-item"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.badge && (
                                  <span className="dropdown-badge">{item.badge}</span>
                                )}
                              </Link>
                            ))}
                            <Link 
                              to="/cart" 
                              className="dropdown-item"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <FaShoppingCart />
                              <span>Keranjang</span>
                              {cartItemCount > 0 && (
                                <span className="dropdown-badge">{cartItemCount}</span>
                              )}
                            </Link>
                          </>
                        ) : (
                          /* Admin Dropdown Menu */
                          <>
                            {adminMenu.map((item) => (
                              <Link 
                                key={item.path} 
                                to={item.path} 
                                className="dropdown-item"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                {item.icon}
                                <span>{item.label}</span>
                              </Link>
                            ))}
                          </>
                        )}
                        
                        <div className="dropdown-divider"></div>
                        <button 
                          onClick={handleLogout} 
                          className="dropdown-item logout"
                        >
                          <FaSignOutAlt />
                          <span>Keluar</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="login-dropdown">
                    <button 
                      className="action-btn user-btn"
                      onClick={toggleDropdown}
                      aria-label="Login"
                      title="Masuk ke akun"
                    >
                      <FaUser />
                    </button>
                    {isDropdownOpen && (
                      <div className="user-dropdown">
                        <div className="dropdown-header">
                          <h4>Masuk ke Akun</h4>
                          <p>Akses belanja & transaksi</p>
                        </div>
                        <div className="dropdown-divider"></div>
                        <Link 
                          to="/customer/login" 
                          className="dropdown-item customer-login"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FaUsers />
                          <div>
                            <strong>Login Pelanggan</strong><br />
                            <small>Mulai berbelanja sekarang</small>
                          </div>
                        </Link>
                        <div className="dropdown-divider"></div>
                        <Link 
                          to="/register" 
                          className="dropdown-item"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FaUserPlus />
                          <div>
                            <strong>Daftar Pelanggan</strong><br />
                            <small>Buat akun baru</small>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Menu"
                title="Menu"
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Navigation */}
        <div className={`mobile-sidebar ${isMenuOpen ? 'open' : ''}`} ref={sidebarRef}>
          <div className="mobile-sidebar-header">
            {user ? (
              <div className="mobile-user-info">
                <div className={`mobile-user-avatar ${user.role}`}>
                  {getUserInitials()}
                </div>
                <div className="mobile-user-details">
                  <h4 className="mobile-user-name">{user.name}</h4>
                  <p className="mobile-user-role">
                    {user.role === 'admin' ? 'Administrator' : 'Pelanggan'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="auth-buttons-header">
                <h4>Masuk ke Akun</h4>
                <p>Akses belanja & transaksi</p>
              </div>
            )}
            <button 
              className="close-sidebar" 
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>

          {!user && (
            <div className="mobile-sidebar-auth">
              <div className="mobile-auth-buttons">
                <Link 
                  to="/customer/login" 
                  className="btn btn-primary" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUsers /> 
                  <span>Login Pelanggan</span>
                </Link>
                <div className="divider-text">
                  <span>ATAU</span>
                </div>
                <Link 
                  to="/register" 
                  className="btn btn-outline" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserPlus /> 
                  <span>Daftar Pelanggan</span>
                </Link>
              </div>
            </div>
          )}

          <div className="mobile-nav-scroll-container">
            <nav className="mobile-sidebar-nav">
              {/* Public Menu */}
              {publicMenu.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  <span className="mobile-nav-label">{item.label}</span>
                </Link>
              ))}

              {/* Cart Item */}
              <Link 
                to="/cart" 
                className="mobile-nav-item"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mobile-nav-icon"><FaShoppingCart /></span>
                <span className="mobile-nav-label">Keranjang</span>
                {cartItemCount > 0 && (
                  <span className="mobile-badge">{cartItemCount}</span>
                )}
              </Link>
              
              {/* Menu Customer */}
              {user && user.role === 'customer' && (
                <>
                  <div className="mobile-nav-divider">Akun Saya</div>
                  {customerMenu.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      className={`mobile-nav-item ${location.pathname.includes(item.path) ? 'active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mobile-nav-icon">{item.icon}</span>
                      <span className="mobile-nav-label">{item.label}</span>
                      {item.badge && (
                        <span className="mobile-badge">{item.badge}</span>
                      )}
                    </Link>
                  ))}
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
                      className={`mobile-nav-item admin ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mobile-nav-icon">{item.icon}</span>
                      <span className="mobile-nav-label">{item.label}</span>
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="mobile-sidebar-footer">
            {user ? (
              <button 
                onClick={() => { 
                  handleLogout(); 
                  setIsMenuOpen(false); 
                }} 
                className="btn btn-secondary logout-btn"
              >
                <FaSignOutAlt /> 
                <span>Keluar</span>
              </button>
            ) : (
              <div className="guest-footer">
                <p>Belum punya akun?</p>
                <Link 
                  to="/register" 
                  className="btn btn-outline" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserPlus />
                  <span>Daftar Sekarang</span>
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
              <button 
                className="close-search" 
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
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
                  aria-label="Search products"
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
                    aria-label={`Search for ${term}`}
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