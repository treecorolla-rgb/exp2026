import React from 'react';
import { Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const TopBar: React.FC = () => {
  const { toggleCallbackModal, adminProfile, goToCustomerAuth, currency, setCurrency } = useStore();

  return (
    <div className="bg-slate-50 border-b border-slate-200 text-[13px] text-slate-600 py-2.5 px-4 hidden md:block font-medium tracking-tight">
      <div className="max-w-[1300px] mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="flex items-center space-x-2">
            <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm" />
            <span className="font-semibold text-slate-700 hover:text-primary transition cursor-default">US: {adminProfile.usPhoneNumber}</span>
          </span>
          <span className="flex items-center space-x-2">
            <img src="https://flagcdn.com/w20/gb.png" alt="GB" className="w-5 h-3.5 object-cover rounded-[2px] shadow-sm" />
            <span className="font-semibold text-slate-700 hover:text-primary transition cursor-default">GB: {adminProfile.ukPhoneNumber}</span>
          </span>
          <button
            onClick={toggleCallbackModal}
            className="flex items-center space-x-1.5 text-slate-500 hover:text-primary transition font-bold"
          >
            <Phone size={14} strokeWidth={3} />
            <span>Request callback</span>
          </button>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <select className="bg-transparent border-none outline-none cursor-pointer hover:text-primary font-bold text-[12px] uppercase tracking-wide text-slate-500">
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
            </select>
            <select
              className="bg-transparent border-none outline-none cursor-pointer hover:text-primary font-bold text-[12px] uppercase tracking-wide text-slate-500"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={goToCustomerAuth}
              className="hover:text-primary uppercase font-bold text-[11px] tracking-widest text-slate-500"
            >
              Login
            </button>
            <button
              onClick={goToCustomerAuth}
              className="bg-primary hover:bg-blue-600 text-white px-4 py-1.5 rounded-[3px] font-bold text-[11px] transition uppercase tracking-widest shadow-sm hover:shadow-md"
            >
              Signup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};