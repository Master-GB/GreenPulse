import { Stack } from "expo-router";
import { StatusBar, View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";

// Reusable header that accepts a dynamic title
type HeaderProps = { title: string };
function AppHeader({ title }: HeaderProps) {
  const router = useRouter();
  return (
    <View className="flex-1 flex-row items-center px-2 mb-2">
      <View className="absolute left-0 right-[70px] items-center">
        <Text className="text-white text-xl font-bold">{title}</Text>
      </View>
      <TouchableOpacity
        className="ml-52 bg-[#2a3e3e] rounded-full px-4 py-2 flex-row items-center gap-1 "
        onPress={() => router.push("/(root)/wallet")}
      >
        <Image source={icons.coinH} className="w-5 h-5" />
        <Text className="text-white font-semibold">120</Text>
        <Text className="text-gray-400 text-sm">/5</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#122119" }}>
      <StatusBar hidden={true} backgroundColor="#122119" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#122119" },
          animation: "slide_from_right",
          headerTransparent: false,
          headerStyle: {
            backgroundColor: "#122119",
          },
        }}
      >
        <Stack.Screen name="(MainTabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="donateNow"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Donate Energy" />,
            headerStyle: {
              backgroundColor: "#122119",
            },
            headerTintColor: "#fff",
            animation: "slide_from_right",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: "#122119" },
            presentation: "card",
            headerShadowVisible: false,
            headerTransparent: false,
            headerBackground: () => (
              <View style={{ flex: 1, backgroundColor: "#122119" }} />
            ),
            animationTypeForReplace: "push",
          }}
        />

        <Stack.Screen
          name="impact"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="My Impact" />,
            headerStyle: {
              backgroundColor: "#122119",
            },
            headerTintColor: "#fff",
            animation: "slide_from_right",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: "#122119" },
            presentation: "card",
            headerShadowVisible: false,
            headerTransparent: false,
            headerBackground: () => (
              <View style={{ flex: 1, backgroundColor: "#122119" }} />
            ),
            animationTypeForReplace: "push",
          }}
        />

        <Stack.Screen
          name="stories/[id]"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Impact Story" />,
            headerStyle: {
              backgroundColor: "#122119",
            },
            headerTintColor: "#fff",
            animation: "slide_from_right",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: "#122119" },
            presentation: "card",
            headerShadowVisible: false,
            headerTransparent: false,
            headerBackground: () => (
              <View style={{ flex: 1, backgroundColor: "#122119" }} />
            ),
            animationTypeForReplace: "push",
          }}
        />

        <Stack.Screen
          name="wallet"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Wallet" />,
            headerStyle: {
              backgroundColor: "#122119",
            },
            headerTintColor: "#fff",
            animation: "slide_from_right",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: "#122119" },
            presentation: "card",
            headerShadowVisible: false,
            headerTransparent: false,
            headerBackground: () => (
              <View style={{ flex: 1, backgroundColor: "#122119" }} />
            ),
            animationTypeForReplace: "push",
          }}
        />

        <Stack.Screen
          name="pay_bill"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Pay Electricity Bill" />,
            headerStyle: {
              backgroundColor: "#122119",
            },
            headerTintColor: "#fff",
            animation: "slide_from_right",
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: "#122119" },
            presentation: "card",
            headerShadowVisible: false,
            headerTransparent: false,
            headerBackground: () => (
              <View style={{ flex: 1, backgroundColor: "#122119" }} />
            ),
            animationTypeForReplace: "push",
          }}
        />

        <Stack.Screen name="signIn" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
