export const DAYS_OF_WEEK = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"] as const;

export const STUDENT_STATUS_OPTIONS = [
  { value: "active", label: "Faol" },
  { value: "trial", label: "Sinov" },
  { value: "paused", label: "To'xtatilgan" },
  { value: "graduated", label: "Bitirgan" },
] as const;

export const STUDENT_STATUS_LABELS = {
  active: "Faol",
  trial: "Sinov",
  paused: "To'xtatilgan",
  graduated: "Bitirgan",
} as const;

export const ATTENDANCE_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "excused", label: "Excused" },
] as const;

export const ATTENDANCE_LABELS = {
  present: "Kelgan",
  absent: "Kelmagan",
  late: "Kechikkan",
  excused: "Sababli",
} as const;

export type LoginRole = "owner" | "manager" | "teacher";
export type StudentStatus = (typeof STUDENT_STATUS_OPTIONS)[number]["value"];
export type AttendanceStatus = (typeof ATTENDANCE_OPTIONS)[number]["value"];

export interface UserAccount {
  id: string;
  fullName: string;
  username: string;
  password: string;
  role: Exclude<LoginRole, "teacher">;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherAccount {
  id: string;
  fullName: string;
  username: string;
  password: string;
  phone: string;
  isActive: boolean;
  groupIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone: string;
  parentName: string;
  notes: string;
  status: StudentStatus;
  groupIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  subject: string;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  monthlyFee: number;
  teacherId: string | null;
  isActive: boolean;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentGroup {
  id: string;
  studentId: string;
  groupId: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  groupId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  lessonId: string;
  studentId: string;
  status: AttendanceStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  groupId: string;
  month: string;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SmsLog {
  id: string;
  studentId: string;
  parentPhone: string;
  message: string;
  month: string;
  status: "sent" | "failed" | "queued";
  createdAt: string;
}

export interface AppState {
  users: UserAccount[];
  teachers: TeacherAccount[];
  students: Student[];
  groups: Group[];
  studentGroups: StudentGroup[];
  lessons: Lesson[];
  attendance: Attendance[];
  payments: Payment[];
  smsLogs: SmsLog[];
}

export interface RoleSession {
  role: LoginRole;
  entityId: string;
  username: string;
  displayName: string;
}

export interface StudentForm {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone: string;
  parentName: string;
  notes: string;
  status: StudentStatus;
  groupIds: string[];
}

export interface TeacherForm {
  id?: string;
  fullName: string;
  username: string;
  password: string;
  phone: string;
  isActive: boolean;
  groupIds: string[];
}

export interface GroupForm {
  id?: string;
  name: string;
  subject: string;
  scheduleDays: string[];
  startTime: string;
  endTime: string;
  monthlyFee: number;
  teacherId: string;
  isActive: boolean;
  capacity: number;
}

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("uz-UZ", { month: "long", year: "numeric" }).format(new Date(year, monthIndex - 1, 1));
}

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
}

export function formatMoney(value: number) {
  return `${new Intl.NumberFormat("uz-UZ").format(value)} so'm`;
}

export function getRoleLabel(role: LoginRole) {
  return {
    owner: "Owner",
    manager: "Manager",
    teacher: "Teacher",
  }[role];
}

function baseState() {
  const now = new Date().toISOString();
  const currentMonth = getMonthKey(new Date());
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = getMonthKey(lastMonthDate);

  const users: UserAccount[] = [
    {
      id: "user_owner",
      fullName: "Brave Owner",
      username: "owner",
      password: "brave123",
      role: "owner",
      phone: "+998901000001",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "user_manager",
      fullName: "Brave Manager",
      username: "manager",
      password: "brave123",
      role: "manager",
      phone: "+998901000002",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const teachers: TeacherAccount[] = [
    {
      id: "teacher_ani",
      fullName: "Anisa Karimova",
      username: "teacher.ani",
      password: "teach123",
      phone: "+998901234567",
      isActive: true,
      groupIds: ["group_a1", "group_speaking"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "teacher_diyor",
      fullName: "Diyor Yuldashev",
      username: "teacher.diyor",
      password: "teach123",
      phone: "+998907654321",
      isActive: true,
      groupIds: ["group_b1"],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const groups: Group[] = [
    {
      id: "group_a1",
      name: "A1-01",
      subject: "English",
      scheduleDays: ["Dushanba", "Chorshanba", "Juma"],
      startTime: "09:00",
      endTime: "10:30",
      monthlyFee: 600000,
      teacherId: "teacher_ani",
      isActive: true,
      capacity: 14,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "group_b1",
      name: "B1-01",
      subject: "English",
      scheduleDays: ["Seshanba", "Payshanba", "Shanba"],
      startTime: "11:00",
      endTime: "12:30",
      monthlyFee: 750000,
      teacherId: "teacher_diyor",
      isActive: true,
      capacity: 12,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "group_speaking",
      name: "Speaking Club",
      subject: "English",
      scheduleDays: ["Dushanba", "Payshanba"],
      startTime: "18:00",
      endTime: "19:30",
      monthlyFee: 500000,
      teacherId: "teacher_ani",
      isActive: true,
      capacity: 10,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const students: Student[] = [
    {
      id: "student_1",
      firstName: "Ali",
      lastName: "Karimov",
      phone: "+998931110001",
      parentPhone: "+998901110001",
      parentName: "Dilnoza Karimova",
      notes: "A1 guruhi",
      status: "active",
      groupIds: ["group_a1"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "student_2",
      firstName: "Malika",
      lastName: "Saidova",
      phone: "+998931110002",
      parentPhone: "+998901110002",
      parentName: "Shahnoza Saidova",
      notes: "Qo'shimcha speaking",
      status: "trial",
      groupIds: ["group_a1", "group_speaking"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "student_3",
      firstName: "Jasur",
      lastName: "Toirov",
      phone: "+998931110003",
      parentPhone: "+998901110003",
      parentName: "Nodira Toirova",
      notes: "Suhbat darsi",
      status: "active",
      groupIds: ["group_b1"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "student_4",
      firstName: "Aziza",
      lastName: "Mamatova",
      phone: "+998931110004",
      parentPhone: "+998901110004",
      parentName: "Gulchehra Mamatova",
      notes: "Darslarni o'tkazib yubormaslik kerak",
      status: "paused",
      groupIds: ["group_b1"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "student_5",
      firstName: "Sardor",
      lastName: "Rasulov",
      phone: "+998931110005",
      parentPhone: "+998901110005",
      parentName: "Feruza Rasulova",
      notes: "Speaking club",
      status: "active",
      groupIds: ["group_speaking"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "student_6",
      firstName: "Lola",
      lastName: "Qodirova",
      phone: "+998931110006",
      parentPhone: "+998901110006",
      parentName: "Aziza Qodirova",
      notes: "A1 + speaking",
      status: "active",
      groupIds: ["group_a1", "group_speaking"],
      createdAt: now,
      updatedAt: now,
    },
  ];

  const studentGroups: StudentGroup[] = students.flatMap((student) =>
    student.groupIds.map((groupId) => ({
      id: createId("sg"),
      studentId: student.id,
      groupId,
      createdAt: now,
    })),
  );

  const lessons: Lesson[] = [
    { id: "lesson_a1", groupId: "group_a1", date: `${new Date().getFullYear()}-04-10`, createdAt: now, updatedAt: now },
    { id: "lesson_b1", groupId: "group_b1", date: `${new Date().getFullYear()}-04-11`, createdAt: now, updatedAt: now },
    { id: "lesson_sp", groupId: "group_speaking", date: `${new Date().getFullYear()}-04-12`, createdAt: now, updatedAt: now },
  ];

  const attendance: Attendance[] = [
    { id: createId("att"), lessonId: "lesson_a1", studentId: "student_1", status: "present", createdAt: now },
    { id: createId("att"), lessonId: "lesson_a1", studentId: "student_2", status: "late", createdAt: now },
    { id: createId("att"), lessonId: "lesson_b1", studentId: "student_3", status: "present", createdAt: now },
    { id: createId("att"), lessonId: "lesson_b1", studentId: "student_4", status: "absent", createdAt: now },
  ];

  const payments: Payment[] = [
    { id: createId("pay"), studentId: "student_1", groupId: "group_a1", month: currentMonth, amount: 600000, isPaid: true, paidAt: now, createdAt: now, updatedAt: now },
    { id: createId("pay"), studentId: "student_2", groupId: "group_a1", month: currentMonth, amount: 600000, isPaid: false, paidAt: null, createdAt: now, updatedAt: now },
    { id: createId("pay"), studentId: "student_3", groupId: "group_b1", month: currentMonth, amount: 750000, isPaid: true, paidAt: now, createdAt: now, updatedAt: now },
    { id: createId("pay"), studentId: "student_4", groupId: "group_b1", month: currentMonth, amount: 750000, isPaid: false, paidAt: null, createdAt: now, updatedAt: now },
    { id: createId("pay"), studentId: "student_5", groupId: "group_speaking", month: currentMonth, amount: 500000, isPaid: false, paidAt: null, createdAt: now, updatedAt: now },
    { id: createId("pay"), studentId: "student_6", groupId: "group_a1", month: currentMonth, amount: 600000, isPaid: true, paidAt: now, createdAt: now, updatedAt: now },
    { id: createId("pay"), studentId: "student_6", groupId: "group_speaking", month: currentMonth, amount: 500000, isPaid: false, paidAt: null, createdAt: now, updatedAt: now },
    { id: createId("pay"), studentId: "student_2", groupId: "group_a1", month: lastMonth, amount: 600000, isPaid: true, paidAt: now, createdAt: now, updatedAt: now },
  ];

  const smsLogs: SmsLog[] = [
    { id: createId("sms"), studentId: "student_2", parentPhone: "+998901110002", message: "Demo xabar", month: currentMonth, status: "sent", createdAt: now },
  ];

  return { users, teachers, students, groups, studentGroups, lessons, attendance, payments, smsLogs };
}

export function createDemoState(): AppState {
  return baseState();
}

export function getTeacherGroups(state: AppState, teacherId: string) {
  return state.groups.filter((group) => group.teacherId === teacherId || state.teachers.find((teacher) => teacher.id === teacherId)?.groupIds.includes(group.id));
}

export function getGroupStudents(state: AppState, groupId: string) {
  const ids = state.studentGroups.filter((link) => link.groupId === groupId).map((link) => link.studentId);
  return state.students.filter((student) => ids.includes(student.id));
}

export function getAttendanceState(state: AppState, groupId: string, date: string) {
  const lesson = state.lessons.find((item) => item.groupId === groupId && item.date === date);
  if (!lesson) return {} as Record<string, AttendanceStatus>;
  return Object.fromEntries(state.attendance.filter((item) => item.lessonId === lesson.id).map((item) => [item.studentId, item.status])) as Record<string, AttendanceStatus>;
}

export function isAfterFifteenth(month: string, today: Date) {
  const [year, monthIndex] = month.split("-").map(Number);
  const boundary = new Date(year, monthIndex - 1, 15, 23, 59, 59, 999);
  return today.getTime() > boundary.getTime();
}

export function getDebtorList(state: AppState, month: string, session: RoleSession, today: Date) {
  const groupIds = session.role === "teacher" ? getTeacherGroups(state, session.entityId).map((group) => group.id) : state.groups.map((group) => group.id);
  const selectedStudents = state.students.filter((student) => (session.role === "teacher" ? student.groupIds.some((groupId) => groupIds.includes(groupId)) : true));

  return selectedStudents.flatMap((student) => {
    const studentGroupIds = student.groupIds.filter((groupId) => groupIds.includes(groupId));
    return studentGroupIds.flatMap((groupId) => {
      const payment = state.payments.find((item) => item.studentId === student.id && item.groupId === groupId && item.month === month);
      const group = state.groups.find((item) => item.id === groupId);
      if (!group) return [];
      if (payment?.isPaid) return [];
      if (!isAfterFifteenth(month, today)) return [];

      const boundary = new Date(Number(month.split("-")[0]), Number(month.split("-")[1]) - 1, 15);
      const overdueDays = Math.max(1, Math.ceil((today.getTime() - boundary.getTime()) / (1000 * 60 * 60 * 24)));
      const smsStatus = listLatestSmsByStudentMonth(state, student.id, month).status;

      return [{ student, group, daysOverdue: overdueDays, smsStatus }];
    });
  });
}

export function listLatestSmsByStudentMonth(state: AppState, studentId: string, month: string) {
  const logs = state.smsLogs.filter((log) => log.studentId === studentId && log.month === month);
  return logs[logs.length - 1] ?? { status: "queued" as const };
}
