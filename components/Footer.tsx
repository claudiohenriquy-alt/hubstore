
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-zinc-800 mt-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="flex items-center gap-3">
                         <div className="bg-black w-10 h-10 rounded-lg flex items-center justify-center border border-neon-blue/30 shadow-neon">
                            <span className="font-bold text-2xl text-neon-blue" style={{ textShadow: '0 0 8px #00BFFF' }}>H</span>
                        </div>
                        <span className="text-xl font-semibold text-white">HubStore</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs">
                        A plataforma definitiva para compras digitais seguras e rápidas.
                    </p>
                </div>
                <div className="mt-6 sm:mt-0">
                    <div className="inline-flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-gray-300 font-medium">PIX AUTOMÁTICO</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;