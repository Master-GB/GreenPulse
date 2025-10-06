import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Provider {
  id: string;
  name: string;
}

const AddUtility = () => {
  const router = useRouter();
  
  const [selectedProvider, setSelectedProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountNickname, setAccountNickname] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [autoVerify, setAutoVerify] = useState(true);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({
    provider: '',
    accountNumber: '',
    nickname: '',
    address: '',
    autoVerify: ''
  });
  const providers: Provider[] = [
    { id: '1', name: '(CEB)Ceylon Electricity Board' },
    { id: '3', name: 'LECO (Lanka Electric)' },
  ];

  const isFormValid = (): boolean => {
    return (
      !!selectedProvider &&
      accountNumber.trim().length > 0 &&
      accountNickname.trim().length > 0 &&
      serviceAddress.trim().length > 0 &&
      autoVerify
    );
  };

  const validateForm = (): boolean => {
    const newErrors = {
      provider: '',
      accountNumber: '',
      nickname: '',
      address: '',
      autoVerify: ''
    };

    let isValid = true;

    if (!selectedProvider) {
      newErrors.provider = 'Please select a provider';
      isValid = false;
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
      isValid = false;
    } else if (accountNumber.length !== 10) {
      newErrors.accountNumber = 'Account number must be 10 characters';
      isValid = false;
    }

    if (!accountNickname.trim()) {
      newErrors.nickname = 'Account nickname is required';
      isValid = false;
    } else if (accountNickname.length > 10) {
      newErrors.nickname = 'Nickname must be 10 characters or less';
      isValid = false;
    } else if (accountNickname.length < 2) {
      newErrors.nickname = 'Please enter a suitable nickname';
      isValid = false;
    }

    if (!serviceAddress.trim()) {
      newErrors.address = 'Service address is required';
      isValid = false;
    } else if (serviceAddress.length < 10) {
      newErrors.address = 'Please enter a complete address';
      isValid = false;
    }

    // Validate auto-verify toggle
    if (!autoVerify) {
      newErrors.autoVerify = 'You must enable auto-verification to continue';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider.name);
    setShowProviderModal(false);
    setErrors({ ...errors, provider: '' });
  };

  const handleSaveAccount = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-[#122119]">
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View className="mx-5 mt-2 bg-[#2a4a3a] rounded-2xl p-4 flex-row items-start">
          <View className="bg-[#00ff88] rounded-full p-2 mr-3">
            <Ionicons name="bulb" size={24} color="#122119" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold mb-1">
              Add your electricity account to manage and pay bill using your clean energy credits
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View className="mx-5 mt-4">
          <Text className="text-white text-xl font-bold ">Add Account Form</Text>
          <Text className="text-gray-400 text-sm mb-6">
            Please fill in the details below to save your account.
          </Text>

          <View className="bg-[#1a3333] rounded-2xl p-5 border border-[#2a4444]">
            {/* Provider Selection */}
            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-2">
                Select Provider <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                className={`bg-[#2a3a3a] rounded-xl px-4 py-4 flex-row items-center justify-between ${
                  errors.provider ? 'border-2 border-red-500' : ''
                }`}
                onPress={() => setShowProviderModal(true)}
              >
                <Text className={selectedProvider ? 'text-white' : 'text-gray-500'}>
                  {selectedProvider || 'Select Provider'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
              {errors.provider ? (
                <Text className="text-red-500 text-xs mt-1">{errors.provider}</Text>
              ) : null}
            </View>

            {/* Account Number */}
            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-2">
                Account Number <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`bg-[#2a3a3a] rounded-xl px-4 py-4 text-white ${
                  errors.accountNumber ? 'border-2 border-red-500' : ''
                }`}
                placeholder="Enter Account Number"
                placeholderTextColor="#6b7280"
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text);
                  setErrors({ ...errors, accountNumber: '' });
                }}
                keyboardType="numeric"
              />
              {errors.accountNumber ? (
                <Text className="text-red-500 text-xs mt-1">{errors.accountNumber}</Text>
              ) : null}
            </View>

            {/* Account Nickname */}
            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-2">
                Account Nickname <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`bg-[#2a3a3a] rounded-xl px-4 py-4 text-white ${
                  errors.nickname ? 'border-2 border-red-500' : ''
                }`}
                placeholder="e.g., Home, Office, Villa"
                placeholderTextColor="#6b7280"
                value={accountNickname}
                onChangeText={(text) => {
                  setAccountNickname(text);
                  setErrors({ ...errors, nickname: '' });
                }}
              />
              {errors.nickname ? (
                <Text className="text-red-500 text-xs mt-1">{errors.nickname}</Text>
              ) : null}
            </View>

            {/* Service Address */}
            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-2">
                Service Address <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className={`bg-[#2a3a3a] rounded-xl px-4 py-5 text-white ${
                  errors.address ? 'border-2 border-red-500' : ''
                }`}
                placeholder="Enter complete service address"
                placeholderTextColor="#6b7280"
                value={serviceAddress}
                onChangeText={(text) => {
                  setServiceAddress(text);
                  setErrors({ ...errors, address: '' });
                }}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors.address ? (
                <Text className="text-red-500 text-xs mt-1">{errors.address}</Text>
              ) : null}
            </View>

            {/* Auto-verify Toggle */}
            <View className="mt-2">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setAutoVerify(!autoVerify)}
              >
                <View
                  className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
                    autoVerify ? 'bg-[#00ff88] border-[#00ff88]' : 'border-gray-400'
                  }`}
                >
                  {autoVerify && <Ionicons name="checkmark" size={16} color="#122119" />}
                </View>
                <Text className="text-gray-300 text-sm flex-1">
                  Auto-verify account with utility data
                </Text>
              </TouchableOpacity>
              {errors.autoVerify ? (
                <Text className="text-red-500 text-xs mt-1 ml-9">{errors.autoVerify}</Text>
              ) : null}
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-[#1a2a2a] rounded-xl p-4 mt-4 flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#00ff88" />
            <Text className="text-gray-300 text-xs ml-2 flex-1">
              Your account information is encrypted and securely stored. We use it only to help you manage and pay your bills.
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <View className="mx-5 mt-6 mb-8">
          <TouchableOpacity
            className={`rounded-2xl py-4 ${isLoading ? 'bg-[#2a4444]' : !isFormValid() ? 'bg-[#00ff88] opacity-60' : 'bg-[#00ff88]'}`}
            onPress={handleSaveAccount}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-black text-base font-bold">
                Save Account
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Provider Selection Modal */}
      <Modal
        visible={showProviderModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowProviderModal(false)}
      >
        <View className="flex-1  bg-[#122119] opacity-90 justify-center items-center">
          <View className="bg-[#1a3333] rounded-2xl mx-5 w-11/12 max-h-96">
            <View className="p-5 border-b border-[#2a4444]">
              <Text className="text-white text-lg font-semibold">Select Provider</Text>
            </View>

            <ScrollView className="max-h-80">
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  className={`p-5 border-b border-[#2a4444] flex-row items-center justify-between ${
                    selectedProvider === provider.name ? 'bg-[#2a4444]' : ''
                  }`}
                  onPress={() => handleProviderSelect(provider)}
                >
                  <Text className="text-white text-base">{provider.name}</Text>
                  {selectedProvider === provider.name && (
                    <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="p-4 border-t border-[#2a4444]"
              onPress={() => setShowProviderModal(false)}
            >
              <Text className="text-[#00ff88] text-center font-semibold">Close</Text>
            </TouchableOpacity>
        </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleSuccessContinue}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a3333] rounded-2xl w-full max-w-sm overflow-hidden border border-[#00ff88]/30">
            {/* Header */}
            <View className="items-center p-6">
              <View className="bg-[#00ff88] rounded-full p-3 mb-4">
                <Ionicons name="checkmark" size={32} color="#122119" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">Success!</Text>
              <Text className="text-gray-300 text-center">
                Your electricity account has been successfully added and verified!
              </Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-[#2a4444] w-full" />

            {/* Action Button */}
            <TouchableOpacity
              className="py-4 items-center"
              onPress={handleSuccessContinue}
              activeOpacity={0.8}
            >
              <Text className="text-[#00ff88] text-base font-semibold">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddUtility;