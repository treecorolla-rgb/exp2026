import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Category, CartItem, StoreContextType, ProductPackage, Order, PaymentMethod, CustomerDetails, AdminProfile, DeliveryOption } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_PAYMENT_METHODS, STANDARD_DELIVERY } from '../constants';
import { supabase } from '../lib/supabaseClient';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS); 
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(STANDARD_DELIVERY);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Admin Profile State with Default fallback
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
        email: 'admin@example.com',
        telegramBotToken: '',
        telegramChatId: '',
        usPhoneNumber: '+1 (888) 243-74-06',
        ukPhoneNumber: '+44 (800) 041-87-44',
        whatsappNumber: '', 
        telegramUsername: 'HappyFamilyStore',
        receiveEmailNotifications: true,
        receiveTelegramNotifications: false,
        showFloatingChat: true,
        logoUrl: ''
  });

  // --- SUPABASE FETCHING ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!supabase) {
        console.log('Supabase keys not found, using demo data.');
        setIsLoading(false);
        return;
      }

      try {
        // Use Promise.allSettled so one missing table doesn't break the whole app
        const results = await Promise.allSettled([
          supabase.from('categories').select('*'),
          supabase.from('products').select('*'),
          supabase.from('payment_methods').select('*'),
          supabase.from('delivery_options').select('*'),
          supabase.from('orders').select('*').order('date', { ascending: false }),
          supabase.from('store_settings').select('*').single()
        ]);

        const [catRes, prodRes, pmRes, delRes, ordRes, settingsRes] = results;

        // 1. Categories
        if (catRes.status === 'fulfilled' && catRes.value.data && catRes.value.data.length > 0) {
          setCategories(catRes.value.data);
        }

        // 2. Products
        if (prodRes.status === 'fulfilled' && prodRes.value.data && prodRes.value.data.length > 0) {
          setProducts(prodRes.value.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            activeIngredient: p.active_ingredient,
            price: Number(p.price),
            image: p.image,
            categoryIds: p.category_ids || [],
            isPopular: p.is_popular,
            enabled: p.enabled,
            otherNames: p.other_names,
            description: p.description,
            packages: p.packages,
            deliveryOptions: p.delivery_options
          })));
        }

        // 3. Payment Methods
        if (pmRes.status === 'fulfilled' && pmRes.value.data && pmRes.value.data.length > 0) {
          setPaymentMethods(pmRes.value.data.map((pm: any) => ({
             id: pm.id,
             name: pm.name,
             iconUrl: pm.icon_url,
             enabled: pm.enabled
          })));
        }

        // 4. Delivery Options
        if (delRes.status === 'fulfilled' && delRes.value.data && delRes.value.data.length > 0) {
          setDeliveryOptions(delRes.value.data.map((d: any) => ({
             id: d.id,
             name: d.name,
             price: Number(d.price),
             minDays: d.min_days,
             maxDays: d.max_days,
             icon: d.icon,
             enabled: d.enabled
          })));
        }

        // 5. Orders
        if (ordRes.status === 'fulfilled' && ordRes.value.data && ordRes.value.data.length > 0) {
           setOrders(ordRes.value.data.map((o: any) => ({
              id: o.id,
              customerName: o.customer_name,
              total: Number(o.total),
              status: o.status,
              date: o.date,
              details: o.details
           })));
        }

        // 6. Settings
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
           const s = settingsRes.value.data;
           setAdminProfile({
              email: s.email,
              telegramBotToken: s.telegram_bot_token || '',
              telegramChatId: s.telegram_chat_id || '',
              receiveEmailNotifications: s.receive_email_notifications,
              receiveTelegramNotifications: s.receive_telegram_notifications,
              usPhoneNumber: s.us_phone_number,
              ukPhoneNumber: s.uk_phone_number,
              whatsappNumber: s.whatsapp_number,
              telegramUsername: s.telegram_username,
              showFloatingChat: s.show_floating_chat,
              logoUrl: s.logo_url
           });
        }

      } catch (err) {
        console.error('Unexpected error loading data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const [activeCategoryId, setActiveCategoryId] = useState('cat_bestsellers');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [customerUser, setCustomerUser] = useState<CustomerDetails | null>(null);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('hfs_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const rates = { USD: 1, EUR: 0.92, GBP: 0.79 };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
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

  const [currentView, setCurrentView] = useState<'grid' | 'details' | 'cart' | 'login' | 'admin_dashboard' | 'not_found' | 'customer_auth'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  useEffect(() => { localStorage.setItem('hfs_favorites', JSON.stringify(favorites)); }, [favorites]);

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

  const login = (u: string, p: string) => {
    if (u === 'admin' && p === 'admin123') {
      setIsAuthenticated(true);
      setIsAdminMode(true);
      setCurrentView('admin_dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdminMode(false);
    setCurrentView('login');
  };

  const customerLogin = (phoneOrEmail: string, pass: string) => {
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
    setCurrentView('cart');
    setSelectedProduct(null);
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
      date: new Date().toLocaleDateString('en-GB'),
      details: details
    };

    // Update State
    setOrders(prev => [newOrder, ...prev]);

    // Save to Supabase
    if (supabase) {
      try {
        await supabase.from('orders').insert({
          id: newOrder.id,
          customer_name: newOrder.customerName,
          total: newOrder.total,
          status: newOrder.status,
          date: new Date().toISOString(),
          details: details
        });
      } catch (e) {
        console.error("Error saving order to Supabase", e);
      }
    }

    if (!isCustomerAuthenticated) {
        setCustomerUser(details);
        setIsCustomerAuthenticated(true);
    }
    clearCart();
  };

  const addManualOrder = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    if (supabase) {
      try {
        await supabase.from('orders').insert({
          id: order.id,
          customer_name: order.customerName,
          total: order.total,
          status: order.status,
          date: new Date().toISOString(),
          details: order.details || {}
        });
      } catch (e) {
        console.error("Error saving manual order:", e);
      }
    }
  };

  const toggleAdminMode = () => {
    if (!isAuthenticated) {
       setCurrentView('login');
       return;
    }
    setIsAdminMode((prev) => !prev);
  };

  // --- ADMIN ACTIONS (Sync with Supabase) ---

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!supabase) return null;
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
        }

        const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
        return data.publicUrl;
    } catch (e) {
        console.error("Error uploading image:", e);
        return null;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    if (supabase) {
      const dbPayload = {
        name: updatedProduct.name,
        active_ingredient: updatedProduct.activeIngredient,
        price: updatedProduct.price,
        image: updatedProduct.image,
        category_ids: updatedProduct.categoryIds,
        is_popular: updatedProduct.isPopular,
        enabled: updatedProduct.enabled,
        other_names: updatedProduct.otherNames,
        description: updatedProduct.description,
        packages: updatedProduct.packages,
        delivery_options: updatedProduct.deliveryOptions
      };
      await supabase.from('products').update(dbPayload).eq('id', updatedProduct.id);
    }
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
     setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
    if(supabase) {
       supabase.from('products').update({ price: newPrice }).eq('id', productId);
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter(p => p.id !== productId));
    if (supabase) {
      await supabase.from('products').delete().eq('id', productId);
    }
  };

  const addProduct = async (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    if (supabase) {
      const dbPayload = {
        id: product.id,
        name: product.name,
        active_ingredient: product.activeIngredient,
        price: product.price,
        image: product.image,
        category_ids: product.categoryIds,
        is_popular: product.isPopular,
        enabled: product.enabled,
        other_names: product.otherNames,
        description: product.description,
        packages: product.packages,
        delivery_options: product.deliveryOptions
      };
      await supabase.from('products').insert(dbPayload);
    }
  };

  const addCategory = async (category: Category) => {
    setCategories((prev) => [...prev, category]);
    if (supabase) {
      await supabase.from('categories').insert(category);
    }
  };

  const toggleCategory = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    const newValue = !category.enabled;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: newValue } : c));
    if (supabase) {
      await supabase.from('categories').update({ enabled: newValue }).eq('id', id);
    }
  };

  const removePaymentMethod = async (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    if(supabase) await supabase.from('payment_methods').delete().eq('id', id);
  };
  
  const addPaymentMethod = async (method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
    if(supabase) await supabase.from('payment_methods').insert({
        id: method.id,
        name: method.name,
        icon_url: method.iconUrl,
        enabled: method.enabled
    });
  };

  const togglePaymentMethod = async (id: string) => {
    const method = paymentMethods.find(p => p.id === id);
    if(!method) return;
    const newValue = !method.enabled;
    
    setPaymentMethods(prev => prev.map(p => 
      p.id === id ? { ...p, enabled: newValue } : p
    ));
    if(supabase) await supabase.from('payment_methods').update({ enabled: newValue }).eq('id', id);
  };

  const addDeliveryOption = async (option: DeliveryOption) => {
    setDeliveryOptions(prev => [...prev, option]);
    if(supabase) await supabase.from('delivery_options').insert({
        id: option.id,
        name: option.name,
        price: option.price,
        min_days: option.minDays,
        max_days: option.maxDays,
        icon: option.icon,
        enabled: option.enabled
    });
  };

  const removeDeliveryOption = async (id: string) => {
    setDeliveryOptions(prev => prev.filter(o => o.id !== id));
    if(supabase) await supabase.from('delivery_options').delete().eq('id', id);
  };

  const toggleDeliveryOption = async (id: string) => {
    const option = deliveryOptions.find(o => o.id === id);
    if(!option) return;
    const newValue = !option.enabled;

    setDeliveryOptions(prev => prev.map(o => 
      o.id === id ? { ...o, enabled: newValue } : o
    ));
    if(supabase) await supabase.from('delivery_options').update({ enabled: newValue }).eq('id', id);
  };

  const updateAdminProfile = async (profile: AdminProfile) => {
    setAdminProfile(profile);
    if (supabase) {
        const payload = {
            id: 1, // Singleton
            email: profile.email,
            telegram_bot_token: profile.telegramBotToken,
            telegram_chat_id: profile.telegramChatId,
            receive_email_notifications: profile.receiveEmailNotifications,
            receive_telegram_notifications: profile.receiveTelegramNotifications,
            us_phone_number: profile.usPhoneNumber,
            uk_phone_number: profile.ukPhoneNumber,
            whatsapp_number: profile.whatsappNumber,
            telegram_username: profile.telegramUsername,
            show_floating_chat: profile.showFloatingChat,
            logo_url: profile.logoUrl
        };
        // Upsert
        await supabase.from('store_settings').upsert(payload);
    }
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
        addManualOrder, // Exported
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
        uploadImage,
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