import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Info } from 'lucide-react-native';
import { icons } from '@/constants/icons';

interface Transaction {
  id: string;
  amount: number;
  type: 'donation' | 'credit';
  source: string;
  date: string;
  timestamp: any;
  isPositive: boolean;
}

const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'coins' | 'credits'>('all');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [userCredits, setUserCredits] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's coin balance
  const loadUserCoins = useCallback(async () => {
    try {
      if (!user) return;
      
      const recordsRef = collection(db, 'users', user.uid, 'energyRecords');
      const snapshot = await getDocs(recordsRef);
      
      let totalCoins = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.coinValue) {
          totalCoins += Number(data.coinValue);
        }
      });
      
      setUserCoins(Math.round(totalCoins));
    } catch (error) {
      console.error('Error loading user coins:', error);
    }
  }, [user]);

  // Load user's credits from totalCredits collection
  const loadUserCredits = useCallback(async () => {
    try {
      if (!user) return;
      
      const creditDoc = await getDoc(doc(db, 'totalCredits', user.uid));
      if (creditDoc.exists()) {
        const data = creditDoc.data();
        setUserCredits(data.totalReceived || 0);
      } else {
        setUserCredits(0);
      }
    } catch (error) {
      console.error('Error loading user credits:', error);
      setUserCredits(0);
    }
  }, [user]);

  // Format date to string
  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return 'Unknown date';
      // Handle both Firestore Timestamp objects and ISO strings
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      // If date is invalid, return a fallback
      if (isNaN(date.getTime())) return 'Recent';
      
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recent';
    }
  };

  // Load transaction history
  const loadTransactionHistory = useCallback(async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      const allTransactions: Transaction[] = [];
      
      // 1. Load donations (sent by user)
      const donationsQuery = collection(db, 'donations');
      const donationsSnapshot = await getDocs(donationsQuery);
      
      donationsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.userId === user.uid) {
          allTransactions.push({
            id: doc.id,
            amount: data.amountCoins,
            type: 'donation',
            source: data.beneficiaryName || 'Community',
            date: formatDate(data.createdAt),
            timestamp: data.createdAt,
            isPositive: false
          });
        }
      });
      
      // 2. Load received credits from donationHistory
      const receivedCreditsDoc = await getDoc(doc(db, 'totalCredits', user.uid));
      if (receivedCreditsDoc.exists()) {
        const data = receivedCreditsDoc.data();
        
        // Add all credit transactions from donationHistory
        if (data.donationHistory && Array.isArray(data.donationHistory)) {
          data.donationHistory.forEach((credit: any, index: number) => {
            allTransactions.push({
              id: `credit-${user.uid}-${index}`,
              amount: credit.amount,
              type: 'credit',
              source: credit.fromUserEmail || 'Donor',
              date: formatDate(credit.timestamp),
              timestamp: credit.timestamp,
              isPositive: true
            });
          });
        }
        // Fallback to lastDonation if donationHistory doesn't exist
        else if (data.lastDonation) {
          allTransactions.push({
            id: `credit-${user.uid}-last`,
            amount: data.lastDonation.amount,
            type: 'credit',
            source: data.lastDonation.fromUserEmail || 'Donor',
            date: formatDate(data.lastDonation.timestamp),
            timestamp: data.lastDonation.timestamp,
            isPositive: true
          });
        }
      }
      
      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return timeB - timeA;
      });
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load all data when component mounts
  useEffect(() => {
    loadUserCoins();
    loadUserCredits();
    loadTransactionHistory();
  }, [loadUserCoins, loadUserCredits, loadTransactionHistory]);

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'all') return true;
    return (activeTab === 'coins' && t.type === 'donation') || 
           (activeTab === 'credits' && t.type === 'credit');
  });

  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      {/* Fixed Header Section */}
      <View>
        {/* Balance Card */}
        <View className="mx-4 mt-2 bg-[#2a3e3e] rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Image source={icons.coinH} className="size-8 mb-1" />
              <Text className="text-4xl font-bold text-white">{userCoins}</Text>
              <Text className="text-gray-400 text-lg">Coins</Text>
            </View>
            <Text className="text-gray-400 text-2xl mx-2">/</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-3xl">💳</Text>
              <Text className="text-4xl font-bold text-[#1AE57D]">{userCredits}</Text>
              <Text className="text-gray-400 text-lg">Credits</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 ml-7">
            <Text className="text-sm text-gray-400">
              {userCoins} Coins available | {userCredits} Credits usable
            </Text>
            <TouchableOpacity onPress={() => setShowInfoModal(true)}>
              <Info color="#3993fa" size={18} />
            </TouchableOpacity>
          </View>
          {/* Info Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showInfoModal}
            statusBarTranslucent={true}
            onRequestClose={() => setShowInfoModal(false)}
          >
            <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#122119] opacity-90 justify-center items-center">
              <View className="bg-[#2a3e3e] p-5 rounded-xl mx-5 w-[90%] max-w-md">
                <Text className="text-white text-base mb-3">
                  <Text className="font-bold">Coins</Text> represent generated power by clean energy that can be donated.
                </Text>
                <Text className="text-white text-base">
                  <Text className="font-bold">Credits</Text> are donated coins that can be used to pay electricity bills, etc.
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowInfoModal(false)}
                  className="mt-4 bg-[#1AE57D] py-2 rounded-lg"
                >
                  <Text className="text-center font-semibold">Got it</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* Transaction History Header */}
        <View className="mx-4 mt-6 mr-3">
          <Text className="text-xl font-semibold text-white mb-4">
            Transaction History
          </Text>
          
          {/* Tabs */}
          <View className="flex-row gap-6 border-b border-gray-700 ">
            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              className="pb-2"
            >
              <Text
                className={`font-medium ${
                  activeTab === 'all' ? 'text-[#1AE57D]' : 'text-gray-400 '
                }`}
              >
                All
              </Text>
              {activeTab === 'all' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1AE57D]" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('coins')}
              className="pb-2"
            >
              <Text
                className={`font-medium ${
                  activeTab === 'coins' ? 'text-[#1AE57D]' : 'text-gray-400'
                }`}
              >
                Coins
              </Text>
              {activeTab === 'coins' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1AE57D]" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('credits')}
              className="pb-2"
            >
              <Text
                className={`font-medium ${
                  activeTab === 'credits' ? 'text-[#1AE57D]' : 'text-gray-400'
                }`}
              >
                Credits
              </Text>
              {activeTab === 'credits' && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1AE57D]" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Transaction List */}
      <ScrollView className="flex-1">
        <View className="mx-4 pb-24">
          {isLoading ? (
            <View className="py-4 items-center">
              <Text className="text-gray-400">Loading transactions...</Text>
            </View>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <View
                key={transaction.id}
                className="flex-row items-center justify-between py-3 border-b border-gray-700"
              >
                <View>
                  <Text
                    className={`font-semibold mb-1 ${
                      transaction.isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {transaction.isPositive ? '+' : '-'}{transaction.amount} 
                    {transaction.isPositive ? ' Credits' : ' Coins'}
                  </Text>
                  <Text className="text-sm text-gray-400">
                    {transaction.isPositive ? 'Received from' : 'Donated to'} {transaction.source}
                  </Text>
                </View>
                <Text className="text-sm text-gray-400">
                  {transaction.date}
                </Text>
              </View>
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-400">No transactions found</Text>
            </View>
          )}
          </View>
      </ScrollView>

      {/* Donate Button */}
      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity 
        className="w-full bg-[#1AE57D] py-4 rounded-full items-center shadow-lg"
        onPress={() => router.push('/(root)/donateNow')}
        >
          <Text className="text-gray-1000 font-bold text-base">
            Donate Coin
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Wallet;