// vatABI.js - ABI for the Vat contract
export const vatABI = [
  // Read functions
  "function dai(address) view returns (uint256)",
  "function gem(bytes32, address) view returns (uint256)",
  "function sin(address) view returns (uint256)",
  "function urns(bytes32, address) view returns (uint256 ink, uint256 art)",
  "function ilks(bytes32) view returns (uint256 Art, uint256 rate, uint256 spot, uint256 line, uint256 dust)",
  
  // Write functions
  "function hope(address) returns ()",
  "function nope(address) returns ()",
  "function move(address src, address dst, uint256 rad) returns ()",
  
  // Events
  "event LogNote(bytes4 indexed sig, address indexed usr, bytes32 indexed arg1, bytes32 indexed arg2, bytes data)"
];