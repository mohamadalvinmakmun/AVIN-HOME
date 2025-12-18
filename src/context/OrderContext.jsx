import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load orders from localStorage on initial render
  useEffect(() => {
    const savedOrders = localStorage.getItem('avin_orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
        setOrders([]);
      }
    }
  }, []);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('avin_orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders to localStorage:', error);
    }
  }, [orders]);

  // Create new order - PERBAIKI: tambahkan userId jika user ada
  const createOrder = (orderData) => {
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substr(2, 4)}`,
      ...orderData,
      // Tambahkan userId dari user yang login
      userId: user?.id || user?.email || 'guest',
      customerEmail: orderData.customerEmail || user?.email || 'guest@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      paymentStatus: 'pending'
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  // PERBAIKI FUNGSI INI: cari berdasarkan email atau userId
  // Get orders by user
  const getUserOrders = () => {
    if (!user) return [];
    
    // Coba cari berdasarkan userId dulu
    if (user.id) {
      return orders.filter(order => order.userId === user.id);
    }
    
    // Jika tidak ada userId, cari berdasarkan email
    if (user.email) {
      return orders.filter(order => 
        order.customerEmail === user.email || 
        (order.userId && order.userId === user.email)
      );
    }
    
    return [];
  };

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus, 
            updatedAt: new Date().toISOString(),
            ...(newStatus === 'delivered' ? { paymentStatus: 'paid' } : {})
          }
        : order
    ));
  };

  // Update payment status
  const updatePaymentStatus = (orderId, paymentStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, paymentStatus, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  // Delete order
  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  // Get orders by status
  const getOrdersByStatus = (status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  // Get recent orders
  const getRecentOrders = (limit = 10) => {
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  // Get orders stats
  const getOrdersStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    
    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  };

  // Get monthly revenue
  const getMonthlyRevenue = () => {
    const monthlyRevenue = {};
    
    orders.forEach(order => {
      if (order.paymentStatus === 'paid') {
        const date = new Date(order.createdAt);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyRevenue[monthYear]) {
          monthlyRevenue[monthYear] = 0;
        }
        monthlyRevenue[monthYear] += order.totalAmount;
      }
    });

    return monthlyRevenue;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      loading,
      createOrder,
      updateOrderStatus,
      updatePaymentStatus,
      deleteOrder,
      getOrdersByStatus,
      getUserOrders,
      getRecentOrders,
      getOrdersStats,
      getMonthlyRevenue
    }}>
      {children}
    </OrderContext.Provider>
  );
};