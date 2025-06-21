// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { productAPI, type Product } from '../../services/api';
import { useCart } from '../../context/CartContext';
import CitizenJaivikLogo from '../../components/ui/Logo';
import Entypo from '@expo/vector-icons/Entypo';
import LoadingScreen from '../../components/ui/LoadingScreen';

const { width } = Dimensions.get('window');
const PRODUCT_WIDTH = (width - 60) / 2;

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, updateQuantity, removeFromCart, itemCount } = useCart();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [allProducts, categoriesData, featuredData] = await Promise.all([
        productAPI.getAllProducts(),
        productAPI.getCategories(),
        productAPI.getFeaturedProducts(),
      ]);
      setProducts(allProducts);
      setCategories(categoriesData);
      setFeaturedProducts(featuredData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get quantity of specific product in cart
  const getProductQuantityInCart = (productId: string): number => {
    const cartItem = cart.find(item => item._id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const cartItem = { ...product, quantity: 1 };
      await addToCart(cartItem);
      console.log('Added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleIncreaseQuantity = async (productId: string) => {
    const currentQuantity = getProductQuantityInCart(productId);
    await updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = async (productId: string) => {
    const currentQuantity = getProductQuantityInCart(productId);
    if (currentQuantity > 1) {
      await updateQuantity(productId, currentQuantity - 1);
    } else {
      await removeFromCart(productId);
    }
  };

  const handleCategoryPress = (category: string) => {
    router.push('/products');
  };

  const handleCartPress = () => {
    router.push('/cart');
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const quantityInCart = getProductQuantityInCart(item._id);
    
    return (
      <View style={styles.productCard}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.farmerName}>by {item.farmerName}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            <Text style={styles.unit}>/{item.unit}</Text>
          </View>
          
          {/* Cart Controls */}
          {!item.inStock ? (
            // Out of Stock Button
            <View style={styles.outOfStockButton}>
              <Text style={styles.outOfStockButtonText}>Out of Stock</Text>
            </View>
          ) : quantityInCart === 0 ? (
            // Add to Cart Button
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            // Quantity Controls
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleDecreaseQuantity(item._id)}
              >
                <Ionicons name="remove" size={16} color="#2e7d32" />
              </TouchableOpacity>
              
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantityInCart}</Text>
                <Text style={styles.quantityLabel}>in cart</Text>
              </View>
              
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => handleIncreaseQuantity(item._id)}
              >
                <Ionicons name="add" size={16} color="#2e7d32" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Cart Badge on Product Card */}
        {quantityInCart > 0 && (
          <View style={styles.productCartBadge}>
            <Text style={styles.productCartBadgeText}>{quantityInCart}</Text>
          </View>
        )}
        
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCategoryCard = (category: string, index: number) => (
    <TouchableOpacity 
      key={index} 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
    >
      <Ionicons name="leaf" size={16} color="#2e7d32" />
      <Text style={styles.categoryName}>{category}</Text>
      <Ionicons name="chevron-forward" size={16} color="#2e7d32" />
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingScreen message="Loading fresh products..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fdf8" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <CitizenJaivikLogo size="medium" />
          <TouchableOpacity 
            style={styles.cartBadgeContainer}
            onPress={handleCartPress}
          >
            <Ionicons name="cart-outline" size={24} color="#2e7d32" />
            {itemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Cart Summary Bar (only show if items in cart) */}
        {itemCount > 0 && (
          <TouchableOpacity style={styles.cartSummaryBar} onPress={handleCartPress}>
            <View style={styles.cartSummaryContent}>
              <View style={styles.cartSummaryLeft}>
                <Ionicons name="cart" size={20} color="#2e7d32" />
                <Text style={styles.cartSummaryText}>
                  {itemCount} item{itemCount > 1 ? 's' : ''} in cart
                </Text>
              </View>
              <View style={styles.cartSummaryRight}>
                <Text style={styles.viewCartText}>
                  <Entypo name="shopping-basket" size={24} color="green" />
                  View Basket</Text>
                <Ionicons name="chevron-forward" size={16} color="#2e7d32" />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Welcome Banner */}
       <View style={styles.welcomeBanner}>
  <View style={styles.welcomeContent}>
    <View style={styles.welcomeIconContainer}>
      <Ionicons name="leaf" size={24} color="#2e7d32" />
    </View>
    <View style={styles.welcomeTextContainer}>
      <Text style={styles.welcomeTitle}>Welcome to Organic Living!</Text>
      <Text style={styles.welcomeSubtitle}>
        Fresh products directly from our trusted farmers
      </Text>
    </View>
    <View style={styles.welcomeDecoration}>
      <View style={styles.decorationDot}></View>
      <View style={styles.decorationDot}></View>
      <View style={styles.decorationDot}></View>
    </View>
  </View>
  
  {/* Animated Border Elements */}
  <View style={styles.borderTop}></View>
  <View style={styles.borderBottom}></View>
  <View style={styles.borderLeft}></View>
  <View style={styles.borderRight}></View>
  
  {/* Corner Elements */}
  <View style={styles.cornerTopLeft}></View>
  <View style={styles.cornerTopRight}></View>
  <View style={styles.cornerBottomLeft}></View>
  <View style={styles.cornerBottomRight}></View>
</View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#2e7d32" />
            <Text style={styles.statNumber}>{products.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#2e7d32" />
            <Text style={styles.statNumber}>{categories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
            <Text style={styles.statNumber}>
              {products.filter(p => p.inStock).length}
            </Text>
            <Text style={styles.statLabel}>In Stock</Text>
          </View>
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((category, index) => renderCategoryCard(category, index))}
          </ScrollView>
        </View>

        {/* Featured Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {featuredProducts.length > 0 ? (
            <FlatList
              data={featuredProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No featured products available</Text>
            </View>
          )}
        </View>

        {/* All Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fresh Arrivals</Text>
            <TouchableOpacity onPress={() => router.push('/products')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {products.length > 0 ? (
            <FlatList
              data={products.slice(0, 8)}
              renderItem={renderProductCard}
              keyExtractor={(item) => item._id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.productRow}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartBadgeContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartSummaryBar: {
    backgroundColor: '#e8f5e8',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  cartSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  cartSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartSummaryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  cartSummaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginRight: 4,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fdf8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
    marginHorizontal: 8,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: PRODUCT_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#f0f8f0',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  farmerName: {
    fontSize: 11,
    color: '#2e7d32',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  unit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2e7d32',
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  outOfStockButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  outOfStockButtonText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8f0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  quantityDisplay: {
    alignItems: 'center',
    minWidth: 50,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  quantityLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 1,
  },
  productCartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  outOfStockText: {
    color: '#ff4757',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
  welcomeBanner: {
  position: 'relative',
  margin: 15,
  marginTop: 20,
  backgroundColor: '#fff',
  borderRadius: 16,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 8,
},
welcomeContent: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 20,
  paddingVertical: 24,
  backgroundColor: 'linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#e0f2e0',
},
welcomeIconContainer: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 15,
  shadowColor: '#2e7d32',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
  borderWidth: 2,
  borderColor: '#c8e6c9',
},
welcomeTextContainer: {
  flex: 1,
},
welcomeTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#1b5e20',
  marginBottom: 6,
  textShadowColor: 'rgba(46, 125, 50, 0.1)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
},
welcomeSubtitle: {
  fontSize: 14,
  color: '#2e7d32',
  lineHeight: 20,
  opacity: 0.9,
},
welcomeDecoration: {
  flexDirection: 'column',
  alignItems: 'center',
  marginLeft: 10,
},
decorationDot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: '#81c784',
  marginVertical: 2,
  opacity: 0.7,
},

// Animated Border Elements
borderTop: {
  position: 'absolute',
  top: 0,
  left: '20%',
  right: '20%',
  height: 3,
  backgroundColor: '#4caf50',
  borderRadius: 2,
},
borderBottom: {
  position: 'absolute',
  bottom: 0,
  left: '20%',
  right: '20%',
  height: 3,
  backgroundColor: '#4caf50',
  borderRadius: 2,
},
borderLeft: {
  position: 'absolute',
  left: 0,
  top: '25%',
  bottom: '25%',
  width: 3,
  backgroundColor: '#4caf50',
  borderRadius: 2,
},
borderRight: {
  position: 'absolute',
  right: 0,
  top: '25%',
  bottom: '25%',
  width: 3,
  backgroundColor: '#4caf50',
  borderRadius: 2,
},

// Corner Elements
cornerTopLeft: {
  position: 'absolute',
  top: 8,
  left: 8,
  width: 16,
  height: 16,
  borderTopWidth: 3,
  borderLeftWidth: 3,
  borderColor: '#66bb6a',
  borderTopLeftRadius: 8,
},
cornerTopRight: {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 16,
  height: 16,
  borderTopWidth: 3,
  borderRightWidth: 3,
  borderColor: '#66bb6a',
  borderTopRightRadius: 8,
},
cornerBottomLeft: {
  position: 'absolute',
  bottom: 8,
  left: 8,
  width: 16,
  height: 16,
  borderBottomWidth: 3,
  borderLeftWidth: 3,
  borderColor: '#66bb6a',
  borderBottomLeftRadius: 8,
},
cornerBottomRight: {
  position: 'absolute',
  bottom: 8,
  right: 8,
  width: 16,
  height: 16,
  borderBottomWidth: 3,
  borderRightWidth: 3,
  borderColor: '#66bb6a',
  borderBottomRightRadius: 8,
},
});