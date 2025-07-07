// app/order-history.tsx - Updated with Backend API
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  orderSummary: {
    total: number;
    subtotal: number;
    deliveryFee: number;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  createdAt: string;
  expectedDelivery: string;
  paymentMethod: string;
}

export default function OrderHistoryScreen() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      if (!token) return;

      const response = await fetch('https://citizenagriculture.in/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to load orders:', data.message);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9500';
      case 'confirmed': return '#007aff';
      case 'processing': return '#5856d6';
      case 'shipped': return '#32d74b';
      case 'delivered': return '#2e7d32';
      case 'cancelled': return '#ff3b30';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'processing': return 'cog-outline';
      case 'shipped': return 'car-outline';
      case 'delivered': return 'checkmark-done-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Please Sign In</Text>
          <Text style={styles.emptySubtitle}>Sign in to view your order history</Text>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/sign-in')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh-outline" size={40} color="#2e7d32" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2e7d32']} />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your order history will appear here once you place your first order
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)/products')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Your Orders ({orders.length})</Text>
            </View>

            {orders.map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Ionicons name={getStatusIcon(order.status)} size={16} color="#fff" />
                    <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <Text style={styles.itemsCount}>{order.items.length} items</Text>
                  <Text style={styles.totalAmount}>₹{order.orderSummary.total}</Text>
                </View>

                <View style={styles.orderInfo}>
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>
                      Expected: {formatDate(order.expectedDelivery)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="card-outline" size={16} color="#666" />
                    <Text style={styles.infoText}>{order.paymentMethod.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.orderActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => Alert.alert('Order Details', 'Detailed view coming soon!')}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>
                  
                  {order.status === 'delivered' && (
                    <TouchableOpacity 
                      style={styles.reorderButton}
                      onPress={() => Alert.alert('Reorder', 'Reorder feature coming soon!')}
                    >
                      <Ionicons name="refresh-outline" size={16} color="#2e7d32" />
                      <Text style={styles.reorderButtonText}>Reorder</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  content: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 10 },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 60 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20 },
  emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10, marginBottom: 30 },
  shopButton: { backgroundColor: '#2e7d32', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  signInButton: { backgroundColor: '#2e7d32', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  signInButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  summaryCard: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 10, elevation: 2 },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  orderCard: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, borderRadius: 10, padding: 15, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderNumber: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  orderDate: { fontSize: 12, color: '#666', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemsCount: { fontSize: 14, color: '#666' },
  totalAmount: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  orderInfo: { marginBottom: 15 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  infoText: { fontSize: 12, color: '#666', marginLeft: 8 },
  orderActions: { flexDirection: 'row', justifyContent: 'space-between' },
  viewButton: { flex: 1, backgroundColor: '#f8f9fa', paddingVertical: 10, borderRadius: 6, marginRight: 8 },
  viewButtonText: { textAlign: 'center', color: '#333', fontWeight: '600' },
  reorderButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: '#2e7d32' },
  reorderButtonText: { color: '#2e7d32', fontSize: 12, fontWeight: '600', marginLeft: 4 },
});