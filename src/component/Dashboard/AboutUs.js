import React from "react";
import './infoPages.css';
import Header from './header/header';
import Footer from './footer/footer';

export default function AboutUs() {
  return (
    <div>
      <Header />
      <div className="info-page">
        <div className="info-content">
          <h2>About Us</h2>
          <p>Welcome to Tastivo — your local hub for tasty meals and easy delivery. We connect you with high-quality restaurants and authentic home-style cooks in your neighborhood.</p>

          <div className="info-section">
            <h3>Our Mission</h3>
            <p>To make delicious, diverse cuisine accessible to everyone — quickly, affordably, and reliably. We focus on freshness, honest pricing, and great customer experience.</p>
          </div>

          <div className="info-section">
            <h3>What We Offer</h3>
            <ul>
              <li>Curated categories (Indian, Italian, Mexican, Chinese, Thai, American, and more)</li>
              <li>Easy cart and checkout with secure ordering</li>
              <li>User profiles, order history, and favorites</li>
              <li>Fast delivery and reliable customer support</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Our Values</h3>
            <p>Freshness, Transparency, Community, and Simplicity. We work with partners who share these values.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
