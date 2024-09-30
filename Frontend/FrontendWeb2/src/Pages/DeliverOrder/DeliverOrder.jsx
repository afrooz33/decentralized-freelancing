import React, { useEffect, useState } from 'react';
import abi from "../../Contract/Freelancing.json";
import './DeliverOrder.css';
import { ethers } from 'ethers';

function DeliverOrder() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
  });

  const [deliverOrderId, setDeliverOrderId] = useState('');
  const [completeOrderId, setCompleteOrderId] = useState('');
  const [disputeOrderId, setDisputeOrderId] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [jobIdToDelete, setJobIdToDelete] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [freelancerAddress, setFreelancerAddress] = useState('0xFreelancerAddressHere');
  const [clientAddress, setClientAddress] = useState('0xClientAddressHere');

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contractABI = abi.abi;

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask or another Ethereum wallet.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setState({ provider, signer, contract });

      const userAddress = await signer.getAddress();
      setUserAddress(userAddress);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const deliverOrder = async () => {
    try {
      const { contract } = state;
      const tx = await contract.deliverOrder(deliverOrderId);
      await tx.wait();
      alert("Order delivered successfully.");
    } catch (error) {
      console.error("Error delivering order:", error);
    }
  };

  const completeOrder = async () => {
    try {
      const { contract } = state;
      const tx = await contract.completeOrder(completeOrderId);
      await tx.wait();
      alert("Order completed successfully.");
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  const disputeOrder = async () => {
    try {
      const { contract } = state;
      const tx = await contract.disputeOrder(disputeOrderId);
      await tx.wait();
      alert("Order disputed successfully.");
    } catch (error) {
      console.error("Error disputing order:", error);
    }
  };

  const cancelOrder = async () => {
    try {
      const { contract } = state;
      const tx = await contract.cancelAfterDelivery(cancelOrderId);
      await tx.wait();
      alert("Order canceled successfully.");
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const deleteJob = async () => {
    try {
      const { contract } = state;
      const tx = await contract.deleteJob(jobIdToDelete);
      await tx.wait();
      alert("Job deleted successfully.");
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="deliver-order-container">
      <h1 style={{textAlign: "center"}}>Freelance Platform Actions</h1>

      <div className="action-group">
        <h3>Deliver Order</h3>
        <input
          type="text"
          placeholder="Order ID"
          value={deliverOrderId}
          onChange={(e) => setDeliverOrderId(e.target.value)}
        />
        <button onClick={deliverOrder}>Deliver Order </button>
      </div>

      <div className="action-group">
        <h3>Complete Order</h3>
        <input
          type="text"
          placeholder="Order ID"
          value={completeOrderId}
          onChange={(e) => setCompleteOrderId(e.target.value)}
        />
        <button onClick={completeOrder}>Complete Order (only client)</button>
      </div>

      <div className="action-group">
        <h3>Dispute Order</h3>
        <input
          type="text"
          placeholder="Order ID"
          value={disputeOrderId}
          onChange={(e) => setDisputeOrderId(e.target.value)}
        />
        <button onClick={disputeOrder}>Dispute Order (only client)</button>
      </div>

      <div className="action-group">
        <h3>Cancel Order After Delivery</h3>
        <input
          type="text"
          placeholder="Order ID"
          value={cancelOrderId}
          onChange={(e) => setCancelOrderId(e.target.value)}
        />
        <button onClick={cancelOrder}>Cancel Order (only client)</button>
      </div>

      <div className="action-group">
        <h3>Delete Job (Client Only)</h3>
        <input
          type="text"
          placeholder="Job ID to Delete"
          value={jobIdToDelete}
          onChange={(e) => setJobIdToDelete(e.target.value)}
        />
        <button onClick={deleteJob}>Delete Job</button>
      </div>
    </div>
  );
}

export default DeliverOrder;
