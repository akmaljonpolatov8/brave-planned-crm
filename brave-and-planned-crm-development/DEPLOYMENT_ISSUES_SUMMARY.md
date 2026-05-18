# 🎯 BACKEND KAMCHILIKLARI — QISQA PROMPT

## 1. ASOSIY MUAMMO: Frontend-Backend Disconnected

**Masala:** Frontend (Vite React SPA) har qanday ma'lumotni `app/api/` endpointiga jo'natmaydi. Barcha o'zgarishlar `localStorage` saqlanadi, keyin yo'qolib ketadi.

**Natijai:** Neon SQL hech qanday ma'lumot olmaydi. Deploy qilyapsiz lekin data saqlamnadi.

---

## 2. NEXT.JS FORMATI LEKIN NEXT YO'Q

**Masala:**

- `app/api/health/route.ts` va `app/api/setup/bootstrap-owner/route.ts` — Next.js format
- `package.json` ichida `next` dependency yo'q
- Bu fayllar **ISHLMAYDI** Vercel'da

**Tuzatish:**

- Option A: `npm install next` → Next.js full-stack project ga aylantiring
- Option B: `app/api` fayllarni Vercel Serverless Functions formatiga qayta yozing

---

## 3. MIGRATIONS YO'QLI

**Masala:** `prisma/migrations/` papkasi bo'sh. Schema bor, lekin database kucha emas.

**Natijai:** `vercel deploy` → migrations deploy → fail → app offline

**Tuzatish:**

```bash
npx prisma migrate dev --name init
git add prisma/migrations/
git commit -m "Initial migration"
```

---

## 4. BUILD SCRIPT PRISMA GENERATE QILMAYDI

**Masala:** `npm run build` faqat Vite'ni build qiladi, `prisma generate` bo'lmaydi.

**Natijai:** Vercel Functions ishga tushganda PrismaClient buferida yo'q → crash

**Tuzatish:** `package.json`'da:

```json
"build": "prisma generate && vite build",
```

---

## 5. ENV VARIABLES BO'SH YA LOCALHOST

**Masala:**

