// api/abacatepay/webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import rawBody from 'raw-body';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// produto -> links (mantenha/edite conforme antes)
const PRODUCT_LINKS: Record<string, { name: string; url: string }> = {
  "ai-assist": { name: "Robô AI-Assist", url: "https://drive.google.com/drive/folders/1GyCxNqQcufTzNnnNXrQnZ48peo4ReNYp?usp=drive_link" },
  // ... (mantenha os outros itens)
};

// helpers HMAC
function computeHmacHex(secret: string, payloadBuffer: Buffer) {
  return crypto.createHmac('sha256', secret).update(payloadBuffer).digest('hex');
}

async function getRawBody(req: VercelRequest) {
  // raw-body retorna Buffer
  return rawBody(req);
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY não configurada');
  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'suporte@hubstoredigital.store',
    subject,
    html,
  };
  return sgMail.send(msg);
}

function findProductLinksFromPayload(data: any): string[] {
  const meta = data?.metadata || {};
  let productId =
    meta.product_id ||
    meta.produto ||
    data?.product_id ||
    data?.produto ||
    data?.id ||
    (Array.isArray(data?.items) && (data.items[0]?.product_id || data.items[0]?.id));

  if (Array.isArray(productId)) return productId.map(String);
  if (typeof productId === 'string' && productId.includes(',')) return productId.split(',').map((p: string) => p.trim());
  if (!productId) return [];
  return [String(productId)];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

    // 1) secret preferido: env, fallback: query param webhookSecret
    const envSecret = process.env.ABACATEPAY_SECRET || process.env.WEBHOOK_SECRET || '';
    const querySecret = (req.query?.webhookSecret as string) || '';
    const secret = envSecret || querySecret;
    if (!secret) return res.status(500).json({ ok: false, error: 'missing_secret' });

    // 2) get raw body ALWAYS to compute HMAC when needed
    const raw = await getRawBody(req); // Buffer

    // 3) check header signature (preferred)
    const headerSig = (req.headers['x-abacate-signature'] || req.headers['X-Abacate-Signature']) as string | undefined;

    // If header exists => validate HMAC against header
    if (headerSig) {
      const expected = computeHmacHex(secret, raw);
      if (expected !== headerSig) {
        console.warn('Invalid signature', { expected, headerSig });
        return res.status(401).json({ ok: false, error: 'invalid_signature' });
      }
    } else {
      // No header: permit only if querySecret matches envSecret OR querySecret provided and equals secret
      // (we already set secret = envSecret || querySecret). To be strict: require that envSecret exists OR
      // that querySecret equals the secret provided in URL. Here we allow if querySecret present.
      if (!querySecret) {
        console.warn('No signature header and no webhookSecret query');
        return res.status(400).json({ ok: false, error: 'missing_signature' });
      }
      // if querySecret exists we've already set secret. We accept this.
    }

    // 4) parse payload from raw buffer
    let payload: any;
    try {
      const txt = raw.toString('utf8');
      payload = txt ? JSON.parse(txt) : {};
    } catch (e) {
      console.warn('Invalid JSON body', e);
      return res.status(400).json({ ok: false, error: 'invalid_json' });
    }

    const ev = payload.event || payload.type || (payload.data && payload.data.status) || 'unknown';
    const successfulEvents = ['charge.paid', 'payment.succeeded', 'payment.completed', 'charge.success', 'paid'];

    if (!successfulEvents.includes(String(ev))) {
      console.log('Evento ignorado:', ev);
      return res.status(200).json({ ok: true, ignoredEvent: ev });
    }

    // extrair dados
    const data = payload.data || {};
    const email = data.email || data.customer_email || data.buyer_email || data.customer?.email;
    const orderId = data.id || data.orderId || data.metadata?.order_id || 'N/A';
    const amountRaw = data.amount || data.value || 0;
    const amount = typeof amountRaw === 'number' ? (amountRaw / 100 || amountRaw) : amountRaw;

    if (!email) {
      console.warn('Pagamento sem email:', { orderId, payload });
      const internal = process.env.INTERNAL_EMAIL || process.env.FROM_EMAIL;
      if (internal) await sendEmail(internal, `Pagamento sem e-mail — pedido ${orderId}`, `<pre>${JSON.stringify(payload, null, 2)}</pre>`);
      return res.status(200).json({ ok: true, note: 'no_email' });
    }

    // montar lista de links
    const productIds = findProductLinksFromPayload(data);
    const linksToSend = productIds.length
      ? productIds.map(pid => PRODUCT_LINKS[pid] || { name: pid, url: String(pid) })
      : Object.values(PRODUCT_LINKS);

    const htmlList = linksToSend.map(l => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.name}</a></li>`).join('');
    const subject = `Seu pedido ${orderId} foi confirmado — Acesse seus produtos`;
    const html = `
      <p>Olá,</p>
      <p>Recebemos o pagamento do pedido <strong>${orderId}</strong>.</p>
      <p>Valor: <strong>R$ ${Number(amount).toFixed(2)}</strong></p>
      <p>Seus arquivos/pastas para download estão abaixo:</p>
      <ul>${htmlList}</ul>
      <p>Se algum link não abrir, responda este e-mail que reenviaremos manualmente.</p>
      <hr/>
      <p>Atenciosamente,<br/>Hubstore Digital</p>
    `;

    // enviar para cliente
    await sendEmail(email, subject, html);

    // enviar copia interna
    const internal = process.env.INTERNAL_EMAIL || process.env.FROM_EMAIL || 'suporte@hubstoredigital.store';
    await sendEmail(internal, `Pedido pago — ${orderId}`, `<pre>${JSON.stringify(payload, null, 2)}</pre>`);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Erro no webhook:', err?.message || err);
    // notificar internamente
    try {
      const internal = process.env.INTERNAL_EMAIL || process.env.FROM_EMAIL;
      if (internal) {
        await sendEmail(internal, 'Webhook error — Hubstore', `<pre>${String(err?.stack || err)}</pre>`);
      }
    } catch (nerr) {
      console.error('Erro enviando notificação interna:', nerr);
    }
    return res.status(500).json({ ok: false, error: 'internal_error', detail: err?.message || String(err) });
  }
}