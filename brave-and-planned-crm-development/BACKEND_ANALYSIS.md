# 🔍 BACKEND ANALYSIS: Brave & Planned CRM

## Project Audit Report for Vercel + Neon SQL Deployment

**Analysis Date:** April 28, 2026  
**Status:** ⚠️ Backend incomplete — Frontend-only SPA with database schema but no API integration

---

## 📋 EXECUTIVE SUMMARY

The project is a **React Vite SPA with disconnected Prisma backend**:

- ✅ Frontend: Fully functional Vite React app (builds successfully)
- ✅ Database Schema: Well-designed Prisma schema for PostgreSQL
- ❌ Backend API: Routes exist but unreachable (Next.js format, but no `next` dependency)
- ❌ Frontend-DB Integration: **Zero API calls** — all data stored in localStorage
- ❌ Deployment Ready: No, critical infrastructure missing for Vercel/Neon

**Impact:** App will not persist data to Neon SQL database in current state. All work is lost on logout.

---

## 🚨 CRITICAL ISSUES (Blocking Deployment)

### 1. **Architecture Mismatch: SPA ≠ Backend Routes**

- **Problem:**
  - `app/api/health/route.ts` and `app/api/setup/bootstrap-owner/route.ts` are written in **Next.js app-router format**
  - `package.json` has **no `next` dependency** — it only has Vite + React
  - Result: Those API routes are **dead code** — they won't execute anywhere
- **Impact:** No backend will run on Vercel
- **Fix Required:**
  - Option A: Install `next` and convert project to Next.js full-stack
  - Option B: Rewrite API routes as Vercel serverless functions OR standalone Express/Node server

### 2. **Zero Frontend-Backend Integration**

- **Problem:**
  - All CRUD operations (saveStudent, deleteTeacher, etc.) in `App.tsx` update **localStorage only**
  - Prisma `@prisma/client` is imported in `package.json` but **never used** from frontend
  - No `fetch()`, `axios`, or HTTP client calls to any backend endpoint
  - `NEXT_PUBLIC_API_URL` env var exists but **empty and unused**
- **Impact:** No data reaches database; user changes disappear on session end
- **Fix Required:** Write API endpoints + integrate frontend HTTP calls (fetch/axios)

### 3. **No Database Migrations**

- **Problem:**
  - `prisma/migrations/` folder is **empty**
  - Schema exists but has never been migrated to any database (local or Neon)
  - Running on Neon requires migrations to be pushed before app start
- **Impact:** Vercel deploy will fail at `prisma migrate deploy` step
- **Fix Required:**
  - Create initial migration: `npx prisma migrate dev --name init`
  - Commit to repo (migrations must be version-controlled)

### 4. **Build Script Missing Prisma Generate**

- **Problem:**
  - `npm run build` calls only `vite build`, does not call `prisma generate`
  - In serverless/Vercel environment, PrismaClient won't be available unless generated
  - TypeScript also won't recognize Prisma types
- **Impact:** Deploy to Vercel → API fails with "PrismaClient module not found"
- **Fix Required:** Add `prisma generate` before build: `"build": "prisma generate && vite build"`

### 5. **No Environment Variables Configured**

- **Problem:**
  - `.env` has **localhost PostgreSQL only** (DATABASE_URL, DIRECT_URL point to `localhost:5432`)
  - For Neon: these need Neon connection strings
  - `AUTH_SECRET`, `ESKIZ_*` credentials are empty or placeholder
  - Vercel doesn't auto-load `.env` — must use Vercel UI Environment Variables
- **Impact:** Deploy will use localhost credentials → API can't reach Neon → fails
- **Fix Required:**
  - Get Neon connection strings (pool + direct)
  - Set in Vercel project settings under Environment Variables

### 6. **TypeScript Config Excludes Backend**

- **Problem:**
  - `tsconfig.json` has `"include": ["src", "vite.config.ts"]`
  - Backend folder `app/` is **not included** in TypeScript compilation
  - Result: IDE doesn't typecheck API routes; potential runtime errors
- **Impact:** Silent bugs in backend code
- **Fix Required:** Update tsconfig to include `app/` or create separate `tsconfig.backend.json`

