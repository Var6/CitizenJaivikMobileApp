// services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your existing website API base URL
const API_BASE_URL = 'https://citizenagriculture.in/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token (if you implement auth later)
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types matching your existing Product model
export interface Product {
  _id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  unit: string;
  farmerName: string;
  farmerDetails: string;
  productDetails: string;
  image: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart item type matching your existing CartContext
export interface CartItem {
  _id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  unit: string;
  farmerName: string;
  farmerDetails: string;
  productDetails: string;
  image: string;
  inStock: boolean;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// Product API - matches your existing Next.js API routes
export const productAPI = {
  // Get all products - matches your GET /api/products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/products');
      const products = response.data;
      
      // Type guard to ensure we have an array
      if (Array.isArray(products)) {
        return products;
      }
      
      console.warn('API returned non-array data:', products);
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get a single product by ID - CORRECTED METHOD
  getProductById: async (id: string): Promise<Product> => {
    try {
      console.log('Fetching product by ID:', id);
      const response = await api.get<Product>(`/products/${id}`);
      console.log('Product fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      
      // Fallback: try to find the product in all products
      try {
        console.log('Trying fallback method...');
        const allProducts = await productAPI.getAllProducts();
        const product = allProducts.find(p => p._id === id);
        
        if (product) {
          console.log('Product found via fallback method:', product);
          return product;
        } else {
          throw new Error(`Product with ID ${id} not found`);
        }
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        throw new Error(`Product with ID ${id} not found`);
      }
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const allProducts = await productAPI.getAllProducts();
      return allProducts.filter((product: Product) => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  },

  // Get products by subcategory
  getProductsBySubCategory: async (subCategory: string): Promise<Product[]> => {
    try {
      const allProducts = await productAPI.getAllProducts();
      return allProducts.filter((product: Product) => 
        product.subCategory?.toLowerCase() === subCategory.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching products by subcategory:', error);
      return [];
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const allProducts = await productAPI.getAllProducts();
      const searchTerm = query.toLowerCase();
      
      return allProducts.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.subCategory?.toLowerCase().includes(searchTerm) ||
        product.farmerName.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Get unique categories
  getCategories: async (): Promise<string[]> => {
    try {
      const allProducts = await productAPI.getAllProducts();
      const categories = [...new Set(allProducts.map((product: Product) => product.category))];
      
      // Type guard to ensure we have strings
      return categories.filter((category): category is string => 
        typeof category === 'string' && category.length > 0
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get unique subcategories for a category
  getSubCategories: async (category: string): Promise<string[]> => {
    try {
      const allProducts = await productAPI.getAllProducts();
      const subCategories = allProducts
        .filter((product: Product) => product.category === category)
        .map((product: Product) => product.subCategory)
        .filter((subCat): subCat is string => typeof subCat === 'string' && subCat.length > 0)
        .filter((subCat: string, index: number, arr: string[]) => arr.indexOf(subCat) === index);
      
      return subCategories;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  },

  // Get in-stock products only
  getInStockProducts: async (): Promise<Product[]> => {
    try {
      const allProducts = await productAPI.getAllProducts();
      return allProducts.filter((product: Product) => product.inStock);
    } catch (error) {
      console.error('Error fetching in-stock products:', error);
      return [];
    }
  },

  // Get featured products (you can define your own logic)
  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      const allProducts = await productAPI.getAllProducts();
      // For now, return first 6 in-stock products as featured
      return allProducts
        .filter((product: Product) => product.inStock)
        .slice(0, 6);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  // Update product (matches your PATCH /api/products/[id])
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    try {
      const response = await api.patch<Product>(`/products/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  },

  // Create product (matches your POST /api/products)
  createProduct: async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> => {
    try {
      const response = await api.post<Product>('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  },

  // Delete product (matches your DELETE /api/products/[id])
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/products/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },
};

// Cart API - using AsyncStorage since you don't have backend cart yet
export const cartAPI = {
  // Get cart from AsyncStorage
  getCart: async (): Promise<CartItem[]> => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const parsed = JSON.parse(cartData);
        // Type guard to ensure we have an array
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  },

  // Add item to cart
  addToCart: async (product: Product, quantity: number = 1): Promise<boolean> => {
    try {
      if (!product.inStock) {
        throw new Error('Product is out of stock');
      }

      const cart = await cartAPI.getCart();
      const existingItemIndex = cart.findIndex(item => item._id === product._id);

      let updatedCart: CartItem[];

      if (existingItemIndex >= 0) {
        // Update existing item
        updatedCart = cart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const cartItem: CartItem = {
          ...product,
          quantity,
        };
        updatedCart = [...cart, cartItem];
      }

      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  },

  // Update cart item quantity
  updateQuantity: async (productId: string, quantity: number): Promise<boolean> => {
    try {
      const cart = await cartAPI.getCart();
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return await cartAPI.removeFromCart(productId);
      }

      const updatedCart = cart.map(item =>
        item._id === productId ? { ...item, quantity } : item
      );

      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return false;
    }
  },

  // Remove item from cart
  removeFromCart: async (productId: string): Promise<boolean> => {
    try {
      const cart = await cartAPI.getCart();
      const updatedCart = cart.filter(item => item._id !== productId);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  },

  // Clear entire cart
  clearCart: async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem('cart');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  },

  // Get cart total
  getCartTotal: async (): Promise<number> => {
    try {
      const cart = await cartAPI.getCart();
      return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  },

  // Get cart item count
  getCartItemCount: async (): Promise<number> => {
    try {
      const cart = await cartAPI.getCart();
      return cart.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  },
};

// Contact/Email API (for your EmailJS integration)
export const contactAPI = {
  // Send contact email using your existing EmailJS setup
  sendContactEmail: async (contactData: {
    name: string;
    email: string;
    message: string;
    phone?: string;
  }) => {
    try {
      // You can integrate EmailJS here or create a backend endpoint
      // For now, this is a placeholder
      console.log('Contact email data:', contactData);
      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error sending contact email:', error);
      return { success: false, message: 'Failed to send message' };
    }
  },
};

// Configuration
export const Config = {
  API_BASE_URL,
  CLOUDINARY_CLOUD_NAME: 'djavbue37',
  CLOUDINARY_UPLOAD_PRESET: 'Jaivik',
  MONGODB_URI: 'mongodb+srv://Jaivik:India@cluster0.9kgmqd4.mongodb.net/',
  
  // EmailJS config (from your .env)
  EMAILJS: {
    SERVICE_ID: 'service_fii1enh',
    TEMPLATE_ID: 'template_sgnwuti',
    TEMPLATE_ID_CONTACT: 'template_dxhuor2',
    PUBLIC_KEY: 'tz7QVBqXDjtq5UiXQ',
  },
};

export default api;