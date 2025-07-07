// app/complete-profile.tsx
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useNavigation, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import LogoToo from '@/components/ui/LogoToo';

export default function CompleteProfileScreen() {
  const navigation = useNavigation();
  const { completeProfile, navigateToProfile } = useAuth();
  const params = useLocalSearchParams();
  
  // Get user data from params (passed from Google Sign-In)
  const userEmail = params.email as string;
  const userName = params.name as string;

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const [profileData, setProfileData] = useState({
    email: userEmail || '',
    mobile: '',
    address: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!userEmail) {
      Alert.alert(
        'Error',
        'Missing user information. Please sign in again.',
        [{ text: 'OK', onPress: () => router.replace('/sign-in') }]
      );
    }
  }, [userEmail]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Mobile validation
    if (!profileData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(profileData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number starting with 6-9';
    }

    // Address validation
    if (!profileData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (profileData.address.length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    } else if (profileData.address.length > 500) {
      newErrors.address = 'Address must be less than 500 characters';
    }

    // Pincode validation
    if (!profileData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(profileData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle form submission
  const handleCompleteProfile = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again');
      return;
    }

    setIsLoading(true);

    try {
      const result = await completeProfile({
        email: profileData.email,
        mobile: profileData.mobile,
        address: profileData.address,
        pincode: profileData.pincode,
      });

      if (result.success) {
        Alert.alert(
          '✅ Profile Completed!',
          `🌿 Welcome to Citizen Jaivik, ${userName}!\n\n🥬 Your profile is now complete\n🚚 You can start ordering organic products\n💚 Enjoy fresh deliveries to your doorstep`,
          [
            {
              text: '🛒 Start Shopping',
              onPress: () => navigateToProfile(),
            }
          ],
          { cancelable: false }
        );
      } else {
        // Handle specific error cases
        if (result.message?.includes('mobile number is already registered')) {
          setErrors({ mobile: 'This mobile number is already registered with another account' });
          Alert.alert('Mobile Number Conflict', 'This mobile number is already registered with another account. Please use a different mobile number.');
        } else {
          Alert.alert('Profile Completion Failed', result.message || 'Failed to complete profile. Please try again.');
        }
      }
    } catch (error) {
      console.error('Complete profile error:', error);
      Alert.alert('Error', 'Something went wrong. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userEmail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
     <StatusBar barStyle="dark-content" translucent={false} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeIcon}>
              <LogoToo size='large'/>
            </View>
            <Text style={styles.welcomeTitle}>Almost There!</Text>
            <Text style={styles.welcomeSubtitle}>
              Complete your profile to start ordering fresh organic products
            </Text>
          </View>

          {/* User Info Display */}
          <View style={styles.userInfoCard}>
            <View style={styles.userInfoHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
              <Text style={styles.userInfoTitle}>Google Account Connected</Text>
            </View>
            <View style={styles.userInfoDetails}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Additional Information</Text>
            <Text style={styles.formSubtitle}>
              We need these details for delivery and communication
            </Text>

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, errors.mobile && styles.inputError]}
                  value={profileData.mobile}
                  onChangeText={(text) => handleInputChange('mobile', text)}
                  placeholder="Enter your 10-digit mobile number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isLoading}
                />
              </View>
              {errors.mobile && (
                <Text style={styles.errorText}>{errors.mobile}</Text>
              )}
              <Text style={styles.helperText}>
                Starting with 6, 7, 8, or 9 (e.g., 9876543210)
              </Text>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Delivery Address *</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIconTop} />
                <TextInput
                  style={[styles.textAreaInput, errors.address && styles.inputError]}
                  value={profileData.address}
                  onChangeText={(text) => handleInputChange('address', text)}
                  placeholder="House/Flat No., Building, Street, Area, City"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
              <Text style={styles.helperText}>
                Complete address where you'd like your orders delivered
              </Text>
            </View>

            {/* Pincode */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="location-sharp" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, errors.pincode && styles.inputError]}
                  value={profileData.pincode}
                  onChangeText={(text) => handleInputChange('pincode', text)}
                  placeholder="Enter 6-digit pincode"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!isLoading}
                />
              </View>
              {errors.pincode && (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              )}
              <Text style={styles.helperText}>
                Delivery area postal code
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleCompleteProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingButtonContent}>
                  <Text style={styles.submitButtonText}>Completing Profile...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.submitButtonText}>Complete Profile & Continue</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle-outline" size={20} color="#2e7d32" />
            <Text style={styles.infoText}>
              Your information is secure and will only be used for order delivery and communication. 
              All fields marked with * are required.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  welcomeSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  userInfoCard: {
    backgroundColor: '#f0f8f0',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginLeft: 8,
  },
  userInfoDetails: {
    paddingLeft: 32,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  inputIconTop: {
    position: 'absolute',
    left: 12,
    top: 15,
    zIndex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    paddingLeft: 45,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    paddingLeft: 45,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    height: 100,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoNote: {
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
    fontSize: 13,
    color: '#4a7c59',
    marginLeft: 10,
    lineHeight: 18,
  },
});