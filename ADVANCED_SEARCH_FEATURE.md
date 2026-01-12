# Advanced Search & Filters Feature

## Overview
The Advanced Search & Filters feature allows users to discover dishes based on multiple criteria including:
- **Search by Name or Ingredients**: Find dishes using keywords
- **Filter by Cuisine**: Browse specific cuisine types
- **Filter by Price Range**: Find dishes within your budget
- **Filter by Dietary Preferences**: Filter by vegetarian, vegan, or gluten-free options
- **Filter by Spice Level**: Choose mild or spicy dishes
- **Sort Results**: Sort by relevance, price, or name

## Features

### 🔍 Search Bar
Users can search dishes by:
- **Dish Name**: "Margherita Pizza", "Butter Chicken", etc.
- **Description**: Search through dish descriptions
- **Ingredients**: Find dishes containing specific ingredients

### 🍽️ Filter Options

#### Cuisine Type
Available cuisines:
- Italian
- Indian
- Mexican
- Chinese
- Korean
- Thai
- American

#### Price Range
- Set minimum and maximum price filters
- Find dishes within your budget

#### Dietary Preferences
Available options:
- **🥬 Vegetarian**: Dishes without meat
- **🌱 Vegan**: Plant-based only
- **🌾 Gluten-Free**: Dishes safe for gluten intolerance

#### Spice Level
- **Mild**: Non-spicy dishes
- **Spicy 🌶️**: Dishes with spice

#### Sort Options
- **Relevance**: Default sorting
- **Price: Low to High**: Budget-friendly first
- **Price: High to Low**: Premium items first
- **Name (A-Z)**: Alphabetical order

## API Endpoint

### Search & Filter API
**Endpoint**: `GET /api/search`

**Query Parameters**:
```
- q (string): Search query for name/description/ingredients
- category (string): Cuisine type filter
- minPrice (number): Minimum price
- maxPrice (number): Maximum price
- dietary (array/string): Dietary preferences (vegetarian, vegan, gluten-free)
- spicy (boolean): Spicy filter (true/false)
- sortBy (string): Sort method (price-low, price-high, name)
```

**Example Requests**:

```bash
# Search for vegetarian dishes under $10
GET /api/search?q=vegetarian&dietary=vegetarian&maxPrice=10

# Find spicy Indian dishes sorted by price
GET /api/search?category=Indian&spicy=true&sortBy=price-low

# Search for vegan gluten-free dishes
GET /api/search?dietary=vegan&dietary=gluten-free

# Find dishes with peanuts
GET /api/search?q=peanuts
```

**Response Format**:
```json
{
  "count": 5,
  "results": [
    {
      "id": "1",
      "name": "Margherita Pizza",
      "description": "Classic Italian pizza...",
      "rate": 9.99,
      "category": "Italian",
      "imageUrl": "/images/italian/margherita.jpg",
      "ingredients": ["cheese", "basil", "tomato", "dough"],
      "dietary": ["vegetarian"],
      "spicy": false
    },
    // ... more dishes
  ]
}
```

## Frontend Components

### SearchFilters Component
**Location**: `src/component/Dashboard/search/SearchFilters.js`

Handles all search and filter inputs. Features:
- Real-time filter updates
- Multiple dietary preference selection
- Price range validation
- Reset all filters option
- Loading and error states

### SearchResults Component
**Location**: `src/component/Dashboard/search/SearchResults.js`

Displays search results with:
- Responsive grid layout
- Dish cards with images and details
- Ingredient tags
- Dietary badges
- Price display
- "Add to Cart" functionality
- Empty state messaging

## Dish Data Structure

Each dish includes:
```javascript
{
  id: '1',
  name: 'Margherita Pizza',
  description: 'Classic Italian pizza with fresh mozzarella and basil.',
  rate: 9.99,
  category: 'Italian',
  imageUrl: '/images/italian/margherita.jpg',
  ingredients: ['cheese', 'basil', 'tomato', 'dough'],
  dietary: ['vegetarian'],  // Can include: 'vegetarian', 'vegan', 'gluten-free'
  spicy: false
}
```

## User Workflows

### Basic Search
1. Click "🔍 Search" button in header navigation
2. Type search query (e.g., "peanuts", "mushroom")
3. Click "Search" or press Enter
4. View filtered results

### Advanced Filtering
1. Go to Search page
2. Set multiple filters:
   - Select cuisine type
   - Set price range
   - Choose dietary preferences
   - Select spice level
3. Click "Apply Filters"
4. Browse results
5. Click "Add to Cart" on desired dishes

### Reset Filters
1. Click "Reset All" button
2. All filters return to default state

## Styling

### CSS Files
- `searchfilters.css`: Search & filter component styling
- `searchresults.css`: Results display styling

### Color Scheme
- **Primary**: #667eea (purple)
- **Secondary**: #764ba2 (dark purple)
- **Background**: #f8f9fa (light gray)
- **Text**: #333 (dark gray)

### Responsive Design
- **Desktop**: Full grid layout (3-4 columns)
- **Tablet**: 2-3 column layout
- **Mobile**: Single column layout

## Integration Points

### Header Navigation
Search button added to header for easy access:
```javascript
<button className="nav-button" onClick={gotoSearch}>
  🔍 Search
</button>
```

### App Routes
Added search route:
```javascript
<Route path='/search'> <SearchResults /></Route>
```

## Performance Considerations

1. **Server-side filtering**: All filtering done on backend for efficiency
2. **Query parameter optimization**: RESTful URL structure for bookmarking
3. **Result limiting**: Reasonable default result set size
4. **Responsive images**: Optimized image loading

## Future Enhancements

1. **Search History**: Save user's recent searches
2. **Advanced Filters UI**: More sophisticated filter interface
3. **Rating Filter**: Filter by dish ratings/reviews
4. **Allergen Info**: Display allergen information
5. **Nutrition Data**: Show calorie and nutritional info
6. **Saved Searches**: Save and share custom filter combinations
7. **Auto-complete**: Suggestion dropdown while typing
8. **Filter Presets**: Quick preset filters (e.g., "Quick Vegetarian", "Budget Meals")

## Testing Checklist

- [ ] Search by dish name works
- [ ] Search by ingredients works
- [ ] Category filter works
- [ ] Price range filter works
- [ ] Dietary preferences filter (single and multiple)
- [ ] Spice level filter works
- [ ] Sort options work correctly
- [ ] Results display properly
- [ ] Add to cart from search results
- [ ] Reset filters clears all selections
- [ ] Mobile responsiveness
- [ ] Empty state displays correctly
- [ ] Combine multiple filters
- [ ] No results state displays correctly

## Support & Troubleshooting

### Common Issues

**No results showing**:
- Check if search terms match dish names or ingredients
- Verify filter combinations aren't too restrictive
- Try clearing filters and searching again

**Filters not applying**:
- Ensure you clicked "Apply Filters" button
- Check backend API is running on port 5000
- Verify network tab shows successful API calls

**Add to cart not working**:
- Ensure you are logged in
- Check browser console for errors
- Verify Redux store is properly configured

## Files Modified/Created

**Created**:
- `src/component/Dashboard/search/SearchFilters.js`
- `src/component/Dashboard/search/SearchResults.js`
- `src/component/Dashboard/search/searchfilters.css`
- `src/component/Dashboard/search/searchresults.css`

**Modified**:
- `backend/src/server.js` - Added `/api/search` endpoint
- `src/App.js` - Added search route
- `src/component/Dashboard/header/header.js` - Added search navigation button

**Data Updates**:
- Enhanced dish objects with `ingredients`, `dietary`, and `spicy` properties
