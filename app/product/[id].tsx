// app/product/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { productAPI, type Product } from '../../services/api';
import { useCart } from '../../context/CartContext';
import LoadingScreen from '../../components/ui/LoadingScreen';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const insets = useSafeAreaInsets();
  
  const navigation = useNavigation();
  
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);
  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      // You'll need to create this API method to fetch a single product
      const productData = await productAPI.getProductById(id as string);
      setProduct(productData);
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get quantity of this product in cart
  const getProductQuantityInCart = (): number => {
    if (!product) return 0;
    const cartItem = cart.find(item => item._id === product._id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const cartItem = { ...product, quantity: 1 };
      await addToCart(cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleIncreaseQuantity = async () => {
    if (!product) return;
    const currentQuantity = getProductQuantityInCart();
    await updateQuantity(product._id, currentQuantity + 1);
  };

  const handleDecreaseQuantity = async () => {
    if (!product) return;
    const currentQuantity = getProductQuantityInCart();
    if (currentQuantity > 1) {
      await updateQuantity(product._id, currentQuantity - 1);
    } else {
      await removeFromCart(product._id);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading product details..." />;
  }

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fdf8" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ccc" />
          <Text style={styles.errorText}>Product not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const quantityInCart = getProductQuantityInCart();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fdf8" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={24} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#2e7d32" />
            </View>
          )}
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Stock Status Badge */}
          <View style={[
            styles.stockBadge, 
            { backgroundColor: product.inStock ? '#4caf50' : '#f44336' }
          ]}>
            <Text style={styles.stockBadgeText}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {/* Cart Badge */}
          {quantityInCart > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{quantityInCart}</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.categoryContainer}>
            <Ionicons name="leaf" size={16} color="#2e7d32" />
            <Text style={styles.category}>{product.category}</Text>
          </View>
          
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.farmerContainer}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.farmerName}>by {product.farmerName}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            <Text style={styles.unit}>/{product.unit}</Text>
          </View>

          {/* Product Description */}
          {product.productDetails && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Product Details</Text>
              <Text style={styles.description}>{product.productDetails}</Text>
            </View>
          )}

          {/* Farmer Details */}
          {product.farmerDetails && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>About the Farmer</Text>
              <Text style={styles.description}>{product.farmerDetails}</Text>
            </View>
          )}

          {/* Product Info Summary */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Product Information</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
            
            {product.subCategory && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sub Category:</Text>
                <Text style={styles.detailValue}>{product.subCategory}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Unit:</Text>
              <Text style={styles.detailValue}>{product.unit}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Farmer:</Text>
              <Text style={styles.detailValue}>{product.farmerName}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability:</Text>
              <Text style={[
                styles.detailValue,
                { color: product.inStock ? '#4caf50' : '#f44336' }
              ]}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        {!product.inStock ? (
          <View style={styles.outOfStockButton}>
            <Text style={styles.outOfStockButtonText}>Out of Stock</Text>
          </View>
        ) : quantityInCart === 0 ? (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantityControlsContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleDecreaseQuantity}
            >
              <Ionicons name="remove" size={20} color="#2e7d32" />
            </TouchableOpacity>
            
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantityInCart}</Text>
              <Text style={styles.quantityLabel}>in cart</Text>
            </View>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={handleIncreaseQuantity}
            >
              <Ionicons name="add" size={20} color="#2e7d32" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fdf8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
     backgroundColor:'#3ca241',
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backIconButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  productImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  stockBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  stockBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#122f13',
    borderRadius: 15,
    minWidth: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  productInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  category: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginLeft: 6,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    lineHeight: 30,
  },
  farmerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  farmerName: {
    fontSize: 19,
    color: '#666',
     fontWeight: 'bold',
    marginLeft: 6,

  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: '#f8fdf8',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e8',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  bottomActionBar: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8f5e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 10,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  outOfStockButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  outOfStockButtonText: {
    color: '#999',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8f0',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  quantityButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  quantityDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});