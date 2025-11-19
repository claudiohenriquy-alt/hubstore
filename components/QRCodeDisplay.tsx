
import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
    pixData: {
        qr_base64: string;
        payload: string;
    };
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ pixData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (canvasRef.current && pixData.payload) {
            QRCode.toCanvas(canvasRef.current, pixData.payload, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#FFFFFF',
                    light: '#00000000'
                }
            }, (error) => {
                if (error) console.error("Erro ao gerar QR Code:", error);
            });
        }
    }, [pixData.payload]);
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixData.payload).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex flex-col items-center animate-fade-in text-center">
            <h3 className="text-lg font-semibold text-white">Pague com PIX</h3>
            <p className="text-gray-400 text-sm mb-4">Escaneie o QR Code com seu app do banco.</p>
            <div className="p-2 bg-white rounded-lg shadow-neon">
                 <canvas ref={canvasRef} />
            </div>
            <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 bg-zinc-700 text-white font-bold py-3 px-4 mt-4 rounded-lg transition-colors hover:bg-zinc-600"
            >
                {copied ? <Check size={20} className="text-green-400"/> : <Copy size={20} />}
                {copied ? 'Copiado!' : 'Copiar Código PIX'}
            </button>
        </div>
    );
};

export default QRCodeDisplay;
