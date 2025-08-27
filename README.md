# TASTIVO

TASTIVO is a modern food ordering web application built with React. It allows users to browse dishes, add them to a cart, and place orders. The app features category-based browsing, user authentication, and a visually appealing interface.

## Table of Contents
- [Project Structure](#project-structure)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Project Structure
```
TASTIVO/
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├
├── src/
│   ├── App.css
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   ├── setupTests.js
│   ├── redux/
│   │   └── store.js
│   └── component/
│       ├── foodimage.js
│       ├── login/
│       │   └── login.js
│       ├── register/
│       │   ├── register.css
│       │   └── register.js
│       └── Dashboard/
│           ├── All dish/
│           │   └── alldish.js
│           ├── cart/
│           │   ├── cart.css
│           │   ├── cart.js
│           │   └── cartslice.js
│           ├── foodimages/
│           │   └── Indfood-1.jpg
│           ├── footer/
│           │   ├── footer.css
│           │   └── footer.js
│           ├── header/
│           │   ├── header.css
│           │   └── header.js
│           ├── home/
│           │   ├── home.js
│           │   ├── Imageslides.js
│           │   └── categories/
│           │       ├── categories.css
│           │       ├── categories.js
│           │       ├── singledish.js
│           │       ├── Indianfood/
│           │       │   └── Indianfood.js
│           │       ├── Italian food/
│           │       │   └── Italianfood.js
│           │       └── korean food/
│           │           └── Koreanfood.js
│           ├── image/
│           │   └── [multiple image files]
│           └── profile/
│               ├── profile.js
│               └── profilr.css
```

## Features
- User authentication (login/register)
- Browse dishes by category (Indian, Italian, Korean)
- Add dishes to cart and manage cart items
- Responsive UI with image slides and rich visuals
- Screenshots available in `/screenshots`
- Redux for state management
- Footer, header, and profile components

## Technologies Used
- React
- Redux
- JavaScript (ES6+)
- CSS
- HTML5

## Getting Started
1. **Install dependencies:**
	```
	npm install
	```
2. **Start the development server:**
	```
	npm run dev
	```
3. **Open your browser:**
	Visit [http://localhost:3000](http://localhost:3000)

## Usage
- Register or log in to your account
- Browse dishes by category
- Add dishes to your cart
- View and manage your cart
- Place orders

## Screenshots
Screenshots of the application can be found in the `/screenshots` folder.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the terms of the LICENSE file.

