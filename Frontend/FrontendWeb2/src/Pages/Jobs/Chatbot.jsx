import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { ethers } from "ethers";


const socket = io("http://localhost:3000"); // Backend server URL

function Chatbot() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isChatVisible, setChatVisible] = useState(false);
  const [isMetaMaskAvailable, setMetaMaskAvailable] = useState(true); // To track if MetaMask is available
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [recipientID, setRecipientID] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Function to check MetaMask and connect wallet
    const checkMetaMask = async () => {
      if (window.ethereum) {
        // MetaMask is installed
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          const address = accounts[0];
          setWalletAddress(address);
          socket.emit("setUserID", address); // Use wallet address as username
          setChatVisible(true); // Show chat once wallet is connected
        } catch (error) {
          console.error("User denied account access", error);
        }
      } else {
        // MetaMask is not installed
        setMetaMaskAvailable(false);
      }
    };

    checkMetaMask();

    // Listen for incoming private messages
    socket.on("private message", ({ content, from }) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content, from, type: "received" },
      ]);
      scrollToBottom();
    });

    alert("Please don't refresh page because your chat will clean from refresh the page")

    // Cleanup on component unmount
    return () => {
      socket.off("private message");
    };

  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (recipientID && message) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: message, from: "You", type: "sent" },
      ]);

      // Emit the private message event
      socket.emit("private message", { content: message, to: recipientID });
      setMessage(""); // Clear input field
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="page" style={{paddingTop: "100px"}}>
    <div>
          <p
            style={{color: "red"}}
          >
            Please don't refresh page because your chat clean after refresh the page
          </p>
        </div>
    <div className="app">
      {!isMetaMaskAvailable ? (
        <div className="install-metamask">
          <h2>MetaMask is not installed!</h2>
          <p>Please install MetaMask to use this chat application.</p>
          <a
            href="https://metamask.io/download.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Install MetaMask
          </a>
        </div>
      ) : (
        <>
          {isChatVisible && (
            <div className="chat">
              <h3>Welcome <br /> {walletAddress}</h3>
              <div className="messages" id="messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={msg.type === "sent" ? "sent" : "received"}
                  >
                    <p style={{color:"white"}}>{msg.from}</p>
                    <p style={{color: "white"}}>{msg.content}</p>
                  </div>
                ))}
                <div ref={messageEndRef}></div> {/* Auto scroll to bottom */}
              </div>

              <form className="messageForm" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Enter recipient ID"
                  value={recipientID}
                  onChange={(e) => setRecipientID(e.target.value)}
                />
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message"
                  required
                />
                <button type="submit">Send</button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
    </div>
  );
}


export default Chatbot;
