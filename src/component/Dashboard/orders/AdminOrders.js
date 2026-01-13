import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './adminorders.css';

const AdminOrders = () => {
  const history = useHistory();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f39c12', icon: '📝' },
    { value: 'confirmed', label: 'Confirmed', color: '#3498db', icon: '✅' },
    { value: 'preparing', label: 'Preparing', color: '#9b59b6', icon: '👨‍🍳' },
    { value: 'out-for-delivery', label: 'Out for Delivery', color: '#e67e22', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: '#27ae60', icon: '🎉' },
    { value: 'cancelled', label: 'Cancelled', color: '#e74c3c', icon: '❌' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === filterStatus));
    }
  }, [filterStatus, orders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        history.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      setFilteredOrders(data.orders);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          note: `Order status updated to ${newStatus}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const updatedOrder = await response.json();
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(o => o.id === orderId ? updatedOrder : o)
      );

      alert(`Order #${orderId} updated to ${newStatus}`);
    } catch (err) {
      alert(err.message || 'Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      outForDelivery: orders.filter(o => o.status === 'out-for-delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    };
  };

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">
        {/* Header */}
        <div className="admin-header">
          <h1>📦 Order Management</h1>
          <button className="back-button" onClick={() => history.push('/admin')}>
            ← Back to Admin
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{stats.total}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-label">Pending</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚚</div>
            <div className="stat-content">
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{stats.confirmed + stats.preparing + stats.outForDelivery}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({orders.length})
          </button>
          {statusOptions.map(status => (
            <button
              key={status.value}
              className={`filter-tab ${filterStatus === status.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(status.value)}
            >
              {status.icon} {status.label} ({orders.filter(o => o.status === status.value).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {error && <div className="error-message">{error}</div>}
        
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📭</div>
            <h3>No orders found</h3>
            <p>There are no orders with the selected filter.</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div className="order-info">
                      <h3>Order #{order.id}</h3>
                      <span className="order-time">{formatTime(order.createdAt)}</span>
                    </div>
                    <div className="order-status-badge" style={{ backgroundColor: statusInfo.color }}>
                      {statusInfo.icon} {statusInfo.label}
                    </div>
                  </div>

                  <div className="order-card-body">
                    {/* Customer & Items Info */}
                    <div className="order-items-summary">
                      <strong>Items:</strong>
                      {order.items.map((item, idx) => (
                        <span key={idx} className="item-pill">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>

                    {/* Order Amount */}
                    <div className="order-amount">
                      <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
                    </div>

                    {/* Delivery Address */}
                    {order.address && (
                      <div className="order-address">
                        <strong>Address:</strong> {order.address}
                      </div>
                    )}
                  </div>

                  <div className="order-card-footer">
                    {/* Status Update Buttons */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="status-actions">
                        <label>Update Status:</label>
                        <div className="status-buttons">
                          {statusOptions
                            .filter(s => s.value !== order.status && s.value !== 'cancelled')
                            .map(status => (
                              <button
                                key={status.value}
                                className="status-update-btn"
                                style={{ borderColor: status.color, color: status.color }}
                                onClick={() => updateOrderStatus(order.id, status.value)}
                                disabled={updatingOrder === order.id}
                              >
                                {status.icon} {status.label}
                              </button>
                            ))}
                          <button
                            className="status-update-btn cancel-btn"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            disabled={updatingOrder === order.id}
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                    >
                      {selectedOrder === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {selectedOrder === order.id && (
                    <div className="order-details-expanded">
                      <h4>Order Timeline</h4>
                      <div className="timeline-list">
                        {order.statusHistory.slice().reverse().map((history, idx) => (
                          <div key={idx} className="timeline-entry">
                            <div className="timeline-time">{formatTime(history.timestamp)}</div>
                            <div className="timeline-status">
                              {getStatusInfo(history.status).label}
                            </div>
                            <div className="timeline-note">{history.note}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <button className="refresh-all-btn" onClick={fetchOrders}>
          🔄 Refresh Orders
        </button>
      </div>
    </div>
  );
};

export default AdminOrders;
