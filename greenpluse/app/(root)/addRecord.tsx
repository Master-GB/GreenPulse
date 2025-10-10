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

// --- OCR Imports ---
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

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

  // --- OCR State ---
  const [ocrResult, setOcrResult] = useState<{amount?: number}>({});
  const [showOcrResult, setShowOcrResult] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);

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
    Alert.alert(
      "Choose Source",
      "Select how you'd like to scan your document",
      [
        { text: "Camera", onPress: handleOpenCamera },
        { text: "Document Picker", onPress: handlePickDocument },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const handleAttachImage = () => {
    Alert.alert("Attach Image", "Image picker will be implemented");
  };

  // --- OCR Functions ---
  const parseOcrText = (text: string) => {
    // Extract the first number found in the text (for kWh values)
    const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = numberMatch ? parseFloat(numberMatch[1]) : undefined;

    // Console logging for debugging
    console.log('OCR Raw Text:', text);
    console.log('OCR Extracted Amount:', amount);

    return { amount };
  };

  const runOcrOnBase64 = async (mime: string, base64: string) => {
    try {
      setIsOcrLoading(true);
      // Helper to send OCR request with a specific engine
      const sendOcr = async (engine: 1 | 2) => {
        const formData = new FormData();
        formData.append('base64Image', `data:${mime};base64,${base64}`);
        formData.append('language', 'eng');
        formData.append('OCREngine', engine.toString());
        formData.append('isCreateSearchablePdf', 'false');
        formData.append('isSearchablePdfHideTextLayer', 'true');
        formData.append('scale', 'true');
        formData.append('detectOrientation', 'true');
        formData.append('isTable', 'true');

        const response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': 'helloworld', // Replace with your actual API key
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`OCR API error: ${response.status}`);
        }

        return await response.json();
      };

      // Try with engine 2 first, then fallback to engine 1
      let json = await sendOcr(2);
      let parsedText = json?.ParsedResults?.[0]?.ParsedText as string | undefined;

      if (!parsedText || !parsedText.trim()) {
        json = await sendOcr(1);
        parsedText = json?.ParsedResults?.[0]?.ParsedText as string | undefined;
      }

      if (!parsedText || !parsedText.trim()) {
        throw new Error('No text found in the image');
      }

      const result = parseOcrText(parsedText);
      setOcrResult(result);

      // Additional logging for the final result
      console.log('OCR Final Result:', result);
      console.log('Will auto-fill kWh field with amount:', result.amount);

      if (result.amount !== undefined) {
        setKwhValue(result.amount.toString());
      }
      
      setShowOcrResult(true);
    } catch (e: any) {
      setOcrResult({
        amount: undefined
      });
      setShowOcrResult(true);
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
        allowsEditing: false,
      });
      
      if (result.canceled || !result.assets?.[0]) return;
      
      const asset = result.assets[0];
      // Ensure JPEG format and moderate size for better OCR reliability
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [
          { resize: { width: 1600 } },
        ],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipulated.base64) {
        Alert.alert("Error", "Failed to process the image");
        return;
      }

      await runOcrOnBase64('image/jpeg', manipulated.base64);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture or process the image');
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: false,
        copyToCacheDirectory: true,
      });
      
      if (res.canceled || !res.assets?.[0]?.uri) return;
      
      const doc = res.assets[0];
      const mime = doc.mimeType || (doc.name?.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
      
      // Read file content as base64 using the legacy API
      const base64 = await FileSystem.readAsStringAsync(doc.uri, { 
        encoding: 'base64'
      });
      
      await runOcrOnBase64(mime, base64);
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert(
        "Document Error",
        error instanceof Error && error.message 
          ? `Error: ${error.message}`
          : "We couldn't process the selected document. Please ensure it's a clear image or PDF of your bill.",
        [{ text: "OK", style: "default" }]
      );
    }
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

      {/* --- OCR Result Modal --- */}
      <Modal
        visible={showOcrResult}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowOcrResult(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70 px-5">
          <View className="w-full bg-[#1a3830] rounded-2xl p-6 border border-[#0fd56b]">
            <Text className="text-white text-xl font-bold mb-4">
              OCR Scan Result
            </Text>
            <View className="mb-4">
              {ocrResult.amount !== undefined ? (
                <Text className="text-white text-base mb-2">
                  Detected Value: <Text className="text-[#0fd56b] font-bold">{ocrResult.amount} kWh</Text>
                </Text>
              ) : (
                <Text className="text-white text-base mb-2">
                  No number detected. Please try again with a clearer image.
                </Text>
              )}
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setShowOcrResult(false)}
                className="flex-1 bg-transparent border border-[#0fd56b] rounded-full py-3 items-center"
              >
                <Text className="text-white font-bold">Close</Text>
              </TouchableOpacity>
              {ocrResult.amount !== undefined && (
                <TouchableOpacity
                  onPress={() => {
                    setKwhValue(ocrResult.amount!.toString());
                    console.log('Applied OCR value to kWh field:', ocrResult.amount);
                    setShowOcrResult(false);
                  }}
                  className="flex-1 bg-[#0fd56b] rounded-full py-3 items-center"
                >
                  <Text className="text-black font-bold">Use Value</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddRecord;