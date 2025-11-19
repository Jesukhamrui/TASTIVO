import React from "react";
import './infoPages.css';
import Header from './header/header';
import Footer from './footer/footer';
import avatar from './image/profile.png';

export default function Team() {
  const members = [
    { name: 'Asha Verma', role: 'Founder & CEO', img: avatar, bio: 'Leads product and partnerships.' },
    { name: 'Ravi Singh', role: 'CTO', img: avatar, bio: 'Heads engineering and platform.' },
    { name: 'Maya Rao', role: 'Head of Operations', img: avatar, bio: 'Manages logistics and operations.' },
    { name: 'Carlos M.', role: 'Head Chef Relations', img: avatar, bio: 'Works with partner kitchens.' }
  ];

  return (
    <div>
      <Header />
      <div className="info-page">
        <div className="info-content">
          <h2>Our Team</h2>
          <p>Meet the people who build Tastivo and keep your orders running smoothly.</p>

          <div className="team-grid">
            {members.map((m, idx) => (
              <div key={idx} className="team-card">
                <img src={m.img} alt={m.name} className="team-avatar" />
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <p style={{fontSize:'0.95rem',color:'#444'}}>{m.bio}</p>
              </div>
            ))}
          </div>

          <div className="info-section">
            <h3>Join Us</h3>
            <p>We're always looking for talented people to join our team — engineering, operations, marketing, and restaurant partnerships. Email careers@tastivo.com to reach our HR team.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
