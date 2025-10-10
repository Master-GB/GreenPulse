import React, { useState, useEffect, useMemo } from "react";
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
  Image,
  ActivityIndicator,
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
  Zap,
  Home,
  X,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { images } from "@/constants/images";
import {
  arrayUnion,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  increment,
  getDocs,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { useAuth } from "@/contexts/AuthContext";
import { deleteDoc } from "firebase/firestore";

// Constants
const COLORS = {
  primary: "#2ECC71",
  primaryDark: "#27AE60",
  background: "#122119",
  cardBg: "#1a2e2e",
  border: "#2a4a3a",
  borderActive: "#2ECC71",
  textPrimary: "#FFFFFF",
  textSecondary: "#9CA3AF",
  success: "#2ECC71",
  warning: "#fbbf24",
  accent: "#A6FACF",
};

const ANIMATION = {
  confettiDuration: 3000,
  glowDuration: 1500,
  confettiCount: 20, // Reduced from 30 for performance
};

// Initialize with default values, will be updated when availableCoins loads
const COIN_LIMITS = {
  min: 0, // Allow 0 as minimum
  max: 1000, // This will be updated with availableCoins
};

// Types
interface UserData {
  id: string;
  email?: string;
  displayName?: string;
  location?: string;
  [key: string]: any;
}

interface Beneficiary {
  id: string;
  name: string;
  email: string;
  location: string;
  needsKWh: number;
}

interface DonationImpact {
  kWh: number;
  families: number;
  avgCost: number;
}

// Mock beneficiaries data
const mockBeneficiaries: Beneficiary[] = [
  {
    id: "1",
    name: "Silva Family",
    email: "silva@example.com",
    location: "Colombo",
    needsKWh: 50,
  },
  {
    id: "2",
    name: "Perera Household",
    email: "perera@example.com",
    location: "Kandy",
    needsKWh: 75,
  },
  {
    id: "3",
    name: "Fernando Family",
    email: "fernando@example.com",
    location: "Galle",
    needsKWh: 60,
  },
  {
    id: "4",
    name: "Dias Community",
    email: "dias@example.com",
    location: "Jaffna",
    needsKWh: 100,
  },
  {
    id: "5",
    name: "Gunasekara Home",
    email: "gunasekara@example.com",
    location: "Negombo",
    needsKWh: 45,
  },
];

// Custom Hook for Donation Calculations
const useDonationImpact = (coinAmount: number): DonationImpact => {
  return useMemo(() => {
    const kWh = coinAmount * 1; // 1 coin = 1 kWh
    // Calculate families: 1-50kWh = 1 family, 51-100kWh = 2 families, etc.
    const families = kWh > 0 ? Math.max(1, Math.ceil(kWh / 50)) : 0;
    const avgCost = coinAmount * 23.38; // 1 coin = RS 23.38
    return { kWh, families, avgCost };
  }, [coinAmount]);
};

// Custom Hook for Confetti Animation
const useConfettiAnimation = (showModal: boolean) => {
  const [confettiAnims] = useState(() =>
    Array.from({ length: ANIMATION.confettiCount }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  );

  useEffect(() => {
    if (showModal) {
      confettiAnims.forEach((anim, index) => {
        const delay = index * 50;
        const randomX = (Math.random() - 0.5) * 400;
        const randomRotation = Math.random() * 720;

        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: 600,
            duration: ANIMATION.confettiDuration,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: randomX,
            duration: ANIMATION.confettiDuration,
            delay,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: randomRotation,
            duration: ANIMATION.confettiDuration,
            delay,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: ANIMATION.confettiDuration,
            delay,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    }
  }, [showModal]);

  return confettiAnims;
};

// Subcomponents
interface DonationAmountCardProps {
  coinAmount: number;
  setCoinAmount: (amount: number) => void;
  impact: DonationImpact;
}

const DonationAmountCard: React.FC<DonationAmountCardProps> = ({
  coinAmount,
  setCoinAmount,
  impact,
}) => {
  const { user } = useAuth();
  const [availableCoins, setAvailableCoins] = useState(0);

  // Load user's available coins and update COIN_LIMITS
  useEffect(() => {
    const loadUserCoins = async () => {
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
        
        const roundedCoins = Math.round(totalCoins);
        setAvailableCoins(roundedCoins);
        
        // Update COIN_LIMITS with the actual available coins
        COIN_LIMITS.max = roundedCoins; // Set max to actual available coins (can be 0)
        
        // If current selection is more than the new max, adjust it
        if (coinAmount > COIN_LIMITS.max) {
          setCoinAmount(COIN_LIMITS.max);
        }
      } catch (error) {
        console.error('Error loading user coins:', error);
      }
    };

    loadUserCoins();
  }, [user, coinAmount]);

  const handleSliderChange = (value: number) => {
    setCoinAmount(Math.round(value));
  };

  // Calculate percentage for progress bar with animation
  const progressPercentage = Math.min((availableCoins / 1000) * 100, 100);
  const [animatedWidth] = useState(new Animated.Value(progressPercentage));
  
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progressPercentage,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage]);

  return (
    <View className="mx-1 mb-5">
      {/* Available Balance Card - Enhanced */}
      <View className="rounded-2xl p-5 mb-4 overflow-hidden">
        {/* Background Gradient */}
        <View className="absolute inset-0 bg-gradient-to-br from-[#1a2e2e] to-[#1a3a3a] opacity-90" />
        
        {/* Decorative Elements */}
        <View className="absolute -right-10 -top-10 w-32 h-32 bg-[#2ECC71]/10 rounded-full" />
        <View className="absolute -left-5 -bottom-5 w-24 h-24 bg-[#2ECC71]/5 rounded-full" />
        
        <View className="relative z-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="bg-[#2ECC71]/20 p-2 rounded-lg">
                <Coins size={20} color={COLORS.primary} />
              </View>
              <Text className="text-white font-semibold text-lg ml-3">Your Balance</Text>
            </View>
            <View className="bg-white/5 px-3 py-1 rounded-full">
              <Text className="text-[#2ECC99] text-xs font-medium">Active</Text>
            </View>
          </View>
          
          {/* Balance Display */}
          <View className="mb-4">
            <View className="flex-row items-end">
              <Text className="text-white text-4xl font-bold">{availableCoins}</Text>
              <Text className="text-[#2ECC99] text-lg font-medium mb-1 ml-2">coins</Text>
            </View>
            <Text className="text-gray-300 text-sm mt-1">
              ≈ {availableCoins} kWh • 1 coin = 1 kWh
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View className="mb-1">
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-gray-300">Your balance</Text>
              <Text className="text-xs font-medium text-[#2ECC99]">{Math.round(progressPercentage)}%</Text>
            </View>
            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
              <Animated.View 
                style={{
                  height: '100%',
                  width: animatedWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: COLORS.primary,
                  borderRadius: 8,
                }}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Donation Amount Card */}
      <View className="rounded-xl px-6 py-6 border-2 border-[#2a4a3a] bg-[#1a2e2e]/30">
        <View className="mb-4">
          <Text className="text-white text-xl font-bold">
            Choose Amount to Donate
          </Text>
        </View>

        {/* Amount Display */}
        <View className="flex-row items-center justify-center mb-1">
          <TouchableOpacity
            className={`rounded-full w-14 h-14 items-center justify-center shadow-lg ${coinAmount <= COIN_LIMITS.min ? 'bg-gray-400' : 'bg-white'}`}
            onPress={() =>
              setCoinAmount(Math.max(COIN_LIMITS.min, coinAmount - 1))
            }
            disabled={coinAmount <= COIN_LIMITS.min}
          >
            <Text className="text-[#1a2e2e] text-2xl font-bold">−</Text>
          </TouchableOpacity>

          <View className="mx-8 items-center">
            <Text className="text-[#2ECC71] text-6xl font-bold">
              {coinAmount}
            </Text>
            <Text className="text-gray-400 text-base mt-1">Coins</Text>
          </View>

          <TouchableOpacity
            className={`rounded-full w-14 h-14 items-center justify-center shadow-lg ${coinAmount >= COIN_LIMITS.max ? 'bg-gray-400' : 'bg-white'}`}
            onPress={() =>
              setCoinAmount(Math.min(COIN_LIMITS.max, coinAmount + 1))
            }
            disabled={coinAmount >= COIN_LIMITS.max}
          >
            <Text className="text-[#1a2e2e] text-2xl font-bold">+</Text>
          </TouchableOpacity>
        </View>

        {/* Slider */}
        <View className="px-1">
          <View className="relative h-12 flex justify-center">
            <View className="absolute left-0 right-0 h-2 bg-[#374151] rounded-full" />
            <View
              className="absolute left-0 h-2 bg-[#2ECC71] rounded-full"
              style={{
                width: `${((coinAmount - COIN_LIMITS.min) / (COIN_LIMITS.max - COIN_LIMITS.min)) * 100}%`,
              }}
            />
            <View
              className="absolute"
              style={{
                left: `${((coinAmount - COIN_LIMITS.min) / (COIN_LIMITS.max - COIN_LIMITS.min)) * 100}%`,
                transform: [{ translateX: -12 }],
              }}
            >
              <View className="w-6 h-6 rounded-full bg-[#2ECC71] border-4 border-white shadow-lg" />
            </View>
            <Slider
              minimumValue={COIN_LIMITS.min}
              maximumValue={COIN_LIMITS.max}
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
              }}
            />
          </View>
        </View>

        {/* Slider Labels */}
        <View className="flex-row justify-between px-1 mb-4">
          <Text className="text-gray-400 text-sm">{COIN_LIMITS.min}</Text>
          <Text className="text-gray-400 text-sm">{coinAmount}</Text>
        </View>

        {/* Impact Preview */}
        <View className="bg-[#1e3a3a] rounded-lg p-4 border border-[#2a4a3a]">
          <Text className="text-center text-gray-300 text-base mb-3">
            Your Impact
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Zap size={20} color={COLORS.warning} />
              <Text className="text-white font-bold text-lg mt-1">
                {impact.kWh} kWh
              </Text>
              <Text className="text-gray-400 text-xs">Energy</Text>
            </View>
            <View className="items-center">
              <Home size={20} color={COLORS.primary} />
              <Text className="text-white font-bold text-lg mt-1">
                {impact.families}
              </Text>
              <Text className="text-gray-400 text-xs">Families</Text>
            </View>
            <View className="items-center">
              <Coins size={20} color={COLORS.accent} />
              <Text className="text-white font-bold text-lg mt-1">
                RS {impact.avgCost.toFixed(2)}
              </Text>
              <Text className="text-gray-400 text-xs">Value</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

interface BeneficiaryTypeCardProps {
  selectedOption: "auto" | "manual";
  setSelectedOption: (option: "auto" | "manual") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredBeneficiaries: Beneficiary[];
  selectedBeneficiary: Beneficiary | null;
  setSelectedBeneficiary: (beneficiary: Beneficiary | null) => void;
}

const BeneficiaryTypeCard: React.FC<BeneficiaryTypeCardProps> = ({
  selectedOption,
  setSelectedOption,
  searchQuery,
  setSearchQuery,
  filteredBeneficiaries,
  selectedBeneficiary,
  setSelectedBeneficiary,
}) => {
  const handleBeneficiarySelect = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setSearchQuery(""); // Clear search query to show selected beneficiary
  };
  return (
    <View className="rounded-xl px-6 py-6 border-2 border-[#2a4a3a] mx-1 mb-5 bg-[#1a2e2e]/30">
      <View className="mb-5">
        <Text className="text-white text-xl font-bold">
          Choose Beneficiary Type
        </Text>
      </View>

      <View className="space-y-4">
        {/* Auto Donation Option */}
        <TouchableOpacity
          className={`mb-3 px-4 py-4 rounded-xl border-2 ${
            selectedOption === "auto"
              ? "border-[#2ECC71] bg-[#1e3a3a]"
              : "border-[#2d4a4a]"
          }`}
          onPress={() => setSelectedOption("auto")}
        >
          <View className="flex-row items-center">
            <View className="mr-3 p-2 bg-[#2d4a4a] rounded-lg">
              <Shuffle size={22} color={COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">
                Auto Donate
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                AI-powered optimal distribution
              </Text>
            </View>
            {selectedOption === "auto" && (
              <View className="w-6 h-6 rounded-full bg-[#2ECC71] items-center justify-center">
                <Check size={16} color="white" strokeWidth={3} />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Manual Donation Option */}
        <TouchableOpacity
          className={`px-4 py-4 rounded-xl border-2 ${
            selectedOption === "manual"
              ? "border-[#2ECC71] bg-[#1e3a3a]"
              : "border-[#2d4a4a]"
          }`}
          onPress={() => setSelectedOption("manual")}
        >
          <View className="flex-row items-center">
            <View className="mr-3 p-2 bg-[#2d4a4a] rounded-lg">
              <UserPlus size={22} color={COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">
                Choose Manually
              </Text>
              <Text className="text-gray-400 text-sm mt-1">
                Select specific beneficiaries
              </Text>
            </View>
            {selectedOption === "manual" && (
              <View className="w-6 h-6 rounded-full bg-[#2ECC71] items-center justify-center">
                <Check size={16} color="white" strokeWidth={3} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Input & Results */}
      {selectedOption === "manual" && (
        <View className="mt-3">
          <View className="bg-[#eaf1ed90] rounded-3xl flex-row items-center px-4 py-1 mb-3 ">
            <Search size={20} color="#1a2e2e" />
            <TextInput
              className="flex-1 ml-3 text-[#131e1e] text-base"
              placeholder="Search by name or email..."
              placeholderTextColor="#2a4a3a"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X size={20} color="#1a2e2e" />
              </TouchableOpacity>
            )}
          </View>

          {/* Beneficiary Results */}
          {searchQuery.length > 0 && (
            <View className="bg-[#1e3a3a] rounded-xl border border-[#2a4a3a] max-h-48">
              <ScrollView showsVerticalScrollIndicator={false}>
                {filteredBeneficiaries.length > 0 ? (
                  filteredBeneficiaries.map((beneficiary: Beneficiary) => (
                    <TouchableOpacity
                      key={beneficiary.id}
                      className={`px-4 py-3 border-b border-[#2a4a3a] ${
                        selectedBeneficiary?.id === beneficiary.id
                          ? "bg-[#2a4a3a]"
                          : ""
                      }`}
                      onPress={() => handleBeneficiarySelect(beneficiary)}
                    >
                      <View className="flex-row items-center justify-between w-full">
                        <View className="flex-1">
                          <Text className="text-white font-semibold text-base">
                            {beneficiary.name}
                          </Text>
                          <Text className="text-gray-400 text-sm">
                            {beneficiary.email}
                          </Text>
                        </View>
                        {selectedBeneficiary?.id === beneficiary.id && (
                          <Check
                            size={20}
                            color={COLORS.primary}
                            strokeWidth={3}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View className="px-4 py-6 items-center">
                    <Text className="text-gray-400 text-base">
                      No beneficiaries found
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* Selected Beneficiary Display */}
          {selectedBeneficiary && (
            <View className="bg-[#1e3a3a] rounded-xl border-2 border-[#2ECC71] px-4 py-3 mt-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-[#2ECC71] text-xs font-semibold mb-1">
                    SELECTED BENEFICIARY
                  </Text>
                  <View className="flex-row items-center">
                    <View className="bg-[#2d4a4a] w-10 h-10 rounded-full items-center justify-center mr-3 ">
                      <UserPlus size={18} color={COLORS.primary} />
                    </View>
                    <View>
                      <Text className="text-white font-semibold text-base">
                        {selectedBeneficiary.name}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {selectedBeneficiary.email}
                      </Text>
                    </View>
                  </View>
                  <View className="ml-12 mt-2 flex-row items-center">
                    <View className="bg-[#2a4a3a] px-2 py-1 rounded">
                      <Text className="text-[#2ECC71] text-xs">
                        {selectedBeneficiary.location}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedBeneficiary(null)}
                  className="ml-2 p-1"
                >
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

interface ConversationInfoCardProps {
  impact: DonationImpact;
}

const ConversationInfoCard: React.FC<ConversationInfoCardProps> = ({
  impact,
}) => {
  return (
    <View className="mx-1">
      <Text className="text-white text-xl font-bold mb-4">
        Donation Transparency
      </Text>

      <View className="bg-[#1a2e2e]/30 rounded-xl border border-[#2a4a3a] px-5 py-4 mb-[-12px]">
        <View className="space-y-3">
          <View className="flex-row justify-between items-center py-2 border-b border-[#2a4a3a]/50">
            <Text className="text-gray-300 text-base flex-1">
              Platform fees
            </Text>
            <Text className="text-emerald-400 font-bold text-base">
              No fees
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-2 border-b border-[#2a4a3a]/50">
            <Text className="text-gray-300 text-base flex-1">
              Average donation size
            </Text>
            <Text className="text-white font-semibold text-base">
              {impact.kWh} kWh
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-2 border-b border-[#2a4a3a]/50">
            <Text className="text-gray-300 text-base flex-1">
              Average donation value
            </Text>
            <Text className="text-white font-semibold text-base">
              RS {impact.avgCost.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-2">
            <Text className="text-gray-300 text-base flex-1">
              Community impact
            </Text>
            <Text className="text-white font-semibold text-base">
              {impact.families} householders
            </Text>
          </View>
        </View>

        <View className="mt-4 pt-4 border-t-2 border-[#2ECC71]/30">
          <Text className="text-[#2ECC71] font-bold text-center text-base">
            100% of your donation reaches beneficiaries
          </Text>
        </View>
      </View>
    </View>
  );
};

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  coinAmount: number;
  impact: DonationImpact;
  confettiAnims: Array<{
    translateY: Animated.Value;
    translateX: Animated.Value;
    rotate: Animated.Value;
    opacity: Animated.Value;
  }>;
  glowAnim: Animated.Value;
  userName?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  coinAmount,
  impact,
  confettiAnims,
  glowAnim,
  userName = "Friend",
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View className="flex-1">
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
        />
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-[#122119] opacity-95" />
        <View className="flex-1 justify-center items-center px-6">
          {/* Confetti */}
          {confettiAnims.map((anim: any, index: number) => {
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

          <View className="bg-[#1a2e2e] rounded-3xl p-8 w-full max-w-sm items-center border-2 border-[#2a4a3a]">
            {/* Success Icon */}
            <View className="w-24 h-24 rounded-full bg-[#2ECC71] items-center justify-center mb-6 shadow-lg">
              <Check size={48} color="white" strokeWidth={4} />
            </View>

            {/* Thank You Text */}
            <Text className="text-white text-3xl font-bold mb-2 text-center">
              Thank You, {userName}!
            </Text>

            {/* Success Message */}
            <Text className="text-gray-300 text-base text-center mb-2 leading-6">
              Your donation of{" "}
              <Text className="text-[#2ECC71] font-bold">
                {coinAmount} coins
              </Text>{" "}
              is helping{" "}
              <Text className="text-[#2ECC71] font-bold">
                {impact.families} families
              </Text>{" "}
              today.
            </Text>

            {/* Impact Stats */}
            <View className="bg-[#0f1f1f] rounded-xl p-4 w-full mb-6 border border-[#2a4a3a]">
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Zap size={24} color={COLORS.warning} />
                  <Text className="text-white font-bold text-lg mt-1">
                    {impact.kWh} kWh
                  </Text>
                  <Text className="text-gray-400 text-xs">Donated</Text>
                </View>
                <View className="w-px bg-[#2a4a3a]" />
                <View className="items-center">
                  <Home size={24} color={COLORS.primary} />
                  <Text className="text-white font-bold text-lg mt-1">
                    {impact.families}
                  </Text>
                  <Text className="text-gray-400 text-xs">Families</Text>
                </View>
              </View>
            </View>

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
              <Lightbulb
                size={56}
                color={COLORS.warning}
                fill={COLORS.warning}
              />
            </View>

            {/* Done Button */}
            <TouchableOpacity
              className="bg-[#2ECC71] rounded-full py-4 px-10 w-full shadow-lg"
              onPress={onClose}
            >
              <Text className="text-center text-black font-bold text-xl">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Component
export default function DonateNow() {
  const [coinAmount, setCoinAmount] = useState(0);
  const [availableCoins, setAvailableCoins] = useState(0);
  const [selectedOption, setSelectedOption] = useState<"auto" | "manual">("auto");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<Beneficiary[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const { user } = useAuth();

  // Fetch all users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'AllUsers');
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs
          .filter(doc => doc.id !== user?.uid) // Exclude current user
          .map(doc => ({
            id: doc.id,
            name: doc.data().displayName || 'Anonymous',
            email: doc.data().email || '',
            location: doc.data().location || 'Unknown',
            needsKWh: Math.floor(Math.random() * 100) + 1, // Random kWh needs for demo
          }));
        setAllUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user?.uid]);

  // Custom hooks
  const impact = useDonationImpact(coinAmount);
  const confettiAnims = useConfettiAnimation(showSuccessModal);
  const [glowAnim] = useState(new Animated.Value(0));

  // Filter beneficiaries based on search
  const filteredBeneficiaries = useMemo(() => {
    if (isLoadingUsers) return [];
    if (!searchQuery) return allUsers;
    
    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.location.toLowerCase().includes(query)
    );
  }, [searchQuery, allUsers, isLoadingUsers]);

  // Glow animation for success modal
  useEffect(() => {
    if (showSuccessModal) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: ANIMATION.glowDuration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [showSuccessModal]);

  const handleDonateNow = async () => {
    // Validation
    if (selectedOption === "manual" && !selectedBeneficiary) {
      // In real app, show error toast
      return;
    }

    setIsLoading(true);
    try {
      // Prepare donation payload
      const donationRef = doc(collection(db, "donations"));
      const donationPayload = {
        donationId: donationRef.id,
        userId: user?.uid ?? null,
        userEmail: user?.email ?? null,
        amountCoins: coinAmount,
        beneficiaryType: selectedOption,
        beneficiaryId: selectedOption === "manual" ? selectedBeneficiary?.id ?? null : null,
        beneficiaryName: selectedOption === "manual" ? selectedBeneficiary?.name ?? null : null,
        beneficiaryEmail: selectedOption === "manual" ? selectedBeneficiary?.email ?? null : null,
        status: 'completed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Persist to Firestore
      // 1. Save to donations collection (existing functionality)
      await setDoc(donationRef, donationPayload);
      
      // 2. Update community goals (existing functionality)
      const communityGoalRef = doc(db, "communityGoal", "totalDonations");
      const fieldToUpdate = selectedOption === "manual" ? "manualCoins" : "autoCoins";
      await setDoc(
        communityGoalRef,
        {
          [fieldToUpdate]: increment(coinAmount),
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      // 3. Handle distribution based on donation type
      if (selectedOption === "manual" && selectedBeneficiary?.id) {
        // Manual donation - credit to selected beneficiary
        const beneficiaryRef = doc(db, "totalCredits", selectedBeneficiary.id);
        const donationRecord = {
          amount: coinAmount,
          timestamp: new Date().toISOString(),
          fromUserId: user?.uid,
          fromUserEmail: user?.email,
          type: 'manual'
        };

        await setDoc(
          beneficiaryRef,
          {
            userId: selectedBeneficiary.id,
            email: selectedBeneficiary.email,
            name: selectedBeneficiary.name,
            totalReceived: increment(coinAmount),
            lastDonation: donationRecord,
            donationHistory: arrayUnion(donationRecord),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else if (selectedOption === "auto" && user?.uid) {
        // Auto distribution logic
        
        // 1. Get all users except the donor
        const usersSnapshot = await getDocs(collection(db, 'AllUsers'));
        const allUsers = usersSnapshot.docs
          .filter(doc => doc.id !== user.uid) // Exclude donor
          .map(doc => {
            const data = doc.data() as UserData;
            return {
              id: doc.id,
              email: data.email || 'no-email@example.com',
              displayName: data.displayName || 'Anonymous User',
              location: data.location || 'Unknown'
            };
          });
        
        if (allUsers.length > 0) {
          // 2. Get current credits for all users
          const userCredits = await Promise.all(
            allUsers.map(async (userData) => {
              const creditDoc = await getDoc(doc(db, 'totalCredits', userData.id));
              return {
                userId: userData.id,
                email: userData.email,
                name: userData.displayName,
                currentCredits: creditDoc.exists() ? (creditDoc.data()?.totalReceived || 0) : 0
              };
            })
          );
          
          // 3. Sort users by current credits (ascending)
          const sortedUsers = [...userCredits].sort((a, b) => a.currentCredits - b.currentCredits);
          
          // 4. Calculate fair distribution with priority to users with fewer credits
          const totalUsers = sortedUsers.length;
          
          // Initialize distribution array
          const distribution: Array<{
            userId: string;
            amount: number;
            timestamp: string;
          }> = [];
          
          // Calculate total credits and find the minimum credit
          let minCredits = sortedUsers[0]?.currentCredits || 0;
          let totalCredits = 0;
          
          // First, calculate total credits and find the minimum
          for (const user of sortedUsers) {
            totalCredits += user.currentCredits;
            if (user.currentCredits < minCredits) {
              minCredits = user.currentCredits;
            }
          }
          
          // Calculate base amount and remainder
          const baseAmount = Math.floor(coinAmount / totalUsers);
          let remainingCoins = coinAmount % totalUsers;
          
          // Distribute coins with priority to users with fewer credits
          for (let i = 0; i < totalUsers; i++) {
            const user = sortedUsers[i];
            let amount = baseAmount;
            
            // Add extra coin to users with lower credits first
            if (i < remainingCoins) {
              amount += 1;
            }
            
            // Adjust amount based on user's current credits
            // Users with fewer credits get more coins
            const creditRatio = 1 - (user.currentCredits / (totalCredits + 1));
            const adjustedAmount = Math.ceil(amount * (1 + creditRatio * 0.5)); // Up to 1.5x more for users with 0 credits
            
            // Make sure we don't exceed remaining coins
            const finalAmount = Math.min(
              adjustedAmount, 
              coinAmount - distribution.reduce((sum: number, d: { amount: number }) => sum + d.amount, 0)
            );
            
            if (finalAmount > 0) {
              // Update user's total credits and add to history
              const donationRecord = {
                amount: finalAmount,
                timestamp: new Date().toISOString(),
                fromUserId: user.userId,
                fromUserEmail: user.email,
                type: 'auto' as const,
                donationId: donationRef.id
              };

              const userRef = doc(db, 'totalCredits', user.userId);
              await setDoc(userRef, 
                {
                  userId: user.userId,
                  email: user.email,
                  name: user.name,
                  totalReceived: increment(finalAmount),
                  lastUpdated: serverTimestamp(),
                  lastDonation: donationRecord,
                  donationHistory: arrayUnion(donationRecord)
                },
                { merge: true }
              );
              
              // Record in distribution
              distribution.push({
                userId: user.userId,
                amount: finalAmount,
                timestamp: new Date().toISOString()
              });
            }
          }
          
          // Record the fair distribution in FairlyDonated collection
          if (distribution.length > 0 && user) {
            const fairDonationRef = doc(collection(db, 'FairlyDonated'));
            const totalDistributed = distribution.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
            
            await setDoc(fairDonationRef, {
              donationId: donationRef.id,
              totalAmount: coinAmount,
              distributedAmount: totalDistributed,
              donorId: user.uid,
              donorEmail: user.email || '',
              distribution: distribution,
              timestamp: serverTimestamp()
            });
          }
        }
      }

      // Deduct coins from user's energy records
      if (user) {
        console.log(`Starting coin deduction. Total coins to deduct: ${coinAmount}`);
        
        // Get all energy records for the user
        const energyRecordsRef = collection(db, 'users', user.uid, 'energyRecords');
        const snapshot = await getDocs(energyRecordsRef);
        
        // Sort records by coinValue in descending order (highest first)
        const records = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            coinValue: Number(doc.data().coinValue) || 0
          }))
          .filter(record => record.coinValue > 0) // Only consider records with positive coin value
          .sort((a, b) => b.coinValue - a.coinValue);
        
        console.log(`Found ${records.length} energy records with coins`);
        
        let remainingCoins = coinAmount;
        const updates: Promise<void>[] = [];
        
        // Deduct coins from records until we've deducted the full amount or run out of coins
        for (const record of records) {
          if (remainingCoins <= 0) break;
          
          const deduction = Math.min(remainingCoins, record.coinValue);
          const newCoinValue = record.coinValue - deduction;
          
          const recordRef = doc(db, 'users', user.uid, 'energyRecords', record.id);
          
          if (newCoinValue > 0) {
            // Update the record with the new coin value
            updates.push(setDoc(recordRef, {
              ...record,
              coinValue: newCoinValue
            }, { merge: true }));
          } else {
            // If the record would have 0 coins, delete it
            updates.push(deleteDoc(recordRef));
          }
          
          remainingCoins -= deduction;
        }
        
        if (updates.length > 0) {
          console.log(`Updating ${updates.length} energy records`);
          await Promise.all(updates);
        }
        
        if (remainingCoins > 0) {
          console.warn(`Warning: Could not deduct all coins. ${remainingCoins} coins could not be deducted.`);
        } else {
          console.log('Successfully deducted coins from energy records');
        }
      }

      // Keep the same 1s UX feel
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reload user's coins to update the UI by re-fetching the data
      if (user?.uid) {
        const energyRecordsRef = collection(db, 'users', user.uid, 'energyRecords');
        const snapshot = await getDocs(energyRecordsRef);
        
        let totalCoins = 0;
        snapshot.forEach((doc) => {
          const coinValue = Number(doc.data()?.coinValue) || 0;
          totalCoins += coinValue;
        });
        
        const roundedCoins = Math.round(totalCoins);
        console.log(`Updated available coins: ${roundedCoins}`);
        setAvailableCoins(roundedCoins);
        COIN_LIMITS.max = roundedCoins;
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to store donation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    // Reset form
    setCoinAmount(0); // Reset to 0 instead of 1
    setSelectedOption("auto");
    setSearchQuery("");
    setSelectedBeneficiary(null);
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
          paddingHorizontal: 16,
          paddingBottom: 120,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Donation Amount Section */}
        <DonationAmountCard
          coinAmount={coinAmount}
          setCoinAmount={setCoinAmount}
          impact={impact}
        />

        {/* Beneficiary Type Section */}
        <BeneficiaryTypeCard
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredBeneficiaries={filteredBeneficiaries}
          selectedBeneficiary={selectedBeneficiary}
          setSelectedBeneficiary={setSelectedBeneficiary}
        />

        {/* Conversation Info */}
        <ConversationInfoCard impact={impact} />
      </ScrollView>

      {/* Fixed Donate Now Button with Background */}
      <View className="absolute bottom-0 left-0 right-0 ">
        <View className="h-32 bg-gradient-to-t from-[#122119] via-[#122119] via-90% to-transparent" />
        <View className="px-5 pb-6 pt-2 bg-[#122119]">
          <TouchableOpacity
            className={`w-80 ml-6 rounded-full py-4 shadow-lg ${
              isLoading 
                ? "bg-[#27AE60]" 
                : (selectedOption === "manual" && !selectedBeneficiary) || coinAmount === 0
                  ? "bg-[#4bdb8784]" 
                  : "bg-[#2ECC71]"
            }`}
            onPress={handleDonateNow}
            disabled={
              isLoading || 
              (selectedOption === "manual" && !selectedBeneficiary) ||
              coinAmount === 0
            }
          >
            {isLoading ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text className="text-center text-black font-bold text-xl">
                Donate Now
              </Text>
            )}
          </TouchableOpacity>
          {selectedOption === "manual" && !selectedBeneficiary && (
            <Text className="text-center text-red-800 text-sm mt-2">
              Please select a beneficiary
            </Text>
          )}
        </View>
      </View>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleCloseModal}
        coinAmount={coinAmount}
        impact={impact}
        confettiAnims={confettiAnims}
        glowAnim={glowAnim}
        userName={user?.displayName || user?.email?.split('@')[0] || 'there'}
      />
    </View>
  );
}
