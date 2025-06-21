// app/order-history.tsx
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
Dimensions,
Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkFeedbackGiven } from '../utils/feedbackNotifications';
const { width } = Dimensions.get('window');
const getFeedbackStatus = async (orderId:any) => {
  return await checkFeedbackGiven(orderId);
};
interface Order {
id: string;
orderId: string;
date: string;
items: any[];
total: number;
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

export default function OrderHistoryScreen() {
const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
const [showOrderDetails, setShowOrderDetails] = useState(false);
const [feedbackStatuses, setFeedbackStatuses] = useState<{ [orderId: string]: boolean }>({});

const navigation = useNavigation();

React.useLayoutEffect(() => {
  navigation.setOptions({ headerShown: false });
}, []);

useEffect(() => {
  loadOrderHistory();
}, []);
useEffect(() => {
  const loadFeedbackStatuses = async () => {
    const statuses: { [orderId: string]: boolean } = {};
    for (const order of orders) {
      statuses[order.orderId] = await getFeedbackStatus(order.orderId);
    }
    setFeedbackStatuses(statuses);
  };

  if (orders.length > 0) {
    loadFeedbackStatuses();
  }
}, [orders]);

const loadOrderHistory = async () => {
  try {
    setLoading(true);
    const orderHistory = await AsyncStorage.getItem('order_history');
    if (orderHistory) {
      const parsedOrders = JSON.parse(orderHistory);
      setOrders(parsedOrders);
    }
  } catch (error) {
    console.error('Error loading order history:', error);
  } finally {
    setLoading(false);
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const handleOrderPress = (order: Order) => {
  setSelectedOrder(order);
  setShowOrderDetails(true);
};

const handleReorder = (order: Order) => {
  Alert.alert(
    'Reorder Items',
    'Would you like to add these items to your cart?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Add to Cart', onPress: () => Alert.alert('Coming Soon', 'Reorder feature coming soon!') }
    ]
  );
};

const getItemsTotal = (order: Order) => {
  return order.items.reduce((sum, item) => sum + item.total, 0);
};

const OrderDetailsModal = () => {
  if (!selectedOrder) return null;

  const itemsTotal = getItemsTotal(selectedOrder);
  const deliveryFee = selectedOrder.total - itemsTotal;

  return (
    <Modal
      visible={showOrderDetails}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowOrderDetails(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderContent}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <Text style={styles.modalSubtitle}>#{selectedOrder.orderId}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowOrderDetails(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.orderDateCard}>
            <Ionicons name="calendar-outline" size={24} color="#2e7d32" />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Order Placed</Text>
              <Text style={styles.dateValue}>{formatDate(selectedOrder.date)}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={24} color="#2e7d32" />
              <Text style={styles.sectionTitle}>Customer Information</Text>
            </View>
            <View style={styles.customerGrid}>
              <View style={styles.customerItem}>
                <Text style={styles.customerLabel}>Name</Text>
                <Text style={styles.customerValue}>{selectedOrder.customerInfo.name}</Text>
              </View>
              <View style={styles.customerItem}>
                <Text style={styles.customerLabel}>Mobile</Text>
                <Text style={styles.customerValue}>{selectedOrder.customerInfo.mobile}</Text>
              </View>
              <View style={styles.customerItem}>
                <Text style={styles.customerLabel}>Email</Text>
                <Text style={styles.customerValue}>{selectedOrder.customerInfo.email}</Text>
              </View>
              <View style={styles.customerItem}>
                <Text style={styles.customerLabel}>Pincode</Text>
                <Text style={styles.customerValue}>{selectedOrder.customerInfo.pincode}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color="#2e7d32" />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{selectedOrder.deliveryAddress}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bag-outline" size={24} color="#2e7d32" />
              <Text style={styles.sectionTitle}>Order Items ({selectedOrder.items.length})</Text>
            </View>
            <View style={styles.itemsList}>
              {selectedOrder.items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity} × ₹{item.price}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemTotal}>₹{item.total.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt-outline" size={24} color="#2e7d32" />
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items Total</Text>
                <Text style={styles.summaryValue}>₹{itemsTotal.toFixed(2)}</Text>
              </View>
              {deliveryFee > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
                </View>
              ) : (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={[styles.summaryValue, styles.freeDelivery]}>FREE</Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{selectedOrder.total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={styles.reorderButton}
            onPress={() => {
              setShowOrderDetails(false);
              handleReorder(selectedOrder);
            }}
          >
            <Ionicons name="refresh-outline" size={22} color="#fff" />
            <Text style={styles.reorderButtonText}>Reorder Items</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => Alert.alert(
  '📞💬 Need Help?', 
  '✨ Choose how you’d like to contact us:\n\n📱 Call us or ✉️ send an email. We’re here for you!',
  [
    { text: '❌ Cancel', style: 'cancel' },
    { 
      text: '📞 Call +91 70049 27360', 
      onPress: () => {
        const phoneNumber = 'tel:+917004927360';
        Linking.openURL(phoneNumber).catch(() => 
          Alert.alert('⚠️ Error', '🚫 Unable to make phone call')
        );
      }
    },
    { 
      text: '📧 Email Support', 
      onPress: () => {
        const email = 'mailto:citizenjaivik@gmail.com?subject=Order Support Request';
        Linking.openURL(email).catch(() => 
          Alert.alert('⚠️ Error', '🚫 Unable to open email client')
        );
      }
    }
  ]
)}
          >
            <Ionicons name="help-circle-outline" size={22} color="#2e7d32" />
            <Text style={styles.helpButtonText}>Get Help</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

if (loading) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    </SafeAreaView>
  );
}

return (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
    
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Order History</Text>
      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={loadOrderHistory}
      >
        <Ionicons name="refresh-outline" size={24} color="#666" />
      </TouchableOpacity>
    </View>

    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your order history will appear here once you place your first order
          </Text>
          <TouchableOpacity 
            style={styles.shopNowButton}
            onPress={() => router.push('/products')}
          >
            <Text style={styles.shopNowButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Your Orders</Text>
            <Text style={styles.summaryText}>
              {orders.length} total orders
            </Text>
          </View>

          {orders.map((order) => {
            const itemsTotal = getItemsTotal(order);
            const deliveryFee = order.total - itemsTotal;
            
            return (
              <TouchableOpacity 
                key={order.id} 
                style={styles.orderCard}
                onPress={() => handleOrderPress(order)}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{order.orderId}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
                  </View>
                </View>

                <View style={styles.orderItems}>
                  <Text style={styles.itemsTitle}>Items ({order.items.length})</Text>
                  {order.items.slice(0, 2).map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetails}>
                        ₹{item.price} × {item.quantity} = ₹{item.total.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  {order.items.length > 2 && (
                    <Text style={styles.moreItemsText}>
                      +{order.items.length - 2} more items
                    </Text>
                  )}
                </View>

                <View style={styles.orderFooter}>
                  <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Subtotal</Text>
                      <Text style={styles.totalValue}>₹{itemsTotal.toFixed(2)}</Text>
                    </View>
                    {deliveryFee > 0 && (
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Delivery Fee</Text>
                        <Text style={styles.totalValue}>₹{deliveryFee.toFixed(2)}</Text>
                      </View>
                    )}
                    <View style={styles.totalDivider} />
                    <View style={styles.totalRow}>
                      <Text style={styles.finalTotalLabel}>Total</Text>
                      <Text style={styles.finalTotalValue}>₹{order.total.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.quickAction}>
                  <Text style={styles.tapToViewText}>Tap to view full details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </View>
                {feedbackStatuses[order.orderId] && (
                <View style={styles.feedbackIndicator}>
                 <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.feedbackText}>Feedback Given</Text>
  </View>
)}
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </ScrollView>

    <OrderDetailsModal />
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
refreshButton: {
  padding: 5,
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
shopNowButton: {
  backgroundColor: '#2e7d32',
  paddingHorizontal: 30,
  paddingVertical: 15,
  borderRadius: 25,
},
shopNowButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
summaryCard: {
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
summaryTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 5,
},
summaryText: {
  fontSize: 14,
  color: '#666',
},
orderCard: {
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
orderHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 15,
},
orderInfo: {
  flex: 1,
},
orderId: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 2,
},
orderDate: {
  fontSize: 12,
  color: '#666',
},
orderItems: {
  marginBottom: 15,
},
itemsTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  marginBottom: 8,
},
orderItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 4,
},
itemDetails: {
  fontSize: 12,
  color: '#666',
},
moreItemsText: {
  fontSize: 12,
  color: '#2e7d32',
  fontStyle: 'italic',
  marginTop: 4,
},
orderFooter: {
  marginBottom: 10,
},
totalSection: {
  backgroundColor: '#f8f9fa',
  padding: 10,
  borderRadius: 8,
},
totalValue: {
  fontSize: 14,
  color: '#333',
  fontWeight: '500',
},
totalDivider: {
  height: 1,
  backgroundColor: '#e9ecef',
  marginVertical: 5,
},
finalTotalLabel: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#333',
},
finalTotalValue: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#2e7d32',
},
quickAction: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: 10,
  borderTopWidth: 1,
  borderTopColor: '#f0f0f0',
},
tapToViewText: {
  fontSize: 12,
  color: '#666',
  marginRight: 5,
},
modalContainer: {
  flex: 1,
  backgroundColor: '#f5f7fa',
},
modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#e9ecef',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
},
modalHeaderContent: {
  flex: 1,
},
modalTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#2e7d32',
  marginBottom: 4,
},
modalSubtitle: {
  fontSize: 16,
  color: '#666',
  fontWeight: '500',
},
closeButton: {
  padding: 8,
  borderRadius: 20,
  backgroundColor: '#f8f9fa',
},
modalContent: {
  flex: 1,
  paddingTop: 20,
},
orderDateCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  marginHorizontal: 20,
  marginBottom: 20,
  padding: 20,
  borderRadius: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
},
dateInfo: {
  marginLeft: 15,
  flex: 1,
},
dateLabel: {
  fontSize: 14,
  color: '#666',
  marginBottom: 4,
},
dateValue: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
},
sectionCard: {
  backgroundColor: '#fff',
  marginHorizontal: 20,
  marginBottom: 20,
  borderRadius: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 4,
},
sectionHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
  marginLeft: 12,
},
customerGrid: {
  padding: 20,
},
customerItem: {
  marginBottom: 15,
},
customerLabel: {
  fontSize: 14,
  color: '#666',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  fontWeight: '500',
},
customerValue: {
  fontSize: 16,
  color: '#333',
  fontWeight: '600',
},
addressContainer: {
  padding: 20,
},
addressText: {
  fontSize: 16,
  color: '#333',
  lineHeight: 24,
},
itemsList: {
  paddingBottom: 10,
},
itemCard: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#f8f9fa',
},
itemLeft: {
  flex: 1,
},
itemName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
  marginBottom: 4,
},
itemQuantity: {
  fontSize: 14,
  color: '#666',
},
itemRight: {
  alignItems: 'flex-end',
},
itemTotal: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#2e7d32',
},
summaryContainer: {
  padding: 20,
},
summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
},
summaryLabel: {
  fontSize: 16,
  color: '#666',
},
summaryValue: {
  fontSize: 16,
  color: '#333',
  fontWeight: '600',
},
freeDelivery: {
  color: '#2e7d32',
  fontWeight: 'bold',
},
summaryDivider: {
  height: 2,
  backgroundColor: '#e9ecef',
  marginVertical: 15,
  borderRadius: 1,
},
totalRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 10,
  backgroundColor: '#f8f9fa',
  paddingHorizontal: 15,
  borderRadius: 10,
  marginTop: 5,
},
totalLabel: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#333',
},
modalFooter: {
  flexDirection: 'row',
  paddingHorizontal: 20,
  paddingVertical: 20,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#e9ecef',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
},
reorderButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#2e7d32',
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 25,
  flex: 1,
  marginRight: 10,
  justifyContent: 'center',
  shadowColor: '#2e7d32',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},
reorderButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
  marginLeft: 8,
},
helpButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingHorizontal: 24,
  paddingVertical: 14,
  borderRadius: 25,
  borderWidth: 2,
  borderColor: '#2e7d32',
  flex: 1,
  marginLeft: 10,
  justifyContent: 'center',
},
helpButtonText: {
  color: '#2e7d32',
  fontSize: 16,
  fontWeight: 'bold',
  marginLeft: 8,
},
feedbackIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
  backgroundColor: '#f9fbe7',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
  alignSelf: 'flex-start',
},
feedbackText: {
  marginLeft: 5,
  color: '#2e7d32',
  fontSize: 13,
  fontWeight: '600',
},
});