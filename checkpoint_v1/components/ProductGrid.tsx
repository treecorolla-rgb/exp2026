import React, { useState, useEffect } from 'react';
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

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      // Hide disabled products
      if (product.enabled === false) return false;

      const query = searchQuery.toLowerCase().trim();
      
      // Logic: If searching, search EVERYTHING (Global Search). 
      // If not searching, filter by the selected Category tab.
      if (query.length > 0) {
          const nameMatch = product.name.toLowerCase().includes(query);
          const ingredientMatch = product.activeIngredient.toLowerCase().includes(query);
          const descriptionMatch = product.description?.toLowerCase().includes(query);
          
          // Search matches if product belongs to a category matching the search term
          const categoryMatch = product.categoryIds?.some(catId => {
              const cat = categories.find(c => c.id === catId);
              return cat && cat.name.toLowerCase().includes(query);
          });

          return nameMatch || ingredientMatch || categoryMatch || descriptionMatch;
      } else {
          // Not searching, standard category filtering
          if (activeCategoryId === 'all') return true;
          return product.categoryIds && product.categoryIds.includes(activeCategoryId);
      }
    })
    .sort((a, b) => (a.featuredOrder || 9999) - (b.featuredOrder || 9999));

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
      {/* Header Title */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{getTitle()}</h2>
        <span className="text-sm text-slate-500 font-medium">
            {filteredProducts.length} items found
        </span>
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
           <p className="text-slate-500 font-medium">No products found matching your criteria.</p>
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