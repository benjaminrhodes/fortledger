require('@nomicfoundation/hardhat-ethers');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.24',
  paths: {
    sources: './contracts',
    tests: './test-contracts',
    cache: './cache',
    artifacts: './artifacts'
  }
};
