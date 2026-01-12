import React, { useState } from 'react';
import '../../../component/Dashboard/search/searchfilters.css';

const SearchFilters = ({ onSearchResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    dietary: [],
    spicy: '',
    sortBy: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const categories = ['Italian', 'Indian', 'Mexican', 'Chinese', 'Korean', 'Thai', 'American'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free'];

  // Perform search
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append('q', searchQuery);
      }
      if (filters.category) {
        params.append('category', filters.category);
      }
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }
      if (filters.dietary.length > 0) {
        filters.dietary.forEach(d => params.append('dietary', d));
      }
      if (filters.spicy !== '') {
        params.append('spicy', filters.spicy);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }

      const url = `${API_BASE_URL}/api/search?${params.toString()}`;
      console.log('Fetching:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      console.log('Search results:', data);
      onSearchResults(data.results);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Error searching dishes');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Toggle dietary preferences
  const toggleDietary = (diet) => {
    setFilters(prev => ({
      ...prev,
      dietary: prev.dietary.includes(diet)
        ? prev.dietary.filter(d => d !== diet)
        : [...prev.dietary, diet],
    }));
  };

  // Reset all filters
  const handleReset = () => {
    setSearchQuery('');
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      dietary: [],
      spicy: '',
      sortBy: '',
    });
    onSearchResults([]);
  };

  return (
    <div className="search-filters-container">
      <div className="search-filters-wrapper">
        {/* Search Bar */}
        <div className="search-bar-section">
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Search dishes by name or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : '🔍 Search'}
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="filters-grid">
          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Cuisine Type</label>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">All Cuisines</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <label className="filter-label">Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                className="price-input"
                placeholder="Min $"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                className="price-input"
                placeholder="Max $"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              />
            </div>
          </div>

          {/* Spicy Filter */}
          <div className="filter-group">
            <label className="filter-label">Spicy Level</label>
            <select
              className="filter-select"
              value={filters.spicy}
              onChange={(e) => setFilters(prev => ({ ...prev, spicy: e.target.value }))}
            >
              <option value="">Any Level</option>
              <option value="false">Mild</option>
              <option value="true">Spicy 🌶️</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="filter-select"
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="dietary-section">
          <label className="dietary-label">Dietary Preferences</label>
          <div className="dietary-options">
            {dietaryOptions.map(diet => (
              <button
                key={diet}
                className={`dietary-btn ${filters.dietary.includes(diet) ? 'active' : ''}`}
                onClick={() => toggleDietary(diet)}
              >
                {diet === 'vegetarian' && '🥬'} {diet === 'vegan' && '🌱'} {diet === 'gluten-free' && '🌾'}
                {diet.charAt(0).toUpperCase() + diet.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button className="search-apply-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Apply Filters'}
          </button>
          <button className="reset-btn" onClick={handleReset}>
            Reset All
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

export default SearchFilters;
