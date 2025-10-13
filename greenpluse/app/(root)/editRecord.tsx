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
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Edit3, Paperclip } from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import logoicon from "../../assets/images/GreenPluseLogo.png";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Hide the default navigator header for this route
export const options = {
  headerShown: false,
};

const KWH_PER_COIN = 1;

const EditRecord = () => {
  const router = useRouter();
  const { recordId } = useLocalSearchParams<{ recordId?: string }>();
  const { user } = useAuth();

  const [selectedPeriod, setSelectedPeriod] = useState<
    "Weekly" | "Monthly" | "Yearly"
  >("Monthly");
  const [kwhValue, setKwhValue] = useState("");
  const [device, setDevice] = useState("");
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRecord = async () => {
      if (!user) {
        return;
      }

      if (!recordId) {
        Alert.alert("Missing Record", "We couldn't find the record to edit.", [
          { text: "OK", onPress: () => router.back() },
        ]);
        return;
      }

      try {
        setLoading(true);
        const recordRef = doc(db, "users", user.uid, "energyRecords", String(recordId));
        const recordSnap = await getDoc(recordRef);

        if (!recordSnap.exists()) {
          Alert.alert("Not Found", "This record no longer exists.", [
            { text: "OK", onPress: () => router.back() },
          ]);
          return;
        }

        const data = recordSnap.data();

        const storedDate: Date = data.recordedAt?.toDate?.()
          || data.timestamp?.toDate?.()
          || (data.recordedAtString ? new Date(data.recordedAtString) : new Date());

        if (!Number.isNaN(storedDate.valueOf())) {
          setDateTime(storedDate);
        }

        setSelectedPeriod((data.period as "Weekly" | "Monthly" | "Yearly") ?? "Monthly");
        setKwhValue(
          data.kwhValue !== undefined && data.kwhValue !== null
            ? String(data.kwhValue)
            : ""
        );
        setDevice(data.device ?? "");
      } catch (error) {
        console.error("Error loading record:", error);
        Alert.alert("Error", "Could not load this record.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadRecord();
  }, [recordId, router, user]);

  const formattedDateTime = useMemo(() => dateTime.toLocaleString(), [dateTime]);

  const handleUpdateRecord = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to update a record.");
      return;
    }

    if (!recordId) {
      Alert.alert("Error", "Missing record reference.");
      return;
    }

    if (!kwhValue.trim() || Number.isNaN(Number(kwhValue))) {
      Alert.alert("Invalid Input", "Please enter a valid kWh value.");
      return;
    }

    if (!device.trim()) {
      Alert.alert("Invalid Input", "Please enter a device name.");
      return;
    }

    try {
      setSaving(true);
      const numericKwh = Number(kwhValue);
      const recordRef = doc(db, "users", user.uid, "energyRecords", String(recordId));

      await updateDoc(recordRef, {
        kwhValue: numericKwh,
        coinValue: numericKwh / KWH_PER_COIN,
        period: selectedPeriod,
        device: device.trim(),
        recordedAt: dateTime,
        recordedAtString: formattedDateTime,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Success", "Record updated successfully.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error updating record:", error);
      Alert.alert("Error", "Failed to update the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDateTimePicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    setShowDatePicker(false);

    if (selectedDate) {
      setDateTime(selectedDate);
    }
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a1410]">
        <StatusBar barStyle="light-content" backgroundColor="#0a1410" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0fd56b" />
          <Text className="text-white mt-3">Loading record...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text className="text-white text-base">{formattedDateTime}</Text>
            <Calendar size={20} color="#0fd56b" strokeWidth={2} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="datetime"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
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
          disabled={saving}
          className="bg-[#0fd56b] rounded-full py-4 mb-8 items-center"
        >
          <Text className="text-black font-bold text-lg">
            {saving ? "Updating..." : "Update Record"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditRecord;
