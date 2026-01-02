import React, { useEffect, useState } from "react";
import Header from "./header/header";
import Footer from "./footer/footer";
import "./infoPages.css";
import "./home/categories/categories.css";
import { useHistory } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function Favorites() {
  const history = useHistory();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      history.push("/login");
      return;
    }

    async function loadFavorites() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/api/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to load favorites.");
          return;
        }
        const data = await res.json();
        setFavorites(data);
      } catch (e) {
        console.error("Error loading favorites", e);
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [history]);

  return (
    <div className="sfp-bg">
      <Header />
      <div className="info-page">
        <div className="info-content">
          <h2>Your Favorites</h2>
          {loading && <p>Loading favorites...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && favorites.length === 0 && (
            <p>You have no favorite dishes yet.</p>
          )}
          <div className="All-dish-card">
            {favorites.map((dish) => (
              <div key={dish.id} className="Perslide">
                {dish.imageUrl && (
                  <img src={dish.imageUrl} alt={dish.name} />
                )}
                <p>{dish.name}</p>
                {dish.category && (
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>{dish.category}</p>
                )}
                <span style={{ display: "block" }}>₹{dish.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Favorites;
