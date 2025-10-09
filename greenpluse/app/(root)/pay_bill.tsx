import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  StatusBar,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { router } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";

interface Account {
  id: string;
  accountNumber: string;
  accountNickname?: string;
  serviceAddress: string;
  provider: string;
  isActive?: boolean;
}

const PayBill: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  // State declarations
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<
    number | null
  >(null);
  const [accountNickname, setAccountNickname] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(15);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Fetch utility accounts from Firestore with detailed logging
  const fetchAccounts = useCallback(async () => {
    console.log("1. Starting to fetch accounts...");

    if (!user) {
      console.log("2. No user found, cannot fetch accounts");
      return [];
    }

    console.log("3. User found with UID:", user.uid);

    try {
      setLoading(true);
      console.log("4. Loading state set to true");

      const accountsRef = collection(db, "utilityAccounts");
      console.log("5. Collection reference created for utilityAccounts");

      // First, just query by user ID to see all accounts
      const q = query(accountsRef, where("userId", "==", user.uid));
      console.log("6. Created simple query for userId:", user.uid);
      console.log("6. Created query for userId:", user.uid);

      const querySnapshot = await getDocs(q);
      console.log("7. Query completed. Found", querySnapshot.size, "documents");

      // Process the accounts
      const accountsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Processing document ID:", doc.id);
        console.log("Raw document data:", JSON.stringify(data, null, 2));

        // Log all fields in the document
        console.log("Document fields:", Object.keys(data));

        const account = {
          id: doc.id,
          accountNumber: data.accountNumber || data.accountNumber || "",
          serviceAddress: data.serviceAddress || data.serviceAddress || "",
          provider: data.provider || data.provider || "Unknown Provider",
          accountNickname:
            data.accountNickname || data.nickname || "My Account",
          isActive: data.isActive !== false, // Default to true if not set
          autoVerify: data.autoVerify || false,
        };

        console.log("Processed account:", account);
        return account as Account;
      });

      console.log("8. Processed accounts:", accountsData);

      // Update the accounts state
      setAccounts(accountsData);

      // If no accounts found, try a more permissive query for debugging
      if (accountsData.length === 0) {
        console.log(
          "No active accounts found, checking all accounts for user..."
        );
        const allUserAccountsQuery = query(
          accountsRef,
          where("userId", "==", user.uid)
        );
        const allUserAccountsSnapshot = await getDocs(allUserAccountsQuery);
        console.log(
          "Found",
          allUserAccountsSnapshot.size,
          "total accounts for user"
        );
        allUserAccountsSnapshot.forEach((doc) => {
          console.log("User account - Document:", doc.id, doc.data());
        });
      }

      return accountsData;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      console.error("9. Error in fetchAccounts:", {
        error,
        message: errorMessage,
        name: error instanceof Error ? error.name : "UnknownError",
        stack: error instanceof Error ? error.stack : "No stack trace",
      });

      Alert.alert("Error", `Failed to load utility accounts: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
      console.log("10. Loading state set to false");
    }
  }, [user]);

  // Add effect to log component mount and user changes
  useEffect(() => {
    console.log("A. Component mounted or user changed");
    console.log(
      "B. Current user:",
      user ? `Authenticated (${user.uid})` : "Not authenticated"
    );

    if (user) {
      console.log("C. Fetching accounts for user:", user.uid);
      fetchAccounts()
        .then(() => {
          console.log("D. Accounts fetched successfully, updating UI...");
        })
        .catch((error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error("E. Error in fetchAccounts effect:", errorMessage);
        });
    } else {
      console.log("C. No user, skipping account fetch");
      setAccounts([]);
      setAccountNumber("");
      setServiceAddress("");
      setProvider("");
      setSelectedAccountIndex(null);
    }
  }, [fetchAccounts, user]);

  // Update form fields when accounts or selected index changes
  useEffect(() => {
    console.log("F. Accounts or selected index changed", {
      accountsCount: accounts.length,
      selectedIndex: selectedAccountIndex,
    });

    if (
      accounts.length > 0 &&
      selectedAccountIndex !== null &&
      selectedAccountIndex < accounts.length
    ) {
      const account = accounts[selectedAccountIndex];
      console.log("G. Updating form fields with account:", account);
      setAccountNumber(account.accountNumber || "");
      setAccountNickname(account.accountNickname || "");
      setServiceAddress(account.serviceAddress || "");
      setProvider(account.provider || "");
    } else if (
      accounts.length > 0 &&
      (selectedAccountIndex === null || selectedAccountIndex >= accounts.length)
    ) {
      // If we have accounts but no valid selection, select the first one
      console.log("H. No valid selection, selecting first account");
      setSelectedAccountIndex(0);
      // Also set the first account's nickname
      if (accounts.length > 0) {
        setAccountNickname(accounts[0].accountNickname || "");
      }
    } else if (accounts.length === 0) {
      console.log("I. No accounts available");
      setAccountNumber("");
      setAccountNickname("");
      setServiceAddress("No accounts available");
      setProvider("Add a utility account to get started");
    }
  }, [accounts, selectedAccountIndex]);

  const creditValue = credits * 23.38;

  const handleAccountSelect = (index: number) => {
    setSelectedAccountIndex(index);
    setAccountNickname(accounts[index].accountNickname || "");
    setAccountNumber(accounts[index].accountNumber);
    setServiceAddress(accounts[index].serviceAddress);
    setProvider(accounts[index].provider);
    setShowAccountDropdown(false);
  };

  return (
    <View className="flex-1 bg-[#122119]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Available Balance Card */}
        <View className="mx-5 mt-4 bg-[#1a3333] rounded-2xl p-5 border border-[#2a4444]">
          <Text className="text-gray-400 text-sm mb-2">Available Balance</Text>
          <Text className="text-[#00ff88] text-3xl font-bold">
            {credits} Credit = Rs {creditValue.toFixed(2)}
          </Text>
        </View>

        {/* Utility Account Section */}
        <View className="mx-5 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-semibold">
              Utility Account
            </Text>
            <TouchableOpacity
              className="bg-[#00ff88] px-4 py-2 rounded-full"
              onPress={() => router.push("/(root)/add_utility")}
            >
              <Text className="text-black font-semibold text-sm">
                Add Account
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-[#1a3333] rounded-2xl p-5 border border-[#2a4444]">
            {/* Account Nickname with Dropdown */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Account</Text>
              {loading ? (
                <View className="bg-[#2a3a3a] rounded-xl px-4 py-4 items-center">
                  <ActivityIndicator color="#00ff88" />
                </View>
              ) : accounts.length > 0 ? (
                <TouchableOpacity
                  className="bg-[#2a3a3a] rounded-xl px-4 py-4 flex-row items-center justify-between"
                  onPress={() =>
                    accounts.length > 1 && setShowAccountDropdown(true)
                  }
                  disabled={accounts.length <= 1}
                >
                  <Text className="text-white text-base">
                    {accountNickname || accountNumber || "Select an account"}
                  </Text>
                  {accounts.length > 1 && (
                    <Ionicons
                      name={showAccountDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color="#fff"
                    />
                  )}
                </TouchableOpacity>
              ) : (
                <View className="bg-[#2a3a3a] rounded-xl px-4 py-4">
                  <Text className="text-white text-base">
                    No accounts available
                  </Text>
                </View>
              )}
            </View>

            {/* Account Number (Display Only) */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">Account Number</Text>
              <View className="bg-[#2a3a3a] rounded-xl px-4 py-4">
                <Text className="text-white text-base">
                  {accountNumber || "—"}
                </Text>
              </View>
            </View>

            {/* Service Address */}
            <View className="mb-4">
              <Text className="text-gray-400 text-sm mb-2">
                Service Address
              </Text>
              <View className="bg-[#2a3a3a] rounded-xl px-4 py-4">
                <Text className="text-white text-base">{serviceAddress}</Text>
              </View>
            </View>

            {/* Provider */}
            <View className="mb-6">
              <Text className="text-gray-400 text-sm mb-2">Provider</Text>
              <View className="bg-[#2a3a3a] rounded-xl px-4 py-4">
                <Text className="text-white text-base">{provider}</Text>
              </View>
            </View>

            {/* Continue Button */}
          </View>
          <View className=" items-center px-10">
            <TouchableOpacity
              className={`py-3 w-full max-w-md rounded-3xl mt-6 items-center justify-center ${!accountNumber ? "bg-[#00ff8898]" : "bg-[#00ff88]"}`}
              onPress={() => {
                if (accountNumber) {
                  router.push({
                    pathname: "/(root)/bill_payment_summary",
                    params: {
                      accountNumber,
                      accountNickname: accountNickname || "My Account",
                      serviceAddress,
                      provider,
                      credits: credits.toString(),
                      creditValue: creditValue.toString(),
                    },
                  });
                }
              }}
              disabled={!accountNumber}
            >
              <Text className="text-black font-semibold text-base">
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Account Selection Modal */}
      <Modal
        visible={showAccountDropdown}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowAccountDropdown(false)}
      >
        <Pressable
          className="flex-1 bg-[#122119] opacity-90 justify-center items-center"
          onPress={() => setShowAccountDropdown(false)}
        >
          <Pressable
            className="bg-[#1a3333] rounded-2xl mx-5 w-11/12 max-h-96"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-5 border-b border-[#2a4448]">
              <Text className="text-white text-lg font-semibold">
                Select Account
              </Text>
            </View>

            <ScrollView className="max-h-80">
              {accounts.map((account, index) => (
                <TouchableOpacity
                  key={account.accountNumber}
                  className={`p-5 border-b border-[#2a4444] ${
                    selectedAccountIndex === index ? "bg-[#2a4444]" : ""
                  }`}
                  onPress={() => handleAccountSelect(index)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-white text-base font-semibold">
                        {account.accountNickname || "My Account"}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {account.accountNumber}
                      </Text>
                    </View>
                    {selectedAccountIndex === index && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#00ff88"
                      />
                    )}
                  </View>
                  <View className="mt-2">
                    <Text className="text-gray-400 text-xs">
                      {account.serviceAddress}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {account.provider}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="p-4 border-t border-[#2a4444]"
              onPress={() => setShowAccountDropdown(false)}
            >
              <Text className="text-[#00ff88] text-center font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default PayBill;
