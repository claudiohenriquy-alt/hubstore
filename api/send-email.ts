import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { email, productName, downloadUrl } = req.body;

    const msg = {
      to: email,
      from: "seu-email-verificado@seudominio.com", // PRECISA ser verificado no SendGrid
      subject: `Seu produto: ${productName}`,
      html: `
        <h2>Olá! Seu produto está pronto 🎉</h2>
        <p>Obrigado pela sua compra na <b>HubStore</b>.</p>
        <p>Clique no link abaixo para baixar seu produto:</p>
        <a href="${downloadUrl}" target="_blank">📥 Baixar agora</a>
        <br/><br/>
        <p>Se precisar de ajuda, basta responder este e-mail.</p>
      `
    };

    await sgMail.send(msg);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao enviar e-mail." });
  }
}