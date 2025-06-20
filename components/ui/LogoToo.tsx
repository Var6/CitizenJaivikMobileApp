// components/ui/Logo2.tsx
import React from 'react';
import { Image, StyleSheet, ImageProps } from 'react-native';

interface Logo2Props {
  size?: 'small' | 'medium' | 'large';
  style?: ImageProps['style'];
}

export default function LogoToo({ 
  size = 'medium',
  style
}: Logo2Props) {
  const getSize = () => {
    switch (size) {
      case 'small': return 40;
      case 'medium': return 60;
      case 'large': return 100;
      default: return 60;
    }
  };

  const logoSize = getSize();

  return (
    <Image 
      source={require('../../assets/images/logo.png')}
      style={[
        styles.logo,
        { 
          width: logoSize, 
          height: logoSize 
        },
        style
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    // Just the image, no extra styling
  },
});