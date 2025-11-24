// /api/abacatepay/webhook.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ORDERS_FILE = path.join("/tmp", "hubstore_orders.json");

// PRODUCTS mapping: externalId -> product info (use o mesmo externalId que mandamos em create-payment)
const PRODUCTS: Record<string, { title: string; file: string }> = {
  "prod_uuZ6PQFFPDcnJyeTmhaptcwd": {
    title: "TubeViews – YouTube Booster",
    file: "file:///mnt/data/e6058c8c-4a0c-4e58-9c1a-ffadeb195380.png"
  }
};

const ABACATEPAY_PUBLIC_KEY = process.env.ABACATEPAY_PUBLIC_KEY || ""; // opcional, mas recomendado
const MY_SECRET = process.env.WEBHOOK_SECRET || "";

/** leitura/escrita simples de orders (arquivo temporário) - apenas para testes */
function readOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return {};
    return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8") || "{}");
  } catch {
    return {};
  }
}
function saveOrders(obj: any) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(obj, null, 2));
}

/** verifica HMAC-SHA256 (base64) se ABACATEPAY_PUBLIC_KEY estiver definida */
function verifyAbacateSignature(rawBody: Buffer, signatureFromHeader?: string) {
  if (!ABACATEPAY_PUBLIC_KEY) return true; // se não configurada, pulamos a verificação (apenas para dev)
  if (!signatureFromHeader) return false;
  const expected = crypto.createHmac("sha256", ABACATEPAY_PUBLIC_KEY).update(rawBody).digest("base64");
  const A = Buffer.from(expected, "utf8");
  const B = Buffer.from(signatureFromHeader, "utf8");
  if (A.length !== B.length) return false;
  try {
    return crypto.timingSafeEqual(A, B);
  } catch {
    return false;
  }
}

/**
 * IMPORTANT: desabilitamos o bodyParser do Next para garantir acesso ao raw body
 * necessário para validar HMAC se desejar.
 */
export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) validar webhook secret via query string
  const incomingSecret = (req.query?.webhookSecret as string) || null;
  if (!incomingSecret || incomingSecret !== MY_SECRET) {
    console.log("❌ Secret inválido no webhook");
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  // 2) ler raw body (buffer)
  const rawBuffer: Buffer = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", (err) => reject(err));
  });

  // 3) validar assinatura se houver ABACATEPAY_PUBLIC_KEY configurada
  const signatureHeader = (req.headers["x-webhook-signature"] as string) || (req.headers["X-Webhook-Signature"] as string);
  if (!verifyAbacateSignature(rawBuffer, signatureHeader)) {
    console.log("❌ Assinatura HMAC inválida (ou ABACATEPAY_PUBLIC_KEY não configurada corretamente)");
    return res.status(401).json({ error: "Invalid HMAC signature" });
  }

  // 4) parse do body (após validação)
  let body: any;
  try {
    const rawBodyStr = rawBuffer.toString("utf8");
    body = JSON.parse(rawBodyStr);
  } catch (err) {
    console.log("⚠️ Erro ao parsear body do webhook:", err);
    return res.status(400).json({ error: "Bad request body" });
  }

  const event = body?.event;
  console.log("🔔 Evento recebido:", event);

  if (event === "billing.paid") {
    // A AbacatePay envia data.billing.products array -> externalId está aqui
    const productsArray = body?.data?.billing?.products || [];
    if (!productsArray || productsArray.length === 0) {
      console.log("⚠️ Nenhum produto encontrado no webhook");
      return res.status(400).json({ error: "No product in billing" });
    }

    const firstProduct = productsArray[0];
    const externalId = firstProduct?.externalId || firstProduct?.external_id || null;
    if (!externalId) {
      console.log("⚠️ externalId não presente no produto:", JSON.stringify(firstProduct));
      return res.status(400).json({ error: "Missing externalId" });
    }

    console.log("ExternalId recebido:", externalId);

    // localizar produto no mapeamento
    const item = PRODUCTS[externalId];
    if (!item) {
      console.log("Produto não encontrado no mapeamento:", externalId);
      // Pode criar uma entrada no arquivo orders para reconciliação manual
      return res.status(404).json({ error: "Product not found" });
    }

    // marcar pedido como pago se salvo em /tmp (procura por reference_id em metadata se existir)
    const possibleReference =
      body?.data?.metadata?.reference_id ||
      body?.data?.billing?.reference_id ||
      body?.data?.metadata?.referenceId ||
      null;

    const orders = readOrders();
    if (possibleReference && orders[possibleReference]) {
      orders[possibleReference].status = "paid";
      orders[possibleReference].paidAt = new Date().toISOString();
      saveOrders(orders);
      console.log("Pedido marcado como pago:", possibleReference);
    } else {
      console.log("Nenhum reference_id encontrado para marcar pedido; salvar para reconciliação se necessário");
    }

    // Aqui: lógica para liberar produto (envio de e-mail, criar link temporário, etc)
    // Exemplo simples: log e devolve o link do arquivo (teste)
    console.log("✔️ Produto liberado:", item.title, item.file);

    return res.status(200).json({ ok: true, delivered: item.file });
  }

  // ignorar outros eventos
  return res.status(200).json({ ok: true, note: "Event ignored" });
}