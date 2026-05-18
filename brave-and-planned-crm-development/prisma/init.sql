PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

CREATE TABLE IF NOT EXISTS "Teacher" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "specialty" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Student" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "parentPhone" TEXT NOT NULL,
  "birthDate" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "Student_firstName_lastName_idx" ON "Student"("firstName", "lastName");
CREATE INDEX IF NOT EXISTS "Student_status_idx" ON "Student"("status");

CREATE TABLE IF NOT EXISTS "Group" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "schedule" TEXT NOT NULL,
  "monthlyFee" INTEGER NOT NULL,
  "startDate" DATETIME NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "teacherId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Group_teacherId_idx" ON "Group"("teacherId");
CREATE INDEX IF NOT EXISTS "Group_isActive_idx" ON "Group"("isActive");

CREATE TABLE IF NOT EXISTS "GroupStudent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "groupId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" DATETIME,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "GroupStudent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "GroupStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "GroupStudent_groupId_idx" ON "GroupStudent"("groupId");
CREATE INDEX IF NOT EXISTS "GroupStudent_studentId_idx" ON "GroupStudent"("studentId");
CREATE INDEX IF NOT EXISTS "GroupStudent_isActive_idx" ON "GroupStudent"("isActive");

CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "groupId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "date" DATETIME NOT NULL,
  "status" TEXT NOT NULL,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attendance_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_groupId_studentId_date_key" ON "Attendance"("groupId", "studentId", "date");
CREATE INDEX IF NOT EXISTS "Attendance_groupId_date_idx" ON "Attendance"("groupId", "date");
CREATE INDEX IF NOT EXISTS "Attendance_studentId_date_idx" ON "Attendance"("studentId", "date");

CREATE TABLE IF NOT EXISTS "Payment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "amountDue" INTEGER NOT NULL,
  "amountPaid" INTEGER NOT NULL DEFAULT 0,
  "dueDate" DATETIME NOT NULL,
  "paidAt" DATETIME,
  "status" TEXT NOT NULL DEFAULT 'UNPAID',
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Payment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Payment_studentId_groupId_month_key" ON "Payment"("studentId", "groupId", "month");
CREATE INDEX IF NOT EXISTS "Payment_month_status_idx" ON "Payment"("month", "status");
CREATE INDEX IF NOT EXISTS "Payment_groupId_idx" ON "Payment"("groupId");

CREATE TABLE IF NOT EXISTS "SmsLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "month" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "responsePayload" TEXT,
  "sentAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SmsLog_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SmsLog_studentId_month_idx" ON "SmsLog"("studentId", "month");

CREATE TABLE IF NOT EXISTS "Transfer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "fromGroupId" TEXT NOT NULL,
  "toGroupId" TEXT NOT NULL,
  "transferDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "proratedAmount" INTEGER NOT NULL,
  "note" TEXT,
  CONSTRAINT "Transfer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Transfer_fromGroupId_fkey" FOREIGN KEY ("fromGroupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Transfer_toGroupId_fkey" FOREIGN KEY ("toGroupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Transfer_studentId_transferDate_idx" ON "Transfer"("studentId", "transferDate");

CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "entityId" TEXT,
  "description" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ActivityLog_module_createdAt_idx" ON "ActivityLog"("module", "createdAt");
