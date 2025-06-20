// app/help-support.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Hide the default header
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const contactOptions = [
    {
      icon: 'call-outline',
      title: 'Call Us',
      subtitle: '+91 9534209528',
      description: 'Speak directly with our support team',
      action: () => Linking.openURL('tel:+919534209528'),
      color: '#2e7d32'
    },
    {
      icon: 'logo-whatsapp',
      title: 'WhatsApp',
      subtitle: 'Chat with us instantly',
      description: 'Get quick replies on WhatsApp',
      action: () => Linking.openURL('https://wa.me/919534209528'),
      color: '#25d366'
    },
    {
      icon: 'mail-outline',
      title: 'Email Support',
      subtitle: 'citizenjaivik@gmail.com',
      description: 'Send us your detailed queries',
      action: () => Linking.openURL('mailto:citizenjaivik@gmail.com'),
      color: '#ff9800'
    },
    {
      icon: 'globe-outline',
      title: 'Visit Website',
      subtitle: 'www.citizenagriculture.in',
      description: 'Browse our complete product catalog',
      action: () => Linking.openURL('https://www.citizenagriculture.in/'),
      color: '#2196f3'
    }
  ];

  const faqData = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'Browse our products, add items to cart, fill in your delivery details, and proceed to checkout. We use email-based ordering for now - just send the pre-filled email to complete your order.'
    },
    {
      id: 2,
      question: 'What are your delivery areas?',
      answer: 'Currently, we deliver to pincodes starting with 800*** in the Jamshedpur area. This includes Kadma, Sonari, Bistupur, and surrounding localities.'
    },
    {
      id: 3,
      question: 'How can I track my order?',
      answer: 'After placing your order, we will contact you directly via phone or WhatsApp with order confirmation and delivery updates. You will receive real-time updates about your order status.'
    },
    {
      id: 4,
      question: 'What payment methods do you accept?',
      answer: 'We accept cash on delivery (COD) and online payments via UPI, bank transfer, and digital wallets. Payment details will be shared when we confirm your order.'
    },
    {
      id: 5,
      question: 'Are your products really organic?',
      answer: 'Yes! All our products are sourced directly from certified organic farmers. We ensure no harmful chemicals, pesticides, or artificial fertilizers are used in growing our produce.'
    },
    {
      id: 6,
      question: 'What is your delivery time?',
      answer: 'We typically deliver within 24-48 hours of order confirmation. For fresh produce, we ensure same-day or next-day delivery to maintain freshness.'
    },
    {
      id: 7,
      question: 'Do you have a minimum order amount?',
      answer: 'Yes, we have a minimum order value of ₹200. Orders above ₹500 qualify for free delivery, otherwise a delivery fee of ₹50 applies.'
    },
    {
      id: 8,
      question: 'What if I receive damaged products?',
      answer: 'We ensure quality packaging, but if you receive any damaged items, please contact us immediately. We will replace or refund the damaged products at no extra cost.'
    },
    {
      id: 9,
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled before we start preparing them for delivery. Please contact us as soon as possible via phone or WhatsApp to make changes.'
    },
    {
      id: 10,
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, we offer attractive discounts for bulk orders. Contact us directly to discuss pricing for large quantities or regular supply arrangements.'
    }
  ];

  const quickActions = [
    {
      icon: 'refresh-outline',
      title: 'Order Issues',
      subtitle: 'Report problems with your order',
      action: () => Alert.alert('Order Issues', 'Please contact us via phone or WhatsApp for immediate assistance with your order.')
    },
    {
      icon: 'card-outline',
      title: 'Payment Help',
      subtitle: 'Payment and billing support',
      action: () => Alert.alert('Payment Help', 'For payment-related queries, please call us or send a WhatsApp message.')
    },
    {
      icon: 'location-outline',
      title: 'Delivery Info',
      subtitle: 'Check delivery areas and timing',
      action: () => Alert.alert('Delivery Info', 'We deliver to 800*** pincodes in Jamshedpur. Delivery time: 24-48 hours.')
    },
    {
      icon: 'leaf-outline',
      title: 'Product Quality',
      subtitle: 'Questions about organic certification',
      action: () => Alert.alert('Product Quality', 'All our products are certified organic and sourced directly from farmers.')
    }
  ];

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="help-circle" size={40} color="#2e7d32" />
          </View>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtitle}>
            We're here to help you with any questions or concerns about your organic shopping experience
          </Text>
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          {contactOptions.map((option, index) => (
            <TouchableOpacity key={index} style={styles.contactOption} onPress={option.action}>
              <View style={[styles.contactIcon, { backgroundColor: option.color + '20' }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickActionCard} onPress={action.action}>
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon as any} size={24} color="#2e7d32" />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSubtitle}>
            Find quick answers to common questions
          </Text>
          
          {faqData.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.faqQuestion} 
                onPress={() => toggleFAQ(faq.id)}
              >
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <Ionicons 
                  name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              {expandedFAQ === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursItem}>
              <Ionicons name="time-outline" size={20} color="#2e7d32" />
              <View style={styles.hoursInfo}>
                <Text style={styles.hoursDay}>Monday - Saturday</Text>
                <Text style={styles.hoursTime}>9:00 AM - 7:00 PM</Text>
              </View>
            </View>
            <View style={styles.hoursItem}>
              <Ionicons name="time-outline" size={20} color="#ff9800" />
              <View style={styles.hoursInfo}>
                <Text style={styles.hoursDay}>Sunday</Text>
                <Text style={styles.hoursTime}>10:00 AM - 5:00 PM</Text>
              </View>
            </View>
          </View>
          <Text style={styles.hoursNote}>
            For urgent orders, you can WhatsApp us anytime!
          </Text>
        </View>

        {/* Still Need Help */}
        <View style={styles.section}>
          <View style={styles.stillHelpCard}>
            <Text style={styles.stillHelpTitle}>Still need help?</Text>
            <Text style={styles.stillHelpSubtitle}>
              Can't find what you're looking for? Our support team is ready to assist you.
            </Text>
            <View style={styles.stillHelpButtons}>
              <TouchableOpacity 
                style={styles.chatButton}
                onPress={() => Linking.openURL('https://wa.me/919534209528')}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25d366" />
                <Text style={styles.chatButtonText}>Chat Now</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.callButton}
                onPress={() => Linking.openURL('tel:+919534209528')}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.callButtonText}>Call Us</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#87ab69',
    flex: 1,
    fontSize: 25,
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
  section: {
    backgroundColor: '#fff',
    marginBottom: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#999',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 5,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    paddingBottom: 15,
    paddingRight: 30,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  hoursCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  hoursItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hoursInfo: {
    marginLeft: 15,
  },
  hoursDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  hoursTime: {
    fontSize: 14,
    color: '#666',
  },
  hoursNote: {
    fontSize: 12,
    color: '#2e7d32',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  stillHelpCard: {
    backgroundColor: '#f0f8f0',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  stillHelpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stillHelpSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  stillHelpButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#25d366',
  },
  chatButtonText: {
    color: '#25d366',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});