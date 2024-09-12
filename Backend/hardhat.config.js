// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-ethers");
// require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();


module.exports = {
  solidity: "0.8.24",
  networks: {
    polygon: {
      url: `https://polygon-amoy.infura.io/${process.env.POLYGON_URL}`, // RPC URL for Polygon mainnet
      accounts: [`0x${process.env.POLYGON_ACCOUNT_PRIVATE_KEY}`], // Replace with your private key
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`, // Replace with your Polygonscan API key
  },

  customChains: [
    {
      network: "polygon",
      chainId: 80002,
      urls: {
        apiURL: `https://polygon-amoy.infura.io/${process.env.POLYGON_URL}`,
        browserURL: "https://amoy.polygonscan.com",
      },
    },
  ],

};





/*
  //this contract on deploy on also ethereum blockchain

  require("@nomicfoundation/hardhat-verify");
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`]
    },
    // You can add other networks like mainnet or rinkeby here
  },

  etherscan: {
    apiKey: `${process.env.ETHERSCAN_APIKEY}`
  }
};

*/
