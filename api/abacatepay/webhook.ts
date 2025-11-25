// /api/abacatepay/webhook.ts

import { VercelRequest, VercelResponse } from "@vercel/node";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Desativar bodyParser para ler RAW body? NÃO NECESSÁRIO — AbacatePay não usa HMAC
// export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Verificar segredo
    const incomingSecret = req.query.webhookSecret;
    if (!incomingSecret || incomingSecret !== process.env.WEBHOOK_SECRET) {
      console.log("❌ Webhook secret inválido:", incomingSecret);
      return res.status(401).json({ error: "Invalid webhook secret" });
    }

    console.log("➡ Webhook recebido:", JSON.stringify(req.body).slice(0, 500));

    const event = req.body?.event;
    if (event !== "billing.paid") {
      console.log("Evento ignorado:", event);
      return res.status(200).json({ ok: true, ignored: event });
    }

    // Captura externalId do produto
    const externalId =
      req.body?.data?.billing?.products?.[0]?.externalId ||
      req.body?.data?.billing?.products?.[0]?.external_id;

    if (!externalId) {
      console.log("❌ sem externalId no webhook");
      return res.status(400).json({ error: "Missing externalId" });
    }

    console.log("📦 externalId:", externalId);

    // Tabela de produtos
    const PRODUCTS: Record<string, { title: string; file: string }> = {
      prod_roboto: {
        title: "Robô AI-Assist",
        file: "https://drive.google.com/drive/folders/1GyCxNqQcufTzNnnNXrQnZ48peo4ReNYp"
      },
      prod_fornecedores: {
        title: "Lista de Fornecedores Premium",
        file: "https://drive.google.com/file/d/1ttquBeNbiulk_b7qGcvh-xlIziM2Et61/view"
      },
      prod_catalogo: {
        title: "Catálogo de Produtos Exclusivos",
        file: "https://drive.google.com/file/d/1Q7sSpORi9t0bNlQD6gIBgaW9swMQNXz5/view"
      },
      prod_sms: {
        title: "Pacote Completo – Envio de SMS em Massa",
        file: "https://drive.google.com/drive/folders/1NCCGrQc_vuALu2vwRcMsOGykIzpWefcV"
      },
      prod_jarvee: {
        title: "Jarvee – Automação Completa",
        file: "https://drive.google.com/drive/folders/1ASj94tBCNd3OJ-4k1A4b2wNfbjg6YyIK"
      },
      prod_tubeviews: {
        title: "TubeViews – YouTube Booster",
        file: "https://drive.google.com/drive/folders/17yplvC8leZncMnWs2w49AioaRoqrM_Hs"
      },
      prod_socinator: {
        title: "Socinator – Automação Profissional",
        file: "https://drive.google.com/drive/folders/1bt4ONHmg6ah_QvWKXAjkjQT0esS6G9jw"
      },
      prod_jarvee_pc: {
        title: "Jarvee – Gerenciador de Redes (PC)",
        file: "https://drive.google.com/drive/folders/1zziJUtoTyG7jaYAHRU6XeRdVtvYDdMX2"
      },
      prod_instabot: {
        title: "Instabot Pro – Automação Instagram",
        file: "https://drive.google.com/drive/folders/1uMAgTrE0LIHTiq0xK_Lc1Ua0VXIfZ94K"
      },
      prod_extractor: {
        title: "Insta Extractor + Licença",
        file: "https://drive.google.com/drive/folders/193VTdlaZseLVOZ5H0zCJa3Sdah6kpdlH"
      }
    };

    const product = PRODUCTS[externalId];
    if (!product) {
      console.log("❌ Produto não mapeado:", externalId);
      return res.status(404).json({ error: "Product not mapped" });
    }

    // Dados do cliente
    const customer = req.body?.data?.billing?.customer?.metadata || {};
    const email = customer.email;
    const name = customer.name || "Client";

    if (!email) {
      console.log("❌ webhook sem e-mail do cliente");
      return res.status(400).json({ error: "Missing customer email" });
    }

    console.log("📧 Enviando para:", email);

    // Enviar email pelo SendGrid
    await sgMail.send({
      to: email,
      from: `${process.env.MAIL_FROM_NAME} <${process.env.FROM_EMAIL}>`,
      subject: `Seu produto: ${product.title}`,
      html: `
        <h2>Olá, ${name}!</h2>
        <p>Seu pagamento foi aprovado 🎉</p>

        <p><b>Produto:</b> ${product.title}</p>
        <p><b>Download:</b> <a href="${product.file}" target="_blank">Clique aqui para baixar</a></p>

        <br>
        <p>Obrigado por comprar na Hubstore!</p>
      `
    });

    console.log("✔ Email enviado com sucesso!");

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.log("❌ ERRO NO WEBHOOK:", err);
    return res.status(500).json({ error: "Internal Server Error", details: String(err) });
  }
}