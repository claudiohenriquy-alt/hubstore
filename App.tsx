
import React, { useState } from 'react';
import { Product } from './types';
import { PRODUCTS } from './constants';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';

const App: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const openModal = (product: Product) => {
        setSelectedProduct(product);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const handleScrollToCatalog = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const catalog = document.getElementById('destaques');
        if (catalog) {
            catalog.scrollIntoView({ behavior: 'smooth' });
        }
    }

    return (
        <div className="min-h-screen bg-black text-gray-200 antialiased">
            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,144,255,0.3),rgba(0,0,0,0))]"></div>
            
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <Header />
                <main>
                    {/* Hero Section */}
                    <section className="text-center flex flex-col items-center justify-center pt-24 pb-32 md:pt-32 md:pb-40">
                        <div className="inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-1.5 text-sm text-sky-300 mb-6 animate-fade-in">
                            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></span>
                            NOVA COLEÇÃO 2025
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight max-w-4xl animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                            O Futuro do <br/>
                            <span className="bg-gradient-to-r from-brand-blue to-neon-blue text-transparent bg-clip-text">
                                Digital Commerce
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                            Explore nossa seleção exclusiva de produtos digitais e físicos. Pagamento instantâneo via PIX e entrega garantida.
                        </p>
                        <a 
                            href="#destaques"
                            onClick={handleScrollToCatalog}
                            className="mt-10 bg-white text-black font-semibold py-3 px-8 rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/20 animate-slide-in-up"
                            style={{ animationDelay: '0.6s' }}
                        >
                            Ver Catálogo
                        </a>
                    </section>

                    {/* Destaques Section */}
                    <section id="destaques" className="py-20">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-4xl font-bold text-white tracking-tighter">Destaques</h2>
                                <p className="text-gray-400 mt-1">Produtos selecionados para você</p>
                            </div>
                            <a href="#" className="text-neon-blue hover:text-white transition-colors hidden sm:inline-block">
                                Ver todos &rarr;
                            </a>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {PRODUCTS.map((product, index) => (
                               <div key={product.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 100 + 600}ms`, animationFillMode: 'backwards' }}>
                                    <ProductCard product={product} onSelect={openModal} />
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
            {selectedProduct && <ProductModal product={selectedProduct} onClose={closeModal} />}
        </div>
    );
};

export default App;
