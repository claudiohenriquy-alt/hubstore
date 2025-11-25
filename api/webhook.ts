// /api/webhook.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';
import { PRODUCTS } from '../constants';

// Configure a chave da API do SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY não está definida. O envio de e-mails está desabilitado.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const event = req.body;
    const webhookSecret = process.env.WEBHOOK_SECRET;

    // 1. Validar o secret para garantir que a requisição é legítima
    const signature = req.headers['x-abacate-signature'] as string || req.query.secret as string;
    if (webhookSecret && signature !== webhookSecret) {
      console.warn('Webhook secret inválido recebido.');
      return res.status(403).json({ success: false, message: 'Invalid signature.' });
    }
    
    const eventType = event?.event;
    console.log(`Webhook recebido: ${eventType}`);

    if (eventType === 'billing.paid') {
      const billing = event?.data?.billing;
      if (!billing) {
        console.error('Payload de "billing.paid" sem a estrutura "data.billing".');
        return res.status(400).json({ success: false, message: 'Payload inválido.' });
      }

      // Extrai dados do payload do AbacatePay
      const customerEmail = billing.customer?.metadata?.email;
      // Busca o ID do produto primeiro na metadata (enviado pela nossa API), senão no array de produtos.
      const productId = billing.metadata?.product_id ?? billing.products?.[0]?.id;

      if (!customerEmail || !productId) {
        console.error(`Webhook 'billing.paid' sem email ou productId. Email: ${customerEmail}, ProductID: ${productId}`);
        return res.status(400).json({ success: false, message: 'Dados do cliente ou produto ausentes.' });
      }

      // Encontra o produto na nossa única fonte de verdade
      const product = PRODUCTS.find(p => String(p.id) === String(productId));

      if (!product) {
        console.error(`Produto com ID ${productId} não encontrado na nossa base de dados.`);
        return res.status(200).json({ success: true, message: `Produto ${productId} não encontrado.` });
      }
      
      if (!product.driveLink) {
        console.error(`Produto com ID ${productId} não possui um link de download (driveLink).`);
        return res.status(200).json({ success: true, message: `Produto ${productId} sem link de download.` });
      }

      // Envia o e-mail com o link de download se o SendGrid estiver configurado
      if (process.env.SENDGRID_API_KEY && process.env.EMAIL_FROM) {
        const msg = {
          to: customerEmail,
          from: process.env.EMAIL_FROM,
          subject: `✅ Seu produto da HubStore está pronto: ${product.title}`,
          html: `
            <div style="font-family: Inter, system-ui, Arial; color: #e5e7eb; max-width: 600px; margin: auto; background-color: #0A0A0A; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
              <h1 style="color: #34d399; font-size: 24px;">Pagamento Aprovado!</h1>
              <p style="font-size: 16px; line-height: 1.6;">Olá! Seu pagamento para o produto <strong>${product.title}</strong> foi aprovado com sucesso.</p>
              <p style="font-size: 16px; line-height: 1.6;">Clique no botão abaixo para acessar seu conteúdo imediatamente:</p>
              <a href="${product.driveLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; margin: 20px 0; text-decoration: none; border-radius: 8px; font-weight: bold;">Baixar Produto Agora</a>
              <p style="font-size: 14px; color: #9ca3af;">Se o botão não funcionar, copie e cole este link no seu navegador:</p>
              <p style="font-size: 14px; color: #60a5fa; word-break: break-all;">${product.driveLink}</p>
              <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
              <p style="font-size: 12px; color: #a1a1aa;">Obrigado por comprar na <strong>HubStore</strong>!</p>
            </div>
          `,
        };
        
        await sgMail.send(msg);
        console.log(`E-mail de entrega para o produto "${product.title}" enviado para ${customerEmail}.`);
      } else {
        console.warn("Envio de e-mail desabilitado. Verifique as variáveis de ambiente SENDGRID_API_KEY e EMAIL_FROM.");
      }
    }
    
    // Sempre retorna sucesso para o AbacatePay
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(`Erro crítico ao processar webhook:`, error);
    return res.status(200).json({ success: true, error: 'Internal server error occurred.' });
  }
}