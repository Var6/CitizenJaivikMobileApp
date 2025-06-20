// app/payment-methods.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

interface PaymentMethod {
  id: string;
  type: 'COD' | 'QR';
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  details?: string;
}

export default function PaymentMethodsScreen() {
   const navigation = useNavigation();
    
    React.useLayoutEffect(() => {
      navigation.setOptions({ headerShown: false });
    }, []);
  
  const [selectedMethod, setSelectedMethod] = useState<string>('cod');
  const [showQRModal, setShowQRModal] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      type: 'COD',
      title: 'Cash on Delivery',
      description: 'Pay with cash when your order arrives',
      icon: 'cash-outline',
      isActive: true,
      details: 'No advance payment required. Pay the delivery person when you receive your order.'
    },
    {
      id: 'qr',
      type: 'QR',
      title: 'UPI / QR Code Payment',
      description: 'Pay instantly using UPI apps',
      icon: 'qr-code-outline',
      isActive: true,
      details: 'Scan QR code with any UPI app like PhonePe, Google Pay, Paytm, etc.'
    }
  ];

  const upiApps = [
    {
      name: 'PhonePe',
      icon: '📱',
      color: '#5f259f',
      scheme: 'phonepe://'
    },
    {
      name: 'Google Pay',
      icon: '💳',
      color: '#4285f4',
      scheme: 'tez://'
    },
    {
      name: 'Paytm',
      icon: '💰',
      color: '#00baf2',
      scheme: 'paytmmp://'
    },
    {
      name: 'BHIM',
      icon: '🏦',
      color: '#ff6600',
      scheme: 'bhim://'
    }
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    if (methodId === 'qr') {
      setShowQRModal(true);
    }
  };

  const handleSaveSelection = () => {
    const method = paymentMethods.find(m => m.id === selectedMethod);
    Alert.alert(
      'Payment Method Updated',
      `${method?.title} has been set as your preferred payment method.`,
      [{ text: 'OK' }]
    );
  };

  const handleUPIAppPress = (app: any) => {
    Linking.canOpenURL(app.scheme).then(supported => {
      if (supported) {
        Linking.openURL(app.scheme);
      } else {
        Alert.alert(
          `${app.name} Not Found`,
          `Please install ${app.name} to use this payment method.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Install', onPress: () => Linking.openURL('https://play.google.com/store/search?q=' + app.name) }
          ]
        );
      }
    });
  };

  const generateQRCode = () => {
    // This would typically generate a QR code with payment details
    // For demo purposes, we'll show a placeholder
    return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=citizenjaivik@paytm&pn=Citizen%20Jaivik&cu=INR&am=0';
  };

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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#2e7d32" />
          <Text style={styles.infoText}>
            Choose your preferred payment method. All transactions are secure and encrypted.
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
          <Text style={styles.sectionTitle}>Available Payment Methods</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethodCard
              ]}
              onPress={() => handleMethodSelect(method.id)}
            >
              <View style={styles.methodContent}>
                <View style={[styles.methodIcon, selectedMethod === method.id && styles.selectedMethodIcon]}>
                  <Ionicons 
                    name={method.icon as any} 
                    size={24} 
                    color={selectedMethod === method.id ? '#fff' : '#2e7d32'} 
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                  <Text style={styles.methodDetails}>{method.details}</Text>
                </View>
                <View style={styles.radioButton}>
                  {selectedMethod === method.id ? (
                    <Ionicons name="radio-button-on" size={24} color="#2e7d32" />
                  ) : (
                    <Ionicons name="radio-button-off" size={24} color="#ccc" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* COD Information */}
        {selectedMethod === 'cod' && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Cash on Delivery Details</Text>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.detailText}>No advance payment required</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.detailText}>Pay exact amount to delivery person</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.detailText}>Keep change ready for faster delivery</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="information-circle" size={20} color="#ff9800" />
              <Text style={styles.detailText}>Additional ₹10 COD fee applies</Text>
            </View>
          </View>
        )}

        {/* UPI Information */}
        {selectedMethod === 'qr' && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>UPI Payment Details</Text>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.detailText}>Instant payment confirmation</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.detailText}>No COD charges</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
              <Text style={styles.detailText}>Faster order processing</Text>
            </View>
            
            <Text style={styles.upiTitle}>Supported UPI Apps</Text>
            <View style={styles.upiAppsContainer}>
              {upiApps.map((app, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.upiAppCard, { borderColor: app.color }]}
                  onPress={() => handleUPIAppPress(app)}
                >
                  <Text style={styles.upiAppIcon}>{app.icon}</Text>
                  <Text style={styles.upiAppName}>{app.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.qrButton}
              onPress={() => setShowQRModal(true)}
            >
              <Ionicons name="qr-code" size={20} color="#fff" />
              <Text style={styles.qrButtonText}>Show QR Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSelection}
        >
          <Ionicons name="checkmark" size={20} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.saveButtonText}>Save Payment Method</Text>
        </TouchableOpacity>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            Having trouble with payments? Contact our support team.
          </Text>
          <View style={styles.supportButtons}>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => Linking.openURL('https://wa.me/919534209528')}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25d366" />
              <Text style={styles.supportButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={() => Linking.openURL('tel:+919534209528')}
            >
              <Ionicons name="call" size={18} color="#2e7d32" />
              <Text style={styles.supportButtonText}>Call Us</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowQRModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scan QR Code to Pay</Text>
            <TouchableOpacity onPress={() => setShowQRModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: generateQRCode() }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.qrInstructions}>
              1. Open any UPI app on your phone{'\n'}
              2. Tap on 'Scan QR Code'{'\n'}
              3. Point your camera at the QR code{'\n'}
              4. Enter the amount and complete payment
            </Text>
            
            <View style={styles.upiInfo}>
              <Text style={styles.upiLabel}>UPI ID:</Text>
              <Text style={styles.upiId}>citizenjaivik@paytm</Text>
            </View>
            
            <Text style={styles.qrNote}>
              After payment, share the transaction screenshot with us for quick confirmation.
            </Text>
          </View>
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
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
  methodsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 20,
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
    marginBottom: 15,
  },
  methodCard: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  selectedMethodCard: {
    borderColor: '#2e7d32',
    backgroundColor: '#f0f8f0',
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  selectedMethodIcon: {
    backgroundColor: '#2e7d32',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  methodDetails: {
    fontSize: 12,
    color: '#999',
  },
  radioButton: {
    marginLeft: 10,
  },
  detailsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  upiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  upiAppsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  upiAppCard: {
    width: '22%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  upiAppIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  upiAppName: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    marginHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  supportSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  supportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
  },
  supportButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
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
    alignItems: 'center',
    padding: 20,
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  upiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  upiLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  upiId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  qrNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});