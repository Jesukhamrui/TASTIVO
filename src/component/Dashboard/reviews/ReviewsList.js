import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./reviews.css";
import { updateReviewHelpful } from "../../../redux/reviewslice";

function ReviewsList({ dishId, showAll = false }) {
    const dispatch = useDispatch();
    const dishReviews = useSelector((state) => state.reviews.dishReviews[dishId] || []);
    const averageRating = useSelector((state) => state.reviews.averageRatings[dishId]);
    const [expandedPhoto, setExpandedPhoto] = useState(null);

    const displayReviews = showAll ? dishReviews : dishReviews.slice(0, 3);

    const handleHelpful = (reviewId) => {
        dispatch(updateReviewHelpful({ reviewId }));
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    };

    if (!dishReviews || dishReviews.length === 0) {
        return (
            <div className="reviews-section">
                <div className="reviews-header">
                    <h3>Reviews & Ratings</h3>
                </div>
                <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                    No reviews yet. Be the first to review this dish!
                </p>
            </div>
        );
    }

    return (
        <div className="reviews-section">
            <div className="reviews-header">
                <h3>Reviews & Ratings</h3>
                {averageRating && (
                    <div className="average-rating">
                        <span className="rating-number">{averageRating.average}</span>
                        <div>
                            <div className="rating-stars">
                                {renderStars(Math.round(averageRating.average))}
                            </div>
                            <div className="rating-count">
                                {averageRating.count} {averageRating.count === 1 ? 'review' : 'reviews'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="reviews-list">
                {displayReviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <div className="review-header">
                            <div className="reviewer-info">
                                <div className="reviewer-avatar">
                                    {getInitials(review.userName)}
                                </div>
                                <div>
                                    <div>
                                        <span className="reviewer-name">{review.userName}</span>
                                        {review.verified && (
                                            <span className="verified-badge">✓ Verified</span>
                                        )}
                                    </div>
                                    <div className="review-date">{formatDate(review.date)}</div>
                                </div>
                            </div>
                            <div className="review-rating">
                                {renderStars(review.rating)}
                            </div>
                        </div>

                        <p className="review-comment-text">{review.comment}</p>

                        {review.photos && review.photos.length > 0 && (
                            <div className="review-photos">
                                {review.photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="review-photo"
                                        onClick={() => setExpandedPhoto(photo)}
                                    >
                                        <img src={photo} alt={`Review ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="review-actions-footer">
                            <button
                                className="helpful-btn"
                                onClick={() => handleHelpful(review.id)}
                            >
                                👍 Helpful ({review.helpful || 0})
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {!showAll && dishReviews.length > 3 && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        style={{
                            padding: '10px 30px',
                            background: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                        }}
                    >
                        View All {dishReviews.length} Reviews
                    </button>
                </div>
            )}

            {expandedPhoto && (
                <div
                    className="review-modal-overlay"
                    onClick={() => setExpandedPhoto(null)}
                    style={{ background: 'rgba(0, 0, 0, 0.9)' }}
                >
                    <img
                        src={expandedPhoto}
                        alt="Expanded"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default ReviewsList;
