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
import { Camera, Calendar, Edit3, Paperclip } from "lucide-react-native";
import { useRouter } from "expo-router";
import logoicon from "../../assets/images/GreenPluseLogo.png";
import camImage from "../../assets/images/camerascanner.png";

// Hide the default navigator header for this route
export const options = {
  headerShown: false,
};

const AddRecord = () => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "Weekly" | "Monthly" | "Yearly"
  >("Weekly");
  const [kwhValue, setKwhValue] = useState("");
  const [dateTime, setDateTime] = useState("11/03/25 11:31AM");
  const [device, setDevice] = useState("");

  const handleSaveRecord = () => {
    // TODO: Implement Firebase save logic here
    Alert.alert("Success", "Record will be saved to Firebase", [
      {
        text: "OK",
        onPress: () => {
          // navigate to the Record History screen
          router.push("/(root)/recordHistory");
        },
      },
    ]);
  };

  const handleUseScanner = () => {
    // TODO: Implement OCR Scanner logic here
    Alert.alert("Scanner", "OCR Scanner will be implemented");
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

  return (
    <SafeAreaView className="flex-1 bg-[#0a1410]">
      <StatusBar barStyle="light-content" backgroundColor="#0a1410" />
      <ScrollView className="flex-1 px-5 pt-8">
        {/* Logo and text */}
        <View className="flex-row items-center justify-center">
          <Text className="text-white text-3xl font-bold mb-8">GreenPulse</Text>
          <Image source={logoicon} className="w-32 h-32 mb-4" />
        </View>

        {/* OCR Scanner Card */}
        <View className="bg-[#1a3830] rounded-3xl p-6 mb-6">
          <View className="flex-row items-end">
            {/* Text and button */}
            <View>
              <Text className="text-white text-2xl font-bold mb-4 leading-tight">
                Try our{"\n"}advanced OCR{"\n"}Scanner!
              </Text>
              <TouchableOpacity
                onPress={handleUseScanner}
                className="bg-[#0fd56b] rounded-full px-6 py-3 flex-row items-center self-start"
              >
                <Camera size={20} color="#000" strokeWidth={2.5} />
                <Text className="text-black font-bold text-base ml-2">
                  Use Scanner
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scanner Image */}
            <View className="flex justify-center items-center h-40">
              <Image source={camImage} className="w-40 h-14 ml-6 mb-10" />
            </View>
          </View>
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

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveRecord}
          className="bg-[#0fd56b] rounded-full py-4 mb-8 items-center"
        >
          <Text className="text-black font-bold text-lg">Save Record</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddRecord;
