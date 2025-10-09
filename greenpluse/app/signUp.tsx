import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      setMessage("Please enter your name");
      return;
    }
    
    setIsLoading(true);
    setMessage("");
    
    try {
      // 1. Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const userEmail = userCredential.user.email;
      const userName = name.trim();
      
      // 2. Store user data in Firestore
      await setDoc(doc(db, "users", userId), {
        uid: userId,
        displayName: userName,
        email: userEmail,
        createdAt: new Date().toISOString(),
      });
      
      // 3. Update the user's auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: userName,
        });
        await auth.currentUser.reload();
      }
      
      setMessage("Registration successful! You can now log in.");
    } catch (error: any) {
      console.error("Registration error:", error);
      setMessage(error.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center', backgroundColor: '#122119' }}>
      <Text style={{ color: '#2ECC71', fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>Create Account</Text>
      
      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#9CA3AF"
        value={name}
        onChangeText={setName}
        style={inputStyle}
      />
      
      <TextInput
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={inputStyle}
      />
      
      <TextInput
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={inputStyle}
      />
      
      <View style={{ marginTop: 20, borderRadius: 8, overflow: 'hidden' }}>
        <Button 
          title={isLoading ? 'Creating Account...' : 'Sign Up'} 
          onPress={handleRegister} 
          disabled={isLoading}
          color="#2ECC71"
        />
      </View>
      
      {message ? (
        <Text style={{ 
          color: message.includes('success') ? '#2ECC71' : '#EF4444', 
          marginTop: 15, 
          textAlign: 'center' 
        }}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const inputStyle = {
  backgroundColor: '#1E2E24',
  color: '#FFFFFF',
  padding: 15,
  borderRadius: 8,
  marginBottom: 15,
  fontSize: 16,
  borderWidth: 1,
  borderColor: '#2A4A3A'
};
