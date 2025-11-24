// /api/abacatepay/webhook.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { PRODUCTS_BY_EXTERNAL } from "./products";

export const config = { api: { bodyParser: false } };

const MY_SECRET = process.env.WEBHOOK_SECRET || "";
const ABACATEPAY_PUBLIC_KEY = process.env.ABACATEPAY_PUBLIC_KEY || "";

function verifyHmacIfConfigured(rawBuffer: Buffer, signature?: string) {
  if (!ABACATEPAY_PUBLIC_KEY) return true; // pular HMAC em dev se não definida
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", ABACATEPAY_PUBLIC_KEY).update(rawBuffer).digest("base64");
  const A = Buffer.from(expected, "utf8");
  const B = Buffer.from(signature, "utf8");
  if (A.length !== B.length) return false;
  try { return crypto.timingSafeEqual(A, B); } catch { return false; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) validar secret (query string preferencial)
  const incomingSecretQs = (req.query?.webhookSecret as string) || "";
  const incomingSecretHeader = (req.headers["x-webhook-secret"] as string) || (req.headers["x-secret"] as string) || "";
  if (!(incomingSecretQs === MY_SECRET || incomingSecretHeader === MY_SECRET)) {
    console.log("❌ Secret inválido. qs:", incomingSecretQs, "hdr:", incomingSecretHeader);
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  // 2) ler raw body
  const rawBuffer: Buffer = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", c => chunks.push(Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", e => reject(e));
  });

  // 3) validar HMAC se configurada
  const signatureHeader = (req.headers["x-webhook-signature"] as string) || (req.headers["X-Webhook-Signature"] as string);
  if (!verifyHmacIfConfigured(rawBuffer, signatureHeader)) {
    console.log("❌ Assinatura HMAC inválida (ou ABACATEPAY_PUBLIC_KEY incorreta)");
    return res.status(401).json({ error: "Invalid HMAC signature" });
  }

  // 4) parse do body
  let body: any;
  try {
    body = JSON.parse(rawBuffer.toString("utf8"));
  } catch (err) {
    console.log("⚠️ Erro ao parsear body do webhook:", err);
    return res.status(400).json({ error: "Bad request body" });
  }

  const event = body?.event;
  console.log("🔔 Evento recebido:", event);

  if (event === "billing.paid") {
    const productsArray = body?.data?.billing?.products || [];
    if (!Array.isArray(productsArray) || productsArray.length === 0) {
      console.log("⚠️ Nenhum produto encontrado no billing:", JSON.stringify(body).slice(0, 500));
      return res.status(400).json({ error: "No products in billing" });
    }

    const firstProduct = productsArray[0];
    const externalId = firstProduct?.externalId || firstProduct?.external_id || null;
    if (!externalId) {
      console.log("⚠️ externalId ausente no produto:", JSON.stringify(firstProduct));
      return res.status(400).json({ error: "Missing externalId" });
    }

    console.log("ExternalId recebido:", externalId);

    const item = PRODUCTS_BY_EXTERNAL[externalId];
    if (!item) {
      console.log("Produto não mapeado para externalId:", externalId);
      return res.status(404).json({ error: "Product not found" });
    }

    // Aqui: lógica para liberar produto (envio de e-mail / gerar link protegido / registro DB)
    // Exemplo simples: retornar o link do Google Drive para teste
    console.log("✔️ Produto liberado:", item.title, item.file);

    // Opcional: marque pedido como pago no arquivo / DB se tiver metadata.reference_id
    // (omitir lógica de DB aqui por simplicidade)

    return res.status(200).json({ ok: true, delivered: item.file });
  }

  return res.status(200).json({ ok: true, note: "Event ignored" });
}