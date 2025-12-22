import React, { useState } from 'react';
import { FaTrash, FaMinus, FaPlus, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './CartItem.css';

const CartItem = ({ 
  item, 
  onIncreaseQuantity, 
  onDecreaseQuantity, 
  onManualQuantityChange,
  maxQuantity,
  isExceedingStock 
}) => {
  const { removeFromCart } = useCart();
  const [quantityInput, setQuantityInput] = useState(item.quantity.toString());
  const [inputError, setInputError] = useState(false);

  const finalPrice = item.discountPrice || item.price;
  const totalPrice = finalPrice * item.quantity;

  // Cek apakah quantity sudah mencapai batas maksimum
  const isAtMaxLimit = item.quantity >= maxQuantity;
  const isBelowMinLimit = item.quantity <= 1;
  const stockAvailable = maxQuantity - item.quantity;

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantityInput(value);
    
    // Validasi input hanya angka
    if (/^\d*$/.test(value)) {
      setInputError(false);
      
      if (value && parseInt(value) > 0) {
        const numValue = parseInt(value);
        if (numValue <= maxQuantity) {
          onManualQuantityChange(item.id, numValue);
        }
      }
    } else {
      setInputError(true);
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(quantityInput) || 1;
    
    // Batasi nilai antara 1 dan maxQuantity
    const clampedValue = Math.min(Math.max(1, numValue), maxQuantity);
    
    if (clampedValue !== item.quantity) {
      setQuantityInput(clampedValue.toString());
      onManualQuantityChange(item.id, clampedValue);
    } else {
      setQuantityInput(item.quantity.toString());
    }
    
    setInputError(false);
  };

  const handleIncrease = () => {
    if (!isAtMaxLimit) {
      onIncreaseQuantity(item.id);
      setQuantityInput((item.quantity + 1).toString());
    }
  };

  const handleDecrease = () => {
    if (!isBelowMinLimit) {
      onDecreaseQuantity(item.id);
      setQuantityInput((item.quantity - 1).toString());
    }
  };

  const handleRemove = () => {
    if (window.confirm(`Hapus "${item.name}" dari keranjang?`)) {
      removeFromCart(item.id);
    }
  };

  return (
    <div className={`cart-item ${isExceedingStock ? 'exceeding-stock' : ''} ${isAtMaxLimit ? 'at-limit' : ''}`}>
      <div className="cart-item-top">
        <div className="cart-item-image">
          <img 
            src={item.image || '/default-product.jpg'} 
            alt={item.name} 
            loading="lazy"
          />
          {isExceedingStock && (
            <div className="stock-exceed-overlay">
              <FaExclamationTriangle />
              <span>STOK TERBATAS</span>
            </div>
          )}
        </div>
        
        <div className="cart-item-info">
          <div className="cart-item-header">
            <h3 className="cart-item-name">{item.name}</h3>
            <div className="cart-item-status">
              {isExceedingStock ? (
                <div className="status-badge status-danger">
                  <FaExclamationTriangle /> Melebihi Stok
                </div>
              ) : isAtMaxLimit ? (
                <div className="status-badge status-warning">
                  <FaExclamationTriangle /> Maksimal
                </div>
              ) : stockAvailable <= 3 ? (
                <div className="status-badge status-info">
                  <FaExclamationTriangle /> Hampir Habis
                </div>
              ) : null}
            </div>
          </div>
          
          <p className="cart-item-description">
            {item.description || "Produk berkualitas dengan bahan premium"}
          </p>
          
          <div className="cart-item-price-section">
            <div className="price-container">
              <span className="cart-item-price-current">Rp {finalPrice.toLocaleString('id-ID')}</span>
              {item.discountPrice && item.discountPrice < item.price && (
                <span className="cart-item-price-original">Rp {item.price.toLocaleString('id-ID')}</span>
              )}
            </div>
            
            <div className="stock-indicator">
              <div className="stock-label">Stok Tersedia:</div>
              <div className={`stock-value ${isExceedingStock ? 'danger' : stockAvailable <= 3 ? 'warning' : 'success'}`}>
                {maxQuantity} item
                {!isExceedingStock && stockAvailable > 0 && (
                  <span className="stock-remaining">
                    (tersisa {stockAvailable})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="cart-item-middle">
        <div className="quantity-section">
          <div className="section-label">Jumlah:</div>
          <div className="quantity-controls-wrapper">
            <div className="quantity-controls">
              <button 
                className={`quantity-btn ${isBelowMinLimit ? 'disabled' : ''}`}
                onClick={handleDecrease}
                aria-label="Kurangi jumlah"
                disabled={isBelowMinLimit}
                title="Kurangi"
              >
                <FaMinus />
              </button>
              
              <div className="quantity-input-container">
                <input
                  type="text"
                  className={`quantity-input ${inputError ? 'error' : ''}`}
                  value={quantityInput}
                  onChange={handleQuantityChange}
                  onBlur={handleBlur}
                  max={maxQuantity}
                  min="1"
                  aria-label="Jumlah produk"
                />
                <div className="input-helper">
                  {isAtMaxLimit && (
                    <div className="max-limit-message">
                      <FaExclamationTriangle />
                      <span>Maksimum tercapai</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                className={`quantity-btn ${isAtMaxLimit ? 'disabled' : ''}`}
                onClick={handleIncrease}
                aria-label="Tambah jumlah"
                disabled={isAtMaxLimit}
                title={isAtMaxLimit ? "Sudah mencapai batas stok" : "Tambah"}
              >
                <FaPlus />
              </button>
            </div>
            
            {isExceedingStock && (
              <div className="stock-warning-message">
                <FaExclamationTriangle />
                <div className="warning-content">
                  <strong>Peringatan:</strong> Quantity dibatasi maksimal {maxQuantity} item.
                  <small>Jumlah akan disesuaikan otomatis saat checkout.</small>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="total-section">
          <div className="section-label">Subtotal:</div>
          <div className="total-price-container">
            <div className="cart-item-total-price">Rp {totalPrice.toLocaleString('id-ID')}</div>
            {item.discountPrice && item.discountPrice < item.price && (
              <div className="discount-saved">
                Hemat Rp {(item.price - item.discountPrice) * item.quantity}
              </div>
            )}
            {isExceedingStock && (
              <div className="total-note">
                <FaExclamationTriangle />
                <span>Harga akan disesuaikan</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="cart-item-bottom">
        <button 
          className="remove-btn" 
          onClick={handleRemove}
          aria-label="Hapus item"
          title="Hapus dari keranjang"
        >
          <FaTrash />
          <span className="remove-btn-text">Hapus Item</span>
        </button>
      </div>
    </div>
  );
};

export default CartItem;