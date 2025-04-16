// FlopAuctionList.js - Component to display list of active flop auctions
import React from 'react';
import './FlopAuctionList.css';

function FlopAuctionList({ auctions, selectAuction, selectedAuctionId }) {
    if (auctions.length === 0) {
        return (
            <div className="no-auctions">
                <p>No active flop auctions found.</p>
                <p>Check back later or monitor the PulseMaker stats dashboard.</p>
            </div>
        );
    }

    return (
        <div className="auction-list">
            <div className="auction-list-header">
                <div className="auction-id">ID</div>
                <div className="auction-bid">Fixed pDAI Bid</div>
                <div className="auction-lot">pMKR Lot</div>
                <div className="auction-status">Status</div>
            </div>

            <div className="auction-items">
                {auctions.map(auction => (
                    <div
                        key={auction.id}
                        className={`auction-item ${selectedAuctionId === auction.id ? 'selected' : ''}`}
                        onClick={() => selectAuction(auction)}
                    >
                        <div className="auction-id">{auction.id}</div>
                        <div className="auction-bid">{parseFloat(auction.bid).toFixed(2)}</div>
                        <div className="auction-lot">{parseFloat(auction.lot).toFixed(4)}</div>
                        <div className={`auction-status ${auction.status.toLowerCase()}`}>
                            {auction.status}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FlopAuctionList;