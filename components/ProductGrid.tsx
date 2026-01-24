import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const ProductGrid: React.FC = () => {
  const { products, categories, searchQuery, setSearchQuery, activeCategoryId } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, searchQuery]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Hide disabled products
    if (product.enabled === false) return false;

    const query = searchQuery.toLowerCase().trim();
    
    // Logic: If searching, search EVERYTHING (Global Search). 
    // If not searching, filter by the selected Category tab.
    if (query.length > 0) {
        const nameMatch = product.name.toLowerCase().includes(query);
        const ingredientMatch = product.activeIngredient.toLowerCase().includes(query);
        
        // Search matches if product belongs to a category matching the search term
        const categoryMatch = product.categoryIds?.some(catId => {
            const cat = categories.find(c => c.id === catId);
            return cat && cat.name.toLowerCase().includes(query);
        });

        return nameMatch || ingredientMatch || categoryMatch;
    } else {
        // Not searching, standard category filtering
        if (activeCategoryId === 'all') return true;
        return product.categoryIds && product.categoryIds.includes(activeCategoryId);
    }
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTitle = () => {
    if (searchQuery.trim().length > 0) {
        return `Search results for "${searchQuery}"`;
    }
    if (activeCategoryId === 'all') return 'All Products';
    return categories.find(c => c.id === activeCategoryId)?.name || 'Products';
  };

  return (
    <main className="flex-1 w-full max-w-full">
      {/* Header / Search - Updated Layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-normal text-slate-800 shrink-0">{getTitle()}</h2>
        
        <div className="relative w-full md:w-1/2">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Search products & categories..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-10 pr-24 py-2.5 border border-slate-300 rounded-[4px] focus:outline-none focus:border-primary transition text-sm"
           />
           <button className="absolute right-0 top-0 bottom-0 bg-[#3b5998] hover:bg-blue-700 text-white px-6 font-medium rounded-r-[4px] text-sm transition">
             Search
           </button>
        </div>
      </div>

      {/* Grid - 2 Columns on Mobile, 3 on Tablet, 4 on Desktop */}
      {currentProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-300">
           <p className="text-slate-500">No products found.</p>
           {searchQuery && (
             <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary font-bold hover:underline"
             >
                Clear Search
             </button>
           )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 space-x-2">
           {/* Previous Button */}
           <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-4 h-10 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 flex items-center justify-center rounded transition ${
                currentPage === page
                  ? 'bg-primary text-white font-bold shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {page}
            </button>
          ))}
          
          {/* Next Button */}
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-4 h-10 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
};