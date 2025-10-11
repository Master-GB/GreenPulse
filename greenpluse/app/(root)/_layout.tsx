import { Stack } from "expo-router";
import { StatusBar, View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants/icons";
import { useRouter } from "expo-router";
import ProtectedRoute from '../../components/ProtectedRoute';

// Reusable header that accepts a dynamic title
type HeaderProps = { title: string };
function AppHeader({ title }: HeaderProps) {
  const router = useRouter();
  return (
    <View className="w-full flex-row items-center justify-between px-2 mb-2">
      <View className="flex-1 items-center">
        <Text className="text-white text-xl font-bold">{title}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.6}
        className="bg-[#2a3e3e] rounded-full px-4 py-2 flex-row items-center"
        onPress={(e) => {
          e.preventDefault();
          console.log('Wallet button pressed');
          router.push("/wallet");
        }}
        onPressIn={(e) => e.stopPropagation()}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        style={{
          zIndex: 5,
        }}
      >
        <Image 
          source={icons.coinH} 
          className="w-5 h-5" 
          resizeMode="contain"
        />
        <View className="flex-row items-baseline ml-1">
          <Text className="text-white font-semibold">120</Text>
          <Text className="text-gray-400 text-sm">/5</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ProtectedRoute>
    <View style={{ flex: 1, backgroundColor: "#122119" }}>
      <StatusBar hidden={true} backgroundColor="#122119" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#122119" },
          animation: "slide_from_right",
          // Add these to prevent white flash
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

            // Add this to handle the transition better
            animationTypeForReplace: "push",
          }}
        />

        {/* AddRecord route: hide header explicitly so parent layout doesn't force it */}
        <Stack.Screen name="addRecord" options={{ headerShown: false }} />

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

            // Add this to handle the transition better
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

            // Add this to handle the transition better
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

        <Stack.Screen
          name="add_utility"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Add Account" />,
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
          name="bill_payment_summary"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Bill Payment" />,
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
          name="ProjectSetting"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Project Setting" />,
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
          name="RequestProject" 
          options={{ headerShown: false }} 
        />


        <Stack.Screen
          name="ProjectDetails"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Project Details" />,
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
          name="nft-gallery"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="My NFTs" />,
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
          name="MyRequestProject"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="My Request Project" />,
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
          name="Certificate"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Certificate" />,
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
          name="contribution"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Contribution of Project" />,
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
          name="MyDonatedList"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="My Donations" />,
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
          name="TrackProject"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Track Projects" />,
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
          name="PaymentPage"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Make Donation" />,
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


        <Stack.Screen name="UpdateProjectStatus" options={{ headerShown: false }} />
        <Stack.Screen name="AdminLogin" options={{ headerShown: false }} />
        <Stack.Screen name="AdminDashboard" options={{ headerShown: false }} />

        <Stack.Screen name="signIn" options={{ headerShown: false }} />


        <Stack.Screen
          name="AdminProjectList"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Project Managment" />,
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
          name="AdminProjectDisplay"
          options={{
            headerShown: true,
            headerTitle: () => <AppHeader title="Project Details" />,
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

      </Stack>
    </View>
   </ProtectedRoute>
  );
}

