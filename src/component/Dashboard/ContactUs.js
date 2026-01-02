import React, { useState } from "react";
import './infoPages.css';
import Header from './header/header';
import Footer from './footer/footer';

const API_BASE_URL = "http://localhost:5000";

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSent(false);

      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Failed to send your message. Please try again.');
      } else {
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
      }
    } catch (err) {
      console.error('Error sending contact message', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header />
      <div className="info-page">
        <div className="info-content">
          <h2>Contact Us</h2>
          <p>Need help? Reach out to our support team — we usually reply within 24 hours.</p>

          <div className="info-section">
            <h3>Support</h3>
            <p>Email: <a href="mailto:support@tastivo.com">support@tastivo.com</a> · Phone: +1-234-567-890</p>
          </div>

          <div className="info-section">
            <h3>Send us a message</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                placeholder="Your name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />
              <input
                placeholder="Your email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
              <textarea
                placeholder="How can we help?"
                rows={6}
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Message'}
              </button>
              {sent && <div className="contact-success">Thanks — your message has been received.</div>}
              {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}
            </form>
          </div>

          <div className="info-section">
            <h3>Customer Care Hours</h3>
            <p>Mon–Fri: 8:00–20:00 · Sat–Sun: 9:00–18:00</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
