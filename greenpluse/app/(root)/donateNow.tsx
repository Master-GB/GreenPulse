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
    <View className="flex-1 bg-[#122119] pt-1">
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#122119"
        translucent={false}
      />
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: '#122119' }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 120,
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
              selectedOption === "auto"
                ? "border-emerald-500 bg-[#1C3528]"
                : "border-gray-600 bg-transparent"
            }`}
            onPress={() => setSelectedOption("auto")}
          >
            <View className="flex-row items-start gap-3">
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center mt-1 ${
                  selectedOption === "auto"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-500 bg-transparent"
                }`}
              >
                {selectedOption === "auto" && (
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
              selectedOption === "manual"
                ? "border-emerald-500 bg-[#1C3528]"
                : "border-gray-600 bg-transparent"
            }`}
            onPress={() => setSelectedOption("manual")}
          >
            <View className="flex-row items-center gap-3">
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedOption === "manual"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-gray-500 bg-transparent"
                }`}
              >
                {selectedOption === "manual" && (
                  <View className="w-3 h-3 rounded-full bg-white" />
                )}
              </View>
              <Text className="text-white text-lg font-bold">
                Choose Beneficiary
              </Text>
            </View>
          </TouchableOpacity>

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
