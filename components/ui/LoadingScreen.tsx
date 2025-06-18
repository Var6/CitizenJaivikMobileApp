// components/ui/LoadingScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous logo pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const logoScale = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <View style={styles.loadingContainer}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Main Logo */}
        <View style={styles.mainLogo}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image 
              source={require('../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          <Text style={styles.brandText}>Citizen Jaivik</Text>
          <Text style={styles.taglineText}>Organic & Fresh Products</Text>
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>{message}</Text>
          <View style={styles.dotsContainer}>
            <LoadingDots />
          </View>
        </View>
      </Animated.View>

      {/* Background decorative elements */}
      <View style={styles.backgroundDecorations}>
        <View style={[styles.bgElement, styles.bgElement1]} />
        <View style={[styles.bgElement, styles.bgElement2]} />
        <View style={[styles.bgElement, styles.bgElement3]} />
      </View>
    </View>
  );
}

// Loading dots animation component
function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const dotAnimation = (dot: Animated.Value, delay: number) =>
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]);

      Animated.loop(
        Animated.stagger(200, [
          dotAnimation(dot1, 0),
          dotAnimation(dot2, 0),
          dotAnimation(dot3, 0),
        ])
      ).start();
    };

    animateDots();
  }, []);

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fdf8',
    position: 'relative',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLogo: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2e7d32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
    letterSpacing: 1,
  },
  taglineText: {
    fontSize: 16,
    color: '#4a7c59',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  loadingIndicator: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  dotsContainer: {
    height: 20,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2e7d32',
    marginHorizontal: 3,
  },
  backgroundDecorations: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  bgElement: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e8f5e8',
    opacity: 0.3,
  },
  bgElement1: {
    top: height * 0.15,
    left: width * 0.1,
  },
  bgElement2: {
    top: height * 0.25,
    right: width * 0.15,
  },
  bgElement3: {
    bottom: height * 0.2,
    left: width * 0.2,
  },
});