import React from "react";
import { View, Text, Image } from "react-native";
import { Tabs } from "expo-router";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/constants/icons";

type TabIconProps = {
  focused: boolean;
  icon: any;
  text: string;
  size?: number;
};

const TabIcon = ({ focused, icon, text, size = 24 }: TabIconProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(focused ? 1.1 : 1, { duration: 150 }) }],
  }));

  return (
    <Animated.View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          width: 60,
          paddingVertical: 6,
          borderRadius: 16,
          marginTop: 5,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          backgroundColor: focused ? "#16A34A" : "transparent",
          borderRadius: 16,
          padding: 8,
        }}
      >
        <Image
          source={icon}
          style={{
            width: size,
            height: size,
            tintColor: focused ? "#FFFFFF" : "#CFCFCF",
          }}
          resizeMode="contain"
        />
      </View>
      {focused && (
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 11,
            fontWeight: "600",
            marginTop: 3,
          }}
        >
          {text}
        </Text>
      )}
    </Animated.View>
  );
};

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#122119" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 20,
            right: 20,
            width: "auto",
            height: 60,
            backgroundColor: "#193326",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "#1C442E",
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.35,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 6,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={["#193326", "#193326"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                flex: 1,
                borderRadius: 20,
              }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.home} text="Home" />
            ),
          }}
        />
        <Tabs.Screen
          name="donation"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.donate} text="Donate" size={28} />
            ),
          }}
        />
        <Tabs.Screen
          name="project"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.project} text="Projects" />
            ),
          }}
        />
        <Tabs.Screen
          name="trackEnergy"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.track} text="Track" />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={icons.profile} text="Profile" />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
