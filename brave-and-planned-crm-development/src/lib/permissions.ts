export type UserRole = "OWNER" | "MANAGER" | "TEACHER"

export const permissions = {
  seeAllStudents: (role: UserRole) => role !== "TEACHER",
  manageStudents: (role: UserRole) => role !== "TEACHER",
  seePaymentAmounts: (role: UserRole) => role === "OWNER",
  createTeachers: (role: UserRole) => role !== "TEACHER",
  deleteRecords: (role: UserRole) => role === "OWNER",
  sendSMS: (role: UserRole) => role !== "TEACHER",
  markAttendance: (_role: UserRole) => true,
  seeDebtors: (role: UserRole) => role !== "TEACHER",
  managePayments: (role: UserRole) => role === "OWNER" || role === "MANAGER",
  seeAllGroups: (role: UserRole) => role !== "TEACHER",
  manageGroups: (role: UserRole) => role !== "TEACHER",
} as const

export function checkPermission(role: UserRole, permission: keyof typeof permissions): boolean {
  const checker = permissions[permission]
  if (typeof checker === 'function') {
    return checker(role)
  }
  return false
}
