import React from 'react';
import { ShieldCheck, Award, Lock, CheckCircle } from 'lucide-react';

const GuaranteeSection: React.FC = () => {
    const features = [
        'Pagamento 100% seguro e criptografado',
        'Processamento imediato após confirmação',
        'Suporte especializado 24/7',
        'Reembolso rápido e sem burocracia',
    ];

    return (
        <section id="garantia" className="py-20 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold text-green-400 tracking-tight">
                    GARANTIA TOTAL
                </h2>
                <p className="mt-2 text-lg text-gray-400">
                    Sua compra está 100% protegida e segura
                </p>
            </div>

            <div className="mt-12 max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-10 text-center">
                <img
                    src="https://blog.mundolipedema.com.br/wp-content/uploads/2022/06/certificado2-1024x1024.png"
                    alt="Selo de 7 dias de garantia"
                    className="mx-auto h-36 w-36 sm:h-40 sm:w-40 mb-6"
                />

                <h3 className="text-3xl font-bold text-green-500">
                    7 DIAS DE GARANTIA
                </h3>
                <p className="mt-4 text-gray-400 max-w-md mx-auto">
                    Se por qualquer motivo você não ficar satisfeito com o conteúdo, devolvemos 100% do seu dinheiro em até 7 dias.
                </p>

                <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-300">
                    <div className="flex items-center justify-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-gray-400" />
                        <span className="font-semibold">Compra Segura</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <Award className="w-6 h-6 text-gray-400" />
                        <span className="font-semibold">Satisfação Garantida</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                        <Lock className="w-6 h-6 text-gray-400" />
                        <span className="font-semibold">Privacidade Protegida</span>
                    </div>
                </div>

                <div className="border-t border-zinc-800 pt-8">
                    <ul className="space-y-4 text-left max-w-md mx-auto">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-4">
                                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                                <span className="text-gray-300">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default GuaranteeSection;
