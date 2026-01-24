import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Category, CartItem, StoreContextType, ProductPackage, Order, PaymentMethod, CustomerDetails, AdminProfile, DeliveryOption } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_PAYMENT_METHODS, STANDARD_DELIVERY } from '../constants';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hfs_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('hfs_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  
  const [activeCategoryId, setActiveCategoryId] = useState('cat_bestsellers'); // Default Home View

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('hfs_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_METHODS;
  });

  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(() => {
    const saved = localStorage.getItem('hfs_delivery_options');
    return saved ? JSON.parse(saved) : STANDARD_DELIVERY;
  });

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => {
    const saved = localStorage.getItem('hfs_admin_profile');
    if (saved) return JSON.parse(saved);
    return {
        email: 'admin@example.com',
        telegramBotToken: '',
        telegramChatId: '',
        // Default Contact Numbers
        usPhoneNumber: '+1 (888) 243-74-06',
        ukPhoneNumber: '+44 (800) 041-87-44',
        // Default values for demo visibility
        whatsappNumber: '15551234567', 
        telegramUsername: 'HappyFamilyStore',
        receiveEmailNotifications: true,
        receiveTelegramNotifications: false,
        showFloatingChat: true
    };
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Customer State
  const [customerUser, setCustomerUser] = useState<CustomerDetails | null>(null);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false);

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('hfs_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  // Currency State
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  // Simple static rates for demo
  const rates = { USD: 1, EUR: 0.92, GBP: 0.79 };

  // Device Detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Check on resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // IP Geolocation for Currency
  useEffect(() => {
    // Only run if user hasn't manually set currency (simulated by just running once on mount for this demo)
    fetch('https://ipwho.is/')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
               if (data.continent_code === 'EU') {
                   if (data.country_code === 'GB') setCurrency('GBP');
                   else setCurrency('EUR');
               } else {
                   setCurrency('USD');
               }
            }
        })
        .catch(() => setCurrency('USD'));
  }, []);

  // Navigation State
  const [currentView, setCurrentView] = useState<'grid' | 'details' | 'cart' | 'login' | 'admin_dashboard' | 'not_found' | 'customer_auth'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modal State
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  // Mock Orders (persisted in local storage for this demo to simulate backend)
  const [orders, setOrders] = useState<Order[]>(() => {
     const saved = localStorage.getItem('hfs_orders');
     if (saved) return JSON.parse(saved);
     return [
      { id: '#ORD-7752', customerName: 'Alice Johnson', total: 150.00, status: 'Pending', date: '2023-10-24' },
      { id: '#ORD-7751', customerName: 'Mark Smith', total: 60.00, status: 'Shipped', date: '2023-10-23' },
      { id: '#ORD-7750', customerName: 'Jane Doe', total: 298.00, status: 'Delivered', date: '2023-10-22' },
      { id: '#ORD-7749', customerName: 'Robert Brown', total: 105.00, status: 'Delivered', date: '2023-10-21' },
    ];
  });

  // Persistence Effects
  useEffect(() => { localStorage.setItem('hfs_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('hfs_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('hfs_payments', JSON.stringify(paymentMethods)); }, [paymentMethods]);
  useEffect(() => { localStorage.setItem('hfs_delivery_options', JSON.stringify(deliveryOptions)); }, [deliveryOptions]);
  useEffect(() => { localStorage.setItem('hfs_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('hfs_admin_profile', JSON.stringify(adminProfile)); }, [adminProfile]);
  useEffect(() => { localStorage.setItem('hfs_favorites', JSON.stringify(favorites)); }, [favorites]);

  // Currency Formatter
  const formatPrice = (price: number) => {
    const rate = rates[currency];
    const val = (price * rate).toFixed(2);
    if (currency === 'EUR') return `€${val}`;
    if (currency === 'GBP') return `£${val}`;
    return `$${val}`;
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Admin Auth
  const login = (u: string, p: string) => {
    if (u === 'admin' && p === 'admin123') {
      setIsAuthenticated(true);
      setIsAdminMode(true);
      setCurrentView('admin_dashboard'); // Redirect to dashboard on success
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdminMode(false);
    setCurrentView('login');
  };

  // Customer Auth
  const customerLogin = (phoneOrEmail: string, pass: string) => {
    // Simulating login
    if (pass === '123456') {
       const mockUser: CustomerDetails = {
           firstName: 'Customer', lastName: 'User',
           email: phoneOrEmail.includes('@') ? phoneOrEmail : 'user@example.com',
           phone: !phoneOrEmail.includes('@') ? phoneOrEmail : '555-1234',
           address: '', city: '', country: '', state: '', zip: ''
       };
       setCustomerUser(mockUser);
       setIsCustomerAuthenticated(true);
       setCurrentView('grid');
       return true;
    }
    return false;
  };

  const customerSignup = (details: CustomerDetails) => {
    setCustomerUser(details);
    setIsCustomerAuthenticated(true);
    setCurrentView('grid');
  };

  const customerLogout = () => {
    setCustomerUser(null);
    setIsCustomerAuthenticated(false);
    setCurrentView('customer_auth');
  };
  
  const goToCustomerAuth = () => {
    setCurrentView('customer_auth');
  };

  const addToCart = (product: Product, pkg?: ProductPackage) => {
    setCart((prev) => {
      const itemId = pkg ? `${product.id}-${pkg.id}` : product.id;
      const existing = prev.find((item) => {
        if (pkg) return item.selectedPackageId === pkg.id;
        return item.id === product.id;
      });

      if (existing) {
        return prev.map((item) => {
          const isMatch = pkg ? item.selectedPackageId === pkg.id : item.id === product.id;
          return isMatch ? { ...item, quantity: item.quantity + 1 } : item;
        });
      }

      const newItem: CartItem = {
        ...product,
        quantity: 1,
        selectedPackageId: pkg?.id,
        selectedPackage: pkg,
        price: pkg ? pkg.totalPrice : product.price
      };
      return [...prev, newItem];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      const currentId = item.selectedPackageId ? `${item.id}-${item.selectedPackageId}` : item.id;
      if (currentId === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => {
        const currentId = item.selectedPackageId ? `${item.id}-${item.selectedPackageId}` : item.id;
        return currentId !== itemId;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const placeOrder = async (details: CustomerDetails) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 200 ? 0 : 25.00;
    const total = subtotal + shipping;

    const newOrder: Order = {
      id: `#ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: `${details.firstName} ${details.lastName}`,
      total: total,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY format approx
      details: details
    };

    setOrders(prev => [newOrder, ...prev]);
    // Auto login if not already
    if (!isCustomerAuthenticated) {
        setCustomerUser(details);
        setIsCustomerAuthenticated(true);
    }
    clearCart();
  };

  const toggleAdminMode = () => {
    if (!isAuthenticated) {
       setCurrentView('login');
       return;
    }
    setIsAdminMode((prev) => !prev);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
     setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter(p => p.id !== productId));
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
  };

  const addCategory = (category: Category) => {
    setCategories((prev) => [...prev, category]);
  };

  const toggleCategory = (id: string) => {
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ));
  };

  // Payment Methods Logic
  const removePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
  };
  
  const addPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
  };

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  // Delivery Options Logic
  const addDeliveryOption = (option: DeliveryOption) => {
    setDeliveryOptions(prev => [...prev, option]);
  };

  const removeDeliveryOption = (id: string) => {
    setDeliveryOptions(prev => prev.filter(o => o.id !== id));
  };

  const toggleDeliveryOption = (id: string) => {
    setDeliveryOptions(prev => prev.map(o => 
      o.id === id ? { ...o, enabled: !o.enabled } : o
    ));
  };

  const updateAdminProfile = (profile: AdminProfile) => {
    setAdminProfile(profile);
  };

  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('details');
  };

  const goHome = () => {
    setCurrentView('grid');
    setSelectedProduct(null);
  };

  const goToCart = () => {
    setCurrentView('cart');
    setSelectedProduct(null);
  };

  const goToLogin = () => {
    setCurrentView('login');
  };

  const goToNotFound = () => {
    setCurrentView('not_found');
  };

  const toggleCallbackModal = () => {
    setIsCallbackModalOpen(!isCallbackModalOpen);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        paymentMethods,
        deliveryOptions,
        searchQuery,
        isAdminMode,
        isAuthenticated,
        customerUser,
        isCustomerAuthenticated,
        currentView,
        selectedProduct,
        activeCategoryId,
        isMobile,
        isCallbackModalOpen,
        adminProfile,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        setSearchQuery,
        toggleAdminMode,
        updateProduct,
        updateProductPrice,
        deleteProduct,
        addProduct,
        addCategory,
        toggleCategory,
        addPaymentMethod,
        removePaymentMethod,
        togglePaymentMethod,
        addDeliveryOption,
        removeDeliveryOption,
        toggleDeliveryOption,
        updateAdminProfile,
        viewProduct,
        goHome,
        goToCart,
        goToLogin,
        goToCustomerAuth,
        customerLogin,
        customerSignup,
        customerLogout,
        goToNotFound,
        toggleCallbackModal,
        login,
        logout,
        setActiveCategoryId,
        favorites,
        toggleFavorite,
        currency,
        setCurrency,
        formatPrice
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
