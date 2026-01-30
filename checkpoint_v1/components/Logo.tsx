<<<<<<< HEAD
import React from 'react';
import { useStore } from '../context/StoreContext';

interface LogoProps {
  className?: string;
  iconClass?: string;
  textClass?: string;
  subTextClass?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "flex items-center gap-3 cursor-pointer group",
  iconClass = "w-10 h-10 md:w-11 md:h-11 text-secondary",
  textClass = "text-xl md:text-2xl font-extrabold text-slate-800 leading-none tracking-tighter",
  subTextClass = "text-[10px] font-bold text-[#337ab7] tracking-[0.1em] uppercase mt-0.5"
}) => {
  const { adminProfile } = useStore();

  // If a custom logo URL is set in admin settings, use that instead
  if (adminProfile?.logoUrl) {
    return (
      <div className={className}>
        <img
          src={adminProfile.logoUrl}
          alt="Store Logo"
          className="h-12 md:h-16 lg:h-20 object-contain transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative transform group-hover:scale-105 transition-transform duration-300">
        <svg className={iconClass} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Medical Cross Shape */}
          <path d="M15 40C15 25 25 15 40 15H60C75 15 85 25 85 40V60C85 75 75 85 60 85H40C25 85 15 75 15 60V40Z" fill="currentColor" opacity="0.1" />
          <path d="M35 50H65" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
          <path d="M50 35V65" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <h1 className={textClass}>
          AirMail Chemist
        </h1>
        <span className={subTextClass}>
          High Quality & Low Prices
        </span>
      </div>
    </div>
  );
};
=======
import React from 'react';
import { useStore } from '../context/StoreContext';

interface LogoProps {
  className?: string;
  iconClass?: string;
  textClass?: string;
  subTextClass?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "flex items-center gap-3 cursor-pointer group",
  iconClass = "w-10 h-10 md:w-11 md:h-11 text-secondary",
  textClass = "text-xl md:text-2xl font-extrabold text-slate-800 leading-none tracking-tighter",
  subTextClass = "text-[10px] font-bold text-[#337ab7] tracking-[0.1em] uppercase mt-0.5"
}) => {
  const { adminProfile } = useStore();

  // If a custom logo URL is set in admin settings, use that instead
  if (adminProfile?.logoUrl) {
    return (
      <div className={className}>
        <img
          src={adminProfile.logoUrl}
          alt="Store Logo"
          className="h-12 md:h-16 lg:h-20 object-contain transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative transform group-hover:scale-105 transition-transform duration-300">
        <svg className={iconClass} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Medical Cross Shape */}
          <path d="M15 40C15 25 25 15 40 15H60C75 15 85 25 85 40V60C85 75 75 85 60 85H40C25 85 15 75 15 60V40Z" fill="currentColor" opacity="0.1" />
          <path d="M35 50H65" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
          <path d="M50 35V65" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <h1 className={textClass}>
          AirMail Chemist
        </h1>
        <span className={subTextClass}>
          High Quality & Low Prices
        </span>
      </div>
    </div>
  );
};
>>>>>>> aa34a9715944dd35c335ab419f23ab548cd6285a
