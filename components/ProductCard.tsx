import React from 'react';
import { Heart, Share2 } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { viewProduct, toggleFavorite, favorites, formatPrice } = useStore();
  const isFavorite = favorites.includes(product.id);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at MyStore`,
        url: window.location.href, 
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback
      alert(`Share link for ${product.name} copied to clipboard!`);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col h-full hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative group">
      {/* Product Image */}
      <div 
        className="relative mb-4 flex items-center justify-center h-32 md:h-44 cursor-pointer"
        onClick={() => viewProduct(product)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col">
        <h3 
          className="text-slate-900 font-bold text-[16px] md:text-[18px] mb-1 leading-snug cursor-pointer hover:text-primary tracking-tight transition-colors"
          onClick={() => viewProduct(product)}
        >
          {product.name}
        </h3>
        <p className="text-[11px] md:text-[12px] text-slate-500 mb-3 font-medium leading-tight tracking-tight">
          Active ingredient: <span className="text-primary font-bold cursor-pointer hover:underline">{product.activeIngredient}</span>
        </p>

        <div className="mt-auto pt-3 border-t border-slate-50">
          {/* Price Section */}
          <div className="flex items-baseline mb-4">
            <span className="text-[20px] md:text-[22px] font-extrabold text-primary mr-1 tracking-tight">
              {formatPrice(product.price)}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">/ pill</span>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => viewProduct(product)}
              className="flex-1 bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-[12px] font-bold py-2.5 px-3 rounded-[4px] transition-all uppercase tracking-wide shadow-sm"
            >
              Buy Now
            </button>
            
            <button 
              onClick={handleFavorite}
              className={`w-10 h-9 bg-white border rounded-[4px] flex items-center justify-center transition-all ${isFavorite ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500'}`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart size={18} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>

            <button 
              onClick={handleShare}
              className="w-10 h-9 bg-white border border-slate-200 hover:border-blue-300 text-slate-400 hover:text-blue-500 rounded-[4px] flex items-center justify-center transition-all"
              title="Share"
            >
              <Share2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};