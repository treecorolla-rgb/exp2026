<<<<<<< HEAD
import React from 'react';
import { Home, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const NotFound: React.FC = () => {
  const { goHome } = useStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-white">
      <div className="bg-slate-50 p-8 rounded-full mb-6 animate-pulse">
        <AlertCircle size={80} className="text-slate-300" strokeWidth={1.5} />
      </div>
      
      <h1 className="text-7xl font-black text-slate-800 mb-2 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-slate-600 mb-6">Page Not Found</h2>
      
      <p className="text-slate-500 max-w-md mb-10 leading-relaxed text-sm md:text-base">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <button 
        onClick={goHome}
        className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <Home size={18} />
        Back to Home
      </button>
    </div>
  );
};
=======
import React from 'react';
import { Home, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const NotFound: React.FC = () => {
  const { goHome } = useStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-white">
      <div className="bg-slate-50 p-8 rounded-full mb-6 animate-pulse">
        <AlertCircle size={80} className="text-slate-300" strokeWidth={1.5} />
      </div>
      
      <h1 className="text-7xl font-black text-slate-800 mb-2 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-slate-600 mb-6">Page Not Found</h2>
      
      <p className="text-slate-500 max-w-md mb-10 leading-relaxed text-sm md:text-base">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <button 
        onClick={goHome}
        className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <Home size={18} />
        Back to Home
      </button>
    </div>
  );
};
>>>>>>> aa34a9715944dd35c335ab419f23ab548cd6285a
