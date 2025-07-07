// app/checkout.tsx - Updated with AuthContext
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '@/context/AuthContext';

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

export default function CheckoutScreen() {
  const { cart, clearCart, total } = useCart();
  const { user, isAuthenticated, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
    email: '',
    address: '',
    pincode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    mobile: '',
    email: '',
    address: '',
    pincode: '',
  });

  // Auto-fill form with user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User authenticated, auto-filling form:', user.email);
      setFormData({
        name: user.fullName || '',
        mobile: user.mobile?.replace('+91', '') || '',
        email: user.email || '',
        address: user.address || '',
        pincode: user.pincode || '',
      });
    } else {
      console.log('❌ User not authenticated, guest checkout');
    }
  }, [isAuthenticated, user]);

  const validateForm = (): boolean => {
    const { name, mobile, email, address, pincode } = formData;
    const newErrors: FormErrors = {
      name: '',
      mobile: '',
      email: '',
      address: '',
      pincode: '',
    };

    // Name validation
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

    // Pincode validation
    if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit pincode.';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const createOrder = async () => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please sign in to place an order.');
      return false;
    }

    try {
      const orderData = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          mobile: `+91${formData.mobile}`,
        },
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || 'kg',
          subtotal: item.price * item.quantity,
        })),
        shippingAddress: {
          fullName: formData.name,
          mobile: `+91${formData.mobile}`,
          email: formData.email,
          address: formData.address,
          pincode: formData.pincode,
          landmark: '',
        },
        orderSummary: {
          subtotal: total,
          deliveryFee: total >= 500 ? 0 : 50,
          discount: 0,
          total: total + (total >= 500 ? 0 : 50),
        },
        paymentMethod: 'cod',
        notes: '',
      };

      console.log('🔄 Creating order:', orderData);

      const response = await fetch('https://citizenagriculture.in/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Order created successfully:', data.orderNumber);
        return { success: true, orderNumber: data.orderNumber };
      } else {
        console.error('❌ Order creation failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('❌ Network error creating order:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleSubmit = async () => {
    const isValid = validateForm();
    
    if (!isValid) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to place an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/sign-in') }
        ]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createOrder();

      if (result.success) {
        // Clear cart
        await clearCart();
        
        // Show success message
        Alert.alert(
          '🎉 Order Placed Successfully!',
          `Order #${result.orderNumber}\n\n✅ Your order has been placed\n📱 You will receive updates via SMS/Email\n🚚 Expected delivery: 2-3 business days`,
          [
            { 
              text: '📱 View Orders', 
              onPress: () => router.push('/order-history') 
            },
            { 
              text: '🏠 Go Home', 
              onPress: () => router.push('/(tabs)'),
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert(
          'Order Failed',
          result.message || 'Failed to place order. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error processing order:', error);
      Alert.alert(
        'Order Error',
        'There was an error processing your order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryFee = total >= 500 ? 0 : 50;
  const finalTotal = total + deliveryFee;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          {isAuthenticated && (
            <View style={styles.userIndicator}>
              <Ionicons name="person-circle" size={24} color="#2e7d32" />
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* User Status Banner */}
          {isAuthenticated && user ? (
            <View style={styles.userBanner}>
              <View style={styles.userInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
                <Text style={styles.userText}>Signed in as {user.fullName}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/sign-in')}>
                <Text style={styles.switchUserText}>Switch User</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.guestBanner}>
              <View style={styles.guestInfo}>
                <Ionicons name="person-outline" size={20} color="#856404" />
                <Text style={styles.guestText}>Please sign in to place an order</Text>
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
            <Text style={styles.sectionTitle}>Delivery Information</Text>

            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={[styles.textInput, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                editable={!isAuthenticated}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
              {isAuthenticated && (
                <Text style={styles.lockedFieldNote}>From your profile</Text>
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
                  style={[styles.mobileInput, errors.mobile && styles.inputError]}
                  value={formData.mobile}
                  onChangeText={(value) => handleChange('mobile', value)}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isAuthenticated}
                />
                {isAuthenticated && (
                  <View style={styles.verifiedIcon}>
                    <Ionicons name="checkmark-circle" size={16} color="#2e7d32" />
                  </View>
                )}
              </View>
              {errors.mobile ? (
                <Text style={styles.errorText}>{errors.mobile}</Text>
              ) : null}
              {isAuthenticated && (
                <Text style={styles.lockedFieldNote}>Verified number from your account</Text>
              )}
            </View>

            {/* Email Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={[styles.textInput, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder="Enter your email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isAuthenticated}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
              {isAuthenticated && (
                <Text style={styles.lockedFieldNote}>From your profile</Text>
              )}
            </View>

            {/* Delivery Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Delivery Address *</Text>
              <TextInput
                style={[styles.textAreaInput, errors.address && styles.inputError]}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder="Enter your complete delivery address"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors.address ? (
                <Text style={styles.errorText}>{errors.address}</Text>
              ) : null}
            </View>

            {/* Pincode */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                style={[styles.textInput, errors.pincode && styles.inputError]}
                value={formData.pincode}
                onChangeText={(value) => handleChange('pincode', value)}
                placeholder="Enter your pincode"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={6}
              />
              {errors.pincode ? (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              ) : null}
              <Text style={styles.deliveryNote}>
                We deliver across India
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton, 
              (!isAuthenticated || cart.length === 0 || isSubmitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isAuthenticated || cart.length === 0 || isSubmitting}
          >
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Processing...' : 
               !isAuthenticated ? 'Sign In Required' :
               `Place Order • ₹${finalTotal.toFixed(2)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  keyboardAvoid: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  userIndicator: { padding: 5 },
  scrollView: { flex: 1 },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e8',
    padding: 15,
    marginBottom: 8,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userText: { fontSize: 14, color: '#2e7d32', fontWeight: '600', marginLeft: 8 },
  switchUserText: { fontSize: 14, color: '#2e7d32', textDecorationLine: 'underline' },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff3cd',
    padding: 15,
    marginBottom: 8,
  },
  guestInfo: { flexDirection: 'row', alignItems: 'center' },
  guestText: { fontSize: 14, color: '#856404', fontWeight: '600', marginLeft: 8 },
  signInText: { fontSize: 14, color: '#2e7d32', fontWeight: '600', textDecorationLine: 'underline' },
  orderSummary: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 10, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  freeText: { color: '#2e7d32', fontWeight: 'bold' },
  summaryDivider: { height: 1, backgroundColor: '#e9ecef', marginVertical: 10 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  freeDeliveryNote: { fontSize: 12, color: '#2e7d32', marginTop: 8, textAlign: 'center' },
  formSection: { backgroundColor: '#fff', margin: 15, marginTop: 0, padding: 20, borderRadius: 10, elevation: 3 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  textInput: { borderWidth: 1, borderColor: '#e9ecef', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
  mobileContainer: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
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
  countryCodeText: { fontSize: 16, color: '#333', fontWeight: '600' },
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
  },
  verifiedIcon: { position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -8 }] },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 80,
  },
  inputError: { borderColor: '#ff4757' },
  errorText: { fontSize: 12, color: '#ff4757', marginTop: 4 },
  lockedFieldNote: { fontSize: 12, color: '#2e7d32', marginTop: 4 },
  deliveryNote: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  submitContainer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e9ecef' },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: { backgroundColor: '#ccc' },
  buttonIcon: { marginRight: 8 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});