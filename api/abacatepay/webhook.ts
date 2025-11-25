// /api/abacatepay/webhook.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import sgMail from "@sendgrid/mail";
import { PRODUCTS_BY_EXTERNAL } from "../products";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const incomingSecret = req.query.webhookSecret;
  if (!incomingSecret || incomingSecret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  // LER RAW BODY PARA VALIDAR HMAC
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
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const event = body?.event;
  if (event !== "billing.paid") {
    return res.status(200).json({ ok: true });
  }

  const externalId =
    body?.data?.billing?.products?.[0]?.externalId ||
    body?.data?.billing?.products?.[0]?.external_id;

  if (!externalId) {
    return res.status(400).json({ error: "Missing externalId" });
  }

  const item = PRODUCTS_BY_EXTERNAL[externalId];
  if (!item) {
    return res.status(404).json({ error: "Product not mapped" });
  }

  const customer = body?.data?.billing?.customer?.metadata || {};
  const customerEmail = customer.email;
  const customerName = customer.name || "Cliente";

  try {
    await sgMail.send({
      to: customerEmail,
      from: `${process.env.MAIL_FROM_NAME} <${process.env.FROM_EMAIL}>`,
      subject: `Seu Produto: ${item.title} `,
      html: `
        <h2>Olá, ${customerName}!</h2>
        <p>Seu pagamento foi aprovado e seu produto está liberado 🎉</p>

        <p><b>Produto:</b> ${item.title}</p>
        <p><b>Link de Download:</b> <a href="${item.file}" target="_blank">Clique aqui para baixar</a></p>

        <br>
        <p>Se precisar de suporte, responda este e-mail.</p>
        <p>— Hubstore Digital</p>
      `
    });

    return res.status(200).json({ ok: true, delivered: item.file });
  } catch (err) {
    console.error("ERRO SENDGRID", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}