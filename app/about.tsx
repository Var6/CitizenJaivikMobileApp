// app/about.tsx
import React from 'react';
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
import LogoToo from '@/components/ui/LogoToo';

export default function AboutScreen() {
  const handleContactPress = (type: string, value: string) => {
    switch (type) {
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'website':
        Linking.openURL(value);
        break;
      case 'social':
        Linking.openURL(value);
        break;
      case 'github':
        Linking.openURL(value);
        break;
      default:
        Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
  };

  const features = [
    {
      icon: 'leaf-outline',
      title: 'Organic Products',
      description: 'Fresh, certified organic produce directly from farmers'
    },
    {
      icon: 'people-outline',
      title: 'Support Farmers',
      description: 'Direct connection with local organic farmers'
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Quality Assured',
      description: 'Every product is carefully selected and verified'
    },
    {
      icon: 'home-outline',
      title: 'Home Delivery',
      description: 'Fresh produce delivered right to your doorstep'
    }
  ];

  const contactInfo = [
    {
      icon: 'mail-outline',
      label: 'Email',
      value: 'citizenjaivik@gmail.com',
      type: 'email'
    },
    {
      icon: 'call-outline',
      label: 'Phone',
      value: '+91 9534209528',
      type: 'phone'
    },
    {
      icon: 'location-outline',
      label: 'Address',
      value: 'Anishabad Patna, Bihar, India',
      type: 'address'
    }
  ];

  const socialLinks = [
    {
      icon: 'globe-outline',
      label: 'Website',
      value: 'https://www.citizenagriculture.in/',
      type: 'website',
      color: '#2e7d32'
    },
    {
      icon: 'logo-facebook',
      label: 'Facebook',
      value: 'https://www.facebook.com/Citizenagriculture',
      type: 'social',
      color: '#1877f2'
    },
    {
      icon: 'logo-instagram',
      label: 'Instagram',
      value: 'https://www.instagram.com/citizenjaivik/',
      type: 'social',
      color: '#e4405f'
    },
    {
      icon: 'logo-whatsapp',
      label: 'WhatsApp',
      value: 'https://wa.me/919534209528',
      type: 'social',
      color: '#25d366'
    }
  ];
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Logo & Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
          <LogoToo size="large" />
          </View>
          <Text style={styles.appName}>Citizen Jaivik</Text>
          <Text style={styles.appTagline}>Fresh • Organic • Local</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Mission Statement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            To connect conscious consumers with local organic farmers, promoting sustainable 
            agriculture while ensuring fresh, healthy, and chemical-free produce reaches 
            every home. We believe in supporting our farming community and contributing 
            to a healthier planet.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={24} color="#2e7d32" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {contactInfo.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={() => contact.type !== 'address' && handleContactPress(contact.type, contact.value)}
              disabled={contact.type === 'address'}
            >
              <View style={styles.contactIcon}>
                <Ionicons name={contact.icon as any} size={20} color="#2e7d32" />
              </View>
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactValue}>{contact.value}</Text>
              </View>
              {contact.type !== 'address' && (
                <Ionicons name="open-outline" size={16} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialGrid}>
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.socialButton, { borderColor: social.color }]}
                onPress={() => handleContactPress(social.type, social.value)}
              >
                <Ionicons name={social.icon as any} size={24} color={social.color} />
                <Text style={[styles.socialLabel, { color: social.color }]}>
                  {social.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Developer Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <TouchableOpacity
            style={styles.developerCard}
            onPress={() => handleContactPress('github', 'https://github.com/var6')}
          >
            <View style={styles.developerIcon}>
              <Ionicons name="code-slash" size={24} color="#333" />
            </View>
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>Rishabh Ranjan</Text>
              <Text style={styles.developerTitle}>Full Stack Developer</Text>
              <Text style={styles.githubHandle}>@var6</Text>
            </View>
            <Ionicons name="logo-github" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.creditsText}>
            Made with ❤️ for organic farming community
          </Text>
          <Text style={styles.creditsSubtext}>
            © 2025 Citizen Jaivik. All rights reserved.
          </Text>
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
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#87ab69',
    flex: 1,
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  logoSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  appVersion: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  missionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'justify',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#666',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  developerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  developerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  developerTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  githubHandle: {
    fontSize: 12,
    color: '#007bff',
    fontFamily: 'monospace',
  },
  creditsText: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  creditsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});