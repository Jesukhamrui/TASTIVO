import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Header from "../header/header";
import Footer from "../footer/footer";
import ReviewModal from "../reviews/ReviewModal";
import "./myorders.css";
import { addTocart } from "../cart/cartslice";

function MyOrders() {
    const history = useHistory();
    const dispatch = useDispatch();
    const orders = useSelector((state) => state.orders.orders);
    const [reviewModal, setReviewModal] = useState({ show: false, dish: null, orderId: null });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'confirmed':
                return 'status-confirmed';
            case 'delivered':
                return 'status-delivered';
            case 'cancelled':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    };

    const handleReorder = (order) => {
        order.items.forEach(item => {
            for (let i = 0; i < item.cartQuantity; i++) {
                dispatch(addTocart(item));
            }
        });
        alert('Items added to cart successfully!');
        history.push('/cart');
    };

    const handleViewDetails = (orderId) => {
        // You can implement a detailed order view page
        alert(`Viewing details for order #${orderId}`);
    };

    return (
        <div className="orders-container">
            <Header />
            <div className="orders-content">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <p>Track and manage your orders</p>
                </div>

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <h2>No Orders Yet</h2>
                        <p>You haven't placed any orders yet. Start shopping now!</p>
                        <button onClick={() => history.push('/home')}>
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div>
                                        <div className="order-id">Order #{order.id}</div>
                                        <div className="order-date">
                                            {formatDate(order.date)}
                                        </div>
                                    </div>
                                    <div className={`order-status ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </div>
                                </div>

                                <div className="order-items">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="order-item">
                                            <img
                                                src={item.url}
                                                alt={item.title}
                                                className="order-item-image"
                                            />
                                            <div className="order-item-details">
                                                <div className="order-item-title">{item.title}</div>
                                                <div className="order-item-info">
                                                    <span className="order-item-quantity">
                                                        Quantity: {item.cartQuantity}
                                                    </span>
                                                    <span className="order-item-price">
                                                        ₹{item.rate} × {item.cartQuantity} = ₹{item.rate * item.cartQuantity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        Total: <span className="order-total-amount">₹{order.totalAmount}</span>
                                        <span style={{ fontSize: '0.9rem', color: '#666', marginLeft: '5px' }}>
                                            ({order.totalQuantity} items)
                                        </span>
                                    </div>
                                    <div className="order-actions">
                                        <button
                                            className="btn-track"
                                            onClick={() => history.push(`/orders/${order.id}/track`)}
                                        >
                                            📍 Track Order
                                        </button>
                                        <button
                                            className="btn-reorder"
                                            onClick={() => handleReorder(order)}
                                        >
                                            Reorder
                                        </button>
                                        <button
                                            className="btn-details"
                                            onClick={() => handleViewDetails(order.id)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>

                                {order.deliveryDetails && (
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '15px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '5px',
                                        fontSize: '0.9rem',
                                        color: '#555'
                                    }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>Delivery Address</h4>
                                        <p style={{ margin: '5px 0' }}>
                                            <strong>{order.deliveryDetails.fullName}</strong>
                                        </p>
                                        <p style={{ margin: '5px 0' }}>
                                            {order.deliveryDetails.address}
                                        </p>
                                        <p style={{ margin: '5px 0' }}>
                                            {order.deliveryDetails.city}, Pincode: {order.deliveryDetails.pincode}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {reviewModal.show && (
                <ReviewModal
                    dish={reviewModal.dish}
                    orderId={reviewModal.orderId}
                    onClose={() => setReviewModal({ show: false, dish: null, orderId: null })}
                    onSubmit={() => {
                        alert('Thank you for your review!');
                    }}
                />
            )}
            
            <Footer />
        </div>
    );
}

export default MyOrders;
