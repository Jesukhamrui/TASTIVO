import React, { useEffect, useState } from "react";
import Header from "./header/header";
import Footer from "./footer/footer";
import "./infoPages.css";

const API_BASE_URL = "http://localhost:5000";

function Admin() {
  const [contacts, setContacts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [contactRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/contact-messages`),
          fetch(`${API_BASE_URL}/api/admin/orders`),
        ]);

        const contactData = await contactRes.json().catch(() => []);
        const ordersData = await ordersRes.json().catch(() => []);

        if (!contactRes.ok || !ordersRes.ok) {
          setError("Failed to load admin data.");
          return;
        }

        setContacts(contactData);
        setOrders(ordersData);
      } catch (e) {
        console.error("Error loading admin data", e);
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="sfp-bg">
      <Header />
      <div className="info-page">
        <div className="info-content">
          <h2>Admin Dashboard</h2>
          {loading && <p>Loading data...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && (
            <>
              <div className="info-section">
                <h3>Contact Messages</h3>
                {contacts.length === 0 ? (
                  <p>No contact messages yet.</p>
                ) : (
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {contacts.map((c) => (
                      <li key={c.id} style={{ marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "6px" }}>
                        <strong>{c.name}</strong> ({c.email})<br />
                        <small>{c.createdAt}</small>
                        <p>{c.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="info-section">
                <h3>Orders</h3>
                {orders.length === 0 ? (
                  <p>No orders yet.</p>
                ) : (
                  <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                    {orders.map((o) => (
                      <li key={o.id} style={{ marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "6px" }}>
                        <strong>Order #{o.id}</strong> · User ID: {o.userId}<br />
                        <small>{o.createdAt}</small>
                        <div>
                          Total: ₹{o.totalAmount}
                        </div>
                        <ul>
                          {o.items && o.items.map((item) => (
                            <li key={item.dishId}>
                              {item.name} × {item.quantity} (₹{item.itemTotal})
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Admin;
