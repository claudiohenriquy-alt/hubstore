// api/webhook.ts (Next.js / Vercel)
import { VercelRequest, VercelResponse } from '@vercel/node';
import { PRODUCTS } from './products';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

function extractProductIdFromEvent(body: any) {
  // tenta vários caminhos comuns
  if (body.product_id) return body.product_id;
  if (body.data?.product_id) return body.data.product_id;
  if (body.data?.metadata?.product_id) return body.data.metadata.product_id;
  if (body.metadata?.product_id) return body.metadata.product_id;
  if (body.data?.metadata?.id) return body.data.metadata.id;
  // se AbacatePay enviar custom field 'reference' or 'external_reference'
  if (body.data?.metadata?.external_reference) return body.data.metadata.external_reference;
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const event = req.body;

    // --- Opcional: valida o secret do webhook
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      // AbacatePay pode enviar o secret no body or header — aceitamos ambos para compatibilidade
      const secretInBody = event.secret || event.data?.secret || event.data?.metadata?.secret;
      const secretHeader = req.headers['x-abacate-signature'] || req.headers['x-webhook-secret'];
      if (!(secretInBody === webhookSecret || secretHeader === webhookSecret)) {
        // não aborta com 401 caso AbacatePay não envie; se quiser mais rígido, retorne 401
        console.warn('Webhook secret mismatch (if AbacatePay does not send secret, ignore this).');
        // continue — se quiser bloquear: return res.status(401).json({ error: 'Invalid secret' });
      }
    }

    // --- Checa status do pagamento: depende do payload da AbacatePay
    // Aceitamos 'paid', 'charge.paid', 'paid: true' etc.
    const isPaid =
      event.status === 'paid' ||
      event.type === 'charge.paid' ||
      event.data?.status === 'paid' ||
      event.data?.paid === true ||
      event.paid === true;

    if (!isPaid) {
      // apenas acknowledge
      return res.status(200).json({ message: 'Evento recebido (não pago) — ignorado' });
    }

    // --- determinar e-mail do cliente
    const email =
      event.customer_email ||
      event.data?.customer_email ||
      event.data?.billing_email ||
      event.data?.metadata?.customer_email ||
      event.customer?.email ||
      event.data?.customer?.email;

    if (!email) {
      return res.status(400).json({ error: 'E-mail do cliente não encontrado no webhook payload' });
    }

    // --- determinar produto
    const productId = extractProductIdFromEvent(event) || event.data?.metadata?.product_id || event.data?.product_id;
    if (!productId) {
      // se não vier product_id, tente buscar por referência (reference id)
      console.warn('product_id não encontrado no payload, verifique metadata no link de pagamento');
      // Ainda assim podemos enviar um e-mail geral — aqui devolvemos OK mas pedimos intervenção
      return res.status(400).json({ error: 'product_id não encontrado no payload' });
    }

    const product = PRODUCTS.find(p => String(p.id) === String(productId) || String(p.id) === String(Number(productId)));
    if (!product) {
      return res.status(404).json({ error: 'Produto não cadastrado no servidor' });
    }

    // --- montar e enviar e-mail pelo SendGrid
    const downloadUrl = product.driveLink;
    const successPage = `${process.env.SITE_ORIGIN || ''}/success.html`;

    const msg = {
      to: email,
      from: process.env.EMAIL_FROM as string,
      subject: `Seu pedido: ${product.name} — Link de download`,
      html: `
        <div style="font-family:Inter,system-ui,Arial; color:#111;">
          <div style="max-width:600px;margin:0 auto;padding:20px;border-radius:8px;background:#0b0b0b;color:#fff;">
            <img src="${product.imageUrl}" alt="${product.name}" style="width:120px;height:auto;border-radius:8px;object-fit:cover;margin-bottom:12px;" />
            <h2 style="color:#38bdf8;margin:0 0 8px 0;">Compra Confirmada — ${product.name}</h2>
            <p style="color:#d1d5db;margin:0 0 12px 0;">Obrigado pela compra! Seu produto está pronto para download.</p>
            <a href="${downloadUrl}" style="display:inline-block;padding:12px 20px;background:#3B82F6;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Baixar agora</a>
            <p style="color:#94a3b8;margin-top:12px;font-size:13px;">Se o link não abrir, copie e cole no navegador:</p>
            <pre style="background:#071025;padding:8px;border-radius:6px;color:#93c5fd;overflow:auto">${downloadUrl}</pre>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.04);margin:16px 0;" />
            <p style="color:#94a3b8;font-size:12px;">Se preferir, acesse a página: <a href="${successPage}" style="color:#c7f9ff;">Ver pedido</a></p>
            <p style="color:#94a3b8;font-size:12px;margin-top:8px;">Suporte: responda este e-mail ou acesse contato no site.</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);

    // opcional: registrar em DB ou Google Sheets (não implementado aqui)

    return res.status(200).json({ message: 'E-mail de download enviado com sucesso' });

  } catch (err) {
    console.error('Erro no webhook:', err);
    return res.status(500).json({ error: 'Erro interno', details: String(err) });
  }
}