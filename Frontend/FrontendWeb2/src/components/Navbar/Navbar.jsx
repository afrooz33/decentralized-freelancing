import React, { useState } from 'react'; // Import useState
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaBriefcase, FaUser, FaUserTie, FaEnvelope, FaUserCheck } from 'react-icons/fa';
import { MdOutlineRateReview } from "react-icons/md";
import { GiShoppingCart } from 'react-icons/gi';
import { ethers } from 'ethers'; // Import ethers
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);

    // Function to connect to MetaMask
    const connectMetaMask = async () => {
        if (window.ethereum) {
            try {
                // Request account access if needed
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

                // Set the connected account
                setAccount(accounts[0]);

                // Create a provider and connect it to the Ethereum network
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const network = await provider.getNetwork();
                console.log('Connected to network:', network.name);
            } catch (err) {
                console.error('Error connecting to MetaMask:', err);
                alert('Failed to connect to MetaMask');
            }
        } else {
            alert('MetaMask is not installed');
        }
    };

    return (
        <nav className="navbar sticky">
            <div className="logo">FreelancerHub</div>
            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <FaHome className="nav-icon" />
                    Home
                </NavLink>
                <NavLink to="/jobs" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <FaBriefcase className="nav-icon" />
                    Jobs
                </NavLink>
                <NavLink to="/client" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <FaUserTie className="nav-icon" />
                    Client
                </NavLink>
                <NavLink to="/freelancer" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <FaUser className="nav-icon" />
                    Freelancer
                </NavLink>
                <NavLink to="/chatbot" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <FaEnvelope className="nav-icon" />
                    Message
                </NavLink>
                <NavLink to="/deliverOrder" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <GiShoppingCart className='nav-icon' />
                    Deliver
                </NavLink>
                <NavLink to="/check" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <FaUserCheck className='nav-icon' />
                    Check
                </NavLink>
                <NavLink to="/addReviews" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                    <MdOutlineRateReview  className='nav-icon' />
                    Reviews
                </NavLink>
            </div>
            <div className="nav-buttons">
                <button 
                    className='connect-wallet'
                    onClick={connectMetaMask}
                >
                    {account ? `Connected` : 'Connect Metamask'}
                </button>
                <button className="post-job" onClick={() => navigate('/postJob')}>Post Job</button>
            </div>
        </nav>
    );
}

export default Navbar;
