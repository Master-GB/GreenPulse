import { Stack } from "expo-router";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from '../contexts/AuthContext';




export default function RootLayout() {
  return (
    <AuthProvider>
    <>
      <StatusBar hidden ={true} />
     <Stack >
      <Stack.Screen name="(root)" options={{ 
                                         headerShown: false
                                         }} 
      />

      <Stack.Screen name="signIn" options={{ headerShown: false}} />   
      <Stack.Screen name="signUp" options={{ headerShown: false}} />   
      
                             
    </Stack>
   </>
   </AuthProvider>
  );
}
