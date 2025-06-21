// app/(tabs)/profile.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface UserProfile {
  phone: string;
  name: string;
  email: string;
  addresses: {
    id: string;
    type: 'Home' | 'Work' | 'Other';
    name: string;
    phone: string;
    address: string;
    pincode: string;
    isDefault: boolean;
  }[];
  orders: any[];
  createdAt: string;
  lastLoginAt: string;
  isVerified: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load user data when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const loginStatus = await AsyncStorage.getItem('is_logged_in');
      const userData = await AsyncStorage.getItem('user_profile');
      
      if (loginStatus === 'true' && userData) {
        setIsLoggedIn(true);
        setUserProfile(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoggedIn(false);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
 Alert.alert(
   '👋 Sign Out',
   'Are you sure you want to sign out?\n\n📱 Your data will remain safely stored on this device for when you return.',
   [
     { text: 'Cancel', style: 'cancel' },
     {
       text: '🚙 Sign Out',
       style: 'destructive',
       onPress: async () => {
         try {
           await AsyncStorage.setItem('is_logged_in', 'false');
           setIsLoggedIn(false);
           setUserProfile(null);
           Alert.alert(
             '✅ Signed Out Successfully', 
             '🌱 Thank you for choosing Citizen Jaivik!\n\nSee you soon for more organic goodness!',
             [{ text: '👍 OK' }]
           );
         } catch (error) {
           console.error('Error signing out:', error);
           Alert.alert('❌ Error', 'Something went wrong while signing out. Please try again.');
         }
       }
     }
   ]
 );
};

  const handleFeaturePress = (feature: string) => {
    // Check if user is logged in for protected features
    const protectedFeatures = ['Personal Information', 'Order History', 'Addresses', 'Notifications', 'Payment Methods', 'Feedback'];
    
    if (protectedFeatures.includes(feature) && !isLoggedIn) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to access this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in') }
        ]
      );
      return;
    }

    switch (feature) {
      case 'Personal Information':
        router.push('/personal-info');
        break;
      case 'Order History':
        router.push('/order-history');
        break;
      case 'Addresses':
        router.push('/addresses');
        break;
      case 'Payment Methods':
        router.push('/payment-methods');
        break;
      case 'Feedback':
        router.push('/feedback');
        break;
      case 'Notifications':
        router.push('/notifications');
        break;
      case 'Help & Support':
        router.push('/help-support');
        break;
      case 'About':
        router.push('/about');
        break;
      case 'Sign In':
        router.push('/sign-in');
        break;
      case 'Website':
        Linking.openURL('https://www.citizenagriculture.in/');
        break;
      case 'Facebook':
        Linking.openURL('https://www.facebook.com/Citizenagriculture');
        break;
      case 'Instagram':
        Linking.openURL('https://www.instagram.com/citizenjaivik/');
        break;
      default:
        Alert.alert('Coming Soon', `${feature} feature will be available soon!`);
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'Personal Information',
      icon: 'person-outline',
      description: 'Manage your account details',
      protected: true,
    },
    {
      id: '2',
      title: 'Order History',
      icon: 'receipt-outline',
      description: 'View your past orders',
      protected: true,
    },
    {
      id: '3',
      title: 'Addresses',
      icon: 'location-outline',
      description: 'Manage delivery addresses',
      protected: true,
    },
     {
      id: '4',
      title: 'Feedback',
      icon: 'feedback-outline',
      description: 'Deliver your feedback directly to us',
      protected: true,
    },
    {
      id: '5',
      title: 'Payment Methods',
      icon: 'card-outline',
      description: 'Manage payment options',
      protected: false,
    },
    {
      id: '6',
      title: 'Notifications',
      icon: 'notifications-outline',
      description: 'Notification preferences',
      protected: true,
    },
    {
      id: '7',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      description: 'Get help or contact us',
      protected: false,
    },
    {
      id: '8',
      title: 'About',
      icon: 'information-circle-outline',
      description: 'App version and info',
      protected: false,
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        item.protected && !isLoggedIn && styles.disabledMenuItem
      ]}
      onPress={() => handleFeaturePress(item.title)}
    >
      <View style={styles.menuItemLeft}>
        <View style={[
          styles.iconContainer,
          item.protected && !isLoggedIn && styles.disabledIconContainer
        ]}>
          <Ionicons 
            name={item.icon} 
            size={24} 
            color={item.protected && !isLoggedIn ? "#ccc" : "#2e7d32"} 
          />
        </View>
        <View style={styles.menuItemText}>
          <Text style={[
            styles.menuItemTitle,
            item.protected && !isLoggedIn && styles.disabledText
          ]}>
            {item.title}
          </Text>
          <Text style={[
            styles.menuItemDescription,
            item.protected && !isLoggedIn && styles.disabledText
          ]}>
            {item.description}
            {item.protected && !isLoggedIn && ' (Sign in required)'}
          </Text>
        </View>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={item.protected && !isLoggedIn ? "#eee" : "#ccc"} 
      />
    </TouchableOpacity>
  );

  const renderUserSection = () => {
    if (isLoggedIn && userProfile) {
      // Logged in user
      const defaultAddress = userProfile.addresses.find(addr => addr.isDefault);
      
      return (
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
            </View>
            <Ionicons name="person" size={40} color="#2e7d32" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userPhone}>{userProfile.phone}</Text>
            <Text style={styles.userAddress}>
              {defaultAddress ? `${defaultAddress.address.substring(0, 30)}...` : 'No address'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={16} color="#ff4757" />
          </TouchableOpacity>
        </View>
      );
    } else {
      // Guest user
      return (
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="#2e7d32" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.userEmail}>Sign in to access all features</Text>
          </View>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => handleFeaturePress('Sign In')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderStatsCards = () => {
    if (!isLoggedIn || !userProfile) return null;

    return (
     <View style={styles.statsSection}>
 <TouchableOpacity 
   style={styles.statsCard}
   onPress={() => router.push('/order-history')}
   activeOpacity={0.7}
 >
   <Ionicons name="receipt-outline" size={24} color="#2e7d32" />
   <Text style={styles.statsNumber}>{userProfile.orders.length}</Text>
   <Text style={styles.statsLabel}>Orders</Text>
 </TouchableOpacity>
 
 <TouchableOpacity 
   style={styles.statsCard}
   onPress={() => router.push('/addresses')}
   activeOpacity={0.7}
 >
   <Ionicons name="location-outline" size={24} color="#2e7d32" />
   <Text style={styles.statsNumber}>{userProfile.addresses.length}</Text>
   <Text style={styles.statsLabel}>Addresses</Text>
 </TouchableOpacity>
 
 <View style={styles.statsCard}>
   <Ionicons name="time-outline" size={24} color="#2e7d32" />
   <Text style={styles.statsNumber}>
     {Math.floor((new Date().getTime() - new Date(userProfile.createdAt).getTime()) / (1000 * 3600 * 24))}
   </Text>
   <Text style={styles.statsLabel}>Days</Text>
 </View>
</View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="leaf" size={50} color="#2e7d32" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fdf8" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {isLoggedIn && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>

        {/* User Info Section */}
        {renderUserSection()}

        {/* Stats Cards (for logged in users) */}
        {renderStatsCards()}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>Citizen Jaivik</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Connecting you with organic farmers for fresh, healthy produce
          </Text>
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Connect with us</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleFeaturePress('Website')}
            >
              <Ionicons name="globe-outline" size={20} color="#2e7d32" />
              <Text style={styles.socialButtonText}>Website</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleFeaturePress('Facebook')}
            >
              <Ionicons name="logo-facebook" size={20} color="#1877f2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleFeaturePress('Instagram')}
            >
              <Ionicons name="logo-instagram" size={20} color="#e4405f" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2e7d32',
    marginRight: 6,
  },
  onlineText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 2,
    fontWeight: '500',
  },
  userAddress: {
    fontSize: 12,
    color: '#666',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  signInButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff0f0',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsCard: {
    alignItems: 'center',
    flex: 1,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  disabledMenuItem: {
    opacity: 0.6,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  disabledIconContainer: {
    backgroundColor: '#f5f5f5',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
  },
  disabledText: {
    color: '#ccc',
  },
  appInfo: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  socialSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    alignItems: 'center',
    padding: 10,
  },
  socialButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});