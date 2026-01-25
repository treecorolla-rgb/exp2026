import React from 'react';

interface LogoProps {
  className?: string;
  iconClass?: string;
  textClass?: string;
  subTextClass?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "flex items-center gap-3 cursor-pointer group", 
  iconClass = "w-10 h-10 md:w-11 md:h-11 text-orange-500",
  textClass = "text-xl md:text-2xl font-extrabold text-slate-900 leading-none tracking-tighter",
  subTextClass = "text-[10px] font-bold text-orange-500 tracking-[0.3em] uppercase mt-0.5"
}) => {
  return (
    <div className={className}>
      <div className="relative transform group-hover:scale-105 transition-transform duration-300">
        {/* 
           TODO: TO CHANGE LOGO
           1. Delete the <svg> below.
           2. Uncomment the line below and add your image URL:
           <img src="/your-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
        */}
        <svg className={iconClass} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 40C10 18 25 10 45 10H90V90H45C25 90 10 82 10 60V40Z" fill="currentColor" />
          <rect x="28" y="55" width="10" height="25" fill="white" rx="1" />
          <rect x="48" y="40" width="10" height="40" fill="white" rx="1" />
          <rect x="68" y="25" width="10" height="55" fill="white" rx="1" />
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <h1 className={textClass}>
          My Test Store
        </h1>
        <span className={subTextClass}>
          Architecture
        </span>
      </div>
    </div>
  );
};