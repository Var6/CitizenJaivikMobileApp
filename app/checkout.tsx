import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../context/CartContext';
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

interface FormData {
  name: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
}

interface FormErrors {
  name: string;
  mobile: string;
  email: string;
  address: string;
  pincode: string;
}

interface TouchedFields {
  name: boolean;
  mobile: boolean;
  email: boolean;
  address: boolean;
  pincode: boolean;
}

interface Order {
  id: string;
  orderId: string;
  date: string;
  items: any[];
  total: number;
  status: string;
  deliveryAddress: string;
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    mobile: string;
    pincode: string;
  };
  platform: string;
  customerType: string;
}

export default function CheckoutScreen() {
  const { cart, clearCart, total } = useCart();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
    email: '',
    address: '',
    pincode: '',
  });

  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    mobile: false,
    email: false,
    address: false,
    pincode: false,
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    mobile: '',
    email: '',
    address: '',
    pincode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const isValid = validateForm();
    setButtonDisabled(!isValid || cart.length === 0);
  }, [formData, cart]);

  const loadUserData = async () => {
    try {
      const loginStatus = await AsyncStorage.getItem('is_logged_in');
      const userData = await AsyncStorage.getItem('user_profile');
      
      if (loginStatus === 'true' && userData) {
        const profile = JSON.parse(userData);
        setUserProfile(profile);
        setIsLoggedIn(true);
        
        // Auto-fill with user data
        setFormData({
          name: profile.name,
          mobile: profile.phone.replace('+91', ''),
          email: profile.email,
          address: '',
          pincode: '',
        });
        
        // Select default address if available
        const defaultAddress = profile.addresses.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
          setFormData(prev => ({
            ...prev,
            address: defaultAddress.address,
            pincode: defaultAddress.pincode,
          }));
        }
      } else {
        // Guest checkout - form starts empty
        setIsLoggedIn(false);
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setFormData(prev => ({
      ...prev,
      name: address.name,
      mobile: address.phone.replace('+91', ''),
      address: address.address,
      pincode: address.pincode,
    }));
    setShowAddressModal(false);
  };

  // Save order to local storage for order history
  const saveOrderToStorage = async (orderData: Order) => {
    try {
      // Get existing orders from storage
      const existingOrders = await AsyncStorage.getItem('order_history');
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      
      // Add new order to the beginning of the array
      const updatedOrders = [orderData, ...orders];
      
      // Save back to storage
      await AsyncStorage.setItem('order_history', JSON.stringify(updatedOrders));
      console.log('✅ Order saved to local storage');
    } catch (error) {
      console.error('❌ Error saving order to storage:', error);
    }
  };

  const saveOrderToProfile = async (orderData: any) => {
    if (!userProfile) return;

    try {
      const newOrder = {
        id: orderData.orderId,
        date: orderData.orderDate,
        items: orderData.cart,
        total: orderData.totalAmount,
        status: 'Processing',
        deliveryAddress: orderData.address,
        paymentMethod: 'Email Order',
      };

      const updatedProfile = {
        ...userProfile,
        orders: [newOrder, ...userProfile.orders],
      };

      await AsyncStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error saving order to profile:', error);
    }
  };

  const validateForm = (): boolean => {
    const { name, mobile, email, address, pincode } = formData;
    const newErrors: FormErrors = {
      name: '',
      mobile: '',
      email: '',
      address: '',
      pincode: '',
    };

    // Name validation - Full name required
    if (!/^[A-Za-z]{2,}\s[A-Za-z]{2,}(?:\s[A-Za-z]{2,})*$/.test(name.trim())) {
      newErrors.name = 'Please enter your full name (first and last name).';
    }

    // Mobile validation - 10 digits
    if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number.';
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    // Address validation
    if (address.trim().length < 10) {
      newErrors.address = 'Enter your complete address (minimum 10 characters).';
    }

    // Pincode validation - 6 digits starting with 800 (your delivery area)
    if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit pincode.';
    } else if (!/^800\d{3}$/.test(pincode)) {
      newErrors.pincode = 'Sorry, we currently do not deliver to your location.';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const sendOrderEmail = async (orderData: any): Promise<boolean> => {
    try {
      console.log('📧 Sending email via Formspree...');

      const emailBody = `🛒 NEW ORDER FROM CITIZEN JAIVIK MOBILE APP

═══════════════════════════════════════
📱 CUSTOMER INFORMATION
═══════════════════════════════════════
👤 Name: ${orderData.name}
📧 Email: ${orderData.email}  
📱 Mobile: ${orderData.mobile}
🏠 Address: ${orderData.address}
📮 Pincode: ${orderData.pincode}
${isLoggedIn ? '✅ Verified Customer' : '👤 Guest Customer'}

═══════════════════════════════════════
🛒 ORDER DETAILS
═══════════════════════════════════════
${orderData.cart.map((item: any) => 
  `• ${item.name} - ₹${item.price} x ${item.quantity} = ₹${item.total.toFixed(2)}`
).join('\n')}

───────────────────────────────────────
💰 TOTAL AMOUNT: ₹${orderData.totalAmount.toFixed(2)}
📅 ORDER DATE: ${new Date().toLocaleString('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
📱 PLATFORM: Mobile App
🆔 ORDER ID: ${orderData.orderId}
${selectedAddress ? `📍 SAVED ADDRESS: ${selectedAddress.type}` : '📍 NEW ADDRESS'}

═══════════════════════════════════════
📋 NEXT STEPS
═══════════════════════════════════════
✅ Please process this order
✅ Contact customer for confirmation  
✅ Arrange delivery to the above address

Thank you for your business! 🙏
Citizen Jaivik Team`;

      const subject = `🛒 New Mobile Order - ${orderData.name} - ₹${orderData.totalAmount.toFixed(2)}`;

      const response = await fetch('https://formspree.io/f/mwpbnalw', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: subject,
          message: emailBody,
          name: orderData.name,
          email: orderData.email,
        }),
      });

      if (response.ok) {
        console.log('✅ Formspree email sent successfully!');
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Formspree error:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Network error while sending email:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const isValid = validateForm();
    
    if (!isValid) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    setIsSubmitting(true);

    const deliveryFee = total >= 500 ? 0 : 50;
    const finalTotal = total + deliveryFee;
    const orderId = `MOB-${Date.now()}`;
    const orderDate = new Date().toISOString();

    const orderData = {
      orderId,
      name: formData.name,
      email: formData.email,
      mobile: `+91${formData.mobile}`,
      address: formData.address,
      pincode: formData.pincode,
      cart: cart.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      totalAmount: finalTotal,
      orderDate,
      platform: 'Mobile App',
      customerType: isLoggedIn ? 'Registered' : 'Guest',
    };

    // Create order object for local storage
    const orderForStorage: Order = {
      id: orderId,
      orderId,
      date: orderDate,
      items: cart.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      total: finalTotal,
      status: 'Processing',
      deliveryAddress: formData.address,
      paymentMethod: 'Email Order',
      customerInfo: {
        name: formData.name,
        email: formData.email,
        mobile: `+91${formData.mobile}`,
        pincode: formData.pincode,
      },
      platform: 'Mobile App',
      customerType: isLoggedIn ? 'Registered' : 'Guest',
    };

    console.log('📱 Placing order:', orderData);

    try {
      // Send email
      const emailSuccess = await sendOrderEmail(orderData);
      
      // Save order to local storage regardless of email success
      await saveOrderToStorage(orderForStorage);
      
      // Save order to user profile if logged in
      if (isLoggedIn) {
        await saveOrderToProfile(orderData);
      }

      // Clear cart and navigate to home
      await clearCart();
      setIsSubmitting(false);
      
      // Navigate to home page
      router.push('/');
      
      if (!emailSuccess) {
        console.log('⚠️ Email failed but order was saved locally');
      }
      
    } catch (error) {
      console.error('❌ Error processing order:', error);
      setIsSubmitting(false);
      Alert.alert(
        'Order Error',
        'There was an error processing your order. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const shouldShowError = (field: keyof FormErrors): boolean =>
    errors[field] !== '' && (touched[field] || submitAttempted);

  const deliveryFee = total >= 500 ? 0 : 50;
  const finalTotal = total + deliveryFee;
  const navigation = useNavigation();
  
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.headerTitle}>Checkout</Text>
          {isLoggedIn && (
            <View style={styles.userIndicator}>
              <Ionicons name="person-circle" size={24} color="#2e7d32" />
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* User Status Banner */}
          {isLoggedIn && userProfile ? (
            <View style={styles.userBanner}>
              <View style={styles.userInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
                <Text style={styles.userText}>Signed in as {userProfile.name}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/sign-in')}>
                <Text style={styles.switchUserText}>Switch User</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.guestBanner}>
              <View style={styles.guestInfo}>
                <Ionicons name="person-outline" size={20} color="#666" />
                <Text style={styles.guestText}>Guest Checkout</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/sign-in')}>
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Order Summary */}
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cart.length})</Text>
              <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, deliveryFee === 0 && styles.freeText]}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{finalTotal.toFixed(2)}</Text>
            </View>
            {total < 500 && (
              <Text style={styles.freeDeliveryNote}>
                Add ₹{(500 - total).toFixed(2)} more for free delivery
              </Text>
            )}
          </View>

          {/* Delivery Information Form */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Delivery Information</Text>
              {isLoggedIn && userProfile && userProfile.addresses.length > 0 && (
                <TouchableOpacity 
                  style={styles.selectAddressButton}
                  onPress={() => setShowAddressModal(true)}
                >
                  <Ionicons name="location-outline" size={16} color="#2e7d32" />
                  <Text style={styles.selectAddressText}>Saved Addresses</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedAddress && (
              <View style={styles.selectedAddressBanner}>
                <View style={styles.selectedAddressInfo}>
                  <Ionicons name="location" size={16} color="#2e7d32" />
                  <Text style={styles.selectedAddressText}>
                    Using {selectedAddress.type} address
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                  <Text style={styles.changeAddressText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={[styles.textInput, shouldShowError('name') && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                onBlur={() => handleBlur('name')}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                editable={!isLoggedIn}
              />
              {shouldShowError('name') && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
              {isLoggedIn && (
                <Text style={styles.lockedFieldNote}>
                  From your profile • <Text style={styles.editProfileLink}>Edit Profile</Text>
                </Text>
              )}
            </View>

            {/* Mobile Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <View style={styles.mobileContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.mobileInput, shouldShowError('mobile') && styles.inputError]}
                  value={formData.mobile}
                  onChangeText={(value) => handleChange('mobile', value)}
                  onBlur={() => handleBlur('mobile')}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isLoggedIn}
                />
                {isLoggedIn && (
                  <View style={styles.verifiedIcon}>
                    <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
                  </View>
                )}
              </View>
              {shouldShowError('mobile') && (
                <Text style={styles.errorText}>{errors.mobile}</Text>
              )}
              {isLoggedIn && (
                <Text style={styles.lockedFieldNote}>
                  Verified number from your account
                </Text>
              )}
            </View>

            {/* Email Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={[styles.textInput, shouldShowError('email') && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                onBlur={() => handleBlur('email')}
                placeholder="Enter your email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoggedIn}
              />
              {shouldShowError('email') && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
              {isLoggedIn && (
                <Text style={styles.lockedFieldNote}>
                  From your profile • <Text style={styles.editProfileLink}>Edit Profile</Text>
                </Text>
              )}
            </View>

            {/* Delivery Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Delivery Address *</Text>
              <TextInput
                style={[styles.textAreaInput, shouldShowError('address') && styles.inputError]}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                onBlur={() => handleBlur('address')}
                placeholder="Enter your complete delivery address"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {shouldShowError('address') && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            {/* Pincode */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                style={[styles.textInput, shouldShowError('pincode') && styles.inputError]}
                value={formData.pincode}
                onChangeText={(value) => handleChange('pincode', value)}
                onBlur={() => handleBlur('pincode')}
                placeholder="Enter your pincode"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
              />
              {shouldShowError('pincode') && (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              )}
              <Text style={styles.deliveryNote}>
                Currently delivering to pincodes starting with 800***
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, (buttonDisabled || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={buttonDisabled || isSubmitting}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Processing...' : `Order Now • ₹${finalTotal.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Address</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {userProfile?.addresses.map((address) => (
              <TouchableOpacity
                key={address.id}
                style={[
                  styles.addressOption,
                  selectedAddress?.id === address.id && styles.selectedAddressOption
                ]}
                onPress={() => handleAddressSelect(address)}
              >
                <View style={styles.addressOptionHeader}>
                  <View style={styles.addressTypeInfo}>
                    <Ionicons 
                      name={
                        address.type === 'Home' ? 'home' :
                        address.type === 'Work' ? 'business' : 'location'
                      }
                      size={20} 
                      color="#2e7d32" 
                    />
                    <Text style={styles.addressOptionType}>{address.type}</Text>
                  </View>
                  {address.isDefault && (
                    <View style={styles.defaultTag}>
                      <Text style={styles.defaultTagText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressOptionName}>{address.name}</Text>
                <Text style={styles.addressOptionText}>{address.address}</Text>
                <Text style={styles.addressOptionPincode}>Pincode: {address.pincode}</Text>
              </TouchableOpacity>
            ))}
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
  keyboardAvoid: {
    flex: 1,
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
  userIndicator: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e8',
    padding: 15,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 8,
  },
  switchUserText: {
    fontSize: 14,
    color: '#2e7d32',
    textDecorationLine: 'underline',
  },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff3cd',
    padding: 15,
    marginBottom: 8,
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
    marginLeft: 8,
  },
  signInText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  orderSummary: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  selectAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8f0',
    borderRadius: 15,
  },
  selectAddressText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 4,
  },
  selectedAddressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  selectedAddressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 6,
  },
  changeAddressText: {
    fontSize: 14,
    color: '#2e7d32',
    textDecorationLine: 'underline',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  freeText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  freeDeliveryNote: {
    fontSize: 20,
    color: '#2e7d32',
    marginTop: 8,
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
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
  mobileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  countryCode: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 0,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  mobileInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  verifiedIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -8 }],
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
  inputError: {
    borderColor: '#ff4757',
  },
  errorText: {
    fontSize: 12,
    color: '#ff4757',
    marginTop: 4,
  },
  lockedFieldNote: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 4,
  },
  editProfileLink: {
    textDecorationLine: 'underline',
  },
  deliveryNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  modalContent: {
    flex: 1,
    padding: 15,
  },
  addressOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedAddressOption: {
    borderColor: '#2e7d32',
    backgroundColor: '#f0f8f0',
  },
  addressOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressOptionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  defaultTag: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  addressOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressOptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressOptionPincode: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },})