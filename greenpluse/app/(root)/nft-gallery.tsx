import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Award, ExternalLink, Wallet } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { nftService, MintedNFT } from '@/services/nftService';
import { NFT_CONFIG } from '@/config/nftConfig';

const NFTGallery = () => {
  const router = useRouter();
  const [nfts, setNfts] = useState<MintedNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    try {
      const userNFTs = await nftService.getUserNFTs();
      setNfts(userNFTs);

      // Get wallet address
      const hasWallet = await nftService.hasWallet();
      if (hasWallet) {
        const wallet = await nftService.getOrCreateWallet();
        setWalletAddress(wallet.address);
      }
    } catch (error) {
      console.error('Error loading NFTs:', error);
      Alert.alert('Error', 'Failed to load NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleViewNFT = (nft: MintedNFT) => {
    Alert.alert(
      `NFT #${nft.tokenId}`,
      `Token ID: ${nft.tokenId}\nNetwork: ${nft.network}\nOwner: ${nft.ownerAddress.substring(0, 16)}...\nMinted: ${new Date(nft.mintedAt).toLocaleDateString()}\n\nCertificate ID: ${nft.certificateId}`,
      [
        { text: 'Close' },
        {
          text: 'View Certificate',
          onPress: () => router.push(`/Certificate?id=${nft.certificateId}`)
        }
      ]
    );
  };

  const handleViewOnBlockchain = (nft: MintedNFT) => {
    const explorerUrl = `https://mumbai.polygonscan.com/token/${nft.contractAddress}?a=${nft.tokenId}`;
    
    Alert.alert(
      '🔗 View on PolygonScan',
      `Token ID: #${nft.tokenId}\nNetwork: ${nft.network}\n\nYou can view this NFT on PolygonScan blockchain explorer.\n\nURL: mumbai.polygonscan.com\n\nNote: For demo NFTs, you'll need to deploy the contract first to see it on the actual blockchain.`,
      [
        { text: 'Cancel' },
        {
          text: 'Copy Token ID',
          onPress: () => {
            Alert.alert('Token ID Copied', `Token ID #${nft.tokenId} copied! Visit mumbai.polygonscan.com to search for it.`);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
        <StatusBar barStyle="light-content" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading NFTs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Wallet Info */}
        {walletAddress && (
          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-5 border border-gray-700">
            <View className="flex-row items-center mb-2">
              <Wallet size={18} color="#1AE57D" />
              <Text className="text-white text-sm font-semibold ml-2">Your Wallet</Text>
            </View>
            <Text className="text-gray-400 text-xs font-mono">
              {walletAddress.substring(0, 20)}...{walletAddress.substring(walletAddress.length - 10)}
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              Network: {NFT_CONFIG.network.name}
            </Text>
          </View>
        )}

        {/* NFT Stats */}
        <View className="bg-[#1AE57D20] rounded-2xl p-4 mb-5 border border-[#1AE57D]">
          <Text className="text-[#1AE57D] text-2xl font-bold text-center">
            {nfts.length}
          </Text>
          <Text className="text-gray-300 text-sm text-center mt-1">
            Total NFT Certificates
          </Text>
        </View>

        {/* NFT List */}
        {nfts.length === 0 ? (
          <View className="bg-[#2a3e3e] rounded-2xl p-8 items-center border border-gray-700">
            <Award size={48} color="#6b7280" />
            <Text className="text-gray-400 text-base font-semibold mt-4 text-center">
              No NFTs Yet
            </Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Donate LKR 5,000 or more to mint your first NFT certificate
            </Text>
          </View>
        ) : (
          <View className="mb-6">
            {nfts.map((nft, index) => (
              <TouchableOpacity
                key={index}
                className="bg-[#2a3e3e] rounded-2xl p-4 mb-4 border border-gray-700"
                onPress={() => handleViewNFT(nft)}
                activeOpacity={0.7}
              >
                {/* NFT Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-[#1AE57D20] rounded-full p-2 mr-3">
                      <Award size={24} color="#1AE57D" />
                    </View>
                    <View>
                      <Text className="text-white text-base font-bold">
                        NFT #{nft.tokenId}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {new Date(nft.mintedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="bg-[#1AE57D] px-3 py-1 rounded-full">
                    <Text className="text-black text-xs font-bold">Minted</Text>
                  </View>
                </View>

                {/* NFT Details */}
                <View className="bg-[#122119] rounded-xl p-3 mb-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400 text-xs">Token ID:</Text>
                    <Text className="text-white text-xs font-mono">#{nft.tokenId}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400 text-xs">Network:</Text>
                    <Text className="text-white text-xs">{nft.network}</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400 text-xs">Contract:</Text>
                    <Text className="text-white text-xs font-mono">
                      {nft.contractAddress.substring(0, 10)}...
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400 text-xs">Owner:</Text>
                    <Text className="text-white text-xs font-mono">
                      {nft.ownerAddress.substring(0, 10)}...
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className="flex-1 bg-[#1AE57D] py-2 rounded-lg flex-row items-center justify-center"
                    onPress={() => router.push(`/Certificate?id=${nft.certificateId}`)}
                    activeOpacity={0.8}
                  >
                    <Award size={16} color="black" />
                    <Text className="text-black text-xs font-bold ml-1">
                      View Certificate
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-1 bg-[#122119] py-2 rounded-lg flex-row items-center justify-center border border-[#1AE57D]"
                    onPress={() => handleViewOnBlockchain(nft)}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={16} color="#1AE57D" />
                    <Text className="text-[#1AE57D] text-xs font-bold ml-1">
                      Blockchain
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info Section */}
        <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-4 border mt-4 border-gray-700">
          <Text className="text-white text-sm font-semibold mb-2">
            About Your NFTs
          </Text>
          <Text className="text-gray-400 text-xs leading-5">
            Each NFT represents a verified donation certificate on the blockchain. Your NFTs are stored securely and can be viewed anytime. They serve as permanent proof of your contribution to renewable energy projects.
          </Text>
        </View>

        {/* How to View on Polygon */}
        <View className="bg-[#1AE57D20] rounded-2xl p-4 mb-6 border border-[#1AE57D]">
          <Text className="text-[#1AE57D] text-sm font-semibold mb-2">
            🌐 View on Polygon Blockchain
          </Text>
          <Text className="text-gray-300 text-xs leading-5 mb-2">
            To view your NFT on the official Polygon blockchain explorer:
          </Text>
          <View className="bg-[#122119] rounded-lg p-3">
            <Text className="text-white text-xs font-semibold mb-1">
              Step 1: Copy Your Token ID
            </Text>
            <Text className="text-gray-400 text-xs mb-2">
              Tap "Blockchain" button on any NFT above
            </Text>
            
            <Text className="text-white text-xs font-semibold mb-1">
              Step 2: Visit PolygonScan
            </Text>
            <Text className="text-gray-400 text-xs mb-2">
              Go to: mumbai.polygonscan.com
            </Text>
            
            <Text className="text-white text-xs font-semibold mb-1">
              Step 3: Search
            </Text>
            <Text className="text-gray-400 text-xs">
              Paste your Token ID or wallet address in the search bar
            </Text>
          </View>
          <Text className="text-gray-400 text-xs mt-2 italic">
            Note: Demo NFTs require contract deployment to appear on the live blockchain.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NFTGallery;
