# Radar Patriota — Contexto para Claude

## Stack
- Backend: Node.js + Express + Baileys (WhatsApp) — `backend/src/`
- Frontend: Next.js 14 App Router + TypeScript + Tailwind — `frontend/src/app/`
- DB: `node:sqlite` DatabaseSync — SÍNCRONO, NUNCA usar await em chamadas de DB
- AI: Gemini 2.5 Flash + Google Search grounding via HTTPS raw
- Deploy: Render Starter $7/mês (backend) + Vercel (frontend)

## Arquivos-chave
- `backend/src/whatsapp.js` — Baileys com dynamic import(), QR code, sendMessage
- `backend/src/services/news.js` — Gemini, busca notícias conservadoras
- `backend/src/services/scheduler.js` — cron 8h, runDailyEdition(force?)
- `backend/src/services/payment.js` — MercadoPago preapproval API
- `backend/src/routes/webhook.js` — MP webhook, ativa assinantes automaticamente
- `backend/src/routes/admin.js` — endpoints protegidos por x-admin-key
- `backend/src/db.js` — ORM síncrono sobre SQLite
- `frontend/src/app/page.tsx` — landing page de vendas

## Env vars (Render backend)
GEMINI_API_KEY | MERCADOPAGO_ACCESS_TOKEN | ADMIN_SECRET_KEY=radar-admin-2026 | BACKEND_URL | FRONTEND_URL

## Env vars (Vercel frontend)
NEXT_PUBLIC_BACKEND_URL=https://radar-patriota-backend.onrender.com

## Padrões críticos
- DB SÍNCRONO: prisma.subscriber.findMany() sem await
- Baileys: dynamic import — `const { default: makeWASocket } = await import('@whiskeysockets/baileys')`
- Auth WhatsApp: persistido em /var/data/auth (Render disk)
- DB: persistido em /var/data/radar.db (Render disk)
- Delay entre envios: 1.5-2.5s aleatório (evitar ban WhatsApp)

## URLs (após deploy)
- Backend: https://radar-patriota-backend.onrender.com
- Frontend: https://radar-patriota.vercel.app

## Comandos
- Force edition: `curl -X POST .../api/admin/run-edition?force=true -H "x-admin-key: radar-admin-2026"`
- Stats: `curl .../api/admin/stats -H "x-admin-key: radar-admin-2026"`
- Test msg: `curl -X POST .../api/admin/send-test -H "x-admin-key: radar-admin-2026" -H "Content-Type: application/json" -d "{\"phone\":\"SEU_NUM\",\"message\":\"teste\"}"`
- Ativar assinante: `curl -X PUT .../api/admin/subscriber/1/activate -H "x-admin-key: radar-admin-2026"`

## Comportamento (economizar tokens)
- Respostas curtas, sem introdução nem resumo final
- Grep > Read | Read com offset+limit quando possível
- Não reler arquivo após Edit
