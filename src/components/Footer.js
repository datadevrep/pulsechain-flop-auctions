// Footer.js - Footer component with disconnect button and links
import React from 'react';
import './Footer.css';

function Footer({ disconnectWallet, isConnected }) {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-links">
                    <a href="https://pulsemaker.win/" target="_blank" rel="noopener noreferrer">PulseMaker</a>
                    <a href="https://docs.makerdao.com/smart-contract-modules/system-stabilizer-module/flop-detailed-documentation" target="_blank" rel="noopener noreferrer">Flop Auction Docs</a>
                    <a href="https://pulsemakerstats.vercel.app/debt-auctions" target="_blank" rel="noopener noreferrer">PulseMaker Stats</a>
                    <a href="https://pulsechain.com/" target="_blank" rel="noopener noreferrer">PulseChain</a>
                </div>

                {isConnected && (
                    <button className="disconnect-btn" onClick={disconnectWallet}>
                        Disconnect Wallet
                    </button>
                )}

                <div className="footer-disclaimer">
                    <p>
                        This application is unofficial and not affiliated with MakerDAO or PulseChain.
                        Use at your own risk. Always verify contract addresses before interacting.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;