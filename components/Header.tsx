
import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Page } from '../App';

interface HeaderProps {
    navigateTo: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleNavigation = (page: Page) => {
        navigateTo(page);
        setIsMenuOpen(false);
    };

    return (
        <header className="sticky top-0 bg-black/90 backdrop-blur-md z-50 transition-all duration-300 border-b border-white/5">
            <div className="flex flex-col">
                <div className="flex justify-between items-center py-5">
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); handleNavigation('home'); }}
                        className="flex items-center gap-3 cursor-pointer"
                        aria-label="HubStore Home"
                    >
                        <div className="bg-black w-10 h-10 rounded-lg flex items-center justify-center border border-neon-blue/30 shadow-neon">
                            <span className="font-bold text-2xl text-neon-blue" style={{ textShadow: '0 0 8px #00BFFF' }}>H</span>
                        </div>
                        <span className="text-xl font-semibold text-white">HubStore</span>
                    </a>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 text-gray-400 font-medium">
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); navigateTo('products'); }}
                            className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                            Produtos
                            <ChevronDown size={16} />
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('about'); }} className="hover:text-white transition-colors">Sobre</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('contact'); }} className="hover:text-white transition-colors">Contato</a>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden text-gray-300 hover:text-white focus:outline-none p-1"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Abrir menu"
                    >
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <nav className="md:hidden flex flex-col gap-2 pb-6 animate-fade-in border-t border-zinc-800 pt-4">
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleNavigation('products'); }}
                            className="text-lg font-medium text-gray-300 hover:text-neon-blue hover:bg-white/5 px-4 py-3 rounded-lg transition-all flex items-center justify-between"
                        >
                            Produtos
                        </a>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleNavigation('about'); }}
                            className="text-lg font-medium text-gray-300 hover:text-neon-blue hover:bg-white/5 px-4 py-3 rounded-lg transition-all"
                        >
                            Sobre
                        </a>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleNavigation('contact'); }}
                            className="text-lg font-medium text-gray-300 hover:text-neon-blue hover:bg-white/5 px-4 py-3 rounded-lg transition-all"
                        >
                            Contato
                        </a>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;
