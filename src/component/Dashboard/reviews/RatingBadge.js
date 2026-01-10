import React from "react";
import { useSelector } from "react-redux";
import "./RatingBadge.css";

function RatingBadge({ dishId, showCount = true, size = "medium" }) {
    const averageRating = useSelector(
        (state) => state.reviews.averageRatings[dishId]
    );

    if (!averageRating || averageRating.count === 0) {
        return <span className="no-reviews-badge">No reviews yet</span>;
    }

    const rating = parseFloat(averageRating.average);
    const ratingClass =
        rating >= 4 ? "high" : rating >= 3 ? "medium" : "low";

    return (
        <div className={`rating-badge ${ratingClass} ${size}`}>
            <span className="rating-badge-star">⭐</span>
            <span className="rating-badge-number">{averageRating.average}</span>
            {showCount && (
                <span className="rating-badge-count">
                    ({averageRating.count})
                </span>
            )}
        </div>
    );
}

export default RatingBadge;
