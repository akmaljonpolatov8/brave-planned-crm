# Brave and Planet CRM

Brave and Planet ta'lim markazi uchun full-stack CRM. Frontend `React + Vite + TailwindCSS`, backend `Node.js + Express`, database `better-sqlite3`.

## Asosiy imkoniyatlar

- JWT login: `Owner/MrRobben10`, `Elbek/elbek3695`, `Doniyor/doniyor0000`
- Owner uchun tushum kartasi va umumiy analytics
- Manager uchun individual qarzdorlik va to'lov nazorati
- Guruhlar: create/edit/delete, detail sahifa, student roster, attendance calendar
- O'quvchilar: live search, profil, payment history, attendance history, transfer
- To'lovlar: group filter, `To'landi`, `Tahrirlash`
- Qarzdorlar: per-row SMS, bulk SMS
- Haftalik hisobot: jadval + bar ko'rinishi
- Excel import: preview + save, sheet parsing, teacher/group auto-create
- TextUp SMS integration va har kuni `00:01` scheduler

## Tuzilma

```text
brave-and-planned-crm-development/
├── client/
│   └── src/
│       ├── components/
│       ├── context/
│       └── pages/
├── server/
│   ├── db/
│   │   ├── database.js
│   │   ├── init.js
│   │   ├── schema.sql
│   │   └── seed.js
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── index.js
└── .env
```

## Ishga tushirish

1. `npm install`
2. `.env.example` asosida `.env` yarating
3. `npm run db:init`
4. `npm run db:seed`
5. `npm run dev`

## Build

- `npm run build:client`
- `npm run build`

## TextUp sozlamalari

```env
TEXTUP_API_KEY=your_textup_key
TEXTUP_API_SECRET=your_textup_secret
TEXTUP_API_URL=https://rest.smsportal.com/bulkmessages
JWT_SECRET=brave_planet_secret_2024
```

## Excel import

- `UMUMIY ROYHAT` sheet skip qilinadi
- qolgan sheetlar group sifatida olinadi
- teacher nomi oxirgi qavs ichidan olinadi
- `Ota nomeri`, `Ona nomeri`, `Telefon` ustunlari phone priority bilan saqlanadi
- preview endpoint: `POST /api/import/excel/preview`
- save endpoint: `POST /api/import/excel`

## Tekshirilgan oqimlar

- `npm run db:init`
- `npm run db:seed`
- `GET /api/health`
- `Owner` login
- groups API
- `npm run build:client`
