import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Plus, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductPackage } from '../types';

const ExpressIcon = () => (
  <svg width="80" height="40" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -ml-2">
    <path d="M15 8H70V35H15V8Z" fill="#DC2626"/> 
    <path d="M72 18H88L95 35H70V18Z" fill="#DC2626"/>
    <circle cx="35" cy="40" r="7" fill="#DC2626"/>
    <circle cx="35" cy="40" r="3" fill="white"/>
    <circle cx="82" cy="40" r="7" fill="#DC2626"/>
    <circle cx="82" cy="40" r="3" fill="white"/>
    <rect x="0" y="15" width="10" height="3" fill="#DC2626" rx="1.5"/>
    <rect x="2" y="25" width="8" height="3" fill="#DC2626" rx="1.5"/>
    <text x="18" y="28" fill="white" fontSize="13" fontWeight="900" fontStyle="italic" fontFamily="sans-serif" letterSpacing="0.5">EXPRESS</text>
  </svg>
);

const NormalIcon = () => (
  <svg width="80" height="40" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -ml-2">
    <g opacity="0.9">
      <rect x="0" y="12" width="20" height="3" fill="#334155" rx="1.5"/>
      <rect x="5" y="22" width="15" height="3" fill="#334155" rx="1.5"/>
      <rect x="2" y="32" width="18" height="3" fill="#334155" rx="1.5"/>
      <path d="M30 8H75V35H30V8Z" fill="#334155"/>
      <path d="M77 18H90L95 35H75V18Z" fill="#334155"/>
      <circle cx="45" cy="40" r="6" fill="#334155"/>
      <circle cx="85" cy="40" r="6" fill="#334155"/>
      <circle cx="45" cy="40" r="2" fill="white"/>
      <circle cx="85" cy="40" r="2" fill="white"/>
    </g>
  </svg>
);

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
const ProductDetailsMobile: React.FC = () => {
  const { selectedProduct: product, addToCart, goHome, isAdminMode, paymentMethods, deliveryOptions, formatPrice } = useStore();
  const [selectedDosage, setSelectedDosage] = useState<string>('');
  
  // Group packages by dosage
  const dosages: string[] = Array.from(new Set(product?.packages?.map(p => p.dosage) || []));
  const activeDeliveryOptions = deliveryOptions.filter(opt => opt.enabled);

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
      <div className="mb-2">
        <button onClick={goHome} className="flex items-center text-slate-500 hover:text-primary text-sm font-medium transition p-2">
            <ChevronLeft size={18} strokeWidth={2.5} /> Back
        </button>
      </div>

      <div className="flex flex-col items-center mb-6 px-4">
          <img src={product.image} alt={product.name} className="w-56 h-56 object-contain mb-6" />
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 text-center tracking-tight">{product.name}</h1>
          <div className="flex flex-col items-center gap-1 text-sm text-slate-600 mb-5 text-center">
             <div>
               <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest mr-2">ACTIVE INGREDIENT:</span>
               <span className="text-primary font-bold">{product.activeIngredient}</span>
             </div>
             <div>
               <span className="text-slate-400 font-extrabold uppercase text-[10px] tracking-widest mr-2">AVAILABILITY:</span>
               <span className="text-[#5cb85c] font-bold">In Stock</span>
             </div>
          </div>
          <div className="text-[14px] text-slate-600 leading-relaxed text-center mb-4 max-w-md font-normal">
             {product.description?.substring(0, 180)}...
          </div>
      </div>

      <div className="px-4">
          <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">{product.name}, select dosage:</h3>
           {/* Dosage Tabs */}
           <div className="flex flex-wrap gap-2 mb-5">
              {dosages.map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDosage(d)}
                  className={`px-4 py-2.5 rounded text-sm font-bold transition-all border ${
                    selectedDosage === d 
                      ? 'bg-[#337ab7] border-[#337ab7] text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
           </div>

           {/* Packages List Mobile */}
           <div className="space-y-3">
              {filteredPackages.map(pkg => (
                <div key={pkg.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center bg-white shadow-sm">
                    <div>
                        <div className="font-bold text-slate-800 text-[15px] mb-1">{pkg.quantity} pills x {pkg.dosage}</div>
                        <div className="text-xs text-slate-500 font-medium mb-1">{formatPrice(pkg.pricePerPill)} / pill</div>
                        {pkg.bonus && <div className="text-[10px] text-orange-500 font-extrabold tracking-wide uppercase">{pkg.bonus}</div>}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                        <div className="font-extrabold text-lg text-slate-900">{formatPrice(pkg.totalPrice)}</div>
                        <button 
                           onClick={() => addToCart(product, pkg)}
                           className="bg-[#337ab7] text-white text-xs font-bold px-4 py-2 rounded uppercase tracking-wide shadow-sm"
                        >
                           Add to Cart
                        </button>
                    </div>
                </div>
              ))}
           </div>
      </div>
    </div>
  );
};

// --- DESKTOP VIEW (Grouped Table Layout) ---
const ProductDetailsDesktop: React.FC = () => {
  const { selectedProduct: product, addToCart, goHome, isAdminMode, paymentMethods, deliveryOptions, formatPrice } = useStore();
  const activeDeliveryOptions = deliveryOptions.filter(opt => opt.enabled);

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

      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="md:w-5/12">
           <div className="bg-white flex items-center justify-center p-8 border border-slate-200 rounded-xl shadow-sm h-[350px]">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
           </div>
        </div>
        <div className="md:w-7/12 pt-2">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">{product.name}</h1>
          
          <div className="flex flex-wrap gap-6 text-sm text-slate-600 mb-6 items-center border-b border-slate-100 pb-6">
             <div className="flex items-baseline">
               <span className="text-slate-400 font-extrabold uppercase text-[11px] tracking-widest mr-3">ACTIVE INGREDIENT:</span>
               <span className="text-[#3b5998] hover:underline cursor-pointer font-bold text-[15px]">{product.activeIngredient}</span>
             </div>
             <div className="flex items-baseline">
               <span className="text-slate-400 font-extrabold uppercase text-[11px] tracking-widest mr-3">AVAILABILITY:</span>
               <span className="text-[#5cb85c] font-bold text-[15px]">In Stock</span>
             </div>
          </div>

          {product.otherNames && product.otherNames.length > 0 && (
            <div className="mb-6">
               <p className="text-[11px] text-slate-400 uppercase font-extrabold tracking-widest mb-3">OTHER NAMES FOR THIS MEDICATION:</p>
               <div className="flex flex-wrap gap-2">
                 {product.otherNames.map(name => (
                   <span key={name} className="bg-slate-100 text-slate-600 text-[11px] px-3 py-1.5 font-bold uppercase tracking-wide rounded-[4px] border border-slate-200">{name}</span>
                 ))}
               </div>
            </div>
          )}

          <div className="text-[15px] text-slate-600 leading-relaxed font-normal mb-8 max-w-2xl">
              <p>{product.description}</p>
          </div>

          <div className="mb-6">
             <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-3">WE ACCEPT:</p>
             <div className="flex gap-2 flex-wrap">
                {paymentMethods.filter(pm => pm.enabled).map(pm => (
                   <div key={pm.id} className="h-9 w-14 border border-slate-200 rounded bg-white flex items-center justify-center p-1 shadow-sm">
                      <img src={pm.iconUrl} alt={pm.name} className="max-h-full max-w-full object-contain" title={pm.name} />
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {activeDeliveryOptions.length > 0 && (
        <div className="mb-10">
           <h3 className="text-xl font-bold text-slate-800 mb-4 tracking-tight">Delivery Options</h3>
           <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
             {activeDeliveryOptions.map((opt, idx) => (
               <div key={opt.id} className={`flex flex-col sm:flex-row sm:items-center p-4 gap-4 ${idx !== activeDeliveryOptions.length -1 ? 'border-b border-slate-100' : ''}`}>
                  <div className="w-24 flex items-center justify-center">{opt.icon === 'express' ? <ExpressIcon /> : <NormalIcon />}</div>
                  <div className="flex items-center gap-2 w-28"><img src="https://flagcdn.com/w20/in.png" alt="Origin" className="w-5 h-3.5 border border-slate-200 shadow-sm" /><span className="font-extrabold text-slate-800 text-base">{formatPrice(opt.price)}</span></div>
                  <div className="flex-1 text-[14px] text-slate-600 font-medium">Delivery period: <span className="font-bold text-slate-800">{opt.minDays}-{opt.maxDays} Days</span></div>
                  <div className="text-[12px] text-slate-500 text-right font-medium">Approximate delivery time <br/><span className="text-slate-800 font-bold">{getDeliveryDate(opt.minDays)}</span></div>
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
                             .sort((a,b) => a.quantity - b.quantity)
                             .map((pkg, index) => (
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
                                       {pkg.bonus && <span className="text-[10px] text-[#f0ad4e] font-bold mt-1 uppercase tracking-wide">{pkg.bonus}</span>}
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
    </div>
  );
};