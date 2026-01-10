import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Header from "../header/header";
import Footer from "../footer/footer";
import "./checkout.css";
import { clearCartItem } from "../cart/cartslice";
import { addOrder } from "./orderslice";

const API_BASE_URL = "http://localhost:5000";

function Checkout() {
    const history = useHistory();
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        specialInstructions: "",
    });

    const [locationData, setLocationData] = useState({
        latitude: null,
        longitude: null,
        address: null,
    });

    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState("");
    const [locationStatus, setLocationStatus] = useState("");
    const [errors, setErrors] = useState({});

    // Redirect to home if cart is empty
    useEffect(() => {
        if (cart.cartItems.length === 0) {
            history.push("/home");
        }
    }, [cart.cartItems.length, history]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (
            !formData.email.includes("@") ||
            !formData.email.includes(".")
        ) {
            newErrors.email = "Please enter a valid email";
        }
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
            newErrors.phone = "Please enter a valid 10-digit phone number";
        }
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }
        if (!formData.city.trim()) {
            newErrors.city = "City is required";
        }
        if (!formData.pincode.trim()) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^\d{5,6}$/.test(formData.pincode)) {
            newErrors.pincode = "Please enter a valid pincode (5-6 digits)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("Geolocation is not supported by your browser");
            return;
        }

        setLocationLoading(true);
        setLocationStatus("Getting your location...");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocationData({
                    latitude,
                    longitude,
                    address: null,
                });

                // Try to get address from coordinates using reverse geocoding
                try {
                    // Using Open-Meteo Geocoding API (free, no key required)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    const address = data.address || {};
                    const fullAddress = `${address.road || ""} ${
                        address.city || address.town || ""
                    }`.trim();

                    setLocationData((prev) => ({
                        ...prev,
                        address: fullAddress || `${latitude}, ${longitude}`,
                    }));

                    setFormData((prev) => ({
                        ...prev,
                        address: fullAddress || `${latitude}, ${longitude}`,
                        city: address.city || address.town || "",
                    }));

                    setLocationStatus(
                        `✓ Location captured: ${fullAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}`
                    );
                } catch (err) {
                    console.error("Error fetching address:", err);
                    const coordAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    setFormData((prev) => ({
                        ...prev,
                        address: coordAddress,
                    }));
                    setLocationStatus(`✓ Location captured: ${coordAddress}`);
                }

                setLocationLoading(false);
            },
            (error) => {
                let errorMessage = "Unable to get location. ";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Permission denied. Please enable location access.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Request timeout.";
                        break;
                    default:
                        errorMessage += "Unknown error occurred.";
                }
                setLocationStatus(errorMessage);
                setLocationLoading(false);
            }
        );
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            setError("Please fill all required fields correctly");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            history.push("/login");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const items = cart.cartItems.map((cartItem) => ({
                dishId: cartItem.id,
                quantity: cartItem.cartQuantity,
            }));

            // Validate cart first
            const validateResponse = await fetch(
                `${API_BASE_URL}/api/cart/validate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ items }),
                }
            );

            if (!validateResponse.ok) {
                const errorData = await validateResponse
                    .json()
                    .catch(() => ({}));
                setError(
                    errorData.error || "Failed to validate cart. Please try again."
                );
                setLoading(false);
                return;
            }

            const validated = await validateResponse.json();

            // Create order with delivery details
            const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items,
                    deliveryDetails: {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        pincode: formData.pincode,
                        specialInstructions: formData.specialInstructions,
                    },
                    location: locationData.latitude
                        ? {
                              latitude: locationData.latitude,
                              longitude: locationData.longitude,
                          }
                        : null,
                }),
            });

            if (!orderResponse.ok) {
                if (orderResponse.status === 401) {
                    history.push("/login");
                    return;
                }
                const errorData = await orderResponse.json().catch(() => ({}));
                setError(
                    errorData.error || "Failed to place order. Please try again."
                );
                setLoading(false);
                return;
            }

            const orderData = await orderResponse.json();

            // Save order to Redux and clear cart
            dispatch(
                addOrder({
                    id: orderData.id,
                    items: cart.cartItems.map((item) => ({ ...item })),
                    totalAmount: validated.totalAmount,
                    totalQuantity: cart.cartTotalQUantity,
                    date: new Date().toISOString(),
                    status: "pending",
                    deliveryDetails: {
                        fullName: formData.fullName,
                        email: formData.email,
                        phone: formData.phone,
                        address: formData.address,
                        city: formData.city,
                        pincode: formData.pincode,
                        specialInstructions: formData.specialInstructions,
                    },
                })
            );

            dispatch(clearCartItem());
            setLoading(false);
            
            alert("Order placed successfully!");
            history.push("/myorders");
        } catch (error) {
            console.error("Error creating order:", error);
            setError(
                "Something went wrong while creating your order. Please try again."
            );
            setLoading(false);
        }
    };

    if (cart.cartItems.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="checkout-container">
            <Header />
            <div className="checkout-content">
                <div className="checkout-header">
                    <h1>Order Checkout</h1>
                    <p>Please provide your delivery details</p>
                </div>

                <div className="checkout-main">
                    <div className="checkout-form">
                        {error && <div className="form-error">{error}</div>}

                        <div className="form-section">
                            <h3>Personal Information</h3>

                            <div className="form-group">
                                <label htmlFor="fullName">
                                    Full Name <span style={{ color: "red" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                />
                                {errors.fullName && (
                                    <small style={{ color: "#721c24" }}>
                                        {errors.fullName}
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    Email <span style={{ color: "red" }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && (
                                    <small style={{ color: "#721c24" }}>
                                        {errors.email}
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    Phone Number <span style={{ color: "red" }}>*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="10-digit phone number"
                                />
                                {errors.phone && (
                                    <small style={{ color: "#721c24" }}>
                                        {errors.phone}
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Delivery Address</h3>

                            <button
                                className="location-btn"
                                onClick={getCurrentLocation}
                                disabled={locationLoading}
                                type="button"
                            >
                                {locationLoading ? "Getting location..." : "📍 Use My Current Location"}
                            </button>

                            {locationStatus && (
                                <div
                                    className={`location-status ${
                                        locationStatus.includes("✓")
                                            ? "location-success"
                                            : locationStatus.includes("Getting")
                                            ? "location-loading"
                                            : "location-error"
                                    }`}
                                >
                                    {locationStatus}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="address">
                                    Street Address <span style={{ color: "red" }}>*</span>
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter your street address"
                                />
                                {errors.address && (
                                    <small style={{ color: "#721c24" }}>
                                        {errors.address}
                                    </small>
                                )}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                                <div className="form-group">
                                    <label htmlFor="city">
                                        City <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="City name"
                                    />
                                    {errors.city && (
                                        <small style={{ color: "#721c24" }}>
                                            {errors.city}
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="pincode">
                                        Pincode <span style={{ color: "red" }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="5-6 digit pincode"
                                    />
                                    {errors.pincode && (
                                        <small style={{ color: "#721c24" }}>
                                            {errors.pincode}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Special Instructions</h3>
                            <div className="form-group">
                                <label htmlFor="specialInstructions">
                                    Delivery Notes (Optional)
                                </label>
                                <textarea
                                    id="specialInstructions"
                                    name="specialInstructions"
                                    value={formData.specialInstructions}
                                    onChange={handleInputChange}
                                    placeholder="Any special delivery instructions? E.g., Ring the bell twice, leave at gate, etc."
                                />
                            </div>
                        </div>

                        <div className="checkout-buttons">
                            <button
                                className="btn-cancel"
                                onClick={() => history.push("/cart")}
                                disabled={loading}
                            >
                                Back to Cart
                            </button>
                            <button
                                className="btn-place-order"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? "Placing Order..." : "Place Order"}
                            </button>
                        </div>
                    </div>

                    <div className="checkout-summary">
                        <div className="summary-header">Order Summary</div>

                        <div style={{ marginBottom: "20px" }}>
                            {cart.cartItems.map((item) => (
                                <div key={item.id} className="summary-item">
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="summary-item-image"
                                    />
                                    <div className="summary-item-content">
                                        <div className="summary-item-name">
                                            {item.title}
                                        </div>
                                        <div className="summary-item-qty">
                                            Qty: {item.cartQuantity}
                                        </div>
                                    </div>
                                    <div className="summary-item-price">
                                        ₹{item.rate * item.cartQuantity}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-total">
                            <div className="summary-total-row">
                                <span>Items ({cart.cartTotalQUantity}):</span>
                                <span>₹{cart.totalAmount}</span>
                            </div>
                            <div className="summary-total-row">
                                <span>Delivery:</span>
                                <span>FREE</span>
                            </div>
                            <div className="summary-total-row">
                                <span>Tax:</span>
                                <span>Included</span>
                            </div>
                            <div className="summary-total-row final">
                                <span>Total:</span>
                                <span>₹{cart.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Checkout;
