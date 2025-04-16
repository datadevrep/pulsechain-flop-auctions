// WalletConnect.js - Component for connecting wallet
import React from 'react';
import './WalletConnect.css';

function WalletConnect({ connectWallet, loading, error }) {
    return (
        <div className="wallet-connect-container">
            <div className="wallet-connect-card">
                <h2>Connect Your Wallet</h2>
                <p>
                    Connect your wallet to participate in PulseMaker flop auctions.
                    You'll need pDAI in your Vat balance to place bids.
                </p>

                <button
                    className="connect-wallet-btn"
                    onClick={connectWallet}
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>

                {error && <div className="error-message">{error}</div>}

                <div className="wallet-info-text">
                    <h3>About Flop Auctions</h3>
                    <p>
                        Flop auctions are debt auctions used to recapitalize the PulseMaker system
                        by auctioning off pMKR tokens for a fixed amount of pDAI.
                    </p>
                    <p>
                        In a flop auction, bidders compete by offering to accept decreasing amounts
                        of pMKR for a fixed amount of pDAI they will pay.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default WalletConnect;