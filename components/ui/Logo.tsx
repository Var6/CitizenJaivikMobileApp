// components/ui/Logo.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  color?: string;
}

export default function CitizenJaivikLogo({ 
  size = 'medium', 
  showText = true,
  color = '#2e7d32'
}: LogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small': return { logo: 32, text: 16 };
      case 'medium': return { logo: 40, text: 20 };
      case 'large': return { logo: 60, text: 28 };
      default: return { logo: 40, text: 20 };
    }
  };

  const sizes = getSize();

  return (
    <View style={styles.logoContainer}>
      {/* Logo Image - Same logo.png for all sizes */}
      <Image 
        source={require('../../assets/images/logo.png')}
        style={[
          styles.logoImage,
          { 
            width: sizes.logo, 
            height: sizes.logo 
          }
        ]}
        resizeMode="contain"
      />
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[
            styles.brandName, 
            { fontSize: sizes.text, color }
          ]}>
            Citizen Jaivik
          </Text>
          {size === 'large' && (
            <Text style={[styles.tagline, { color: `${color}80` }]}>
              Organic & Fresh
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  brandName: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
});