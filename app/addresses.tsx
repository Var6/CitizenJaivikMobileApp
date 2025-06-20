// app/addresses.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  name: string;
  phone: string;
  address: string;
  pincode: string;
  isDefault: boolean;
}

interface UserProfile {
  phone: string;
  name: string;
  email: string;
  addresses: Address[];
  orders: any[];
  createdAt: string;
  lastLoginAt: string;
  isVerified: boolean;
}

export default function AddressesScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: 'Home' as 'Home' | 'Work' | 'Other',
    name: '',
    phone: '',
    address: '',
    pincode: '',
  });
   const navigation = useNavigation();
    
    React.useLayoutEffect(() => {
      navigation.setOptions({ headerShown: false });
    }, []);
  

  const addressTypes: ('Home' | 'Work' | 'Other')[] = ['Home', 'Work', 'Other'];
  
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_profile');
      if (userData) {
        const profile = JSON.parse(userData);
        setUserProfile(profile);
      } else {
        // User not logged in, redirect to sign in
        Alert.alert(
          'Sign In Required',
          'Please sign in to manage your addresses.',
          [
            { text: 'Cancel', onPress: () => router.back() },
            { text: 'Sign In', onPress: () => router.push('/sign-in') }
          ]
        );
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load addresses. Please try again.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserProfile = async (updatedProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  };

  const handleAddAddress = () => {
    if (!userProfile) return;
    
    setEditingAddress(null);
    setFormData({
      type: 'Home',
      name: userProfile.name,
      phone: userProfile.phone,
      address: '',
      pincode: '',
    });
    setShowAddModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      address: address.address,
      pincode: address.pincode,
    });
    setShowAddModal(true);
  };

  const handleSaveAddress = async () => {
    if (!userProfile) return;
    
    if (!formData.name || !formData.phone || !formData.address || !formData.pincode) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Validate pincode (must start with 800)
    if (!/^800\d{3}$/.test(formData.pincode)) {
      Alert.alert('Error', 'Sorry, we only deliver to pincodes starting with 800***');
      return;
    }

    try {
      let updatedAddresses = [...userProfile.addresses];

      if (editingAddress) {
        // Update existing address
        updatedAddresses = updatedAddresses.map(addr => 
          addr.id === editingAddress.id 
            ? { ...addr, ...formData }
            : addr
        );
        Alert.alert('Success', 'Address updated successfully!');
      } else {
        // Add new address
        const newAddress: Address = {
          id: `addr_${Date.now()}`,
          ...formData,
          isDefault: updatedAddresses.length === 0, // First address is default
        };
        updatedAddresses.push(newAddress);
        Alert.alert('Success', 'Address added successfully!');
      }

      const updatedProfile = {
        ...userProfile,
        addresses: updatedAddresses,
      };

      await saveUserProfile(updatedProfile);
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save address. Please try again.');
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    if (!userProfile) return;
    
    const addressToDelete = userProfile.addresses.find(addr => addr.id === addressId);
    
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete this ${addressToDelete?.type.toLowerCase()} address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              let updatedAddresses = userProfile.addresses.filter(addr => addr.id !== addressId);
              
              // If deleted address was default and there are other addresses, make the first one default
              if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
                updatedAddresses[0].isDefault = true;
              }

              const updatedProfile = {
                ...userProfile,
                addresses: updatedAddresses,
              };

              await saveUserProfile(updatedProfile);
              Alert.alert('Success', 'Address deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    if (!userProfile) return;
    
    try {
      const updatedAddresses = userProfile.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));

      const updatedProfile = {
        ...userProfile,
        addresses: updatedAddresses,
      };

      await saveUserProfile(updatedProfile);
      Alert.alert('Success', 'Default address updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default address. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="location-outline" size={60} color="#2e7d32" />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff4757" />
          <Text style={styles.errorText}>Unable to load addresses</Text>
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Addresses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddAddress}
        >
          <Ionicons name="add" size={24} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Banner */}
        <View style={styles.userBanner}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={40} color="#2e7d32" />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userProfile.name}</Text>
              <Text style={styles.userPhone}>{userProfile.phone}</Text>
            </View>
          </View>
          <Text style={styles.addressCount}>
            {userProfile.addresses.length} {userProfile.addresses.length === 1 ? 'Address' : 'Addresses'}
          </Text>
        </View>

        {userProfile.addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="location-outline" size={80} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>No Addresses Saved</Text>
            <Text style={styles.emptySubtitle}>
              Add your delivery addresses to make checkout faster
            </Text>
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={handleAddAddress}
            >
              <Ionicons name="add" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.addFirstButtonText}>Add Your First Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color="#2e7d32" />
              <Text style={styles.infoText}>
                We currently deliver to pincodes starting with 800*** in Jamshedpur area
              </Text>
            </View>

            {/* Addresses List */}
            {userProfile.addresses.map((address) => (
              <View key={address.id} style={styles.addressCard}>
                {/* Address Header */}
                <View style={styles.addressHeader}>
                  <View style={styles.addressTypeContainer}>
                    <Ionicons 
                      name={
                        address.type === 'Home' ? 'home' :
                        address.type === 'Work' ? 'business' : 'location'
                      }
                      size={20} 
                      color="#2e7d32" 
                    />
                    <Text style={styles.addressType}>{address.type}</Text>
                  </View>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#fff" />
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>

                {/* Address Details */}
                <View style={styles.addressDetails}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  <Text style={styles.addressPhone}>{address.phone}</Text>
                  <Text style={styles.addressText}>
                    {address.address}
                  </Text>
                  <Text style={styles.addressPincode}>Pincode: {address.pincode}</Text>
                </View>

                {/* Address Actions */}
                <View style={styles.addressActions}>
                  {!address.isDefault && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#2e7d32" />
                      <Text style={[styles.actionText, {color: '#2e7d32'}]}>Set Default</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditAddress(address)}
                  >
                    <Ionicons name="create-outline" size={16} color="#666" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  
                  {userProfile.addresses.length > 1 && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteAddress(address.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ff4757" />
                      <Text style={[styles.actionText, {color: '#ff4757'}]}>Delete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {/* Add New Address Button */}
            <TouchableOpacity 
              style={styles.addNewButton}
              onPress={handleAddAddress}
            >
              <Ionicons name="add-circle-outline" size={24} color="#2e7d32" />
              <Text style={styles.addNewButtonText}>Add New Address</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </Text>
            <TouchableOpacity onPress={handleSaveAddress}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Address Type Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Address Type</Text>
              <View style={styles.typeSelector}>
                {addressTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      formData.type === type && styles.typeOptionSelected
                    ]}
                    onPress={() => setFormData({...formData, type})}
                  >
                    <Ionicons 
                      name={
                        type === 'Home' ? 'home-outline' :
                        type === 'Work' ? 'business-outline' : 'location-outline'
                      }
                      size={20}
                      color={formData.type === type ? '#fff' : '#2e7d32'}
                    />
                    <Text style={[
                      styles.typeOptionText,
                      formData.type === type && styles.typeOptionTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Enter full name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Phone Number */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            {/* Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Complete Address *</Text>
              <TextInput
                style={styles.formTextArea}
                value={formData.address}
                onChangeText={(text) => setFormData({...formData, address: text})}
                placeholder="House/Flat No., Building, Street, Area, City"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Pincode */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pincode *</Text>
              <TextInput
                style={styles.formInput}
                value={formData.pincode}
                onChangeText={(text) => setFormData({...formData, pincode: text})}
                placeholder="Enter 6-digit pincode"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
              />
              <Text style={styles.formNote}>
                We deliver to pincodes starting with 800*** only
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#87ab69',
    flex: 1,
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  addressCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5e8',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4a7c59',
    marginLeft: 10,
    lineHeight: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addressDetails: {
    marginBottom: 15,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  addressPincode: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 15,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2e7d32',
    borderStyle: 'dashed',
  },
  addNewButtonText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  typeOptionSelected: {
    backgroundColor: '#2e7d32',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },
  typeOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  formTextArea: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    height: 100,
  },
  formNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});