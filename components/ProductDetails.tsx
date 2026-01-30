import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, AlertCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductPackage } from '../types';

const ExpressIcon = () => (
  <div className="flex items-center gap-1">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1z"></path>
      <path d="M16 8h4l3 5v5h-7V8z"></path>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">EXPRESS</span>
  </div>
);

const NormalIcon = () => (
  <div className="flex items-center gap-1">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1z"></path>
      <path d="M16 8h4l3 5v5h-7V8z"></path>
      <circle cx="5.5" cy="18.5" r="2.5"></circle>
      <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
    <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NORMAL</span>
  </div>
);

// Other Names with expand/collapse
const OtherNamesSection: React.FC<{ names: string[] }> = ({ names }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleNames = expanded ? names : names.slice(0, 5);
  const hasMore = names.length > 5;

  return (
    <div className="mb-4">
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">OTHER NAMES FOR THIS MEDICATION:</p>
      <div className="flex flex-wrap gap-1.5 items-center">
        {visibleNames.map(name => (
          <span key={name} className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 font-bold uppercase tracking-wide rounded border border-slate-200">{name}</span>
        ))}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="bg-primary text-white text-[12px] font-bold w-7 h-7 rounded flex items-center justify-center hover:bg-blue-600 transition"
          >
            +{names.length - 5}
          </button>
        )}
        {expanded && hasMore && (
          <button
            onClick={() => setExpanded(false)}
            className="bg-slate-200 text-slate-600 text-[10px] px-2 py-1 font-bold rounded hover:bg-slate-300 transition"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};

// FAQ Section
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I find the right medicine?",
      answer: "Use our search bar or browse by category to find the medication you need. You can also filter by active ingredient or condition."
    },
    {
      question: "What is the referral system, and how does it work?",
      answer: "Everything is simple! Join our referral program, encourage your friends to shop with us, and you will receive 15% of their order amount."
    },
    {
      question: "Do you require a prescription?",
      answer: "You do not need to provide a prescription to use our services. But we strongly recommend that you consult your doctor before using any medication. You may have contraindications according to which the drug intake should be delayed or canceled."
    },
    {
      question: "What are your shipping methods?",
      answer: "You can choose from two delivery options: 4-9 business days: Courier Delivery Service with real-time tracking of your order. 15-21 business days: Standard airmail without the shipping tracking feature."
    },
    {
      question: "What medication do you offer?",
      answer: "Our pharmacy's product range includes generics and branded medicines to solve your problems. All products in our pharmacy are supplied by verified manufacturers and authorized distributors with whom we have long cooperated. We always supply what you order; you can be sure the medication is genuine."
    },
    {
      question: "How can one place an order?",
      answer: "Simply select the desired product and put it in your shopping cart to place an order. At any time, you can click on 'Shopping Cart' at the top of the screen to go to the checkout page. Next, you need to fill in your personal information and check it before paying for the order."
    },
    {
      question: "What are your available payment methods?",
      answer: "We accept most major credit and debit cards, including MasterCard and Visa. You can also use crypto-transfers, SEPA or E-checks to pay for online orders."
    },
    {
      question: "Can I earn on the referral program, and how to do it?",
      answer: "The essence of earnings is simple: you get 15% off all purchases made by your friends at HappyFamilyStore. To do this, you need to get a referral link and send it to a friend. Following your referral link, a friend registers and makes orders. 15% of their order cost goes to your balance, and you can use the money to pay for your order."
    },
    {
      question: "Why do you give big discounts?",
      answer: "The discount system should be beneficial for both the seller and the buyer. We can provide large discounts to regular customers, as we are direct suppliers. This way, we boost sales, attract new customers and increase our brand awareness."
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4">FAQ</h3>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {faqs.map((faq, idx) => (
          <div key={idx} className={idx !== faqs.length - 1 ? 'border-b border-slate-100' : ''}>
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition"
            >
              <span className="text-[14px]">
                <span className="text-primary font-bold mr-2">F:</span>
                <span className={`${openIndex === idx ? 'text-primary font-medium' : 'text-slate-700'}`}>{faq.question}</span>
              </span>
              <span className="text-slate-400 text-xl font-light ml-4">{openIndex === idx ? '−' : '+'}</span>
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4 text-[13px] text-slate-600 leading-relaxed">
                <span className="text-slate-400 font-bold mr-2">A:</span>
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProductDetails: React.FC = () => {
  const { selectedProduct: product, isMobile, goHome, isAdminMode } = useStore();

  if (!product) return null;

  // Handle disabled product view
  if (product.enabled === false && !isAdminMode) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <AlertCircle size={48} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Product Unavailable</h2>
        <p className="text-slate-500 mb-6 max-w-md">
          This product is currently disabled or out of stock. Please check back later or browse other products.
        </p>
        <button
          onClick={goHome}
          className="flex items-center gap-2 text-primary font-bold hover:underline"
        >
          <ChevronLeft size={16} /> Back to Products
        </button>
      </div>
    );
  }

  return isMobile ? <ProductDetailsMobile /> : <ProductDetailsDesktop />;
};