- `DATABASE_URL` = `localhost:5432` (Vercel'da localhost yo'q)
- `NEXT_PUBLIC_API_URL` = empty (frontend API qayerga jo'natishni bilmaydi)
- `AUTH_SECRET` = placeholder
- `ESKIZ_*` = empty

**Tuzatish:** Neon'da DB yarating, Vercel project settings'ga qo'ying:

- `DATABASE_URL` = Neon pool URL
- `DIRECT_URL` = Neon direct URL
- `NEXT_PUBLIC_API_URL` = `https://yourapp.vercel.app/api`
- `AUTH_SECRET` = `openssl rand -base64 32`

---

## 6. HECH QANDAY API ENDPOINT YO'Q (Frontend-Backend Integration)

**Masala:**

- Faqat 2 endpoint: `/health`, `/bootstrap-owner`
- **Yo'q:** Students CRUD, Teachers CRUD, Groups CRUD, Attendance, Payments, SMS
- Frontend `NEXT_PUBLIC_API_URL` ishlatmaydi (bo'sh)
- Barcha save/delete amallar **localStorage** ga yoziladi

**Tuzatish:** Yozish kerak:

- POST `/api/students` — saqlash
- GET `/api/students` — o'qish
- PUT `/api/students/:id` — tahrirlash
- DELETE `/api/students/:id` — o'chirish
- (Hammasini Teachers, Groups, Attendance, Payments, SMS uchun)

Frontend'da:

```typescript
// Hozir:
setState((students) => [...students, newStudent]); // localStorage

// Kerakli:
const res = await fetch(`${NEXT_PUBLIC_API_URL}/students`, {
  method: "POST",
  body: JSON.stringify(studentData),
});
```

---

## 7. PLAIN TEXT PASSWORDS

**Masala:** Passwords database'da `plain text` saqlanadi. Seed data `password: "brave123"`.

**Tuzatish:**

```bash
npm install bcrypt @types/bcrypt
```

```typescript
import bcrypt from "bcrypt";
const hashedPassword = await bcrypt.hash(password, 10);
```

---

## 8. NO CORS CONFIGURATION

**Masala:** Frontend va Backend boshqa Vercel domain'larda bo'ladi. API requests fail with CORS error.

**Tuzatish:** Barcha API endpoints'ga CORS header qo'shing:

```typescript
response.headers.set("Access-Control-Allow-Origin", "*");
response.headers.set(
  "Access-Control-Allow-Methods",
  "GET,POST,PUT,DELETE,OPTIONS",
);
```

---

## 9. PRISMA CLIENT SERVERLESS PATTERN YO'Q

**Masala:** Har request'da `new PrismaClient()` yaratiladi → connection leak → Neon limit exceed.

**Tuzatish:** `lib/prisma.ts` yarating:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

## 10. NO INPUT VALIDATION

**Masala:** API requests validate bo'lmaydi. Bad data → crash yoki data corruption.

**Tuzatish:**

```bash
npm install zod
```

```typescript
import { z } from "zod";
const StudentSchema = z.object({
  firstName: z.string().min(1),
  // ...
});
StudentSchema.parse(body); // throws if invalid
```

---

## 11. NO AUTHENTICATION LAYER

**Masala:**

- Frontend auth faqat localStorage (plain text password compare)
- Hech qanday token/session
- Backend API har kim'ga ochiq

**Tuzatish:** JWT yoki session implement qiling:

```bash
npm install jsonwebtoken
```

---

## 12. SCHEMA DATA INTEGRITY ISSUES

**Masala:**

- `Student.groupIds` va `Teacher.groupIds` — array sifatida saqlanadi
- Aynini vaqtda `StudentGroup` table bor
- Duplication → sync issues

**Tuzatish:** Array'larni olib qo'ying, faqat proper relations qoling.

---

## 13. NO VERCEL CONFIG

**Masala:** No `vercel.json` — Vercel defaults ishlatadi, bu hybrid setup'da fail bo'ladi.

**Tuzatish:** Create `vercel.json`:

```json
{
  "buildCommand": "npm run prisma:generate && npm run build",
  "outputDirectory": "dist",
  "env": ["DATABASE_URL", "DIRECT_URL", "AUTH_SECRET", "NEXT_PUBLIC_API_URL"]
}
```

---

## 14. TSCONFIG APP FOLDER EXCLUDE QILADI

**Masala:** `tsconfig.json` da `"include": ["src", "vite.config.ts"]` — `app/` type-check qilmaydi.

**Tuzatish:**

```json
"include": ["src", "app", "vite.config.ts"]
```

---

## 15. NO RATE LIMITING / NO ERROR HANDLING

**Masala:**

- API endpoints brute-force/spam'ga ochiq
- Frontend API errors handle qilmaydi

**Tuzatish:**

- Rate limiting middleware qo'shing
- Frontend'da try-catch + user feedback

---

## 🔥 DEPLOY QILMAGUNCHA KERAKLI ISHLAR (Priority):

1. ✅ **Neon SQL Setup:** DB yarating, connection strings oling
2. ❌ **Migrations:** `npx prisma migrate dev --name init`
3. ❌ **API Endpoints:** Hamma CRUD yo'l qo'shing (Students, Teachers, Groups, Attendance, Payments, SMS)
4. ❌ **Frontend Integration:** localStorage → fetch API
5. ❌ **Passwords:** bcrypt bilan hash qiling
6. ❌ **Authentication:** JWT/sessions implement qiling
7. ❌ **Validation:** zod yoki jo'i ishlatib qolib chiqing
8. ❌ **CORS:** Headers qo'shing
9. ❌ **Prisma Singleton:** lib/prisma.ts yarating
10. ❌ **Config:** vercel.json, package.json build script update
11. ❌ **Environment:** Vercel'da env vars set qiling
12. ❌ **Test:** Local + Vercel'da test qiling

---

## QAYSI YO'L TANLAYSIZ?

**Option A: Next.js'ga aylantiring (Recommended)**

- `npm install next`
- Vite config o'chirib, `next.config.js` qo'shing
- `app/api` aynan ishlaydi
- `npm run build` — Next.js boshqaradi
- Deploy to Vercel — 1-click

**Option B: Vite + Serverless (More Work)**

- Frontend: Vite build → static
- Backend: `app/api` qayta yozish kerak
- 2 ta build pipeline

**Tavsiyam: Option A (Next.js) — eng tez path.**

---

## 📍 Batafsil analiz: BACKEND_ANALYSIS.md faylida (26 ta muammo details).
