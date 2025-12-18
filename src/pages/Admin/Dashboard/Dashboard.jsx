import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrder } from '../../../context/OrderContext'; // Ubah dari useOrders menjadi useOrder
import { useProducts } from '../../../context/ProductsContext';
import { 
  FaChartLine, 
  FaShoppingCart, 
  FaUsers, 
  FaBox, 
  FaMoneyBillWave,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { getOrdersStats, getRecentOrders, getOrdersByStatus } = useOrder(); // Ubah di sini juga
  const { products } = useProducts();
  
  const stats = getOrdersStats();
  const recentOrders = getRecentOrders(5);
  const pendingOrders = getOrdersByStatus('pending');

  // ... sisa kode tetap sama

  // Chart data (sample)
  const monthlyRevenue = [
    { month: 'Jan', revenue: 45000000 },
    { month: 'Feb', revenue: 52000000 },
    { month: 'Mar', revenue: 48000000 },
    { month: 'Apr', revenue: 60000000 },
    { month: 'May', revenue: 55000000 },
    { month: 'Jun', revenue: 65000000 },
  ];

  // Top products
  const topProducts = products.slice(0, 5);

  // Format currency
  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString()}`;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Admin</h1>
        <p className="dashboard-subtitle">Ringkasan performa toko</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>Total Pendapatan</h3>
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-change up">
              <FaArrowUp /> +12.5%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orders">
            <FaShoppingCart />
          </div>
          <div className="stat-info">
            <h3>Total Pesanan</h3>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-change up">
              <FaArrowUp /> +8.2%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon products">
            <FaBox />
          </div>
          <div className="stat-info">
            <h3>Total Produk</h3>
            <div className="stat-value">{products.length}</div>
            <div className="stat-change up">
              <FaArrowUp /> +5.7%
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon customers">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>Pelanggan Baru</h3>
            <div className="stat-value">1,248</div>
            <div className="stat-change down">
              <FaArrowDown /> -2.1%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Revenue Chart */}
        <div className="dashboard-section revenue-chart">
          <div className="section-header">
            <h2>Pendapatan Bulanan</h2>
            <select className="period-select">
              <option>6 Bulan Terakhir</option>
              <option>12 Bulan Terakhir</option>
              <option>Tahun Ini</option>
            </select>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {monthlyRevenue.map((month, index) => (
                <div key={index} className="chart-bar">
                  <div className="bar-label">{month.month}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill"
                      style={{ height: `${(month.revenue / 70000000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{formatCurrency(month.revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section recent-orders">
          <div className="section-header">
            <h2>Pesanan Terbaru</h2>
            <Link to="/admin/orders" className="view-all">
              Lihat Semua <FaEye />
            </Link>
          </div>
          <div className="orders-list">
            {recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <div className="order-id">{order.id}</div>
                  <div className="order-customer">{order.customerName}</div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'pending' && 'Menunggu'}
                    {order.status === 'processing' && 'Diproses'}
                    {order.status === 'shipped' && 'Dikirim'}
                    {order.status === 'delivered' && 'Terkirim'}
                    {order.status === 'cancelled' && 'Dibatalkan'}
                  </span>
                </div>
                <div className="order-total">{formatCurrency(order.totalAmount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="dashboard-section pending-orders">
          <div className="section-header">
            <h2>Pesanan Menunggu</h2>
            <span className="count-badge">{pendingOrders.length}</span>
          </div>
          <div className="pending-list">
            {pendingOrders.slice(0, 3).map(order => (
              <div key={order.id} className="pending-item">
                <div className="pending-info">
                  <div className="pending-id">{order.id}</div>
                  <div className="pending-customer">{order.customerName}</div>
                  <div className="pending-time">
                    {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <Link to="/admin/orders" className="btn btn-sm btn-primary">
                  Proses
                </Link>
              </div>
            ))}
          </div>
          {pendingOrders.length > 3 && (
            <div className="more-orders">
              <Link to="/admin/orders">
                +{pendingOrders.length - 3} pesanan menunggu lainnya
              </Link>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="dashboard-section top-products">
          <div className="section-header">
            <h2>Produk Terlaris</h2>
          </div>
          <div className="products-list">
            {topProducts.map(product => (
              <div key={product.id} className="product-item">
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <div className="product-stats">
                    <span className="price">{formatCurrency(product.price)}</span>
                    <span className="sold">45 terjual</span>
                  </div>
                </div>
                <div className="product-rating">
                  <span className="stars">★★★★★</span>
                  <span className="rating">4.8</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;