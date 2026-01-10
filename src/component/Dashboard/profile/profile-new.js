import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Header from "../header/header";
import Footer from "../footer/footer";
import "./profile-new.css";

const API_BASE_URL = "http://localhost:5000";

function ProfileNew() {
    const history = useHistory();
    
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [favoritesList, setFavoritesList] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const userData = JSON.parse(stored);
                setUser(userData);
                setFormData(prev => ({
                    ...prev,
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || ""
                }));
            } catch (e) {
                setError("Error loading user data");
            }
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFavoritesList(data);
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
        setSuccess("");
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Name is required");
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setError("Valid email is required");
            return false;
        }
        if (!formData.phone.trim() || formData.phone.length < 10) {
            setError("Valid phone number (min 10 digits) is required");
            return false;
        }
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleSaveProfile = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Not authenticated");
                return;
            }

            const updateData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            };

            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to update profile');
                return;
            }

            // Update localStorage
            const updatedUser = { ...user, ...updateData };
            delete updatedUser.currentPassword;
            delete updatedUser.newPassword;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setUser(updatedUser);
            setFormData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));
            
            setSuccess("Profile updated successfully!");
            setIsEditing(false);
            
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError("Error updating profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (dishId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/api/favorites/${dishId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setFavoritesList(prev => prev.filter(dish => String(dish.id) !== String(dishId)));
            }
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    if (!user) {
        return (
            <div className="profile-container">
                <Header />
                <div className="profile-content">
                    <div className="profile-message">
                        <h2>Please log in to view your profile</h2>
                        <button onClick={() => history.push('/login')} className="btn-primary">
                            Go to Login
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="profile-container">
            <Header />
            <div className="profile-content">
                <div className="profile-wrapper">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <span className="avatar-initials">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                        </div>
                        <div className="profile-header-info">
                            <h1>{user.name}</h1>
                            <p className="profile-email">{user.email}</p>
                        </div>
                        {!isEditing && (
                            <button 
                                className="btn-edit"
                                onClick={() => setIsEditing(true)}
                            >
                                ✏️ Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Error/Success Messages */}
                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="profile-grid">
                        {/* User Information Section */}
                        <section className="profile-section">
                            <h2>👤 Personal Information</h2>
                            
                            {isEditing ? (
                                <form className="profile-form">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div className="form-divider">
                                        <h3>🔐 Change Password (Optional)</h3>
                                    </div>

                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="Confirm new password"
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn-save"
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                        >
                                            {loading ? '💾 Saving...' : '💾 Save Changes'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    currentPassword: "",
                                                    newPassword: "",
                                                    confirmPassword: ""
                                                }));
                                            }}
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="profile-info-display">
                                    <div className="info-item">
                                        <label>Name</label>
                                        <p>{formData.name}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Email</label>
                                        <p>{formData.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone</label>
                                        <p>{formData.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Favorite Dishes Section */}
                        <section className="profile-section">
                            <h2>❤️ Your Favorite Dishes</h2>
                            
                            {favoritesList.length === 0 ? (
                                <div className="empty-state">
                                    <p>You haven't marked any dishes as favorites yet.</p>
                                    <button 
                                        className="btn-explore"
                                        onClick={() => history.push('/home')}
                                    >
                                        🍽️ Explore Dishes
                                    </button>
                                </div>
                            ) : (
                                <div className="favorites-grid">
                                    {favoritesList.map((dish) => (
                                        <div key={dish.id} className="favorite-card">
                                            <div className="favorite-image">
                                                <img 
                                                    src={dish.url || dish.imageUrl} 
                                                    alt={dish.title || dish.name}
                                                />
                                                <button
                                                    className="remove-favorite"
                                                    onClick={() => removeFavorite(dish.id)}
                                                    title="Remove from favorites"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="favorite-info">
                                                <h3>{dish.title || dish.name}</h3>
                                                <p className="dish-category">{dish.category}</p>
                                                <p className="dish-price">₹{dish.rate || dish.price}</p>
                                                <button
                                                    className="btn-order"
                                                    onClick={() => history.push(`/singledish?id=${dish.id}`)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ProfileNew;
