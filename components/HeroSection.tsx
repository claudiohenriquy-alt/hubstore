
import React from 'react';
import { Page } from '../App';

interface HeroSectionProps {
    navigateTo: (page: Page) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ navigateTo }) => {
    return (
        <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
             {/* Background with overlay */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/022/106/533/large_2x/dark-black-and-blue-abstract-background-with-scratches-and-cracks-grunge-texture-with-a-gradient-for-your-design-vector.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
            </div>

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
                <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-sm font-semibold tracking-wide">
                    NOVA COLEÇÃO 2025
                </div>
                
                <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
                    O Futuro do <br />
                    <span className="text-neon-blue" style={{ textShadow: '0 0 20px rgba(30, 144, 255, 0.5)' }}>Digital Commerce</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Explore nossa seleção exclusiva de produtos digitais e físicos. Pagamento instantâneo via PIX e entrega garantida.
                </p>
                
                <button
                    onClick={() => navigateTo('products')}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-neon-blue font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(30,144,255,0.6)]"
                >
                    Ver Catálogo
                </button>
            </div>
        </section>
    );
};

export default HeroSection;
