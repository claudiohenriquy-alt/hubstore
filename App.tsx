import React, { useState } from 'react';
import { Product } from './types';
import { PRODUCTS } from './constants';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import HeroBlackFriday from "./components/HeroBlackFriday.tsx";

const App: React.FC = () => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const openModal = (product: Product) => {
        setSelectedProduct(product);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 antialiased">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Header />
            </div>
            
            <main>
                <HeroBlackFriday />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Destaques Section */}
                    <section id="produtos" className="py-20">
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
                </div>
            </main>
            
            <Footer />
            
            {selectedProduct && <ProductModal product={selectedProduct} onClose={closeModal} />}
        </div>
    );
};

export default App;