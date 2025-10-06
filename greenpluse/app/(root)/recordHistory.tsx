import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { ArrowLeft, Edit, Trash2, Info } from "lucide-react-native";
import { useRouter } from "expo-router";

// Hide the default navigator header for this route
export const options = {
  headerShown: false,
};

// Type definition for energy records
interface EnergyRecord {
  id: string;
  kwhValue: number;
  dateTime: string;
  period: "Weekly" | "Monthly" | "Yearly";
  device?: string;
  notes?: string;
}

const RecordHistory = () => {
  const router = useRouter();

  // Dummy data - will be replaced with Firebase data in the future
  const [records, setRecords] = useState<EnergyRecord[]>([
    {
      id: "1",
      kwhValue: 3320,
      dateTime: "11/26/25 1:45PM",
      period: "Monthly",
      device: "Solar Panel",
    },
    {
      id: "2",
      kwhValue: 2520,
      dateTime: "12/26/25 3:45PM",
      period: "Monthly",
      device: "Main Meter",
    },
    {
      id: "3",
      kwhValue: 1720,
      dateTime: "01/26/25 1:45PM",
      period: "Weekly",
      device: "Solar Panel",
    },
    {
      id: "4",
      kwhValue: 3873,
      dateTime: "02/26/25 1:45PM",
      period: "Monthly",
      device: "Main Meter",
    },
  ]);

  const handleDelete = (id: string, kwhValue: number) => {
    Alert.alert(
      "Delete Record",
      `Are you sure you want to delete the record of ${kwhValue} kWh?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement Firebase delete logic
            setRecords(records.filter((record) => record.id !== id));
            Alert.alert("Success", "Record deleted successfully");
          },
        },
      ]
    );
  };

  const handleEdit = (record: EnergyRecord) => {
    // TODO: Navigate to edit screen with record data
    // For now, showing an alert. Will be implemented with proper navigation once route is registered
    Alert.alert(
      "Edit Record",
      `Editing record: ${record.kwhValue} kWh\nDate: ${record.dateTime}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Editor",
          onPress: () => {
            // This will navigate to editRecord screen
            // router.push(`/(root)/editRecord?recordId=${record.id}`);
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a1410]">
      <StatusBar barStyle="light-content" backgroundColor="#0a1410" />

      {/* Header */}
      <View className="px-5 pt-6 pb-4">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeft size={28} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Record History</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Records List */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {records.map((record, index) => (
          <View
            key={record.id}
            className="bg-transparent border-2 border-[#0fd56b] rounded-3xl p-5 mb-4"
          >
            {/* Top Row: kWh Value and DateTime */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-3xl font-bold">
                {record.kwhValue} kWh
              </Text>
              <View className="flex-row items-center">
                <Text className="text-[#8a9a94] text-sm mr-2">
                  {record.dateTime}
                </Text>
                <Info size={18} color="#8a9a94" strokeWidth={2} />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => handleEdit(record)}
                className="flex-1 bg-[#0fd56b] rounded-full py-3 flex-row items-center justify-center"
              >
                <Edit size={18} color="#000000" strokeWidth={2.5} />
                <Text className="text-black font-bold text-base ml-2">
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(record.id, record.kwhValue)}
                className="flex-1 bg-[#0fd56b] rounded-full py-3 flex-row items-center justify-center"
              >
                <Trash2 size={18} color="#000000" strokeWidth={2.5} />
                <Text className="text-black font-bold text-base ml-2">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {records.length === 0 && (
          <View className="items-center justify-center py-20">
            <Text className="text-[#8a9a94] text-lg">
              No records found. Add your first record!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RecordHistory;
