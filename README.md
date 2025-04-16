# PulseChain Flop Auctions UI

A frontend interface for participating in PulseMaker (MakerDAO fork on PulseChain) flop auctions.

## About Flop Auctions

Flop auctions are debt auctions used to recapitalize the PulseMaker system by auctioning off pMKR tokens for a fixed amount of pDAI. In this process, bidders compete by offering to accept decreasing amounts of pMKR for the pDAI they will pay.

## Features

- Connect MetaMask or other Web3 wallets
- View active flop auctions on PulseChain
- Place bids on auctions
- Deal (settle) completed auctions
- Restart expired auctions that received no bids
- Monitor auction countdown timers
- Track your pDAI and pMKR balances

## Technical Details

This application interacts with the PulseMaker contracts deployed on PulseChain. It uses:

- React for the UI
- ethers.js for blockchain interactions
- Web3 wallet connection

## Getting Started

### Prerequisites

- Node.js and npm
- MetaMask or compatible wallet with PulseChain network added

### Installation

1. Clone this repository
```
git clone https://github.com/yourusername/pulsechain-flop-auctions.git
cd pulsechain-flop-auctions
```

2. Install dependencies
```
npm install
```

3. Update contract addresses in `App.js`
   - Replace placeholder addresses with actual PulseMaker contract addresses on PulseChain

4. Start the development server
```
npm start
```

5. Open http://localhost:3000 in your browser

## Contract Interactions

The application interacts with the following PulseMaker contracts:

- **Flopper**: Manages the debt auctions
- **Vat**: Core accounting engine that tracks system state

## Auction Mechanics

In a flop auction:

1. The auction starts with a fixed amount of pDAI that bidders must pay
2. Bidders compete by offering to accept smaller and smaller amounts of pMKR
3. Each bid must decrease the pMKR amount (lot) by at least 5% from the previous bid
4. The winning bidder pays the fixed pDAI amount and receives the pMKR amount they bid
5. The auction ends when the timer expires or the auction duration is reached

## Disclaimer

This is an unofficial interface for PulseMaker on PulseChain. Use at your own risk. Always verify contract addresses before interacting with them.

## License

MIT