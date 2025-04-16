// App.js - Main component for the PulseChain Flop Auctions UI
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import FlopAuctionList from './components/FlopAuctionList';
import AuctionDetail from './components/AuctionDetail';
import WalletConnect from './components/WalletConnect';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import { flopperABI } from './abis/flopperABI';
import { vatABI } from './abis/vatABI';

// PulseChain contract addresses - replace these with actual PulseMaker addresses
const FLOPPER_ADDRESS = "0xA41B6EF151E06da0e34B009B86E828308986736D";
const VAT_ADDRESS = "0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b";
const MKR_ADDRESS = "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2";
const DAI_JOIN_ADDRESS = "0x9759a6ac90977b93b58547b4a71c78317f391a28";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Contract instances
  const [flopperContract, setFlopperContract] = useState(null);
  const [vatContract, setVatContract] = useState(null);
  
  // Auction data
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [userDaiBalance, setUserDaiBalance] = useState('0');
  const [userMkrBalance, setUserMkrBalance] = useState('0');
  const [userDaiInVat, setUserDaiInVat] = useState('0');
  
  // PulseChain network ID - replace with actual PulseChain mainnet ID
  const PULSECHAIN_NETWORK_ID = 369; // Example, use actual PulseChain network ID

  // Connect wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        const { chainId } = await provider.getNetwork();
        
        // Check if connected to PulseChain
        if (chainId !== PULSECHAIN_NETWORK_ID) {
          try {
            // Try to switch to PulseChain network
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: ethers.utils.hexValue(PULSECHAIN_NETWORK_ID) }],
            });
          } catch (switchError) {
            // If network doesn't exist in user's wallet, we need to add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: ethers.utils.hexValue(PULSECHAIN_NETWORK_ID),
                  chainName: 'PulseChain',
                  nativeCurrency: {
                    name: 'PLS',
                    symbol: 'PLS',
                    decimals: 18
                  },
                  rpcUrls: ['https://rpc.pulsechain.com'],
                  blockExplorerUrls: ['https://scan.pulsechain.com']
                }]
              });
            } else {
              throw switchError;
            }
          }
        }
        
        // Initialize contracts
        const flopperContract = new ethers.Contract(FLOPPER_ADDRESS, flopperABI, signer);
        const vatContract = new ethers.Contract(VAT_ADDRESS, vatABI, signer);
        
        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        setChainId(chainId);
        setIsConnected(true);
        setFlopperContract(flopperContract);
        setVatContract(vatContract);
        
        // Set up event listeners for wallet changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
        // Fetch initial data
        await fetchUserBalances(account, vatContract);
        await fetchAuctions(flopperContract);
      } else {
        setError('MetaMask or compatible wallet not found. Please install MetaMask.');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(`Failed to connect wallet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle account changes
  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      resetConnection();
    } else {
      // User switched accounts
      setAccount(accounts[0]);
      await fetchUserBalances(accounts[0], vatContract);
    }
  };
  
  // Handle chain changes
  const handleChainChanged = () => {
    // Reload the page when the chain changes
    window.location.reload();
  };
  
  // Reset connection state
  const resetConnection = () => {
    setProvider(null);
    setSigner(null);
    setAccount('');
    setChainId(null);
    setIsConnected(false);
    setFlopperContract(null);
    setVatContract(null);
    setAuctions([]);
    setSelectedAuction(null);
    setUserDaiBalance('0');
    setUserMkrBalance('0');
    setUserDaiInVat('0');
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
    resetConnection();
  };
  
  // Fetch user balances
  const fetchUserBalances = async (account, vatContract) => {
    try {
      if (!account || !vatContract) return;
      
      // Get DAI balance in VAT
      const daiInVat = await vatContract.dai(account);
      setUserDaiInVat(ethers.utils.formatUnits(daiInVat, 45)); // RAD precision (10^45)
      
      // We would also fetch token balances here, but this is simplified
      // In a real implementation, you would need ERC20 contract instances for DAI and MKR
    } catch (err) {
      console.error('Error fetching balances:', err);
    }
  };
  
  // Fetch active auctions
  const fetchAuctions = async (flopperContract) => {
    try {
      if (!flopperContract) return;

      setLoading(true);
      console.log("Starting to fetch auctions...");

      // Get total number of auctions kicked
      const kicks = await flopperContract.kicks();
      const totalAuctions = kicks.toNumber();
      console.log(`Total auctions kicked: ${totalAuctions}`);

      const activeAuctions = [];

      // Loop through auction IDs to find active ones
      for (let i = 1; i <= totalAuctions; i++) {
        console.log(`Checking auction ID ${i}...`);

        try {
          const auctionData = await flopperContract.bids(i);
          console.log(`Auction ID ${i} data:`, auctionData);

          // Check if auction is still active
          if (auctionData.bid.gt(0) && auctionData.guy !== ethers.constants.AddressZero) {
            // Handle tic as either BigNumber or uint48
            let tic;
            if (typeof auctionData.tic.toNumber === 'function') {
              tic = auctionData.tic.toNumber();
            } else if (typeof auctionData.tic === 'number') {
              tic = auctionData.tic;
            } else {
              // If it's a string or other format, convert it
              tic = Number(auctionData.tic.toString());
            }

            const now = Math.floor(Date.now() / 1000);

            // Get end timestamp with similar type checking
            let end;
            if (typeof auctionData.end.toNumber === 'function') {
              end = auctionData.end.toNumber();
            } else if (typeof auctionData.end === 'number') {
              end = auctionData.end;
            } else {
              end = Number(auctionData.end.toString());
            }

            // Only include active auctions
            if (tic === 0 || tic > now || end > now) {
              const auctionInfo = {
                id: i,
                bid: ethers.utils.formatUnits(auctionData.bid, 18), // RAD precision converted to readable format
                lot: ethers.utils.formatUnits(auctionData.lot, 18), // WAD precision
                guy: auctionData.guy,
                tic: tic,
                end: end,
                endFormatted: end > 0 ? new Date(end * 1000).toLocaleString() : 'Unknown',
                status: tic === 0 ? 'Not started' : (tic > now ? 'Active' : (end > now ? 'Bidding ended, auction active' : 'Ended'))
              };

              console.log(`ACTIVE DEBT AUCTION FOUND: Auction #${i}`, auctionInfo);
              activeAuctions.push(auctionInfo);
            } else {
              console.log(`Auction #${i} is inactive: tic=${tic}, now=${now}, end=${end}`);
            }
          } else {
            console.log(`Auction #${i} is inactive: No bid or no bidder`);
          }
        } catch (auctionError) {
          console.error(`Error fetching auction #${i}:`, auctionError);
        }
      }

      console.log(`Total active auctions found: ${activeAuctions.length}`);
      console.log("Active auctions:", activeAuctions);

      setAuctions(activeAuctions);
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(`Failed to fetch auctions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Select an auction to view details
  const selectAuction = (auction) => {
    setSelectedAuction(auction);
  };
  
  // Place a bid in the auction
  const placeBid = async (auctionId, lotAmount) => {
    try {
      if (!flopperContract || !signer) {
        setError('Wallet not connected or contracts not initialized');
        return;
      }
      
      setLoading(true);
      
      // Get current auction state
      const auctionData = await flopperContract.bids(auctionId);
      
      // Ensure we have enough DAI in VAT to place bid
      const bidAmount = auctionData.bid;
      const daiInVat = await vatContract.dai(account);
      
      if (daiInVat.lt(bidAmount)) {
        setError(`Not enough DAI in VAT. Need ${ethers.utils.formatUnits(bidAmount, 45)} DAI, have ${ethers.utils.formatUnits(daiInVat, 45)} DAI.`);
        return;
      }
      
      // Convert lot amount to proper format (WAD precision)
      const lotAmountWad = ethers.utils.parseUnits(lotAmount.toString(), 18);
      
      // Call dent function to place bid with fixed DAI amount and reduced lot size
      // dent(uint id, uint lot, uint bid)
      const tx = await flopperContract.dent(auctionId, lotAmountWad, bidAmount);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Transaction successful
        // Refresh auction data
        await fetchAuctions(flopperContract);
        await fetchUserBalances(account, vatContract);
        
        // Update selected auction
        const updatedAuction = auctions.find(a => a.id === auctionId);
        setSelectedAuction(updatedAuction);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      console.error('Error placing bid:', err);
      setError(`Failed to place bid: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Deal (settle) an auction
  const dealAuction = async (auctionId) => {
    try {
      if (!flopperContract || !signer) {
        setError('Wallet not connected or contracts not initialized');
        return;
      }
      
      setLoading(true);
      
      // Call deal function to settle auction
      const tx = await flopperContract.deal(auctionId);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Transaction successful
        // Refresh auction data
        await fetchAuctions(flopperContract);
        await fetchUserBalances(account, vatContract);
        
        // Clear selected auction if it was the one dealt
        if (selectedAuction && selectedAuction.id === auctionId) {
          setSelectedAuction(null);
        }
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      console.error('Error dealing auction:', err);
      setError(`Failed to deal auction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Restart an auction that received no bids
  const restartAuction = async (auctionId) => {
    try {
      if (!flopperContract || !signer) {
        setError('Wallet not connected or contracts not initialized');
        return;
      }
      
      setLoading(true);
      
      // Call tick function to restart auction
      const tx = await flopperContract.tick(auctionId);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        // Transaction successful
        // Refresh auction data
        await fetchAuctions(flopperContract);
        
        // Update selected auction
        const updatedAuction = auctions.find(a => a.id === auctionId);
        setSelectedAuction(updatedAuction);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      console.error('Error restarting auction:', err);
      setError(`Failed to restart auction: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh data periodically
  useEffect(() => {
    if (isConnected && flopperContract && vatContract) {
      // Initial fetch
      fetchAuctions(flopperContract);
      fetchUserBalances(account, vatContract);
      
      // Set up interval for periodic updates
      const interval = setInterval(() => {
        fetchAuctions(flopperContract);
        fetchUserBalances(account, vatContract);
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isConnected, flopperContract, vatContract, account]);
  
  return (
    <div className="app">
      <Header 
        isConnected={isConnected}
        account={account}
        daiBalance={userDaiBalance}
        mkrBalance={userMkrBalance}
        daiInVat={userDaiInVat}
      />
      
      {!isConnected ? (
        <WalletConnect 
          connectWallet={connectWallet}
          loading={loading}
          error={error}
        />
      ) : (
        <div className="main-content">
          {loading && <LoadingSpinner />}
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="auction-container">
            <div className="auction-list-container">
              <h2>Active Flop Auctions</h2>
              <FlopAuctionList 
                auctions={auctions}
                selectAuction={selectAuction}
                selectedAuctionId={selectedAuction ? selectedAuction.id : null}
              />
            </div>
            
            <div className="auction-detail-container">
              {selectedAuction ? (
                <AuctionDetail 
                  auction={selectedAuction}
                  placeBid={placeBid}
                  dealAuction={dealAuction}
                  restartAuction={restartAuction}
                  userDaiInVat={userDaiInVat}
                />
              ) : (
                <div className="no-auction-selected">
                  <p>Select an auction to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Footer disconnectWallet={disconnectWallet} isConnected={isConnected} />
    </div>
  );
}

export default App;
