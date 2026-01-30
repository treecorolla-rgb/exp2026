import React, { useState, useEffect, useRef } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ShieldCheck, CreditCard, Lock, ChevronLeft, CheckCircle, ChevronDown, Check, AlertCircle, Truck, Copy, RefreshCw, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useToast } from './Toast';
import { CustomerDetails } from '../types';
import { QRCodeSVG } from 'qrcode.react';

// Fallback credentials if not set in Admin Profile
const DEFAULT_TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const DEFAULT_TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

// Comprehensive country list with codes and phone prefixes - alphabetically sorted
const COUNTRIES = [
  { name: 'Afghanistan', code: 'af', phone: '+93' },
  { name: 'Albania', code: 'al', phone: '+355' },
  { name: 'Algeria', code: 'dz', phone: '+213' },
  { name: 'Argentina', code: 'ar', phone: '+54' },
  { name: 'Australia', code: 'au', phone: '+61' },
  { name: 'Austria', code: 'at', phone: '+43' },
  { name: 'Bangladesh', code: 'bd', phone: '+880' },
  { name: 'Belgium', code: 'be', phone: '+32' },
  { name: 'Brazil', code: 'br', phone: '+55' },
  { name: 'Canada', code: 'ca', phone: '+1' },
  { name: 'Chile', code: 'cl', phone: '+56' },
  { name: 'China', code: 'cn', phone: '+86' },
  { name: 'Colombia', code: 'co', phone: '+57' },
  { name: 'Czech Republic', code: 'cz', phone: '+420' },
  { name: 'Denmark', code: 'dk', phone: '+45' },
  { name: 'Egypt', code: 'eg', phone: '+20' },
  { name: 'Finland', code: 'fi', phone: '+358' },
  { name: 'France', code: 'fr', phone: '+33' },
  { name: 'Germany', code: 'de', phone: '+49' },
  { name: 'Greece', code: 'gr', phone: '+30' },
  { name: 'Hong Kong', code: 'hk', phone: '+852' },
  { name: 'Hungary', code: 'hu', phone: '+36' },
  { name: 'India', code: 'in', phone: '+91' },
  { name: 'Indonesia', code: 'id', phone: '+62' },
  { name: 'Ireland', code: 'ie', phone: '+353' },
  { name: 'Israel', code: 'il', phone: '+972' },
  { name: 'Italy', code: 'it', phone: '+39' },
  { name: 'Japan', code: 'jp', phone: '+81' },
  { name: 'Kenya', code: 'ke', phone: '+254' },
  { name: 'Malaysia', code: 'my', phone: '+60' },
  { name: 'Mexico', code: 'mx', phone: '+52' },
  { name: 'Morocco', code: 'ma', phone: '+212' },
  { name: 'Netherlands', code: 'nl', phone: '+31' },
  { name: 'New Zealand', code: 'nz', phone: '+64' },
  { name: 'Nigeria', code: 'ng', phone: '+234' },
  { name: 'Norway', code: 'no', phone: '+47' },
  { name: 'Pakistan', code: 'pk', phone: '+92' },
  { name: 'Peru', code: 'pe', phone: '+51' },
  { name: 'Philippines', code: 'ph', phone: '+63' },
  { name: 'Poland', code: 'pl', phone: '+48' },
  { name: 'Portugal', code: 'pt', phone: '+351' },
  { name: 'Romania', code: 'ro', phone: '+40' },
  { name: 'Russia', code: 'ru', phone: '+7' },
  { name: 'Saudi Arabia', code: 'sa', phone: '+966' },
  { name: 'Singapore', code: 'sg', phone: '+65' },
  { name: 'South Africa', code: 'za', phone: '+27' },
  { name: 'South Korea', code: 'kr', phone: '+82' },
  { name: 'Spain', code: 'es', phone: '+34' },
  { name: 'Sri Lanka', code: 'lk', phone: '+94' },
  { name: 'Sweden', code: 'se', phone: '+46' },
  { name: 'Switzerland', code: 'ch', phone: '+41' },
  { name: 'Taiwan', code: 'tw', phone: '+886' },
  { name: 'Thailand', code: 'th', phone: '+66' },
  { name: 'Turkey', code: 'tr', phone: '+90' },
  { name: 'UAE', code: 'ae', phone: '+971' },
  { name: 'Ukraine', code: 'ua', phone: '+380' },
  { name: 'United Kingdom', code: 'gb', phone: '+44' },
  { name: 'United States', code: 'us', phone: '+1' },
  { name: 'Vietnam', code: 'vn', phone: '+84' },
];

