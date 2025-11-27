// /api/abacatepay/webhook-debug.ts
import { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { api: { bodyParser: true } };

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    // LOGS IMPORTANTES para verificar no Vercel
    console.log("DEBUG webhook called. query:", req.query);
    console.log("DEBUG headers preview:", JSON.stringify(req.headers).slice(0,2000));
    console.log("DEBUG body preview (first 2000 chars):", JSON.stringify(req.body).slice(0,2000));

    // Retorna detalhes simples para o curl / painel do AbacatePay
    return res.status(200).json({
      ok: true,
      debug: true,
      receivedQuery: req.query,
      receivedBodyPreview: (JSON.stringify(req.body) || "").slice(0,2000)
    });
  } catch (err) {
    console.error("DEBUG error:", err);
    return res.status(500).json({ error: "debug_internal_error", details: String(err) });
  }
}