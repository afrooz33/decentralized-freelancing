import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from "../../Contract/Freelancing.json";

const contractABI = abi.abi;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const PlaceOrder = () => {
  const [freelancerAddress, setFreelancerAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Ethereum wallet.");
      return null;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  useEffect(() => {
    if (amount) {
      const baseAmount = ethers.utils.parseEther(amount);
      const taxAmount = baseAmount.mul(101).div(100);
      setTotalAmount(ethers.utils.formatEther(taxAmount));
    }
  }, [amount]);

  const placeOrder = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const contract = await connectWallet();
      if (!contract) return;

      const amountInWei = ethers.utils.parseEther(totalAmount);
      const tx = await contract.placeOrder(freelancerAddress, {
        value: amountInWei,
      });

      const receipt = await tx.wait(); // Wait for the transaction to be mined

      // Listen for the OrderPlaced event
      const event = receipt.events.find(event => event.event === 'orderIdInEvent');
      if (event) {
        const orderIdFromEvent = event.args[0]; // Assuming order ID is the first argument
        setOrderId(orderIdFromEvent);
        alert(`Order placed successfully! Your Order ID is: ${orderIdFromEvent}`);
      }

    } catch (error) {
      console.error("Order placement error:", error);
      setErrorMessage("Failed to place the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="place-order-container">
      <h2>Place a Freelance Order</h2>

      <div className="form-group">
        <label>Freelancer Address:</label>
        <input
          type="text"
          value={freelancerAddress}
          onChange={(e) => setFreelancerAddress(e.target.value)}
          placeholder="Enter Freelancer's Address"
          required
        />
      </div>

      <div className="form-group">
        <label>Base Amount (in ETH):</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter Amount"
          required
        />
      </div>

      <div className="form-group">
        <label>Total Amount with Tax (1%):</label>
        <input
          type="text"
          value={totalAmount}
          readOnly
        />
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button
        onClick={placeOrder}
        disabled={loading}
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>

      {orderId && (
        <p>
          Order placed successfully! Your Order ID is: <strong>{orderId}</strong>
        </p>
      )}
    </div>
  );
};

export default PlaceOrder;






//orderid = 0x29446483059310427cfd781e864f1fe79c137b29dfc24be9487697b8fed80d9d