// --- MOBILE VIEW (Tabbed Interface) ---
function ProductDetailsMobile() {
  const { selectedProduct: product, addToCart, goHome, formatPrice, deliveryOptions, goToCart, cart } = useStore();
  const [selectedDosage, setSelectedDosage] = useState<string>('');
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [pendingPackage, setPendingPackage] = useState<any>(null);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [userCountryCode, setUserCountryCode] = useState<string>('in');

  const activeDeliveryOptions = deliveryOptions.filter(opt => opt.enabled);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_code) {
          setUserCountryCode(data.country_code.toLowerCase());
        }
      } catch (error) {
        console.log('Could not detect country, using default');
      }
    };
    detectCountry();
  }, []);

  const handleAddToCartClick = (pkg: any) => {
    setPendingPackage(pkg);
    setSelectedShipping(activeDeliveryOptions[0]?.id || '');
    setShowShippingModal(true);
  };

  const confirmAddToCart = () => {
    if (product && pendingPackage) {
      addToCart(product, pendingPackage);
      setShowShippingModal(false);
      setPendingPackage(null);
      goToCart(selectedShipping);
    }
  };

  // Group packages by dosage
  const dosages: string[] = Array.from(new Set(product?.packages?.map(p => p.dosage) || []));

  // Set default dosage
  useEffect(() => {
    if (dosages.length > 0 && !selectedDosage) {
      setSelectedDosage(dosages[0]);
    }
  }, [dosages, selectedDosage]);

  if (!product) return null;
  const filteredPackages = product.packages?.filter(p => p.dosage === selectedDosage) || [];

  return (
    <div className="flex-1 bg-white font-sans w-full max-w-full overflow-hidden pb-16">
      <div className="mb-0">
        <button onClick={goHome} className="flex items-center text-slate-500 hover:text-primary text-[13px] font-medium transition py-1.5 px-2">
          <ChevronLeft size={16} strokeWidth={2.5} /> Back
        </button>
      </div>

      <div className="flex flex-col items-center mb-3 px-4">
        <img src={product.image} alt={product.name} className="w-40 h-40 object-contain mb-2" />
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1 text-center tracking-tight">{product.name}</h1>
        <div className="flex flex-row items-center justify-center gap-4 text-[13px] text-slate-600 mb-2 text-center">
          <div>
            <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest mr-2">ACTIVE INGREDIENT:</span>
            <span className="text-primary font-bold">{product.activeIngredient}</span>
          </div>
          <div>
            <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest mr-2">AVAILABILITY:</span>
            <span className="text-[#5cb85c] font-bold">In Stock</span>
          </div>
        </div>
        <div className="text-[13px] text-slate-600 leading-snug text-center mb-0 max-w-md font-normal line-clamp-2">
          {product.description?.substring(0, 150)}...
        </div>
      </div>

      <div className="px-3">
        <h3 className="text-[15px] font-bold text-slate-800 mb-2 tracking-tight">{product.name}, select dosage:</h3>
        {/* Dosage Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {dosages.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDosage(d)}
              className={`px-3 py-1.5 rounded text-[13px] font-bold transition-all border ${selectedDosage === d
                ? 'bg-[#337ab7] border-[#337ab7] text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Packages List Mobile */}
        <div className="space-y-2">
          {filteredPackages.map(pkg => (
            <div key={pkg.id} className="border border-slate-200 rounded-lg p-3 flex justify-between items-center bg-white shadow-sm">
              <div>
                <div className="font-bold text-slate-800 text-[15px] mb-1">{pkg.quantity} pills x {pkg.dosage}</div>
                <div className="text-xs text-slate-500 font-medium mb-1">{formatPrice(pkg.pricePerPill)} / pill</div>
                {/* Free Shipping Tag Logic */}
                {(pkg.bonus || pkg.totalPrice > 200) && (
                  <div className="flex flex-col items-start gap-1 mt-1">
                    {pkg.bonus && <div className="text-[10px] text-orange-500 font-extrabold tracking-wide uppercase">{pkg.bonus}</div>}
                    {pkg.totalPrice > 200 && (
                      <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-block">
                        Free Express Shipping
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <div className="font-extrabold text-lg text-slate-900">{formatPrice(pkg.totalPrice)}</div>
                <button
                  onClick={() => handleAddToCartClick(pkg)}
                  className="bg-[#337ab7] text-white text-xs font-bold px-4 py-2 rounded uppercase tracking-wide shadow-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Selection Modal for Mobile */}
      {
        showShippingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-white w-full rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto animate-slide-up relative">

              {/* Close Button - positioned absolute top right */}
              <button onClick={() => setShowShippingModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 z-10">
                <X size={24} />
              </button>

              {/* Hide global floating chat when modal is open */}
              <style>{`#floating-chat-container { display: none !important; }`}</style>

              {/* 1. Free Shipping Progress Banner */}
              <div className="mb-4 mt-2">
                {(() => {
                  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                  const pendingAmount = pendingPackage ? pendingPackage.totalPrice : 0;
                  const currentTotal = cartTotal + pendingAmount;
                  const isFreeShipping = currentTotal >= 200;
                  const amountNeeded = Math.max(0, 200 - currentTotal);

                  return isFreeShipping ? (
                    <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-lg p-3 flex items-start gap-3">
                      <div className="bg-[#C8E6C9] p-2 rounded-lg shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 13 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[#2E7D32] font-bold text-[15px] leading-tight mb-1">
                          Congratulations! <span className="text-slate-700 font-normal">You qualify for</span> FREE Shipping!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#E3F2FD] border border-[#90CAF9] rounded-lg p-3 flex items-center gap-3">
                      <div className="bg-[#BBDEFB] p-2 rounded-lg shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1976D2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 13 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="2.5"></circle>
                          <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                      </div>
                      <p className="text-slate-800 font-bold text-[15px]">
                        Add <span className="text-[#1976D2]">{formatPrice(amountNeeded)}</span> to get Free Shipping
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* 2. Continue Shopping Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="w-full bg-[#81C784] hover:bg-[#66BB6A] text-white py-3 rounded shadow font-bold text-sm uppercase tracking-wide transition"
                >
                  Continue Shopping
                </button>
              </div>

              {/* 3. Section Title */}
              <h3 className="text-[13px] font-extrabold text-slate-800 uppercase tracking-widest mb-3">
                Select Shipping Method
              </h3>

              {/* 4. Options Container */}
              <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                {/* Green Hint Header */}
                <div className="bg-[#E8F5E9] border-b border-slate-100 p-3 flex items-center gap-2">
                  <div className="text-[#2E7D32]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13"></rect>
                      <polygon points="16 8 20 8 23 13 23 16 16 16 16 8"></polygon>
                      <circle cx="5.5" cy="18.5" r="2.5"></circle>
                      <circle cx="18.5" cy="18.5" r="2.5"></circle>
                    </svg>
                  </div>
                  <span className="text-[13px] text-[#2E7D32] font-medium">
                    Free shipping on orders over <span className="font-bold text-[#1B5E20]">$200.00</span>
                  </span>
                </div>

                {/* Shipping Options */}
                <div className="divide-y divide-slate-200">
                  {activeDeliveryOptions.map(opt => {
                    const today = new Date();
                    const deliveryDate = new Date(today);
                    deliveryDate.setDate(today.getDate() + opt.minDays);
                    const formattedDate = deliveryDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric'
                    });
                    const isExpress = opt.name.toLowerCase().includes('express');

                    return (
                      <label
                        key={opt.id}
                        className={`flex flex-col gap-3 p-4 cursor-pointer transition ${selectedShipping === opt.id
                          ? 'bg-blue-50'
                          : 'bg-white'
                          }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <input
                            type="radio"
                            name="shipping_modal"
                            checked={selectedShipping === opt.id}
                            onChange={() => setSelectedShipping(opt.id)}
                            className="w-5 h-5 text-primary shrink-0 accent-[#337ab7]"
                          />

                          {/* Logo/Type */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isExpress ? (
                              <div className="flex items-center gap-1.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="1" y="3" width="15" height="13"></rect>
                                  <polygon points="16 8 20 8 23 13 23 16 16 16 16 8"></polygon>
                                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                </svg>
                                <span className="bg-[#EF4444] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">EXPRESS</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="1" y="3" width="15" height="13"></rect>
                                  <polygon points="16 8 20 8 23 13 23 16 16 16 16 8"></polygon>
                                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                </svg>
                                <span className="bg-[#16a34a] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">NORMAL</span>
                              </div>
                            )}
                          </div>

                          {/* Flag + Price */}
                          <div className="flex items-center gap-2 ml-auto">
                            <img
                              src={`https://flagcdn.com/w40/${userCountryCode || 'in'}.png`}
                              alt="Flag"
                              className="w-6 h-4 object-cover rounded-[2px] shadow-sm border border-slate-200"
                            />
                            <span className="font-bold text-slate-800 text-lg">{formatPrice(opt.price)}</span>
                          </div>
                        </div>

                        {/* Delivery Details */}
                        <div className="flex items-center justify-between pl-8 w-full">
                          <div className="text-slate-600 text-sm">
                            <span className="text-slate-500">Delivery:</span> <span className="font-bold text-slate-800">{opt.minDays}-{opt.maxDays} Days</span>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400">Approx. delivery</div>
                            <div className="font-bold text-slate-800 text-sm">{formattedDate}</div>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>

                <button
                  onClick={confirmAddToCart}
                  className="w-full bg-[#337ab7] text-white py-4 rounded-lg font-bold text-lg uppercase tracking-wide shadow-lg mb-2"
                >
                  Add to Cart & Continue
                </button>
              </div>
            </div>
          </div>
        )
      }

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div >
  );
};

// --- DESKTOP VIEW (Grouped Table Layout) ---
function ProductDetailsDesktop() {
  const { selectedProduct: product, addToCart, isAdminMode, paymentMethods, deliveryOptions, formatPrice } = useStore();
  const activeDeliveryOptions = deliveryOptions.filter(opt => opt.enabled);

  // IP-based country detection
  const [userCountryCode, setUserCountryCode] = useState<string>('in');

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.country_code) {
          setUserCountryCode(data.country_code.toLowerCase());
        }
      } catch (error) {
        console.log('Could not detect country, using default');
      }
    };
    detectCountry();
  }, []);

  if (!product) return null;

  const getDeliveryDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  // Group packages by dosage
  const packagesByDosage: Record<string, ProductPackage[]> = {};
  product.packages?.forEach(pkg => {
    if (!packagesByDosage[pkg.dosage]) {
      packagesByDosage[pkg.dosage] = [];
    }
    packagesByDosage[pkg.dosage].push(pkg);
  });

  // Ensure consistent dosage order if possible (e.g. 50, 100, 200)
  const sortedDosages = Object.keys(packagesByDosage).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="flex-1 bg-white font-sans w-full max-w-full overflow-hidden">
      <div className="mb-4 flex justify-between items-center">
        {product.enabled === false && isAdminMode && (
          <div className="bg-red-100 text-red-800 px-4 py-1 text-xs font-bold rounded flex items-center gap-2 border border-red-200 ml-auto">
            <AlertCircle size={14} /> This product is disabled (Admin View)
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-4/12">
          <div className="bg-white flex items-center justify-center p-6 border border-slate-200 rounded-lg h-[280px]">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="md:w-8/12">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">{product.name}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">ACTIVE INGREDIENT:</span>
              <span className="text-[#3b5998] hover:underline cursor-pointer font-bold text-[14px]">{product.activeIngredient}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">AVAILABILITY:</span>
              <span className="text-[#5cb85c] font-bold text-[14px]">In Stock ({product.packages?.length || 0} packs)</span>
            </div>
          </div>

          {product.otherNames && product.otherNames.length > 0 && (
            <OtherNamesSection names={product.otherNames} />
          )}

          <div className="text-[14px] text-slate-600 leading-relaxed font-normal mb-4 max-w-2xl">
            <p>{product.description}</p>
          </div>

          <div className="mb-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">WE ACCEPT:</p>
            <div className="flex gap-1.5 flex-wrap">
              {paymentMethods.filter(pm => pm.enabled).map(pm => (
                <div key={pm.id} className="h-8 w-12 border border-slate-200 rounded bg-white flex items-center justify-center p-0.5">
                  <img src={pm.iconUrl} alt={pm.name} className="max-h-full max-w-full object-contain" title={pm.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeDeliveryOptions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-3 tracking-tight">Delivery options</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            {activeDeliveryOptions.map((opt, idx) => (
              <div key={opt.id} className={`flex items-center p-3 gap-4 ${idx !== activeDeliveryOptions.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="w-20 flex items-center justify-start">{opt.icon === 'express' ? <ExpressIcon /> : <NormalIcon />}</div>
                <div className="flex items-center gap-2 w-24">
                  <img src={`https://flagcdn.com/w20/${userCountryCode}.png`} alt="Origin" className="w-5 h-3.5 border border-slate-200" />
                  <span className="font-bold text-slate-800 text-[14px]">{formatPrice(opt.price)}</span>
                </div>
                <div className="flex-1 text-[13px] text-slate-600">Delivery period: <span className="font-bold text-slate-800">{opt.minDays}-{opt.maxDays} Days</span></div>
                <div className="text-[12px] text-slate-500 text-right">Approximate delivery time <span className="text-slate-800 font-bold ml-1">{getDeliveryDate(opt.minDays)}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grouped Table Format for Desktop */}
      <div className="pb-16">
        <h3 className="text-2xl font-bold text-slate-800 mb-5 tracking-tight flex items-baseline gap-2">
          <span>{product.name}</span>
          <span className="text-lg font-medium text-slate-400">select dosage</span>
        </h3>

        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-sm min-w-[700px] border-collapse">
              <thead className="text-slate-500 text-[11px] uppercase font-extrabold tracking-wider text-left bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="py-4 pl-6 pr-2 w-[25%]">Package</th>
                  <th className="py-4 px-2 w-[15%]">Per Pill</th>
                  <th className="py-4 px-2 w-[20%]">Total Price</th>
                  <th className="py-4 px-2 w-[20%] text-center">Savings</th>
                  <th className="py-4 pr-6 text-right w-[20%]">Order</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedDosages.map((dosage) => (
                  <React.Fragment key={dosage}>
                    {/* Dosage Header Row */}
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan={5} className="py-2.5 px-6 font-extrabold text-slate-800 text-[15px] tracking-tight bg-slate-100/50">
                        {dosage}
                      </td>
                    </tr>

                    {/* Package Rows for this Dosage */}
                    {packagesByDosage[dosage]
                      .sort((a, b) => a.quantity - b.quantity)
                      .map((pkg) => (
                        <tr key={pkg.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors last:border-b-0 group">
                          <td className="py-4 pl-6 pr-2 align-middle">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-1 opacity-70">Quantity</span>
                              <span className="font-bold text-slate-800 text-[15px]">
                                {pkg.quantity} <span className="text-slate-400 mx-1 font-normal">pills x</span> {pkg.dosage}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-2 align-middle">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-1 opacity-70">Price</span>
                              <span className="text-slate-600 text-[14px] font-medium">{formatPrice(pkg.pricePerPill)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 align-middle">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-1 opacity-70">Total</span>
                              <span className="font-extrabold text-slate-900 text-[16px] tracking-tight">{formatPrice(pkg.totalPrice)}</span>
                              {/* Bonus Text & Free Shipping Tag */}
                              {(pkg.bonus || pkg.totalPrice > 200) && (
                                <div className="flex flex-col items-start gap-1 mt-1">
                                  {pkg.bonus && <span className="text-[10px] text-[#f0ad4e] font-bold uppercase tracking-wide">{pkg.bonus}</span>}
                                  {pkg.totalPrice > 200 && (
                                    <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                      Free Express Shipping
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-2 align-middle text-center">
                            <div className="flex flex-col items-center">
                              {pkg.savings && (
                                <>
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-1 opacity-70">Save</span>
                                  <span className="font-bold text-red-500 text-[14px] bg-red-50 px-2 py-0.5 rounded">{formatPrice(pkg.savings)}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-4 pr-6 text-right align-middle">
                            <div className="flex flex-col items-end">
                              <button
                                onClick={() => addToCart(product, pkg)}
                                className="inline-flex items-center justify-center px-5 py-2.5 bg-[#337ab7] hover:bg-[#286090] text-white text-[12px] font-bold uppercase tracking-wider rounded-[4px] transition-all shadow-sm hover:shadow-md w-[120px]"
                              >
                                <ShoppingCart size={14} className="mr-2" /> Add
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
};