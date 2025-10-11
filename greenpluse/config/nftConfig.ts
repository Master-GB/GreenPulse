// NFT Configuration for GreenPulse Certificate NFTs
export const NFT_CONFIG = {
  // Network Configuration (Using Polygon Mumbai Testnet for lower fees)
  network: {
    name: 'Polygon Mumbai',
    chainId: 80001,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
  },
  
  // Contract Configuration (Replace with your deployed contract address)
  contract: {
    address: '0x0000000000000000000000000000000000000000', // TODO: Deploy contract and update
    abi: [
      'function mintCertificate(address to, string memory tokenURI) public returns (uint256)',
      'function tokenURI(uint256 tokenId) public view returns (string memory)',
      'function ownerOf(uint256 tokenId) public view returns (address)',
      'event CertificateMinted(address indexed owner, uint256 indexed tokenId, string tokenURI)',
    ],
  },
  
  // NFT Metadata Configuration
  metadata: {
    name: 'GreenPulse Certificate',
    description: 'Official donation certificate NFT from GreenPulse Foundation',
    image: 'ipfs://QmYourImageHash', // TODO: Upload to IPFS
    externalUrl: 'https://greenpulse.org',
  },
  
  // Minting Configuration
  minting: {
    minDonationAmount: 5000, // LKR
    gasLimit: 300000,
    maxRetries: 3,
  },
  
  // IPFS Configuration (for metadata storage)
  ipfs: {
    gateway: 'https://ipfs.io/ipfs/',
    pinataApiKey: '', // TODO: Add your Pinata API key
    pinataSecretKey: '', // TODO: Add your Pinata secret key
  },
};

export const WALLET_STORAGE_KEY = '@greenpulse_wallet';
export const NFT_STORAGE_KEY = '@greenpulse_nfts';
