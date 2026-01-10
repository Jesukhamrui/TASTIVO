import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reviews: [],
    dishReviews: {},
    userReviews: [],
    averageRatings: {},
    loading: false,
    error: null
};

const reviewSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        addReview(state, action) {
            const review = {
                id: action.payload.id || Date.now(),
                dishId: action.payload.dishId,
                userId: action.payload.userId,
                userName: action.payload.userName,
                rating: action.payload.rating,
                comment: action.payload.comment,
                photos: action.payload.photos || [],
                date: action.payload.date || new Date().toISOString(),
                helpful: 0,
                verified: action.payload.verified || false
            };
            
            state.reviews.unshift(review);
            state.userReviews.unshift(review);
            
            // Update dish reviews
            if (!state.dishReviews[review.dishId]) {
                state.dishReviews[review.dishId] = [];
            }
            state.dishReviews[review.dishId].unshift(review);
            
            // Update average rating
            calculateAverageRating(state, review.dishId);
        },
        
        loadDishReviews(state, action) {
            const { dishId, reviews } = action.payload;
            state.dishReviews[dishId] = reviews;
            calculateAverageRating(state, dishId);
        },
        
        loadUserReviews(state, action) {
            state.userReviews = action.payload;
        },
        
        updateReviewHelpful(state, action) {
            const { reviewId } = action.payload;
            const review = state.reviews.find(r => r.id === reviewId);
            if (review) {
                review.helpful += 1;
            }
            
            // Update in dish reviews too
            Object.keys(state.dishReviews).forEach(dishId => {
                const dishReview = state.dishReviews[dishId].find(r => r.id === reviewId);
                if (dishReview) {
                    dishReview.helpful += 1;
                }
            });
        },
        
        deleteReview(state, action) {
            const reviewId = action.payload;
            state.reviews = state.reviews.filter(r => r.id !== reviewId);
            state.userReviews = state.userReviews.filter(r => r.id !== reviewId);
            
            Object.keys(state.dishReviews).forEach(dishId => {
                state.dishReviews[dishId] = state.dishReviews[dishId].filter(r => r.id !== reviewId);
                calculateAverageRating(state, dishId);
            });
        },
        
        setLoading(state, action) {
            state.loading = action.payload;
        },
        
        setError(state, action) {
            state.error = action.payload;
        }
    }
});

function calculateAverageRating(state, dishId) {
    const reviews = state.dishReviews[dishId];
    if (!reviews || reviews.length === 0) {
        state.averageRatings[dishId] = { average: 0, count: 0 };
        return;
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    state.averageRatings[dishId] = {
        average: (sum / reviews.length).toFixed(1),
        count: reviews.length
    };
}

export const {
    addReview,
    loadDishReviews,
    loadUserReviews,
    updateReviewHelpful,
    deleteReview,
    setLoading,
    setError
} = reviewSlice.actions;

export default reviewSlice.reducer;
