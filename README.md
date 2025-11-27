# HubStore

**HubStore** é uma plataforma moderna de catálogo digital (vitrine) desenvolvida com React, TypeScript e Tailwind CSS, integrada a um backend Serverless (Vercel Functions) para processamento de pagamentos via AbacatePay (PIX e Cartão).

## 🚀 Tecnologias

- **Frontend**: React 18, Tailwind CSS, TypeScript.
- **Backend**: Node.js (Serverless Functions), Axios.
- **Integração**: AbacatePay Gateway.

## 📁 Estrutura de Arquivos

- `src/` (raiz conceitual do frontend React)
  - `components/`: Componentes visuais (Card, Modal).
  - `types.ts`: Definições de tipos.
  - `App.tsx`: Lógica principal e Layout.
- `api/`: Funções Serverless.
  - `create-payment.js`: Criação de cobranças.
  - `webhook.js`: Recebimento de notificações de pagamento.

## 🛠️ Como Rodar Localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento (Frontend):
   ```bash
   npm start
   ```
   *Nota: Para testar a API localmente, recomenda-se usar `vercel dev`.*
3. Instale a CLI da Vercel:
   ```bash
   npm i -g vercel
   ```
4. Rode o ambiente completo:
   ```bash
   vercel dev
   ```

## ☁️ Deploy na Vercel

1. Crie um repositório Git e suba os arquivos.
2. Importe o projeto no dashboard da Vercel.
3. Configure as **Environment Variables**:
   - `ABACATEPAY_API_URL`: URL da API (ex: `https://api.abacatepay.com/v1`)
   - `ABACATEPAY_BEARER_TOKEN`: Seu token de API.
   - `WEBHOOK_SECRET`: (Opcional) Segredo para validar webhooks.
4. O Vercel detectará o `package.json` e o `vercel.json` automaticamente.

## 💳 Integração AbacatePay

- O fluxo de **PIX** gera um QR Code na tela (via `qrcode.react`).
- O fluxo de **Cartão** redireciona para o checkout da AbacatePay.

## 🧪 Testes (CURL)

Você pode testar a API diretamente:

**Criar Pagamento PIX:**
```bash
curl -X POST https://seu-projeto.vercel.app/api/create-payment \
  -H "Content-Type: application/json" \
  -d '{"method": "pix", "product": {"title": "Teste", "price": 10.00}}'
```

**Simular Webhook:**
```bash
curl -X POST https://seu-projeto.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "billing.paid", "data": {"id": "123"}}'
```
