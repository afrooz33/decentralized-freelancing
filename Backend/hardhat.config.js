// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-ethers");
// require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    polygon: {
      url: "https://polygon-amoy.infura.io/v3/bae17cf587844ab6ac4489b9f0c13735", // RPC URL for Polygon mainnet
      accounts: [`0x${"c9438be951755b2a267c85e1ed083ba7bc90bb51a8aeee3efe79da008c083a83"}`], // Replace with your private key
      chainId: 80002,
    },
  },
  etherscan: {
    apiKey: "27TFAI6ZX2ASM4GG5PVHP9HIPJMV7MHFW5", // Replace with your Polygonscan API key
  },

  customChains: [
    {
      network: "polygon",
      chainId: 80002,
      urls: {
        apiURL: "https://polygon-amoy.infura.io/v3/bae17cf587844ab6ac4489b9f0c13735",
        browserURL: "https://amoy.polygonscan.com",
      },
    },
  ],

};
