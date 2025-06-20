// app/checkout.tsx
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../context/CartContext';

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

export default function CheckoutScreen() {
  const { cart, clearCart, total } = useCart();

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
    if (!/^[A-Za-z]{4,}\s[A-Za-z]{4,}(?:\s[A-Za-z]{4,})*$/.test(name.trim())) {
      newErrors.name = 'Please Enter Your Full Name.';
    }

    // Mobile validation - 10 digits
    if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = 'Enter A valid Mobile number.';
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    // Address validation
    if (address.trim().length < 10) {
      newErrors.address = 'Enter Your Full Address (minimum 10 characters).';
    }

    // Pincode validation - 6 digits starting with 800 (your delivery area)
    if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Enter a valid 6-digit pincode.';
    } else if (!/^800\d{3}$/.test(pincode)) {
      newErrors.pincode = 'Sorry, Currently we do not deliver to your location.';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === '');
  };

  useEffect(() => {
    const isValid = validateForm();
    setButtonDisabled(!isValid || cart.length === 0);
  }, [formData, cart]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const sendOrderEmail = async (orderData: any): Promise<boolean> => {
    try {
      console.log('📧 Opening email composer...');
      
      const emailBody = `🛒 NEW ORDER FROM CITIZEN JAIVIK MOBILE APP

═══════════════════════════════════════
📱 CUSTOMER INFORMATION
═══════════════════════════════════════
👤 Name: ${orderData.name}
📧 Email: ${orderData.email}  
📱 Mobile: ${orderData.mobile}
🏠 Address: ${orderData.address}
📮 Pincode: ${orderData.pincode}

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
🆔 ORDER ID: MOB-${Date.now()}

═══════════════════════════════════════
📋 NEXT STEPS
═══════════════════════════════════════
✅ Please process this order
✅ Contact customer for confirmation  
✅ Arrange delivery to the above address

Thank you for your business! 🙏
Citizen Jaivik Team`;

      const subject = `🛒 New Mobile Order - ${orderData.name} - ₹${orderData.totalAmount.toFixed(2)}`;
      
      // Replace with your actual email where you want to receive orders
      const recipientEmail = 'citizenjaivik@gmail.com'; // Change this to your email
      
      const emailUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
        return true;
      } else {
        throw new Error('No email app available');
      }
    } catch (error) {
      console.error('❌ Email composer error:', error);
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

    const orderData = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      address: `${formData.address}, ${formData.pincode}`,
      pincode: formData.pincode,
      cart: cart.map((item) => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      })),
      totalAmount: finalTotal,
      orderDate: new Date().toISOString(),
      platform: 'Mobile App',
    };

    console.log('📱 Placing order:', orderData);

    const success = await sendOrderEmail(orderData);

    if (success) {
      Alert.alert(
        '📧 Email Ready to Send!',
        'Your order email is ready. Please send it to complete your order. We will contact you soon for confirmation.',
        [
          {
            text: 'Email Sent ✅',
            onPress: async () => {
              await clearCart();
              router.push('/');
            }
          },
          {
            text: 'Cancel Order',
            style: 'cancel',
            onPress: () => setIsSubmitting(false)
          }
        ]
      );
    } else {
      Alert.alert(
        '❌ Email Error', 
        'Could not open email app. Please ensure you have an email app installed on your device.',
        [{ text: 'OK', onPress: () => setIsSubmitting(false) }]
      );
    }
  };

  const shouldShowError = (field: keyof FormErrors): boolean =>
    errors[field] !== '' && (touched[field] || submitAttempted);

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
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                style={[styles.textInput, shouldShowError('name') && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                onBlur={() => handleBlur('name')}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
              {shouldShowError('name') && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Mobile Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={[styles.textInput, shouldShowError('mobile') && styles.inputError]}
                value={formData.mobile}
                onChangeText={(value) => handleChange('mobile', value)}
                onBlur={() => handleBlur('mobile')}
                placeholder="Enter your mobile number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
              />
              {shouldShowError('mobile') && (
                <Text style={styles.errorText}>{errors.mobile}</Text>
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
              />
              {shouldShowError('email') && (
                <Text style={styles.errorText}>{errors.email}</Text>
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

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Ionicons name="information-circle" size={20} color="#2e7d32" />
            <Text style={styles.infoText}>
              After clicking "Send Order Email", your email app will open with a pre-filled order email. 
              Please send the email to complete your order.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, (buttonDisabled || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={buttonDisabled || isSubmitting}
          >
            <Ionicons name="mail" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.submitButtonText}>
              Send Order Email • ₹{finalTotal.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#87ab69',
    width: '100%',
  },
  scrollView: {
    flex: 1,
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
    fontSize: 12,
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
  deliveryNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4a7c59',
    marginLeft: 10,
    lineHeight: 18,
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
});