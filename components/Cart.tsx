import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ShieldCheck, CreditCard, Lock, ChevronLeft, CheckCircle, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerDetails } from '../types';

// Fallback credentials if not set in Admin Profile
const DEFAULT_TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; 
const DEFAULT_TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

const countryFlags: Record<string, string> = {
  'India': 'in',
  'USA': 'us',
  'UK': 'gb',
  'Canada': 'ca',
  'Australia': 'au',
  'Spain': 'es'
};

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, goHome, placeOrder, adminProfile, customerUser, isCustomerAuthenticated, formatPrice } = useStore();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAccount, setCreateAccount] = useState(true);

  // Form State - Pre-fill if logged in
  const [formData, setFormData] = useState<CustomerDetails>(customerUser || {
    firstName: '', lastName: '', country: 'India', state: '',
    city: '', zip: '', address: '', phone: '', email: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 25.00;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
*Address:* ${formData.address}, ${formData.city}, ${formData.state}, ${formData.zip}, ${formData.country}
------------------------
*Order Details:*
${itemsList}

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

      // 4. Save to "Backend"
      await placeOrder(formData);

      if (!isCustomerAuthenticated && createAccount) {
         alert(`Account created for ${formData.phone}! Password sent via email/SMS.`);
      }

      // 5. Show Success Screen
      setStep('success');
      window.scrollTo(0,0);

    } catch (error) {
      console.error("Order failed", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER: EMPTY CART ---
  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white py-20 px-4">
        <div className="bg-slate-50 p-8 rounded-full mb-6">
          <ShoppingBag size={64} className="text-slate-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 mb-10 text-lg font-medium">Looks like you haven't added any products yet.</p>
        <button onClick={goHome} className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded font-bold transition flex items-center gap-2 shadow-md uppercase tracking-wide text-sm">
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
                 <h1 className="text-3xl font-bold tracking-tight leading-none">Secure Checkout</h1>
                 <h1 className="text-3xl font-bold tracking-tight leading-none">Page</h1>
              </div>
           </div>
        </div>

        {/* Secure Message and Badges Row */}
        <div className="text-center mb-8">
            <h2 className="text-lg text-slate-700 font-medium mb-6">Secure Checkout Page. All data is safe and secure.</h2>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                {/* Replicating the Trust Badges Row from Screenshot */}
                <div className="h-12 bg-slate-100 rounded flex items-center px-4 border border-slate-200">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/GeoTrust_logo.png/800px-GeoTrust_logo.png" className="h-6 object-contain" alt="GeoTrust" />
                </div>
                <div className="h-12 bg-slate-100 rounded flex items-center px-4 border border-slate-200">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Verified_by_Visa_logo.svg/2560px-Verified_by_Visa_logo.svg.png" className="h-8 object-contain" alt="Verified by Visa" />
                </div>
                <div className="h-12 bg-slate-100 rounded flex items-center px-4 gap-2 border border-slate-200">
                    <div className="flex flex-col items-start leading-none">
                        <span className="font-bold text-slate-700 text-sm">SSL</span>
                        <span className="text-[10px] text-slate-500">Secure Connection</span>
                    </div>
                    <Lock size={16} className="text-green-500 ml-1" />
                </div>
                <div className="h-12 bg-slate-100 rounded flex items-center px-4 border border-slate-200">
                     <img src="https://cdn.freebiesupply.com/logos/large/2x/mcafee-secure-logo-png-transparent.png" className="h-8 object-contain" alt="McAfee" />
                </div>
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
              
              {/* Billing Address */}
              <div className="mb-10">
                 <h2 className="text-2xl font-normal text-slate-800 mb-6 tracking-tight">Billing Address</h2>
                 
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
                        {/* Custom Country Select to match Screenshot */}
                        <div className="relative border border-slate-300 rounded bg-white">
                           <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-slate-500">Country <span className="text-red-500">*</span></label>
                           <div className="flex items-center h-[46px] px-3">
                              <img 
                                src={`https://flagcdn.com/w40/${countryFlags[formData.country] || 'in'}.png`} 
                                alt="Flag" 
                                className="w-5 h-3.5 object-cover rounded-[1px] mr-2 shadow-sm"
                              />
                              <select 
                                name="country" 
                                value={formData.country} 
                                onChange={handleInputChange}
                                className="w-full h-full bg-transparent border-none outline-none font-medium text-slate-700 cursor-pointer appearance-none text-sm"
                              >
                                 <option value="India">India</option>
                                 <option value="USA">United States</option>
                                 <option value="UK">United Kingdom</option>
                                 <option value="Canada">Canada</option>
                                 <option value="Australia">Australia</option>
                                 <option value="Spain">Spain</option>
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
                       <div className="relative border border-slate-300 rounded bg-white flex items-center h-[48px]">
                           <div className="pl-3 pr-2 border-r border-slate-200 h-full flex items-center">
                              <img 
                                src={`https://flagcdn.com/w40/${countryFlags[formData.country] || 'in'}.png`} 
                                alt="Flag" 
                                className="w-5 h-3.5 object-cover rounded-[1px]"
                              />
                              <ChevronDown size={12} className="text-slate-400 ml-1" />
                           </div>
                           <input 
                              required name="phone" 
                              value={formData.phone} 
                              placeholder="Phone *"
                              className="flex-1 h-full px-3 bg-transparent outline-none placeholder:text-slate-400 text-slate-700" 
                              onChange={handleInputChange} 
                           />
                       </div>
                       <p className="text-right text-xs text-slate-500 mt-1">Ex: +1 888 207 32 07</p>
                    </div>

                    <div className="space-y-1">
                       <input required type="email" name="email" value={formData.email} placeholder="Email *" className="w-full border border-slate-300 rounded p-3 text-slate-700 placeholder:text-slate-400 outline-none focus:border-primary" onChange={handleInputChange} />
                       <p className="text-right text-xs text-slate-500 mt-1">Ex: example@domain.com</p>
                    </div>

                    {/* Options */}
                    <div className="md:col-span-2 flex flex-col gap-3 mt-2">
                       <div className="flex items-center gap-3">
                           <input type="checkbox" id="diff_shipping" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                           <label htmlFor="diff_shipping" className="text-slate-600 text-sm">My shipping address is different than my billing address</label>
                       </div>
                       
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
                          <select className="w-full border border-slate-300 rounded p-3 appearance-none bg-white font-medium text-slate-700 focus:ring-1 focus:ring-primary focus:border-primary">
                             <option>Credit Card</option>
                             <option>Bitcoin (-10% Discount)</option>
                          </select>
                          <CreditCard className="absolute right-3 top-3 text-slate-400" size={20} />
                       </div>
                    </div>
                    
                    <div className="flex gap-2 mb-6">
                        {['visa','mastercard','amex','discover'].map(c => (
                           <div key={c} className="h-9 w-14 bg-white border border-slate-200 rounded flex items-center justify-center text-[9px] font-extrabold uppercase text-slate-500 shadow-sm">{c}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="col-span-2 space-y-1">
                          <input placeholder="Card number" className="w-full border border-slate-300 rounded p-3 font-mono" />
                       </div>
                       <div className="space-y-1">
                          <input placeholder="MM / YY" className="w-full border border-slate-300 rounded p-3 font-mono" />
                       </div>
                       <div className="relative space-y-1">
                          <input placeholder="CVC" className="w-full border border-slate-300 rounded p-3 font-mono" />
                          <Lock className="absolute right-3 top-3.5 text-slate-300" size={16} />
                       </div>
                    </div>
                 </div>
              </div>
              
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
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-600 font-medium">Shipping</span>
                       <span className="font-bold text-slate-800">{formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-slate-200">
                       <span className="text-slate-700 font-bold">Total</span>
                       <span className="text-slate-900 font-extrabold text-2xl tracking-tight">{formatPrice(total)}</span>
                    </div>
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
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[650px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-extrabold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Package</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.map((item) => {
                     const uniqueId = item.selectedPackageId ? `${item.id}-${item.selectedPackageId}` : item.id;
                     return (
                      <tr key={uniqueId} className="hover:bg-slate-50/50">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 border border-slate-200 rounded bg-white p-1 flex items-center justify-center">
                                <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-[15px]">{item.name}</div>
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{item.activeIngredient}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {item.selectedPackage ? (
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-700">{item.selectedPackage.quantity} Pills x {item.selectedPackage.dosage}</span>
                               {item.selectedPackage.bonus && <span className="text-[10px] text-orange-500 font-extrabold uppercase tracking-wide mt-1">{item.selectedPackage.bonus}</span>}
                            </div>
                          ) : (
                            <span className="italic text-slate-400">Standard</span>
                          )}
                        </td>
                        <td className="px-6 py-5 font-medium text-slate-600">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-3">
                             <button 
                              onClick={() => updateCartQuantity(uniqueId, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                             >
                               <Minus size={14} strokeWidth={3} />
                             </button>
                             <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                             <button 
                              onClick={() => updateCartQuantity(uniqueId, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                             >
                               <Plus size={14} strokeWidth={3} />
                             </button>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-extrabold text-slate-900 text-[15px]">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button 
                            onClick={() => removeFromCart(uniqueId)}
                            className="text-slate-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                     );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center">
             <button onClick={goHome} className="text-slate-500 hover:text-primary font-bold text-sm flex items-center gap-2 transition">
                <ArrowRight size={16} className="rotate-180" strokeWidth={2.5} /> Continue Shopping
             </button>
          </div>
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg sticky top-24 shadow-sm">
             <h3 className="font-bold text-slate-800 text-lg mb-6 pb-4 border-b border-slate-200 tracking-tight">Order Summary</h3>
             <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600 text-sm font-medium">
                   <span>Subtotal</span>
                   <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm font-medium">
                   <span>Shipping</span>
                   <span className="font-bold text-slate-800">
                     {shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
                   </span>
                </div>
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-slate-200 mb-8">
                <span className="font-bold text-slate-800 text-lg">Total</span>
                <span className="font-extrabold text-primary text-2xl tracking-tight">{formatPrice(total)}</span>
             </div>
             <button 
               onClick={() => setStep('checkout')}
               className="w-full bg-[#ef4444] hover:bg-red-600 text-white py-4 rounded font-bold text-lg uppercase tracking-widest shadow-lg transition transform active:scale-[0.98]"
             >
               Checkout
             </button>
             <div className="mt-6 flex flex-wrap gap-2 justify-center opacity-70">
                 {/* Using URLs from context if available, otherwise fallback */}
                 {['visa', 'mastercard', 'amex', 'bitcoin'].map(cc => (
                    <div key={cc} className="h-7 w-11 bg-slate-200 rounded overflow-hidden border border-slate-300">
                       {/* Simplified placeholder */}
                    </div>
                 ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};