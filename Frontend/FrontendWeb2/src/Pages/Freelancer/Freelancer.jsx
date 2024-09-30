import React, { useEffect, useState } from 'react';
import './Freelancer.css';
import abi from "../../Contract/Freelancing.json";
import { ethers } from 'ethers';

function Freelancer() {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        contract: null
    });

    const [freelancer, setFreelancer] = useState({
        name: '',
        description: '',
        certificates: ['']
    });

    const [submittedFreelancer, setSubmittedFreelancer] = useState(null);
    const [loading, setLoading] = useState(false);

    // Connect wallet and initialize contract
    const connectWallet = async () => {
        if (window.ethereum) {
            const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
            const contractABI = abi.abi;

            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(contractAddress, contractABI, signer);

                setState({ provider, signer, contract });
            } catch (error) {
                console.error("Wallet connection failed:", error);
                alert("Error connecting to wallet. Please try again.");
            }
        } else {
            alert("Please install MetaMask to use this feature.");
        }
    };

    useEffect(() => {
        connectWallet();
    }, []);

    // Handle input changes
    const handleChange = (e, index = null) => {
        const { name, value } = e.target;
        if (name === 'certificates' && index !== null) {
            const newCertificates = [...freelancer.certificates];
            newCertificates[index] = value;
            setFreelancer({ ...freelancer, certificates: newCertificates });
        } else {
            setFreelancer({ ...freelancer, [name]: value });
        }
    };

    // Add a new certificate input field
    const addCertificateField = () => {
        setFreelancer({ ...freelancer, certificates: [...freelancer.certificates, ''] });
    };

    // Remove a certificate input field
    const removeCertificateField = (index) => {
        const newCertificates = freelancer.certificates.filter((_, i) => i !== index);
        setFreelancer({ ...freelancer, certificates: newCertificates });
    };

    // Submit the freelancer data to the smart contract
    const submitHandle = async (e) => {
        e.preventDefault();

        const { contract } = state;
        const { name, description, certificates } = freelancer;

        if (!contract || !name || !description || certificates.length === 0) {
            alert("Please fill in all fields and connect your wallet.");
            return;
        }

        try {
            setLoading(true);
            const registerFreelancers = await contract.registerFreelancer(name, description, certificates);
            await registerFreelancers.wait();

            setSubmittedFreelancer(freelancer);
            console.log('Freelancer registered successfully:', registerFreelancers);
            alert("Freelancer registered successfully!");

            // Reset form after successful registration
            setFreelancer({ name: '', description: '', certificates: [''] });
        } catch (error) {
            console.error('Error registering freelancer:', error);
            alert("An error occurred during registration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='freelancer-container'>
            <form onSubmit={submitHandle} className='freelancer-form'>
                <h1>Register as a Freelancer</h1>
                <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={freelancer.name}
                    onChange={handleChange}
                    required
                />
                <br />
                <textarea
                    name="description"
                    placeholder="Write a description about your skills"
                    value={freelancer.description}
                    onChange={handleChange}
                    required
                />
                <br />
                {freelancer.certificates.map((cert, index) => (
                    <div key={index} className='certificate-input'>
                        <input
                            type="url"
                            name="certificates"
                            placeholder={`Certificate ${index + 1}`}
                            value={cert}
                            onChange={(e) => handleChange(e, index)}
                            required
                        />
                        <button
                            type="button"
                            className='remove-button'
                            onClick={() => removeCertificateField(index)}
                            disabled={freelancer.certificates.length === 1}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button type="button" className='add-button' onClick={addCertificateField}>Add Certificate Field</button>
                <br />
                <button type="submit" className='submit-button' disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            {submittedFreelancer && (
                <div className="freelancer-details">
                    <h2>Freelancer Details:</h2>
                    <p><strong>Name:</strong> {submittedFreelancer.name}</p>
                    <p><strong>Description:</strong> {submittedFreelancer.description}</p>
                    <p><strong>Certificates:</strong></p>
                    <ul>
                        {submittedFreelancer.certificates.map((cert, index) => (
                            <li key={index}>
                                <a href={cert} target="_blank" rel="noopener noreferrer">{cert}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Freelancer;
