// /api/create-payment.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch"; // se o ambiente Vercel já tem fetch você pode remover esta linha
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PRODUCTS } from "./products";

const ORDERS_FILE = path.join("/tmp", "hubstore_orders.json");

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

  const { productId, customerEmail, customerName } = req.body || {};

  if (!productId || !PRODUCTS[productId]) {
    return res.status(400).json({ error: "productId inválido" });
  }
  if (!customerEmail) {
    return res.status(400).json({ error: "customerEmail obrigatório" });
  }

  const product = PRODUCTS[productId];
  const orderId = generateOrderId();

  // Salva pedido local para reconciliação (teste)
  const orderObj = {
    orderId,
    productId,
    externalId: product.externalId,
    product,
    customerEmail,
    customerName: customerName || null,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  saveOrderObj(orderObj);

  const HOST = process.env.HOST || "https://hubstore-theta.vercel.app";
  const webhookUrl = `${HOST}/api/abacatepay/webhook?webhookSecret=${process.env.WEBHOOK_SECRET}`;

  // Payload conforme doc AbacatePay — incluí products[*].externalId
  const payload = {
    amount: product.price_cents,
    description: product.title,
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

  try {
    const resp = await fetch(ABACATEPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ABACATEPAY_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const json = await resp.json();

    if (!resp.ok) {
      console.error("Erro ao criar cobrança no AbacatePay:", resp.status, json);
      return res.status(502).json({ error: "bad_gateway", details: json });
    }

    const paymentUrl = json?.data?.url || json?.data?.payment_url || null;

    return res.status(200).json({
      ok: true,
      orderId,
      product,
      gateway: json,
      paymentUrl
    });
  } catch (err) {
    console.error("Erro no create-payment:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}