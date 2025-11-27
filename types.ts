
export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number; // Price in BRL
  images: string[];
  // Campo para código PIX manual (Copia e Cola)
  pixCode?: string; 
  // Campo para link de checkout externo (AbacatePay link direto)
  checkoutUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  checkout_url?: string;
  pix_qr_code?: string;
  pix_payload?: string;
  expires_at?: string;
  error?: string;
}

export interface PaymentRequest {
  method: 'pix' | 'card';
  product: Product;
}
