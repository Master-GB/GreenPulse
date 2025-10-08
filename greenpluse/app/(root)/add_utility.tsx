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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';

interface Provider {
  id: string;
  name: string;
}

const AddUtility = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Form state
  const [selectedProvider, setSelectedProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountNickname, setAccountNickname] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [autoVerify, setAutoVerify] = useState(true);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form errors
  const [errors, setErrors] = useState({
    provider: '',
    accountNumber: '',
    nickname: '',
    address: '',
    autoVerify: ''
  });

  // Track user interaction for live validation
  const [touched, setTouched] = useState({
    provider: false,
    accountNumber: false,
    nickname: false,
    address: false,
    autoVerify: false,
  });

  // Single-field validation helper
  const validateField = (field: keyof typeof errors, value?: string | boolean): string => {
    switch (field) {
      case 'provider':
        return selectedProvider ? '' : 'Please select a provider';
      case 'accountNumber': {
        const v = (typeof value === 'string' ? value : accountNumber).trim();
        if (!v) return 'Account number is required';
        if (v.length !== 10) return 'Account number must be 10 digits';
        return '';
      }
      case 'nickname': {
        const v = (typeof value === 'string' ? value : accountNickname).trim();
        if (!v) return 'Nickname is required';
        if (v.length < 3) return 'Nickname must be at least 3 characters';
        if (v.length > 10) return 'Nickname must be 10 characters or less';
        return '';
      }
      case 'address': {
        const v = (typeof value === 'string' ? value : serviceAddress).trim();
        if (!v) return 'Service address is required';
        if (v.length < 10) return 'Please enter a complete address';
        return '';
      }
      case 'autoVerify': {
        const v = typeof value === 'boolean' ? value : autoVerify;
        return v ? '' : 'You must enable auto-verification';
      }
      default:
        return '';
    }
  };
  
  // Providers list
  const providers: Provider[] = [
    { id: '1', name: '(CEB) Ceylon Electricity Board' },
    { id: '2', name: 'LECO (Lanka Electricity Company)' },
  ];
  
  // Form validation
  const isFormValid = (): boolean => {
    return (
      !!selectedProvider &&
      accountNumber.trim().length === 10 &&
      accountNickname.trim().length >= 2 &&
      accountNickname.trim().length <= 10 &&
      serviceAddress.trim().length >= 10 &&
      autoVerify
    );
  };
  
  const validateForm = (): boolean => {
    const newErrors = {
      provider: !selectedProvider ? 'Please select a provider' : '',
      accountNumber: 
        !accountNumber ? 'Account number is required' :
        accountNumber.length !== 10 ? 'Account number must be 10 digits' : '',
      nickname: 
        !accountNickname ? 'Nickname is required' :
        accountNickname.length < 2 ? 'Nickname must be at least 2 characters' :
        accountNickname.length > 10 ? 'Nickname must be 10 characters or less' : '',
      address: 
        !serviceAddress ? 'Service address is required' :
        serviceAddress.length < 10 ? 'Please enter a complete address' : '',
      autoVerify: !autoVerify ? 'You must enable auto-verification' : ''
    };
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };
  
  // Handle provider selection
  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider.name);
    setShowProviderModal(false);
    setErrors(prev => ({ ...prev, provider: '' }));
    setTouched(prev => ({ ...prev, provider: true }));
  };

  // Show error message
  const showError = (message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  // Handle save account
  const handleSaveAccount = async () => {
    if (!validateForm()) {
      // surface all inline errors
      setTouched({
        provider: true,
        accountNumber: true,
        nickname: true,
        address: true,
        autoVerify: true,
      });
      return;
    }

    if (!user) {
      showError('You must be logged in to save an account');
      return;
    }

    setIsLoading(true);

    try {
      // Save to Firestore
      const utilityAccount = {
        userId: user.uid,
        provider: selectedProvider,
        accountNumber: accountNumber.trim(),
        accountNickname: accountNickname.trim(),
        serviceAddress: serviceAddress.trim(),
        autoVerify,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'utilityAccounts'), utilityAccount);
      console.log('Document written with ID: ', docRef.id);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving utility account:', error);
      showError('Failed to save utility account. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
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
                onPress={() => {
                  setTouched(prev => ({ ...prev, provider: true }));
                  const msg = validateField('provider');
                  setErrors(prev => ({ ...prev, provider: msg }));
                  setShowProviderModal(true);
                }}
              >
                <Text className={selectedProvider ? 'text-white' : 'text-gray-500'}>
                  {selectedProvider || 'Select Provider'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
              {errors.provider && touched.provider ? (
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
                  const msg = validateField('accountNumber', text);
                  setErrors(prev => ({ ...prev, accountNumber: msg }));
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, accountNumber: true }));
                  const msg = validateField('accountNumber');
                  setErrors(prev => ({ ...prev, accountNumber: msg }));
                }}
                keyboardType="numeric"
              />
              {errors.accountNumber && touched.accountNumber ? (
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
                  const msg = validateField('nickname', text);
                  setErrors(prev => ({ ...prev, nickname: msg }));
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, nickname: true }));
                  const msg = validateField('nickname');
                  setErrors(prev => ({ ...prev, nickname: msg }));
                }}
              />
              {errors.nickname && touched.nickname ? (
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
                  const msg = validateField('address', text);
                  setErrors(prev => ({ ...prev, address: msg }));
                }}
                onBlur={() => {
                  setTouched(prev => ({ ...prev, address: true }));
                  const msg = validateField('address');
                  setErrors(prev => ({ ...prev, address: msg }));
                }}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors.address && touched.address ? (
                <Text className="text-red-500 text-xs mt-1">{errors.address}</Text>
              ) : null}
            </View>

            {/* Auto-verify Toggle */}
            <View className="mt-2">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => {
                  const next = !autoVerify;
                  setAutoVerify(next);
                  setTouched(prev => ({ ...prev, autoVerify: true }));
                  const msg = validateField('autoVerify', next);
                  setErrors(prev => ({ ...prev, autoVerify: msg }));
                }}
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
              {errors.autoVerify && touched.autoVerify ? (
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
              onPress={() => {
                setTouched(prev => ({ ...prev, provider: true }));
                const msg = validateField('provider');
                setErrors(prev => ({ ...prev, provider: msg }));
                setShowProviderModal(false);
              }}
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

            {/* Footer */}
            <TouchableOpacity
              className="py-4"
              onPress={handleSuccessContinue}
            >
              <Text className="text-center text-[#00ff88] font-semibold">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a3333] rounded-2xl w-full max-w-sm overflow-hidden border border-red-500/30">
            {/* Header */}
            <View className="items-center p-6">
              <View className="bg-red-500 rounded-full p-3 mb-4">
                <Ionicons name="warning" size={32} color="#fff" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">Error</Text>
              <Text className="text-gray-300 text-center">
                {errorMessage}
              </Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-[#2a4444] w-full" />

            {/* Footer */}
            <TouchableOpacity
              className="py-4"
              onPress={() => setShowErrorModal(false)}
            >
              <Text className="text-center text-red-500 font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a3333] rounded-2xl w-full max-w-sm overflow-hidden border border-red-500/30">
            {/* Header */}
            <View className="items-center p-6">
              <View className="bg-red-500 rounded-full p-3 mb-4">
                <Ionicons name="warning" size={32} color="#fff" />
              </View>
              <Text className="text-white text-xl font-bold mb-2">Error</Text>
              <Text className="text-gray-300 text-center">
                {errorMessage}
              </Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-[#2a4444] w-full" />

            {/* Footer */}
            <TouchableOpacity
              className="py-4"
              onPress={() => setShowErrorModal(false)}
            >
              <Text className="text-center text-red-500 font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddUtility;