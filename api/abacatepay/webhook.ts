// /api/abacatepay/webhook.ts  (PATCH - substitua o arquivo inteiro pelo conteúdo abaixo)
import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import { PRODUCTS_BY_EXTERNAL } from "../products";

// Set API key if present
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY not configured in env vars");
}

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // QUICK LOGS: help debug in Vercel logs
    console.log("Webhook invoked. headers:", {
      secret_qs: req.query?.webhookSecret,
      x_webhook_secret: req.headers["x-webhook-secret"] || req.headers["x-secret"],
    });

    const incomingSecret = req.query.webhookSecret;
    if (!incomingSecret || incomingSecret !== process.env.WEBHOOK_SECRET) {
      console.log("Invalid webhook secret. incoming:", incomingSecret);
      return res.status(401).json({ error: "Invalid webhook secret" });
    }

    // Read raw body for HMAC and parsing
    const rawBuffer: Buffer = await new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(Buffer.from(c)));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });

    let body: any;
    try {
      body = JSON.parse(rawBuffer.toString("utf8"));
    } catch (e) {
      console.log("Invalid JSON body:", e);
      return res.status(400).json({ error: "Invalid JSON" });
    }

    console.log("Parsed webhook body event:", body?.event);

    if (body?.event !== "billing.paid") {
      return res.status(200).json({ ok: true, note: "event ignored" });
    }

    const productObj = body?.data?.billing?.products?.[0];
    const externalId = productObj?.externalId || productObj?.external_id;
    console.log("externalId from payload:", externalId);

    if (!externalId) {
      console.log("Missing externalId in payload", JSON.stringify(productObj).slice(0, 500));
      return res.status(400).json({ error: "Missing externalId" });
    }

    const item = PRODUCTS_BY_EXTERNAL[externalId];
    if (!item) {
      console.log("Product not mapped for externalId:", externalId);
      return res.status(404).json({ error: "Product not mapped" });
    }

    // customer email
    const customerMeta = body?.data?.billing?.customer?.metadata || {};
    const customerEmail = customerMeta.email;
    const customerName = customerMeta.name || "Cliente";

    if (!customerEmail) {
      console.log("No customer email found in payload (cannot send). Customer meta:", customerMeta);
      // respond 200 to avoid retries or respond 400 to let ABACATEPAY retry? We'll return 400 so you can see the failed attempt in dashboard.
      return res.status(400).json({ error: "Missing customer email" });
    }

    // Determine from email variable (supports FROM_EMAIL or EMAIL_FROM)
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_FROM || process.env.EMAIL_FROM_ADDRESS;
    const fromName = process.env.MAIL_FROM_NAME || process.env.MAIL_FROM || "Hubstore";

    if (!fromEmail) {
      console.log("Sender FROM email not configured. Looked for FROM_EMAIL / EMAIL_FROM env vars.");
      return res.status(500).json({ error: "Sender address not configured" });
    }

    // Prepare message
    const msg = {
      to: customerEmail,
      from: `${fromName} <${fromEmail}>`,
      subject: `Seu Produto: ${item.title}`,
      html: `
        <h2>Olá, ${customerName}!</h2>
        <p>Seu pagamento foi aprovado e seu produto está liberado 🎉</p>
        <p><b>Produto:</b> ${item.title}</p>
        <p><b>Link de Download:</b> <a href="${item.file}" target="_blank">Clique aqui para baixar</a></p>
        <p>Se o link for do Google Drive e pedir permissão, confirme no painel do Drive que o link está público/compartilhável.</p>
        <br><p>— Hubstore Digital</p>
      `
    };

    console.log("Sending email to:", customerEmail, "from:", fromEmail);

    const sendResult = await sgMail.send(msg);
    console.log("SendGrid result:", sendResult);

    return res.status(200).json({ ok: true, delivered: item.file });
  } catch (err) {
    console.error("Unhandled webhook error:", err);
    return res.status(500).json({ error: "internal_error", details: String(err) });
  }
}