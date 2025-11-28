
import React, { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
    product: Product;
    onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(product.price);
    
    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-in-up flex flex-col md:flex-row shadow-2xl shadow-black/50"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                    <X size={24} />
                </button>
                
                {/* Imagem */}
                <div className="w-full md:w-1/2 flex-shrink-0 relative">
                     <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-64 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-zinc-900/50"></div>
                </div>

                {/* Conteúdo */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                    <div className="flex-grow">
                        <div className="inline-block bg-zinc-800 px-3 py-1 rounded-full text-xs text-gray-300 mb-3 border border-zinc-700">
                            {product.category}
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">{product.title}</h2>
                        <p className="text-gray-400 leading-relaxed">{product.longDescription}</p>
                    </div>
                    
                    {/* Seção de Pagamento - Novo Design */}
                    <div className="mt-8 bg-black border border-zinc-800 rounded-xl p-6 shadow-lg">
                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-gray-400 text-lg font-medium">Total:</span>
                            <span className="text-4xl font-bold text-white tracking-tight">{formattedPrice}</span>
                        </div>
                        
                        <a 
                            href={product.checkoutUrlCard}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold text-lg py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20"
                        >
                            <ExternalLink size={20} />
                            Ir para Pagamento
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
