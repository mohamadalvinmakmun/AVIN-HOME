import React, { useState, useEffect } from 'react';
import { useOrder } from '../../../context/OrderContext';
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaTruck, FaBox, FaPrint, FaDownload, FaEdit, FaFilePdf, FaFileExcel, FaBars, FaEllipsisV } from 'react-icons/fa';
import './AdminOrders.css';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const itemsPerPage = 10;

  // Deteksi ukuran layar
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Filter by date range
    let matchesDate = true;
    if (dateRange.from) {
      const orderDate = new Date(order.createdAt);
      const fromDate = new Date(dateRange.from);
      matchesDate = matchesDate && orderDate >= fromDate;
    }
    if (dateRange.to) {
      const orderDate = new Date(order.createdAt);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && orderDate <= toDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const statusOptions = [
    { value: 'all', label: 'Semua Status', color: '#6c757d' },
    { value: 'pending', label: 'Menunggu', color: '#ffc107' },
    { value: 'processing', label: 'Diproses', color: '#17a2b8' },
    { value: 'shipped', label: 'Dikirim', color: '#007bff' },
    { value: 'delivered', label: 'Terkirim', color: '#28a745' },
    { value: 'cancelled', label: 'Dibatalkan', color: '#dc3545' }
  ];

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : '#6c757d';
  };

  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : 'Unknown';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleExport = (format) => {
    const exportData = filteredOrders.map(order => ({
      'ID Pesanan': order.id,
      'Pelanggan': order.customerName,
      'Email': order.customerEmail,
      'Tanggal': formatDate(order.createdAt),
      'Total': `Rp ${order.totalAmount.toLocaleString()}`,
      'Status': getStatusLabel(order.status),
      'Metode Bayar': formatPaymentMethod(order.paymentMethod)
    }));

    if (format === 'pdf') {
      alert(`Export PDF berhasil! ${exportData.length} data pesanan siap didownload.`);
    } else if (format === 'excel') {
      alert(`Export Excel berhasil! ${exportData.length} data pesanan siap didownload.`);
    }
  };

  const formatPaymentMethod = (method) => {
    switch(method) {
      case 'credit-card': return 'Kartu Kredit';
      case 'bank-transfer': return 'Transfer Bank';
      case 'e-wallet': return 'E-Wallet';
      case 'cod': return 'COD';
      default: return method;
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Laporan Pesanan - AVIN HOME</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Laporan Pesanan AVIN HOME</h1>
          <p>Tanggal: ${new Date().toLocaleDateString('id-ID')}</p>
          <p>Total Pesanan: ${filteredOrders.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID Pesanan</th>
                <th>Pelanggan</th>
                <th>Tanggal</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.customerName}</td>
                  <td>${formatDate(order.createdAt)}</td>
                  <td>Rp ${order.totalAmount.toLocaleString()}</td>
                  <td>${getStatusLabel(order.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.totalAmount, 0)
  };

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <div className="header-left">
          <h1>Manajemen Pesanan</h1>
          <p className="admin-subtitle">Kelola semua pesanan pelanggan</p>
        </div>
        <div className={`header-right ${isMobile ? 'mobile' : ''}`}>
          {isMobile ? (
            <button className="btn btn-mobile-menu">
              <FaBars />
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
                <FaFilePdf /> PDF
              </button>
              <button className="btn btn-secondary" onClick={() => handleExport('excel')}>
                <FaFileExcel /> Excel
              </button>
              <button className="btn btn-secondary" onClick={handlePrint}>
                <FaPrint /> Cetak
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className={`order-stats ${isMobile ? 'mobile' : ''}`}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
            <FaBox />
          </div>
          <div className="stat-info">
            <h3>Total Pesanan</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3cd', color: '#856404' }}>
            <span>⏳</span>
          </div>
          <div className="stat-info">
            <h3>Menunggu</h3>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </div>
        
        {!isMobile && (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#d1ecf1', color: '#0c5460' }}>
                <FaTruck />
              </div>
              <div className="stat-info">
                <h3>Diproses</h3>
                <div className="stat-value">{stats.processing}</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#d4edda', color: '#155724' }}>
                <FaCheck />
              </div>
              <div className="stat-info">
                <h3>Selesai</h3>
                <div className="stat-value">{stats.delivered}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Cari pesanan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <FaFilter />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="date-filter">
            <input 
              type="date" 
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              placeholder="Dari tanggal"
            />
            <span>sampai</span>
            <input 
              type="date" 
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              placeholder="Sampai tanggal"
            />
          </div>
        </div>
      </div>

      {/* Orders Table/Cards */}
      <div className="orders-table-container">
        {isMobile ? (
          // Mobile Cards View
          <div className="mobile-orders-list">
            {currentOrders.map(order => (
              <div key={order.id} className="mobile-order-card">
                <div className="mobile-order-header">
                  <div className="order-id">{order.id}</div>
                  <div className="mobile-order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
                
                <div className="mobile-order-details">
                  <div className="mobile-detail-row">
                    <span>Pelanggan</span>
                    <strong>{order.customerName}</strong>
                  </div>
                  <div className="mobile-detail-row">
                    <span>Tanggal</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="mobile-detail-row">
                    <span>Total</span>
                    <strong className="order-total">Rp {order.totalAmount.toLocaleString()}</strong>
                  </div>
                  <div className="mobile-detail-row">
                    <span>Metode Bayar</span>
                    <span>{formatPaymentMethod(order.paymentMethod)}</span>
                  </div>
                </div>
                
                <div className="mobile-order-actions">
                  <button 
                    className="btn-icon btn-view"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <FaEye />
                  </button>
                  <select 
                    className="status-select"
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    style={{ 
                      backgroundColor: getStatusColor(order.status),
                      color: 'white'
                    }}
                  >
                    {statusOptions
                      .filter(opt => opt.value !== 'all')
                      .map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID Pesanan</th>
                <th>Pelanggan</th>
                <th>Tanggal</th>
                <th>Total</th>
                <th>Status</th>
                <th>Metode Bayar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                  </td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.customerName}</strong>
                      <span>{order.customerEmail}</span>
                    </div>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <strong>Rp {order.totalAmount.toLocaleString()}</strong>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>
                    <span className="payment-method">
                      {formatPaymentMethod(order.paymentMethod)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon btn-view"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <FaEye />
                      </button>
                      
                      <select 
                        className="status-select"
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        style={{ 
                          backgroundColor: getStatusColor(order.status),
                          color: 'white'
                        }}
                      >
                        {statusOptions
                          .filter(opt => opt.value !== 'all')
                          .map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {currentOrders.length === 0 && (
          <div className="no-orders">
            <FaBox />
            <p>Tidak ada pesanan yang ditemukan</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Export Options */}
      {isMobile && (
        <div className="mobile-export-options">
          <h4>Export Laporan</h4>
          <div className="export-buttons">
            <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
              <FaFilePdf /> PDF
            </button>
            <button className="btn btn-secondary" onClick={() => handleExport('excel')}>
              <FaFileExcel /> Excel
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              <FaPrint /> Cetak
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;