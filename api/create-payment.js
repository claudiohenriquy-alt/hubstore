// /api/create-payment.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

const PRODUCTS = {
  "product-001": {
    id: "product-001",
    title: "Produto Teste Hubstore",
    price_cents: 1500,
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productId, customerEmail } = req.body;

  if (!productId || !PRODUCTS[productId]) {
    return res.status(400).json({ error: "Invalid productId" });
  }

  if (!customerEmail) {
    return res.status(400).json({ error: "customerEmail required" });
  }

  const HOST = process.env.HOST || "https://hubstore-theta.vercel.app";
  const webhookSecret = process.env.WEBHOOK_SECRET;

  const product = PRODUCTS[productId];
  const orderId = generateOrderId();

  // URL do webhook
  const webhookUrl = `${HOST}/api/abacatepay/webhook?webhookSecret=${webhookSecret}`;

  const payload = {
    amount: product.price_cents,
    description: product.title,
    metadata: {
      reference_id: orderId,
      product_id: product.id,
      customer_email: customerEmail
    },
    callbackUrl: webhookUrl,
  };

  const resp = await fetch("https://api.abacatepay.com/billing/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await resp.json();

  if (json.error) {
    console.error("Erro ao criar cobrança:", json.error);
    return res.status(500).json({ error: json.error });
  }

  // URL para o cliente pagar
  const paymentUrl = json.data?.url;

  return res.status(200).json({
    ok: true,
    orderId,
    product,
    paymentUrl,
  });
}