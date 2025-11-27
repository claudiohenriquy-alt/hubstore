const axios = require('axios');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { method, product } = req.body;

    if (!product || !method) {
      return res.status(400).json({ error: 'Missing product or method' });
    }

    const API_URL = process.env.ABACATEPAY_API_URL || 'https://api.abacatepay.com/v1';
    const API_TOKEN = process.env.ABACATEPAY_BEARER_TOKEN;

    if (!API_TOKEN) {
      // Fallback for demo purposes if env var is missing
      console.warn("Missing ABACATEPAY_BEARER_TOKEN. Using mock response.");
      return mockResponse(res, method, product);
    }

    // Amount in cents
    const amount = Math.round(product.price * 100);

    // Construct Payload for AbacatePay
    const billingPayload = {
      amount: amount,
      currency: 'BRL',
      description: `Compra: ${product.title}`,
      payment_method: method === 'pix' ? 'pix' : 'credit_card',
      // Usually requires customer info, adding placeholders
      customer: {
        name: "Cliente HubStore",
        email: "cliente@exemplo.com",
        tax_id: "000.000.000-00" // CPF placeholder
      },
      products: [
        {
            name: product.title,
            quantity: 1,
            unit_price: amount
        }
      ]
    };

    // Call AbacatePay API
    const response = await axios.post(`${API_URL}/billing/create`, billingPayload, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;

    if (method === 'pix') {
      return res.status(200).json({
        success: true,
        pix_qr_code: data.pix?.qr_code_base64,
        pix_payload: data.pix?.qr_code,
        expires_at: data.pix?.expires_at
      });
    } else {
      return res.status(200).json({
        success: true,
        checkout_url: data.checkout_url || data.payment_url
      });
    }

  } catch (error) {
    console.error('Payment Error:', error.response?.data || error.message);
    return res.status(500).json({ 
      error: 'Erro ao processar pagamento com gateway.',
      details: error.response?.data 
    });
  }
};

// Helper for Mock Data when no API Token is present
function mockResponse(res, method, product) {
  if (method === 'pix') {
    return res.status(200).json({
      success: true,
      // This is a dummy PIX code
      pix_payload: "00020126330014BR.GOV.BCB.PIX01110000000000052040000530398654041.005802BR5913HubStore Demo6008Brasilia62070503***63041234",
      expires_at: new Date(Date.now() + 3600000).toISOString()
    });
  } else {
    return res.status(200).json({
      success: true,
      checkout_url: "https://abacatepay.com/checkout/demo_123456"
    });
  }
}
