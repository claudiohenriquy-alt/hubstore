
import React, { useState } from 'react';
import { Product } from '../types';
import { QRCodeCanvas } from 'qrcode.react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [showPix, setShowPix] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const handlePayment = () => {
    if (product.checkoutUrl) {
      // Se tiver link externo, abre em nova aba
      window.open(product.checkoutUrl, '_blank');
    } else if (product.pixCode) {
      // Se tiver código PIX manual, mostra QR Code interno
      setShowPix(true);
    } else {
      alert('Configuração de pagamento pendente para este produto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      ></div>

      <div className="relative bg-brand-card border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-[fadeIn_0.3s_ease-out]">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/50 backdrop-blur text-white rounded-full md:hidden hover:bg-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Image Section */}
        <div className="w-full md:w-5/12 h-64 md:h-auto bg-brand-surface relative overflow-hidden group">
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-transparent md:bg-gradient-to-r"></div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col overflow-y-auto bg-brand-card scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{product.title}</h2>
              <span className="text-brand-neon text-sm font-medium tracking-wider uppercase">Detalhes do Produto</span>
            </div>
            <button onClick={onClose} className="hidden md:block text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-gray-400 mb-8 leading-relaxed">
            <p>{product.fullDescription}</p>
          </div>

          {/* Pricing Area */}
          <div className="mt-auto bg-brand-surface/50 p-6 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-neon/5 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="flex items-end gap-2 mb-6 relative z-10">
              <span className="text-gray-400 text-sm mb-1">Total:</span>
              <span className="text-3xl font-bold text-white">{formatPrice(product.price)}</span>
            </div>

            {!showPix ? (
              <div className="flex flex-col gap-3 relative z-10">
                <button 
                  onClick={handlePayment}
                  className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 group"
                >
                  {product.checkoutUrl ? (
                    <>
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Ir para Pagamento
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Pagar com PIX (Instantâneo)
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-[fadeIn_0.5s_ease-out] relative z-10">
                <div className="bg-white p-4 rounded-xl shadow-xl mb-4">
                  {product.pixCode && (
                    <QRCodeCanvas value={product.pixCode} size={180} />
                  )}
                </div>
                <p className="text-gray-300 text-sm mb-4 text-center font-medium">Escaneie o QR Code acima</p>
                
                <div className="w-full relative group mb-2">
                  <div className="absolute inset-0 bg-brand-neon/20 blur-md rounded-lg group-hover:bg-brand-neon/30 transition-all"></div>
                  <button 
                    onClick={() => {
                        if(product.pixCode) navigator.clipboard.writeText(product.pixCode);
                        alert("Código PIX copiado!");
                    }}
                    className="relative w-full py-3 bg-brand-surface border border-brand-neon/30 text-brand-neon hover:text-white hover:bg-brand-neon/10 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copiar Código PIX
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowPix(false)}
                  className="mt-2 text-sm text-gray-500 hover:text-white underline"
                >
                  Voltar para opções
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