### 7. **No API Endpoints for CRUD Operations**

- **Problem:**
  - Only 2 endpoints exist: `/api/health` and `/api/setup/bootstrap-owner`
  - **Missing endpoints for all business logic:**
    - Students: GET, POST, PUT, DELETE
    - Teachers: GET, POST, PUT, DELETE
    - Groups: GET, POST, PUT, DELETE
    - Attendance: GET, POST
    - Payments: GET, POST
    - SMS/Debtor: POST
- **Impact:** Frontend can't save any data to database
- **Fix Required:** Implement full CRUD API with Prisma

---

## 🗄️ DATABASE & PRISMA ISSUES

### 8. **Seed Not Production-Ready**

- **Problem:**
  - `prisma/seed.ts` exists but seed script **not in package.json**
  - Command to run it is unclear for deployment (ts-node, tsx, node, etc.?)
  - Seed logic creates conflicting relations (teachers assigned to groups, but then groups reassigned to null)
- **Impact:** Inconsistent demo data on first deploy
- **Fix Required:**
  ```json
  "seed": "ts-node prisma/seed.ts"
  ```
  Or use `tsx` instead of `ts-node` for better ESM support

### 9. **Prisma Data Proxy Not Configured**

- **Problem:**
  - Schema uses `directUrl` (good for serverless) but has no connection pooling setup
  - Serverless functions + Neon need explicit pooling config to avoid connection exhaustion
  - Neon's default pooling or PgBouncer should be configured
- **Impact:** Deploy works locally but fails at scale on Vercel (too many connections)
- **Fix Required:**
  - Use Neon's built-in pool URL or
  - Add Prisma pooling config (waiting list, timeout settings)

### 10. **No Prisma Client Singleton for Serverless**

- **Problem:**
  - Each API route creates `new PrismaClient()` without reusing instance
  - In serverless, this creates connection leak (each cold start = new connection)
- **Impact:** Neon connection limit exceeded → 429 errors
- **Fix Required:** Create `lib/prisma.ts` singleton:

  ```typescript
  import { PrismaClient } from "@prisma/client";

  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  export const prisma = globalForPrisma.prisma || new PrismaClient();

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  ```

---

## 🔐 ENVIRONMENT & SECRETS

### 11. **Missing/Incomplete Env Variables**

Current state:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brave_crm"  ← localhost, won't work on Vercel
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/brave_crm"    ← localhost, won't work on Vercel
AUTH_SECRET="dev-secret"                                                ← placeholder, unsafe
ESKIZ_EMAIL=""                                                          ← empty
ESKIZ_PASSWORD=""                                                       ← empty
SMS_FROM="4546"
NEXT_PUBLIC_API_URL=""                                                 ← empty, frontend needs this
```

Required for Vercel/Neon:

- `DATABASE_URL` = Neon connection string (with pool endpoint)
- `DIRECT_URL` = Neon direct connection (for migrations)
- `AUTH_SECRET` = secure random string (for JWT/sessions)
- `NEXT_PUBLIC_API_URL` = deployed API base URL (e.g., `https://yourapp.vercel.app/api`)
- `ESKIZ_EMAIL`, `ESKIZ_PASSWORD` = actual Eskiz SMS credentials (or remove if not using)

**Fix Required:** Set these in Vercel project Environment Variables UI (not in `.env`)

### 12. **No .env.local or .env.production**

- **Problem:**
  - Single `.env` file used for all environments
  - Vercel will use project-level env vars, but `.env` stays as development template
- **Impact:** Manual secret management required
- **Fix Required:** Create `.env.production` template or use Vercel's built-in secret manager

---

## 🏗️ BUILD & DEPLOYMENT ISSUES

### 13. **No Build Optimization for Serverless**

- **Problem:**
  - `npm run build` produces Vite SPA bundle only
  - No backend build step for Vercel Functions
  - No separate entry points for API vs. static site
- **Impact:** Vercel doesn't know how to build/deploy backend
- **Fix Required:**
  - Create separate build scripts or
  - Use `next build` if converting to Next.js, or
  - Configure Vercel function build for `app/api` routes

