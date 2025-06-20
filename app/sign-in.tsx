// app/sign-in.tsx
import React, { useState, useRef, useEffect } from 'react';
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
import { router } from 'expo-router';
import { auth } from '../firebaseConfig';
import { 
  PhoneAuthProvider, 
  signInWithCredential,
  RecaptchaVerifier 
} from 'firebase/auth';

export default function SignInScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationId, setVerificationId] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  const otpInputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Initialize reCAPTCHA verifier
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response: string) => {
        // reCAPTCHA solved
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        // Response expired
        console.log('reCAPTCHA expired');
      }
    });
    setRecaptchaVerifier(verifier);

    return () => {
      if (verifier) {
        verifier.clear();
      }
    };
  }, []);

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format phone number
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
    }
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!recaptchaVerifier) {
      Alert.alert('Error', 'reCAPTCHA not initialized. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        `+91${phoneNumber}`,
        recaptchaVerifier
      );
      setVerificationId(verificationId);
      setIsOtpSent(true);
      setIsLoading(false);
      startResendTimer();
      Alert.alert('OTP Sent', `Verification code sent to +91${phoneNumber}`);
    } catch (error: any) {
      setIsLoading(false);
      console.error('OTP Send Error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Handle OTP input
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otpCode);
      const userCredential = await signInWithCredential(auth, credential);
      
      setIsLoading(false);
      Alert.alert(
        'Success!', 
        'Phone number verified successfully!',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Store user info if needed
              console.log('User signed in:', userCredential.user.uid);
              router.replace('/(tabs)/profile');
            }
          }
        ]
      );
    } catch (error: any) {
      setIsLoading(false);
      console.error('OTP Verification Error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Invalid OTP. Please try again.';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    if (!recaptchaVerifier) {
      Alert.alert('Error', 'reCAPTCHA not initialized. Please try again.');
      return;
    }
    
    setIsLoading(true);
    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const newVerificationId = await phoneProvider.verifyPhoneNumber(
        `+91${phoneNumber}`,
        recaptchaVerifier
      );
      setVerificationId(newVerificationId);
      setIsLoading(false);
      startResendTimer();
      Alert.alert('OTP Resent', `New verification code sent to +91${phoneNumber}`);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Resend OTP Error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  // Go back to phone input
  const handleEditPhone = () => {
    setIsOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setResendTimer(0);
  };

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
          <Text style={styles.headerTitle}>Sign In</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="leaf" size={50} color="#2e7d32" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Citizen Jaivik</Text>
            <Text style={styles.welcomeSubtitle}>
              {isOtpSent 
                ? 'Enter the verification code sent to your phone'
                : 'Enter your phone number to get started with organic shopping'
              }
            </Text>
          </View>

          {!isOtpSent ? (
            /* Phone Number Input */
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
                We'll send you a verification code via SMS
              </Text>

              <TouchableOpacity 
                style={[styles.primaryButton, (!phoneNumber || phoneNumber.length !== 10 || isLoading) && styles.disabledButton]}
                onPress={handleSendOTP}
                disabled={!phoneNumber || phoneNumber.length !== 10 || isLoading}
              >
                {isLoading ? (
                  <Text style={styles.primaryButtonText}>Sending OTP...</Text>
                ) : (
                  <>
                    <Ionicons name="paper-plane-outline" size={20} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.primaryButtonText}>Send OTP</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* OTP Verification */
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Enter Verification Code</Text>
              
              <View style={styles.phoneDisplay}>
                <Text style={styles.phoneDisplayText}>+91 {phoneNumber}</Text>
                <TouchableOpacity onPress={handleEditPhone}>
                  <Ionicons name="create-outline" size={20} color="#2e7d32" />
                </TouchableOpacity>
              </View>

              {/* OTP Input */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { otpInputs.current[index] = ref; }}
                    style={[styles.otpInput, digit && styles.otpInputFilled]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <TouchableOpacity 
                  onPress={handleResendOTP}
                  disabled={resendTimer > 0 || isLoading}
                >
                  <Text style={[styles.resendButton, (resendTimer > 0 || isLoading) && styles.disabledText]}>
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, (otp.join('').length !== 6 || isLoading) && styles.disabledButton]}
                onPress={handleVerifyOTP}
                disabled={otp.join('').length !== 6 || isLoading}
              >
                {isLoading ? (
                  <Text style={styles.primaryButtonText}>Verifying...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.primaryButtonText}>Verify & Sign In</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Terms & Privacy */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Why Sign In?</Text>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.benefitText}>Track your orders in real-time</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.benefitText}>Save delivery addresses</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.benefitText}>Get personalized recommendations</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.benefitText}>Exclusive offers and discounts</Text>
            </View>
          </View>

          {/* reCAPTCHA container - required for Firebase Auth */}
          <View style={{ height: 0, width: 0, opacity: 0 }}>
            <div id="recaptcha-container"></div>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  welcomeIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
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
    marginBottom: 20,
    textAlign: 'center',
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: '#2e7d32',
    backgroundColor: '#f0f8f0',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resendButton: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  disabledText: {
    color: '#ccc',
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
  termsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  benefitsSection: {
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
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
});