import React from "react";
import "./invoice.css";

function Invoice({ order, paymentStatus, transactionId }) {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // For now, just print as PDF
        window.print();
    };

    const getPaymentStatusBadge = () => {
        switch (paymentStatus) {
            case "paid":
                return (
                    <div className="invoice-payment-status paid">
                        ✓ Payment Received
                    </div>
                );
            case "pending":
                return (
                    <div className="invoice-payment-status pending">
                        ⏱ Payment Pending
                    </div>
                );
            case "failed":
                return (
                    <div className="invoice-payment-status failed">
                        ✗ Payment Failed
                    </div>
                );
            default:
                return null;
        }
    };

    const calculateSubtotal = () => {
        return order.items.reduce((sum, item) => {
            return sum + item.rate * item.cartQuantity;
        }, 0);
    };

    const subtotal = calculateSubtotal();

    return (
        <div id="invoice-content" className="invoice-container">
            <div className="invoice-header">
                <div className="invoice-title">📄 INVOICE</div>
                <div className="invoice-number">
                    <h3>Order ID</h3>
                    <p>#{order.id}</p>
                </div>
            </div>

            {getPaymentStatusBadge()}

            <div className="invoice-meta">
                <div className="invoice-meta-section">
                    <h4>Bill To</h4>
                    <p>
                        <strong>{order.deliveryDetails?.fullName || "Customer"}</strong>
                    </p>
                    <p>{order.deliveryDetails?.email || "N/A"}</p>
                    <p>{order.deliveryDetails?.phone || "N/A"}</p>
                    <p>{order.deliveryDetails?.address || "N/A"}</p>
                    <p>
                        {order.deliveryDetails?.city}, {order.deliveryDetails?.pincode}
                    </p>
                </div>

                <div className="invoice-meta-section">
                    <h4>Order Details</h4>
                    <p>
                        <strong>Date:</strong>{" "}
                        {new Date(order.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                    <p>
                        <strong>Status:</strong>{" "}
                        <span
                            style={{
                                textTransform: "capitalize",
                                color:
                                    order.status === "pending"
                                        ? "#856404"
                                        : order.status === "delivered"
                                        ? "#155724"
                                        : "#666",
                            }}
                        >
                            {order.status}
                        </span>
                    </p>
                    {transactionId && (
                        <p>
                            <strong>Transaction ID:</strong> {transactionId}
                        </p>
                    )}
                    <p>
                        <strong>Items:</strong> {order.totalQuantity}
                    </p>
                </div>
            </div>

            <div className="invoice-items">
                <table className="invoice-items-table">
                    <thead>
                        <tr>
                            <th style={{ width: "5%" }}></th>
                            <th style={{ width: "50%" }}>Item</th>
                            <th style={{ width: "15%" }} align="right">
                                Qty
                            </th>
                            <th style={{ width: "15%" }} align="right">
                                Price
                            </th>
                            <th style={{ width: "15%" }} align="right">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    {item.url && (
                                        <img
                                            src={item.url}
                                            alt={item.title}
                                            className="invoice-item-image"
                                        />
                                    )}
                                </td>
                                <td className="invoice-item-name">{item.title}</td>
                                <td align="right">{item.cartQuantity}</td>
                                <td align="right">₹{item.rate.toFixed(2)}</td>
                                <td align="right" className="invoice-amount">
                                    ₹{(item.rate * item.cartQuantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="invoice-summary">
                <div className="invoice-summary-box">
                    <div className="invoice-summary-row">
                        <span>Subtotal:</span>
                        <span className="invoice-amount">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="invoice-summary-row">
                        <span>Delivery Fee:</span>
                        <span className="invoice-amount">FREE</span>
                    </div>
                    <div className="invoice-summary-row">
                        <span>Taxes & Charges:</span>
                        <span className="invoice-amount">Included</span>
                    </div>
                    <div className="invoice-summary-row total">
                        <span>Total Amount:</span>
                        <span className="invoice-amount">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="invoice-footer">
                <p>
                    Thank you for your order! Your food is being prepared with care.
                </p>
                <p>
                    For support, contact us at support@tastivo.com | +91-XXXX-XXXX-XXXX
                </p>
            </div>

            <div className="invoice-actions" style={{ printColorAdjust: "exact" }}>
                <button className="btn-print-invoice" onClick={handlePrint}>
                    🖨 Print Invoice
                </button>
                <button className="btn-download-invoice" onClick={handleDownload}>
                    📥 Download as PDF
                </button>
            </div>
        </div>
    );
}

export default Invoice;
