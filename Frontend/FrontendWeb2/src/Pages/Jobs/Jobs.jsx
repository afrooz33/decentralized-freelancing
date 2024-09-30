import React, { useEffect, useState } from 'react';
import abi from "../../Contract/Freelancing.json";
import Chatbot from './Chatbot'; 
import DeliverFreelancer from './DeliverFreelancer';
import './Jobs.css';
import { ethers } from 'ethers';

function Jobs() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [jobs, setJobs] = useState([]);

  const connectWallet = async () => {
    try {
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      const contractABI = abi.abi;

      if (!window.ethereum) {
        alert("Please install MetaMask or another Ethereum wallet.");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setState({ provider, signer, contract });
    } catch (error) {
      alert("Failed to connect to wallet.");
      console.error("Wallet connection error:", error);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const fetchJobs = async () => {
    if (state.contract) {
      try {
        const jobCounter = await state.contract.jobCounter(); // Fetch the total number of jobs
        const jobsArray = [];

        for (let i = 0; i < jobCounter.toNumber(); i++) {
          const job = await state.contract.jobs(i); // Get each job
          jobsArray.push({
            jobId: job.jobId.toNumber(),
            clientAddress: job.clientAddress,
            category: job.category,
            description: job.description,
            amount: ethers.utils.formatEther(job.amount), // Convert to Ether
            paymentType: job.paymentType,
          });
        }

        setJobs(jobsArray);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [state.contract]);

  const filteredJobs = jobs.filter((job) =>
    job.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
    job.description.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className='jobPage'>
      <p className='jpbPage-title' style={{textAlign: "center"}}>You can get jobs</p>
      <div className="job-container">
        {/* Left Side: List of Jobs */}
        <div className="job-list-container">
          <h2>Job Listings</h2>
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="search-bar"
          />
          <div className="job-list">
            {filteredJobs.map((job) => (
              <div
                key={job.jobId}
                className="job-item"
                onClick={() => setSelectedJob(job)}
              >
                <h3>{job.category}</h3>
                <p style={{textAlign: "left"}}>{job.description.substring(0, 60)}...</p>
                <p>Amount: {job.amount} ETH</p>
                <p>Payment Type: {job.paymentType}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Job Details */}
        <div className="job-details">
          {selectedJob ? (
            <>
              <h3>Job Details</h3>
              <p><span className='Bold'>Category: </span>{selectedJob.category}</p>
              <p style={{"textAlign": "left"}}>Description: {selectedJob.description}</p>
              <p>Amount: {selectedJob.amount} ETH</p>
              <p>Payment Type: {selectedJob.paymentType}</p>
              {selectedJob && <DeliverFreelancer />}
              <button className="chatbot-button" onClick={() => setShowChatbot(true)}>Chat with Client</button>
              {showChatbot && <Chatbot />}
            </>
          ) : (
            <p>Select a job to see the details</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Jobs;
