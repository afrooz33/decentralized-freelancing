import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../../Contract/Freelancing.json";
import './AddReviews.css';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function AddReviews() {
  const [orderId, setOrderId] = useState("");
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [review, setReview] = useState("");

  // Add review for freelancer or client
  const addReview = async () => {
    try {
      if (!orderId || !review) {
        alert("Please provide both Order ID and Review.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi.abi, signer);

      if (isFreelancer) {
        // Add review for freelancer
        const tx = await contract.addReviewForFreelancer(orderId, review);
        await tx.wait();
        alert("Review added for freelancer!");
      } else {
        // Add review for client
        const tx = await contract.addReviewForClient(orderId, review);
        await tx.wait();
        alert("Review added for client!");
      }

      // Clear the fields after submitting the review
      setOrderId("");
      setReview("");
    } catch (err) {
      console.error("Error adding review:", err);
      alert("Failed to add review. Please check the order ID and your wallet connection.");
    }
  };

  return (
    <div className="add-reviews-container">
      <h1>Freelancing Review System</h1>
      <input
        type="text"
        placeholder="Enter Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        className="input-field"
      />
      <textarea
        placeholder="Write your review"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="textarea-field"
      />
      <div className="checkbox-container">
        <label>
          <input
            type="checkbox"
            checked={isFreelancer}
            onChange={() => setIsFreelancer(!isFreelancer)}
          />
          <span>I'm a freelancer</span>
        </label>
      </div>
      <button onClick={addReview} className="submit-button">
        Submit Review
      </button>
    </div>
  );
}

export default AddReviews;
