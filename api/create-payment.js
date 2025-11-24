// /api/create-payment.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

/**
 * PRODUCTS (exemplo minimal)
 * Em produção troque `file:` por uma URL pública (CDN/S3).
 */
const PRODUCTS: Record<string, { id: string; title: string; price_cents: number; currency: string; file: string }> = {
  "product-001": {
    id: "product-001",
    title: "Produto Teste Hubstore",
    price_cents: 1500, // R$15,00 (centavos)
    currency: "BRL",
    file: "file:///mnt/data/e6058c8c-4a0c-4e58-9c1a-ffadeb195380.png",
  },
};

function generateOrderId() {
  const now = Date.now().toString(36);
  const rand = crypto.randomBytes(3).toString("hex");
  return `order_${now}_${rand}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { productId, customerEmail, customerName } = req.body || {};

    if (!productId || !PRODUCTS[productId]) {
      return res.status(400).json({ error: "productId inválido" });
    }
    if (!customerEmail) {
      return res.status(400).json({ error: "customerEmail obrigatório" });
    }

    const product = PRODUCTS[productId];
    const orderId = generateOrderId();

    const HOST = process.env.HOST || "https://hubstore-theta.vercel.app";
    const successUrl = `${HOST}/checkout/success?order=${orderId}`;
    const cancelUrl = `${HOST}/checkout/cancel?order=${orderId}`;
    const webhookUrl = `${HOST}/api/abacatepay/webhook?webhookSecret=${process.env.WEBHOOK_SECRET}`;

    // Ajuste os campos abaixo conforme a docs exata do AbacatePay; isso é um payload genérico
    const payload = {
      amount: product.price_cents,
      currency: product.currency,
      reference_id: orderId,
      customer: {
        email: customerEmail,
        name: customerName || null,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      callback_url: webhookUrl,
      metadata: {
        product_id: product.id,
        product_title: product.title,
      },
    };

    const ABACATEPAY_API_URL = process.env.ABACATEPAY_API_URL || "https://api.abacatepay.placeholder/payments";
    const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || "";

    if (!ABACATEPAY_API_KEY) {
      console.warn("ABACATEPAY_API_KEY não definido");
      return res.status(500).json({ error: "gateway_not_configured" });
    }

    const resp = await fetch(ABACATEPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Erro ao criar pagamento no AbacatePay:", resp.status, text);
      return res.status(502).json({ error: "bad_gateway", details: text });
    }

    const respJson = await resp.json();

    // Tente obter payment URL nos campos comuns (ajuste conforme resposta real do gateway)
    const paymentUrl = respJson.payment_url || respJson.data?.payment_url || respJson.checkout_url || null;

    // TODO: Salvar pedido em DB real (orderId, productId, customerEmail, gatewayResponse, status: pending)
    // Ex: await saveOrder({ orderId, productId, customerEmail, status: 'pending', gateway_response: respJson })

    return res.status(200).json({
      ok: true,
      orderId,
      product,
      gateway: respJson,
      paymentUrl,
    });
  } catch (err) {
    console.error("Erro no create-payment:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}