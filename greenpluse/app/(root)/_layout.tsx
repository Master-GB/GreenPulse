import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen 
          name="(MainTabs)" 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="(subTabs)" 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="signIn" 
          options={{ headerShown: false }} 
        />  

        <Stack.Screen 
          name="ProjectSetting" 
          options={{ headerShown: false }} 
        />


        <Stack.Screen 
          name="RequestProject" 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="ProjectDetails" 
          options={{ headerShown: false }} 
        />


        
      </Stack>

        
      
    </>
  );
}