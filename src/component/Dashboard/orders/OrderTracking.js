import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import './ordertracking.css';

const OrderTracking = () => {
  const { orderId } = useParams();
  const history = useHistory();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' }
  ];

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/track`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      const data = await response.json();
      setOrder(data);
      setError('');
      
      // Stop auto-refresh if delivered or cancelled
      if (data.status === 'delivered' || data.status === 'cancelled') {
        setAutoRefresh(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
  }, [orderId]);

  // Auto-refresh every 30 seconds if order is active
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchOrderStatus();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, orderId]);

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.key === order?.status);
  };

  const getEstimatedTimeRemaining = () => {
    if (!order?.estimatedDeliveryTime) return 'Calculating...';
    
    const now = new Date();
    const delivery = new Date(order.estimatedDeliveryTime);
    const diff = delivery - now;
    
    if (diff <= 0) {
      return order.status === 'delivered' ? 'Delivered!' : 'Arriving soon!';
    }
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
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

  if (loading) {
    return (
      <div className="order-tracking-page">
        <div className="tracking-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-page">
        <div className="tracking-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Order Not Found</h2>
            <p>{error}</p>
            <button className="back-btn" onClick={() => history.push('/myorders')}>
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="order-tracking-page">
      <div className="tracking-container">
        {/* Header */}
        <div className="tracking-header">
          <button className="back-button" onClick={() => history.push('/myorders')}>
            ← Back to Orders
          </button>
          <h1>Track Your Order</h1>
          <p className="order-id">Order #{order.id}</p>
        </div>

        {/* Status Message */}
        {order.status !== 'cancelled' && (
          <div className="status-message">
            <div className="status-icon">
              {statusSteps[currentStepIndex]?.icon || '📦'}
            </div>
            <div className="status-content">
              <h2>{statusSteps[currentStepIndex]?.label || 'Processing'}</h2>
              {order.status !== 'delivered' && (
                <p className="eta">
                  Estimated delivery: <strong>{getEstimatedTimeRemaining()}</strong>
                </p>
              )}
              {order.status === 'delivered' && (
                <p className="delivered-message">🎉 Your order has been delivered! Enjoy your meal!</p>
              )}
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="status-message cancelled">
            <div className="status-icon">❌</div>
            <div className="status-content">
              <h2>Order Cancelled</h2>
              <p>This order has been cancelled.</p>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        {order.status !== 'cancelled' && (
          <div className="progress-tracker">
            {statusSteps.map((step, index) => (
              <div 
                key={step.key}
                className={`progress-step ${
                  index <= currentStepIndex ? 'completed' : ''
                } ${index === currentStepIndex ? 'active' : ''}`}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-label">{step.label}</div>
                {index < statusSteps.length - 1 && (
                  <div className={`step-line ${index < currentStepIndex ? 'completed' : ''}`}></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Order Details */}
        <div className="order-details-card">
          <h3>Order Details</h3>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-total">
            <span>Total Amount</span>
            <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Status History Timeline */}
        <div className="status-history-card">
          <h3>Order Timeline</h3>
          <div className="timeline">
            {order.statusHistory.slice().reverse().map((history, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-status">
                    {statusSteps.find(s => s.key === history.status)?.label || history.status}
                  </div>
                  <div className="timeline-note">{history.note}</div>
                  <div className="timeline-time">{formatTime(history.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-refresh indicator */}
        {autoRefresh && order.status !== 'delivered' && (
          <div className="auto-refresh-notice">
            <span className="refresh-icon">🔄</span> Auto-updating every 30 seconds
          </div>
        )}

        {/* Refresh Button */}
        <button className="refresh-btn" onClick={fetchOrderStatus}>
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;
