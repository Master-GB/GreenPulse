import React, { useState } from 'react';
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
  type: 'coins' | 'credits';
  source: string;
  date: string;
  isPositive: boolean;
}

const Wallet = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'coins' | 'credits'>('all');
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const transactions: Transaction[] = [
    { id: '1', amount: 10, type: 'credits', source: 'GreenPulse', date: 'Today', isPositive: true },
    { id: '2', amount: 12, type: 'coins', source: 'Community Pool', date: 'Yesterday', isPositive: false },
    { id: '3', amount: 8, type: 'coins', source: 'Community Pool', date: 'Sep 15', isPositive: false },
    { id: '4', amount: 5, type: 'coins', source: 'Community Pool', date: 'Sep 10', isPositive: false },
    { id: '5', amount: 5, type: 'credits', source: 'GreenPulse', date: 'Sep 01', isPositive: true },
    { id: '6', amount: 15, type: 'coins', source: 'Community Pool', date: 'Aug 22', isPositive: false },
     { id: '7', amount: 5, type: 'coins', source: 'Community Pool', date: 'Aug 20', isPositive: false },
    { id: '8', amount: 5, type: 'credits', source: 'GreenPulse', date: 'Aug 15', isPositive: true },
    { id: '9', amount: 15, type: 'coins', source: 'Community Pool', date: 'Aug 2', isPositive: false },
  ];

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      {/* Fixed Header Section */}
      <View>
        {/* Balance Card */}
        <View className="mx-4 mt-2 bg-[#2a3e3e] rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
               <Image source={icons.coinH}  className="size-8 mb-1" />
              <Text className="text-4xl font-bold text-white">120</Text>
              <Text className="text-gray-400 text-lg">Coins</Text>
            </View>
            <Text className="text-gray-400 text-2xl mx-2">/</Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-3xl">💳</Text>
              <Text className="text-4xl font-bold text-[#1AE57D]">15</Text>
              <Text className="text-gray-400 text-lg">Credits</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2 ml-7">
            <Text className="text-sm text-gray-400">
              120 Coins available | 15 Credits usable
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
          {filteredTransactions.map((transaction) => (
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
                    {transaction.isPositive ? '+' : '-'}{transaction.amount}{' '}
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Text>
                  <Text className="text-sm text-gray-400">
                    {transaction.isPositive ? 'Received from' : 'Donated to'} {transaction.source}
                  </Text>
                </View>
                <Text className="text-sm text-gray-400">
                  {transaction.date}
                </Text>
              </View>
            ))}
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