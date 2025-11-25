// /api/create-payment.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";
import { PRODUCTS } from "../constants";

// FIX: Define an interface for the AbacatePay API response to provide type safety.
interface AbacatePayResponse {
  url: string;
  pix_details: any;
  [key: string]: any;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Este endpoint serve para criar cobranças dinâmicas (ex: PIX), 
  // embora o frontend atual use links de checkout diretos.
  const { productId, customerEmail, customerName } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "productId é obrigatório" });
  }

  const product = PRODUCTS.find(p => p.id === Number(productId));

  if (!product) {
    return res.status(404).json({ error: `Produto com id ${productId} não encontrado.` });
  }

  const amountInCents = Math.round(product.price * 100);
  const orderReference = `hubstore_${product.id}_${Date.now()}`;
  const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  const payload = {
    amount: amountInCents,
    description: `Pagamento para: ${product.title}`,
    customer: {
        name: customerName || "Cliente HubStore",
        email: customerEmail,
    },
    products: [{
        id: String(product.id),
        quantity: 1,
        price: amountInCents,
        name: product.title
    }],
    metadata: {
      reference_id: orderReference,
      product_id: product.id, // Passa o ID do nosso sistema
      customer_email: customerEmail
    },
    successUrl: `${host}/success.html`,
    cancelUrl: `${host}/`,
    // O webhook será configurado no painel do AbacatePay, não aqui.
  };

  const ABACATEPAY_API_URL = process.env.ABACATEPAY_API_URL || "https://api.abacatepay.com/v1/billings";
  const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY;

  if (!ABACATEPAY_API_KEY) {
    console.error("Chave da API do AbacatePay não configurada.");
    return res.status(500).json({ error: "Gateway de pagamento não configurado." });
  }

  try {
    const response = await fetch(ABACATEPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ABACATEPAY_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    // FIX: Cast the JSON response to the defined interface to fix property access errors.
    const data = await response.json() as AbacatePayResponse;

    if (!response.ok) {
      console.error("Erro do AbacatePay:", data);
      return res.status(502).json({ error: "Erro ao criar cobrança no gateway.", details: data });
    }

    return res.status(200).json({ success: true, checkoutUrl: data.url, pixDetails: data.pix_details, gatewayResponse: data });

  } catch (error) {
    console.error("Erro interno no create-payment:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
}