import React, { useEffect, useState } from "react";
import logo from '../image/food.png'
import cartimg from '../image/cart.jpg'
import '../header/header.css'
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

function Header(){
    const {cartTotalQUantity}=useSelector((state)=>state.cart)
    let history=useHistory()
    const [currentUser,setCurrentUser] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(()=>{
        const stored = localStorage.getItem('user');
        if(stored){
            try{
                setCurrentUser(JSON.parse(stored));
            }catch{
                setCurrentUser(null);
            }
        }else{
            setCurrentUser(null);
        }
    },[])
    
    function handleSearch(e) {
        e.preventDefault();
        if (searchQuery.trim()) {
            history.push(`/home?search=${encodeURIComponent(searchQuery)}`);
        }
    }
    
    function AddCart(){
        history.push('/cart')
    }
    function Profile(){
        history.push('/profile')
    }
    function gotoMyOrders(){
        history.push('/myorders')
    }
    function gotoTopRated(){
        history.push('/toprated')
    }
    function gotoHome(){
        history.push('/home')
    }
    function gotoAdmin(){
        history.push('/admin')
    }
    function gotoSearch(){
        history.push('/search')
    }
    function Logout(){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        history.push('/login')
    }
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    }
    
    return(
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <div className="header-logo" onClick={gotoHome}>
                    <img src={logo} className='logo' alt="Tastivo logo" />
                    <span className="logo-text">TASTIVO</span>
                </div>

                {/* Search Bar */}
                <form className="header-search" onSubmit={handleSearch}>
                    <input 
                        type='text' 
                        className="search-input"
                        placeholder="Search for dishes, cuisines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                        <span className="search-icon">🔍</span>
                        <span className="search-text">Search</span>
                    </button>
                </form>

                {/* Desktop Navigation */}
                <nav className="header-nav desktop-nav">
                    <button className="nav-button" onClick={gotoHome}>
                        🏠 Home
                    </button>
                    <button className="nav-button" onClick={gotoSearch}>
                        🔍 Search
                    </button>
                    <button className="nav-button" onClick={gotoTopRated}>
                        ⭐ Top Rated
                    </button>
                    <button className="nav-button" onClick={gotoMyOrders}>
                        📦 My Orders
                    </button>
                    <button className="nav-button" onClick={Profile}>
                        👤 Profile
                    </button>
                    {currentUser && currentUser.email && currentUser.email.toLowerCase().includes('admin') && (
                        <button className="nav-button admin-button" onClick={gotoAdmin}>
                            ⚙️ Admin
                        </button>
                    )}
                </nav>

                {/* Cart Button */}
                <div className="header-cart" onClick={AddCart}>
                    <button className="cart-button">
                        <img src={cartimg} alt="Cart" />
                        {cartTotalQUantity > 0 && (
                            <span className="cart-badge">{cartTotalQUantity}</span>
                        )}
                    </button>
                </div>

                {/* User Info & Logout */}
                <div className="header-user">
                    {currentUser && (
                        <span className="user-greeting">Hi, {currentUser.name}</span>
                    )}
                    <button className="logout-button" onClick={Logout}>
                        🚪 Logout
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            <nav className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
                <button className="mobile-nav-button" onClick={() => { gotoHome(); setMobileMenuOpen(false); }}>
                    🏠 Home
                </button>
                <button className="mobile-nav-button" onClick={() => { gotoTopRated(); setMobileMenuOpen(false); }}>
                    ⭐ Top Rated
                </button>
                <button className="mobile-nav-button" onClick={() => { gotoMyOrders(); setMobileMenuOpen(false); }}>
                    📦 My Orders
                </button>
                <button className="mobile-nav-button" onClick={() => { Profile(); setMobileMenuOpen(false); }}>
                    👤 Profile
                </button>
                {currentUser && currentUser.email && currentUser.email.toLowerCase().includes('admin') && (
                    <button className="mobile-nav-button" onClick={() => { gotoAdmin(); setMobileMenuOpen(false); }}>
                        ⚙️ Admin
                    </button>
                )}
                <button className="mobile-nav-button logout-mobile" onClick={() => { Logout(); setMobileMenuOpen(false); }}>
                    🚪 Logout
                </button>
            </nav>
        </header>
    )
}

export default Header