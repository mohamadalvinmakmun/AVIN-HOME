import React, { useState, useEffect } from 'react';
import { useProducts } from '../../../context/ProductsContext';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaTimes,
  FaBox,
  FaDollarSign,
  FaLayerGroup,
  FaStar,
  FaEllipsisV,
  FaFileExport,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import './AdminProducts.css';

const AdminProducts = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts();
  
  // State untuk filtering dan sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // State untuk modals
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // State untuk new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: categories.length > 0 ? categories[0].id : 'living-room',
    price: '',
    discountPrice: '',
    description: '',
    stock: 10,
    image: '',
    status: 'active'
  });

  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.stock < 10 && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.discountPrice || p.price) * p.stock, 0)
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'price':
          aValue = a.discountPrice || a.price;
          bValue = b.discountPrice || b.price;
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Event handlers
  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      addProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        discountPrice: newProduct.discountPrice ? parseFloat(newProduct.discountPrice) : null,
        stock: parseInt(newProduct.stock),
        rating: 0,
        reviews: []
      });
      setNewProduct({
        name: '',
        category: categories.length > 0 ? categories[0].id : 'living-room',
        price: '',
        discountPrice: '',
        description: '',
        stock: 10,
        image: '',
        status: 'active'
      });
      setShowAddModal(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit && editingProduct) {
      setEditingProduct(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'discountPrice' || name === 'stock' 
                ? value === '' ? '' : parseFloat(value) 
                : value
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'discountPrice' || name === 'stock' 
                ? value === '' ? '' : parseFloat(value)
                : value
      }));
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleExport = (format) => {
    console.log(`Exporting products to ${format}`);
    alert(`Produk diekspor ke format ${format.toUpperCase()}`);
  };

  const handleMobileAction = (product, action) => {
    setSelectedProduct(product);
    if (action === 'edit') {
      handleEditProduct(product);
    } else if (action === 'delete') {
      handleDeleteClick(product);
    } else if (action === 'view') {
      // Navigate to product detail
      console.log('View product:', product.id);
    }
    setShowMobileActions(false);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, statusFilter]);

  return (
    <div className="admin-products">
      {/* Header Section */}
      <div className="admin-header">
        <div className="header-left">
          <h1>Manajemen Produk</h1>
          <p className="admin-subtitle">Kelola produk dan inventori Anda</p>
        </div>
        
        <div className="header-right">
          <button 
            className="btn btn-primary btn-add"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Tambah Produk
          </button>
          
          <button 
            className="btn-mobile-menu"
            onClick={() => setShowMobileActions(!showMobileActions)}
          >
            <FaEllipsisV />
          </button>
        </div>
      </div>

      {showMobileActions && (
        <div className="mobile-actions-menu">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Tambah Produk
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
            <FaFileExport /> Ekspor CSV
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="products-stats desktop">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
            <FaBox />
          </div>
          <div className="stat-info">
            <h3>Total Produk</h3>
            <div className="stat-value">{stats.totalProducts}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9', color: '#388e3c' }}>
            <FaLayerGroup />
          </div>
          <div className="stat-info">
            <h3>Aktif</h3>
            <div className="stat-value">{stats.activeProducts}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
            <FaDollarSign />
          </div>
          <div className="stat-info">
            <h3>Nilai Inventori</h3>
            <div className="stat-value">Rp {stats.totalValue.toLocaleString('id-ID')}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fce4ec', color: '#c2185b' }}>
            <FaStar />
          </div>
          <div className="stat-info">
            <h3>Stok Rendah</h3>
            <div className="stat-value">{stats.lowStock}</div>
          </div>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="products-stats mobile">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
            <FaBox />
          </div>
          <div className="stat-info">
            <h3>Total</h3>
            <div className="stat-value">{stats.totalProducts}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fce4ec', color: '#c2185b' }}>
            <FaStar />
          </div>
          <div className="stat-info">
            <h3>Stok Rendah</h3>
            <div className="stat-value">{stats.lowStock}</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <FaFilter />
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
          
          <div className="filter-group">
            <select 
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="name">Urutkan: Nama</option>
              <option value="price">Urutkan: Harga</option>
              <option value="stock">Urutkan: Stok</option>
              <option value="rating">Urutkan: Rating</option>
            </select>
            <button 
              className="sort-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
            </button>
          </div>
        </div>
      </div>

      {/* Products Table (Desktop) */}
      <div className="products-table-container desktop-view">
        {filteredProducts.length > 0 ? (
          <>
            <table className="products-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Produk {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Kategori</th>
                  <th onClick={() => handleSort('price')} className="sortable">
                    Harga {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('stock')} className="sortable">
                    Stok {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-info">
                        <img 
                          src={product.image || '/default-product.jpg'} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = '/default-product.jpg';
                          }}
                        />
                        <div>
                          <div className="product-name">{product.name}</div>
                          <div className="product-description">
                            {product.description.substring(0, 50)}...
                          </div>
                          {product.discountPrice && (
                            <div className="discount-price">
                              Diskon: Rp {product.discountPrice.toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {categories.find(c => c.id === product.category)?.name || product.category}
                      </span>
                    </td>
                    <td>
                      <div className="price-display">
                        {product.discountPrice ? (
                          <>
                            <span className="discounted">Rp {product.discountPrice.toLocaleString('id-ID')}</span>
                            <span className="original">Rp {product.price.toLocaleString('id-ID')}</span>
                          </>
                        ) : (
                          <span>Rp {product.price.toLocaleString('id-ID')}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${product.status}`}>
                        {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-edit"
                          onClick={() => handleEditProduct(product)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteClick(product)}
                          title="Hapus"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
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
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-products">
            <FaBox />
            <h3>Tidak ada produk ditemukan</h3>
            <p>Coba ubah filter pencarian Anda</p>
          </div>
        )}
      </div>

      {/* Mobile Products List */}
      <div className="mobile-products-list">
        {filteredProducts.length > 0 ? (
          currentProducts.map(product => (
            <div key={product.id} className="mobile-product-card">
              <div className="mobile-product-header">
                <img 
                  src={product.image || '/default-product.jpg'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/default-product.jpg';
                  }}
                />
                <div className="mobile-product-info">
                  <h4>{product.name}</h4>
                  <span className="mobile-product-category">
                    {categories.find(c => c.id === product.category)?.name || product.category}
                  </span>
                </div>
                <button 
                  className="mobile-menu-btn"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowMobileActions(true);
                  }}
                >
                  <FaEllipsisV />
                </button>
              </div>
              
              <div className="mobile-product-details">
                <div className="mobile-detail-row">
                  <span>Harga:</span>
                  <span className="price-mobile">
                    {product.discountPrice ? (
                      <>
                        <span className="discounted">Rp {product.discountPrice.toLocaleString('id-ID')}</span>
                        <span className="original">Rp {product.price.toLocaleString('id-ID')}</span>
                      </>
                    ) : (
                      <span>Rp {product.price.toLocaleString('id-ID')}</span>
                    )}
                  </span>
                </div>
                
                <div className="mobile-detail-row">
                  <span>Stok:</span>
                  <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                    {product.stock}
                  </span>
                </div>
                
                <div className="mobile-detail-row">
                  <span>Status:</span>
                  <span className={`status-badge ${product.status}`}>
                    {product.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              
              <div className="mobile-product-actions">
                <button 
                  className="btn-icon btn-edit"
                  onClick={() => handleEditProduct(product)}
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteClick(product)}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <FaBox />
            <h3>Tidak ada produk ditemukan</h3>
            <p>Coba ubah filter pencarian Anda</p>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="export-options">
        <h4>Ekspor Data</h4>
        <div className="export-buttons">
          <button className="btn btn-secondary" onClick={() => handleExport('csv')}>
            Ekspor CSV
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('excel')}>
            Ekspor Excel
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('pdf')}>
            Ekspor PDF
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tambah Produk Baru</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Nama Produk *</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  placeholder="Nama produk"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Kategori</label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Harga Normal (Rp) *</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder="100000"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Harga Diskon (Rp)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={newProduct.discountPrice}
                  onChange={handleInputChange}
                  placeholder="80000"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Stok *</label>
                <input
                  type="number"
                  name="stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={newProduct.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
              
              <div className="form-group full-width">
                <label>URL Gambar</label>
                <input
                  type="text"
                  name="image"
                  value={newProduct.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Deskripsi</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  placeholder="Deskripsi produk..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddProduct}
                disabled={!newProduct.name || !newProduct.price}
              >
                Simpan Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Produk</h2>
              <button className="close-modal" onClick={() => setEditingProduct(null)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Nama Produk *</label>
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Kategori</label>
                <select
                  name="category"
                  value={editingProduct.category}
                  onChange={(e) => handleInputChange(e, true)}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Harga Normal (Rp) *</label>
                <input
                  type="number"
                  name="price"
                  value={editingProduct.price}
                  onChange={(e) => handleInputChange(e, true)}
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Harga Diskon (Rp)</label>
                <input
                  type="number"
                  name="discountPrice"
                  value={editingProduct.discountPrice || ''}
                  onChange={(e) => handleInputChange(e, true)}
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label>Stok *</label>
                <input
                  type="number"
                  name="stock"
                  value={editingProduct.stock}
                  onChange={(e) => handleInputChange(e, true)}
                  min="0"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={editingProduct.status}
                  onChange={(e) => handleInputChange(e, true)}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
              
              <div className="form-group full-width">
                <label>URL Gambar</label>
                <input
                  type="text"
                  name="image"
                  value={editingProduct.image}
                  onChange={(e) => handleInputChange(e, true)}
                />
              </div>
              
              <div className="form-group full-width">
                <label>Deskripsi</label>
                <textarea
                  name="description"
                  value={editingProduct.description}
                  onChange={(e) => handleInputChange(e, true)}
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setEditingProduct(null)}
              >
                Batal
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateProduct}
                disabled={!editingProduct.name || !editingProduct.price}
              >
                Update Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hapus Produk</h2>
              <button className="close-modal" onClick={() => setShowDeleteModal(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="delete-content">
              <p>Apakah Anda yakin ingin menghapus produk <strong>"{productToDelete?.name}"</strong>?</p>
              <p className="warning-text">Tindakan ini tidak dapat dibatalkan. Semua data produk akan dihapus permanen.</p>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Action Modal */}
      {showMobileActions && selectedProduct && (
        <div className="mobile-action-overlay" onClick={() => setShowMobileActions(false)}>
          <div className="mobile-action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-action-header">
              <h3>Aksi Produk</h3>
              <button className="close-mobile-modal" onClick={() => setShowMobileActions(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="mobile-action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => handleMobileAction(selectedProduct, 'edit')}
              >
                <FaEdit /> Edit Produk
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleMobileAction(selectedProduct, 'delete')}
              >
                <FaTrash /> Hapus Produk
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowMobileActions(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;