// app/sign-in.tsx
import React, { useState, useRef } from 'react';
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
import { router, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoToo from '@/components/ui/LogoToo';

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

export default function SignInScreen() {
  const [step, setStep] = useState<'phone' | 'profile'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
    
    React.useLayoutEffect(() => {
      navigation.setOptions({ headerShown: false });
    }, []);
  
  // Profile setup states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: '',
    pincode: '',
  });

  // Format phone number
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
    }
  };

  // Handle phone number submission
  const handlePhoneSubmit = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Check if user already exists
      const existingUser = await AsyncStorage.getItem('user_profile');
      if (existingUser) {
        const userData = JSON.parse(existingUser);
        if (userData.phone === `+91${phoneNumber}`) {
          // Existing user - direct login
          userData.lastLoginAt = new Date().toISOString();
          await AsyncStorage.setItem('user_profile', JSON.stringify(userData));
          await AsyncStorage.setItem('is_logged_in', 'true');
          
          setIsLoading(false);
         Alert.alert(
  `🌟 Welcome Back,\n \n ${userData.name}!`, 
  `🌿 Your organic marketplace awaits!\n\n✨ Discover new arrivals\n🚚 Check your orders\n💚 Continue your wellness journey`,
  [
    { 
      text: '🚀 Let\'s Go!', 
      onPress: () => router.replace('/(tabs)/profile') 
    }
  ]
);
          return;
        }
      }
      
      // New user - setup profile
      setStep('profile');
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking user:', error);
      setStep('profile');
      setIsLoading(false);
    }
  };

  // Complete profile setup
  const handleCompleteProfile = async () => {
    if (!profileData.name || !profileData.email || !profileData.address || !profileData.pincode) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate pincode
    if (!/^800\d{3}$/.test(profileData.pincode)) {
      Alert.alert('Error', 'We only deliver to pincodes starting with 800***');
      return;
    }

    setIsLoading(true);

    // Create user profile
    const userProfile: UserProfile = {
      phone: `+91${phoneNumber}`,
      name: profileData.name,
      email: profileData.email,
      addresses: [{
        id: `addr_${Date.now()}`,
        type: 'Home',
        name: profileData.name,
        phone: `+91${phoneNumber}`,
        address: profileData.address,
        pincode: profileData.pincode,
        isDefault: true
      }],
      orders: [],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isVerified: true
    };

    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
      await AsyncStorage.setItem('is_logged_in', 'true');
      
      setIsLoading(false);
      Alert.alert(
  '✅ Account Created Successfully!', 
  `🌿 Welcome to the family, ${profileData.name}!\n\n🥬 Discover premium organic products\n🚚 Get fresh deliveries to your doorstep\n💚 Join thousands of health-conscious customers\n\nLet's get you started on your wellness journey!`,
  [
    { 
      text: '🛒 Explore Products', 
      onPress: () => router.replace('/(tabs)/profile'),
      style: 'default'
    }
  ],
  { cancelable: false }
);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    }
  };

  const renderPhoneStep = () => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>Enter Phone Number</Text>
      
      <View style={styles.phoneInputContainer}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
        </View>
        <TextInput
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={formatPhoneNumber}
          placeholder="Enter 10-digit phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          maxLength={10}
          autoFocus
        />
      </View>

      <Text style={styles.helperText}>
        Enter your mobile number to continue
      </Text>

      <TouchableOpacity 
        style={[styles.primaryButton, (!phoneNumber || phoneNumber.length !== 10 || isLoading) && styles.disabledButton]}
        onPress={handlePhoneSubmit}
        disabled={!phoneNumber || phoneNumber.length !== 10 || isLoading}
      >
        {isLoading ? (
          <Text style={styles.primaryButtonText}>Checking...</Text>
        ) : (
          <>
            <Ionicons name="arrow-forward-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.primaryButtonText}>Continue</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderProfileStep = () => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>Complete Your Profile</Text>
      <Text style={styles.formSubtitle}>Set up your delivery details</Text>
      
      {/* Phone Display */}
      <View style={styles.phoneDisplay}>
        <Text style={styles.phoneDisplayText}>+91 {phoneNumber}</Text>
        <TouchableOpacity onPress={() => setStep('phone')}>
          <Ionicons name="create-outline" size={20} color="#2e7d32" />
        </TouchableOpacity>
      </View>
      
      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={profileData.name}
          onChangeText={(text) => setProfileData({...profileData, name: text})}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
        />
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.textInput}
          value={profileData.email}
          onChangeText={(text) => setProfileData({...profileData, email: text})}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Delivery Address *</Text>
        <TextInput
          style={styles.textAreaInput}
          value={profileData.address}
          onChangeText={(text) => setProfileData({...profileData, address: text})}
          placeholder="House/Flat No., Building, Street, Area"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Pincode */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pincode *</Text>
        <TextInput
          style={styles.textInput}
          value={profileData.pincode}
          onChangeText={(text) => setProfileData({...profileData, pincode: text})}
          placeholder="Enter 6-digit pincode"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          maxLength={6}
        />
        <Text style={styles.deliveryNote}>
          We deliver to pincodes starting with 800*** only
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleCompleteProfile}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={styles.primaryButtonText}>Creating Profile...</Text>
        ) : (
          <>
            <Ionicons name="person-add-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.primaryButtonText}>Complete Setup</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'phone' ? 'Sign In' : 'Setup Profile'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, step === 'phone' && styles.activeStep, step === 'profile' && styles.completedStep]}>
            <Text style={[styles.progressText, step === 'phone' && styles.activeProgressText, step === 'profile' && styles.completedProgressText]}>1</Text>
          </View>
          <View style={[styles.progressLine, step === 'profile' && styles.completedLine]} />
          <View style={[styles.progressStep, step === 'profile' && styles.activeStep]}>
            <Text style={[styles.progressText, step === 'profile' && styles.activeProgressText]}>2</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeIcon}>
              <LogoToo size='large'/>
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Citizen Jaivik</Text>
            <Text style={styles.welcomeSubtitle}>
              {step === 'phone' && 'Enter your phone number to get started'}
              {step === 'profile' && 'Complete your profile for seamless ordering'}
            </Text>
          </View>

          {/* Form Steps */}
          {step === 'phone' && renderPhoneStep()}
          {step === 'profile' && renderProfileStep()}

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle-outline" size={20} color="#2e7d32" />
            <Text style={styles.infoText}>
              Your data is stored securely on your device. For a new device, you'll need to set up your profile again.
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 55,
    backgroundColor: '#fff',
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#2e7d32',
  },
  completedStep: {
    backgroundColor: '#2e7d32',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  activeProgressText: {
    color: '#fff',
  },
  completedProgressText: {
    color: '#fff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 10,
  },
  completedLine: {
    backgroundColor: '#2e7d32',
  },
  content: {
    flex: 1,
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
    marginBottom: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  countryCode: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  phoneDisplayText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    height: 80,
  },
  deliveryNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
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