import { Stack } from "expo-router";
import { StatusBar, View, Text, TouchableOpacity, Image } from "react-native";
import { Coins } from "lucide-react-native";
import { icons } from "@/constants/icons";

// Custom header component for the Donate Energy screen
function DonateHeader() {
  return (
    <View className="flex-row justify-between items-center w-full px-7">
      <Text className="text-white text-2xl font-bold mr-4">Donate Energy</Text>
      <TouchableOpacity className="bg-[#2a3e3e] rounded-full px-5 py-2 flex-row items-center gap-1 ml-2">
        <Image source={icons.coinH} className="size-5 mb-1" />
        <Text className="text-white font-semibold">120</Text>
        <Text className="text-gray-400">/5</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen name="(MainTabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="donateNow"
          options={{
            headerShown: true,
            headerTitle: () => <DonateHeader />,
            headerStyle: {
              backgroundColor: "#122119",
            },
            headerTintColor: "#fff",
          }}
        />

        <Stack.Screen name="signIn" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
