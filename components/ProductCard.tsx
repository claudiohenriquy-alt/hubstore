
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
    product: Product;
    onSelect: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(product.price);

    return (
        <div 
            className="group bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-zinc-700 hover:scale-[1.02] flex flex-col cursor-pointer h-full"
            onClick={() => onSelect(product)}
        >
            <div className="relative overflow-hidden">
                <img 
                    src={product.imageUrl} 
                    alt={product.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-zinc-800/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-zinc-700">
                    Novo
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white">{product.title}</h3>
                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-1">{product.category}</p>
                <p className="text-sm text-gray-400 mt-3 flex-grow min-h-[60px]">{product.shortDescription}</p>
                
                <hr className="border-zinc-800 my-4" />

                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">{formattedPrice}</span>
                    <button 
                        className="bg-white text-black font-semibold text-sm py-2 px-5 rounded-md hover:bg-gray-200 transition-colors"
                        onClick={(e) => { e.stopPropagation(); onSelect(product); }}
                    >
                        Comprar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
