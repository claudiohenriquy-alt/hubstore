import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="flex justify-between items-center py-5">
            <a href="/" className="flex items-center gap-3 cursor-pointer" aria-label="HubStore Home">
                <div className="bg-black w-10 h-10 rounded-lg flex items-center justify-center border border-neon-blue/30 shadow-neon">
                    <span className="font-bold text-2xl text-neon-blue" style={{ textShadow: '0 0 8px #00BFFF' }}>H</span>
                </div>
                <span className="text-xl font-semibold text-white">HubStore</span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-gray-400 font-medium">
                <a href="#produtos" className="hover:text-white transition-colors">Produtos</a>
                <a href="#" className="hover:text-white transition-colors">Sobre</a>
                <a href="#" className="hover:text-white transition-colors">Contato</a>
            </nav>
        </header>
    );
};

export default Header;