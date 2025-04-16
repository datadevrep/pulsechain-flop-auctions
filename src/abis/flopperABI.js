// flopperABI.js - ABI for the Flopper contract
export const flopperABI = [
  // Read functions
  "function bids(uint) view returns (uint256 bid, uint256 lot, address guy, uint48 tic, uint48 end)",
  "function kicks() view returns (uint256)",
  "function vat() view returns (address)",
  "function gem() view returns (address)",
  "function beg() view returns (uint256)",
  "function ttl() view returns (uint48)",
  "function tau() view returns (uint48)",
  "function live() view returns (uint256)",
  
  // Write functions
  "function dent(uint id, uint lot, uint bid) returns ()",
  "function deal(uint id) returns ()",
  "function tick(uint id) returns ()",
  
  // Events
  "event Kick(uint256 id, uint256 lot, uint256 bid, address indexed gal)",
  "event Dent(uint256 id, uint256 lot, uint256 bid, address indexed guy)",
  "event Deal(uint256 id)"
];