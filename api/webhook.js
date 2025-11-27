module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const secret = process.env.WEBHOOK_SECRET;
  
  // In a real scenario, you must verify the signature here
  // const signature = req.headers['x-abacatepay-signature'];
  // if (!verifySignature(req.body, signature, secret)) { return res.status(401).send('Invalid Signature'); }

  const event = req.body;

  console.log("Received Webhook Event:", event.type);

  // Process event
  switch (event.type) {
    case 'billing.paid':
      console.log(`Payment ${event.data.id} confirmed!`);
      // Logic to update database, send email, etc.
      break;
    case 'billing.failed':
      console.log(`Payment ${event.data.id} failed.`);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Always return 200 OK quickly
  return res.status(200).json({ received: true });
};
