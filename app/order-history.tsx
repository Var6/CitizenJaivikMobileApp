// app/order-history.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function OrderHistoryScreen() {
  // Sample orders data - replace with actual data from your backend
  const [orders] = useState([
    {
      id: 'MOB-1718875432',
      date: '2024-06-20',
      items: [
        { name: 'Organic Tomatoes', quantity: 2, price: 80 },
        { name: 'Fresh Spinach', quantity: 1, price: 45 },
        { name: 'Organic Carrots', quantity: 3, price: 120 }
      ],
      total: 245.00,
      deliveryFee: 0,
      finalTotal: 245.00,
      status: 'Delivered',
      deliveryAddress: 'Kadma, Jamshedpur, Jharkhand 831005'
    },
    {
      id: 'MOB-1718789032',
      date: '2024-06-15',
      items: [
        { name: 'Organic Rice', quantity: 1, price: 180 },
        { name: 'Fresh Broccoli', quantity: 2, price: 90 }
      ],
      total: 270.00,
      deliveryFee: 50,
      finalTotal: 320.00,
      status: 'Delivered',
      deliveryAddress: 'Kadma, Jamshedpur, Jharkhand 831005'
    },
    {
      id: 'MOB-1718702632',
      date: '2024-06-10',
      items: [
        { name: 'Organic Onions', quantity: 2, price: 60 },
        { name: 'Fresh Lettuce', quantity: 1, price: 40 }
      ],
      total: 100.00,
      deliveryFee: 50,
      finalTotal: 150.00,
      status: 'Cancelled',
      deliveryAddress: 'Kadma, Jamshedpur, Jharkhand 831005'
    }
  ]);

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

  const handleOrderPress = (order: any) => {
    Alert.alert(
      'Order Details',
      `Order ID: ${order.id}\nStatus: ${order.status}\nItems: ${order.items.length}\nTotal: ₹${order.finalTotal.toFixed(2)}`,
      [{ text: 'OK' }]
    );
  };

  const handleReorder = (order: any) => {
    Alert.alert(
      'Reorder Items',
      'Would you like to add these items to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add to Cart', onPress: () => Alert.alert('Coming Soon', 'Reorder feature coming soon!') }
      ]
    );
  };
 const navigation = useNavigation();
  
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

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
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.placeholder} />
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
            {/* Orders Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Your Orders</Text>
              <Text style={styles.summaryText}>
                {orders.length} total orders • {orders.filter(o => o.status === 'Delivered').length} delivered
              </Text>
            </View>

            {/* Orders List */}
            {orders.map((order) => (
              <TouchableOpacity 
                key={order.id} 
                style={styles.orderCard}
                onPress={() => handleOrderPress(order)}
              >
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
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

                {/* Order Items */}
                <View style={styles.orderItems}>
                  <Text style={styles.itemsTitle}>Items ({order.items.length})</Text>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDetails}>
                        ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Order Total */}
                <View style={styles.orderFooter}>
                  <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Subtotal</Text>
                      <Text style={styles.totalValue}>₹{order.total.toFixed(2)}</Text>
                    </View>
                    {order.deliveryFee > 0 && (
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Delivery Fee</Text>
                        <Text style={styles.totalValue}>₹{order.deliveryFee.toFixed(2)}</Text>
                      </View>
                    )}
                    <View style={styles.totalDivider} />
                    <View style={styles.totalRow}>
                      <Text style={styles.finalTotalLabel}>Total</Text>
                      <Text style={styles.finalTotalValue}>₹{order.finalTotal.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Coming Soon', 'Track order feature coming soon!')}
                  >
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.actionButtonText}>Track</Text>
                  </TouchableOpacity>
                  
                  {order.status === 'Delivered' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.reorderButton]}
                      onPress={() => handleReorder(order)}
                    >
                      <Ionicons name="refresh-outline" size={16} color="#2e7d32" />
                      <Text style={[styles.actionButtonText, styles.reorderButtonText]}>Reorder</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Coming Soon', 'Get help feature coming soon!')}
                  >
                    <Ionicons name="help-circle-outline" size={16} color="#666" />
                    <Text style={styles.actionButtonText}>Help</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
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
    fontSize: 14,
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
  orderFooter: {
    marginBottom: 15,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    fontWeight: '500',
  },
  reorderButton: {
    backgroundColor: '#f0f8f0',
  },
  reorderButtonText: {
    color: '#2e7d32',
  },
});