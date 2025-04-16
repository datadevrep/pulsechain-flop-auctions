// AuctionDetail.js - Component to display and interact with a specific auction
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './AuctionDetail.css';

function AuctionDetail({ auction, placeBid, dealAuction, restartAuction, userDaiInVat }) {
  const [bidAmount, setBidAmount] = useState('');
  const [countdown, setCountdown] = useState('');
  const [error, setError] = useState('');
  const [canBid, setCanBid] = useState(false);
  const [canDeal, setCanDeal] = useState(false);
  const [canRestart, setCanRestart] = useState(false);
  
  // Calculate remaining time for auction
  useEffect(() => {
    if (!auction) return;
    
    // If auction has not started yet or has no end time
    if (auction.tic === 0) {
      setCountdown('Auction not started');
      setCanBid(false);
      setCanDeal(false);
      setCanRestart(true);
      return;
    }
    
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = auction.tic - now;
      
      if (timeLeft <= 0) {
        setCountdown('Ended');
        setCanBid(false);
        setCanDeal(true);
        setCanRestart(false);
      } else {
        // Format remaining time
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        setCanBid(true);
        setCanDeal(false);
        setCanRestart(false);
      }
    };
    
    // Update countdown immediately
    updateCountdown();
    
    // Set interval to update countdown every second
    const interval = setInterval(updateCountdown, 1000);
    
    // Clear interval on component unmount or auction change
    return () => clearInterval(interval);
  }, [auction]);
  
  // Handle bid input change
  const handleBidAmountChange = (e) => {
    setBidAmount(e.target.value);
    setError('');
  };
  
  // Calculate minimum bid based on current auction state
  const calculateMinimumBid = () => {
    if (!auction) return 0;
    
    // In a flop auction, bidders compete with decreasing lot amounts
    // So the minimum valid bid is current lot - (current lot * beg)
    // For simplicity, we'll assume beg is 5% (0.05)
    const beg = 0.05;
    const currentLot = parseFloat(auction.lot);
    const minLot = currentLot * (1 - beg);
    
    return minLot.toFixed(4);
  };
  
  // Handle bid submission
  const handleSubmitBid = (e) => {
    e.preventDefault();
    
    // Validate bid amount
    if (!bidAmount || isNaN(bidAmount)) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    const bidValue = parseFloat(bidAmount);
    const minBid = parseFloat(calculateMinimumBid());
    
    if (bidValue >= parseFloat(auction.lot)) {
      setError('Bid must be lower than current lot amount');
      return;
    }
    
    if (bidValue > minBid) {
      setError(`Bid must be at most ${minBid} pMKR (5% decrease from current lot)`);
      return;
    }
    
    // Check if user has enough DAI in Vat
    if (parseFloat(userDaiInVat) < parseFloat(auction.bid)) {
      setError(`You need at least ${auction.bid} pDAI in your Vat balance`);
      return;
    }
    
    // Submit bid
    placeBid(auction.id, bidAmount);
  };
  
  // Handle deal button click
  const handleDeal = () => {
    dealAuction(auction.id);
  };
  
  // Handle restart button click
  const handleRestart = () => {
    restartAuction(auction.id);
  };
  
  if (!auction) {
    return <div className="no-auction-selected">Select an auction to view details</div>;
  }
  
  return (
    <div className="auction-detail">
      <h2>Auction #{auction.id}</h2>
      
      <div className="auction-timer">
        <span className="timer-label">Time Remaining:</span>
        <span className={`timer-value ${countdown === 'Ended' ? 'ended' : ''}`}>
          {countdown}
        </span>
      </div>
      
      <div className="auction-info">
        <div className="info-row">
          <span className="info-label">Fixed pDAI Bid:</span>
          <span className="info-value">{parseFloat(auction.bid).toFixed(2)} pDAI</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Current pMKR Lot:</span>
          <span className="info-value">{parseFloat(auction.lot).toFixed(4)} pMKR</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Current Bidder:</span>
          <span className="info-value address">{auction.guy}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">End Time:</span>
          <span className="info-value">{auction.end}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Status:</span>
          <span className={`info-value status ${auction.status.toLowerCase()}`}>
            {auction.status}
          </span>
        </div>
      </div>
      
      {canBid && (
        <div className="bidding-section">
          <h3>Place Bid</h3>
          
          <div className="bid-instructions">
            <p>
              This is a reverse auction. You bid for how little pMKR you are willing to accept
              for the fixed pDAI amount ({parseFloat(auction.bid).toFixed(2)} pDAI).
            </p>
            <p>
              Minimum decrease: 5% (current minimum: {calculateMinimumBid()} pMKR)
            </p>
          </div>
          
          <form onSubmit={handleSubmitBid} className="bid-form">
            <div className="form-row">
              <label htmlFor="bidAmount">pMKR Amount:</label>
              <input
                type="number"
                id="bidAmount"
                value={bidAmount}
                onChange={handleBidAmountChange}
                placeholder={`Max ${calculateMinimumBid()} pMKR`}
                step="0.0001"
                min="0"
                max={calculateMinimumBid()}
              />
            </div>
            
            {error && <div className="bid-error">{error}</div>}
            
            <button 
              type="submit" 
              className="bid-button"
              disabled={!canBid}
            >
              Place Bid
            </button>
          </form>
        </div>
      )}
      
      <div className="action-buttons">
        {canDeal && (
          <button 
            className="deal-button" 
            onClick={handleDeal}
            disabled={!canDeal}
          >
            Deal (Settle) Auction
          </button>
        )}
        
        {canRestart && (
          <button 
            className="restart-button" 
            onClick={handleRestart}
            disabled={!canRestart}
          >
            Restart Auction
          </button>
        )}
      </div>
      
      <div className="auction-help">
        <h4>Understanding Flop Auctions</h4>
        <p>
          In a flop auction, you're bidding on how little pMKR you're willing to accept
          for a fixed amount of pDAI. The winning bidder pays the fixed pDAI amount
          and receives the pMKR amount they bid.
        </p>
        <p>
          Each new bid must decrease the pMKR amount by at least 5% from the current lot.
          The auction ends when the timer expires, and the lowest bidder wins.
        </p>
      </div>
    </div>
  );
}

export default AuctionDetail;