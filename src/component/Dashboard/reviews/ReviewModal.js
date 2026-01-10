import React, { useState } from "react";
import { useDispatch } from "react-redux";
import "./reviews.css";
import { addReview } from "../../../redux/reviewslice";

const RATING_LABELS = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
};

function ReviewModal({ dish, orderId, onClose, onSubmit }) {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        if (photos.length + files.length > 5) {
            setError("You can upload maximum 5 photos");
            return;
        }

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                setError("Each photo must be less than 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotos(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    url: reader.result,
                    file: file
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (photoId) => {
        setPhotos(prev => prev.filter(p => p.id !== photoId));
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        if (comment.trim().length < 10) {
            setError("Please write at least 10 characters in your review");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const token = localStorage.getItem('token');

            // Upload photos first (if any)
            const photoUrls = photos.map(p => p.url); // In real app, upload to server

            const reviewData = {
                dishId: dish.id,
                orderId: orderId,
                rating: rating,
                comment: comment.trim(),
                photos: photoUrls,
                userName: user.name || 'Anonymous',
                userId: user.id,
                verified: true, // Since it's from an order
                date: new Date().toISOString()
            };

            // Save to backend
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            const savedReview = await response.json();

            // Save to Redux
            dispatch(addReview({
                ...reviewData,
                id: savedReview.id || Date.now()
            }));

            onSubmit?.(reviewData);
            onClose();
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="review-modal-header">
                    <h2>⭐ Write a Review</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {error && <div className="review-error">{error}</div>}

                <div className="review-dish-info">
                    <img 
                        src={dish.url || dish.imageUrl} 
                        alt={dish.title || dish.name} 
                        className="review-dish-image"
                    />
                    <div className="review-dish-name">{dish.title || dish.name}</div>
                </div>

                <div className="rating-selector">
                    <label>Your Rating *</label>
                    <div className="stars-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                    {(hoverRating || rating) > 0 && (
                        <div className="rating-text">
                            {RATING_LABELS[hoverRating || rating]}
                        </div>
                    )}
                </div>

                <div className="review-comment">
                    <label>Your Review *</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this dish... (minimum 10 characters)"
                        maxLength={500}
                    />
                    <small style={{ color: '#666', fontSize: '0.85rem' }}>
                        {comment.length}/500 characters
                    </small>
                </div>

                <div className="photo-upload">
                    <label>Add Photos (Optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        id="photo-upload"
                        onChange={handlePhotoUpload}
                    />
                    <label htmlFor="photo-upload" className="upload-btn">
                        📷 Upload Photos ({photos.length}/5)
                    </label>

                    {photos.length > 0 && (
                        <div className="photo-previews">
                            {photos.map((photo) => (
                                <div key={photo.id} className="photo-preview">
                                    <img src={photo.url} alt="Review" />
                                    <button
                                        className="remove-photo"
                                        onClick={() => removePhoto(photo.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="review-actions">
                    <button
                        className="btn-cancel-review"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-submit-review"
                        onClick={handleSubmit}
                        disabled={loading || rating === 0}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ReviewModal;
