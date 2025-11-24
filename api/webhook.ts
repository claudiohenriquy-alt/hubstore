// api/webhook.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { PRODUCTS } from './products';
import sgMail from '@sendgrid/mail';

// Configure a chave da API do SendGrid a partir das variáveis de ambiente
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY não está definida. O envio de e-mails está desabilitado.");
}

// Helper para encontrar um valor em um objeto, tentando múltiplos caminhos comuns
const findValue = (obj: any, key: string): string | null => {
  const pathsToTry = [
    [key],
    ['data', key],
    ['data', 'metadata', key],
    ['metadata', key],
    ['customer', key],
    ['data', 'customer', key],
  ];

  for (const path of pathsToTry) {
    let current = obj;
    for (const part of path) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        current = null;
        break;
      }
    }
    if (current !== null && current !== undefined) {
      return String(current);
    }
  }
  return null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const event = req.body;
  const webhookSecret = process.env.WEBHOOK_SECRET;

  // 1. Validar o "secret" para garantir que a requisição é do AbacatePay
  if (webhookSecret) {
    const signature = req.headers['x-abacate-signature'] || findValue(event, 'secret');
    if (signature !== webhookSecret) {
      console.warn('Webhook secret inválido recebido. A requisição será ignorada.');
      // Responde com sucesso para não indicar a falha ao gateway, mas não processa.
      return res.status(200).json({ success: true, message: 'Invalid signature. Request ignored.' });
    }
  }

  const status = findValue(event, 'status');
  const chargeId = findValue(event, 'id') || findValue(event, 'charge_id') || 'N/A';
  
  // 2. Lidar com os diferentes status do pagamento
  try {
    switch (status) {
      case 'paid':
      case 'charge.paid': // Status comum em alguns gateways
        console.log(`Pedido ${chargeId} atualizado para: { status: "pago", dataPagamento: ${Date.now()} }`);
        
        // Lógica de envio do produto por e-mail
        if (!process.env.SENDGRID_API_KEY || !process.env.EMAIL_FROM) {
            console.error("Configuração de e-mail incompleta. Não é possível enviar o produto.");
            break;
        }

        const email = findValue(event, 'customer_email') || findValue(event, 'email');
        const productId = findValue(event, 'product_id') || findValue(event, 'external_reference');

        if (!email || !productId) {
          console.error(`Webhook 'paid' para ${chargeId} sem email ou productId. Email: ${email}, ProductID: ${productId}`);
          break; // Sai do switch, mas ainda retorna sucesso
        }
        
        const product = PRODUCTS.find(p => String(p.id) === String(productId));
        if (!product) {
          console.error(`Produto com ID ${productId} não encontrado.`);
          break;
        }

        const msg = {
          to: email,
          from: process.env.EMAIL_FROM,
          subject: `✅ Seu pedido foi aprovado: ${product.name}`,
          html: `
            <div style="font-family: Inter, system-ui, Arial; color: #e5e7eb; max-width: 600px; margin: auto; background-color: #0A0A0A; padding: 24px; border-radius: 12px; border: 1px solid #27272a;">
              <h1 style="color: #34d399; font-size: 24px;">Pagamento Confirmado!</h1>
              <p style="font-size: 16px; line-height: 1.6;">Olá! Seu pagamento para o produto <strong>${product.name}</strong> foi aprovado com sucesso.</p>
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
        console.log(`E-mail de entrega enviado para ${email} para o pedido ${chargeId}.`);
        break;

      case 'failed':
      case 'charge.failed':
        console.log(`Pedido ${chargeId} atualizado para: { status: "falhou" }`);
        break;

      case 'pending':
        console.log(`Pedido ${chargeId} atualizado para: { status: "pendente" }`);
        break;

      default:
        console.log(`Webhook com status não mapeado ('${status}') recebido para o pedido ${chargeId}.`);
        break;
    }
  } catch (error) {
    console.error(`Erro crítico ao processar webhook para o pedido ${chargeId}:`, error);
  }

  // 6. Retornar sempre { success: true } para o AbacatePay
  return res.status(200).json({ success: true });
}
