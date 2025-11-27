
import React from 'react';
import { Mail, Clock, ShieldCheck } from 'lucide-react';

const ContactPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-fade-in">
            <section id="contato" className="max-w-4xl mx-auto text-gray-300">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">Precisa de ajuda?</h1>
                    <p className="text-lg text-gray-400 mt-2">Estamos aqui para você.</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
                    <p className="text-center text-lg leading-relaxed text-gray-400 mb-10">
                        Nosso time está preparado para oferecer suporte rápido, objetivo e direto ao ponto. Seja para dúvidas, problemas no download, pagamentos ou orientações gerais, fale conosco.
                    </p>

                    <div className="space-y-8">
                        {/* E-mail de Suporte */}
                        <div className="flex flex-col sm:flex-row items-start gap-6 bg-black/30 p-6 rounded-xl border border-zinc-700/50">
                            <div className="bg-neon-blue/10 text-neon-blue p-3 rounded-full border border-neon-blue/20">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">E-mail de suporte oficial</h3>
                                <a 
                                    href="mailto:suportehubstore.digital@gmail.com"
                                    className="text-lg text-neon-blue hover:underline"
                                >
                                    suportehubstore.digital@gmail.com
                                </a>
                                <p className="text-sm text-gray-500 mt-1">Clique no e-mail para nos enviar uma mensagem diretamente.</p>
                            </div>
                        </div>

                        {/* Horário de Atendimento */}
                         <div className="flex flex-col sm:flex-row items-start gap-6 bg-black/30 p-6 rounded-xl border border-zinc-700/50">
                            <div className="bg-gray-500/10 text-gray-300 p-3 rounded-full border border-gray-500/20">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Horário de Atendimento</h3>
                                <p className="text-lg text-gray-400">Segunda a Sexta: 08h às 18h</p>
                                <p className="text-lg text-gray-400">Sábados: 09h às 13h</p>
                            </div>
                        </div>

                        {/* Atendimento Seguro */}
                        <div className="flex flex-col sm:flex-row items-start gap-6 bg-black/30 p-6 rounded-xl border border-zinc-700/50">
                             <div className="bg-green-500/10 text-green-400 p-3 rounded-full border border-green-500/20">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white">Atendimento Seguro</h3>
                                <p className="text-lg text-gray-400">Todas as conversas são confidenciais. Garantimos retorno em até 24 horas úteis.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                 <p className="text-center text-xl font-semibold text-white mt-16 animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                    HubStore — Suporte premium. Respostas rápidas. Experiência impecável.
                </p>

            </section>
        </div>
    );
};

export default ContactPage;
