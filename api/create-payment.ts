// /api/create-payment.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ORDERS_FILE = path.join("/tmp", "hubstore_orders.json");

// PRODUCTS: mapeie productId -> externalId, price etc.
const PRODUCTS: Record<string, { id: string; externalId: string; title: string; price_cents: number; file: string }> = {
  "product-001": {
    id: "product-001",
    externalId: "prod_uuZ6PQFFPDcnJyeTmhaptcwd", // externalId que a AbacatePay irá devolver no webhook
    title: "TubeViews – YouTube Booster",
    price_cents: 990, // em centavos
    file: "file:///mnt/data/e6058c8c-4a0c-4e58-9c1a-ffadeb195380.png",
  }
};

function generateOrderId() {
  const now = Date.now().toString(36);
  const rand = crypto.randomBytes(3).toString("hex");
  return `order_${now}_${rand}`;
}

function readOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return {};
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "{}");
  } catch {
    return {};
  }
}

function saveOrderObj(obj: any) {
  const cur = readOrders();
  cur[obj.orderId] = obj;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(cur, null, 2));
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

    // salvar pedido local (teste)
    const orderObj = {
      orderId,
      productId,
      product,
      customerEmail,
      customerName: customerName || null,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    saveOrderObj(orderObj);

    // URLs e webhook
    const HOST = process.env.HOST || "https://hubstore-theta.vercel.app";
    const webhookUrl = `${HOST}/api/abacatepay/webhook?webhookSecret=${process.env.WEBHOOK_SECRET}`;

    // Payload conforme doc: enviar products com externalId (importantíssimo)
    const payload = {
      amount: product.price_cents,
      description: product.title,
      // products: array conforme doc; incluir externalId para reconciliação
      products: [
        {
          id: product.id,
          externalId: product.externalId,
          quantity: 1,
          price: product.price_cents,
          name: product.title
        }
      ],
      metadata: {
        // incluímos reference_id por segurança, algumas respostas podem trazer metadata
        reference_id: orderId,
        product_id: product.id,
        customer_email: customerEmail
      },
      callbackUrl: webhookUrl,
      successUrl: `${HOST}/checkout/success?order=${orderId}`,
      cancelUrl: `${HOST}/checkout/cancel?order=${orderId}`
    };

    const ABACATEPAY_API_URL = process.env.ABACATEPAY_API_URL || "https://api.abacatepay.com/billing/create";
    const ABACATEPAY_API_KEY = process.env.ABACATEPAY_API_KEY || "";

    if (!ABACATEPAY_API_KEY) {
      console.warn("ABACATEPAY_API_KEY não definido nas env vars");
      return res.status(500).json({ error: "gateway_not_configured" });
    }

    const resp = await fetch(ABACATEPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const respJson = await resp.json();

    if (!resp.ok) {
      console.error("Erro ao criar cobrança no AbacatePay:", resp.status, respJson);
      return res.status(502).json({ error: "bad_gateway", details: respJson });
    }

    // A resposta costuma ter data.url conforme doc
    const paymentUrl = respJson?.data?.url || respJson?.data?.payment_url || null;

    return res.status(200).json({
      ok: true,
      orderId,
      product,
      gateway: respJson,
      paymentUrl
    });
  } catch (err) {
    console.error("Erro no create-payment:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
