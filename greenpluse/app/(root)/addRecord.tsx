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
  Modal, // <-- Import Modal for the notes popup
  Platform, // <-- Import Platform to handle OS-specific UI
} from "react-native";
import React, { useState } from "react";
import { Camera, Calendar, Edit3, Paperclip } from "lucide-react-native";
import { useRouter } from "expo-router";
import logoicon from "../../assets/images/GreenPluseLogo.png";
import camImage from "../../assets/images/camerascanner2.png";
import DateTimePicker from "@react-native-community/datetimepicker"; // <-- Import the date picker

// --- Firebase Imports ---
import { db } from "../../config/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
// ------------------------

// Hide the default navigator header for this route
export const options = {
  headerShown: false,
};

// --- CONVERSION CONSTANT ---
const KWH_PER_COIN = 1;

const AddRecord = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "Weekly" | "Monthly" | "Yearly"
  >("Monthly");
  const [kwhValue, setKwhValue] = useState("");
  const [device, setDevice] = useState("");

  // --- New state for notes and date picker ---
  const [note, setNote] = useState("");
  const [tempNote, setTempNote] = useState(""); // Temporary state for modal input
  const [isNotesModalVisible, setNotesModalVisible] = useState(false);
  const [dateTime, setDateTime] = useState(new Date()); // Use Date object
  const [showDatePicker, setShowDatePicker] = useState(false);
  // ------------------------------------------

  const handleSaveRecord = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to save a record.");
      return;
    }

    if (!kwhValue.trim() || isNaN(parseFloat(kwhValue))) {
      Alert.alert("Error", "Please enter a valid number for kWh value.");
      return;
    }

    if (!device.trim()) {
      Alert.alert("Error", "Please enter a device name.");
      return;
    }

    try {
      const numericKwhValue = parseFloat(kwhValue);
      const calculatedCoinValue = numericKwhValue / KWH_PER_COIN;
      
      const recordsCollection = collection(
        db,
        "users",
        user.uid,
        "energyRecords"
      );
      const recordedAtString = dateTime.toLocaleString();

      const docRef = await addDoc(recordsCollection, {
        userId: user.uid,
        kwhValue: numericKwhValue,
        coinValue: calculatedCoinValue,
        period: selectedPeriod,
        note: note, // <-- ADDED: Save the note
        recordedAt: dateTime, // <-- CHANGED: Save the actual Date object
        recordedAtString,
        device: device,
        timestamp: serverTimestamp(), // This is the creation timestamp
      });

      console.log("Document written with ID: ", docRef.id);

      Alert.alert("Success", "Record saved to Firebase!", [
        {
          text: "OK",
          onPress: () => {
            // Clear all form fields
            setKwhValue("");
            setDevice("");
            setNote("");
            setDateTime(new Date());
            router.push("/(root)/recordHistory");
          },
        },
      ]);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("Error adding document: ", e);
      Alert.alert("Error", "Failed to save record: " + errMsg);
    }
  };

  // --- Handlers for Notes Modal ---
  const handleOpenNotes = () => {
    setTempNote(note); // Load current note into modal
    setNotesModalVisible(true);
  };

  const handleSaveNote = () => {
    setNote(tempNote); // Save note from modal
    setNotesModalVisible(false);
  };

  const handleCloseNotesModal = () => {
    setNotesModalVisible(false);
  };
  // ---------------------------------

  // --- Handlers for Date Picker ---
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios"); // iOS requires manual dismissal
    if (selectedDate) {
      setDateTime(selectedDate);
    }
  };

  const showDateTimePicker = () => {
    setShowDatePicker(true);
  };
  // -------------------------------

  const handleUseScanner = () => {
    Alert.alert("Scanner", "OCR Scanner will be implemented");
  };

  const handleAttachImage = () => {
    Alert.alert("Attach Image", "Image picker will be implemented");
  };

  const hasNote = note.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#0a1410]">
      <StatusBar barStyle="light-content" backgroundColor="#0a1410" />
      <ScrollView className="flex-1 px-5 pt-8">
        {/* ... (Logo and OCR Scanner Card remain the same) ... */}
        <View className="flex-row items-center justify-center">
            <Text className="text-white text-3xl font-bold mb-8">GreenPulse</Text>
            <Image source={logoicon} className="w-32 h-32 mb-4" />
        </View>

        <View className="bg-[#1a3830] rounded-3xl p-6 mb-6">
          <View className="flex-row items-end">
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
            <View className="flex justify-center items-center h-50">
              <Image source={camImage} className="w-40 h-10 ml-6 mb-10" />
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
            onPress={showDateTimePicker}
            className="bg-[#0a1410] border-2 border-[#0fd56b] rounded-3xl px-5 py-4 flex-row items-center justify-between"
          >
            <Text className="text-white text-base">
              {dateTime.toLocaleString()}
            </Text>
            <Calendar size={20} color="#0fd56b" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* This is the actual Date Picker component, it's hidden until you press the button */}
        {showDatePicker && (
          <DateTimePicker
            value={dateTime}
            mode="datetime"
            is24Hour={false}
            display="default"
            onChange={handleDateChange}
          />
        )}

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
            onPress={handleOpenNotes}
            className={`flex-1 rounded-3xl px-5 py-4 flex-row items-center justify-center ${
              hasNote
                ? "bg-[#0fd56b]"
                : "bg-transparent border-2 border-[#0fd56b]"
            }`}
          >
            <Edit3
              size={20}
              color={hasNote ? "#000" : "#0fd56b"}
              strokeWidth={2}
            />
            <Text
              className={`font-semibold text-base ml-2 ${
                hasNote ? "text-black" : "text-white"
              }`}
            >
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

      {/* --- Notes Modal --- */}
      <Modal
        visible={isNotesModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseNotesModal}
      >
        <View className="flex-1 justify-center items-center bg-black/70 px-5">
          <View className="w-full bg-[#1a3830] rounded-2xl p-6 border border-[#0fd56b]">
            <Text className="text-white text-xl font-bold mb-4">
              Add a Note
            </Text>
            <TextInput
              value={tempNote}
              onChangeText={setTempNote}
              placeholder="Enter your notes here..."
              placeholderTextColor="#4a5a54"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-[#0a1410] border border-[#0fd56b] rounded-xl p-4 text-white text-base h-32 mb-6"
            />
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={handleCloseNotesModal}
                className="flex-1 bg-transparent border border-[#0fd56b] rounded-full py-3 items-center"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveNote}
                className="flex-1 bg-[#0fd56b] rounded-full py-3 items-center"
              >
                <Text className="text-black font-bold">Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddRecord;