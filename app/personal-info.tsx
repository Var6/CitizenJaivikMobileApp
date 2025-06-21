// app/personal-info.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

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

export default function PersonalInfoScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    joinedDate: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);
   const navigation = useNavigation();
    
    React.useLayoutEffect(() => {
      navigation.setOptions({ headerShown: false });
    }, []);
  

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_profile');
      if (userData) {
        const profile = JSON.parse(userData);
        setUserProfile(profile);
        
        // Split full name into first and last name
        const nameParts = profile.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        setFormData({
          firstName,
          lastName,
          email: profile.email,
          phone: profile.phone,
          joinedDate: new Date(profile.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
        });
      } else {
        // User not logged in, redirect to sign in
        Alert.alert(
          'Sign In Required',
          'Please sign in to access your personal information.',
          [
            { text: 'Cancel', onPress: () => router.back() },
            { text: 'Sign In', onPress: () => router.push('/sign-in') }
          ]
        );
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please try again.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    setIsSaving(true);
    
    try {
      if (userProfile) {
        // Update user profile
        const updatedProfile = {
          ...userProfile,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          lastUpdatedAt: new Date().toISOString(),
        };

        // Update addresses with new name
        updatedProfile.addresses = updatedProfile.addresses.map(addr => ({
          ...addr,
          name: updatedProfile.name
        }));

        await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
        
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      // Reset form data to original values
      const nameParts = userProfile.name.split(' ');
      setFormData({
        ...formData,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: userProfile.email,
      });
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will remove all your data including addresses and order history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['user_profile', 'is_logged_in']);
              Alert.alert(
                'Account Deleted',
                'Your account has been deleted successfully.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle-outline" size={60} color="#2e7d32" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff4757" />
          <Text style={styles.errorText}>Unable to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
          <Ionicons 
            name={isEditing ? "checkmark" : "create-outline"} 
            size={24} 
            color="#2e7d32" 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#2e7d32" />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.changePhotoBtn}
            onPress={() => Alert.alert('Coming Soon', 'Photo upload feature will coming soon!')}
          >
            <Ionicons name="camera-outline" size={16} color="#2e7d32" style={{marginRight: 5}} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
          <Text style={styles.verifiedText}>✅ Verified Account</Text>
        </View>

        {/* Account Info Card */}
        <View style={styles.accountInfoCard}>
          <View style={styles.accountInfoHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#2e7d32" />
            <Text style={styles.accountInfoTitle}>Account Information</Text>
          </View>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Member Since</Text>
            <Text style={styles.accountInfoValue}>{formData.joinedDate}</Text>
          </View>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Account Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active & Verified</Text>
            </View>
          </View>
          <View style={styles.accountInfoItem}>
            <Text style={styles.accountInfoLabel}>Total Orders</Text>
            <Text style={styles.accountInfoValue}>{userProfile.orders.length}</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.firstName}
              onChangeText={(text) => setFormData({...formData, firstName: text})}
              editable={isEditing}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.lastName}
              onChangeText={(text) => setFormData({...formData, lastName: text})}
              editable={isEditing}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              editable={isEditing}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
              placeholderTextColor="#999"
            />
          </View>

          {/* Phone (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneContainer}>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.phone}
                editable={false}
                placeholder="Phone number"
                placeholderTextColor="#999"
              />
              <View style={styles.verifiedIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
              </View>
            </View>
            <Text style={styles.helperText}>
              Phone number is verified and cannot be changed
            </Text>
          </View>
        </View>

        {/* Action Buttons (only show when editing) */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4757" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
          <Text style={styles.dangerNote}>
            This will permanently delete your account and all associated data. This action cannot be undone.
          </Text>
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Your information is stored securely on your device. Changes will be reflected across the app immediately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#87ab69',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 3,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 20,
    marginBottom: 10,
  },
  changePhotoText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },
  verifiedText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  accountInfoCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 8,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  accountInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  accountInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  accountInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  accountInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2e7d32',
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  formSection: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 8,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  phoneContainer: {
    position: 'relative',
  },
  verifiedIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  dangerZone: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 8,
    padding: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4757',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
    marginBottom: 15,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4757',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  dangerNote: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 30,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    lineHeight: 20,
  },
});