// Helper to get country by code
const getCountryByCode = (code: string) => COUNTRIES.find(c => c.code === code.toLowerCase());
const getCountryByName = (name: string) => COUNTRIES.find(c => c.name === name);

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, goHome, placeOrder, adminProfile, customerUser, isCustomerAuthenticated, formatPrice, paymentMethods, deliveryOptions, preselectedShippingId, clearPreselectedShipping, setIsCheckoutMode } = useStore();
  const { showToast } = useToast();
  const [selectedShippingId, setSelectedShippingId] = useState<string>(preselectedShippingId || '');

  // Clear preselected shipping on mount
  useEffect(() => {
    if (preselectedShippingId) {
      clearPreselectedShipping();
    }
  }, []);
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAccount, setCreateAccount] = useState(true);

  // Update checkout mode in store when step changes
  useEffect(() => {
    setIsCheckoutMode(step === 'checkout');
    setErrorMessage(null); // Clear errors on step change
    return () => setIsCheckoutMode(false);
  }, [step, setIsCheckoutMode]);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Form State - Pre-fill if logged in
  const [formData, setFormData] = useState<CustomerDetails>(customerUser || {
    firstName: '', lastName: '', country: 'India', state: '',
    city: '', zip: '', address: '', phone: '', email: ''
  });

  // Payment State
  const [paymentData, setPaymentData] = useState({
    method: 'Credit Card',
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardType: 'Visa' // Default
  });

  // Crypto payment state
  const [cryptoRates, setCryptoRates] = useState<{ btc: number; usdt: number }>({ btc: 0, usdt: 1 });
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // IP-based country detection
  const [userCountryCode, setUserCountryCode] = useState<string>('in');

  // Ref for Order Summary section (for mobile scroll)
  const orderSummaryRef = useRef<HTMLDivElement>(null);

  // Handle shipping selection with mobile scroll
  const handleShippingSelect = (shippingId: string) => {
    setSelectedShippingId(shippingId);
    setShippingError(null);
    // Only scroll on mobile devices (screen width < 1024px)
    if (window.innerWidth < 1024 && orderSummaryRef.current) {
      setTimeout(() => {
        const element = orderSummaryRef.current;
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const offset = 20; // Padding from top
          window.scrollTo({
            top: absoluteElementTop - offset,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  };

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{ phone?: string; email?: string }>({});
  const [shippingError, setShippingError] = useState<string | null>(null);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_code) {
          const code = data.country_code.toLowerCase();
          setUserCountryCode(code);
          // Set default country in form based on IP
          const detectedCountry = getCountryByCode(code);
          if (detectedCountry && !customerUser) {
            setFormData(prev => ({ ...prev, country: detectedCountry.name }));
          }
        }
      } catch (error) {
        console.log('Could not detect country, using default');
      }
    };
    detectCountry();
  }, [customerUser]);

  // Ensure default method is valid
  useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethods.find(pm => pm.name === paymentData.method)) {
      const first = paymentMethods.find(pm => pm.enabled);
      if (first) setPaymentData(prev => ({ ...prev, method: first.name }));
    }
  }, [paymentMethods]);

  // Fetch crypto rates when Bitcoin or USDT is selected
  const fetchCryptoRates = async () => {
    setCryptoLoading(true);
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether&vs_currencies=usd');
      const data = await response.json();
      setCryptoRates({
        btc: data.bitcoin?.usd || 0,
        usdt: data.tether?.usd || 1
      });
    } catch (error) {
      console.error('Failed to fetch crypto rates:', error);
      setCryptoRates({ btc: 65000, usdt: 1 });
    }
    setCryptoLoading(false);
  };

  useEffect(() => {
    const isCrypto = paymentData.method.toLowerCase().includes('bitcoin') ||
      paymentData.method.toLowerCase().includes('btc') ||
      paymentData.method.toLowerCase().includes('usdt') ||
      paymentData.method.toLowerCase().includes('tether');
    if (isCrypto && step === 'checkout') {
      fetchCryptoRates();
    }
  }, [paymentData.method, step]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Logic: Free shipping if subtotal > 200 USD
  const freeShippingThreshold = 200;
  const isFreeShipping = subtotal >= freeShippingThreshold;

  // Get enabled delivery options
  const enabledDeliveryOptions = deliveryOptions.filter(d => d.enabled);

  // NOTE: No auto-selection of shipping - customer must manually choose

  // Calculate shipping cost based on selection
  const selectedDelivery = enabledDeliveryOptions.find(d => d.id === selectedShippingId);
  const shipping = isFreeShipping ? 0 : (selectedDelivery?.price || 0);

  // Amount needed for free shipping
  const amountForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const total = subtotal + shipping - discountAmount;

  // Calculate crypto amounts with 8 decimal places
  const isBitcoinPayment = paymentData.method.toLowerCase().includes('bitcoin') || paymentData.method.toLowerCase().includes('btc');
  const isUSDTPayment = paymentData.method.toLowerCase().includes('usdt') || paymentData.method.toLowerCase().includes('tether');
  const isCryptoPayment = isBitcoinPayment || isUSDTPayment;

  const cryptoAmount = isBitcoinPayment && cryptoRates.btc > 0
    ? (total / cryptoRates.btc).toFixed(8)
    : isUSDTPayment
      ? total.toFixed(2)
      : '0';

  const walletAddress = isBitcoinPayment
    ? (adminProfile?.bitcoinWalletAddress || '')
    : (adminProfile?.usdtWalletAddress || '');


  const handleApplyCoupon = () => {
    // Simple logic for demo: code 'SAVE10' gives 10% off
    if (couponCode.toLowerCase() === 'save10') {
      setDiscountAmount(subtotal * 0.10);
      showToast('Coupon Applied: 10% Off', 'success');
    } else {
      setDiscountAmount(0);
      showToast('Invalid Coupon Code. Try "SAVE10"', 'error');
    }
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Allow digits, spaces, dashes, parentheses, and + sign
    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear validation errors on change
    if (name === 'phone') {
      if (value && !validatePhone(value)) {
        setValidationErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number' }));
      } else {
        setErrorMessage(null);
      }
    }
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrorMessage(null);
      }
    }
  };

  // Get current country info for forms
  const selectedCountry = getCountryByName(formData.country) || COUNTRIES.find(c => c.code === 'in') || COUNTRIES[0];

  // Payment Validation Functions
  const validateCardNumber = (num: string): boolean => {
    // Remove spaces and dashes
    const cleanNum = num.replace(/[\s-]/g, '');
    if (!/^\d+$/.test(cleanNum)) return false;

    // Luhn Algorithm
    const arr = cleanNum
      .split('')
      .reverse()
      .map(x => parseInt(x));
    const lastDigit = arr.shift(); // Remove last digit
    if (lastDigit === undefined) return false;

    let sum = arr.reduce((acc, val, i) => {
      // Even positions (0, 2...) in remaining reversed array correspond to odd positions from end (2nd, 4th...) 
      // original Luhn: double every 2nd digit from right
      if (i % 2 === 0) {
        const doubled = val * 2;
        return acc + (doubled > 9 ? doubled - 9 : doubled);
      }
      return acc + val;
    }, 0);

    sum += lastDigit;
    return sum % 10 === 0;
  };

  const validateCardExpiry = (expiry: string): boolean => {
    if (!expiry || !expiry.includes('/')) return false;
    const [month, year] = expiry.split('/').map(x => parseInt(x.trim()));
    if (!month || !year || month < 1 || month > 12) return false;

    // Create Date objects for comparison
    const now = new Date();
    const currentYear = parseInt(now.getFullYear().toString().slice(-2)); // last 2 digits
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Auto-format Expiry (MM/YY)
    if (name === 'expiry') {
      let formatted = value.replace(/\D/g, '');
      if (formatted.length > 4) formatted = formatted.slice(0, 4);
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
      }
      setPaymentData(prev => ({ ...prev, expiry: formatted }));
      return;
    }

    setPaymentData(prev => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Credit Card if applicable
    const isCard = ['Credit Card', 'VISA', 'MasterCard', 'Amex', 'Discover'].includes(paymentData.method);
    if (isCard) {
      if (!validateCardNumber(paymentData.cardNumber)) {
        setErrorMessage('Invalid Card Number. Please check and try again.');
        return;
      }
      if (!validateCardExpiry(paymentData.expiry)) {
        setErrorMessage('Invalid Expiry Date. Please check and try again.');
        return;
      }
      if (!paymentData.cvc || paymentData.cvc.length < 3) {
        setErrorMessage('Invalid CVC code.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // 1. Construct Telegram/Email Message
    const itemsList = cart.map(item =>
      `- ${item.name} (${item.selectedPackage?.dosage || 'Std'}) x ${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    const message = `
🛒 *NEW ORDER RECEIVED!*
------------------------
*Customer:* ${formData.firstName} ${formData.lastName}
*Phone:* ${formData.phone}
*Email:* ${formData.email}
*Shipping Address:* ${formData.address}, ${formData.city}, ${formData.state}, ${formData.zip}, ${formData.country}
------------------------
*Order Details:*
${itemsList}

*Payment Method:* ${paymentData.method}
*Subtotal:* ${formatPrice(subtotal)}
*Discount:* -${formatPrice(discountAmount)}
*Shipping:* ${formatPrice(shipping)}
*TOTAL:* ${formatPrice(total)}
------------------------
    `.trim();

    try {
      // 2. Send to Telegram (If enabled in profile)
      const token = adminProfile?.telegramBotToken || DEFAULT_TELEGRAM_BOT_TOKEN;
      const chatId = adminProfile?.telegramChatId || DEFAULT_TELEGRAM_CHAT_ID;
      const shouldUseTelegram = adminProfile?.receiveTelegramNotifications && token && chatId && token !== 'YOUR_BOT_TOKEN_HERE';

      if (shouldUseTelegram) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          }),
        });
      }

      // 3. Send Email (Simulation)
      if (adminProfile?.receiveEmailNotifications) {
        console.log(`[SIMULATION] Sending Admin Email Notification to: ${adminProfile.email}`);
        console.log("Subject: New Order Received");
        console.log("Body:", message);
        await new Promise(r => setTimeout(r, 1000));
      } else {
        await new Promise(r => setTimeout(r, 1000));
      }

      // 4. Save to "Backend" with FULL Details
      await placeOrder(
        formData,
        paymentData,
        {
          subtotal,
          discount: discountAmount,
          shipping,
          total,
          createAccount,
          couponCode
        }
      );

      if (!isCustomerAuthenticated && createAccount) {
        showToast(`Account created for ${formData.phone}! Password sent via email/SMS.`, 'success');
      }

      // 5. Show Success Screen
      setStep('success');
      window.scrollTo(0, 0);

    } catch (error) {
      console.error("Order failed", error);
      showToast("There was an error processing your order. Please try again.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to determine if fields should be shown
  const isCardPayment = ['Credit Card', 'VISA', 'MasterCard', 'Amex', 'Discover'].includes(paymentData.method);

  // --- RENDER: EMPTY CART ---
  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white py-20 px-4">
        <div className="bg-slate-50 p-8 rounded-full mb-6">
          <ShoppingBag size={64} className="text-slate-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 mb-10 text-lg font-medium">Looks like you haven't added any products yet.</p>
        <button onClick={goHome} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded font-bold transition flex items-center gap-2 shadow-md uppercase tracking-wide text-sm">
          <ArrowRight size={18} /> Continue Shopping
        </button>
      </div>
    );
  }

  // --- RENDER: SUCCESS SCREEN ---
  if (step === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white py-20 px-4 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100 shadow-sm">
          <CheckCircle className="text-green-500 w-12 h-12" strokeWidth={2} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Thank You!</h1>
        <p className="text-xl text-slate-600 mb-2 font-medium">Your order has been placed successfully.</p>
        <p className="text-slate-500 mb-10">We have sent a confirmation to your email.</p>
        <button onClick={goHome} className="bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded shadow-lg font-bold transition uppercase tracking-widest text-sm">
          Back to Store
        </button>
      </div>
    );
  }

  // --- RENDER: CHECKOUT FORM ---
  if (step === 'checkout') {
    return (
      <div className="flex-1 bg-white font-sans pb-10">
        {/* New Gradient Header to match screenshot */}
        <div className="bg-gradient-to-b from-[#3b82f6] to-[#60a5fa] text-white p-6 -mx-4 md:-mx-8 -mt-8 mb-8 shadow-sm">
          <div className="max-w-[1200px] mx-auto flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <ShieldCheck size={40} className="text-white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight leading-none">Secure Checkout Page</h1>
            </div>
          </div>
        </div>

        {/* Secure Message and Badges Row */}
        <div className="text-center mb-8">
          <h2 className="text-lg text-slate-700 font-medium mb-6">Secure Checkout Page. All data is safe and secure.</h2>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <img
              src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/geo%20trust.png"
              alt="GeoTrust"
              className="h-12 md:h-14 object-contain"
            />
            <img
              src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/Norton.png"
              alt="Norton Secured"
              className="h-12 md:h-14 object-contain"
            />
            <img
              src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/SSLcertificate.png"
              alt="SSL Certificate"
              className="h-12 md:h-14 object-contain"
            />
            <img
              src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/verified%20by%20visa.png"
              alt="Verified by Visa"
              className="h-12 md:h-14 object-contain"
            />
          </div>

          <div className="mt-6 flex justify-center">
            <button onClick={() => setStep('cart')} className="flex items-center text-primary font-bold text-sm hover:underline">
              <ChevronLeft size={16} /> Back to shop
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 max-w-[1200px] mx-auto px-4 md:px-0">
          {/* LEFT COLUMN: FORM */}
          <div className="flex-1">

            {/* Shipping Address */}
            <div className="mb-10">
              <h2 className="text-2xl font-normal text-slate-800 mb-6 tracking-tight">Shipping Address</h2>

              <form id="checkout-form" onSubmit={handleCompleteOrder} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">

                {/* Row 1: Name */}
                <div className="space-y-1">
                  <input
                    required name="firstName" value={formData.firstName} placeholder="First name *"
                    className="w-full border border-slate-300 rounded p-3 text-slate-700 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-1">
                  <input
                    required name="lastName" value={formData.lastName} placeholder="Last name *"
                    className="w-full border border-slate-300 rounded p-3 text-slate-700 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    onChange={handleInputChange}
                  />
                </div>

                {/* Row 2: Country & State */}
                <div className="space-y-1 relative">
                  {/* Custom Country Select - alphabetically sorted */}
                  <div className="relative border border-slate-300 rounded bg-white">
                    <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-slate-500">Country <span className="text-red-500">*</span></label>
                    <div className="flex items-center h-[46px] px-3">
                      <img
                        src={`https://flagcdn.com/w40/${selectedCountry.code}.png`}
                        alt="Flag"
                        className="w-5 h-3.5 object-cover rounded-[1px] mr-2 shadow-sm"
                      />
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full h-full bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer appearance-none text-sm"
                      >
                        {COUNTRIES.map(country => (
                          <option key={country.code} value={country.name}>{country.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="relative border border-slate-300 rounded bg-white h-[48px] flex items-center">
                    <input
                      required name="state"
                      value={formData.state}
                      placeholder="State / province *"
                      className="w-full h-full px-3 bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
                      onChange={handleInputChange}
                    />
                    <ChevronDown size={16} className="text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                {/* Row 3: City & Zip */}
                <div className="space-y-1">
                  <input required name="city" value={formData.city} placeholder="City *" className="w-full border border-slate-300 rounded p-3 text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary" onChange={handleInputChange} />
                </div>

                <div className="space-y-1">
                  <input required name="zip" value={formData.zip} placeholder="Zip or postal code *" className="w-full border border-slate-300 rounded p-3 text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary" onChange={handleInputChange} />
                </div>

                {/* Row 4: Address */}
                <div className="md:col-span-2 space-y-1">
                  <input required name="address" value={formData.address} placeholder="Address *" className="w-full border border-slate-300 rounded p-3 text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary" onChange={handleInputChange} />
                </div>

                {/* Row 5: Phone & Email */}
                <div className="space-y-1">
                  <div className={`relative border rounded bg-white flex items-center h-[48px] ${validationErrors.phone ? 'border-red-400' : 'border-slate-300'}`}>
                    <div className="pl-3 pr-2 border-r border-slate-200 h-full flex items-center">
                      <img
                        src={`https://flagcdn.com/w40/${selectedCountry.code}.png`}
                        alt="Flag"
                        className="w-5 h-3.5 object-cover rounded-[1px]"
                      />
                      <span className="text-xs text-slate-500 ml-1.5">{selectedCountry.phone}</span>
                    </div>
                    <input
                      required name="phone"
                      value={formData.phone}
                      placeholder="Phone *"
                      className="flex-1 h-full px-3 bg-transparent outline-none placeholder:text-slate-400 text-slate-700"
                      onChange={handleInputChange}
                    />
                  </div>
                  {validationErrors.phone ? (
                    <p className="text-right text-xs text-red-500 mt-1">{validationErrors.phone}</p>
                  ) : (
                    <p className="text-right text-xs text-slate-500 mt-1">Ex: {selectedCountry.phone} 888 207 3207</p>
                  )}
                </div>

                <div className="space-y-1">
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Email *"
                    className={`w-full border rounded p-3 text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary ${validationErrors.email ? 'border-red-400' : 'border-slate-300'}`}
                    onChange={handleInputChange}
                  />
                  {validationErrors.email ? (
                    <p className="text-right text-xs text-red-500 mt-1">{validationErrors.email}</p>
                  ) : (
                    <p className="text-right text-xs text-slate-500 mt-1">Ex: example@domain.com</p>
                  )}
                </div>

                {/* Options */}
                <div className="md:col-span-2 flex flex-col gap-3 mt-2">

                  {!isCustomerAuthenticated && (
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="create_account"
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary mt-0.5"
                        checked={createAccount}
                        onChange={e => setCreateAccount(e.target.checked)}
                      />
                      <label htmlFor="create_account" className="text-slate-600 text-sm">
                        Create an account for me <span className="text-slate-500">(Password will be sent to your email id)</span>
                      </label>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Payment Information */}
            <div>
              <h2 className="text-2xl font-normal text-slate-800 mb-6 tracking-tight">Payment Information</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <div className="mb-6">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block text-red-500">Payment Type *</label>
                  <div className="relative mt-1">
                    <select
                      name="method"
                      value={paymentData.method}
                      onChange={handlePaymentChange}
                      className="w-full border border-slate-300 rounded p-3 appearance-none bg-white font-medium text-slate-700 focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      {/* Grouping common card types or listing all enabled */}
                      <option value="Credit Card">Credit / Debit Card (Visa, MC, Amex)</option>
                      {paymentMethods.filter(pm => !['VISA', 'MasterCard', 'Amex'].includes(pm.name)).map(pm => (
                        <option key={pm.id} value={pm.name}>{pm.name}</option>
                      ))}
                    </select>
                    <CreditCard className="absolute right-3 top-3 text-slate-400" size={20} />
                  </div>
                </div>

                {/* Dynamic Icons based on Payment Methods Config */}
                <div className="flex gap-2 mb-6 flex-wrap">
                  {paymentMethods.filter(pm => pm.enabled).map(pm => (
                    <div key={pm.id}
                      className={`h-9 border rounded px-2 flex items-center justify-center bg-white shadow-sm transition-all ${paymentData.method === pm.name ? 'border-primary ring-1 ring-primary' : 'border-slate-200'}`}
                      title={pm.name}
                    >
                      <img src={pm.iconUrl} alt={pm.name} className="h-6 object-contain" />
                    </div>
                  ))}
                </div>

                {/* Conditional Rendering of Payment Fields */}
                {isCardPayment ? (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="col-span-2 space-y-1">
                      <input
                        required
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="Card number"
                        className="w-full border border-slate-300 rounded p-3 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <input
                        required
                        name="expiry"
                        value={paymentData.expiry}
                        onChange={handlePaymentChange}
                        placeholder="MM / YY"
                        className="w-full border border-slate-300 rounded p-3 font-mono"
                      />
                    </div>
                    <div className="relative space-y-1">
                      <input
                        required
                        name="cvc"
                        value={paymentData.cvc}
                        onChange={handlePaymentChange}
                        placeholder="CVC"
                        className="w-full border border-slate-300 rounded p-3 font-mono"
                      />
                      <Lock className="absolute right-3 top-3.5 text-slate-300" size={16} />
                    </div>
                  </div>
                ) : isCryptoPayment ? (
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-5 animate-in slide-in-from-top-2">
                    <div className="text-center mb-4">
                      <h4 className="font-bold text-slate-800 text-lg mb-1">
                        Pay with {isBitcoinPayment ? 'Bitcoin (BTC)' : 'USDT (Tether)'}
                      </h4>
                      <p className="text-sm text-slate-600">Send the exact amount to the wallet address below</p>
                    </div>

                    {cryptoLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="animate-spin text-orange-500" size={24} />
                        <span className="ml-2 text-slate-600">Fetching live rates...</span>
                      </div>
                    ) : !walletAddress ? (
                      <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
                        <AlertCircle className="text-red-500 mx-auto mb-2" size={24} />
                        <p className="text-red-700 font-medium">Wallet address not configured</p>
                        <p className="text-sm text-red-600">Please contact support to complete payment</p>
                      </div>
                    ) : (
                      <>
                        {/* Amount Display */}
                        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
                          <div className="text-center">
                            <span className="text-sm text-slate-500 block mb-1">Amount to Send</span>
                            <span className="text-2xl font-bold text-orange-600 font-mono">
                              {cryptoAmount} {isBitcoinPayment ? 'BTC' : 'USDT'}
                            </span>
                            <span className="text-sm text-slate-500 block mt-1">
                              = ${total.toFixed(2)} USD
                              {isBitcoinPayment && cryptoRates.btc > 0 && (
                                <span className="ml-2 text-xs">(1 BTC = ${cryptoRates.btc.toLocaleString()})</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-4">
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <QRCodeSVG
                              value={isBitcoinPayment
                                ? `bitcoin:${walletAddress}?amount=${cryptoAmount}`
                                : walletAddress
                              }
                              size={160}
                              level="M"
                              includeMargin={true}
                            />
                          </div>
                        </div>

                        {/* Wallet Address */}
                        <div className="mb-4">
                          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block text-center">
                            Wallet Address
                          </label>
                          <div className="flex items-center gap-2 bg-white rounded border border-slate-200 p-3">
                            <span className="flex-1 font-mono text-xs text-slate-700 break-all">
                              {walletAddress}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(walletAddress)}
                              className={`shrink-0 p-2 rounded transition ${copiedAddress ? 'bg-green-100 text-green-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                            >
                              {copiedAddress ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                          {copiedAddress && (
                            <p className="text-xs text-green-600 text-center mt-1 font-medium">Address copied!</p>
                          )}
                        </div>

                        {/* Copy Amount Button */}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(cryptoAmount)}
                          className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 rounded font-medium text-sm transition flex items-center justify-center gap-2"
                        >
                          <Copy size={14} /> Copy Exact Amount
                        </button>

                        {/* Refresh Rate */}
                        <button
                          type="button"
                          onClick={fetchCryptoRates}
                          className="w-full mt-2 text-slate-500 hover:text-slate-700 py-2 text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <RefreshCw size={12} /> Refresh Rate
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-slate-700 text-sm animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold mb-1">Pay with {paymentData.method}</p>
                        <p>After clicking "Complete Order", you will receive instructions on how to complete your payment via email or secure redirect.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-[#5cb85c] hover:bg-[#4cae4c] text-white py-4 rounded font-bold text-lg uppercase shadow-md mt-8 transition transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed tracking-wide"
            >
              {isSubmitting ? 'Processing...' : 'Complete Order'}
            </button>

          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="w-full lg:w-96">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 sticky top-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-5 border-b border-slate-200 pb-3 text-lg tracking-tight">Your Order</h3>
              <div className="space-y-4 mb-8">
                {cart.map(item => (
                  <div key={item.id + (item.selectedPackageId || '')} className="flex gap-4 items-start border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                    {/* Image Container with Badge */}
                    <div className="relative w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 p-1">
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-50 shadow-sm z-10">
                        {item.quantity}
                      </span>
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="font-bold text-slate-800 text-[14px] leading-tight mb-1">
                        {item.name}
                      </div>
                      {item.selectedPackage && (
                        <div className="text-xs font-medium text-slate-500">
                          {item.selectedPackage.quantity} Pills x {item.selectedPackage.dosage}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="font-bold text-slate-900 text-sm whitespace-nowrap pt-1">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Subtotal</span>
                  <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-medium">Discount</span>
                    <span className="font-bold text-green-600">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Shipping</span>
                  <span className="font-bold text-slate-800">
                    {shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Total</span>
                  <span className="text-slate-900 font-extrabold text-2xl tracking-tight">{formatPrice(total)}</span>
                </div>
              </div>
              {/* Dynamic Payment Icons in Summary */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center opacity-80">
                {paymentMethods.filter(pm => pm.enabled).slice(0, 6).map(pm => (
                  <div key={pm.id} className="h-7 w-11 bg-white rounded overflow-hidden border border-slate-300 flex items-center justify-center p-0.5">
                    <img src={pm.iconUrl} alt={pm.name} className="max-h-full max-w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: NORMAL CART ---
  return (
    <div className="flex-1 bg-white font-sans w-full max-w-full overflow-hidden">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Shopping Cart</h1>

      {/* Free Shipping Alert - Compact */}
      <div className="mb-4 bg-[#e8f4fc] border border-[#b8dff5] rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#d4ebf8] flex items-center justify-center shrink-0">
            <Truck size={24} className="text-[#2196F3]" />
          </div>
          <div>
            {isFreeShipping ? (
              <div className="text-base">
                <span className="font-bold text-[#2196F3]">Congratulations!</span>{' '}
                <span className="text-slate-700">You qualify for</span>{' '}
                <span className="font-bold text-[#2196F3]">FREE Shipping!</span>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-3">
                  <div className="font-bold text-slate-800">
                    Add <span className="text-[#2196F3]">{formatPrice(amountForFreeShipping)}</span> to get Free Shipping
                  </div>
                  <div className="w-32 bg-[#b8dff5] rounded-full h-2 hidden sm:block">
                    <div
                      className="bg-[#2196F3] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-[11px] text-[#2E7D32] font-medium flex items-center gap-1">
                  <Truck size={12} className="text-[#2E7D32]" />
                  Free shipping on orders over <span className="font-bold">$200.00</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Shipping Option Selector - Compact for Desktop */}
      <div className="mb-4 bg-white border border-slate-200 rounded-lg p-3 hidden md:block">
        <h3 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Select Shipping Method</h3>
        {isFreeShipping ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-500" />
            <span className="font-bold text-green-700">Free Shipping Applied!</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {/* Free shipping hint */}
            <div className="bg-green-50 px-3 py-1.5 flex items-center gap-2 text-sm">
              <Truck size={14} className="text-green-600" />
              <span className="text-green-700">Free shipping on orders over <span className="font-bold">$200.00</span></span>
            </div>
            {enabledDeliveryOptions.map(option => {
              // Calculate estimated delivery date
              const today = new Date();
              const deliveryDate = new Date(today);
              deliveryDate.setDate(today.getDate() + option.minDays);
              const formattedDate = deliveryDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              });

              // Determine if express or standard based on name
              const isExpress = option.name.toLowerCase().includes('express');

              return (
                <label
                  key={option.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 cursor-pointer transition ${selectedShippingId === option.id
                    ? 'bg-blue-50'
                    : 'bg-white hover:bg-slate-50'
                    }`}
                >
                  {/* Mobile: Row 1 - Radio + Type + Price */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selectedShippingId === option.id}
                      onChange={(e) => handleShippingSelect(e.target.value)}
                      className="w-5 h-5 text-primary shrink-0"
                    />
                    {/* Logo/Type */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpress ? (
                        <div className="flex items-center gap-1.5">
                          <Truck size={22} className="text-red-500" />
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">EXPRESS</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Truck size={22} className="text-green-600" />
                          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">NORMAL</span>
                        </div>
                      )}
                    </div>
                    {/* Flag + Price */}
                    <div className="flex items-center gap-2 ml-auto sm:ml-2">
                      <img
                        src={`https://flagcdn.com/w40/${userCountryCode || 'in'}.png`}
                        alt="Flag"
                        className="w-6 h-4 object-cover rounded-[2px] shadow-sm border border-slate-200"
                      />
                      <span className="font-bold text-slate-800 text-base">{formatPrice(option.price)}</span>
                    </div>
                  </div>
                  {/* Mobile: Row 2 - Delivery Details */}
                  <div className="flex items-center justify-between gap-4 pl-8 sm:pl-0 sm:flex-1">
                    {/* Delivery Period */}
                    <div className="text-slate-600 text-sm sm:text-base">
                      <span className="text-slate-500">Delivery:</span> <span className="font-bold text-slate-800">{option.minDays}-{option.maxDays} Days</span>
                    </div>
                    {/* Approximate Delivery Date */}
                    <div className="text-right">
                      <div className="text-[10px] sm:text-xs text-slate-400">Approx. delivery</div>
                      <div className="font-bold text-slate-800 text-sm sm:text-base">{formattedDate}</div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 overflow-hidden">
          {/* DESKTOP TABLE VIEW */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-extrabold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item) => {
                    const uniqueId = item.selectedPackageId ? `${item.id}-${item.selectedPackageId}` : item.id;
                    return (
                      <tr key={uniqueId} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 border border-slate-200 rounded bg-white p-1 flex items-center justify-center shrink-0">
                              <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.activeIngredient}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {item.selectedPackage ? (
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-700 text-sm">{item.selectedPackage.quantity} Pills x {item.selectedPackage.dosage}</span>
                              {item.selectedPackage.bonus && <span className="text-[9px] text-orange-500 font-extrabold uppercase tracking-wide">{item.selectedPackage.bonus}</span>}
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Standard</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateCartQuantity(uniqueId, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            >
                              <Minus size={12} strokeWidth={3} />
                            </button>
                            <span className="w-6 text-center font-bold text-slate-800 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(uniqueId, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            >
                              <Plus size={12} strokeWidth={3} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-slate-900 text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                        <td className="px-2 py-3 text-right">
                          <button
                            onClick={() => removeFromCart(uniqueId)}
                            className="text-slate-400 hover:text-red-500 transition p-1 hover:bg-red-50 rounded"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden space-y-3">
            {cart.map((item) => {
              const uniqueId = item.selectedPackageId ? `${item.id}-${item.selectedPackageId}` : item.id;
              return (
                <div key={uniqueId} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative">
                  {/* Delete Button (Absolute Top Right for easy access) */}
                  <button
                    onClick={() => removeFromCart(uniqueId)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 p-1 bg-slate-50 rounded-full"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex gap-3 mb-3">
                    {/* Image */}
                    <div className="w-16 h-16 border border-slate-100 rounded bg-slate-50 p-1 shrink-0 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    {/* Info */}
                    <div className="pr-6">
                      <div className="font-bold text-slate-800 text-base leading-tight mb-0.5">{item.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">{item.activeIngredient}</div>

                      {item.selectedPackage ? (
                        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block">
                          {item.selectedPackage.quantity} Pills x {item.selectedPackage.dosage}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Standard</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Price Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateCartQuantity(uniqueId, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm border border-slate-200 text-slate-600 active:scale-95"
                      >
                        <Minus size={14} strokeWidth={2.5} />
                      </button>
                      <span className="w-4 text-center font-bold text-slate-800 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(uniqueId, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-white shadow-sm border border-slate-200 text-slate-600 active:scale-95"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-medium">Total</div>
                      <div className="font-extrabold text-slate-900 text-lg tracking-tight">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={goHome}
              className="bg-[#81C784] hover:bg-[#66BB6A] text-white px-4 py-2.5 rounded shadow font-bold text-sm uppercase tracking-wide transition whitespace-nowrap flex items-center gap-2"
            >
              <ArrowRight size={16} className="rotate-180" strokeWidth={2.5} /> Continue Shopping
            </button>
          </div>
        </div>

        <div className="w-full lg:w-80" ref={orderSummaryRef}>
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg sticky top-24 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4 pb-3 border-b border-slate-200 tracking-tight">Order Summary</h3>

            {/* Coupon Code Input */}
            <div className="mb-4">
              <label className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 block">Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code"
                  className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm uppercase"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-bold uppercase"
                >
                  Apply
                </button>
              </div>
              {discountAmount > 0 && <p className="text-xs text-green-600 mt-1 font-bold">Coupon applied!</p>}
            </div>

            <div className="space-y-2 mb-4 border-t border-slate-200 pt-3">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="font-bold text-green-600">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 text-sm">
                <span>Shipping</span>
                <span className="font-bold text-slate-800">
                  {shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 mb-4">
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-extrabold text-primary text-xl tracking-tight">{formatPrice(total)}</span>
            </div>
            {/* Shipping Error Inline Message */}
            {shippingError && (
              <div className="mb-3 text-red-500 text-sm font-bold flex items-center gap-1.5 bg-red-50 p-2 rounded border border-red-200 animate-in fade-in">
                <AlertCircle size={16} /> {shippingError}
              </div>
            )}

            <button
              onClick={() => {
                if (!selectedShippingId && !isFreeShipping) {
                  setShippingError('Please select a shipping method');
                  // Optional: scroll to shipping
                  if (window.innerWidth >= 768) {
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }
                  return;
                }
                setShippingError(null);
                setStep('checkout');
              }}
              className="w-full bg-[#ef4444] hover:bg-red-600 text-white py-3 rounded font-bold uppercase tracking-widest shadow-lg transition transform active:scale-[0.98]"
            >
              Checkout
            </button>
            {/* Dynamic Payment Icons in Summary */}
            <div className="mt-4 flex flex-wrap gap-1.5 justify-center opacity-80">
              {paymentMethods.filter(pm => pm.enabled).slice(0, 6).map(pm => (
                <div key={pm.id} className="h-6 w-10 bg-white rounded overflow-hidden border border-slate-300 flex items-center justify-center p-0.5">
                  <img src={pm.iconUrl} alt={pm.name} className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
