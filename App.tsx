
import React, { useState } from 'react';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { Product } from './types';

// --- Mock Data ---
// DICA: Cole seus códigos PIX Copia e Cola aqui no campo pixCode OU o link direto em checkoutUrl
const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Robo AI-Assist',
    shortDescription: 'Assistente virtual com inteligência artificial avançada para automação.',
    fullDescription: 'O Robo AI-Assist revoluciona seu atendimento. Capaz de processar linguagem natural em português nativo, ele integra com WhatsApp, Telegram e Instagram. Ideal para suporte nível 1 e agendamentos automáticos.',
    price: 299.90,
    images: ['https://picsum.photos/id/1/800/800'],
    checkoutUrl: 'https://www.abacatepay.com/pay/bill_dfMNyppuAPcmSmgpbkWmw3T4',
    // pixCode mantido como fallback visual se necessário, mas o link terá prioridade se o código do modal for atualizado
    pixCode: '00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540410.005802BR5901N6001C62070503***6304E2CA',
  },
  {
    id: '2',
    title: 'Lista de Fornecedores BR',
    shortDescription: 'Banco de dados com mais de 500 fornecedores verificados no Brasil.',
    fullDescription: 'Tenha acesso imediato aos melhores fornecedores de eletrônicos, roupas e acessórios do Brasil. Lista atualizada mensalmente com contatos diretos, CNPJ verificado e reputação no mercado.',
    price: 49.90,
    images: ['https://picsum.photos/id/20/800/800'],
    checkoutUrl: 'https://www.abacatepay.com/pay/bill_UXQKA2DJDwcYGBSs2e4Fcrxc',
    pixCode: '00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540410.005802BR5901N6001C62070503***6304E2CA',
  },
  {
    id: '3',
    title: 'Robô Automação IA',
    shortDescription: 'Script de automação para marketing digital e vendas.',
    fullDescription: 'Automatize suas postagens, comentários e interações em redes sociais. Este robô utiliza algoritmos seguros para aumentar seu engajamento orgânico sem riscos de bloqueio. Inclui painel de analytics.',
    price: 159.00,
    images: ['https://picsum.photos/id/3/800/800'],
    checkoutUrl: 'https://www.abacatepay.com/pay/bill_q2WGmmQMZzFZqsxrrXPthWJX',
    pixCode: '00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540410.005802BR5901N6001C62070503***6304E2CA',
  },
  {
    id: '4',
    title: 'Catálogo Premium Atacado',
    shortDescription: 'Acesso exclusivo a preços de atacado para revendedores.',
    fullDescription: 'Portal exclusivo para lojistas e revendedores. Compre grandes marcas com até 60% de desconto. Acesso vitalício à plataforma de pedidos e suporte logístico dedicado.',
    price: 89.90,
    images: ['https://picsum.photos/id/4/800/800'],
    checkoutUrl: 'https://www.abacatepay.com/pay/bill_mqsL3XWrmNMbmw6nAykSBhKB',
    pixCode: '00020126360014BR.GOV.BCB.PIX0114+551199999999520400005303986540410.005802BR5901N6001C62070503***6304E2CA',
  },
];

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans selection:bg-brand-neon selection:text-black">
      {/* Header Glassmorphism */}
      <header className="fixed w-full top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-neon blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-brand-surface to-black rounded-xl border border-white/20 flex items-center justify-center text-brand-neon font-bold text-xl shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                H
              </div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight group-hover:text-brand-neon transition-colors">HubStore</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#" className="hover:text-white hover:shadow-neon-hover transition-all duration-200">Produtos</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Sobre</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Contato</a>
          </nav>
          <button className="text-gray-400 hover:text-white md:hidden">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Glow Effects */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
        <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-brand-neon/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:border-brand-neon/30 transition-colors cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-brand-neon mr-3 animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider">Nova Coleção 2025</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-none">
            O Futuro do <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-neon to-white animate-gradient">Digital Commerce</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Explore nossa seleção exclusiva de produtos digitais e físicos. Pagamento instantâneo via PIX e entrega garantida.
          </p>
          
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-brand-neon hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]">
              Ver Catálogo
            </button>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="flex-grow container mx-auto px-4 py-12 relative z-10">
        <div className="flex items-end justify-between mb-12 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Destaques</h2>
            <p className="text-gray-500 text-sm">Produtos selecionados para você</p>
          </div>
          <a href="#" className="text-sm text-brand-neon hover:text-white transition-colors flex items-center gap-1 font-medium">
            Ver todos <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {PRODUCTS.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={setSelectedProduct} 
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-card/30 backdrop-blur-lg border-t border-white/5 mt-auto relative z-10">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-brand-primary to-brand-neon rounded flex items-center justify-center text-black font-bold text-xs">H</div>
                <span className="text-lg font-bold text-white">HubStore</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
                A plataforma definitiva para compras digitais seguras e rápidas.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="px-5 py-3 bg-black/40 border border-white/5 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-gray-300 tracking-wide">PIX AUTOMÁTICO</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} HubStore. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
};

export default App;
