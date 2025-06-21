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

const { width } = Dimensions.get('window');

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

export default function OrderHistoryScreen() {
 const [orders, setOrders] = useState<Order[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
 const [showOrderDetails, setShowOrderDetails] = useState(false);

 const navigation = useNavigation();
 
 React.useLayoutEffect(() => {
   navigation.setOptions({ headerShown: false });
 }, []);

 useEffect(() => {
   loadOrderHistory();
 }, []);

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

 const getStatusColor = (status: string) => {
   switch (status) {
     case 'Delivered':
       return '#2e7d32';
     case 'Processing':
       return '#ff9800';
     case 'Cancelled':
       return '#f44336';
     case 'Pending':
       return '#2196f3';
     default:
       return '#666';
   }
 };

 const getStatusIcon = (status: string) => {
   switch (status) {
     case 'Delivered':
       return 'checkmark-circle';
     case 'Processing':
       return 'time-outline';
     case 'Cancelled':
       return 'close-circle';
     case 'Pending':
       return 'hourglass-outline';
     default:
       return 'help-circle-outline';
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
           <Text style={styles.modalTitle}>Order Details</Text>
           <TouchableOpacity 
             onPress={() => setShowOrderDetails(false)}
             style={styles.closeButton}
           >
             <Ionicons name="close" size={24} color="#333" />
           </TouchableOpacity>
         </View>

         <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
           <View style={styles.modalSection}>
             <View style={styles.orderStatusHeader}>
               <View style={styles.orderIdSection}>
                 <Text style={styles.modalOrderId}>#{selectedOrder.orderId}</Text>
                 <Text style={styles.modalOrderDate}>{formatDate(selectedOrder.date)}</Text>
               </View>
               <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedOrder.status) + '20' }]}>
                 <Ionicons 
                   name={getStatusIcon(selectedOrder.status)} 
                   size={20} 
                   color={getStatusColor(selectedOrder.status)} 
                 />
                 <Text style={[styles.modalStatusText, { color: getStatusColor(selectedOrder.status) }]}>
                   {selectedOrder.status}
                 </Text>
               </View>
             </View>
           </View>

           <View style={styles.modalSection}>
             <Text style={styles.sectionTitle}>Customer Information</Text>
             <View style={styles.infoCard}>
               <View style={styles.infoRow}>
                 <Ionicons name="person-outline" size={16} color="#666" />
                 <Text style={styles.infoLabel}>Name:</Text>
                 <Text style={styles.infoValue}>{selectedOrder.customerInfo.name}</Text>
               </View>
               <View style={styles.infoRow}>
                 <Ionicons name="call-outline" size={16} color="#666" />
                 <Text style={styles.infoLabel}>Mobile:</Text>
                 <Text style={styles.infoValue}>{selectedOrder.customerInfo.mobile}</Text>
               </View>
               <View style={styles.infoRow}>
                 <Ionicons name="mail-outline" size={16} color="#666" />
                 <Text style={styles.infoLabel}>Email:</Text>
                 <Text style={styles.infoValue}>{selectedOrder.customerInfo.email}</Text>
               </View>
               <View style={styles.infoRow}>
                 <Ionicons name="location-outline" size={16} color="#666" />
                 <Text style={styles.infoLabel}>Pincode:</Text>
                 <Text style={styles.infoValue}>{selectedOrder.customerInfo.pincode}</Text>
               </View>
             </View>
           </View>

           <View style={styles.modalSection}>
             <Text style={styles.sectionTitle}>Delivery Address</Text>
             <View style={styles.addressCard}>
               <Ionicons name="location" size={20} color="#2e7d32" style={styles.addressIcon} />
               <Text style={styles.addressText}>{selectedOrder.deliveryAddress}</Text>
             </View>
           </View>

           <View style={styles.modalSection}>
             <Text style={styles.sectionTitle}>Order Items ({selectedOrder.items.length})</Text>
             <View style={styles.itemsCard}>
               {selectedOrder.items.map((item, index) => (
                 <View key={index} style={styles.modalOrderItem}>
                   <View style={styles.itemInfo}>
                     <Text style={styles.modalItemName}>{item.name}</Text>
                     <Text style={styles.modalItemPrice}>₹{item.price} × {item.quantity}</Text>
                   </View>
                   <Text style={styles.modalItemTotal}>₹{item.total.toFixed(2)}</Text>
                 </View>
               ))}
             </View>
           </View>

           <View style={styles.modalSection}>
             <Text style={styles.sectionTitle}>Order Summary</Text>
             <View style={styles.summaryCard}>
               <View style={styles.summaryRow}>
                 <Text style={styles.summaryLabel}>Items Total</Text>
                 <Text style={styles.summaryValue}>₹{itemsTotal.toFixed(2)}</Text>
               </View>
               {deliveryFee > 0 && (
                 <View style={styles.summaryRow}>
                   <Text style={styles.summaryLabel}>Delivery Fee</Text>
                   <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
                 </View>
               )}
               {deliveryFee === 0 && (
                 <View style={styles.summaryRow}>
                   <Text style={styles.summaryLabel}>Delivery Fee</Text>
                   <Text style={[styles.summaryValue, styles.freeText]}>FREE</Text>
                 </View>
               )}
               <View style={styles.summaryDivider} />
               <View style={styles.summaryRow}>
                 <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                 <Text style={styles.summaryTotalValue}>₹{selectedOrder.total.toFixed(2)}</Text>
               </View>
             </View>
           </View>

           <View style={styles.modalActions}>
             {selectedOrder.status === 'Delivered' && (
               <TouchableOpacity 
                 style={styles.reorderBtn}
                 onPress={() => {
                   setShowOrderDetails(false);
                   handleReorder(selectedOrder);
                 }}
               >
                 <Ionicons name="refresh-outline" size={20} color="#fff" />
                 <Text style={styles.reorderBtnText}>Reorder</Text>
               </TouchableOpacity>
             )}
             
             <TouchableOpacity 
  style={styles.helpBtn}
  onPress={() => Alert.alert(
    'Get Help', 
    'Choose how you\'d like to contact us:',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Call +91 70049 27360', 
        onPress: () => {
          const phoneNumber = 'tel:+917004927360';
          Linking.openURL(phoneNumber).catch(() => 
            Alert.alert('Error', 'Unable to make phone call')
          );
        }
      },
      { 
        text: 'Email Support', 
        onPress: () => {
          const email = 'mailto:citizenjaivik@gmail.com?subject=Order Support Request';
          Linking.openURL(email).catch(() => 
            Alert.alert('Error', 'Unable to open email client')
          );
        }
      }
    ]
  )}
