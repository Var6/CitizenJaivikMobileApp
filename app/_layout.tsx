// app/_layout.tsx - Enhanced version with AuthProvider and AuthGuard
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { checkFeedbackNotifications, cleanupOldNotifications } from '../utils/feedbackNotifications';
import AuthGuard from '../components/AuthGuard';

export default function RootLayout() {
  useEffect(() => {
    // Check for pending feedback notifications when app loads
    const initializeNotifications = async () => {
      try {
        // Clean up old notifications first
        await cleanupOldNotifications();
        
        // Check for pending notifications
        await checkFeedbackNotifications();
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();

    // Set up interval to check notifications every 30 minutes while app is active
    const notificationInterval = setInterval(() => {
      checkFeedbackNotifications();
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      clearInterval(notificationInterval);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <AuthGuard>
            <View style={{ flex: 1 }}>
              <Stack
                screenOptions={{
                  // Add default safe area handling for all screens
                  contentStyle: { 
                    backgroundColor: '#fff',
                    flex: 1,
                  },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="product/[id]" 
                  options={{ 
                    title: 'Product Details',
                    headerStyle: { backgroundColor: '#2e7d32' },
                    headerTintColor: '#fff',
                    headerShadowVisible: false,
                  }} 
                />
                <Stack.Screen name="products" options={{ headerShown: false }} />
                <Stack.Screen name="product-detail" options={{ headerShown: false }} />
                <Stack.Screen name="cart" options={{ headerShown: false }} />
                <Stack.Screen name="checkout" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="complete-profile" options={{ headerShown: false }} />
                <Stack.Screen name="order-history" options={{ headerShown: false }} />
                <Stack.Screen name="feedback" options={{ headerShown: false }} />
              </Stack>
              <StatusBar 
                style="auto" 
                backgroundColor="transparent"
                translucent={Platform.OS === 'android'}
              />
            </View>
          </AuthGuard>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}