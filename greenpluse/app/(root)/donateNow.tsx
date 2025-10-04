import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Coins, Search } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

export default function DonateNow() {
  const [coinAmount, setCoinAmount] = useState(10);
  const [selectedOption, setSelectedOption] = useState<'auto' | 'manual'>('auto');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSliderChange = (value: number) => {
    setCoinAmount(Math.round(value));
  };

  return (
    <View className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" />
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 120 
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {/* Choose Amount to Donate */}
        <View className="mt-[-3px] mb-3">
          <Text className="text-white text-xl font-bold mb-2">
            Choose Amount to Donate
          </Text>

          {/* Amount Display with +/- buttons */}
          <View className="flex-row items-center justify-center mb-2 mt-2">
            <TouchableOpacity
              className="bg-white rounded-full w-16 h-16 items-center justify-center"
              onPress={() => setCoinAmount(Math.max(1, coinAmount - 1))}
            >
              <Text className="text-[#1a2e2e] text-3xl font-bold">−</Text>
            </TouchableOpacity>

            <View className="mx-8 items-center">
              <Text className="text-[#2ECC71] text-6xl font-bold">
                {coinAmount}
              </Text>
              <Text className="text-gray-400 text-lg mt-1">Coin</Text>
            </View>

            <TouchableOpacity
              className="bg-white rounded-full w-16 h-16 items-center justify-center"
              onPress={() => setCoinAmount(Math.min(1000, coinAmount + 10))}
            >
              <Text className="text-[#1a2e2e] text-3xl font-bold">+</Text>
            </TouchableOpacity>
          </View>

          {/* Slider */}
          <View className="mb-[-3px] px-1 py-1">
            <View className="relative h-12 flex justify-center">
              {/* Track Background */}
              <View className="absolute left-0 right-0 h-2 bg-[#374151] rounded-full" />
              
              {/* Progress Fill */}
              <View 
                className="absolute left-0 h-2 bg-[#2ECC71] rounded-full" 
                style={{ width: `${((coinAmount - 1) / 999) * 100}%` }}
              />
              
              {/* Slider Thumb */}
              <View className="absolute" style={{ left: `${((coinAmount - 1) / 999) * 100}%`, transform: [{ translateX: -12 }] }}>
                <View className="w-6 h-6 rounded-full bg-[#2ECC71] border-2 border-white" />
              </View>
              
              {/* Hidden Slider for Touch Handling */}
              <Slider
                minimumValue={1}
                maximumValue={1000}
                step={1}
                value={coinAmount}
                onValueChange={handleSliderChange}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="transparent"
                style={{
                  width: '100%',
                  height: 40,
                  opacity: 0.01, // Make it invisible but still touchable
                  position: 'absolute',
                  top: -4, // Adjust to center the touch area
                }}
              />
            </View>
          </View>

          {/* Slider Labels */}
          <View className="flex-row justify-between px-1 mb-[-20px]">
            <Text className="text-gray-400 text-sm ml-1">1</Text>
            <Text className="text-gray-400 text-sm">1000</Text>
          </View>

          {/* Donation Amount Text */}
          <Text className="text-center text-gray-400 text-base">
            You are donating{' '}
            <Text className="text-[#2ECC71] font-bold">{coinAmount} Coin</Text>
          </Text>
        </View>

        {/* Horizontal Separator */}
        <View className="h-[1px] bg-gray-700 my-3 mx-1 mb-4" />

        {/* Choose Beneficiary Type */}
        <View className="mb-8">
          <Text className="text-white text-xl font-bold mb-3">
            Choose Beneficiary Type
          </Text>

          {/* Auto-Allocate Option */}
          <TouchableOpacity
            className={`border-2 rounded-3xl pt-2 pb-2 pl-3 pr-2 mb-4 ${
              selectedOption === 'auto'
                ? 'border-emerald-500 bg-[#1C3528]'
                : 'border-gray-600 bg-transparent'
            }`}
            onPress={() => setSelectedOption('auto')}
          >
            <View className="flex-row items-start gap-3">
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center mt-1 ${
                  selectedOption === 'auto'
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-500 bg-transparent'
                }`}
              >
                {selectedOption === 'auto' && (
                  <View className="w-3 h-3 rounded-full bg-white" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-white text-lg font-bold mb-1">
                  Auto-Allocate (Recommended)
                </Text>
                <Text className="text-gray-400 text-sm leading-5">
                  System will distribute fairly to the most vulnerable households
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Choose Beneficiary Option */}
          <TouchableOpacity
            className={`border-2 rounded-3xl pt-7 pb-7 pl-3 pr-2 ${
              selectedOption === 'manual'
                ? 'border-emerald-500 bg-[#1C3528]'
                : 'border-gray-600 bg-transparent'
            }`}
            onPress={() => setSelectedOption('manual')}
          >
            <View className="flex-row items-center gap-3">
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedOption === 'manual'
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-500 bg-transparent'
                }`}
              >
                {selectedOption === 'manual' && (
                  <View className="w-3 h-3 rounded-full bg-white" />
                )}
              </View>
              <Text className="text-white text-lg font-bold">
                Choose Beneficiary
              </Text>
            </View>
          </TouchableOpacity>

          {/* Search Input (shown when manual is selected) */}
          {selectedOption === 'manual' && (
            <View className="mt-4 bg-[#A6FACF] rounded-full flex-row items-center px-3 py-1">
              <Search size={24} color="#1a2e2e" />
              <TextInput
                className="flex-1 ml-3 text-[#1a2e2e] text-base"
                placeholder="Search for a mail......"
                placeholderTextColor="#2a4a3a"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}
        </View>

        {/* Horizontal Separator */}
        <View className="h-[1px] bg-gray-700 my-6 mx-1 mt-[-15px] mb-4" />

        {/* Conversation Info */}
        <View className="mb-[-30px]">
          <Text className="text-white text-xl font-bold mb-[7px]">
            Conversation Info
          </Text>

          <View className="space-y-1">
            <View className="flex-row justify-between items-center py-[-10px]">
              <Text className="text-gray-400 text-base">
                100% of your donation goes Beneficiary
              </Text>
              <Text className="text-emerald-500 font-bold text-base">
                No fees
              </Text>
            </View>

            <View className="flex-row justify-between items-center py-1">
              <Text className="text-gray-400 text-base">
                Average donation size
              </Text>
              <Text className="text-white font-bold text-l">10kWh</Text>
            </View>

            <View className="flex-row justify-between items-center py-1">
              <Text className="text-gray-400 text-base">
                Average amount of donation
              </Text>
              <Text className="text-white font-bold text-l">RS 1500</Text>
            </View>

            <View className="flex-row justify-between items-center py-1">
              <Text className="text-gray-400 text-base">
                Average community impact
              </Text>
              <Text className="text-white font-bold text-l">
                5 householders
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Donate Now Button */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 ">
        <TouchableOpacity className="bg-[#2ECC71] rounded-full py-4">
          <Text className="text-center text-black font-bold text-xl">
            Donate Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}