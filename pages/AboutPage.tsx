
import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

const AboutPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <section id="sobre" className="max-w-4xl mx-auto text-gray-300">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">HubStore — Inspiração Digital.</h1>
                    <p className="text-lg text-gray-400 mt-2">Tecnologia que Impulsiona.</p>
                </div>

                <div className="space-y-8 text-lg leading-relaxed text-gray-400">
                    <p className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                        Na HubStore, acreditamos que o futuro pertence a quem sabe utilizar ferramentas digitais de forma inteligente. Por isso, reunimos um ecossistema completo de soluções premium, criadas para elevar sua produtividade, acelerar resultados e transformar a forma como você atua no digital.
                    </p>
                    <p className="animate-slide-in-up" style={{ animationDelay: '300ms' }}>
                        Somos uma plataforma especializada em produtos digitais de alto desempenho, incluindo automações, sistemas profissionais, kits estratégicos e ferramentas avançadas para redes sociais, negócios e marketing.
                    </p>
                    <p className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                        Cada item disponível em nossa plataforma passa por curadoria e organização detalhada para garantir uma experiência simples, elegante e eficiente.
                    </p>
                </div>

                <div className="mt-16 animate-slide-in-up" style={{ animationDelay: '500ms' }}>
                    <h2 className="text-3xl font-bold text-white text-center mb-8">Nossa Essência</h2>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <Sparkles className="text-neon-cyan w-6 h-6 mt-1 flex-shrink-0" />
                            <span><b className="text-white">Inovação acessível</b> – Ferramentas poderosas por valores que cabem no seu bolso.</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <Sparkles className="text-neon-cyan w-6 h-6 mt-1 flex-shrink-0" />
                            <span><b className="text-white">Entrega instantânea</b> – Receba seu produto imediatamente após o pagamento.</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <Sparkles className="text-neon-cyan w-6 h-6 mt-1 flex-shrink-0" />
                            <span><b className="text-white">Experiência premium</b> – Design, organização e suporte cuidadosamente pensados.</span>
                        </li>
                        <li className="flex items-start gap-4">
                            <Sparkles className="text-neon-cyan w-6 h-6 mt-1 flex-shrink-0" />
                            <span><b className="text-white">Digital sem limites</b> – Liberdade para crescer no seu ritmo, com tecnologia como aliada.</span>
                        </li>
                    </ul>
                </div>
                
                <div className="mt-16 animate-slide-in-up" style={{ animationDelay: '600ms' }}>
                    <h2 className="text-3xl font-bold text-white text-center mb-8">Nossa Missão</h2>
                    <p className="text-center text-xl italic text-gray-300 max-w-3xl mx-auto border-l-4 border-neon-blue pl-6">
                        Transformar conhecimento e tecnologia em produtos digitais úteis, inteligentes e acessíveis — ajudando pessoas e empresas a alcançarem seu máximo potencial no ambiente digital.
                    </p>
                </div>

                <div className="mt-16 animate-slide-in-up" style={{ animationDelay: '700ms' }}>
                    <h2 className="text-3xl font-bold text-white text-center mb-8">Por que a HubStore é diferente?</h2>
                     <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        <li className="flex items-center gap-4">
                            <CheckCircle className="text-green-400 w-6 h-6 flex-shrink-0" />
                            <span className="text-gray-300">Interface moderna e experiência fluida</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <CheckCircle className="text-green-400 w-6 h-6 flex-shrink-0" />
                            <span className="text-gray-300">Produtos organizados por categoria e objetivo</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <CheckCircle className="text-green-400 w-6 h-6 flex-shrink-0" />
                            <span className="text-gray-300">Materiais de alta qualidade e utilidade real</span>
                        </li>
                        <li className="flex items-center gap-4">
                            <CheckCircle className="text-green-400 w-6 h-6 flex-shrink-0" />
                            <span className="text-gray-300">Suporte humano e direto</span>
                        </li>
                         <li className="flex items-center gap-4">
                            <CheckCircle className="text-green-400 w-6 h-6 flex-shrink-0" />
                            <span className="text-gray-300">Transparência, rapidez e compromisso</span>
                        </li>
                    </ul>
                </div>

                <p className="text-center text-xl font-semibold text-white mt-16 animate-slide-in-up" style={{ animationDelay: '800ms' }}>
                    HubStore. Tecnologia premium ao seu alcance.
                </p>

            </section>
        </div>
    );
};

export default AboutPage;
