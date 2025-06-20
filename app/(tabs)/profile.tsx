// app/(tabs)/profile.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const handleFeaturePress = (feature: string) => {
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
    },
    {
      id: '2',
      title: 'Order History',
      icon: 'receipt-outline',
      description: 'View your past orders',
    },
    {
      id: '3',
      title: 'Addresses',
      icon: 'location-outline',
      description: 'Manage delivery addresses',
    },
    {
      id: '4',
      title: 'Payment Methods',
      icon: 'card-outline',
      description: 'Manage payment options',
    },
    {
      id: '5',
      title: 'Notifications',
      icon: 'notifications-outline',
      description: 'Notification preferences',
    },
    {
      id: '6',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      description: 'Get help or contact us',
    },
    {
      id: '7',
      title: 'About',
      icon: 'information-circle-outline',
      description: 'App version and info',
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleFeaturePress(item.title)}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={24} color="#2e7d32" />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemDescription}>{item.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fdf8" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Info Section */}
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
  header: {
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
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
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