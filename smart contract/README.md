# Blockchain Simulation with Hardhat

This project demonstrates how to simulate and interact with a blockchain using Hardhat. It covers running a local node, creating accounts, sending transactions, deploying a contract, and ideas for autonomous behaviors.

## 1. Réseau local ou testnet
- **Local Hardhat Network**: start a local blockchain with:
  ```bash
  npx hardhat node
  ```
- **Testnet (ex. Sepolia)**: configure the `networks` section in `hardhat.config.js` with a private key and an RPC URL.

## 2. Création de comptes
- On the local network, Hardhat automatically exposes several accounts (signers).
- On public networks or testnets, create accounts from a private key or mnemonic and fund them via a faucet.

## 3. Transactions
- Every interaction is a transaction: transferring ETH or invoking contract functions.
- Transactions must be signed by the sender's private key and are included in blocks by miners/validators.

## 4. Déploiement et interaction avec un contrat
1. Write the contract in Solidity.
2. Deploy and interact via scripts using Ethers.js and the local Hardhat node.
   The provided script compile le contrat à la volée avec `solc` puis le déploie :
   ```bash
   node scripts/blockchainSimulation.js
   ```

   This script also launches an in-memory IPFS node, uploads a sample diploma, and stores the resulting CID on-chain.

## 5. Contrats autonomes
- Contracts execute only when a transaction triggers them.
- To automate behavior, use external scripts or services (cron, keeper, oracles) that send transactions periodically.
- In tests, time and events can be simulated with Hardhat helpers such as `evm_increaseTime` and `evm_mine`.

## Commands to test
1. Install dependencies (if not already):
   ```bash
   npm install
   ```
2. Start a local node:
   ```bash
   npx hardhat node
   ```
3. In another terminal, run the demo script against the node:
   ```bash
   node scripts/blockchainSimulation.js
   ```

Or run all the above steps automatically with:
  ```bash
  bash scripts/runDemo.sh
  ```

The script will show account balances, send an ETH transfer, compile and deploy `DiplomaContract`, then upload a diploma to IPFS, store its CID on-chain and retrieve the diploma content from IPFS.
