// app/sign-in.tsx - Simplified version
import React, { useState } from 'react';
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
import LogoToo from '@/components/ui/LogoToo';
import { useAuth } from '@/context/AuthContext';

export default function SignInScreen() {
  const [step, setStep] = useState<'email' | 'signup'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  
  // Get auth functions from context
  const { login, signup, navigateToProfile } = useAuth();
    
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);
  
  // Email/Password login states
  const [loginData, setLoginData] = useState({
    emailOrMobile: '',
    password: '',
  });

  // Signup states
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    pincode: '',
    password: '',
  });

  // Handle email/password login
  const handleEmailLogin = async () => {
    if (!loginData.emailOrMobile || !loginData.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(loginData.emailOrMobile, loginData.password);
      
      if (result.success) {
        Alert.alert(
          '🌟 Welcome Back!',
          '🌿 Successfully signed in!\n\n✨ Your organic marketplace awaits',
          [
            { 
              text: '🚀 Let\'s Go!', 
              onPress: () => navigateToProfile()
            }
          ]
        );
      } else {
        Alert.alert('Login Failed', result.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async () => {
    // Validate all fields
    if (!signupData.fullName || !signupData.email || !signupData.mobile || 
        !signupData.address || !signupData.pincode || !signupData.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate mobile (Indian mobile number)
    if (!/^[6-9]\d{9}$/.test(signupData.mobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(signupData.pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    // Validate password
    if (signupData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signup(signupData);
      
      if (result.success) {
        Alert.alert(
          '✅ Account Created!',
          `🌿 Welcome to the family, ${signupData.fullName}!\n\n🥬 Discover premium organic products`,
          [
            { 
              text: '🛒 Explore Products', 
              onPress: () => navigateToProfile()
            }
          ]
        );
      } else {
        Alert.alert('Signup Failed', result.message || 'Signup failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>Sign In</Text>
      <Text style={styles.formSubtitle}>Enter your credentials</Text>
      
      {/* Email/Mobile Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email or Mobile *</Text>
        <TextInput
          style={styles.textInput}
          value={loginData.emailOrMobile}
          onChangeText={(text) => setLoginData({...loginData, emailOrMobile: text})}
          placeholder="Enter email or mobile number"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password *</Text>
        <TextInput
          style={styles.textInput}
          value={loginData.password}
          onChangeText={(text) => setLoginData({...loginData, password: text})}
          placeholder="Enter password"
          placeholderTextColor="#999"
          secureTextEntry
        />
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleEmailLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={styles.primaryButtonText}>Signing in...</Text>
        ) : (
          <>
            <Ionicons name="log-in-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.signupPrompt}>
        <Text style={styles.signupPromptText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => setStep('signup')} disabled={isLoading}>
          <Text style={styles.signupLink}>Sign up here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSignupStep = () => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>Create Account</Text>
      <Text style={styles.formSubtitle}>Join the organic family</Text>
      
      {/* Full Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={signupData.fullName}
          onChangeText={(text) => setSignupData({...signupData, fullName: text})}
          placeholder="Enter your full name"
          placeholderTextColor="#999"
        />
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.textInput}
          value={signupData.email}
          onChangeText={(text) => setSignupData({...signupData, email: text})}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Mobile */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Mobile Number *</Text>
        <TextInput
          style={styles.textInput}
          value={signupData.mobile}
          onChangeText={(text) => setSignupData({...signupData, mobile: text})}
          placeholder="Enter 10-digit mobile number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      {/* Address */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Address *</Text>
        <TextInput
          style={styles.textAreaInput}
          value={signupData.address}
          onChangeText={(text) => setSignupData({...signupData, address: text})}
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
          value={signupData.pincode}
          onChangeText={(text) => setSignupData({...signupData, pincode: text})}
          placeholder="Enter 6-digit pincode"
          placeholderTextColor="#999"
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password *</Text>
        <TextInput
          style={styles.textInput}
          value={signupData.password}
          onChangeText={(text) => setSignupData({...signupData, password: text})}
          placeholder="Enter password (min 6 characters)"
          placeholderTextColor="#999"
          secureTextEntry
        />
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={styles.primaryButtonText}>Creating Account...</Text>
        ) : (
          <>
            <Ionicons name="person-add-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backToChoiceButton}
        onPress={() => setStep('email')}
        disabled={isLoading}
      >
        <Text style={styles.backToChoiceText}>← Back to sign in</Text>
      </TouchableOpacity>
    </View>
  );

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
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'email' ? 'Sign In' : 'Sign Up'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeIcon}>
              <LogoToo size='large'/>
            </View>
            <Text style={styles.welcomeTitle}>Citizen Jaivik</Text>
            <Text style={styles.welcomeSubtitle}>
              Premium organic products delivered fresh to your doorstep
            </Text>
          </View>

          {/* Form Steps */}
          {step === 'email' && renderEmailStep()}
          {step === 'signup' && renderSignupStep()}

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle-outline" size={20} color="#2e7d32" />
            <Text style={styles.infoText}>
              Your data is secured with enterprise-grade encryption. We respect your privacy.
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupPromptText: {
    fontSize: 14,
    color: '#666',
  },
  signupLink: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  backToChoiceButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backToChoiceText: {
    color: '#666',
    fontSize: 14,
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