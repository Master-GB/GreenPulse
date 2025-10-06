import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { ArrowLeft, Calendar, Edit3, Paperclip } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import logoicon from "../../assets/images/GreenPluseLogo.png";

// Hide the default navigator header for this route
export const options = {
  headerShown: false,
};

const EditRecord = () => {
  const router = useRouter();
  const { recordId } = useLocalSearchParams();

  // TODO: Fetch actual record from Firebase using recordId
  // For now, using dummy data
  const [selectedPeriod, setSelectedPeriod] = useState<
    "Weekly" | "Monthly" | "Yearly"
  >("Monthly");
  const [kwhValue, setKwhValue] = useState("3320");
  const [dateTime, setDateTime] = useState("11/26/25 1:45PM");
  const [device, setDevice] = useState("Solar Panel");

  const handleUpdateRecord = () => {
    // TODO: Implement Firebase update logic here
    Alert.alert("Success", "Record updated successfully", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  const handleDateTimePicker = () => {
    // TODO: Implement date/time picker
    Alert.alert("Date & Time", "Date picker will be implemented");
  };

  const handleNotes = () => {
    // TODO: Implement notes functionality
    Alert.alert("Notes", "Notes functionality will be implemented");
  };

  const handleAttachImage = () => {
    // TODO: Implement image picker
    Alert.alert("Attach Image", "Image picker will be implemented");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a1410]">
      <StatusBar barStyle="light-content" backgroundColor="#0a1410" />
      <ScrollView className="flex-1 px-5 pt-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={28} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Edit Record</Text>
          <View className="w-10" />
        </View>

        {/* Logo */}
        <View className="flex-row items-center justify-center mb-6">
          <Text className="text-white text-3xl font-bold">GreenPulse</Text>
          <Image source={logoicon} className="w-32 h-32" />
        </View>

        {/* Period Selector */}
        <View className="flex-row gap-3 mb-6">
          {(["Weekly", "Monthly", "Yearly"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`px-6 py-3 rounded-full ${
                selectedPeriod === period
                  ? "bg-[#0fd56b]"
                  : "bg-transparent border-2 border-[#2a4a42]"
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedPeriod === period ? "text-black" : "text-white"
                }`}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Enter Value Field */}
        <View className="mb-6">
          <Text className="text-white text-base font-semibold mb-3">
            Enter Value (kWh)
          </Text>
          <TextInput
            value={kwhValue}
            onChangeText={setKwhValue}
            placeholder="Enter meter value (kWh)"
            placeholderTextColor="#4a5a54"
            keyboardType="numeric"
            className="bg-[#0a1410] border-2 border-[#0fd56b] rounded-3xl px-5 py-4 text-white text-base"
          />
        </View>

        {/* Date & Time Field */}
        <View className="mb-6">
          <Text className="text-white text-base font-semibold mb-3">
            Date & Time
          </Text>
          <TouchableOpacity
            onPress={handleDateTimePicker}
            className="bg-[#0a1410] border-2 border-[#0fd56b] rounded-3xl px-5 py-4 flex-row items-center justify-between"
          >
            <Text className="text-white text-base">{dateTime}</Text>
            <Calendar size={20} color="#0fd56b" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Device Field */}
        <View className="mb-6">
          <Text className="text-white text-base font-semibold mb-3">
            Device
          </Text>
          <TextInput
            value={device}
            onChangeText={setDevice}
            placeholder="eg: Solar Panel"
            placeholderTextColor="#4a5a54"
            className="bg-[#0a1410] border-2 border-[#0fd56b] rounded-3xl px-5 py-4 text-white text-base"
          />
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity
            onPress={handleNotes}
            className="flex-1 bg-transparent border-2 border-[#0fd56b] rounded-3xl px-5 py-4 flex-row items-center justify-center"
          >
            <Edit3 size={20} color="#0fd56b" strokeWidth={2} />
            <Text className="text-white font-semibold text-base ml-2">
              Notes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAttachImage}
            className="flex-1 bg-transparent border-2 border-[#0fd56b] rounded-3xl px-5 py-4 flex-row items-center justify-center"
          >
            <Paperclip size={20} color="#0fd56b" strokeWidth={2} />
            <Text className="text-white font-semibold text-base ml-2">
              Attach image
            </Text>
          </TouchableOpacity>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          onPress={handleUpdateRecord}
          className="bg-[#0fd56b] rounded-full py-4 mb-8 items-center"
        >
          <Text className="text-black font-bold text-lg">Update Record</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditRecord;
