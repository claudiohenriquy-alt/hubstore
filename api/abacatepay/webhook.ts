// /api/abacatepay/webhook.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import fs from "fs";
import path from "path";

/**
 * CONFIGURAÇÕES / PRODUCTS (EXEMPLO)
 * Produto usa o arquivo que você enviou localmente (substitua por URL pública em produção).
 */
const PRODUCTS: Record<string, { id: string; title: string; file: string }> = {
  "product-001": {
    id: "product-001",
    title: "Produto Teste Hubstore",
    // caminho local conforme arquivo que você enviou:
    file: "file:///mnt/data/e6058c8c-4a0c-4e58-9c1a-ffadeb195380.png",
  },
};

// SendGrid (opcional)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Chave pública para HMAC (pode vir de env var)
const ABACATEPAY_PUBLIC_KEY = process.env.ABACATEPAY_PUBLIC_KEY || "<COLE_AQUI_A_PUBLIC_KEY_DA_DOC>";

/** Idempotência simples em memória - use DB em produção */
const processedEvents = new Set<string>();

function verifyAbacateSignature(rawBody: string, signatureFromHeader?: string) {
  if (!signatureFromHeader) return false;
  const bodyBuffer = Buffer.from(rawBody, "utf8");

  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(bodyBuffer)
    .digest("base64");

  const A = Buffer.from(expectedSig);
  const B = Buffer.from(signatureFromHeader);

  // timingSafeEqual lança se tamanhos diferentes, então checamos comprimento antes
  if (A.length !== B.length) return false;
  return crypto.timingSafeEqual(A, B);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) validar webhook secret via query string (conforme doc AbacatePay)
  const incomingSecret = (req.query?.webhookSecret as string) || null;
  const MY_SECRET = process.env.WEBHOOK_SECRET;
  if (!incomingSecret || incomingSecret !== MY_SECRET) {
    console.log("❌ Secret inválido no webhook");
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  // 2) ler raw body (importante para HMAC)
  const rawBuffer: Buffer = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err) => reject(err));
  });
  const rawBody = rawBuffer.toString("utf8");

  // 3) validar assinatura HMAC
  const signatureHeader = (req.headers["x-webhook-signature"] as string) || (req.headers["X-Webhook-Signature"] as string);
  if (!verifyAbacateSignature(rawBody, signatureHeader)) {
    console.log("❌ Assinatura HMAC inválida");
    return res.status(401).json({ error: "Invalid HMAC signature" });
  }

  // 4) parse do body (já validado)
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch (err) {
    console.log("⚠️ Erro ao parsear body do webhook:", err);
    return res.status(400).json({ error: "Bad request body" });
  }

  const event = body?.event;
  const eventId = body?.id || null;

  // 5) idempotência: se já processado, devolve 200
  if (eventId && processedEvents.has(eventId)) {
    console.log("🔁 Evento já processado (idempotência):", eventId);
    return res.status(200).json({ ok: true });
  }

  console.log("🔔 Evento recebido:", event, "id:", eventId);

  if (event === "billing.paid") {
    // Extrair informações conforme doc
    const amount = body?.data?.payment?.amount ?? body?.data?.amount;
    const method = body?.data?.payment?.method ?? null;

    // Tentativas para achar reference_id (dependendo de como create-payment enviou)
    const referenceId =
      body?.data?.payment?.reference_id ||
      body?.data?.reference_id ||
      body?.data?.metadata?.reference_id ||
      body?.data?.metadata?.referenceId ||
      body?.metadata?.reference_id ||
      body?.metadata?.referenceId ||
      null;

    if (!referenceId) {
      console.log("⚠️ Nenhum reference_id encontrado no payload. Corpo:", JSON.stringify(body).slice(0, 1000));
      // Retornamos 400 para o gateway alertar erro - ou 200 se preferir processar manualmente
      return res.status(400).json({ error: "Missing reference_id" });
    }

    // Marca como processado (idempotência)
    if (eventId) processedEvents.add(eventId);

    console.log("✅ Pagamento confirmado para reference:", referenceId, { amount, method });

    // Localiza produto/pedido (exemplo usando PRODUCTS) - em produção recupere do DB
    const product = PRODUCTS[referenceId] || null;

    // Se não achar por productId, você pode usar um DB para mapear orderId -> productId.
    if (!product) {
      console.log(`⚠️ Produto/pedido não encontrado para referenceId=${referenceId}. Ajuste sua lógica de lookup.`);
      // Ainda assim devolvemos 200 para evitar retries infinitos, ou 404 se preferir.
      return res.status(200).json({ ok: true, note: "order not found, manual check required" });
    }

    // Exemplo: enviar email com link do produto (via SendGrid) - só se configurado
    if (process.env.SENDGRID_API_KEY && body?.data?.payment?.customer?.email) {
      const to = body.data.payment.customer.email;
      const msg = {
        to,
        from: process.env.MAIL_FROM || "no-reply@hubstore-theta.vercel.app",
        subject: `Seu pedido ${referenceId} está disponível`,
        html: `<p>Obrigado! Seu pedido <b>${referenceId}</b> foi confirmado. Baixe/acesse seu produto aqui: <a href="${product.file}">${product.title}</a></p>`
      };
      try {
        await sgMail.send(msg);
        console.log("📨 Email enviado para", to);
      } catch (err) {
        console.error("Erro ao enviar e-mail:", err);
      }
    } else {
      console.log("📦 Produto (simulado) pronto para entrega:", product);
    }

    // (Opcional) Log/registrar em arquivo local para testes (não recomendado em produção)
    try {
      const logLine = `${new Date().toISOString()} | paid | ${referenceId} | amount=${amount}\n`;
      const logPath = path.join("/tmp", "hubstore_webhook.log");
      fs.appendFileSync(logPath, logLine);
    } catch (err) {
      // falha silenciosa - apenas log
    }
  } else {
    console.log("Evento não tratado:", event);
  }

  return res.status(200).json({ ok: true });
}

/**
 * export config: necessário para ler raw body no Next/Vercel
 */
export const config = {
  api: {
    bodyParser: false,
  },
};