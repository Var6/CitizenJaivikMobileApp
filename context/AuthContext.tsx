// context/AuthContext.tsx - Simplified version (Email/Password only)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// User interface matching your exact Next.js User model (IUser)
export interface User {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  address?: string;
  pincode?: string;
  profileImage?: string;
  role: 'user' | 'admin';
  authProvider: 'credentials' | 'google';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (emailOrMobile: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  checkAuthStatus: () => Promise<void>;
  navigateToProfile: () => void;
  navigateToHome: () => void;
  navigateToCart: () => void;
}

// Signup data interface matching your signup schema
export interface SignupData {
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  pincode: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
      console.log('✅ Email/Password authentication ready');
      await checkAuthStatus();
    };

    initializeAuth();
  }, []);

  // Navigation functions
  const navigateToProfile = () => {
    router.push('/(tabs)/profile');
  };

  const navigateToHome = () => {
    router.push('/(tabs)');
  };

  const navigateToCart = () => {
    router.push('/(tabs)/cart');
  };

  // Check current auth status
  const checkAuthStatus = async (): Promise<void> => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          token: storedToken,
          isLoading: false,
          isAuthenticated: true,
        });
        console.log('✅ User session restored:', user.email);
      } else {
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
        console.log('ℹ️ No existing user session found');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  // Login function using your existing mobile-login endpoint
  const login = async (emailOrMobile: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      console.log('🔄 Attempting login for:', emailOrMobile);

      const response = await fetch('https://citizenagriculture.in/api/auth/mobile-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrMobile,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth data
        await Promise.all([
          AsyncStorage.setItem('authToken', data.token),
          AsyncStorage.setItem('user', JSON.stringify(data.user)),
        ]);

        setAuthState({
          user: data.user,
          token: data.token,
          isLoading: false,
          isAuthenticated: true,
        });

        console.log('✅ Login successful for:', data.user.email);
        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        console.log('❌ Login failed:', data.message);
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Signup function using your existing signup endpoint
  const signup = async (userData: SignupData): Promise<{ success: boolean; message?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      console.log('🔄 Attempting signup for:', userData.email);

      const response = await fetch('https://citizenagriculture.in/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Signup successful, auto-logging in...');
        // Auto-login after successful signup
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        console.log('❌ Signup failed:', data.message);
        
        // Handle specific error cases from your signup API
        if (response.status === 409) {
          return { success: false, message: data.message };
        }
        
        if (response.status === 400 && data.errors) {
          const errorMessage = data.errors.map((err: any) => err.message).join(', ');
          return { success: false, message: errorMessage };
        }
        
        return { success: false, message: data.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Update user profile using your existing update-profile endpoint
  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!authState.token) {
        return { success: false, message: 'Not authenticated' };
      }

      console.log('🔄 Updating user profile...');

      const response = await fetch('https://citizenagriculture.in/api/auth/update-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = data.user;
        
        // Update stored user data
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
        }));

        console.log('✅ User profile updated successfully');
        return { success: true };
      } else {
        // Handle specific errors
        if (response.status === 401) {
          // Token expired, logout user
          console.log('❌ Token expired, logging out...');
          await logout();
          return { success: false, message: 'Session expired. Please login again.' };
        }
        
        if (response.status === 409) {
          return { success: false, message: data.message };
        }
        
        console.log('❌ Profile update failed:', data.message);
        return { success: false, message: data.message || 'Update failed' };
      }
    } catch (error) {
      console.error('❌ Update user error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      console.log('🔄 Logging out...');

      // Clear stored auth data
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('user'),
      ]);

      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });

      console.log('✅ Logout successful');
      // Navigate to sign-in screen
      router.replace('/sign-in');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    updateUser,
    checkAuthStatus,
    navigateToProfile,
    navigateToHome,
    navigateToCart,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};