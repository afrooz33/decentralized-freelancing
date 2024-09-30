import React, { useEffect, useState } from "react";
import abi from "../../Contract/Freelancing.json";
import { ethers } from "ethers";
import "./PostJob.css";

function PostJob() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
  });

  const [job, setJob] = useState({
    category: "",
    description: "",
    amount: 0,
    paymentType: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const connectWallet = async () => {
    try {
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      const contractABI = abi.abi;

      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to continue.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setState({ provider, signer, contract });
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert("Failed to connect to MetaMask wallet.");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob({ ...job, [name]: value });
  };

  const submitJob = async (e) => {
    e.preventDefault();
    try {
      if (!state.contract) {
        alert("Please connect your wallet first.");
        return;
      }

      const { category, description, amount, paymentType } = job;
      const weiAmount = ethers.utils.parseEther(amount.toString());

      const tx = await state.contract.postJob(category, description, weiAmount, paymentType);
      await tx.wait();

      setSubmitted(true);
      alert("Job posted successfully!");
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post the job.");
    }
  };

  return (
    <div className="post-job-container">
      <h1>Post a New Job</h1>

      {/* Job Posting Form */}
      <form onSubmit={submitJob}>
        <label>
          Job Category:
          <input
            type="text"
            name="category"
            value={job.category}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={job.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Amount (in ETH):
          <input
            type="number"
            name="amount"
            value={job.amount}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Payment Type:
          <select name="paymentType" value={job.paymentType} onChange={handleChange} required>
            <option value="">Select payment type</option>
            <option value="hourly">Hourly</option>
            <option value="part-time">Part-time</option>
            <option value="full-time">Full-time</option>
          </select>
        </label>

        <button type="submit">Submit Job</button>
      </form>

      {/* Display submission success message */}
      {submitted && <p>Job has been successfully posted!</p>}
    </div>
  );
}

export default PostJob;
