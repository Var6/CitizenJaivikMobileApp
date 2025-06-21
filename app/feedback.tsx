// app/feedback.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { markFeedbackGiven, checkFeedbackGiven } from '../utils/feedbackNotifications';

const { width } = Dimensions.get('window');

interface Order {
  id: string;
  orderId: string;
  date: string;
  items: any[];
  total: number;
  status: string;
  deliveryAddress: string;
  customerInfo: {
    name: string;
    email: string;
    mobile: string;
    pincode: string;
  };
}

interface ProductFeedback {
  orderId: string;
  orderDate: string;
  items: any[];
  rating: number;
  issues: string[];
  comments: string;
  customerInfo: any;
}

interface AppFeedback {
  rating: number;
  category: string;
  issues: string[];
  suggestions: string;
  userInfo: any;
}

export default function FeedbackScreen() {
  const [activeTab, setActiveTab] = useState<'product' | 'app'>('product');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderSelection, setShowOrderSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product Feedback State
  const [productRating, setProductRating] = useState(0);
  const [productIssues, setProductIssues] = useState<string[]>([]);
  const [productComments, setProductComments] = useState('');

  // App Feedback State
  const [appRating, setAppRating] = useState(0);
  const [appCategory, setAppCategory] = useState('');
  const [appIssues, setAppIssues] = useState<string[]>([]);
  const [appSuggestions, setAppSuggestions] = useState('');

  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  useEffect(() => {
    loadOrders();
    loadUserProfile();
  }, []);
  useEffect(() => {
  const filterOrdersWithoutFeedback = async () => {
    const filteredOrders = [];
    for (const order of orders) {
      const feedbackGiven = await checkFeedbackGiven(order.orderId);
      if (!feedbackGiven) {
        filteredOrders.push(order);
      }
    }
    setOrders(filteredOrders);
  };

  if (orders.length > 0) {
    filterOrdersWithoutFeedback();
  }
}, []);

  const loadOrders = async () => {
    try {
      const orderHistory = await AsyncStorage.getItem('order_history');
      if (orderHistory) {
        const parsedOrders = JSON.parse(orderHistory);
        // Filter delivered orders for feedback
        const deliveredOrders = parsedOrders.filter((order: Order) => 
          order.status === 'Delivered' || order.status === 'Processing'
        );
        setOrders(deliveredOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const [userProfile, setUserProfile] = useState(null);

  const loadUserProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_profile');
      if (userData) {
        setUserProfile(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const productIssueOptions = [
    'Poor Quality',
    'Not Fresh',
    'Wrong Item Delivered',
    'Packaging Issues',
    'Quantity Issues',
    'Late Delivery',
    'Damaged Items',
    'Price Issues'
  ];

  const appCategories = [
    'User Interface',
    'Performance',
    'Features',
    'Navigation',
    'Payment',
    'Search',
    'Cart',
    'Other'
  ];

  const appIssueOptions = [
    'App Crashes',
    'Slow Loading',
    'Poor Design',
    'Confusing Navigation',
    'Missing Features',
    'Search Not Working',
    'Cart Issues',
    'Login Problems',
    'Notification Issues'
  ];

  const handleProductIssueToggle = (issue: string) => {
    setProductIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const handleAppIssueToggle = (issue: string) => {
    setAppIssues(prev => 
      prev.includes(issue) 
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  const StarRating = ({ rating, onRatingChange, size = 30 }: any) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? '#FFD700' : '#ccc'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

 const submitProductFeedback = async () => {
  if (!selectedOrder) {
    Alert.alert('Error', 'Please select an order first.');
    return;
  }

  if (productRating === 0) {
    Alert.alert('Error', 'Please provide a rating.');
    return;
  }

  setIsSubmitting(true);

  const feedbackData = {
    orderId: selectedOrder.orderId,
    orderDate: selectedOrder.date,
    items: selectedOrder.items,
    rating: productRating,
    issues: productIssues,
    comments: productComments,
    customerInfo: selectedOrder.customerInfo
  };

  try {
    const emailBody = `🛒 PRODUCT FEEDBACK - CITIZEN JAIVIK

═══════════════════════════════════════
📋 FEEDBACK DETAILS
═══════════════════════════════════════
🆔 Order ID: ${feedbackData.orderId}
📅 Order Date: ${formatDate(feedbackData.orderDate)}
⭐ Rating: ${feedbackData.rating}/5 stars
💰 Order Total: ₹${selectedOrder.total.toFixed(2)}

═══════════════════════════════════════
👤 CUSTOMER INFORMATION
═══════════════════════════════════════
👤 Name: ${feedbackData.customerInfo.name}
📧 Email: ${feedbackData.customerInfo.email}
📱 Mobile: ${feedbackData.customerInfo.mobile}
📮 Pincode: ${feedbackData.customerInfo.pincode}

═══════════════════════════════════════
🛍️ ORDER ITEMS
═══════════════════════════════════════
${feedbackData.items.map((item) => 
  `• ${item.name} - ₹${item.price} x ${item.quantity} = ₹${item.total.toFixed(2)}`
).join('\n')}

═══════════════════════════════════════
❌ ISSUES REPORTED
═══════════════════════════════════════
${feedbackData.issues.length > 0 ? feedbackData.issues.join(', ') : 'No specific issues reported'}

═══════════════════════════════════════
💬 ADDITIONAL COMMENTS
═══════════════════════════════════════
${feedbackData.comments || 'No additional comments'}

═══════════════════════════════════════
📱 SUBMISSION INFO
═══════════════════════════════════════
📅 Feedback Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
📱 Platform: Mobile App

Thank you for your valuable feedback! 🙏
Citizen Jaivik Team`;

    const response = await fetch('https://formspree.io/f/xblyaeaq', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: `Product Feedback - Order #${feedbackData.orderId} - ${feedbackData.rating} Stars`,
        message: emailBody,
        name: feedbackData.customerInfo.name,
        email: feedbackData.customerInfo.email,
      }),
    });

    if (response.ok) {
      // Mark feedback as given for this order
      await markFeedbackGiven(feedbackData.orderId);
      
      Alert.alert(
        'Thank You!',
        'Your product feedback has been submitted successfully. We appreciate your input!',
        [{ text: 'OK', onPress: resetProductForm }]
      );
    } else {
      throw new Error('Failed to submit feedback');
    }
  } catch (error) {
    console.error('Error submitting product feedback:', error);
    Alert.alert('Error', 'Failed to submit feedback. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
  const submitAppFeedback = async () => {
    if (appRating === 0) {
      Alert.alert('Error', 'Please provide a rating.');
      return;
    }

    if (!appCategory) {
      Alert.alert('Error', 'Please select a feedback category.');
      return;
    }

    setIsSubmitting(true);

    const feedbackData: AppFeedback = {
      rating: appRating,
      category: appCategory,
      issues: appIssues,
      suggestions: appSuggestions,
      userInfo: userProfile
    };

    try {
      const emailBody = `📱 APP FEEDBACK - CITIZEN JAIVIK MOBILE APP

═══════════════════════════════════════
📋 FEEDBACK DETAILS
═══════════════════════════════════════
⭐ Rating: ${feedbackData.rating}/5 stars
📂 Category: ${feedbackData.category}

═══════════════════════════════════════
👤 USER INFORMATION
═══════════════════════════════════════
${feedbackData.userInfo ? `
👤 Name: ${feedbackData.userInfo.name}
📧 Email: ${feedbackData.userInfo.email}
📱 Mobile: ${feedbackData.userInfo.phone}
✅ Account Type: Registered User
` : `
👤 User: Anonymous/Guest User
`}

═══════════════════════════════════════
❌ ISSUES REPORTED
═══════════════════════════════════════
${feedbackData.issues.length > 0 ? feedbackData.issues.join(', ') : 'No specific issues reported'}

═══════════════════════════════════════
💡 SUGGESTIONS & COMMENTS
═══════════════════════════════════════
${feedbackData.suggestions || 'No suggestions provided'}

═══════════════════════════════════════
📱 SUBMISSION INFO
═══════════════════════════════════════
📅 Feedback Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
📱 Platform: Mobile App
📂 Feedback Type: App Experience

Thank you for helping us improve! 🙏
Citizen Jaivik Development Team`;

      const response = await fetch('https://formspree.io/f/xzzgaqjz', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `App Feedback - ${feedbackData.category} - ${feedbackData.rating} Stars`,
          message: emailBody,
          name: feedbackData.userInfo?.name || 'Anonymous User',
          email: feedbackData.userInfo?.email || 'noemail@provided.com',
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Thank You!',
          'Your app feedback has been submitted successfully. We value your suggestions!',
          [{ text: 'OK', onPress: resetAppForm }]
        );
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting app feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setSelectedOrder(null);
    setProductRating(0);
    setProductIssues([]);
    setProductComments('');
  };

  const resetAppForm = () => {
    setAppRating(0);
    setAppCategory('');
    setAppIssues([]);
    setAppSuggestions('');
  };

  const OrderSelectionModal = () => (
    <Modal
      visible={showOrderSelection}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowOrderSelection(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Order</Text>
          <TouchableOpacity onPress={() => setShowOrderSelection(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {orders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Ionicons name="receipt-outline" size={60} color="#ccc" />
              <Text style={styles.emptyOrdersText}>No orders available for feedback</Text>
              <Text style={styles.emptyOrdersSubtext}>
                Complete an order to provide product feedback
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.orderOption,
                  selectedOrder?.id === order.id && styles.selectedOrderOption
                ]}
                onPress={() => {
                  setSelectedOrder(order);
                  setShowOrderSelection(false);
                }}
              >
                <View style={styles.orderOptionHeader}>
                  <Text style={styles.orderOptionId}>#{order.orderId}</Text>
                  <Text style={styles.orderOptionDate}>{formatDate(order.date)}</Text>
                </View>
                <Text style={styles.orderOptionItems}>
                  {order.items.length} items • ₹{order.total.toFixed(2)}
                </Text>
                <Text style={styles.orderOptionFirstItem}>
                  {order.items[0]?.name}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ''}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

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
        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'product' && styles.activeTab]}
          onPress={() => setActiveTab('product')}
        >
          <Ionicons 
            name="basket-outline" 
            size={20} 
            color={activeTab === 'product' ? '#2e7d32' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'product' && styles.activeTabText]}>
            Product Feedback
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'app' && styles.activeTab]}
          onPress={() => setActiveTab('app')}
        >
          <Ionicons 
            name="phone-portrait-outline" 
            size={20} 
            color={activeTab === 'app' ? '#2e7d32' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'app' && styles.activeTabText]}>
            App Feedback
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'product' ? (
          // Product Feedback Tab
          <View style={styles.feedbackForm}>
            {/* Order Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Order</Text>
              <TouchableOpacity
                style={styles.orderSelector}
                onPress={() => setShowOrderSelection(true)}
              >
                {selectedOrder ? (
                  <View style={styles.selectedOrderInfo}>
                    <Text style={styles.selectedOrderId}>#{selectedOrder.orderId}</Text>
                    <Text style={styles.selectedOrderDate}>{formatDate(selectedOrder.date)}</Text>
                    <Text style={styles.selectedOrderItems}>
                      {selectedOrder.items.length} items • ₹{selectedOrder.total.toFixed(2)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.orderSelectorPlaceholder}>
                    <Ionicons name="add-circle-outline" size={24} color="#666" />
                    <Text style={styles.orderSelectorText}>Select an order to review</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                {/* Rating */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Overall Rating</Text>
                  <Text style={styles.sectionSubtitle}>How was your overall experience with this order?</Text>
                  <StarRating 
                    rating={productRating} 
                    onRatingChange={setProductRating}
                    size={35}
                  />
                  {productRating > 0 && (
                    <Text style={styles.ratingText}>
                      {productRating === 5 ? 'Excellent!' : 
                       productRating === 4 ? 'Good!' : 
                       productRating === 3 ? 'Average' : 
                       productRating === 2 ? 'Poor' : 'Very Poor'}
                    </Text>
                  )}
                </View>

                {/* Issues */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Issues (if any)</Text>
                  <Text style={styles.sectionSubtitle}>Select all issues that apply</Text>
                  <View style={styles.issueGrid}>
                    {productIssueOptions.map((issue) => (
                      <TouchableOpacity
                        key={issue}
                        style={[
                          styles.issueChip,
                          productIssues.includes(issue) && styles.selectedIssueChip
                        ]}
                        onPress={() => handleProductIssueToggle(issue)}
                      >
                        <Text style={[
                          styles.issueChipText,
                          productIssues.includes(issue) && styles.selectedIssueChipText
                        ]}>
                          {issue}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Comments */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Additional Comments</Text>
                  <Text style={styles.sectionSubtitle}>Tell us more about your experience</Text>
                  <TextInput
                    style={styles.commentInput}
                    value={productComments}
                    onChangeText={setProductComments}
                    placeholder="Share your thoughts, suggestions, or any specific details..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={submitProductFeedback}
                  disabled={isSubmitting || productRating === 0}
                >
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Submitting...' : 'Submit Product Feedback'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          // App Feedback Tab
          <View style={styles.feedbackForm}>
            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Rating</Text>
              <Text style={styles.sectionSubtitle}>How would you rate your overall app experience?</Text>
              <StarRating 
                rating={appRating} 
                onRatingChange={setAppRating}
                size={35}
              />
              {appRating > 0 && (
                <Text style={styles.ratingText}>
                  {appRating === 5 ? 'Love it!' : 
                   appRating === 4 ? 'Pretty good!' : 
                   appRating === 3 ? 'It\'s okay' : 
                   appRating === 2 ? 'Needs work' : 'Needs major improvement'}
                </Text>
              )}
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Feedback Category</Text>
              <Text style={styles.sectionSubtitle}>What area of the app is your feedback about?</Text>
              <View style={styles.categoryGrid}>
                {appCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      appCategory === category && styles.selectedCategoryChip
                    ]}
                    onPress={() => setAppCategory(category)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      appCategory === category && styles.selectedCategoryChipText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Issues */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specific Issues</Text>
              <Text style={styles.sectionSubtitle}>Select any issues you've experienced</Text>
              <View style={styles.issueGrid}>
                {appIssueOptions.map((issue) => (
                  <TouchableOpacity
                    key={issue}
                    style={[
                      styles.issueChip,
                      appIssues.includes(issue) && styles.selectedIssueChip
                    ]}
                    onPress={() => handleAppIssueToggle(issue)}
                  >
                    <Text style={[
                      styles.issueChipText,
                      appIssues.includes(issue) && styles.selectedIssueChipText
                    ]}>
                      {issue}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Suggestions & Comments</Text>
              <Text style={styles.sectionSubtitle}>How can we improve the app for you?</Text>
              <TextInput
                style={styles.commentInput}
                value={appSuggestions}
                onChangeText={setAppSuggestions}
                placeholder="Share your ideas, suggestions, or tell us what you'd like to see improved..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={submitAppFeedback}
              disabled={isSubmitting || appRating === 0 || !appCategory}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit App Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Order Selection Modal */}
      <OrderSelectionModal />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2e7d32',
    backgroundColor: '#f0f8f0',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#2e7d32',
  },
  content: {
    flex: 1,
  },
  feedbackForm: {
    padding: 15,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
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
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  orderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedOrderInfo: {
    flex: 1,
  },
  selectedOrderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  selectedOrderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  selectedOrderItems: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
  },
  orderSelectorPlaceholder: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderSelectorText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  starButton: {
    marginHorizontal: 5,
    padding: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    textAlign: 'center',
    marginTop: 10,
  },
  issueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  issueChip: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedIssueChip: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  issueChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedIssueChipText: {
    color: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  categoryChip: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: (width - 80) / 3,
    alignItems: 'center',
  },
  selectedCategoryChip: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  commentInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  modalContent: {
    flex: 1,
    padding: 15,
  },
  emptyOrders: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyOrdersText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  emptyOrdersSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  orderOption: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedOrderOption: {
    borderColor: '#2e7d32',
    backgroundColor: '#f0f8f0',
  },
  orderOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderOptionId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderOptionDate: {
    fontSize: 12,
    color: '#666',
  },
  orderOptionItems: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    marginBottom: 4,
  },
  orderOptionFirstItem: {
    fontSize: 12,
    color: '#666',
  },
});