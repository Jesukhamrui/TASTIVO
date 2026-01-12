import React, { useState, useEffect } from 'react';
import SearchFilters from './SearchFilters';
import '../../../component/Dashboard/search/searchresults.css';
import { useDispatch, useSelector } from 'react-redux';
import { addTocart } from '../../../component/Dashboard/cart/cartslice';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Handle search results from filter component
  const handleSearchResults = (searchResults) => {
    setResults(searchResults);
    setHasSearched(true);
  };

  // Add to cart function
  const handleAddToCart = (dish) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    dispatch(addTocart({
      dishId: dish.id,
      name: dish.name,
      price: dish.rate,
      quantity: 1,
      image: dish.imageUrl,
    }));

    // Show success notification
    alert(`${dish.name} added to cart!`);
  };

  return (
    <div className="search-results-page">
      {/* Search & Filters Component */}
      <SearchFilters onSearchResults={handleSearchResults} />

      {/* Results Section */}
      <div className="results-section">
        {hasSearched ? (
          <>
            <div className="results-header">
              <h2>Search Results</h2>
              <p className="results-count">
                Found {results.length} dish{results.length !== 1 ? 'es' : ''}
              </p>
            </div>

            {results.length > 0 ? (
              <div className="results-grid">
                {results.map(dish => (
                  <div key={dish.id} className="result-card">
                    <div className="result-image">
                      <img src={dish.imageUrl} alt={dish.name} />
                      <div className="category-badge">{dish.category}</div>
                      {dish.dietary && dish.dietary.length > 0 && (
                        <div className="dietary-badges">
                          {dish.dietary.map(diet => (
                            <span key={diet} className={`diet-badge ${diet}`}>
                              {diet === 'vegetarian' && '🥬'}
                              {diet === 'vegan' && '🌱'}
                              {diet === 'gluten-free' && '🌾'}
                            </span>
                          ))}
                        </div>
                      )}
                      {dish.spicy && (
                        <div className="spicy-indicator">🌶️ SPICY</div>
                      )}
                    </div>

                    <div className="result-content">
                      <h3 className="result-name">{dish.name}</h3>
                      <p className="result-description">{dish.description}</p>

                      {dish.ingredients && (
                        <div className="ingredients-list">
                          <small className="ingredients-label">Ingredients:</small>
                          <div className="ingredient-tags">
                            {dish.ingredients.slice(0, 3).map((ing, idx) => (
                              <span key={idx} className="ingredient-tag">
                                {ing}
                              </span>
                            ))}
                            {dish.ingredients.length > 3 && (
                              <span className="ingredient-tag more">
                                +{dish.ingredients.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="result-footer">
                        <div className="price-section">
                          <span className="price-label">Price</span>
                          <span className="price-value">${dish.rate.toFixed(2)}</span>
                        </div>
                        <button
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(dish)}
                        >
                          🛒 Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No dishes found</h3>
                <p>Try adjusting your search filters or try a different search term</p>
              </div>
            )}
          </>
        ) : (
          <div className="search-prompt">
            <div className="search-prompt-icon">🍽️</div>
            <h3>Start Searching</h3>
            <p>Use the search bar above to find your favorite dishes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
