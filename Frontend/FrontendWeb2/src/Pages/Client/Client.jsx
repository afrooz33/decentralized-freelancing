import React, { useEffect, useState } from 'react';
import abi from "../../Contract/Freelancing.json"
import './client.css'
import { ethers } from 'ethers';

function client() {

    const [state, setState] = useState({
        privider: null,
        signer: null,
        contract: null
    });

    const [client, setClient] = useState({
        name: '',
        description: '',
    });

    const [submittedClient, setSubmittedClient] = useState(null);

    async function connectWallet() {
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        const contractABI = abi.abi;

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        setState({provider,signer,contract});
    }

    useEffect(() => {
        connectWallet();
    }, []);

    const handleChange = (e) => {
        setClient({
            ...client, 
            [e.target.name]: e.target.value,
        });
    };

    const submitHandle = async (e) => {
        e.preventDefault();
        if(state.contract && client.name && client.description) {
            try {
                const registerClients = await state.contract.registerClient(client.name, client.description);
                await registerClients.wait();
                alert("Client register successfully");
                setSubmittedClient(client);
            } catch (error) {
                alert(`client register error`);
                console.error("client register error: ", error);
            }
        }
        setClient({
            name: '',
            description: ''
        })
    };

    return (
        <div className='RegisterClient'>
            <form onSubmit={submitHandle} className='registerClient'>
                <h1>Register as a client</h1>
                <input 
                    type="text" 
                    name="name"
                    placeholder='Enter your name'
                    value={client.name}
                    onChange={handleChange}
                    required
                />
                <br />
                <textarea 
                    name="description"
                    id="description"
                    placeholder='Write a description about your skills'
                    value={client.description}
                    onChange={handleChange}
                    required
                />
                <br />
                <button type='submit'>Register</button>
            </form>

            {submittedClient && (
                <div className="clientDetails">
                    <h2>client Details:</h2>
                    <p><strong>Name:</strong> {submittedClient.name}</p>
                    <p><strong>Description:</strong> {submittedClient.description}</p>
                </div>
            )}
        </div>
    );
}

export default client;
