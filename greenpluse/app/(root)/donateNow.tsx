import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Animated,
  Easing,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Coins,
  Search,
  Check,
  Lightbulb,
  Users,
  Shuffle,
  UserPlus,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { images } from '@/constants/images'

export default function DonateNow() {
  const [coinAmount, setCoinAmount] = useState(10);
  const [selectedOption, setSelectedOption] = useState<"auto" | "manual">(
    "auto"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Radiating halo glow
  const [glowAnim] = useState(new Animated.Value(0));

  const [confettiAnims] = useState(() =>
    Array.from({ length: 30 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  );

  useEffect(() => {
    if (showSuccessModal) {
      // Radiating halo loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Confetti animation
      confettiAnims.forEach((anim, index) => {
        const delay = index * 50;
        const randomX = (Math.random() - 0.5) * 400;
        const randomRotation = Math.random() * 720;

        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: 600,
            duration: 3000,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: randomX,
            duration: 3000,
            delay,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: randomRotation,
            duration: 3000,
            delay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 3000,
            delay,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Reset animations
      glowAnim.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    }
  }, [showSuccessModal]);

  const handleSliderChange = (value: number) => {
    setCoinAmount(Math.round(value));
  };

  const handleDonateNow = () => {
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <View className="flex-1 bg-[#122119]">
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#122119"
        translucent={false}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingLeft: 15,
          paddingRight: 15,
          paddingBottom: 120,
          paddingTop :1
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Donation Amount Section */}
        <View className="rounded px-6 py-4 border border-[#2a4a3a]  mx-1">
          <View className="flex-row items-center mb-[-7px] ml-[-15px]">
            <Coins size={24} color="#2ECC71" className="mr-2" />
            <Text className="text-white text-xl font-bold ml-2">Choose Amount to Donate</Text>
          </View>

          {/* Amount Display with +/- buttons */}
          <View className="flex-row items-center justify-center  mt-2">
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
              onPress={() => setCoinAmount(Math.min(1000, coinAmount + 1))}
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
              <View
                className="absolute"
                style={{
                  left: `${((coinAmount - 1) / 999) * 100}%`,
                  transform: [{ translateX: -12 }],
                }}
              >
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
                  width: "100%",
                  height: 40,
                  opacity: 0.01,
                  position: "absolute",
                  top: -4,
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
            You are donating{" "}
            <Text className="text-[#2ECC71] font-bold">{coinAmount} Coin</Text>
          </Text>
        </View>

        {/* Beneficiary Type Section */}
        <View className="rounded px-6 py-4 border border-[#2a4a3a]  mx-1 mb-6">
          <View className="flex-row items-center mb-4 ml-[-15px]">
            <Users size={24} color="#2ECC71" className="mr-3" />
            <Text className="text-white text-xl font-bold ml-2">Choose Beneficiary Type</Text>
          </View>

          <View className="space-y-4">
            {/* Auto Donation Option */}
            <TouchableOpacity 
              className={`mb-3 px-4 py-2 rounded-xl border-2 ${
                selectedOption === 'auto' 
                  ? 'border-[#2ECC71] bg-[#1e3a3a]' 
                  : 'border-[#2d4a4a]'
              }`}
              onPress={() => setSelectedOption('auto')}
            >
              <View className="flex-row items-center">
                <View className="mr-3 p-2 bg-[#2d4a4a] rounded-lg">
                  <Shuffle size={20} color="#2ECC71" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">Auto Donate</Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    Let us distribute your donation optimally
                  </Text>
                </View>
                {selectedOption === 'auto' && (
                  <View className="w-6 h-6 rounded-full bg-[#2ECC71] items-center justify-center">
                    <Check size={16} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {/* Manual Donation Option */}
            <TouchableOpacity 
              className={`px-4 py-4 rounded-xl border-2 ${
                selectedOption === 'manual' 
                  ? 'border-[#2ECC71] bg-[#1e3a3a]' 
                  : 'border-[#2d4a4a]'
              }`}
              onPress={() => setSelectedOption('manual')}
            >
              <View className="flex-row items-center">
                <View className="mr-3 p-2 bg-[#2d4a4a] rounded-lg">
                  <UserPlus size={20} color="#2ECC71" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base">Choose Manually</Text>
                  <Text className="text-gray-400 text-sm mt-1">
                    Select specific beneficiaries
                  </Text>
                </View>
                {selectedOption === 'manual' && (
                  <View className="w-6 h-6 rounded-full bg-[#2ECC71] items-center justify-center">
                    <Check size={16} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Input (shown when manual is selected) */}
          {selectedOption === "manual" && (
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

        {/* Horizontal Divider */}
        <View className="h-[2px] bg-gray-700 my-4 mx-1 mt-[-8px]">
          <View className="h-[1px] bg-[#2a4a3a] w-full" />
        </View>

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
              <Text className="text-emerald-500 font-bold text-base">No fees</Text>
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
              <Text className="text-white font-bold text-l">5 householders</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Donate Now Button */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4">
        <TouchableOpacity
          className="bg-[#2ECC71] rounded-full py-4"
          onPress={handleDonateNow}
        >
          <Text className="text-center text-black font-bold text-xl">
            Donate Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
      >
        <View className="flex-1">
          {/* StatusBar for the modal */}
          <StatusBar 
            barStyle="light-content"
            backgroundColor="transparent"
            translucent={true}
          />
          {/* Full-screen overlay with status bar color */}
          <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#122119] opacity-90" />
          <View className="flex-1 justify-center items-center">
          {/* Confetti */}
          {confettiAnims.map((anim, index) => {
            const colors = [
              "#2ECC71",
              "#fbbf24",
              "#ef4444",
              "#3b82f6",
              "#a855f7",
              "#ec4899",
            ];
            const color = colors[index % colors.length];
            const size = Math.random() * 8 + 4;
            const startX = Math.random() * 400 - 200;

            return (
              <Animated.View
                key={index}
                style={{
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  width: size,
                  height: size,
                  backgroundColor: color,
                  borderRadius: size / 2,
                  transform: [
                    { translateX: startX },
                    { translateY: anim.translateY },
                    { translateX: anim.translateX },
                    {
                      rotate: anim.rotate.interpolate({
                        inputRange: [0, 720],
                        outputRange: ["0deg", "720deg"],
                      }),
                    },
                  ],
                  opacity: anim.opacity,
                }}
              />
            );
          })}

          <View className="bg-[#1a2e2e] rounded-3xl p-8 mx-8 items-center w-[85%]">
            {/* Success Icon */}
            <View className="w-24 h-24 rounded-full bg-[#2ECC71] items-center justify-center mb-6">
              <Check size={48} color="white" strokeWidth={4} />
            </View>

            {/* Thank You Text */}
            <Text className="text-white text-3xl font-bold mb-1 text-center">
              Thank You, Gihan !
            </Text>

            {/* Success Message */}
            <Text className="text-gray-300 text-base text-center mb-1 leading-6">
              Your donation is helping 5 families today.
            </Text>

            {/* Radiating Light Bulb */}
            <View className="mb-6 items-center justify-center">
              <Animated.View
                style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: "#fbbf24",
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 0],
                  }),
                  transform: [
                    {
                      scale: glowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                }}
              />
               <Image source={images.build}  className="size-14" />
            </View>

            {/* Done Button */}
            <TouchableOpacity
              className="bg-[#2ECC71] rounded-full py-3 px-10 w-full"
              onPress={handleCloseModal}
            >
              <Text className="text-center text-black font-bold text-xl">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </Modal>
    </View>
  );
}
