import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div 
      className="group relative bg-brand-card rounded-xl overflow-hidden border border-white/5 hover:border-brand-neon/50 transition-all duration-500 cursor-pointer hover:shadow-neon hover:-translate-y-2"
      onClick={() => onClick(product)}
    >
      <div className="aspect-w-4 aspect-h-3 w-full overflow-hidden bg-brand-surface relative h-64">
        <img
          src={product.images[0]}
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-transparent opacity-90"></div>
        
        {/* Badge Exemplo */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded border border-white/10">
          Novo
        </div>
      </div>
      
      <div className="p-5 relative">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-brand-neon transition-colors">{product.title}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Categoria Digital</p>
        </div>
        
        <p className="text-sm text-gray-400 mb-5 line-clamp-2 font-light leading-relaxed border-l-2 border-white/5 pl-3">
          {product.shortDescription}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <span className="text-xl font-bold text-white tracking-tight">{formatPrice(product.price)}</span>
          <button className="bg-white text-black hover:bg-brand-neon hover:text-black px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transform group-hover:scale-105">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
};