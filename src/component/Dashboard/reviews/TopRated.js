import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Header from "../header/header";
import Footer from "../footer/footer";
import RatingBadge from "../reviews/RatingBadge";
import { loadDishReviews } from "../../../redux/reviewslice";
import "./toprated.css";

function TopRated() {
    const history = useHistory();
    const dispatch = useDispatch();
    const averageRatings = useSelector((state) => state.reviews.averageRatings);

    useEffect(() => {
        // Fetch reviews for all dishes from backend
        async function fetchReviews() {
            try {
                const response = await fetch('http://localhost:5000/api/dishes/top-rated?limit=20');
                if (!response.ok) return;
                
                const topRatedDishes = await response.json();
                
                // Load reviews for each dish into Redux
                topRatedDishes.forEach(dish => {
                    fetch(`http://localhost:5000/api/reviews/dish/${dish.id}`)
                        .then(res => res.json())
                        .then(reviews => {
                            dispatch(loadDishReviews({ dishId: dish.id, reviews }));
                        });
                });
            } catch (error) {
                console.error('Error fetching top rated dishes:', error);
            }
        }
        
        fetchReviews();
    }, [dispatch]);

    // Import Food data (you'll need to adjust this based on your setup)
    const Food = require("../../foodimage").default;

    // Get dishes with ratings
    const dishesWithRatings = Food.map(dish => ({
        ...dish,
        rating: averageRatings[dish.id]
    })).filter(dish => dish.rating && dish.rating.count > 0);

    // Sort by average rating (high to low)
    const topRatedDishes = dishesWithRatings.sort((a, b) => {
        return parseFloat(b.rating.average) - parseFloat(a.rating.average);
    });

    const handleDishClick = (id) => {
        history.push(`/singledish?id=${id}`);
    };

    return (
        <div className="top-rated-container">
            <Header />
            <div className="top-rated-content">
                <div className="top-rated-header">
                    <h1>⭐ Top Rated Dishes</h1>
                    <p>Discover our customers' favorite dishes</p>
                </div>

                {topRatedDishes.length === 0 ? (
                    <div className="no-ratings">
                        <h2>No ratings yet!</h2>
                        <p>Be the first to rate our dishes after ordering.</p>
                        <button onClick={() => history.push('/home')}>
                            Browse Dishes
                        </button>
                    </div>
                ) : (
                    <div className="top-rated-grid">
                        {topRatedDishes.map((dish, index) => (
                            <div key={dish.id} className="top-rated-card">
                                {index < 3 && (
                                    <div className={`rank-badge rank-${index + 1}`}>
                                        #{index + 1}
                                    </div>
                                )}
                                <div 
                                    className="dish-image-container"
                                    onClick={() => handleDishClick(dish.id)}
                                >
                                    <img 
                                        src={dish.url} 
                                        alt={dish.title} 
                                        className="dish-image"
                                    />
                                </div>
                                <div className="dish-info">
                                    <h3 className="dish-title">{dish.title}</h3>
                                    <div className="dish-category">{dish.titlename}</div>
                                    <div className="rating-section">
                                        <RatingBadge dishId={dish.id} showCount={true} />
                                    </div>
                                    <div className="dish-price">₹{dish.rate}</div>
                                    <button
                                        className="view-dish-btn"
                                        onClick={() => handleDishClick(dish.id)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default TopRated;
