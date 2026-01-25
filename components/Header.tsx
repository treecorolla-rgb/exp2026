import React, { useState } from 'react';
import { Heart, ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { cart, goHome, setActiveCategoryId, goToNotFound, goToCart, favorites, formatPrice, searchQuery, setSearchQuery } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryId('cat_bestsellers');
    goHome();
    setIsMobileMenuOpen(false);
  };

  const handleProductsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryId('all'); // Show all products
    goHome();
    setIsMobileMenuOpen(false);
  };

  const handleNotFound = (e: React.MouseEvent) => {
    e.preventDefault();
    goToNotFound();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Upper Header: Logo, Search, Cart */}
      <div className="border-b border-slate-100 py-4 px-4">
        <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Mobile Actions */}
          <div className="w-full md:w-auto flex justify-between items-center">
            <div onClick={handleHomeClick}>
              <Logo />
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-4 md:hidden">
              <div className="relative cursor-pointer" onClick={goToCart}>
                <ShoppingCart size={24} className="text-slate-700" />
                <span className="absolute -top-3 -right-3 bg-secondary text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm border border-white">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-700 hover:text-primary transition"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-8">
            <div className="relative group">
               <input 
                 type="text" 
                 placeholder="Search by name, ingredient, or category..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-4 pr-12 py-2.5 border border-slate-300 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition text-sm bg-slate-50 focus:bg-white"
               />
               <button className="absolute right-1 top-1 bottom-1 bg-primary hover:bg-blue-600 text-white w-10 rounded-full flex items-center justify-center transition">
                 <Search size={18} />
               </button>
            </div>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6 shrink-0">
            <div className="relative group cursor-pointer" title="Favorites">
              <Heart size={26} className={`text-slate-400 group-hover:text-secondary transition ${favorites.length > 0 ? 'fill-secondary text-secondary' : ''}`} strokeWidth={1.5} />
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {favorites.length}
              </span>
            </div>

            <div className="flex items-center space-x-3 cursor-pointer group" onClick={goToCart}>
              <div className="relative">
                <ShoppingCart size={26} className="text-slate-400 group-hover:text-primary transition" strokeWidth={1.5} />
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <div className="flex flex-col text-sm leading-none">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">My Cart</span>
                <span className="font-extrabold text-slate-800">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar (Desktop) */}
      <div className="hidden lg:block bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1300px] mx-auto px-4">
           <nav className="flex items-center space-x-8 text-[13px] font-bold text-slate-600 tracking-wide uppercase h-10">
             <button onClick={handleHomeClick} className="h-full flex items-center hover:text-primary transition border-b-2 border-transparent hover:border-primary">Home</button>
             <button onClick={handleProductsClick} className="h-full flex items-center hover:text-primary transition border-b-2 border-transparent hover:border-primary">All Products</button>
             <a href="#" onClick={handleNotFound} className="h-full flex items-center hover:text-primary transition border-b-2 border-transparent hover:border-primary">About us</a>
             <a href="#" onClick={handleNotFound} className="h-full flex items-center hover:text-primary transition border-b-2 border-transparent hover:border-primary">FAQ</a>
             <a href="#" onClick={handleNotFound} className="h-full flex items-center hover:text-primary transition border-b-2 border-transparent hover:border-primary">Testimonials</a>
             <a href="#" onClick={handleNotFound} className="h-full flex items-center hover:text-primary transition border-b-2 border-transparent hover:border-primary">Contact Us</a>
             <div className="flex-1"></div>
             <a href="#" onClick={handleNotFound} className="h-full flex items-center text-secondary hover:text-red-600 transition font-extrabold">Special Offers</a>
           </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl py-4 px-6 flex flex-col space-y-1 animate-in slide-in-from-top-5 duration-200 z-50">
           {/* Search in Mobile Menu */}
           <div className="mb-4 relative">
               <input 
                 type="text" 
                 placeholder="Search..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-primary"
               />
               <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
           </div>
          <button onClick={handleHomeClick} className="text-left font-bold text-slate-700 hover:text-primary py-3 border-b border-slate-50 uppercase text-sm">Home</button>
          <button onClick={handleProductsClick} className="text-left font-bold text-slate-700 hover:text-primary py-3 border-b border-slate-50 uppercase text-sm">Products</button>
          <a href="#" onClick={handleNotFound} className="font-bold text-slate-700 hover:text-primary py-3 border-b border-slate-50 uppercase text-sm">About us</a>
          <a href="#" onClick={handleNotFound} className="font-bold text-slate-700 hover:text-primary py-3 border-b border-slate-50 uppercase text-sm">FAQ</a>
          <a href="#" onClick={handleNotFound} className="font-bold text-slate-700 hover:text-primary py-3 border-b border-slate-50 uppercase text-sm">Contact</a>
        </div>
      )}
    </header>
  );
};