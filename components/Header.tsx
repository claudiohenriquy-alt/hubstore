
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Page } from '../App';

interface HeaderProps {
    navigateTo: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ navigateTo }) => {
    return (
        <header className="flex justify-between items-center py-5 sticky top-0 bg-black/80 backdrop-blur-md z-40">
            <a
                href="#"
                onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
                className="flex items-center gap-3 cursor-pointer"
                aria-label="HubStore Home"
            >
                <div className="bg-black w-10 h-10 rounded-lg flex items-center justify-center border border-neon-blue/30 shadow-neon">
                    <span className="font-bold text-2xl text-neon-blue" style={{ textShadow: '0 0 8px #00BFFF' }}>H</span>
                </div>
                <span className="text-xl font-semibold text-white">HubStore</span>
            </a>
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
        </header>
    );
};

export default Header;
