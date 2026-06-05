export type UserRole = "OWNER" | "MANAGER" | "TEACHER";

export const can = {
  seeAllStudents: (r: UserRole) => r !== "TEACHER",
  addStudents: (r: UserRole) => true,
  deleteStudents: (r: UserRole) => r === "OWNER",
  seePaymentAmounts: (r: UserRole) => r === "OWNER",
  editPayments: (r: UserRole) => r !== "TEACHER",
  createTeachers: (r: UserRole) => r !== "TEACHER",
  deleteTeachers: (r: UserRole) => r === "OWNER",
  createGroups: (r: UserRole) => r !== "TEACHER",
  editGroups: (r: UserRole) => r !== "TEACHER", // Manager can edit group fee
  deleteGroups: (r: UserRole) => r === "OWNER",
  transferStudents: (r: UserRole) => r !== "TEACHER",
  sendSMS: (r: UserRole) => r !== "TEACHER",
  markAttendance: (_: UserRole) => true,
  importExcel: (r: UserRole) => r !== "TEACHER",
  viewDashboard: (_: UserRole) => true,
};
