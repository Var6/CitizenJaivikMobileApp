// utils/feedbackNotifications.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Function to schedule feedback notification check
export const scheduleFeedbackNotification = async (orderId: string, orderDate: string) => {
  try {
    const notificationTime = new Date(orderDate);
    notificationTime.setHours(notificationTime.getHours() + 12); // 12 hours after order
    
    const notification = {
      orderId,
      orderDate,
      scheduledTime: notificationTime.toISOString(),
      shown: false,
      type: 'feedback_reminder'
    };

    // Get existing notifications
    const existingNotifications = await AsyncStorage.getItem('feedback_notifications');
    const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    
    // Add new notification
    notifications.push(notification);
    
    // Save updated notifications
    await AsyncStorage.setItem('feedback_notifications', JSON.stringify(notifications));
    
    console.log(`Feedback notification scheduled for order ${orderId} at ${notificationTime}`);
  } catch (error) {
    console.error('Error scheduling feedback notification:', error);
  }
};

// Function to check and show pending notifications
export const checkFeedbackNotifications = async () => {
  try {
    const notificationsData = await AsyncStorage.getItem('feedback_notifications');
    if (!notificationsData) return;

    const notifications = JSON.parse(notificationsData);
    const currentTime = new Date();
    let hasUpdates = false;

    for (let notification of notifications) {
      const scheduledTime = new Date(notification.scheduledTime);
      
      // Check if notification should be shown (12+ hours passed and not shown yet)
      if (currentTime >= scheduledTime && !notification.shown) {
        // Show notification
        showFeedbackNotification(notification.orderId);
        
        // Mark as shown
        notification.shown = true;
        hasUpdates = true;
      }
    }

    // Update storage if there were changes
    if (hasUpdates) {
      await AsyncStorage.setItem('feedback_notifications', JSON.stringify(notifications));
    }
  } catch (error) {
    console.error('Error checking feedback notifications:', error);
  }
};

// Function to show feedback notification alert
const showFeedbackNotification = (orderId: string) => {
  Alert.alert(
    '⭐ Share Your Experience',
    `How was your recent order (#${orderId})? Your feedback helps us serve you better!`,
    [
      {
        text: 'Later',
        style: 'cancel'
      },
      {
        text: 'Give Feedback',
        onPress: () => {
          // Navigate to feedback page
          router.push('/feedback');
        }
      }
    ]
  );
};

// Function to clear old notifications (older than 7 days)
export const cleanupOldNotifications = async () => {
  try {
    const notificationsData = await AsyncStorage.getItem('feedback_notifications');
    if (!notificationsData) return;

    const notifications = JSON.parse(notificationsData);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filter out old notifications
    const filteredNotifications = notifications.filter((notification: any) => {
      const notificationDate = new Date(notification.scheduledTime);
      return notificationDate > sevenDaysAgo;
    });

    // Save cleaned notifications
    await AsyncStorage.setItem('feedback_notifications', JSON.stringify(filteredNotifications));
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
  }
};

// Function to check if feedback was already given for an order
export const checkFeedbackGiven = async (orderId: string) => {
  try {
    const feedbackData = await AsyncStorage.getItem('feedback_given');
    if (!feedbackData) return false;

    const feedbackOrders = JSON.parse(feedbackData);
    return feedbackOrders.includes(orderId);
  } catch (error) {
    console.error('Error checking feedback given:', error);
    return false;
  }
};

// Function to mark feedback as given for an order
export const markFeedbackGiven = async (orderId: string) => {
  try {
    const feedbackData = await AsyncStorage.getItem('feedback_given');
    const feedbackOrders = feedbackData ? JSON.parse(feedbackData) : [];
    
    if (!feedbackOrders.includes(orderId)) {
      feedbackOrders.push(orderId);
      await AsyncStorage.setItem('feedback_given', JSON.stringify(feedbackOrders));
    }
  } catch (error) {
    console.error('Error marking feedback as given:', error);
  }
};