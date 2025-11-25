
import React, { useEffect, useState } from "react";
import { Page } from "../App";

const SALE_END = "2025-12-01T23:59:59-03:00";

function getTimeRemaining(targetIso: string) {
  const total = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

interface HeroBlackFridayProps {
  navigateTo: (page: Page) => void;
}

export default function HeroBlackFriday({ navigateTo }: HeroBlackFridayProps) {
  const [time, setTime] = useState(getTimeRemaining(SALE_END));
  useEffect(() => {
    const t = setInterval(() => {
      setTime(getTimeRemaining(SALE_END));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="hero-blackfriday"
      className="relative w-full min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/022/106/533/large_2x/dark-black-and-blue-abstract-background-with-scratches-and-cracks-grunge-texture-with-a-gradient-for-your-design-vector.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      
      {/* Neon Glow Container */}
      <div className="relative p-1.5 rounded-[28px] animate-border-glow w-full max-w-6xl">
        {/* Main Card */}
        <div className="relative bg-black/80 rounded-3xl p-6 md:p-10 border-2 border-black">
          {/* Black Friday Badge */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 md:-top-7">
            <div className="bg-black px-6 py-3 rounded-xl border-2 border-neon-purple shadow-neon-purple">
                <span className="text-white text-lg md:text-2xl font-bold tracking-widest">BLACK FRIDAY</span>
            </div>
          </div>
          
          <div className="pt-16 md:pt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Info */}
            <div className="flex flex-col justify-center text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                A Maior Black Friday de <span className="text-white/80">Produtos Digitais</span>
              </h2>
              <p className="mt-4 text-gray-300">
                Promoções por tempo limitado — Pagamento instantâneo via PIX — Entrega automática por e-mail.
              </p>

              <h1 className="mt-8 text-5xl md:text-7xl font-extrabold text-white leading-tight">
                O Futuro do <br /><span className="text-neon-cyan" style={{ textShadow: '0 0 12px #00FFFF' }}>Digital</span> Commerce
              </h1>
              <p className="mt-4 text-gray-400 max-w-lg mx-auto lg:mx-0">
                Aproveite descontos incríveis em ferramentas de automação, listas de fornecedores e catálogos premium. Promoção por tempo limitado — garanta já o seu.
              </p>
              
              {/* Countdown */}
              <div className="mt-8 mx-auto lg:mx-0 p-1 rounded-2xl bg-gradient-to-r from-neon-purple to-neon-cyan">
                <div className="inline-flex items-center gap-2 md:gap-3 bg-black/80 p-2 md:p-3 rounded-xl">
                  {Object.entries({ Dias: time.days, Horas: time.hours, Min: time.minutes, Seg: time.seconds }).map(([label, value]) => (
                     <div key={label} className="text-center px-2 md:px-3">
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {String(value).padStart(2, "0")}
                        </div>
                        <div className="text-xs text-gray-400">{label}</div>
                      </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Offer */}
            <div className="flex items-center justify-center">
                <div className="w-full max-w-sm flex flex-col items-center text-center p-6 bg-black/40 rounded-3xl border-2 border-white/10">
                    <div className="p-1 rounded-2xl bg-gradient-to-br from-neon-cyan to-blue-600">
                        <div className="flex items-center bg-black rounded-xl px-4 py-2 border-2 border-black">
                            <span className="text-white font-bold text-lg">Mega Oferta</span>
                            <div className="w-px h-6 bg-white/30 mx-3"></div>
                            <span className="text-neon-cyan font-extrabold text-3xl">90 <span className="text-lg">%</span></span>
                            <span className="text-white font-bold text-lg ml-1">OFF</span>
                        </div>
                    </div>
                    
                    <h3 className="mt-6 text-2xl font-bold text-white">Robo AI-Assist</h3>
                    <p className="text-gray-400">Automação - IA</p>
                    
                    <div className="my-4 flex flex-col items-center gap-1">
                        <p className="text-2xl font-semibold text-gray-500 line-through">R$ 99,90</p>
                        <p className="text-6xl font-extrabold text-neon-cyan" style={{ textShadow: '0 0 15px #00FFFF' }}>R$9,90</p>
                    </div>
                    
                    <button
                        onClick={() => navigateTo('products')}
                        className="w-full mt-2 px-6 py-4 rounded-2xl bg-black text-white font-bold text-xl border-2 border-neon-purple shadow-neon-purple hover:bg-neon-purple/20 transition-all duration-300"
                    >
                        Ver Ofertas
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}