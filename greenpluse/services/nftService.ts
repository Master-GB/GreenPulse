import AsyncStorage from '@react-native-async-storage/async-storage';
import { NFT_CONFIG, WALLET_STORAGE_KEY, NFT_STORAGE_KEY } from '@/config/nftConfig';
import { db } from '@/config/firebaseConfig';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

export interface MintedNFT {
  tokenId: string;
  transactionHash: string;
  contractAddress: string;
  ownerAddress: string;
  tokenURI: string;
  mintedAt: string;
  certificateId: string;
  network: string;
}

export interface WalletInfo {
  address: string;
  createdAt: string;
}

/**
 * NFT Service for GreenPulse Certificate NFTs
 * Handles wallet creation, NFT minting, and blockchain interactions
 */
class NFTService {
  /**
   * Check if user has a wallet
   */
  async hasWallet(): Promise<boolean> {
    try {
      const wallet = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      return wallet !== null;
    } catch (error) {
      console.error('Error checking wallet:', error);
      return false;
    }
  }

  /**
   * Get or create a wallet for the user
   */
  async getOrCreateWallet(): Promise<WalletInfo> {
    try {
      // Check if wallet exists
      const existingWallet = await AsyncStorage.getItem(WALLET_STORAGE_KEY);
      if (existingWallet) {
        return JSON.parse(existingWallet);
      }

      // Create new wallet (simplified - in production use proper key generation)
      const walletInfo: WalletInfo = {
        address: this.generateWalletAddress(),
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(walletInfo));
      return walletInfo;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw new Error('Failed to create wallet');
    }
  }

  /**
   * Generate a mock wallet address (for demo purposes)
   * In production, use proper Web3 wallet generation with ethers.js
   */
  private generateWalletAddress(): string {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  /**
   * Create NFT metadata for a certificate
   */
  createNFTMetadata(certificate: {
    donorName: string;
    projectTitle: string;
    amount: number;
    date: string;
    certificateNumber: string;
  }): NFTMetadata {
    return {
      name: `GreenPulse Certificate #${certificate.certificateNumber}`,
      description: `Official donation certificate for ${certificate.donorName}'s contribution of LKR ${certificate.amount.toLocaleString()} to ${certificate.projectTitle}`,
      image: NFT_CONFIG.metadata.image,
      attributes: [
        {
          trait_type: 'Donor',
          value: certificate.donorName,
        },
        {
          trait_type: 'Project',
          value: certificate.projectTitle,
        },
        {
          trait_type: 'Donation Amount (LKR)',
          value: certificate.amount,
        },
        {
          trait_type: 'Certificate Number',
          value: certificate.certificateNumber,
        },
        {
          trait_type: 'Date',
          value: certificate.date,
        },
        {
          trait_type: 'Category',
          value: 'Renewable Energy',
        },
      ],
      external_url: NFT_CONFIG.metadata.externalUrl,
    };
  }

  /**
   * Upload metadata to IPFS (mock implementation)
   * In production, integrate with Pinata or another IPFS service
   */
  async uploadToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      // Mock IPFS upload - returns a fake IPFS hash
      // In production, use Pinata API or similar service
      const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return `ipfs://${mockHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  /**
   * Mint NFT certificate
   */
  async mintCertificateNFT(
    certificateId: string,
    certificate: {
      donorName: string;
      projectTitle: string;
      amount: number;
      date: string;
      certificateNumber: string;
    }
  ): Promise<MintedNFT> {
    try {
      // Validate donation amount
      if (certificate.amount < NFT_CONFIG.minting.minDonationAmount) {
        throw new Error(`Minimum donation of LKR ${NFT_CONFIG.minting.minDonationAmount} required for NFT minting`);
      }

      // Get or create wallet
      const wallet = await this.getOrCreateWallet();

      // Create metadata
      const metadata = this.createNFTMetadata(certificate);

      // Upload metadata to IPFS
      const tokenURI = await this.uploadToIPFS(metadata);

      // Simulate blockchain transaction (mock implementation)
      // In production, use ethers.js to interact with smart contract
      const transactionHash = this.generateTransactionHash();
      const tokenId = Math.floor(Math.random() * 1000000).toString();

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mintedNFT: MintedNFT = {
        tokenId,
        transactionHash,
        contractAddress: NFT_CONFIG.contract.address,
        ownerAddress: wallet.address,
        tokenURI,
        mintedAt: new Date().toISOString(),
        certificateId,
        network: NFT_CONFIG.network.name,
      };

      // Store NFT info locally
      await this.saveNFTLocally(mintedNFT);

      // Update Firestore with NFT info
      await this.updateCertificateWithNFT(certificateId, mintedNFT);

      return mintedNFT;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  /**
   * Generate a mock transaction hash
   */
  private generateTransactionHash(): string {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  /**
   * Save NFT info locally
   */
  private async saveNFTLocally(nft: MintedNFT): Promise<void> {
    try {
      const existingNFTs = await AsyncStorage.getItem(NFT_STORAGE_KEY);
      const nfts: MintedNFT[] = existingNFTs ? JSON.parse(existingNFTs) : [];
      nfts.push(nft);
      await AsyncStorage.setItem(NFT_STORAGE_KEY, JSON.stringify(nfts));
    } catch (error) {
      console.error('Error saving NFT locally:', error);
    }
  }

  /**
   * Update certificate in Firestore with NFT info
   */
  private async updateCertificateWithNFT(certificateId: string, nft: MintedNFT): Promise<void> {
    try {
      const donationRef = doc(db, 'donations', certificateId);
      await updateDoc(donationRef, {
        nftMinted: true,
        nftTokenId: nft.tokenId,
        nftTransactionHash: nft.transactionHash,
        nftContractAddress: nft.contractAddress,
        nftOwnerAddress: nft.ownerAddress,
        nftTokenURI: nft.tokenURI,
        nftMintedAt: serverTimestamp(),
        nftNetwork: nft.network,
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
      throw new Error('Failed to update certificate with NFT info');
    }
  }

  /**
   * Get all user's NFTs
   */
  async getUserNFTs(): Promise<MintedNFT[]> {
    try {
      const nfts = await AsyncStorage.getItem(NFT_STORAGE_KEY);
      return nfts ? JSON.parse(nfts) : [];
    } catch (error) {
      console.error('Error getting user NFTs:', error);
      return [];
    }
  }

  /**
   * Check if certificate has been minted as NFT
   */
  async isCertificateMinted(certificateId: string): Promise<boolean> {
    try {
      const nfts = await this.getUserNFTs();
      return nfts.some(nft => nft.certificateId === certificateId);
    } catch (error) {
      console.error('Error checking if certificate is minted:', error);
      return false;
    }
  }

  /**
   * Get NFT for a specific certificate
   */
  async getNFTByCertificateId(certificateId: string): Promise<MintedNFT | null> {
    try {
      const nfts = await this.getUserNFTs();
      return nfts.find(nft => nft.certificateId === certificateId) || null;
    } catch (error) {
      console.error('Error getting NFT by certificate ID:', error);
      return null;
    }
  }

  /**
   * Get blockchain explorer URL for transaction
   */
  getExplorerUrl(transactionHash: string): string {
    return `${NFT_CONFIG.network.blockExplorer}/tx/${transactionHash}`;
  }

  /**
   * Get blockchain explorer URL for NFT
   */
  getNFTExplorerUrl(contractAddress: string, tokenId: string): string {
    return `${NFT_CONFIG.network.blockExplorer}/token/${contractAddress}?a=${tokenId}`;
  }
}

export const nftService = new NFTService();
