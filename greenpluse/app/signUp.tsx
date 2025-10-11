import React, { useState } from "react";
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    
    if (!email || !password) {
      setMessage("Please fill in all fields");
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
      
      // 2. Store user data in AllUsers collection
      await setDoc(doc(db, "AllUsers", userId), {
        uid: userId,
        displayName: userName,
        email: userEmail,
        createdAt: new Date().toISOString(),
        location: "", // Default empty location, user can update later
        energyRecords: [], // Initialize empty energy records array
        totalCoins: 0, // Initialize with 0 coins
        lastUpdated: new Date().toISOString(),
      });
      
      // 3. Update the user's auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: userName,
        });
        await auth.currentUser.reload();
      }

      // 4. Check if admin registration and navigate accordingly
      const ADMIN_EMAIL = 'admin@gmail.com';
      const ADMIN_PASSWORD = '12345678';
      
      if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Set admin session
        await AsyncStorage.setItem('admin_authenticated', 'true');
        // Navigate to admin dashboard
        router.replace('/AdminDashboard' as any);
      } else {
        // Regular user - navigate to main tabs
        router.replace("/(root)/(MainTabs)");
      }
      
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "An error occurred during registration.";
      
      // Handle specific error cases
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setMessage(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={[styles.input, { marginTop: 15 }]}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        
        <TextInput
          style={[styles.input, { marginTop: 15, marginBottom: 20 }]}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        
        {message ? (
          <Text style={[
            styles.message, 
            { color: message.includes('successful') ? '#1AE57D' : '#EF4444' }
          ]}>
            {message}
          </Text>
        ) : null}
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#122119" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity 
            onPress={() => router.push('/signIn')}
            disabled={isLoading}
          >
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122119',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#1AE57D',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1E2E24',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A3E3E',
    width: '100%',
  },
  button: {
    backgroundColor: '#1AE57D',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#122119',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
    padding: 10,
    borderRadius: 5,
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
  },
  footerLink: {
    color: '#1AE57D',
    fontWeight: '600',
  },
});