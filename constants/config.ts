// constants/Config.ts
export const Config = {
  API_BASE_URL: 'https://citizenagriculture.in/api',
  RAZORPAY_KEY_ID: 'your_razorpay_key_id', // Replace with your actual key
  
  // App settings
  ITEMS_PER_PAGE: 10,
  MAX_CART_QUANTITY: 99,
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    USER_DATA: 'userData',
    CART_DATA: 'cartData',
  },
  
  // API endpoints (if you need them separately)
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PRODUCTS: '/products',
    CART: '/cart',
    ORDERS: '/orders',
  },
};