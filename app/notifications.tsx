// app/notifications.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceAlerts: boolean;
  deliveryReminders: boolean;
  weeklyNewsletter: boolean;
  farmingTips: boolean;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    priceAlerts: false,
    deliveryReminders: true,
    weeklyNewsletter: false,
    farmingTips: true,
  });
   const navigation = useNavigation();
    
    React.useLayoutEffect(() => {
      navigation.setOptions({ headerShown: false });
    }, []);
  

  const [hasChanges, setHasChanges] = useState(false);

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    Alert.alert(
      'Settings Saved',
      'Your notification preferences have been updated successfully!',
      [{ text: 'OK', onPress: () => setHasChanges(false) }]
    );
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all notification settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              pushNotifications: true,
              emailNotifications: true,
              smsNotifications: false,
              orderUpdates: true,
              promotions: false,
              newProducts: true,
              priceAlerts: false,
              deliveryReminders: true,
              weeklyNewsletter: false,
              farmingTips: true,
            });
            setHasChanges(true);
          }
        }
      ]
    );
  };

  const notificationCategories = [
    {
      title: 'Communication Channels',
      description: 'Choose how you want to receive notifications',
      icon: 'chatbubbles-outline',
      settings: [
        {
          key: 'pushNotifications' as keyof NotificationSettings,
          title: 'Push Notifications',
          description: 'Receive notifications on your device',
          icon: 'phone-portrait-outline',
          recommended: true
        },
        {
          key: 'emailNotifications' as keyof NotificationSettings,
          title: 'Email Notifications',
          description: 'Get updates via email',
          icon: 'mail-outline',
          recommended: true
        },
        {
          key: 'smsNotifications' as keyof NotificationSettings,
          title: 'SMS Notifications',
          description: 'Receive text messages for important updates',
          icon: 'chatbox-outline',
          recommended: false
        }
      ]
    },
    {
      title: 'Order & Delivery',
      description: 'Stay updated about your orders',
      icon: 'cube-outline',
      settings: [
        {
          key: 'orderUpdates' as keyof NotificationSettings,
          title: 'Order Updates',
          description: 'Order confirmation, processing, and delivery status',
          icon: 'receipt-outline',
          recommended: true
        },
        {
          key: 'deliveryReminders' as keyof NotificationSettings,
          title: 'Delivery Reminders',
          description: 'Reminders before your delivery arrives',
          icon: 'time-outline',
          recommended: true
        }
      ]
    },
    {
      title: 'Products & Offers',
      description: 'Discover new products and deals',
      icon: 'pricetag-outline',
      settings: [
        {
          key: 'promotions' as keyof NotificationSettings,
          title: 'Promotions & Discounts',
          description: 'Special offers and seasonal discounts',
          icon: 'gift-outline',
          recommended: false
        },
        {
          key: 'newProducts' as keyof NotificationSettings,
          title: 'New Products',
          description: 'Be first to know about new organic products',
          icon: 'leaf-outline',
          recommended: true
        },
        {
          key: 'priceAlerts' as keyof NotificationSettings,
          title: 'Price Alerts',
          description: 'Get notified when prices change on your favorites',
          icon: 'trending-down-outline',
          recommended: false
        }
      ]
    },
    {
      title: 'Content & Education',
      description: 'Learn about organic farming and healthy living',
      icon: 'book-outline',
      settings: [
        {
          key: 'weeklyNewsletter' as keyof NotificationSettings,
          title: 'Weekly Newsletter',
          description: 'Weekly updates about organic farming and recipes',
          icon: 'newspaper-outline',
          recommended: false
        },
        {
          key: 'farmingTips' as keyof NotificationSettings,
          title: 'Farming Tips',
          description: 'Learn about organic farming and gardening',
          icon: 'flower-outline',
          recommended: true
        }
      ]
    }
  ];

  const getEnabledCount = () => {
    return Object.values(settings).filter(Boolean).length;
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetToDefaults}
        >
          <Ionicons name="refresh-outline" size={22} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="notifications" size={30} color="#2e7d32" />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Notification Preferences</Text>
            <Text style={styles.summaryText}>
              {getEnabledCount()} of {Object.keys(settings).length} notifications enabled
            </Text>
          </View>
        </View>

        {/* Notification Categories */}
        {notificationCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name={category.icon as any} size={24} color="#2e7d32" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </View>

            <View style={styles.settingsContainer}>
              {category.settings.map((setting, settingIndex) => (
                <View key={settingIndex} style={styles.settingItem}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={setting.icon as any} size={20} color="#666" />
                  </View>
                  <View style={styles.settingContent}>
                    <View style={styles.settingHeader}>
                      <Text style={styles.settingTitle}>{setting.title}</Text>
                      {setting.recommended && (
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedText}>Recommended</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.settingDescription}>{setting.description}</Text>
                  </View>
                  <Switch
                    value={settings[setting.key]}
                    onValueChange={() => toggleSetting(setting.key)}
                    trackColor={{ false: '#ccc', true: '#2e7d32' }}
                    thumbColor={settings[setting.key] ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#ccc"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={20} color="#2e7d32" />
          <Text style={styles.infoText}>
            You can change these settings anytime. We respect your privacy and will only send relevant notifications based on your preferences.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              // Turn off all promotional notifications
              setSettings(prev => ({
                ...prev,
                promotions: false,
                weeklyNewsletter: false,
                priceAlerts: false
              }));
              setHasChanges(true);
              Alert.alert('Success', 'Promotional notifications disabled');
            }}
          >
            <Ionicons name="ban-outline" size={20} color="#ff4757" />
            <Text style={styles.quickActionText}>Disable Promotions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => {
              // Turn on only essential notifications
              setSettings(prev => ({
                ...prev,
                pushNotifications: true,
                orderUpdates: true,
                deliveryReminders: true,
                emailNotifications: true
              }));
              setHasChanges(true);
              Alert.alert('Success', 'Essential notifications enabled');
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#2e7d32" />
            <Text style={styles.quickActionText}>Essential Only</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {hasChanges && (
          <View style={styles.saveContainer}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveSettings}
            >
              <Ionicons name="checkmark" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
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
  resetButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  categorySection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
  },
  settingsContainer: {
    padding: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingIcon: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 15,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 10,
    color: '#2e7d32',
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  infoNote: {
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 0.48,
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 6,
  },
  saveContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});