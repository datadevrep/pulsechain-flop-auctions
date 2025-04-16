// Header.js - Header component with wallet info
import React from 'react';
import './Header.css';

function Header({ isConnected, account, daiBalance, mkrBalance, daiInVat }) {
    // Format account address for display
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    return (
        <header className="header">
            <div className="logo">
                <h1>PulseChain Flop Auctions</h1>
                <p className="subtitle">Participate in MKR debt auctions on PulseChain</p>
            </div>

            {isConnected && (
                <div className="wallet-info">
                    <div className="account-info">
                        <span className="connected-indicator"></span>
                        <span className="account-address">{formatAddress(account)}</span>
                    </div>

                    <div className="balances">
                        <div className="balance-item">
                            <span className="balance-label">pDAI Balance:</span>
                            <span className="balance-value">{parseFloat(daiBalance).toFixed(2)}</span>
                        </div>
                        <div className="balance-item">
                            <span className="balance-label">pMKR Balance:</span>
                            <span className="balance-value">{parseFloat(mkrBalance).toFixed(4)}</span>
                        </div>
                        <div className="balance-item highlight">
                            <span className="balance-label">pDAI in Vat:</span>
                            <span className="balance-value">{parseFloat(daiInVat).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;