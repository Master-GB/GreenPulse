import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  StatusBar
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface BillData {
  currentBill: number;
  creditAvailable: number;
  creditConversionRate: number;
  dueDate: string;
}

interface Account {
  accountNumber: string;
  serviceAddress: string;
  provider: string;
}

const PayBill: React.FC = () => {
  const router = useRouter();
  const [accounts] = useState<Account[]>([
    {
      accountNumber: '125678903',
      serviceAddress: '133 Pasan street, kaduwela',
      provider: 'Ceylon Electricity Board',
    },
    {
      accountNumber: '987654321',
      serviceAddress: '45 Main Road, Colombo',
      provider: 'Lanka Electricity Company',
    },
    {
      accountNumber: '456789012',
      serviceAddress: '78 Temple Lane, Kandy',
      provider: 'Ceylon Electricity Board',
    },
  ]);

  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const [accountNumber, setAccountNumber] = useState(accounts[0].accountNumber);
  const [serviceAddress, setServiceAddress] = useState(accounts[0].serviceAddress);
  const [provider, setProvider] = useState(accounts[0].provider);
  const [credits, setCredits] = useState(15);
  const [creditsToUse, setCreditsToUse] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreditError, setShowCreditError] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  const billData: BillData = {
    currentBill: 1200.0,
    creditAvailable: 1100.0,
    creditConversionRate: 91,
    dueDate: '20/10/2025',
  };

  const creditAmount = 100;
  const creditValue = credits * 100;
  const maxCreditsUsable = Math.min(credits, Math.ceil(billData.currentBill / 100));
  const amountToPay = creditsToUse * 100;
  const remainingAmount = billData.currentBill - amountToPay;
  const remainingCredits = credits - creditsToUse;

  const handleAccountSelect = (index: number) => {
    setSelectedAccountIndex(index);
    setAccountNumber(accounts[index].accountNumber);
    setServiceAddress(accounts[index].serviceAddress);
    setProvider(accounts[index].provider);
    setShowAccountDropdown(false);
  };

  const handleIncrement = useCallback(() => {
    if (creditsToUse < credits) {
      setCreditsToUse(creditsToUse + 1);
    }
  }, [creditsToUse, maxCreditsUsable]);

  const handleDecrement = useCallback(() => {
    if (creditsToUse > 0) {
      setCreditsToUse(creditsToUse - 1);
    }
  }, [creditsToUse]);

  const handlePayNow = async () => {
    if (creditsToUse === 0) {
      setShowCreditError(true);
      return;
    }
    setShowPaymentConfirmation(true);
  };

  const handleLearnMore = () => {
    setShowCreditError(false);
    setShowLearnMore(true);
  };

  const closeLearnMore = () => {
    setShowLearnMore(false);
  };

  const confirmPayment = async () => {
    setShowPaymentConfirmation(false);
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setCredits(remainingCredits);
      setCreditsToUse(0); // Reset credits to use to 0
      setShowSuccessModal(true);
    }, 2000);
  };

  return (
    <View className="flex-1 bg-[#122119]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Available Balance Card */}
        <View className="mx-5 mt-4 bg-[#1a3333] rounded-2xl p-5 border border-[#2a4444]">
          <Text className="text-gray-400 text-sm mb-2">Available Balance</Text>
          <Text className="text-[#00ff88] text-3xl font-bold">
            {credits} Credit = Rs {creditValue.toFixed(2)}
          </Text>
        </View>

        {/* Utility Account Section */}
        <View className="mx-5 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-semibold">Utility Account</Text>
            <TouchableOpacity 
            className="bg-[#00ff88] px-4 py-2 rounded-full"
            onPress={() => router.push('/(root)/add_utility')}
            >
              <Text className="text-black font-semibold text-sm">Add Account</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#1a3333] rounded-2xl p-5 border border-[#2a4444]">
            {/* Account Number */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Account Number</Text>
              {accounts.length > 1 ? (
                <TouchableOpacity
                  className="bg-[#2a3a3a] rounded-xl px-4 py-4 flex-row items-center justify-between"
                  onPress={() => setShowAccountDropdown(true)}
                >
                  <Text className="text-white text-base">{accountNumber}</Text>
                  <Ionicons name="chevron-down" size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <View className="bg-[#2a3a3a] rounded-xl px-4 py-4">
                  <Text className="text-white text-base">{accountNumber}</Text>
                </View>
              )}
            </View>

            {/* Service Address */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Service Address</Text>
              <View className="bg-[#2a3a3a] rounded-xl px-4 py-4">
                <Text className="text-white text-base">{serviceAddress}</Text>
              </View>
            </View>

            {/* Provider */}
            <View>
              <Text className="text-gray-400 text-sm mb-2">Provider</Text>
              <View className="bg-[#2a3a3a] rounded-xl px-4 py-4">
                <Text className="text-white text-base">{provider}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bill Summary Section */}
        <View className="mx-5 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-semibold">Bill Summary</Text>
            <TouchableOpacity className="bg-[#00ff88] px-4 py-2 rounded-full">
              <Text className="text-black font-semibold text-sm">View Bill</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#3a5a4a] rounded-2xl p-5 relative overflow-hidden">
            {/* Watermark */}
            <View className="absolute right-0 top-0 opacity-10">
              <Text className="text-[#00ff88] text-6xl font-bold">CEB</Text>
            </View>

            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-white text-sm mb-1">Current Bill</Text>
                <Text className="text-white text-2xl font-bold">
                  Rs.{billData.currentBill.toFixed(2)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-300 text-xs mb-1">Due on</Text>
                <Text className="text-white font-semibold">{billData.dueDate}</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-white text-sm mb-1">Credit Available</Text>
              <Text className="text-[#00ff88] text-xl font-bold">
                Rs.{credits*creditAmount}
              </Text>
            </View>

            {/* Credit Conversion Rate */}
            <View className="pt-3 border-t border-[#4a6a5a]">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white text-sm">Credit Conversion rate</Text>
                <View className="bg-[#00ff88] px-3 py-1 rounded-full">
                  <Text className="text-black font-bold">
                    {(100/billData.currentBill * credits*creditAmount).toFixed(2)}%
                  </Text>
                </View>
              </View>

              {/* Static Progress Bar kept as-is */}
              <View className="mt-2">
                <View className="bg-[#2a4a3a] h-2 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${(100/billData.currentBill * credits*creditAmount) >= 100 ? 'bg-[#00ff88]' : 'bg-[#ff4d4d]'}`}
                    style={{
                      width: `${Math.min(100, 100/billData.currentBill * credits*creditAmount)}%`,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-gray-400 text-xs">0%</Text>
                  <Text className="text-gray-400 text-xs">100%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View className="mx-5 mt-4 mb-8">
          <Text className="text-white text-lg font-semibold mb-4">Payment</Text>

          <View className="bg-[#1a3333] rounded-2xl p-5 border border-[#2a4444]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-gray-400 text-sm mb-1">Credits to Use</Text>
                <Text className="text-[#00ff88] text-2xl font-bold">
                  Rs.{amountToPay.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center bg-[#2a3a3a] rounded-full px-2 py-2">
                <TouchableOpacity onPress={handleDecrement} disabled={credits === 0}>
                  <Ionicons
                    name="remove-circle"
                    size={28}
                    color={creditsToUse === 0 ? '#4a5a5a' : '#fff'}
                  />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold mx-2 min-w-[40px] text-center">
                  {creditsToUse}
                </Text>
                <TouchableOpacity
                  onPress={handleIncrement}
                  disabled={creditsToUse >= credits}
                >
                  <Ionicons
                    name="add-circle"
                    size={28}
                    color={creditsToUse >= credits ? '#4a5a5a' : '#00ff88'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Custom Slider Implementation */}
            <View className="mb-4 px-1 mt-[-5px]">
              <View className="relative h-12 flex justify-center">
                {/* Track Background */}
                <View className="absolute left-0 right-0 h-2 bg-[#374151] rounded-full" />

                {/* Progress Fill */}
                <View
                  className="absolute left-0 h-2 bg-[#00ff88] rounded-full"
                  style={{ width: `${(creditsToUse / credits) * 100}%` }}
                />

                {/* Slider Thumb */}
                <View
                  className="absolute"
                  style={{
                    left: `${(creditsToUse / credits) * 100}%`,
                    transform: [{ translateX: -12 }],
                  }}
                >
                  <View className="w-6 h-6 rounded-full bg-[#00ff88] border-2 border-white" />
                </View>

                {/* Hidden Slider for Touch Handling */}
                <Slider
                  minimumValue={0}
                  maximumValue={credits}
                  step={1}
                  value={creditsToUse}
                  onValueChange={setCreditsToUse}
                  minimumTrackTintColor="transparent"
                  maximumTrackTintColor="transparent"
                  thumbTintColor="transparent"
                  style={{
                    width: "100%",
                    height: 40,
                    opacity: 0.01,
                    position: "absolute",
                    top: -4,
                  }}
                />
              </View>
              <View className="flex-row justify-between px-1 mt-[-4px]">
                <Text className="text-gray-400 text-xs">0</Text>
                <Text className="text-gray-400 text-xs">Max credits : {credits}</Text>
              </View>
            </View>

            {/* Remaining Amount */}
            <View className="flex-row items-center justify-between pt-4 border-t border-[#2a4444]">
              <Text className="text-white text-base font-medium">Remaining Amount</Text>
              <View className="items-end">
                <Text className="text-white text-xl font-bold">
                  Rs.{remainingAmount.toFixed(2)}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">After Credits</Text>
              </View>
            </View>

            {remainingAmount > 0 ? (
              <View className="mt-3 bg-[#4a3a1a] rounded-lg p-3 flex-row items-start">
                <Ionicons name="information-circle" size={18} color="#ffaa00" />
                <Text className="text-[#ffaa00] text-xs ml-2 flex-1">
                  You'll need to pay Rs.{remainingAmount.toFixed(2)} via other payment methods
                </Text>
              </View>
            ) : remainingAmount < 0 && (
              <View className="mt-3 bg-[#1a3a2a] rounded-lg p-3 flex-row items-start">
                <Ionicons name="checkmark-circle" size={18} color="#00ff88" />
                <Text className="text-[#00ff88] text-xs ml-2 flex-1">
                  You have a surplus of Rs.{Math.abs(remainingAmount).toFixed(2)} that will be added to your electricity bill
                </Text>
              </View>
            )}
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            className={`mt-6 rounded-2xl py-4 ${
              isLoading ? 'bg-[#2a4444]' : 'bg-[#00ff88]'
            }`}
            onPress={handlePayNow}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-black text-base font-bold">
                Pay Now Using Credits
              </Text>
            )}
          </TouchableOpacity>

          {/* Summary Info */}
          <View className="mt-4 bg-[#1a2a2a] rounded-xl p-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400 text-sm">Current Credits</Text>
              <Text className="text-white font-semibold">{credits}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400 text-sm">Credits Used</Text>
              <Text className="text-[#ff6666] font-semibold">-{creditsToUse}</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-[#2a3a3a]">
              <Text className="text-white font-semibold">Remaining Credits</Text>
              <Text className="text-[#00ff88] font-bold">{remainingCredits}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Account Selection Modal */}
      <Modal
        visible={showAccountDropdown}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowAccountDropdown(false)}
      >
        <Pressable
          className="flex-1 bg-[#122119] opacity-90 justify-center items-center"
          onPress={() => setShowAccountDropdown(false)}
        >
          <Pressable
            className="bg-[#1a3333] rounded-2xl mx-5 w-11/12 max-h-96"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-5 border-b border-[#2a4448]">
              <Text className="text-white text-lg font-semibold">Select Account</Text>
            </View>

            <ScrollView className="max-h-80">
              {accounts.map((account, index) => (
                <TouchableOpacity
                  key={account.accountNumber}
                  className={`p-5 border-b border-[#2a4444] ${
                    selectedAccountIndex === index ? 'bg-[#2a4444]' : ''
                  }`}
                  onPress={() => handleAccountSelect(index)}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white text-base font-semibold">
                      {account.accountNumber}
                    </Text>
                    {selectedAccountIndex === index && (
                      <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
                    )}
                  </View>
                  <Text className="text-gray-400 text-sm mb-1">
                    {account.serviceAddress}
                  </Text>
                  <Text className="text-gray-400 text-xs">{account.provider}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="p-4 border-t border-[#2a4444]"
              onPress={() => setShowAccountDropdown(false)}
            >
              <Text className="text-[#00ff88] text-center font-semibold">Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal
        visible={showPaymentConfirmation}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowPaymentConfirmation(false)}
      >
        <View className="flex-1 justify-center items-center bg-[#122119] opacity-90 px-5">
          <View className="w-full bg-[#1a3333] rounded-2xl p-6 border border-[#2a4444]">
            <Text className="text-white text-xl font-bold mb-4 text-center">
              Confirm Payment
            </Text>
            
            <View className="mb-6">
              <View className="flex-row justify-between py-2 border-b border-[#2a4444]">
                <Text className="text-gray-300">Current Bill</Text>
                <Text className="text-white font-semibold">Rs.{billData.currentBill.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between py-2 border-b border-[#2a4444]">
                <Text className="text-gray-300">Credits Used</Text>
                <Text className="text-[#00ff88] font-semibold">
                  {creditsToUse} (Rs.{amountToPay.toFixed(2)})
                </Text>
              </View>
              
              {remainingAmount > 0 ? (
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-300">Remaining to Pay</Text>
                  <Text className="text-[#ffaa00] font-semibold">
                    Rs.{remainingAmount.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-300">Surplus Amount</Text>
                  <Text className="text-[#00ff88] font-semibold">
                    Rs.{Math.abs(remainingAmount).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
            
            <View className="flex-row justify-between space-x-6 gap-4">
              <TouchableOpacity 
                className="flex-1 bg-[#2a3a3a] rounded-xl py-3 items-center"
                onPress={() => setShowPaymentConfirmation(false)}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-[#00ff88] rounded-xl py-3 items-center"
                onPress={confirmPayment}
              >
                <Text className="text-black font-semibold">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-6">
              <View className="bg-[#00ff88] rounded-full p-3 mb-4">
                <Ionicons name="checkmark" size={40} color="#122119" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2">Success!</Text>
              <Text className="text-gray-300 text-center mb-2">Your payment has been processed successfully</Text>
              <Text className="text-green-400 text-center text-sm">You light stay on-powered by community energy 💚</Text>
            </View>
            
            <View className="gap-5">
              <View className="bg-[#2a2a2a] p-4 rounded-xl">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Amount Paid</Text>
                  <Text className="text-white font-semibold">LKR {amountToPay.toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Date</Text>
                  <Text className="text-white">{new Date().toLocaleDateString()}</Text>
                </View>
              </View>
              
              <View className="gap-3">
             
                <TouchableOpacity 
                  className="bg-[#19E57D] py-4 rounded-xl items-center"
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text className="text-white font-semibold">Done</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="bg-[#8DB890] opacity-50 py-4 rounded-xl items-center"
                  onPress={() => {
                    // TODO: Implement view receipt functionality
                    console.log('View Receipt');
                  }}
                >
                  <Text className="text-[#1CFF4E] font-semibold">View Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Credit Error Modal */}
      <Modal
        visible={showCreditError}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowCreditError(false)}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="bg-amber-100 p-3 rounded-full mb-3">
                <Ionicons name="warning" size={32} color="#F59E0B" />
              </View>
              <Text className="text-white text-xl font-bold mb-1">No Credits Selected</Text>
              <Text className="text-gray-300 text-center text-sm">
                Please select at least 1 credit before proceeding with your payment.
              </Text>
            </View>
            
            <View className="mt-4 gap-3">
              <TouchableOpacity 
                className="bg-[#00ff88] py-3 rounded-xl items-center"
                onPress={() => setShowCreditError(false)}
              >
                <Text className="text-black font-semibold">OK, I'll Select Credits</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="py-3 rounded-xl items-center border border-[#2a3a3a]"
                onPress={handleLearnMore}
              >
                <Text className="text-[#00ff88] font-semibold">Learn About Credits</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Learn About Credits Modal */}
      <Modal
        visible={showLearnMore}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeLearnMore}
      >

        <View className="flex-1">
                  {/* StatusBar for the modal */}
                  <StatusBar 
                    barStyle="light-content"
                    backgroundColor="transparent"
                    translucent={true}
                  />
        <View className="flex-1 bg-[#122119] opacity-90  top-0 left-0 right-0 bottom-0 justify-center items-center p-5">
          <View className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="bg-green-100 p-3 rounded-full mb-3">
                <Ionicons name="information-circle" size={32} color="#10B981" />
              </View>
              <Text className="text-white text-xl font-bold mb-3">About Credits</Text>
              
              <View className="w-full gap-3 mb-4">
                <View className="flex-row items-start">
                  <View className="bg-[#2a3a3a] p-2 rounded-lg mr-3">
                    <Ionicons name="gift" size={18} color="#00ff88" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium mb-1">Earn Credits</Text>
                    <Text className="text-gray-300 text-sm">
                      Get credits from  community donation .
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <View className="bg-[#2a3a3a] p-2 rounded-lg mr-3">
                    <Ionicons name="cash" size={18} color="#00ff88" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium mb-1">Credit Value</Text>
                    <Text className="text-gray-300 text-sm">
                      Each credit is worth LKR 100 towards your utility bill.
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-start">
                  <View className="bg-[#2a3a3a] p-2 rounded-lg mr-3">
                    <Ionicons name="refresh-circle" size={18} color="#00ff88" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium mb-1">Usage</Text>
                    <Text className="text-gray-300 text-sm">
                      Apply credits to reduce your bill amount when making payments.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              className="bg-[#00ff88] py-3 rounded-xl items-center mt-2"
              onPress={closeLearnMore}
            >
              <Text className="text-black font-semibold">Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </Modal>
    </View>
  );
};

export default PayBill;