>
  <Ionicons name="help-circle-outline" size={20} color="#666" />
  <Text style={styles.helpBtnText}>Get Help</Text>
</TouchableOpacity>
           </View>
         </ScrollView>
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
               {orders.length} total orders • {orders.filter(o => o.status === 'Delivered').length} delivered
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
                   <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                     <Ionicons 
                       name={getStatusIcon(order.status)} 
                       size={16} 
                       color={getStatusColor(order.status)} 
                     />
                     <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                       {order.status}
                     </Text>
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
 statusBadge: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 10,
   paddingVertical: 5,
   borderRadius: 15,
 },
 statusText: {
   fontSize: 12,
   fontWeight: '600',
   marginLeft: 4,
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
 itemName: {
   fontSize: 14,
   color: '#333',
   flex: 1,
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
 totalRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingVertical: 2,
 },
 totalLabel: {
   fontSize: 14,
   color: '#666',
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
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 2 },
   shadowOpacity: 0.1,
   shadowRadius: 3.84,
   elevation: 5,
 },
 modalTitle: {
   fontSize: 20,
   fontWeight: 'bold',
   color: '#333',
 },
 closeButton: {
   padding: 5,
 },
 modalContent: {
   flex: 1,
 },
 modalSection: {
   marginBottom: 20,
 },
 sectionTitle: {
   fontSize: 16,
   fontWeight: 'bold',
   color: '#333',
   marginBottom: 10,
   marginHorizontal: 15,
 },
 orderStatusHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   backgroundColor: '#fff',
   marginHorizontal: 15,
   padding: 15,
   borderRadius: 10,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 1 },
   shadowOpacity: 0.1,
   shadowRadius: 2,
   elevation: 2,
 },
 orderIdSection: {
   flex: 1,
 },
 modalOrderId: {
   fontSize: 18,
   fontWeight: 'bold',
   color: '#333',
   marginBottom: 5,
 },
 modalOrderDate: {
   fontSize: 14,
   color: '#666',
 },
 modalStatusBadge: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 12,
   paddingVertical: 8,
   borderRadius: 20,
 },
 modalStatusText: {
   fontSize: 14,
   fontWeight: '600',
   marginLeft: 6,
 },
 infoCard: {
   backgroundColor: '#fff',
   marginHorizontal: 15,
   padding: 15,
   borderRadius: 10,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 1 },
   shadowOpacity: 0.1,
   shadowRadius: 2,
   elevation: 2,
 },
 infoRow: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: 10,
 },
 infoLabel: {
   fontSize: 14,
   color: '#666',
   marginLeft: 8,
   marginRight: 8,
   minWidth: 60,
 },
 infoValue: {
   fontSize: 14,
   color: '#333',
   fontWeight: '500',
   flex: 1,
 },
 addressCard: {
   backgroundColor: '#fff',
   marginHorizontal: 15,
   padding: 15,
   borderRadius: 10,
   flexDirection: 'row',
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 1 },
   shadowOpacity: 0.1,
   shadowRadius: 2,
   elevation: 2,
 },
 addressIcon: {
   marginRight: 10,
   marginTop: 2,
 },
 addressText: {
   fontSize: 14,
   color: '#333',
   lineHeight: 20,
   flex: 1,
 },
 itemsCard: {
   backgroundColor: '#fff',
   marginHorizontal: 15,
   borderRadius: 10,
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 1 },
   shadowOpacity: 0.1,
   shadowRadius: 2,
   elevation: 2,
 },
 modalOrderItem: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   padding: 15,
   borderBottomWidth: 1,
   borderBottomColor: '#f0f0f0',
 },
 itemInfo: {
   flex: 1,
 },
 modalItemName: {
   fontSize: 14,
   fontWeight: '500',
   color: '#333',
   marginBottom: 4,
 },
 modalItemPrice: {
   fontSize: 12,
   color: '#666',
 },
 modalItemTotal: {
   fontSize: 14,
   fontWeight: 'bold',
   color: '#2e7d32',
 },
 summaryRow: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
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
   marginVertical: 8,
 },
 summaryTotalLabel: {
   fontSize: 16,
   fontWeight: 'bold',
   color: '#333',
 },
 summaryTotalValue: {
   fontSize: 16,
   fontWeight: 'bold',
   color: '#2e7d32',
 },
 modalActions: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   paddingHorizontal: 15,
   paddingVertical: 20,
   backgroundColor: '#fff',
   borderTopWidth: 1,
   borderTopColor: '#e9ecef',
 },
 reorderBtn: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: '#2e7d32',
   paddingHorizontal: 20,
   paddingVertical: 12,
   borderRadius: 25,
   flex: 1,
   marginRight: 10,
   justifyContent: 'center',
 },
 reorderBtnText: {
   color: '#fff',
   fontSize: 14,
   fontWeight: '600',
   marginLeft: 6,
 },
 helpBtn: {
   flexDirection: 'row',
   alignItems: 'center',
   backgroundColor: '#f8f9fa',
   paddingHorizontal: 20,
   paddingVertical: 12,
   borderRadius: 25,
   borderWidth: 1,
   borderColor: '#e9ecef',
   flex: 1,
   marginLeft: 10,
   justifyContent: 'center',
 },
 helpBtnText: {
   color: '#666',
   fontSize: 14,
   fontWeight: '600',
   marginLeft: 6,
 },
});