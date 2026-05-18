# 🚀 Brave & Planned CRM - Next.js 14 Production Build

## ✅ COMPLETED (Phase 1)

### Project Setup

- [x] Next.js 14 configured with app router
- [x] TypeScript strict mode configured
- [x] Tailwind CSS with custom color variables (#FFD662 primary, #422057 background)
- [x] PostCSS & Autoprefixer setup

### Database & ORM

- [x] Prisma schema fully defined with proper relations & indexes
- [x] Database models: User, Teacher, Student, Group, Attendance, Payment, SmsLog
- [x] Enums: Role (OWNER/MANAGER/TEACHER), StudentStatus, AttendanceStatus, PaymentStatus, SmsStatus

### Authentication

- [x] NextAuth.js v5 configured (JWT strategy, Credentials provider)
- [x] Middleware setup with protected routes
- [x] Password hashing with bcryptjs
- [x] Session callbacks properly configured

### Libraries & Utilities

- [x] Prisma singleton pattern (lib/prisma.ts)
- [x] Zod schemas for all inputs (lib/validations.ts)
- [x] Permissions system (lib/permissions.ts)
- [x] Eskiz SMS integration (lib/eskiz.ts)

### API Routes

- [x] GET `/api/health` - DB health check
- [x] POST `/api/setup/bootstrap-owner` - One-time owner creation
- [x] GET|POST `/api/auth/[...nextauth]` - NextAuth handler
- [ ] **IN PROGRESS:** CRUD endpoints for Students, Teachers, Groups
- [ ] **TODO:** Attendance & Payment endpoints
- [ ] **TODO:** SMS endpoints

### Frontend Pages

- [x] /login - Authentication page with demo credentials
- [x] Root layout with Toaster setup
- [ ] /dashboard - Stats, recent data
- [ ] /students - List, add, edit, delete students
- [ ] /teachers - List, add, edit, delete teachers
- [ ] /groups - List, add, edit groups
- [ ] /attendance - Mark attendance
- [ ] /payments - Manage payments, view debtors
- [ ] /debtors - Debtor list with SMS

### UI Components & Styling

- [x] Global CSS with CSS variables for theme
- [x] Tailwind utilities (btn, input, badge, card, table)
- [x] Color system implemented and ready
- [ ] Reusable components (Button, Modal, Input, Select, Badge, LoadingSpinner, etc.)
- [ ] Layout components (Sidebar, Header)
- [ ] Table components
- [ ] Form components

### Data & Configuration

- [x] Prisma seed.ts with demo data (6 students, 3 groups, 2 teachers, payments, attendance)
- [x] vercel.json with build & deploy config
- [x] .env.example updated
- [x] package.json updated with all dependencies

---

## ❌ REMAINING WORK (Phase 2 & 3)

### API Routes (Priority: HIGH)

```
POST   /api/students              → Create student + add Eskiz contact
GET    /api/students              → List (role-filtered)
GET    /api/students/[id]
PUT    /api/students/[id]
DELETE /api/students/[id]         → OWNER only
POST   /api/students/[id]/groups  → Add student to group
DELETE /api/students/[id]/groups/[groupId]

POST   /api/teachers              → Create teacher + user
GET    /api/teachers              → List teachers
GET    /api/teachers/[id]
PUT    /api/teachers/[id]
DELETE /api/teachers/[id]         → OWNER only

POST   /api/groups                → Create group
GET    /api/groups                → List (teacher sees own only)
GET    /api/groups/[id]
PUT    /api/groups/[id]
DELETE /api/groups/[id]           → OWNER only

GET    /api/attendance?groupId=&date= → Get attendance
POST   /api/attendance                 → Save attendance (upsert)

GET    /api/payments?groupId=&month=  → List
POST   /api/payments/bulk             → Mark multiple paid/unpaid
GET    /api/payments/debtors          → Unpaid after 15th

POST   /api/sms/send                  → Send SMS + save SmsLog
GET    /api/sms/logs?studentId=       → SMS history
```

Each route must:

1. Call `auth()` to get session
2. Check permissions via `can.*` helpers
3. Validate body with Zod
4. Handle CORS (OPTIONS method)
5. Return proper HTTP status codes
6. Return `{ error: string }` on failure

### Frontend Pages (Priority: HIGH)

#### /dashboard

- 4 stat cards: Students, Groups, Revenue, Debtors
- Recent payments table
- Group capacity list
- Teacher-filtered view for TEACHER role

#### /students

- Search bar + Add button
- Table: name, phone, groups, status, actions
- Modal: Add/Edit with all fields + group multi-select
- Delete button (OWNER only)
- Bulk operations (optional)

#### /teachers

- Table: fullName, username, phone, groups count, isActive toggle
- Add Teacher modal (creates User + Teacher transaction)
- Edit modal
- Delete button (OWNER only)

#### /groups

- Card layout or table view
- Fields: name, teacher, schedule days (pills), time, monthly fee, capacity
- Add/Edit modal with schedule day checkboxes (Mon–Sat)
- Teacher dropdown
- Delete (OWNER only)

#### /attendance

- Step 1: Select group + date picker
- Step 2: Table of students with radio buttons
- Save button with loading state

#### /payments

- Tabs: "To'lovlar" | "Qarzdorlar"
- Payments: Select group + month → table with toggle (Paid/Unpaid)
- Amount hidden for MANAGER role
- Debtors: List with SMS button per row

### UI Components (Priority: MEDIUM)

```
components/
├── ui/
│   ├── Button.tsx          → All variants
│   ├── Modal.tsx           → Centered, dark backdrop
│   ├── Input.tsx           → Dark bg, yellow focus
│   ├── Select.tsx
│   ├── Badge.tsx           → Status badges
│   ├── LoadingSpinner.tsx  → Yellow spinner
│   ├── SearchInput.tsx
│   ├── EmptyState.tsx
│   └── Table.tsx
├── layout/
│   ├── Sidebar.tsx         → Logo, nav, user badge
│   ├── Header.tsx          → Hamburger, title, logout
│   └── DashboardLayout.tsx → Wrapper for all dashboard pages
└── forms/
    ├── StudentForm.tsx
    ├── TeacherForm.tsx
    ├── GroupForm.tsx
    └── AttendanceForm.tsx
```

---

## 🚀 NEXT STEPS (DO THESE IN ORDER)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create Initial Prisma Migration

```bash
npx prisma migrate dev --name init
```

This will:

- Create PostgreSQL tables from schema
- Generate Prisma client
- Ask if you want to seed data

### Step 3: Build Remaining API Routes

Build all CRUD endpoints following the pattern in `/api/health/route.ts`:

1. Import auth, prisma, Zod schema
2. Check permissions
3. Validate input
4. Query/mutate database
5. Return JSON

### Step 4: Build Dashboard Layout & Components

Create `components/layout/DashboardLayout.tsx` with:

- Sidebar (fixed on desktop, overlay on mobile)
- Header with hamburger + title
- Mobile responsive

### Step 5: Build All Pages

Start with `/dashboard` as it's the entry point after login.

### Step 6: Test Locally

```bash
npm run dev
# Login with: admin / admin123
# Create Neon database, update .env, run migrations
```

### Step 7: Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel project settings:
   - DATABASE_URL (from Neon)
   - DIRECT_URL (from Neon)
   - AUTH_SECRET (generate: `openssl rand -base64 32`)
   - ESKIZ\_\* (if using SMS)
4. Deploy

---

## 📐 BUILD PATTERN FOR API ROUTES

```typescript
// app/api/students/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { studentSchema } from "@/lib/validations";
import { checkPermission } from "@/lib/permissions";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.role) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!checkPermission(session.user.role, "manageStudents")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await req.json();
    const validated = studentSchema.parse(body);

    const student = await prisma.student.create({
      data: validated,
    });

    return Response.json(student, { status: 201 });
  } catch (error) {
    console.error("POST /api/students failed:", error);
    return Response.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.role) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where: any = {};
    if (session.user.role === "TEACHER") {
      // Teachers see only their students (filtered by group)
      const teacherGroups = await prisma.group.findMany({
        where: { teacherId: session.user.teacherId },
        select: { id: true },
      });
      where = {
        groups: {
          some: {
            groupId: {
              in: teacherGroups.map((g) => g.id),
            },
          },
        },
      };
    }

    const students = await prisma.student.findMany({ where });
    return Response.json(students);
  } catch (error) {
    console.error("GET /api/students failed:", error);
    return Response.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}
```

---

## 🎨 COLOR REFERENCE

Use these in all components (available as CSS variables):

```
--primary:        #FFD662  (Lime Yellow)
--primary-dark:   #E8C442
--background:     #422057  (Dark Purple)
--sidebar:        #2d1540
--card-bg:        rgba(255,255,255,0.06)
--border:         rgba(255,214,98,0.15)
--text-primary:   #FFD662
--text-secondary: rgba(255,255,255,0.7)
--text-tertiary:  rgba(255,255,255,0.5)
--success:        #4ade80
--danger:         #f87171
--warning:        #facc15
--info:           #38bdf8
```

---

## 📋 VERIFICATION CHECKLIST

After completing Phase 2:

- [ ] npm run dev → No errors
- [ ] GET /api/health → returns { status: "ok", db: "connected" }
- [ ] POST /api/setup/bootstrap-owner → creates owner (409 if exists)
- [ ] Login with admin/admin123 → redirects to /dashboard
- [ ] All CRUD endpoints respond correctly
- [ ] Permissions work (teacher sees only own data)
- [ ] SMS integration ready (if credentials configured)
- [ ] Mobile responsive on all pages
- [ ] Toast notifications work

---

## 🔗 USEFUL COMMANDS

```bash
# Development
npm run dev              # Start dev server
npm run db:studio       # Open Prisma Studio
npm run lint            # Check TypeScript/linting

# Database
npm run db:migrate      # Run pending migrations
npm run db:seed        # Run seed script

# Production
npm run build           # Build for production
npm start              # Start production server

# Testing
curl http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/setup/bootstrap-owner \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","confirmPassword":"admin123"}'
```

---

## 🆘 TROUBLESHOOTING

**Error: "PrismaClient" is not defined**
→ Make sure you're using the singleton from `lib/prisma.ts`, not creating new instances

**Error: "DATABASE_URL is missing"**
→ Create .env file (copy from .env.example) with real Neon connection strings

**Error: Prisma migration not found**
→ Run `npx prisma migrate dev --name init` to create initial migration

**Error: NextAuth session is null**
→ Make sure you're calling `const session = await auth()` from `auth.ts`

**Mobile Sidebar not working**
→ Check that Header.tsx implements mobile-responsive state

---

**Build Status:** Phase 1 ✅ | Phase 2 🚧 | Phase 3 ⏳

Good luck! 🎉