### 14. **Missing Vercel Configuration**

- **Problem:**
  - No `vercel.json` file
  - No build command specified
  - No environment configuration
- **Impact:** Vercel uses defaults (may not work for this hybrid setup)
- **Fix Required:** Create `vercel.json`:
  ```json
  {
    "buildCommand": "npm run prisma:generate && npm run build",
    "outputDirectory": "dist",
    "env": ["DATABASE_URL", "DIRECT_URL", "AUTH_SECRET", "NEXT_PUBLIC_API_URL"]
  }
  ```

### 15. **No Node Version Pinned**

- **Problem:**
  - No `engines.node` in `package.json`
  - Vercel uses default (currently Node 18+), but may change
  - Prisma version 6.0.1 requires Node 16+
- **Impact:** Version mismatch errors in future deployments
- **Fix Required:**
  ```json
  "engines": { "node": ">=18.0.0" }
  ```

### 16. **Vite Build Output Not Vercel-Compatible**

- **Problem:**
  - Using `vite-plugin-singlefile` to bundle frontend into single HTML file
  - Vercel static hosting expects multiple files (HTML, CSS, JS separately)
  - Single-file bundle will work but is not optimized for Vercel's caching
- **Impact:** Slower initial load, poor cache efficiency
- **Fix Required:** Remove `vite-plugin-singlefile` for production build (keep single file only for specific use case)

---

## 📡 API INTEGRATION ISSUES

### 17. **No HTTP Client Configured**

- **Problem:**
  - Frontend doesn't have `fetch` setup, axios, or similar
  - No request interceptors for auth headers, error handling, retry logic
- **Impact:** API integration will be ad-hoc and error-prone
- **Fix Required:** Create API client utility:
  ```typescript
  // src/lib/api.ts
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  export const api = {
    get: (path: string) => fetch(`${API_URL}${path}`).then(r => r.json()),
    post: (path: string, body: any) => fetch(...),
    // etc
  }
  ```

### 18. **No Authentication Integration**

- **Problem:**
  - Auth is currently localStorage only (username/password validation in frontend)
  - No real login/logout with server sessions or JWTs
  - `AUTH_SECRET` exists in env but unused
- **Impact:** No actual authentication on API layer; anyone with network access can call API
- **Fix Required:**
  - Implement JWT or session-based auth
  - Validate token on every API request
  - Store sessions in Prisma

### 19. **No Error Handling for API Failures**

- **Problem:**
  - If backend is down, frontend has no fallback
  - No retry logic, timeout handling, or user feedback for API errors
- **Impact:** Poor UX when API fails
- **Fix Required:** Add error boundaries + API error handlers in frontend

---

## 📊 DATABASE SCHEMA ISSUES

### 20. **Schema Inconsistencies**

- **Problem:**
  - `Teacher.groupIds` stored as array (Prisma `String[]`) instead of proper relation
  - Same for `Student.groupIds` and `Group.teacherId`
  - Schema has `StudentGroup` relation table but also raw IDs in arrays
  - This mixing causes data sync issues and query complexity
- **Impact:** Risk of orphaned records, complex queries
- **Fix Required:**
  - Remove `groupIds` arrays
  - Use proper Prisma relations only:
    ```prisma
    model Student {
      id String @id
      groups StudentGroup[]  // relation, not array
    }
    ```

### 21. **No Indexes for Performance**

- **Problem:**
  - No indexes on foreign keys: `studentId`, `groupId`, `teacherId`
  - `smsLogs` query uses composite key but no index
- **Impact:** Slow queries as data grows
- **Fix Required:**
  ```prisma
  model Attendance {
    @@index([studentId])
    @@index([lessonId])
  }
  ```

### 22. **No Soft Delete / Audit Trail**

- **Problem:**
  - Deleted records are gone forever
  - No audit log of who changed what
  - No way to recover deleted students/teachers
- **Impact:** No compliance, hard to debug data issues
- **Fix Required:** Add `deletedAt` field and query filters

---

## ⚙️ CODE QUALITY ISSUES

### 23. **Plain Text Passwords**

