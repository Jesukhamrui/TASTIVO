import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./payment.css";
import {
    initiatePayment,
    paymentSuccess,
    paymentFailed,
    paymentPending,
    clearPaymentError,
} from "../../../redux/paymentslice";

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_1RA1PiDAj8frnx";

const PAYMENT_METHODS = [
    {
        id: "card",
        name: "Credit/Debit Card",
        icon: "💳",
        description: "Visa, Mastercard, American Express",
    },
    {
        id: "upi",
        name: "UPI",
        icon: "📱",
        description: "Google Pay, PhonePe, Paytm",
    },
    {
        id: "wallet",
        name: "Digital Wallet",
        icon: "👛",
        description: "PayPal, Amazon Pay, etc",
    },
    {
        id: "netbanking",
        name: "Net Banking",
        icon: "🏦",
        description: "All major banks supported",
    },
];

function PaymentGateway({
    orderId,
    amount,
    customerEmail,
    customerPhone,
    customerName,
    onPaymentSuccess,
    onPaymentCancel,
}) {
    const dispatch = useDispatch();
    const { paymentError } = useSelector(
        (state) => state.payments
    );

    const [selectedMethod, setSelectedMethod] = useState("card");
    const [processing, setProcessing] = useState(false);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePaymentInitiate = async () => {
        if (!selectedMethod) {
            alert("Please select a payment method");
            return;
        }

        dispatch(initiatePayment({ orderId, amount }));
        dispatch(paymentPending({ method: selectedMethod }));
        setProcessing(true);

        try {
            // Create payment request on backend
            const token = localStorage.getItem("token");
            const response = await fetch(
                "http://localhost:5000/api/payments/create-order",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderId,
                        amount: Math.round(amount * 100), // Razorpay expects amount in paise
                        currency: "INR",
                        receipt: `order_${orderId}`,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create payment order");
            }

            const paymentOrder = await response.json();

            // Handle payment based on method
            if (window.Razorpay) {
                handleRazorpayPayment(paymentOrder);
            } else {
                throw new Error("Razorpay not loaded");
            }
        } catch (error) {
            console.error("Payment error:", error);
            dispatch(paymentFailed({ error: error.message }));
            setProcessing(false);
        }
    };

    const handleRazorpayPayment = (paymentOrder) => {
        const options = {
            key: RAZORPAY_KEY_ID,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            order_id: paymentOrder.id,
            receipt: paymentOrder.receipt,

            prefill: {
                name: customerName || "",
                email: customerEmail || "",
                contact: customerPhone || "",
            },

            method: {
                card: true,
                netbanking: true,
                upi: true,
                wallet: true,
            },

            notes: {
                orderId: orderId,
                paymentMethod: selectedMethod,
            },

            handler: async (response) => {
                // Verify payment on backend
                await verifyPayment(response, paymentOrder.id);
            },

            modal: {
                ondismiss: () => {
                    setProcessing(false);
                    onPaymentCancel?.();
                },
            },

            theme: {
                color: "#ff6b6b",
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const verifyPayment = async (response, orderId) => {
        try {
            const token = localStorage.getItem("token");
            const verifyResponse = await fetch(
                "http://localhost:5000/api/payments/verify",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: orderId,
                    }),
                }
            );

            if (!verifyResponse.ok) {
                throw new Error("Payment verification failed");
            }

            const verifyData = await verifyResponse.json();

            dispatch(
                paymentSuccess({
                    method: selectedMethod,
                    transactionId: response.razorpay_payment_id,
                })
            );

            setProcessing(false);
            onPaymentSuccess?.(verifyData);
        } catch (error) {
            console.error("Verification error:", error);
            dispatch(paymentFailed({ error: error.message }));
            setProcessing(false);
        }
    };

    const handleCancel = () => {
        dispatch(clearPaymentError());
        onPaymentCancel?.();
    };

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal">
                <div className="payment-modal-header">
                    <h2>💳 Payment</h2>
                    <p>Order ID: #{orderId}</p>
                </div>

                {paymentError && <div className="payment-error">{paymentError}</div>}

                {processing ? (
                    <div className="payment-processing">
                        <div className="spinner"></div>
                        <p>Processing your payment...</p>
                        <p style={{ fontSize: "0.9rem", color: "#666" }}>
                            Please do not close this window
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="payment-summary">
                            <div className="payment-summary-row">
                                <span>Subtotal:</span>
                                <span className="payment-summary-amount">
                                    ₹{amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="payment-summary-row">
                                <span>Delivery Fee:</span>
                                <span className="payment-summary-amount">Free</span>
                            </div>
                            <div className="payment-summary-row">
                                <span>Taxes & Charges:</span>
                                <span className="payment-summary-amount">Included</span>
                            </div>
                            <div className="payment-summary-row total">
                                <span>Total Amount:</span>
                                <span className="payment-summary-amount">₹{amount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="payment-methods">
                            <div className="payment-methods-title">Select Payment Method</div>
                            {PAYMENT_METHODS.map((method) => (
                                <button
                                    key={method.id}
                                    className={`payment-method-btn ${
                                        selectedMethod === method.id ? "active" : ""
                                    }`}
                                    onClick={() => setSelectedMethod(method.id)}
                                    disabled={processing}
                                >
                                    <div className="payment-method-icon">{method.icon}</div>
                                    <div className="payment-method-info">
                                        <div className="payment-method-name">{method.name}</div>
                                        <div className="payment-method-desc">
                                            {method.description}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="payment-note">
                            ✓ Your payment is 100% secure and encrypted with Razorpay
                        </div>

                        <div className="payment-buttons">
                            <button
                                className="btn-cancel-payment"
                                onClick={handleCancel}
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-pay"
                                onClick={handlePaymentInitiate}
                                disabled={processing}
                            >
                                {processing ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default PaymentGateway;
