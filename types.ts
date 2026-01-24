export interface Category {
  id: string;
  name: string;
  slug: string;
  enabled: boolean; // Control visibility
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

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  date: string;
  details?: CustomerDetails; // Optional details for the expanded view
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
}

export interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
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
  placeOrder: (details: CustomerDetails) => Promise<void>;
  setSearchQuery: (query: string) => void;
  toggleAdminMode: () => void;
  updateProduct: (product: Product) => void; // Full update
  updateProductPrice: (productId: string, newPrice: number) => void;
  deleteProduct: (productId: string) => void;
  addProduct: (product: Product) => void;
  addCategory: (category: Category) => void;
  toggleCategory: (id: string) => void; // New toggle function
  setActiveCategoryId: (id: string) => void;
  
  // Payment Methods
  addPaymentMethod: (method: PaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  togglePaymentMethod: (id: string) => void;

  // Delivery Options
  addDeliveryOption: (option: DeliveryOption) => void;
  removeDeliveryOption: (id: string) => void;
  toggleDeliveryOption: (id: string) => void;

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