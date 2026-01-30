import React, { useState } from 'react';
import { ShoppingCart, Home, Grid, User, Heart, Menu, X, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';

export const MobileHeader: React.FC = () => {
  const { adminProfile, cart, goHome, setActiveCategoryId, goToCart, goToCustomerAuth, toggleCallbackModal, currency, setCurrency, favorites } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const handleHomeClick = () => {
    setActiveCategoryId('cat_bestsellers');
    goHome();
  };

  const handleProductsClick = () => {
     setActiveCategoryId('all');
     goHome();
     setIsMenuOpen(false);
  };

  return (
    <>
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
       {/* Top Strip for Phones */}
       <div className="bg-slate-50 border-b border-slate-100 py-1.5 px-3 flex justify-between items-center text-[10px] font-medium text-slate-600">
           {/* Left: US Phone */}
           <div className="flex items-center gap-1">
              <img src="https://flagcdn.com/w20/us.png" className="w-3 h-2 object-cover rounded-[1px]" alt="US" /> 
              <span>{adminProfile.usPhoneNumber}</span>
           </div>

           {/* Center: Request Callback */}
           <button 
             onClick={toggleCallbackModal}
             className="flex items-center gap-1 text-primary hover:text-blue-700 transition"
           >
             <Phone size={10} fill="currentColor" />
             <span>Request Call Back</span>
           </button>

           {/* Right: Language/Currency */}
           <div className="flex items-center gap-2">
             <select 
               className="bg-transparent outline-none cursor-pointer text-slate-700 font-bold"
               value={currency}
               onChange={(e) => setCurrency(e.target.value as any)}
             >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
             </select>
           </div>
       </div>

       {/* Main Mobile Header */}
       <div className="py-3 px-4 flex justify-between items-center">
          {/* Logo (Left) */}
          <div onClick={handleHomeClick}>
             <Logo 
               iconClass="w-8 h-8 text-orange-500"
               textClass="text-lg font-bold text-slate-800"
               subTextClass="text-[8px] font-bold text-orange-500 tracking-widest uppercase"
             />
          </div>

          {/* Icons (Right) */}
          <div className="flex items-center gap-4">
              <button className="text-slate-600 relative">
                  <Heart size={24} className={favorites.length > 0 ? "text-red-500 fill-red-500" : ""} />
                  {favorites.length > 0 && (
                     <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {favorites.length}
                     </span>
                  )}
              </button>
              
              <button className="text-slate-600 relative" onClick={() => goToCart()}>
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {cartCount}
                    </span>
                  )}
              </button>

              <button onClick={() => setIsMenuOpen(true)} className="text-slate-600">
                  <Menu size={24} />
              </button>
          </div>
       </div>
    </div>

    {/* Mobile Slide-out Menu */}
    {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
            <div className="relative w-[80%] max-w-[300px] bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="font-bold text-lg text-slate-800">Menu</span>
                    <button onClick={() => setIsMenuOpen(false)}><X size={24} className="text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    <button onClick={handleHomeClick} className="w-full text-left px-6 py-3 border-b border-slate-50 text-slate-700 font-medium">Home</button>
                    <button onClick={handleProductsClick} className="w-full text-left px-6 py-3 border-b border-slate-50 text-slate-700 font-medium">All Products</button>
                    <button onClick={goToCustomerAuth} className="w-full text-left px-6 py-3 border-b border-slate-50 text-slate-700 font-medium">Login / Signup</button>
                    <button className="w-full text-left px-6 py-3 border-b border-slate-50 text-slate-700 font-medium">Track Order</button>
                    <button className="w-full text-left px-6 py-3 border-b border-slate-50 text-slate-700 font-medium">Contact Us</button>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-2 font-bold">CONTACT SUPPORT</p>
                    <div className="space-y-2 text-sm text-slate-700">
                        <div className="flex items-center gap-2"><img src="https://flagcdn.com/w20/us.png" className="w-4" /> {adminProfile.usPhoneNumber}</div>
                        <div className="flex items-center gap-2"><img src="https://flagcdn.com/w20/gb.png" className="w-4" /> {adminProfile.ukPhoneNumber}</div>
                    </div>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { cart, goHome, setActiveCategoryId, goToCart, goToCustomerAuth, currentView } = useStore();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleHome = () => {
    setActiveCategoryId('cat_bestsellers');
    goHome();
  };

  const handleProducts = () => {
    setActiveCategoryId('all');
    goHome();
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-around items-center py-2 pb-safe">
      <button 
        onClick={handleHome}
        className={`flex flex-col items-center gap-1 p-2 ${currentView === 'grid' ? 'text-primary' : 'text-slate-500'}`}
      >
         <div className="relative">
            <Home size={22} />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
         </div>
         <span className="text-[10px] font-medium">Home</span>
      </button>

      <button 
        onClick={handleProducts}
        className={`flex flex-col items-center gap-1 p-2 ${currentView === 'grid' && false ? 'text-primary' : 'text-slate-500'} hover:text-primary transition`}
      >
         <Grid size={22} />
         <span className="text-[10px] font-medium">Products</span>
      </button>

      <button 
        onClick={() => goToCart()}
        className={`flex flex-col items-center gap-1 p-2 ${currentView === 'cart' ? 'text-primary' : 'text-slate-500'}`}
      >
         <div className="relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-secondary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                {cartCount}
              </span>
            )}
         </div>
         <span className="text-[10px] font-medium">Cart</span>
      </button>

      <button 
        onClick={goToCustomerAuth}
        className={`flex flex-col items-center gap-1 p-2 ${currentView === 'customer_auth' ? 'text-primary' : 'text-slate-500'}`}
      >
         <User size={22} />
         <span className="text-[10px] font-medium">Account</span>
      </button>
    </div>
  );
};