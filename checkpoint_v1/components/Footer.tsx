<<<<<<< HEAD
import React from 'react';
import { Truck, Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, RotateCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const { isAuthenticated, logout, goToLogin, goToNotFound, goToFaq, goHome, setActiveCategoryId, paymentMethods, adminProfile, categories } = useStore();

  const handleLink = (e: React.MouseEvent) => {
    e.preventDefault();
    goToNotFound();
  };

  const handleHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryId('cat_bestsellers');
    goHome();
  };

  const handleBestsellers = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryId('cat_bestsellers');
    goHome();
  };

  const handleCategoryClick = (categoryId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryId(categoryId);
    goHome();
  };

  // Get first 5 enabled categories for footer links
  const footerCategories = categories.filter(c => c.enabled && c.id !== 'cat_bestsellers').slice(0, 5);

  return (
    <footer className="mt-auto bg-white border-t border-slate-200">
      {/* Top Section: Trust Indicators */}
      <div className="border-b border-slate-100">
        <div className="max-w-[1300px] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Shipping */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <Truck size={40} className="text-primary" strokeWidth={1.5} />
            <div className="border-l border-slate-100 pl-4 md:border-none md:pl-0">
              <h4 className="font-bold text-slate-800 text-[15px]">Free Shipping & Return</h4>
              <p className="text-sm text-slate-500">Free shipping on all orders over $200.00</p>
            </div>
          </div>

          {/* Money Back */}
          <div className="flex items-center gap-4 justify-center md:justify-center md:border-l md:border-r border-slate-100 px-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-xl">
              $
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-[15px]">Money back guarantee</h4>
              <p className="text-sm text-slate-500">100% money back guarantee</p>
            </div>
          </div>

          {/* Online Support */}
          <div className="flex items-center gap-4 justify-center md:justify-end">
            <div className="relative">
               <RotateCw size={40} className="text-primary" strokeWidth={1.5} />
               <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary mt-1">24</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-[15px]">Online support 24/7</h4>
              <p className="text-sm text-slate-500">Always ready to assist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1300px] mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 text-sm">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-6">
          <div onClick={handleHome}>
             <Logo 
                textClass="text-xl font-bold text-slate-800 leading-none tracking-tight"
                subTextClass="text-[9px] font-bold text-orange-500 tracking-[0.3em] uppercase mt-1"
             />
          </div>

          <div className="text-slate-500 leading-relaxed space-y-1 text-[13px]">
             <p>© 2001-{new Date().getFullYear()}AirMail Chemist .</p>
             <p>All rights reserved. Licensed online architectural store.</p>
             <p>International license number 79751731 issued 01 aug 2021</p>
          </div>

          {/* Security Trust Badges */}
          <div className="flex gap-3 items-center pt-2 flex-wrap">
             <img src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/geo%20trust.png" alt="GeoTrust" className="h-8 object-contain" />
             <img src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/Norton.png" alt="Norton" className="h-8 object-contain" />
             <img src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/SSLcertificate.png" alt="SSL" className="h-8 object-contain" />
             <img src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/verified%20by%20visa.png" alt="Verified by Visa" className="h-8 object-contain" />
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 text-slate-400 pt-2">
             <Facebook size={18} className="hover:text-blue-600 cursor-pointer transition" />
             <Instagram size={18} className="hover:text-pink-600 cursor-pointer transition" />
             <Linkedin size={18} className="hover:text-blue-700 cursor-pointer transition" />
             <Twitter size={18} className="hover:text-blue-400 cursor-pointer transition" />
             <Youtube size={18} className="hover:text-red-600 cursor-pointer transition" />
          </div>
        </div>

        {/* Column 2: Contact Info */}
        <div className="lg:pl-8">
           <h3 className="text-primary font-bold text-[15px] mb-6">Need help?</h3>
           
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 shadow-sm" />
                 <span className="font-bold text-slate-700 text-lg">US: {adminProfile.usPhoneNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                 <img src="https://flagcdn.com/w20/gb.png" alt="GB" className="w-5 shadow-sm" />
                 <span className="font-bold text-primary text-lg">GB: {adminProfile.ukPhoneNumber}</span>
              </div>

              <div className="pt-4 space-y-3">
                 <div className="flex items-center gap-2 text-slate-500">
                    <RotateCw size={16} />
                    <span>24/7 Customer support</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={16} />
                    <a href={`mailto:${adminProfile.supportEmail || 'support@teststore.com'}`} className="text-primary hover:underline">{adminProfile.supportEmail || 'support@teststore.com'}</a>
                 </div>
                 
                 {/* Payment Icons Row */}
                 <div className="flex gap-2 mt-4 items-center">
                    {paymentMethods.filter(pm => pm.enabled).map(pm => (
                       <img 
                          key={pm.id} 
                          src={pm.iconUrl} 
                          alt={pm.name}
                          className={`${pm.name.toLowerCase().includes('visa') ? 'h-5' : 'h-6'} w-auto object-contain`}
                          title={pm.name}
                       />
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Column 3: Links & Form */}
        <div>
           <h3 className="text-primary font-bold text-[15px] mb-6">Information</h3>
           
           <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
              {footerCategories.map(cat => (
                <a key={cat.id} href="#" onClick={handleCategoryClick(cat.id)} className="text-slate-600 hover:text-primary transition text-[13px]">{cat.name}</a>
              ))}
              <a href="#" onClick={handleLink} className="text-slate-600 hover:text-primary transition text-[13px]">Testimonials</a>
              <a href="#" onClick={handleHome} className="text-slate-600 hover:text-primary transition text-[13px]">Home</a>
              <a href="#" onClick={handleBestsellers} className="text-slate-600 hover:text-primary transition text-[13px]">Bestsellers</a>
              <a href="#" onClick={(e) => { e.preventDefault(); goToFaq(); }} className="text-slate-600 hover:text-primary transition text-[13px]">FAQ</a>
              <a href="#" onClick={handleLink} className="text-slate-600 hover:text-primary transition text-[13px]">Contact Us</a>
              <a href="#" onClick={handleLink} className="text-slate-600 hover:text-primary transition text-[13px]">Policy</a>
           </div>

           <div className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 border border-slate-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button className="bg-[#ef4444] hover:bg-red-600 text-white px-6 py-2 rounded-r font-bold text-sm transition">
                Subscribe
              </button>
           </div>
        </div>
      </div>

      {/* Admin Toggle Footer - Only show logout if authenticated */}
      {isAuthenticated && (
        <div className="bg-slate-50 border-t border-slate-200 py-3">
           <div className="max-w-[1300px] mx-auto px-4 text-center">
              <button onClick={logout} className="text-[10px] text-red-500 hover:text-red-700 font-medium uppercase tracking-wide">
                 Logout Admin
              </button>
           </div>
        </div>
      )}
    </footer>
  );
=======
import React from 'react';
import { Truck, Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, RotateCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const { isAuthenticated, logout, goToLogin, goToNotFound, goToFaq, goHome, setActiveCategoryId, paymentMethods, adminProfile, categories } = useStore();

  const handleLink = (e: React.MouseEvent) => {
    e.preventDefault();
    goToNotFound();
  };

  const handleHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryId('cat_bestsellers');
    goHome();
  };

  const handleBestsellers = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryId('cat_bestsellers');
    goHome();
  };

  const handleCategoryClick = (categoryId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveCategoryId(categoryId);
    goHome();
  };

  // Get first 5 enabled categories for footer links
  const footerCategories = categories.filter(c => c.enabled && c.id !== 'cat_bestsellers').slice(0, 5);

  return (
    <footer className="mt-auto bg-white border-t border-slate-200">
      {/* Top Section: Trust Indicators */}
      <div className="border-b border-slate-100">
        <div className="max-w-[1300px] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Shipping */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <Truck size={40} className="text-primary" strokeWidth={1.5} />
            <div className="border-l border-slate-100 pl-4 md:border-none md:pl-0">
              <h4 className="font-bold text-slate-800 text-[15px]">Free Shipping & Return</h4>
              <p className="text-sm text-slate-500">Free shipping on all orders over $200.00</p>
            </div>
          </div>

          {/* Money Back */}
          <div className="flex items-center gap-4 justify-center md:justify-center md:border-l md:border-r border-slate-100 px-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-xl">
              $
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-[15px]">Money back guarantee</h4>
              <p className="text-sm text-slate-500">100% money back guarantee</p>
            </div>
          </div>

          {/* Online Support */}
          <div className="flex items-center gap-4 justify-center md:justify-end">
            <div className="relative">
               <RotateCw size={40} className="text-primary" strokeWidth={1.5} />
               <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary mt-1">24</span>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-[15px]">Online support 24/7</h4>
              <p className="text-sm text-slate-500">Always ready to assist</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1300px] mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 text-sm">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-6">
          <div onClick={handleHome}>
             <Logo 
                textClass="text-xl font-bold text-slate-800 leading-none tracking-tight"
                subTextClass="text-[9px] font-bold text-orange-500 tracking-[0.3em] uppercase mt-1"
             />
          </div>

          <div className="text-slate-500 leading-relaxed space-y-1 text-[13px]">
             <p>© 2001-{new Date().getFullYear()}AirMail Chemist .</p>
             <p>All rights reserved. Licensed online architectural store.</p>
             <p>International license number 79751731 issued 01 aug 2021</p>
          </div>

          {/* Security Trust Badges */}
          <div className="flex gap-3 items-center pt-2 flex-wrap">
             <img src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/geo%20trust.png" alt="GeoTrust" className="h-8 object-contain" />
             <img src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/Norton.png" alt="Norton" className="h-8 object-contain" />
             <img src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/SSLcertificate.png" alt="SSL" className="h-8 object-contain" />
             <img src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/verified%20by%20visa.png" alt="Verified by Visa" className="h-8 object-contain" />
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 text-slate-400 pt-2">
             <Facebook size={18} className="hover:text-blue-600 cursor-pointer transition" />
             <Instagram size={18} className="hover:text-pink-600 cursor-pointer transition" />
             <Linkedin size={18} className="hover:text-blue-700 cursor-pointer transition" />
             <Twitter size={18} className="hover:text-blue-400 cursor-pointer transition" />
             <Youtube size={18} className="hover:text-red-600 cursor-pointer transition" />
          </div>
        </div>

        {/* Column 2: Contact Info */}
        <div className="lg:pl-8">
           <h3 className="text-primary font-bold text-[15px] mb-6">Need help?</h3>
           
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 shadow-sm" />
                 <span className="font-bold text-slate-700 text-lg">US: {adminProfile.usPhoneNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                 <img src="https://flagcdn.com/w20/gb.png" alt="GB" className="w-5 shadow-sm" />
                 <span className="font-bold text-primary text-lg">GB: {adminProfile.ukPhoneNumber}</span>
              </div>

              <div className="pt-4 space-y-3">
                 <div className="flex items-center gap-2 text-slate-500">
                    <RotateCw size={16} />
                    <span>24/7 Customer support</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-500">
                    <Mail size={16} />
                    <a href={`mailto:${adminProfile.supportEmail || 'support@teststore.com'}`} className="text-primary hover:underline">{adminProfile.supportEmail || 'support@teststore.com'}</a>
                 </div>
                 
                 {/* Payment Icons Row */}
                 <div className="flex gap-2 mt-4 items-center">
                    {paymentMethods.filter(pm => pm.enabled).map(pm => (
                       <img 
                          key={pm.id} 
                          src={pm.iconUrl} 
                          alt={pm.name}
                          className={`${pm.name.toLowerCase().includes('visa') ? 'h-5' : 'h-6'} w-auto object-contain`}
                          title={pm.name}
                       />
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Column 3: Links & Form */}
        <div>
           <h3 className="text-primary font-bold text-[15px] mb-6">Information</h3>
           
           <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
              {footerCategories.map(cat => (
                <a key={cat.id} href="#" onClick={handleCategoryClick(cat.id)} className="text-slate-600 hover:text-primary transition text-[13px]">{cat.name}</a>
              ))}
              <a href="#" onClick={handleLink} className="text-slate-600 hover:text-primary transition text-[13px]">Testimonials</a>
              <a href="#" onClick={handleHome} className="text-slate-600 hover:text-primary transition text-[13px]">Home</a>
              <a href="#" onClick={handleBestsellers} className="text-slate-600 hover:text-primary transition text-[13px]">Bestsellers</a>
              <a href="#" onClick={(e) => { e.preventDefault(); goToFaq(); }} className="text-slate-600 hover:text-primary transition text-[13px]">FAQ</a>
              <a href="#" onClick={handleLink} className="text-slate-600 hover:text-primary transition text-[13px]">Contact Us</a>
              <a href="#" onClick={handleLink} className="text-slate-600 hover:text-primary transition text-[13px]">Policy</a>
           </div>

           <div className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 border border-slate-300 rounded-l px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button className="bg-[#ef4444] hover:bg-red-600 text-white px-6 py-2 rounded-r font-bold text-sm transition">
                Subscribe
              </button>
           </div>
        </div>
      </div>

      {/* Admin Toggle Footer - Only show logout if authenticated */}
      {isAuthenticated && (
        <div className="bg-slate-50 border-t border-slate-200 py-3">
           <div className="max-w-[1300px] mx-auto px-4 text-center">
              <button onClick={logout} className="text-[10px] text-red-500 hover:text-red-700 font-medium uppercase tracking-wide">
                 Logout Admin
              </button>
           </div>
        </div>
      )}
    </footer>
  );
>>>>>>> aa34a9715944dd35c335ab419f23ab548cd6285a
};