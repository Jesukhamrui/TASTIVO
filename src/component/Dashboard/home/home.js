import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Imageslide from "./Imageslides";
import Header from "../header/header";
import '../header/header.css'
import Indianfood from "./categories/Indianfood/Indianfood";
import Footer from "../footer/footer";
import Italianfood from "./categories/Italian food/Italianfood";
import { useSelector, useDispatch } from "react-redux";
import { getTotals } from "../cart/cartslice";
import { useEffect, useState } from "react";
import Categories from "./categories/categories";
import Koreanfood from "./categories/korean food/Koreanfood";
import Americanfood from "./categories/Americanfood/Americanfood";
import Chinesefood from "./categories/Chinesefood/Chinesefood";
import Mexicanfood from "./categories/Mexicanfood/Mexicanfood";
import Thaifood from "./categories/Thaifood/Thaifood";
import Food from "../../foodimage";
import { useLocation } from "react-router-dom";

function Home() {
    const cart = useSelector((state) => state.cart)
    let dispatch = useDispatch()
    const location = useLocation();
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        dispatch(getTotals())
    }, [cart, dispatch])

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        
        if (searchQuery && searchQuery.trim()) {
            setIsSearching(true);
            const query = searchQuery.toLowerCase();
            const filtered = Food.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.titlename.toLowerCase().includes(query)
            );
            setSearchResults(filtered);
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    }, [location.search]);

    const slides = [
        { url: require("../image/slide1.jpg"), title: 'slide1' },
        { url: require("../image/slide2.jpg"), title: 'slide2' },
        { url: require("../image/slide3.jpg"), title: 'slide3' },
        { url: require("../image/slide4.jpg"), title: 'slide4' },
        { url: require("../image/slide5.jpg"), title: 'slide5' },
        { url: require("../image/slide6.jpg"), title: 'slide6' },
        { url: require("../image/slide7.jpg"), title: 'slide7' }
    ]
    return (
        <div className="home">
            <Header />
            {isSearching ? (
                <div className="container mt-5" style={{minHeight: '500px', paddingBottom: '50px'}}>
                    <div className="search-results-header mb-4">
                        <h2 style={{color: '#333', fontSize: '24px', marginBottom: '20px'}}>
                            Search Results ({searchResults.length} items found)
                        </h2>
                        <button 
                            className="btn btn-secondary mb-3" 
                            onClick={() => window.location.href = '/home'}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            ← Back to All Dishes
                        </button>
                    </div>
                    {searchResults.length > 0 ? (
                        <div className="row">
                            {searchResults.map((item) => (
                                <div className="col-md-3 mb-4" key={item.id}>
                                    <div className="card h-100" style={{
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.3s ease'
                                    }}>
                                        <img 
                                            src={item.url} 
                                            className="card-img-top" 
                                            alt={item.title}
                                            style={{height: '200px', objectFit: 'cover'}}
                                        />
                                        <div className="card-body">
                                            <h5 className="card-title" style={{fontSize: '16px', fontWeight: 'bold'}}>{item.title}</h5>
                                            <p className="card-text" style={{fontSize: '14px', color: '#666', height: '60px', overflow: 'hidden'}}>
                                                {item.description}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-warning" style={{fontSize: '14px'}}>⭐ {item.star}</span>
                                                <span className="font-weight-bold" style={{fontSize: '18px', color: '#e74c3c'}}>${item.rate}</span>
                                            </div>
                                            <button 
                                                className="btn btn-primary w-100 mt-2"
                                                onClick={() => {
                                                    const { addTocart } = require('../cart/cartslice');
                                                    dispatch(addTocart(item));
                                                }}
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    border: 'none',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-results text-center" style={{padding: '80px 20px'}}>
                            <h3 style={{fontSize: '28px', color: '#666', marginBottom: '10px'}}>No dishes found</h3>
                            <p style={{fontSize: '16px', color: '#999'}}>Try searching with different keywords</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg">
                        <div className="main-slice">
                            <Imageslide slides={slides} />
                        </div>
                    </div>
                    <Categories />
                    <div className="categories">
                        <Indianfood />
                        <Italianfood />
                        <Koreanfood />
                        <Chinesefood />
                        <Mexicanfood />
                        <Thaifood />
                        <Americanfood />
                    </div>
                </>
            )}
            <Footer />
        </div>

    )
}

export default Home