- **Problem:**
  - User and Teacher passwords stored as plain text in database
  - `password: "brave123"` in seed data
  - No password hashing
- **Impact:** Critical security vulnerability
- **Fix Required:**
  - Install `bcrypt` or `argon2`
  - Hash passwords before saving
  - Never log/display passwords

### 24. **No CORS Configuration**

- **Problem:**
  - Frontend and backend will be on different Vercel domains
  - API routes have no CORS headers
- **Impact:** Fetch requests from frontend will fail with CORS error
- **Fix Required:** Add CORS headers to all API responses:
  ```typescript
  export async function POST(req) {
    const response = new Response(...);
    response.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_API_URL);
    return response;
  }
  ```

### 25. **No Input Validation on Backend**

- **Problem:**
  - API routes don't validate request body (no zod, joi, etc.)
  - Any malformed data crashes or causes DB errors
- **Impact:** API crashes, data corruption
- **Fix Required:**
  - Install validation library: `npm install zod`
  - Validate all inputs before Prisma calls

### 26. **No Rate Limiting**

- **Problem:**
  - API endpoints unprotected against spam/brute-force
- **Impact:** Neon connection limit can be exhausted by attacker
- **Fix Required:** Add rate limiting middleware

---

## 🚀 DEPLOYMENT READINESS CHECKLIST

- [ ] Convert to Next.js (recommended) OR rewrite API in serverless format
- [ ] Create Prisma migrations: `npx prisma migrate dev --name init`
- [ ] Implement all CRUD API endpoints
- [ ] Integrate frontend HTTP calls to API
- [ ] Hash passwords (use bcrypt)
- [ ] Implement JWT/session authentication
- [ ] Add input validation on all endpoints
- [ ] Add CORS headers
- [ ] Create Prisma singleton pattern for serverless
- [ ] Create `vercel.json` config
- [ ] Update `package.json` build script: `prisma generate && vite build`
- [ ] Add `engines.node` to package.json
- [ ] Create `.env.production` template
- [ ] Get Neon connection strings (pool + direct URLs)
- [ ] Set Vercel environment variables
- [ ] Add error handling in frontend
- [ ] Test locally with Neon database (optional: use Neon branch)
- [ ] Deploy to Vercel and run migrations
- [ ] Run seed (if needed)
- [ ] Smoke test API endpoints from deployed frontend

---

## 🎯 RECOMMENDED DEPLOYMENT STRATEGY

### **Option 1: Convert to Next.js (RECOMMENDED)**

✅ **Simplest:** Current `app/api` routes already work, just add `next` dependency

- `npm install next`
- Remove Vite config, create `next.config.js`
- Move `src/` to `app/` or keep as `src/app/`
- Run `npm run build` (Next.js handles everything)
- Deploy to Vercel (1-click setup recognizes Next.js)

### **Option 2: Keep Vite Frontend + Separate Serverless Backend**

⚠️ **More Work:** Two build pipelines, separate Vercel configs

- Frontend: `npm run build` → deploy to Vercel static hosting
- Backend: Rewrite `app/api` as standalone serverless functions → deploy separately or to same Vercel project but different routes

### **Option 3: Monorepo**

❓ **Cleanest for Large Teams:** Separate `apps/web` and `apps/api`

- Use Turbo or Nx
- More complex to set up initially

**Recommendation: Go with Option 1 (Next.js) — fastest path to production.**

---

## 📝 NEXT STEPS (Priority Order)

1. **Decide:** Next.js or separate serverless?
2. **Database:** Create initial Prisma migration
3. **Environment:** Set up Neon, get connection strings
4. **API:** Implement CRUD endpoints (all missing ones)
5. **Frontend:** Add fetch calls to API instead of localStorage
6. **Security:** Hash passwords, add auth, add validation
7. **Config:** Create vercel.json, update package.json
8. **Deploy:** Test locally, then deploy to Vercel
9. **Seed:** Run migrations + seed on Neon
10. **Test:** End-to-end test all features

---

## 📞 CONTACT & DEBUGGING

- **Neon Docs:** https://neon.tech/docs
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Common Issues:** Check `.env` vars, Node version, prisma generate in build
