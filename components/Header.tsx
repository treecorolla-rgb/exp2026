import React, { useState } from 'react';
import { Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { cart, goHome, setActiveCategoryId, goToNotFound, goToCart, favorites, formatPrice } = useStore();
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
    <header className="bg-white py-4 md:py-6 px-4 shadow-sm sticky top-0 z-40">
      <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row justify-between items-center">
        
        {/* Top Row: Logo, Icons, Mobile Toggle */}
        <div className="w-full flex justify-between items-center md:w-auto">
          {/* Logo Section */}
          <div onClick={handleHomeClick}>
            <Logo />
          </div>

          {/* Mobile Actions: Cart & Menu Toggle */}
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 text-[14px] font-semibold text-slate-600 tracking-tight">
          <button onClick={handleHomeClick} className="hover:text-primary transition bg-transparent border-none cursor-pointer">Home</button>
          <button onClick={handleProductsClick} className="hover:text-primary transition bg-transparent border-none cursor-pointer">Products</button>
          <a href="#" onClick={handleNotFound} className="hover:text-primary transition">About us</a>
          <a href="#" onClick={handleNotFound} className="hover:text-primary transition">Articles</a>
          <a href="#" onClick={handleNotFound} className="hover:text-primary transition">Video</a>
          <a href="#" onClick={handleNotFound} className="hover:text-primary transition">Testimonials</a>
          <a href="#" onClick={handleNotFound} className="hover:text-primary transition">Contact</a>
        </nav>

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="relative group cursor-pointer">
            <Heart size={24} className={`text-slate-400 group-hover:text-secondary transition ${favorites.length > 0 ? 'fill-secondary text-secondary' : ''}`} strokeWidth={2} />
            <span className="absolute -top-3 -right-3 bg-secondary text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {favorites.length}
            </span>
          </div>

          <div className="flex items-center space-x-3 cursor-pointer group" onClick={goToCart}>
            <div className="relative">
              <ShoppingCart size={24} className="text-slate-400 group-hover:text-primary transition" strokeWidth={2} />
              <span className="absolute -top-3 -right-3 bg-secondary text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            <div className="flex flex-col text-sm leading-none">
              <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-0.5">Total</span>
              <span className="font-extrabold text-slate-800">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl py-4 px-6 flex flex-col space-y-1 animate-in slide-in-from-top-5 duration-200 z-50">
          <button onClick={handleHomeClick} className="text-left font-semibold text-slate-700 hover:text-primary py-3 border-b border-slate-50">Home</button>
          <button onClick={handleProductsClick} className="text-left font-semibold text-slate-700 hover:text-primary py-3 border-b border-slate-50">Products</button>
          <a href="#" onClick={handleNotFound} className="font-semibold text-slate-700 hover:text-primary py-3 border-b border-slate-50">About us</a>
          <a href="#" onClick={handleNotFound} className="font-semibold text-slate-700 hover:text-primary py-3 border-b border-slate-50">Articles</a>
          <a href="#" onClick={handleNotFound} className="font-semibold text-slate-700 hover:text-primary py-3 border-b border-slate-50">Contact</a>
        </div>
      )}
    </header>
  );
};