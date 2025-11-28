// api/abacatepay/webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

type AbacatePayload = {
  event?: string;
  type?: string;
  data?: any;
  [k: string]: any;
};

// === Lista de produtos e links (substitua/alimente conforme necessário) ===
const PRODUCT_LINKS: Record<string, { name: string; url: string }> = {
  "ai-assist": { name: "Robô AI-Assist", url: "https://drive.google.com/drive/folders/1GyCxNqQcufTzNnnNXrQnZ48peo4ReNYp?usp=drive_link" },
  "fornecedores": { name: "Lista de Fornecedores Premium", url: "https://drive.google.com/uc?export=download&id=1ttquBeNbiulk_b7qGcvh-xlIziM2Et61" },
  "catalogo": { name: "Catálogo de Produtos Exclusivos", url: "https://drive.google.com/uc?export=download&id=1Q7sSpORi9t0bNlQD6gIBgaW9swMQNXz5" },
  "sms-massa": { name: "Pacote Envio de SMS", url: "https://drive.google.com/drive/folders/1NCCGrQc_vuALu2vwRcMsOGykIzpWefcV?usp=drive_link" },
  "jarvee": { name: "Jarvee – Automação Completa", url: "https://drive.google.com/drive/folders/1ASj94tBCNd3OJ-4k1A4b2wNfbjg6YyIK?usp=drive_link" },
  "tubeviews": { name: "TubeViews – YouTube Booster", url: "https://drive.google.com/drive/folders/17yplvC8leZncMnWs2w49AioaRoqrM_Hs?usp=drive_link" },
  "socinator": { name: "Socinator – Automação Profissional", url: "https://drive.google.com/drive/folders/1bt4ONHmg6ah_QvWKXAjkjQT0esS6G9jw?usp=drive_link" },
  "jarvee-pc": { name: "Jarvee – Gerenciador de Redes (PC)", url: "https://drive.google.com/drive/folders/1zziJUtoTyG7jaYAHRU6XeRdVtvYDdMX2?usp=drive_link" },
  "instabot": { name: "Instabot Pro – Automação Instagram", url: "https://drive.google.com/drive/folders/1uMAgTrE0LIHTiq0xK_Lc1Ua0VXIfZ94K?usp=drive_link" },
  "insta-extractor": { name: "Insta Extractor + Licença", url: "https://drive.google.com/drive/folders/193VTdlaZseLVOZ5H0zCJa3Sdah6kpdlH?usp=drive_link" }
};

// === Helpers ===
function computeHmacHex(secret: string, payload: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = computeHmacHex(secret, rawBody);
  return expected === signature;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY não configurada');
  }
  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'suporte@hubstoredigital.store',
    subject,
    html
  };
  return sgMail.send(msg);
}

/**
 * Extrai product ids do payload (tenta vários lugares onde o ID pode vir)
 * Retorna array de productId strings (pode ser vazio)
 */
function findProductLinksFromPayload(data: any): string[] {
  const meta = data?.metadata || {};
  let productId =
    meta.product_id ||
    meta.produto ||
    data?.product_id ||
    data?.produto ||
    data?.id ||
    (Array.isArray(data?.items) && (data.items[0]?.product_id || data.items[0]?.id));

  // se for array já
  if (Array.isArray(productId)) {
    return productId.map(String);
  }

  if (typeof productId === 'string' && productId.includes(',')) {
    return productId.split(',').map((p: string) => p.trim());
  }

  if (!productId) return [];

  return [String(productId)];
}

// === Handler principal ===
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }

    const secret = process.env.ABACATEPAY_SECRET || process.env.WEBHOOK_SECRET || '';
    if (!secret) return res.status(500).json({ ok: false, error: 'missing_secret' });

    // header de assinatura (aceita variações de case)
    const header = (req.headers['x-abacate-signature'] || req.headers['X-Abacate-Signature'] || req.headers['abacate-signature']) as string | undefined;
    if (!header) {
      console.warn('Missing signature header');
      return res.status(400).json({ ok: false, error: 'missing_signature' });
    }

    // reconstruir rawBody da forma mais previsível
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    // validar HMAC
    const isValid = verifySignature(rawBody, header, secret);
    if (!isValid) {
      console.warn('Invalid signature', { header });
      return res.status(401).json({ ok: false, error: 'invalid_signature' });
    }

    // parse payload
    const payload: AbacatePayload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
    const ev = payload.event || payload.type || (payload.data && payload.data.status) || 'unknown';

    // eventos considerados sucesso — ajuste se necessário
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
      if (internal) {
        await sendEmail(internal, `Pagamento sem e-mail — pedido ${orderId}`, `<pre>${JSON.stringify(payload, null, 2)}</pre>`);
      }
      return res.status(200).json({ ok: true, note: 'no_email' });
    }

    // descobrir produtos a enviar
    const productIds = findProductLinksFromPayload(data);
    const linksToSend = productIds.length
      ? productIds.map(pid => PRODUCT_LINKS[pid] || { name: pid, url: String(pid) })
      : Object.values(PRODUCT_LINKS); // fallback: enviar todos (ou ajustar para enviar apenas 1 padrão)

    // montar HTML do e-mail
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

    // enviar para o cliente
    await sendEmail(email, subject, html);

    // enviar copia interna com payload
    const internal = process.env.INTERNAL_EMAIL || process.env.FROM_EMAIL || 'suporte@hubstoredigital.store';
    await sendEmail(internal, `Pedido pago — ${orderId}`, `<pre>${JSON.stringify(payload, null, 2)}</pre>`);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Erro no webhook:', err?.message || err);
    // notificar internamente sobre erro
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