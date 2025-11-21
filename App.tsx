
import React, { useState } from 'react';
import { Product } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

export type Page = 'home' | 'products' | 'about' | 'contact';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const navigateTo = (page: Page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0); // Garante que a nova página comece do topo
    };

    const openModal = (product: Product) => {
        setSelectedProduct(product);
    };

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const renderPage = () => {
        switch(currentPage) {
            case 'home':
                return <HomePage navigateTo={navigateTo} openModal={openModal} />;
            case 'products':
                return <ProductsPage openModal={openModal} />;
            case 'about':
                return <AboutPage />;
            case 'contact':
                return <ContactPage />;
            default:
                return <HomePage navigateTo={navigateTo} openModal={openModal} />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 antialiased">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Header navigateTo={navigateTo} />
            </div>
            
            <main>
                {renderPage()}
            </main>
            
            <Footer />
            
            {selectedProduct && <ProductModal product={selectedProduct} onClose={closeModal} />}
        </div>
    );
};

export default App;
