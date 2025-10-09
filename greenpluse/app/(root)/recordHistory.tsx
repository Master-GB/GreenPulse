import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Trash2, Info } from "lucide-react-native";
import { useRouter } from "expo-router";
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';

// Hide the default navigator header for this route
export const options = {
  headerShown: false,
};

// Type definition for energy records
interface EnergyRecord {
  id: string;
  userId: string;
  kwhValue: number;
  period: "Weekly" | "Monthly" | "Yearly";
  recordedAtString: string;
  device: string;
  timestamp: Date;
}

const RecordHistory = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [records, setRecords] = useState<EnergyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch records from Firebase
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
  const recordsRef = collection(db, 'users', user.uid, 'energyRecords');
  const querySnapshot = await getDocs(recordsRef);
        
        const fetchedRecords: EnergyRecord[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timestampValue = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
          fetchedRecords.push({
            id: doc.id,
            userId: data.userId,
            kwhValue: data.kwhValue,
            period: data.period,
            recordedAtString: data.recordedAtString ?? data.recordedAt?.toDate?.().toLocaleString?.() ?? "",
            device: data.device,
            timestamp: timestampValue,
          });
        });

        // Sort by timestamp (newest first)
        fetchedRecords.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecords(fetchedRecords);
      } catch (error) {
        console.error('Error fetching records:', error);
        Alert.alert('Error', 'Failed to load records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  const handleDelete = async (id: string, kwhValue: number) => {
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
          onPress: async () => {
            if (!user) {
              Alert.alert("Error", "You must be logged in to delete records.");
              return;
            }

            try {
              await deleteDoc(doc(db, 'users', user.uid, 'energyRecords', id));
              setRecords(records.filter((record) => record.id !== id));
              Alert.alert("Success", "Record deleted successfully");
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert("Error", "Failed to delete record");
            }
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
      `Editing record: ${record.kwhValue} kWh\nDate: ${record.recordedAtString}`,
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

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading records...</Text>
        </View>
      ) : !user ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-white text-lg text-center mb-4">
            You must be logged in to view your records.
          </Text>
        </View>
      ) : (
        <>
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
                  {record.recordedAtString}
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
        </>
      )}
    </SafeAreaView>
  );
};

export default RecordHistory;
