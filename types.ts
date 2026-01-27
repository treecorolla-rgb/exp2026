
export interface Category {
  id: string;
  name: string;
  slug: string;
  enabled: boolean; // Control visibility
  order?: number; // For hierarchy sorting
}

export interface ProductPackage {
  id: string;
  dosage: string; // e.g., "100 MG"
  quantity: number;
  pricePerPill: number;
  totalPrice: number;
  savings?: number;
  bonus?: string; // e.g., "Free Airmail shipping"
}

export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  minDays: number;
  maxDays: number;
  icon: string; // 'normal' or 'express'
  enabled: boolean;
}

export interface Product {
  id: string;
  name: string;
  activeIngredient: string;
  price: number; // Base price for display in grid
  image: string;
  categoryIds: string[]; // Changed from categoryId to support multiple categories
  isPopular?: boolean;
  enabled?: boolean; // New field to control visibility
  featuredOrder?: number; // For Home Page / Best Seller hierarchy
  // Detailed fields
  otherNames?: string[];
  description?: string;
  packages?: ProductPackage[];
  deliveryOptions?: DeliveryOption[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedPackageId?: string; // Track which specific package was bought
  selectedPackage?: ProductPackage;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  address: string;
  phone: string;
  email: string;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderDate: string; // DD--MM-YYYY HH:MM:SS
  customerName: string;
  
  // Shipping Details
  shipFirstName: string;
  shipLastName: string;
  shipCountry: string;
  shipState: string;
  shipCity: string;
  shipZip: string;
  shipAddress: string;
  
  // Billing Details (Simulated or same as shipping)
  billingFirstName: string;
  
  // Payment Details
  paymentMethod: string;
  cardType?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvc?: string;
  
  // Financials
  discount: number;
  shippingCost: number;
  totalAmount: number; // Subtotal
  grandTotal: number; // Final Total
  
  status: OrderStatus;
  notes?: string;
  accountCreated?: boolean;
  couponCode?: string;
  ipAddress?: string;

  // Tracking Data Module
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;

  // Legacy/Helper fields for UI compatibility
  total: number; // Maps to grandTotal
  date: string; // Maps to orderDate
  details?: CustomerDetails; 
}

export interface PaymentMethod {
  id: string;
  name: string;
  iconUrl?: string; // If null, use text
  enabled: boolean;
}

export interface AdminProfile {
  email: string;
  telegramBotToken: string;
  telegramChatId: string;
  receiveEmailNotifications: boolean;
  receiveTelegramNotifications: boolean;
  // Contact Numbers Configuration
  usPhoneNumber: string;
  ukPhoneNumber: string;
  // Floating Chat Settings
  whatsappNumber: string;
  telegramUsername: string; // For the public link t.me/username
  showFloatingChat: boolean;
  // Visuals
  logoUrl?: string;
}

export interface NotificationLog {
  id: string;
  orderId: string;
  channel: 'Email' | 'SMS' | 'WhatsApp';
  type: 'Confirmation' | 'Shipped' | 'Delivered';
  recipient: string;
  status: 'Sent' | 'Failed' | 'Retrying';
  timestamp: string;
  details: string; // e.g., "Tracking link included: ..."
}

export interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  notificationLogs: NotificationLog[];
  paymentMethods: PaymentMethod[];
  deliveryOptions: DeliveryOption[];
  searchQuery: string;
  isAdminMode: boolean;
  isAuthenticated: boolean;
  currentView: 'grid' | 'details' | 'cart' | 'login' | 'admin_dashboard' | 'not_found' | 'customer_auth';
  selectedProduct: Product | null;
  activeCategoryId: string;
  
  // Device Detection
  isMobile: boolean;

  // Admin Profile
  adminProfile: AdminProfile;
  updateAdminProfile: (profile: AdminProfile) => void;

  // Modal State
  isCallbackModalOpen: boolean;
  toggleCallbackModal: () => void;

  addToCart: (product: Product, pkg?: ProductPackage) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  // Updated placeOrder signature to accept more data
  placeOrder: (details: CustomerDetails, paymentData?: any, financialData?: any) => Promise<void>;
  addManualOrder: (order: Order) => Promise<void>; 
  // Update order status with optional tracking data
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingData?: { carrier: string; trackingNumber: string }) => Promise<void>;
  
  setSearchQuery: (query: string) => void;
  toggleAdminMode: () => void;
  updateProduct: (product: Product) => void; // Full update
  updateProductPrice: (productId: string, newPrice: number) => void;
  updateProductFeaturedOrder: (productId: string, order: number) => void; // New
  deleteProduct: (productId: string) => void;
  bulkDeleteProducts: (productIds: string[]) => void; // New
  addProduct: (product: Product) => void;
  addCategory: (category: Category) => void;
  seedCategories: () => Promise<void>; // New: Restore defaults
  updateCategory: (id: string, name: string) => void; // New
  deleteCategory: (id: string) => void; // New
  toggleCategory: (id: string) => void;
  updateCategoryOrder: (categories: Category[]) => void; // New
  setActiveCategoryId: (id: string) => void;
  
  // Payment Methods
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  togglePaymentMethod: (id: string) => void;

  // Delivery Options
  addDeliveryOption: (option: DeliveryOption) => void;
  removeDeliveryOption: (id: string) => void;
  toggleDeliveryOption: (id: string) => void;

  // Image Upload
  uploadImage: (file: File) => Promise<string | null>;

  viewProduct: (product: Product) => void;
  goHome: () => void;
  goToCart: () => void;
  goToNotFound: () => void;
  goToLogin: () => void;
  
  // Customer Auth
  customerUser: CustomerDetails | null;
  isCustomerAuthenticated: boolean;
  customerLogin: (phoneOrEmail: string, pass: string) => boolean;
  customerSignup: (details: CustomerDetails) => void;
  customerLogout: () => void;
  goToCustomerAuth: () => void;

  // Authentication (Admin)
  login: (u: string, p: string) => boolean;
  logout: () => void;

  // New Features
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  currency: 'USD' | 'EUR' | 'GBP';
  setCurrency: (c: 'USD' | 'EUR' | 'GBP') => void;
  formatPrice: (price: number) => string;
}
