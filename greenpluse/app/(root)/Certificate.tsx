import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Share, Alert, Image, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Download, Share2, Award, ExternalLink, Wallet, Image as ImageIcon } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { icons } from '@/constants/icons';
import { nftService, MintedNFT } from '@/services/nftService';
import { NFT_CONFIG } from '@/config/nftConfig';
import { NFTCertificateImage } from '@/components/NFTCertificateImage';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

interface CertificateData {
  id: string;
  donorName: string;
  projectTitle: string;
  amount: number;
  date: string;
  certificateNumber: string;
  transactionHash?: string;
  nftMinted?: boolean;
  nftTokenId?: string;
  nftTransactionHash?: string;
  nftOwnerAddress?: string;
}

const Certificate = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<MintedNFT | null>(null);
  const [hasWallet, setHasWallet] = useState(false);
  const [showNFTImage, setShowNFTImage] = useState(false);
  const certificateRef = useRef<any>(null);

  useEffect(() => {
    fetchCertificate();
    checkWalletAndNFT();
  }, [id]);

  const checkWalletAndNFT = async () => {
    try {
      const walletExists = await nftService.hasWallet();
      setHasWallet(walletExists);
      
      if (id) {
        const nft = await nftService.getNFTByCertificateId(id as string);
        setMintedNFT(nft);
      }
    } catch (error) {
      console.error('Error checking wallet and NFT:', error);
    }
  };

  const fetchCertificate = async () => {
    try {
      const donationRef = doc(db, 'ProjectDonation', id as string);
      const donationDoc = await getDoc(donationRef);
      
      if (donationDoc.exists()) {
        const data = donationDoc.data();
        setCertificate({
          id: donationDoc.id,
          donorName: data.userEmail?.split('@')[0] || 'Anonymous Donor',
          projectTitle: data.projectTitle || 'Green Energy Project',
          amount: data.amount || 0,
          date: data.donatedAt?.toDate?.()?.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || 'Recent',
          certificateNumber: `GPC-${donationDoc.id.substring(0, 8).toUpperCase()}`,
          transactionHash: data.transactionHash || undefined,
          nftMinted: data.nftMinted || false,
          nftTokenId: data.nftTokenId,
          nftTransactionHash: data.nftTransactionHash,
          nftOwnerAddress: data.nftOwnerAddress
        });
      }
    } catch (error) {
      console.error('Error fetching certificate:', error);
      Alert.alert('Error', 'Failed to load certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌱 GreenPulse Donation Certificate\n\nCertificate #${certificate?.certificateNumber}\n\nI donated LKR ${certificate?.amount?.toLocaleString()} to ${certificate?.projectTitle}\n\nJoin me in supporting renewable energy! 🌍`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleMintNFT = async () => {
    if (!certificate) return;

    // Check if already minted
    if (certificate.nftMinted || mintedNFT) {
      Alert.alert(
        'Already Minted',
        'This certificate has already been minted as an NFT.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check minimum amount
    if (certificate.amount < NFT_CONFIG.minting.minDonationAmount) {
      Alert.alert(
        'Minimum Amount Required',
        `NFT certificates are only available for donations of LKR ${NFT_CONFIG.minting.minDonationAmount.toLocaleString()} or more. Your contribution is still valuable and appreciated!`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Confirm minting
    Alert.alert(
      'Mint Certificate as NFT',
      `You are about to mint this certificate as an NFT on ${NFT_CONFIG.network.name}.\n\nThis will create a permanent, verifiable record of your donation on the blockchain.\n\nProceed with minting?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mint NFT', 
          onPress: async () => {
            await performMinting();
          }
        }
      ]
    );
  };

  const performMinting = async () => {
    if (!certificate) return;

    setMinting(true);
    try {
      // Create wallet if needed
      if (!hasWallet) {
        Alert.alert('Creating Wallet', 'Setting up your blockchain wallet...');
        await nftService.getOrCreateWallet();
        setHasWallet(true);
      }

      // Mint NFT
      const nft = await nftService.mintCertificateNFT(certificate.id, {
        donorName: certificate.donorName,
        projectTitle: certificate.projectTitle,
        amount: certificate.amount,
        date: certificate.date,
        certificateNumber: certificate.certificateNumber,
      });

      setMintedNFT(nft);
      
      // Update local certificate state
      setCertificate({
        ...certificate,
        nftMinted: true,
        nftTokenId: nft.tokenId,
        nftTransactionHash: nft.transactionHash,
        nftOwnerAddress: nft.ownerAddress,
      });

      Alert.alert(
        '🎉 NFT Minted Successfully!',
        `Your certificate has been minted as NFT #${nft.tokenId}\n\nTransaction Hash: ${nft.transactionHash.substring(0, 16)}...\n\nYou can view it on the blockchain explorer.`,
        [
          { text: 'OK' },
          { 
            text: 'View on Explorer', 
            onPress: () => {
              const url = nftService.getExplorerUrl(nft.transactionHash);
              Linking.openURL(url);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error minting NFT:', error);
      Alert.alert(
        'Minting Failed',
        error.message || 'Failed to mint NFT. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setMinting(false);
    }
  };

  const handleViewNFTImage = async () => {
    try {
      if (!certificateRef.current || !certificateRef.current.capture) {
        Alert.alert('Error', 'Certificate image not ready. Please try again.');
        return;
      }

      // Capture the certificate as image
      const uri = await certificateRef.current.capture();
      
      // Show preview
      Alert.alert(
        '🎨 NFT Certificate Preview',
        'Your certificate has been generated! You can now download or share it.',
        [
          { text: 'Close' },
          {
            text: 'Download',
            onPress: () => handleDownloadNFT()
          }
        ]
      );
      
      // Open the image in default viewer (optional)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'NFT Certificate'
        });
      }
    } catch (error) {
      console.error('Error viewing NFT:', error);
      Alert.alert('Error', 'Failed to generate certificate preview.');
    }
  };

  const handleDownloadNFT = async () => {
    try {
      if (!certificateRef.current || !certificateRef.current.capture) {
        Alert.alert('Error', 'Certificate image not ready. Please try again.');
        return;
      }

      // Capture the certificate as image
      const uri = await certificateRef.current.capture();
      
      // Share/Save the image
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save NFT Certificate',
          UTI: 'public.png'
        });
        
        Alert.alert(
          '✅ Success!',
          'Your NFT certificate image is ready! You can save it to your gallery from the share menu.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error downloading NFT:', error);
      Alert.alert('Error', 'Failed to generate certificate image.');
    }
  };

  const handleViewOnBlockchain = () => {
    if (mintedNFT) {
      Alert.alert(
        '🔗 Blockchain NFT',
        `Your NFT has been minted!\n\nToken ID: #${mintedNFT.tokenId}\nNetwork: ${NFT_CONFIG.network.name}\n\nNote: This is currently a demo implementation. To view on a real blockchain explorer, you need to:\n\n1. Deploy the smart contract\n2. Configure the contract address\n3. Mint on a live network\n\nSee NFT_SETUP.md for details.`,
        [
          { text: 'OK' },
          {
            text: 'Learn More',
            onPress: () => {
              Alert.alert(
                'NFT Setup Required',
                'Check the NFT_SETUP.md file in your project for complete setup instructions including smart contract deployment and IPFS configuration.'
              );
            }
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading certificate...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!certificate) {
    return (
      <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Certificate not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }} 
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-[#2a3e3e] rounded-3xl p-6 border-2 border-[#1AE57D]">
          <View className="items-center mb-4">
            <View className="bg-[#1AE57D20] rounded-full p-3 mb-3">
              <Award size={40} color="#1AE57D" />
            </View>
            <Text className="text-[#1AE57D] text-xl font-bold tracking-wider">
              CERTIFICATE
            </Text>
            <View className="w-full">
              <Text className="text-white text-xs mt-1 text-center">
                of Contribution
              </Text>
            </View>
          </View>

          <View className="h-0.5 bg-[#1AE57D] mb-5 opacity-50" />

          <View className="items-center mb-4 w-full">
            <Text className="text-gray-400 text-[11px] mb-2 text-center w-full">
              This certifies that
            </Text>
            <Text className="text-white text-xl font-bold mb-4 text-center w-full px-4">
              {certificate.donorName}
            </Text>
            
            <Text className="text-gray-400 text-[11px] mb-2 text-center w-full">
              has generously contributed
            </Text>
            <Text className="text-[#1AE57D] text-2xl font-bold mb-4">
              LKR {certificate.amount.toLocaleString()}
            </Text>
            
            <Text className="text-gray-400 text-[11px] mb-2 text-center w-full">
              to support
            </Text>
            <Text className="text-white text-lg font-semibold text-center mb-4 leading-6 w-full px-4">
              {certificate.projectTitle}
            </Text>
            
            <Text className="text-gray-400 text-[11px] mb-2 text-center w-full">
              on
            </Text>
            <Text className="text-white text-sm font-medium text-center">{certificate.date}</Text>
          </View>

          <View className="h-0.5 bg-[#1AE57D] mb-4 opacity-50" />

          <View className="items-center mb-3">
            <Text className="text-gray-400 text-xs mb-1.5 text-center">Certificate Number</Text>
            <Text className="text-white text-xs font-mono tracking-wide text-center">
              {certificate.certificateNumber}
            </Text>
          </View>

          <View className="items-center mt-3">
            <View className="border-t border-gray-600 w-40 mb-1.5" />
            <Text className="text-white text-xs font-semibold text-center">GreenPulse Foundation</Text>
            <Text className="text-gray-400 text-xs mt-0.5 text-center">Authorized Signature</Text>
          </View>

          {certificate.transactionHash && (
            <View className="bg-[#1AE57D20] rounded-xl p-3 mt-3">
              <Text className="text-[#1AE57D] text-xs text-center font-semibold">
                🔗 Verified on Blockchain
              </Text>
              <Text className="text-gray-400 text-xs text-center mt-1">
                Hash: {certificate.transactionHash.substring(0, 16)}...
              </Text>
            </View>
          )}
        </View>

        {/* NFT Certificate Image (Hidden, used for capture) */}
        <View style={{ position: 'absolute', left: -10000 }}>
          {certificate && (
            <NFTCertificateImage
              ref={certificateRef}
              donorName={certificate.donorName}
              projectTitle={certificate.projectTitle}
              amount={certificate.amount}
              date={certificate.date}
              certificateNumber={certificate.certificateNumber}
              tokenId={mintedNFT?.tokenId || certificate.nftTokenId}
            />
          )}
        </View>

        {mintedNFT || certificate.nftMinted ? (
          <View className="bg-[#1AE57D20] rounded-2xl p-4 mt-5 border-2 border-[#1AE57D]">
            <View className="flex-row items-center justify-center mb-2">
              <Award size={20} color="#1AE57D" />
              <Text className="text-[#1AE57D] text-center font-bold text-base ml-2">
                NFT Minted Successfully!
              </Text>
            </View>
            <Text className="text-gray-300 text-center text-xs mb-3">
              This certificate is now a blockchain NFT
            </Text>
            <View className="bg-[#122119] rounded-xl p-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-xs">Token ID:</Text>
                <Text className="text-white text-xs font-mono">#{mintedNFT?.tokenId || certificate.nftTokenId}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-xs">Network:</Text>
                <Text className="text-white text-xs">{NFT_CONFIG.network.name}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400 text-xs">Owner:</Text>
                <Text className="text-white text-xs font-mono">
                  {(mintedNFT?.ownerAddress || certificate.nftOwnerAddress || '').substring(0, 10)}...
                </Text>
              </View>
            </View>
          </View>
        ) : certificate.amount >= NFT_CONFIG.minting.minDonationAmount ? (
          <View className="bg-[#1AE57D20] rounded-2xl p-3.5 mt-5 border border-[#1AE57D]">
            <Text className="text-[#1AE57D] text-center font-bold text-sm">
              ✨ NFT Eligible ✨
            </Text>
            <Text className="text-gray-400 text-center text-xs mt-1">
              This donation qualifies for NFT minting
            </Text>
          </View>
        ) : (
          <View className="bg-[#2a3e3e] rounded-2xl p-3.5 mt-5 border border-gray-600">
            <Text className="text-gray-400 text-center font-semibold text-xs">
              💡 Donate LKR {NFT_CONFIG.minting.minDonationAmount.toLocaleString()}+ to unlock NFT certificate
            </Text>
          </View>
        )}

        <View className="mt-5 mb-6">
          {mintedNFT || certificate.nftMinted ? (
            <>
              <TouchableOpacity
                className="bg-[#1AE57D] py-3.5 rounded-2xl mb-3 flex-row items-center justify-center"
                onPress={handleDownloadNFT}
                activeOpacity={0.8}
              >
                <ImageIcon size={20} color="black" />
                <Text className="text-black text-sm font-bold ml-2">
                  Download NFT Image
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="bg-[#2a3e3e] py-3.5 rounded-2xl mb-3 flex-row items-center justify-center border border-[#1AE57D]"
                onPress={handleViewOnBlockchain}
                activeOpacity={0.8}
              >
                <ExternalLink size={20} color="#1AE57D" />
                <Text className="text-[#1AE57D] text-sm font-bold ml-2">
                  Blockchain Info
                </Text>
              </TouchableOpacity>
            </>

          ) : (
            <TouchableOpacity
              className={`py-3.5 rounded-2xl mb-3 flex-row items-center justify-center ${
                certificate.amount >= NFT_CONFIG.minting.minDonationAmount ? 'bg-[#1AE57D]' : 'bg-gray-600'
              }`}
              onPress={handleMintNFT}
              activeOpacity={0.8}
              disabled={minting || certificate.amount < NFT_CONFIG.minting.minDonationAmount}
            >
              {minting ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <Award size={20} color={certificate.amount >= NFT_CONFIG.minting.minDonationAmount ? "black" : "#9ca3af"} />
              )}
              <Text className={`text-sm font-bold ml-2 ${
                certificate.amount >= NFT_CONFIG.minting.minDonationAmount ? 'text-black' : 'text-gray-400'
              }`}>
                {minting ? 'Minting NFT...' : certificate.amount >= NFT_CONFIG.minting.minDonationAmount ? 'Mint as NFT' : 'NFT Locked'}
              </Text>
            </TouchableOpacity>
          )}

          
          

          

          <TouchableOpacity
            className="bg-[#2a3e3e] py-3.5 rounded-2xl flex-row items-center justify-center border border-gray-700"
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Share2 size={20} color="#1AE57D" />
            <Text className="text-white text-sm font-semibold ml-2">
              Share Certificate
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-6 border border-gray-700">
          <View className="flex-row items-center mb-2">
            <Wallet size={16} color="#1AE57D" />
            <Text className="text-white text-xs font-semibold ml-2">
              About NFT Certificates
            </Text>
          </View>
          <Text className="text-gray-400 text-xs leading-5 mb-3">
            Your donation certificate can be minted as an NFT (Non-Fungible Token) on the blockchain. This creates a permanent, verifiable record of your contribution to renewable energy projects.
          </Text>
          <View className="bg-[#1AE57D20] rounded-lg p-2.5 mb-2">
            <Text className="text-[#1AE57D] text-xs font-semibold mb-1">
              ⚡ NFT Eligibility
            </Text>
            <Text className="text-gray-300 text-xs">
              • Minimum LKR {NFT_CONFIG.minting.minDonationAmount.toLocaleString()} donation required
            </Text>
            <Text className="text-gray-300 text-xs">
              • Minted on {NFT_CONFIG.network.name}
            </Text>
            <Text className="text-gray-300 text-xs">
              • Permanent blockchain record
            </Text>
          </View>
          
          {/* View Your NFTs Section */}
          <TouchableOpacity
            className="bg-[#122119] rounded-lg p-2.5 mt-2 border border-[#1AE57D]"
            onPress={() => router.push('/nft-gallery')}
            activeOpacity={0.8}
          >
            <Text className="text-[#1AE57D] text-xs font-semibold mb-1">
              📱 View All Your NFTs
            </Text>
            <Text className="text-gray-400 text-xs">
              Tap here to see all your minted NFT certificates with Token IDs, blockchain details, and more.
            </Text>
          </TouchableOpacity>

          {/* How to View on Polygon */}
          <View className="bg-[#122119] rounded-lg p-2.5 mt-2">
            <Text className="text-white text-xs font-semibold mb-1">
              🌐 View on Polygon Blockchain
            </Text>
            <Text className="text-gray-400 text-xs leading-4">
              After minting, you can view your NFT on PolygonScan:
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              1. Copy your Token ID from the certificate
            </Text>
            <Text className="text-gray-400 text-xs">
              2. Visit: mumbai.polygonscan.com
            </Text>
            <Text className="text-gray-400 text-xs">
              3. Search using your Token ID or wallet address
            </Text>
          </View>

          {hasWallet && (
            <View className="bg-[#122119] rounded-lg p-2.5 mt-2">
              <Text className="text-gray-400 text-xs">
                ✓ Wallet connected and ready
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Certificate;