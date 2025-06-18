// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="product/[id]" 
          options={{ 
            title: 'Product Details',
            headerStyle: { backgroundColor: '#2e7d32' },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </CartProvider>
  );
}
