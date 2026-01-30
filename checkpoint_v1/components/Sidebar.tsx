import React from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronRight } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { categories, activeCategoryId, setActiveCategoryId, goHome, currentView } = useStore();

  const handleSelect = (id: string) => {
    setActiveCategoryId(id);
    // If we are in details view, go back to grid
    if (currentView !== 'grid') {
      goHome();
    }
  };

  // Deduplicate categories by Name to ensure sidebar stays clean even if import created duplicates
  const uniqueCategories = categories.filter((cat, index, self) => 
    index === self.findIndex((t) => (
      t.name.toLowerCase() === cat.name.toLowerCase()
    ))
  );

  // Only show enabled categories to the user
  const visibleCategories = uniqueCategories.filter(cat => cat.enabled !== false);

  return (
    <aside className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
      {/* Mobile View: Horizontal Scrollable Pills */}
      <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        <div className="flex space-x-2">
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors border
                ${activeCategoryId === cat.id 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop View: Vertical List */}
      <div className="hidden md:block bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Categories</h3>
        </div>
        <ul className="flex flex-col">
          {visibleCategories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => handleSelect(cat.id)}
                className={`w-full text-left px-5 py-3.5 text-[14px] font-medium transition-all border-b border-slate-50 last:border-0 flex items-center justify-between group
                  ${activeCategoryId === cat.id 
                    ? 'text-primary bg-blue-50/50 font-bold border-l-4 border-l-primary' 
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50 border-l-4 border-l-transparent'}`}
              >
                <span>{cat.name}</span>
                {activeCategoryId === cat.id && <ChevronRight size={16} strokeWidth={3} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};
