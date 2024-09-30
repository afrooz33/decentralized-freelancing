import { ethers } from 'ethers';
import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Decentralized Freelancing</h1>
          <p>Your gateway to a decentralized, transparent, and secure freelancing experience.</p>
          <div className="hero-buttons">
            <button className="client-btn" onClick={() => navigate('/client')}>Client</button>
            <button className="freelancer-btn" onClick={() => navigate('/freelancer')}>Freelancer</button>
          </div>
        </div>
        <div className="hero-animation">
          <img src="your-animation-or-vector-image-url-here" alt="Animation" />
        </div>
      </div>
    </div>
  );
}

export default Home;
