
import React from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';
import HeroSection from "../components/HeroSection";
import { Page } from '../App';
import GuaranteeSection from '../components/GuaranteeSection';

interface HomePageProps {
    navigateTo: (page: Page) => void;
    openModal: (product: Product) => void;
}

const HomePage: React.FC<HomePageProps> = ({ navigateTo, openModal }) => {
    return (
        <>
            <HeroSection navigateTo={navigateTo} />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <section id="produtos" className="py-20">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-4xl font-bold text-white tracking-tighter">Destaques</h2>
                            <p className="text-gray-400 mt-1">Produtos selecionados para você</p>
                        </div>
                        <a 
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigateTo('products');
                            }}
                            className="text-neon-blue hover:text-white transition-colors hidden sm:inline-block"
                        >
                            Ver todos &rarr;
                        </a>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {PRODUCTS.slice(0, 4).map((product, index) => (
                           <div key={product.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 100 + 600}ms`, animationFillMode: 'backwards' }}>
                                <ProductCard product={product} onSelect={openModal} />
                            </div>
                        ))}
                    </div>
                </section>
                <GuaranteeSection />
            </div>
        </>
    );
};

export default HomePage;
