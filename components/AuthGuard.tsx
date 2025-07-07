// components/AuthGuard.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { router, useSegments } from 'expo-router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    console.log('🔍 AuthGuard Check:', {
      isAuthenticated,
      isLoading,
      userEmail: user?.email,
      currentRoute: segments.join('/'),
    });

    if (!isLoading) {
      const inAuthGroup = segments[0] === '(tabs)';
      const inSignIn = segments.includes('sign-in');
      const inCompleteProfile = segments.includes('complete-profile');
      
      // Protected routes that require authentication
      const protectedRoutes = [
        'order-history',
        'personal-info', 
        'addresses',
        'payment-methods',
        'feedback',
        'notifications'
      ];
      
      const isProtectedRoute = protectedRoutes.some(route => segments.includes(route));

      if (!isAuthenticated && (inAuthGroup || isProtectedRoute)) {
        // User is not authenticated but trying to access protected route
        console.log('❌ Redirecting unauthenticated user to sign-in');
        router.replace('/sign-in');
      } else if (isAuthenticated && !inAuthGroup && !inSignIn && !inCompleteProfile && !isProtectedRoute) {
        // Only redirect to tabs if user is on sign-in page after being authenticated
        if (inSignIn) {
          console.log('✅ Redirecting authenticated user from sign-in to main app');
          router.replace('/(tabs)');
        }
        // Don't redirect for other routes - let user navigate freely
      }
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});