import React, { useState } from 'react';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { FaBox, FaTruck, FaCheck, FaTimes, FaEye, FaShoppingBag, FaClock, FaUser, FaMapMarkerAlt, FaCreditCard, FaPhone, FaEnvelope, FaTimesCircle } from 'react-icons/fa';
import './CustomerOrders.css';

const CustomerOrders = () => {
  const { getUserOrders } = useOrder();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const userOrders = getUserOrders();

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaClock />;
      case 'processing': return <FaBox />;
      case 'shipped': return <FaTruck />;
      case 'delivered': return <FaCheck />;
      case 'cancelled': return <FaTimes />;
      default: return <FaBox />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Menunggu Konfirmasi';
      case 'processing': return 'Sedang Diproses';
      case 'shipped': return 'Dalam Pengiriman';
      case 'delivered': return 'Terkirim';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Unknown';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format payment method
  const formatPaymentMethod = (method) => {
    switch(method) {
      case 'credit-card': return 'Kartu Kredit/Debit';
      case 'bank-transfer': return 'Transfer Bank';
      case 'e-wallet': return 'E-Wallet';
      case 'cod': return 'COD (Cash on Delivery)';
      default: return method;
    }
  };

  // Get payment status text
  const getPaymentStatusText = (status) => {
    switch(status) {
      case 'paid': return 'Lunas';
      case 'pending': return 'Menunggu Pembayaran';
      default: return status;
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return '#28a745';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (!user) {
    return (
      <div className="auth-required">
        <div className="auth-message">
          <h2>Anda perlu login untuk melihat pesanan</h2>
          <p>Silakan login untuk melihat riwayat pesanan Anda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-orders">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Pesanan Saya</h1>
          <p className="page-subtitle">Riwayat dan status pesanan Anda</p>
        </div>

        {userOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">
              <FaShoppingBag />
            </div>
            <h2>Belum Ada Pesanan</h2>
            <p>Anda belum melakukan pemesanan apapun.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/products'}
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <>
            <div className="orders-stats">
              <div className="stat-item">
                <span className="stat-label">Total Pesanan</span>
                <span className="stat-value">{userOrders.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Dalam Proses</span>
                <span className="stat-value">
                  {userOrders.filter(o => o.status === 'processing' || o.status === 'shipped').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Terkirim</span>
                <span className="stat-value">
                  {userOrders.filter(o => o.status === 'delivered').length}
                </span>
              </div>
            </div>

            <div className="orders-list">
              {userOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3>Pesanan #{order.id}</h3>
                      <p className="order-date">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="order-total">
                      <strong>Rp {order.totalAmount.toLocaleString()}</strong>
                    </div>
                  </div>
                  
                  <div className="order-status-bar">
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <FaEye /> Detail
                    </button>
                  </div>
                  
                  <div className="order-items-preview">
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} className="preview-item">
                        <img src={item.image} alt={item.name} />
                        <div className="preview-info">
                          <span className="product-name">{item.name}</span>
                          <span className="product-qty">x{item.quantity}</span>
                        </div>
                        <span className="product-price">
                          Rp {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    
                    {order.items.length > 2 && (
                      <div className="more-items">
                        +{order.items.length - 2} produk lainnya
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="order-details-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detail Pesanan #{selectedOrder.id}</h2>
                <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                  <FaTimesCircle />
                </button>
              </div>
              
              <div className="modal-content">
                <div className="order-status-info">
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    <span>{getStatusText(selectedOrder.status)}</span>
                  </div>
                  <p className="order-date">Dipesan pada {formatDate(selectedOrder.createdAt)}</p>
                </div>
                
                <div className="order-sections">
                  <div className="section">
                    <h4><FaUser /> Informasi Pelanggan</h4>
                    <div className="section-content">
                      <p><strong>Nama:</strong> {selectedOrder.customerName}</p>
                      <p><FaEnvelope /> <strong>Email:</strong> {selectedOrder.customerEmail}</p>
                      <p><FaPhone /> <strong>Telepon:</strong> {selectedOrder.customerPhone}</p>
                    </div>
                  </div>
                  
                  <div className="section">
                    <h4><FaMapMarkerAlt /> Alamat Pengiriman</h4>
                    <div className="section-content">
                      <p>{selectedOrder.shippingAddress?.address}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province}</p>
                      <p>Kode Pos: {selectedOrder.shippingAddress?.postalCode}</p>
                      {selectedOrder.shippingAddress?.notes && (
                        <p><strong>Catatan:</strong> {selectedOrder.shippingAddress.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="order-items-section">
                  <h4>Item Pesanan</h4>
                  <div className="items-list">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="item-detail">
                        <img src={item.image} alt={item.name} />
                        <div className="item-info">
                          <h5>{item.name}</h5>
                          <p>Rp {item.price.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <div className="item-total">
                          Rp {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="order-summary-section">
                  <h4><FaCreditCard /> Informasi Pembayaran</h4>
                  <div className="payment-info">
                    <p><strong>Metode Pembayaran:</strong> {formatPaymentMethod(selectedOrder.paymentMethod)}</p>
                    <p>
                      <strong>Status Pembayaran:</strong> 
                      <span 
                        className="payment-status" 
                        style={{ backgroundColor: getPaymentStatusColor(selectedOrder.paymentStatus) }}
                      >
                        {getPaymentStatusText(selectedOrder.paymentStatus)}
                      </span>
                    </p>
                  </div>
                  
                  <div className="summary-grid">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>Rp {selectedOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Ongkos Kirim</span>
                      <span>Rp {selectedOrder.shippingFee?.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>PPN (11%)</span>
                      <span>Rp {selectedOrder.tax?.toLocaleString()}</span>
                    </div>
                    <div className="summary-row grand-total">
                      <span>Total</span>
                      <span>Rp {selectedOrder.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Tutup
                </button>
                {selectedOrder.status === 'shipped' && (
                  <button className="btn btn-primary">
                    Lacak Pengiriman
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;