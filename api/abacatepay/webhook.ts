// /api/abacatepay/webhook.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

/**
 * Chave pública da AbacatePay (exemplo da doc).
 * Em produção, mantenha esta chave em env var se for necessária.
 */
const ABACATEPAY_PUBLIC_KEY =
  process.env.ABACATEPAY_PUBLIC_KEY ||
  "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

/**
 * Helper para verificar HMAC-SHA256 (base64) conforme docs AbacatePay.
 */
function verifyAbacateSignature(rawBody: string, signatureFromHeader?: string) {
  if (!signatureFromHeader) return false;
  const bodyBuffer = Buffer.from(rawBody, "utf8");

  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(bodyBuffer)
    .digest("base64");

  const A = Buffer.from(expectedSig);
  const B = Buffer.from(signatureFromHeader);

  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

/**
 * IMPORTANTE: Vercel/Next.js - precisamos do rawBody para validar HMAC.
 * Desabilite bodyParser para este endpoint (veja export config abaixo).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) validar secret pela query string (conforme docs AbacatePay)
  const incomingSecret = (req.query?.webhookSecret as string) || null;
  const MY_SECRET = process.env.WEBHOOK_SECRET;

  if (!incomingSecret || incomingSecret !== MY_SECRET) {
    console.log("❌ Secret inválido no webhook");
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  // 2) ler rawBody (sem parser)
  const rawBuffer: Buffer = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err) => reject(err));
  });

  const rawBody = rawBuffer.toString("utf8");

  // 3) validar assinatura HMAC no header X-Webhook-Signature
  const signature = req.headers["x-webhook-signature"] as string | undefined;
  if (!verifyAbacateSignature(rawBody, signature)) {
    console.log("❌ Assinatura HMAC inválida");
    return res.status(401).json({ error: "Invalid HMAC signature" });
  }

  // 4) parse do body para JSON (já validado)
  let body: any = {};
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    console.log("⚠️ Erro ao parsear body do webhook:", err);
    return res.status(400).json({ error: "Bad request body" });
  }

  const event = body?.event;
  console.log("🔔 Evento recebido:", event);

  if (event === "billing.paid") {
    // Exemplo de leitura conforme doc:
    // body.data.payment.amount, body.data.pixQrCode, etc.
    const amount = body?.data?.payment?.amount;
    const method = body?.data?.payment?.method;
    const eventId = body?.id; // id do log/evento (útil para idempotência)

    console.log("📦 Pagamento confirmado:", { eventId, amount, method });

    // TODO: localizar o pedido (reference_id) — depende de como o gateway retorna reference_id.
    // Se você incluiu reference_id no payload de create-payment, ele pode aparecer em:
    // body.data?.payment?.reference_id  OU body?.data?.reference_id  OU body?.metadata?.reference_id
    // Ajuste conforme a resposta real do AbacatePay. Exemplo:
    const referenceId =
      body?.data?.payment?.reference_id ||
      body?.data?.reference_id ||
      body?.metadata?.reference_id ||
      null;

    if (!referenceId) {
      console.log("⚠️ Nenhum reference_id encontrado — verifique create-payment payload e a resposta do gateway.");
      // você pode optar por retornar 200 e tratar manualmente, ou retornar 400 para sinalizar problema
      return res.status(400).json({ error: "Missing reference_id" });
    }

    // Aqui: marcar pedido como pago no DB, liberar download/enviar e-mail, etc.
    // Ex: await markOrderPaid(referenceId, { amount, method, gatewayEventId: eventId });

    console.log(`✅ Pedido ${referenceId} liberado (simulado).`);
  } else {
    console.log("Evento não tratado:", event);
  }

  return res.status(200).json({ ok: true });
}

/**
 * Necessário para obter rawBody no Vercel/Next:
 * Desativa o bodyParser do Next para este endpoint.
 */
export const config = {
  api: {
    bodyParser: false,
  },
};