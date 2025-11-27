
import React from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';
import ProductCard from '../components/ProductCard';

interface ProductsPageProps {
    openModal: (product: Product) => void;
}

const ProductsPage: React.FC<ProductsPageProps> = ({ openModal }) => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <section id="todos-produtos" className="py-20">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-5xl font-bold text-white tracking-tighter">Nosso Catálogo</h1>
                    <p className="text-gray-400 mt-2 text-lg">Explore nossa coleção completa de soluções digitais.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {PRODUCTS.map((product, index) => (
                       <div key={product.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
                            <ProductCard product={product} onSelect={openModal} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProductsPage;
