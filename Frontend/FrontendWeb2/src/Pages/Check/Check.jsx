import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../../Contract/Freelancing.json";
import './Check.css';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function Check() {
  const [address, setAddress] = useState("");
  const [data, setData] = useState(null);
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [review, setReview] = useState("");
  const [checkReviews, setCheckReviews] = useState([]);


  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  // Check whether the entered address belongs to a client or freelancer
  const checkAddress = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        abi.abi,
        provider
      );

      // Get freelancer data
      const freelancerData = await contract.freelancers(address);
      const freelancerReviews = await contract.getFreelancerReviews(address);
      if (freelancerData.freelancerAddress !== ethers.constants.AddressZero) {
        setData(freelancerData);
        setIsFreelancer(true);
        setCheckReviews(freelancerReviews);
      } else {
        // If not a freelancer, check client data
        const clientData = await contract.clients(address);
        const clientReviews = await contract.getClientReviews(address);
        if (clientData.clientAddress !== ethers.constants.AddressZero) {
          setData(clientData);
          setIsFreelancer(false);
          setCheckReviews(clientReviews);
        } else {
          setData(null);
          alert("No freelancer or client found with this address.");
        }
      }


    } catch (err) {
      alert("You are not a Freelancer or Client");
      console.error("Error checking address:", err);
    }
  };

  // Add review for freelancer or client
  const addReview = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        abi.abi,
        signer
      );

      if (isFreelancer) {
        // Add review for freelancer
        const tx = await contract.addReviewForFreelancer(data.orderId, review);
        await tx.wait();
        alert("Review added for freelancer!");
      } else {
        // Add review for client
        const tx = await contract.addReviewForClient(data.orderId, review);
        await tx.wait();
        alert("Review added for client!");
      }
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  return (
    <div className="check">
      <div className="app-container">
        <h1>Freelancing Review System</h1>
        <input
          type="text"
          placeholder="Enter user address"
          value={address}
          onChange={handleAddressChange}
        />
        <button onClick={checkAddress}>Check User</button>

        {data && (
          <div className="user-info">
            <h2>{isFreelancer ? "Freelancer" : "Client"} Information</h2>
            <p><strong>Name:</strong> {data.name}</p>
            <p><strong>Description:</strong> {data.description}</p>
            <p><strong>Reviews:</strong></p>
            <ul>
              {checkReviews.length > 0 ? (
                checkReviews.map((review, index) => (
                  <li key={index}>{review}</li>
                ))
              ) : (
                <p>No reviews available.</p>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Check;
