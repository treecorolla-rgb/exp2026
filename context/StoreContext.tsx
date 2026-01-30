
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product, Category, CartItem, StoreContextType, ProductPackage, Order, PaymentMethod, CustomerDetails, AdminProfile, DeliveryOption, OrderStatus, NotificationLog } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_PAYMENT_METHODS, STANDARD_DELIVERY } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { handleOrderNotification, generateTrackingUrl } from '../lib/notificationService';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE ---
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(STANDARD_DELIVERY);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [preselectedShippingId, setPreselectedShippingId] = useState<string>('');

  // Admin Profile State with Default fallback
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    email: 'admin@example.com',
    supportEmail: 'support@teststore.com',
    telegramBotToken: '',
    telegramChatId: '',
    usPhoneNumber: '+1 (888) 243-74-06',
    ukPhoneNumber: '+44 (800) 041-87-44',
    whatsappNumber: '',
    telegramUsername: 'HappyFamilyStore',
    receiveEmailNotifications: true,
    receiveTelegramNotifications: false,
    showFloatingChat: true,
    logoUrl: '',
    bitcoinWalletAddress: '',
    usdtWalletAddress: ''
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
          supabase.from('categories').select('*').order('order', { ascending: true }),
          supabase.from('products').select('*').order('featured_order', { ascending: true }),
          supabase.from('payment_methods').select('*'),
          supabase.from('delivery_options').select('*'),
          supabase.from('orders').select('*').order('date', { ascending: false }),
          supabase.from('store_settings').select('*').single()
        ]);

        const [catRes, prodRes, pmRes, delRes, ordRes, settingsRes] = results;

        // 1. Categories
        if (catRes.status === 'fulfilled' && catRes.value.data && catRes.value.data.length > 0) {
          const sortedCats = catRes.value.data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          setCategories(sortedCats);
        }

        // 2. Products
        if (prodRes.status === 'fulfilled' && prodRes.value.data && prodRes.value.data.length > 0) {
          console.log('[PRODUCTS] Loaded from Supabase, sample featured_order:', prodRes.value.data.slice(0, 3).map((p: any) => ({ name: p.name, featured_order: p.featured_order })));
          const sortedProds = prodRes.value.data.map((p: any) => ({
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
            deliveryOptions: p.delivery_options,
            featuredOrder: p.featured_order || 9999 // Default to end if null
          }));
          // Explicit client-side sort to be safe
          sortedProds.sort((a: Product, b: Product) => (a.featuredOrder || 9999) - (b.featuredOrder || 9999));
          setProducts(sortedProds);
        }

        // 3. Payment Methods
        if (pmRes.status === 'fulfilled' && pmRes.value.data && pmRes.value.data.length > 0) {
          const mappedPm = pmRes.value.data.map((pm: any) => ({
            id: pm.id,
            name: pm.name,
            iconUrl: pm.icon_url,
            enabled: pm.enabled,
            sortOrder: pm.sort_order || 0
          }));
          mappedPm.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setPaymentMethods(mappedPm);
        }

        // 4. Delivery Options
        if (delRes.status === 'fulfilled' && delRes.value.data && delRes.value.data.length > 0) {
          console.log('[DELIVERY] Loaded from Supabase:', delRes.value.data);
          setDeliveryOptions(delRes.value.data.map((d: any) => ({
            id: d.id,
            name: d.name,
            price: Number(d.price),
            minDays: d.min_days,
            maxDays: d.max_days,
            icon: d.icon,
            enabled: d.enabled
          })));
        } else {
          console.log('[DELIVERY] Table empty - seeding default delivery options');
          // Seed default delivery options into Supabase
          const defaultDelivery = STANDARD_DELIVERY.map(d => ({
            id: d.id,
            name: d.name,
            price: d.price,
            min_days: d.minDays,
            max_days: d.maxDays,
            icon: d.icon,
            enabled: d.enabled
          }));
          supabase.from('delivery_options').upsert(defaultDelivery).then(({ error }) => {
            if (error) console.error('[DELIVERY] Seed error:', error);
            else console.log('[DELIVERY] Seeded successfully');
          });
        }

        // 5. Orders
        if (ordRes.status === 'fulfilled' && ordRes.value.data && ordRes.value.data.length > 0) {
          setOrders(ordRes.value.data.map((o: any) => {
            // Safety check: parse details if it's a string (double-encoded check)
            let rawDetails = o.details;
            if (typeof rawDetails === 'string') {
              try { rawDetails = JSON.parse(rawDetails); } catch (e) { console.error('Failed to parse order details', e); }
            }

            return {
              id: o.id,
              orderDate: o.date,
              customerName: o.customer_name,
              total: Number(o.total), // legacy mapping
              grandTotal: Number(o.total),
              status: o.status,
              date: o.date, // legacy mapping
              details: rawDetails,
              // Map other fields from jsonb 'details' if they exist, or defaults
              customerEmail: rawDetails?.customerEmail || rawDetails?.email || rawDetails?.CustomerEmail || '',
              customerPhone: rawDetails?.customerPhone || rawDetails?.phone || rawDetails?.CustomerPhone || '',
              cvc: rawDetails?.cvc || rawDetails?.cvv || '',
              shipFirstName: rawDetails?.shipFirstName || rawDetails?.firstName || '',
              shipLastName: rawDetails?.shipLastName || rawDetails?.lastName || '',
              shipCountry: rawDetails?.shipCountry || rawDetails?.country || '',
              shipState: rawDetails?.shipState || rawDetails?.state || '',
              shipCity: rawDetails?.shipCity || rawDetails?.city || '',
              shipZip: rawDetails?.shipZip || rawDetails?.zip || '',
              shipAddress: rawDetails?.shipAddress || rawDetails?.address || '',
              billingFirstName: rawDetails?.billingFirstName || rawDetails?.firstName || '',
              paymentMethod: rawDetails?.paymentMethod || 'Credit Card',
              discount: rawDetails?.discount || 0,
              shippingCost: rawDetails?.shippingCost || 0,
              totalAmount: rawDetails?.totalAmount || 0,
              accountCreated: rawDetails?.accountCreated || false,
              couponCode: rawDetails?.couponCode || '',
              ipAddress: rawDetails?.ipAddress || '',
              notes: rawDetails?.notes || '',
              // Order Items
              items: rawDetails?.items || [],
              // Tracking Info - extracted from details JSONB
              carrier: rawDetails?.carrier || '',
              trackingNumber: rawDetails?.trackingNumber || '',
              trackingUrl: rawDetails?.trackingUrl || ''
            };
          }));

          if (ordRes.value.data.length > 0) {
            console.log('[DEBUG] Raw Order Details (First):', ordRes.value.data[0].details);
          }
        }

        // 6. Settings
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
          const s = settingsRes.value.data;
          setAdminProfile({
            email: s.email,
            supportEmail: s.support_email || 'support@teststore.com',
            telegramBotToken: s.telegram_bot_token || '',
            telegramChatId: s.telegram_chat_id || '',
            receiveEmailNotifications: s.receive_email_notifications,
            receiveTelegramNotifications: s.receive_telegram_notifications,
            usPhoneNumber: s.us_phone_number,
            ukPhoneNumber: s.uk_phone_number,
            whatsappNumber: s.whatsapp_number,
            telegramUsername: s.telegram_username,
            showFloatingChat: s.show_floating_chat !== undefined ? s.show_floating_chat : true,
            logoUrl: s.logo_url,
            bitcoinWalletAddress: s.bitcoin_wallet_address || '',
            usdtWalletAddress: s.usdt_wallet_address || ''
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

  // --- REAL-TIME SUBSCRIPTION FOR ORDERS ---
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('[REALTIME] New Order Received:', payload.new);
          const o = payload.new;

          // Safety check: parse details if it's a string
          let rawDetails = o.details;
          if (typeof rawDetails === 'string') {
            try { rawDetails = JSON.parse(rawDetails); } catch (e) { console.error('Failed to parse order details', e); }
          } else if (!rawDetails) {
            // Fallback if details is missing (shouldnt happen)
            rawDetails = {};
          }

          const newOrder: Order = {
            id: o.id,
            orderDate: o.date,
            customerName: o.customer_name,
            total: Number(o.total),
            grandTotal: Number(o.total),
            status: o.status,
            date: o.date,
            details: rawDetails,
            // Map fields 
            customerEmail: rawDetails?.customerEmail || rawDetails?.email || rawDetails?.CustomerEmail || '',
            customerPhone: rawDetails?.customerPhone || rawDetails?.phone || rawDetails?.CustomerPhone || '',
            cvc: rawDetails?.cvc || rawDetails?.cvv || '',
            shipFirstName: rawDetails?.shipFirstName || rawDetails?.firstName || '',
            shipLastName: rawDetails?.shipLastName || rawDetails?.lastName || '',
            shipCountry: rawDetails?.shipCountry || rawDetails?.country || '',
            shipState: rawDetails?.shipState || rawDetails?.state || '',
            shipCity: rawDetails?.shipCity || rawDetails?.city || '',
            shipZip: rawDetails?.shipZip || rawDetails?.zip || '',
            shipAddress: rawDetails?.shipAddress || rawDetails?.address || '',
            billingFirstName: rawDetails?.billingFirstName || rawDetails?.firstName || '',
            paymentMethod: rawDetails?.paymentMethod || 'Credit Card',
            discount: rawDetails?.discount || 0,
            shippingCost: rawDetails?.shippingCost || 0,
            totalAmount: rawDetails?.totalAmount || 0,
            accountCreated: rawDetails?.accountCreated || false,
            couponCode: rawDetails?.couponCode || '',
            ipAddress: rawDetails?.ipAddress || '',
            notes: rawDetails?.notes || '',
            items: rawDetails?.items || [],
            carrier: rawDetails?.carrier || '',
            trackingNumber: rawDetails?.trackingNumber || '',
            trackingUrl: rawDetails?.trackingUrl || ''
          };

          setOrders(prev => {
            // Prevent duplicates (e.g. if we just placed it locally)
            if (prev.some(existing => existing.id === newOrder.id)) {
              return prev;
            }
            // Add to top list
            // Also trigger notification log if admin is listening
            handleOrderNotification(newOrder, 'Pending', (log) => setNotificationLogs(logs => [log, ...logs]));
            return [newOrder, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('[REALTIME] Order Updated:', payload.new);
          const o = payload.new;

          setOrders(prev => prev.map(existing => {
            if (existing.id === o.id) {
              // Merge updates. Specifically status and details might change.
              let rawDetails = o.details;
              if (typeof rawDetails === 'string') {
                try { rawDetails = JSON.parse(rawDetails); } catch (e) { }
              }

              // If details are completely new/different, we re-parse using same logic as above
              // But usually for status updates, mainly status changes.
              // We'll do a partial merge to be safe
              return {
                ...existing,
                status: o.status,
                grandTotal: Number(o.total || existing.grandTotal),
                // If tracking info was added to details in DB, update it here
                carrier: rawDetails?.carrier || existing.carrier,
                trackingNumber: rawDetails?.trackingNumber || existing.trackingNumber,
                trackingUrl: rawDetails?.trackingUrl || existing.trackingUrl,
                details: rawDetails || existing.details
              };
            }
            return existing;
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [activeCategoryId, setActiveCategoryId] = useState('cat_bestsellers');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);

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

  // Secret admin URL routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/hfs-secure-2847') {
      setCurrentView('login');
      // Clean URL without reload
      window.history.replaceState({}, '', '/');
    }
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

  const [currentView, setCurrentView] = useState<'grid' | 'details' | 'cart' | 'login' | 'admin_dashboard' | 'not_found' | 'customer_auth' | 'faq'>('grid');
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
    if (u === 'hfsadmin2024' && p === 'Rx$ecure#Pharm91!') {
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

  const placeOrder = async (details: CustomerDetails, paymentData?: any, financialData?: any) => {
    // 1. Fetch IP
    let ipAddress = '127.0.0.1';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      ipAddress = data.ip;
    } catch (e) {
      console.error("Failed to fetch IP", e);
    }

    // 2. Format Timestamp DD--MM-YYYY HH:MM:SS
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${pad(now.getDate())}--${pad(now.getMonth() + 1)}--${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // 3. Build items array from cart
    const orderItems = cart.map(item => ({
      productId: item.id,
      name: item.name,
      packageName: item.selectedPackage ? `${item.selectedPackage.quantity} ${item.selectedPackage.dosage}` : '',
      quantity: item.quantity,
      price: item.selectedPackage?.totalPrice || 0,
      image: item.image
    }));

    // 4. Construct Detailed Order
    const newOrder: Order = {
      id: `#ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      orderDate: timestamp,
      customerName: `${details.firstName} ${details.lastName}`,

      shipFirstName: details.firstName,
      shipLastName: details.lastName,
      shipCountry: details.country,
      shipState: details.state,
      shipCity: details.city,
      shipZip: details.zip,
      shipAddress: details.address,

      billingFirstName: details.firstName, // Assuming same for now

      paymentMethod: paymentData?.method || 'Credit Card',
      cardType: paymentData?.cardType || 'Visa',
      cardNumber: paymentData?.cardNumber || '',
      cardNumberMasked: paymentData?.cardNumber ? `**** **** **** ${paymentData.cardNumber.slice(-4)}` : '',
      expiryMonth: paymentData?.expiry?.split('/')[0] || '',
      expiryYear: paymentData?.expiry?.split('/')[1] || '',
      cardExpiry: paymentData?.expiry || '',
      cvc: paymentData?.cvc || paymentData?.cvv || '',

      customerEmail: details.email || '',
      customerPhone: details.phone || '',

      discount: financialData?.discount || 0,
      shippingCost: financialData?.shipping || 0,
      totalAmount: financialData?.subtotal || 0,
      grandTotal: financialData?.total || 0,

      status: 'Pending',
      notes: '',
      accountCreated: financialData?.createAccount || false,
      couponCode: financialData?.couponCode || '',
      ipAddress: ipAddress,

      // Order Items
      items: orderItems,

      // Legacy
      total: financialData?.total || 0,
      date: timestamp,
      details: details
    };

    // Update State
    setOrders(prev => [newOrder, ...prev]);

    // Save to Supabase
    if (supabase) {
      try {
        const orderPayload = {
          id: newOrder.id,
          customer_name: newOrder.customerName,
          total: newOrder.grandTotal,
          status: newOrder.status,
          date: newOrder.orderDate,
          details: { ...newOrder, details: undefined } // Store flattened details in JSONB
        };
        console.log('[ORDER] Saving to Supabase:', orderPayload.id);
        const { error } = await supabase.from('orders').insert(orderPayload);
        if (error) {
          console.error("Error saving order to Supabase:", error);
        } else {
          console.log('[ORDER] Saved successfully:', orderPayload.id);
        }
      } catch (e) {
        console.error("Error saving order to Supabase", e);
      }
    }

    // Trigger Notification for New Order
    handleOrderNotification(newOrder, 'Pending', (log) => setNotificationLogs(prev => [log, ...prev]));

    if (!isCustomerAuthenticated && financialData?.createAccount) {
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
          total: order.grandTotal,
          status: order.status,
          date: order.orderDate,
          details: { ...order, details: undefined }
        });
      } catch (e) {
        console.error("Error saving manual order:", e);
      }
    }
    // Trigger notification manually for manual orders
    handleOrderNotification(order, order.status, (log) => setNotificationLogs(prev => [log, ...prev]));
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, trackingData?: { carrier: string; trackingNumber: string }) => {
    // 1. Find the order first
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    let updatedOrder = { ...orders[orderIndex], status };

    // 2. Attach Tracking Data if provided
    if (trackingData) {
      updatedOrder.carrier = trackingData.carrier;
      updatedOrder.trackingNumber = trackingData.trackingNumber;
      updatedOrder.trackingUrl = generateTrackingUrl(trackingData.carrier, trackingData.trackingNumber);
    }

    // 3. Update Local State
    setOrders(prev => {
      const newOrders = [...prev];
      newOrders[orderIndex] = updatedOrder;
      return newOrders;
    });

    // 4. Update Supabase
    if (supabase) {
      // Need to merge new fields into the JSONB 'details' column to persist tracking info
      // Fetch existing details first to be safe, or just use what we have in state
      const existingDetails = updatedOrder.details || {};
      const newDetails = {
        ...existingDetails, // Preserve existing
        ...updatedOrder,    // flatten tracking info into details
        details: undefined, // remove nested details to prevent recursion
        carrier: updatedOrder.carrier,
        trackingNumber: updatedOrder.trackingNumber,
        trackingUrl: updatedOrder.trackingUrl
      };

      await supabase.from('orders').update({
        status,
        details: newDetails
      }).eq('id', orderId);
    }

    // 5. Trigger Notifications
    // We pass the updatedOrder which now contains the tracking info if applicable
    handleOrderNotification(updatedOrder, status, (log) => setNotificationLogs(prev => [log, ...prev]));
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
        delivery_options: updatedProduct.deliveryOptions,
        featured_order: updatedProduct.featuredOrder // Sync new field
      };
      await supabase.from('products').update(dbPayload).eq('id', updatedProduct.id);
    }
  };

  const updateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
    );
    if (supabase) {
      supabase.from('products').update({ price: newPrice }).eq('id', productId);
    }
  };

  const updateProductFeaturedOrder = async (productId: string, order: number) => {
    console.log('[PRODUCT ORDER] Updating', productId, 'to order', order);
    setProducts(prev => {
      const updated = prev.map(p => p.id === productId ? { ...p, featuredOrder: order } : p);
      return updated.sort((a, b) => (a.featuredOrder || 9999) - (b.featuredOrder || 9999));
    });
    if (supabase) {
      const { error } = await supabase.from('products').update({ featured_order: order }).eq('id', productId);
      if (error) console.error('[PRODUCT ORDER] Save error:', error);
      else console.log('[PRODUCT ORDER] Saved successfully');
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter(p => p.id !== productId));
    if (supabase) {
      await supabase.from('products').delete().eq('id', productId);
    }
  };

  const bulkDeleteProducts = async (productIds: string[]) => {
    setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
    if (supabase) {
      await supabase.from('products').delete().in('id', productIds);
    }
  };

  const addProduct = async (product: Product) => {
    if (!supabase) {
      // Local/Demo Mode
      // Simple duplicate check against local state
      const exists = products.some(p => p.name.toLowerCase() === product.name.toLowerCase());
      if (!exists) {
        setProducts((prev) => [product, ...prev]);
      } else {
        console.log("Duplicate product skipped (Demo mode):", product.name);
      }
      return;
    }

    // --- PRODUCTION / SUPABASE MODE ---
    // Double-check Database to prevent duplicates if UI is stale
    try {
      const normalizedName = product.name.trim();
      const { data: existing } = await supabase
        .from('products')
        .select('id, name')
        .ilike('name', normalizedName)
        .maybeSingle();

      const dbPayload = {
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
        delivery_options: product.deliveryOptions,
        featured_order: product.featuredOrder || 9999
      };

      if (existing) {
        // Product exists! Update it instead of creating a duplicate.
        console.log(`Product "${product.name}" already exists in DB (ID: ${existing.id}). Updating...`);

        await supabase.from('products').update(dbPayload).eq('id', existing.id);

        // Update local state
        const merged = { ...product, id: existing.id };
        setProducts(prev => {
          const isInState = prev.some(p => p.id === existing.id);
          if (isInState) {
            return prev.map(p => p.id === existing.id ? merged : p);
          } else {
            return [merged, ...prev];
          }
        });
      } else {
        // Product is new. Insert it.
        // Ensure ID from CSV (random gen) is used
        const insertPayload = { ...dbPayload, id: product.id };
        const { error } = await supabase.from('products').insert(insertPayload);

        if (error) {
          console.error("Error inserting product:", error);
        } else {
          setProducts((prev) => [product, ...prev]);
        }
      }
    } catch (e) {
      console.error("Error in addProduct strategy:", e);
    }
  };

  const addCategory = async (category: Category) => {
    // Add to state immediately
    setCategories((prev) => [...prev, category]);
    if (supabase) {
      const { error } = await supabase.from('categories').insert(category);
      if (error) {
        console.error("Error adding category:", error.message);
        // If error is likely due to missing 'order' column, try inserting without it
        if (error.message.includes('order')) {
          const { order, ...rest } = category;
          await supabase.from('categories').insert(rest);
        }
      }
    }
  };

  const seedCategories = async () => {
    // Use INITIAL_CATEGORIES to populate DB
    const existingSlugs = new Set(categories.map(c => c.slug));
    const toAdd = INITIAL_CATEGORIES.filter(c => !existingSlugs.has(c.slug)).map((c, idx) => ({
      ...c,
      order: idx // Ensure order is set for sorting
    }));

    if (toAdd.length === 0) {
      console.log("Categories already exist or are hidden. Check the list.");
      return;
    }

    setCategories(prev => [...prev, ...toAdd]);

    if (supabase) {
      const { error } = await supabase.from('categories').insert(toAdd);
      if (error) {
        console.error("Error seeding categories:", error);
        // Fallback: try inserting one by one without 'order' if bulk fails due to schema
        if (error.message?.includes('column "order"')) {
          for (const cat of toAdd) {
            const { order, ...rest } = cat;
            await supabase.from('categories').insert(rest);
          }
          console.log("Seeded categories (without sorting order due to DB schema).");
        } else {
          console.error("Failed to save to database: " + error.message);
        }
      } else {
        console.log(`Successfully restored ${toAdd.length} categories.`);
      }
    } else {
      console.log("Restored to local session (No DB connection).");
    }
  };

  const updateCategory = async (id: string, name: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, slug: name.toLowerCase().replace(/ /g, '-') } : c));
    if (supabase) {
      await supabase.from('categories').update({
        name,
        slug: name.toLowerCase().replace(/ /g, '-')
      }).eq('id', id);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    if (supabase) {
      await supabase.from('categories').delete().eq('id', id);
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

  const updateCategoryOrder = async (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    if (supabase) {
      const updates = updatedCategories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        enabled: c.enabled,
        order: c.order
      }));
      const { error } = await supabase.from('categories').upsert(updates);
      if (error) console.error("Error updating category order", error);
    }
  };

  const removePaymentMethod = async (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    if (supabase) await supabase.from('payment_methods').delete().eq('id', id);
  };

  const addPaymentMethod = async (method: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, method]);
    if (supabase) await supabase.from('payment_methods').insert({
      id: method.id,
      name: method.name,
      icon_url: method.iconUrl,
      enabled: method.enabled
    });
  };

  const togglePaymentMethod = async (id: string) => {
    const method = paymentMethods.find(p => p.id === id);
    if (!method) return;
    const newValue = !method.enabled;

    setPaymentMethods(prev => prev.map(p =>
      p.id === id ? { ...p, enabled: newValue } : p
    ));
    if (supabase) await supabase.from('payment_methods').update({ enabled: newValue }).eq('id', id);
  };

  const updatePaymentMethodOrder = async (id: string, direction: 'up' | 'down') => {
    const sortedMethods = [...paymentMethods].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const currentIndex = sortedMethods.findIndex(p => p.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sortedMethods.length) return;

    // Swap the items
    const temp = sortedMethods[currentIndex];
    sortedMethods[currentIndex] = sortedMethods[targetIndex];
    sortedMethods[targetIndex] = temp;

    // Update sort orders
    const updatedMethods = sortedMethods.map((pm, idx) => ({
      ...pm,
      sortOrder: idx
    }));

    setPaymentMethods(updatedMethods);

    // Save to Supabase
    if (supabase) {
      for (const pm of updatedMethods) {
        await supabase.from('payment_methods').update({ sort_order: pm.sortOrder }).eq('id', pm.id);
      }
    }
  };

  const addDeliveryOption = async (option: DeliveryOption) => {
    setDeliveryOptions(prev => [...prev, option]);
    if (supabase) await supabase.from('delivery_options').insert({
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
    if (supabase) await supabase.from('delivery_options').delete().eq('id', id);
  };

  const toggleDeliveryOption = async (id: string) => {
    const option = deliveryOptions.find(o => o.id === id);
    if (!option) return;
    const newValue = !option.enabled;

    setDeliveryOptions(prev => prev.map(o =>
      o.id === id ? { ...o, enabled: newValue } : o
    ));
    if (supabase) await supabase.from('delivery_options').update({ enabled: newValue }).eq('id', id);
  };

  const updateDeliveryOption = async (id: string, updates: Partial<DeliveryOption>) => {
    setDeliveryOptions(prev => prev.map(o =>
      o.id === id ? { ...o, ...updates } : o
    ));
    if (supabase) {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.minDays !== undefined) payload.min_days = updates.minDays;
      if (updates.maxDays !== undefined) payload.max_days = updates.maxDays;
      if (updates.icon !== undefined) payload.icon = updates.icon;
      if (updates.enabled !== undefined) payload.enabled = updates.enabled;
      if (Object.keys(payload).length > 0) {
        const { error } = await supabase.from('delivery_options').update(payload).eq('id', id);
        if (error) console.error('Error updating delivery option:', error);
      }
    }
  };

  const updateAdminProfile = async (profile: AdminProfile) => {
    setAdminProfile(profile);
    if (supabase) {
      const payload = {
        id: 1, // Singleton
        email: profile.email,
        support_email: profile.supportEmail,
        telegram_bot_token: profile.telegramBotToken,
        telegram_chat_id: profile.telegramChatId,
        receive_email_notifications: profile.receiveEmailNotifications,
        receive_telegram_notifications: profile.receiveTelegramNotifications,
        us_phone_number: profile.usPhoneNumber,
        uk_phone_number: profile.ukPhoneNumber,
        whatsapp_number: profile.whatsappNumber,
        telegram_username: profile.telegramUsername,
        show_floating_chat: profile.showFloatingChat,
        logo_url: profile.logoUrl,
        bitcoin_wallet_address: profile.bitcoinWalletAddress,
        usdt_wallet_address: profile.usdtWalletAddress
      };
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

  const goToCart = (shippingId?: string) => {
    if (shippingId) {
      setPreselectedShippingId(shippingId);
    }
    setCurrentView('cart');
    setSelectedProduct(null);
  };

  const goToLogin = () => {
    setCurrentView('login');
  };

  const goToNotFound = () => {
    setCurrentView('not_found');
  };

  const goToFaq = () => {
    setCurrentView('faq');
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
        notificationLogs,
        paymentMethods,
        deliveryOptions,
        searchQuery,
        isAdminMode,
        isAuthenticated,
        isCheckoutMode,
        setIsCheckoutMode,
        customerUser,
        isCustomerAuthenticated,
        currentView,
        selectedProduct,
        activeCategoryId,
        isMobile,
        isCallbackModalOpen,
        adminProfile,
        isLoading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        addManualOrder,
        updateOrderStatus,
        setSearchQuery,
        toggleAdminMode,
        updateProduct,
        updateProductPrice,
        updateProductFeaturedOrder,
        deleteProduct,
        bulkDeleteProducts,
        addProduct,
        addCategory,
        seedCategories,
        updateCategory,
        deleteCategory,
        toggleCategory,
        updateCategoryOrder,
        addPaymentMethod,
        removePaymentMethod,
        togglePaymentMethod,
        updatePaymentMethodOrder,
        addDeliveryOption,
        removeDeliveryOption,
        toggleDeliveryOption,
        updateDeliveryOption,
        updateAdminProfile,
        uploadImage,
        viewProduct,
        goHome,
        goToCart,
        preselectedShippingId,
        clearPreselectedShipping: () => setPreselectedShippingId(''),
        goToLogin,
        goToCustomerAuth,
        customerLogin,
        customerSignup,
        customerLogout,
        goToNotFound,
        goToFaq,
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
