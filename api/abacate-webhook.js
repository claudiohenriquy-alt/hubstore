const crypto = require("crypto");
const getRawBody = require("raw-body");
const sendgrid = require("@sendgrid/mail");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const SIGNATURE_HEADER = "x-abacate-signature";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method not allowed");
  }

  try {
    const raw = await getRawBody(req);

    const secret = process.env.ABACATEPAY_SECRET || "";
    const computed = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const incomingSig = (req.headers[SIGNATURE_HEADER] || "").toString();

    let payload;
    try { payload = JSON.parse(raw.toString("utf8")); }
    catch (e) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
    }

    const verified =
      (incomingSig && incomingSig === computed) ||
      (payload && payload.secret && payload.secret === secret);

    if (!verified) {
      console.warn("Signature verification failed", { incomingSig, computed });
      res.statusCode = 401;
      return res.end(JSON.stringify({ ok: false, error: "Invalid signature" }));
    }

    const evento = payload.event || payload.type || null;
    const data = payload.data || payload.payload || payload;

    if (!evento) {
      const status = data?.status || payload?.status;
      if (status === "paid" || status === "pago") await handlePaymentPaid(data);
      else if (status === "failed") await handlePaymentFailed(data);
      else console.log("Evento não tratado:", payload);
    } else {
      if (evento === "charge.paid" || evento === "payment.succeeded") await handlePaymentPaid(data);
      else if (evento === "charge.failed" || evento === "payment.failed") await handlePaymentFailed(data);
      else console.log("Evento desconhecido:", evento);
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("Erro processando webhook:", err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ ok: false, error: "Server error" }));
  }
};

async function sendEmail(to, subject, htmlContent) {
  if (!to) return;
  const msg = {
    to,
    from: process.env.FROM_EMAIL || "suporte@hubstoredigital.store",
    subject,
    html: htmlContent,
  };
  return sendgrid.send(msg);
}

async function handlePaymentPaid(data) {
  const email = data.email || data.customer_email;
  const orderId = data.orderId || data.metadata?.order_id || data.id;
  const amountRaw = data.amount || data.value || 0;
  const amount = typeof amountRaw === "number" ? (amountRaw/100 || amountRaw) : amountRaw;

  console.log("Pagamento confirmado:", { orderId, email, amount });

  const subject = `Pagamento confirmado — Pedido ${orderId}`;
  const html = `
    <p>Olá,</p>
    <p>Recebemos o pagamento do pedido <b>${orderId}</b>.</p>
    <p>Valor: <b>R$ ${Number(amount).toFixed(2)}</b></p>
    <p>Em breve vamos liberar o acesso ao produto.</p>
    <hr/>
    <p>Atenciosamente,<br/>Hubstore Digital</p>
  `;

  if (email) await sendEmail(email, subject, html);

  const internal = process.env.INTERNAL_EMAIL || process.env.FROM_EMAIL || "suporte@hubstoredigital.store";
  await sendEmail(internal, `Pedido pago — ${orderId}`, `<pre>${JSON.stringify(data, null, 2)}</pre>`);
}

async function handlePaymentFailed(data) {
  const email = data.email || data.customer_email;
  const orderId = data.orderId || data.metadata?.order_id || data.id;
  const subject = `Pagamento recusado — Pedido ${orderId}`;
  const html = `
    <p>Olá,</p>
    <p>O pagamento do pedido <b>${orderId}</b> foi recusado.</p>
    <p>Verifique os dados do cartão ou tente novamente.</p>
    <hr/>
    <p>Atenciosamente,<br/>Hubstore Digital</p>
  `;
  if (email) await sendEmail(email, subject, html);
  const internal = process.env.INTERNAL_EMAIL || process.env.FROM_EMAIL || "suporte@hubstoredigital.store";
  await sendEmail(internal, `Pagamento falhou — ${orderId}`, `<pre>${JSON.stringify(data, null, 2)}</pre>`);
}
