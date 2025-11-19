import React, { useState } from "react";
import './infoPages.css';
import Header from './header/header';
import Footer from './footer/footer';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return alert('Please fill all fields');
    // client-side only: show success
    setSent(true);
    setName(''); setEmail(''); setMessage('');
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
              <input placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} />
              <input placeholder="Your email" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <textarea placeholder="How can we help?" rows={6} value={message} onChange={(e)=>setMessage(e.target.value)} />
              <button type="submit">Send Message</button>
              {sent && <div className="contact-success">Thanks — your message has been received.</div>}
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
