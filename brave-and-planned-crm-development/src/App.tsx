import { useEffect, useMemo, useState } from "react";
import { addEskizContact, sendSMS } from "./lib/eskiz";
import {
  ATTENDANCE_OPTIONS,
  DAYS_OF_WEEK,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_OPTIONS,
  createDemoState,
  createId,
  formatDateLabel,
  formatMoney,
  formatMonthLabel,
  getAttendanceState,
  getDebtorList,
  getGroupStudents,
  getMonthKey,
  getRoleLabel,
  getTeacherGroups,
  isAfterFifteenth,
  type AppState,
  type AttendanceStatus,
  type Group,
  type LoginRole,
  type RoleSession,
  type Student,
  type StudentForm,
  type StudentStatus,
  type TeacherForm,
  type UserAccount,
  type GroupForm,
} from "./lib/crm";
import { loadJson, saveJson } from "./lib/storage";
import { cn } from "./utils/cn";

const STORAGE_KEY = "brave-planned-crm-state";
const SESSION_KEY = "brave-planned-crm-session";
const PAGE_KEY = "brave-planned-crm-page";

type PageKey =
  | "dashboard"
  | "students"
  | "teachers"
  | "groups"
  | "attendance"
  | "payments"
  | "debtors";

type ToastTone = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
};

type BusyAction = string | null;

type ActionBag = {
  saveStudent: (input: StudentForm) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  saveTeacher: (input: TeacherForm) => Promise<boolean>;
  deleteTeacher: (id: string) => Promise<boolean>;
  saveGroup: (input: GroupForm) => Promise<boolean>;
  deleteGroup: (id: string) => Promise<boolean>;
  saveAttendance: (payload: {
    groupId: string;
    date: string;
    rows: Record<string, AttendanceStatus>;
  }) => Promise<boolean>;
  savePayments: (payload: {
    groupId: string;
    month: string;
    rows: Record<string, boolean>;
  }) => Promise<boolean>;
  sendDebtorSms: (payload: {
    studentIds: string[];
    month: string;
  }) => Promise<boolean>;
  logout: () => void;
};

const NAV: Record<LoginRole, { page: PageKey; label: string }[]> = {
  owner: [
    { page: "dashboard", label: "Dashboard" },
    { page: "students", label: "O'quvchilar" },
    { page: "teachers", label: "O'qituvchilar" },
    { page: "groups", label: "Guruhlar" },
    { page: "attendance", label: "Davomat" },
    { page: "payments", label: "To'lovlar" },
    { page: "debtors", label: "Qarzdorlar" },
  ],
  manager: [
    { page: "dashboard", label: "Dashboard" },
    { page: "students", label: "O'quvchilar" },
    { page: "teachers", label: "O'qituvchilar" },
    { page: "groups", label: "Guruhlar" },
    { page: "attendance", label: "Davomat" },
    { page: "payments", label: "To'lovlar" },
    { page: "debtors", label: "Qarzdorlar" },
  ],
  teacher: [
    { page: "dashboard", label: "Dashboard" },
    { page: "students", label: "O'quvchilarim" },
    { page: "attendance", label: "Davomat" },
  ],
};

const PAGE_TITLES: Record<PageKey, string> = {
  dashboard: "Boshqaruv paneli",
  students: "O'quvchilar",
  teachers: "O'qituvchilar",
  groups: "Guruhlar",
  attendance: "Davomat",
  payments: "To'lovlar",
  debtors: "Qarzdorlar",
};

function App() {
  const [state, setState] = useState<AppState>(() =>
    loadJson(STORAGE_KEY, createDemoState()),
  );
  const [session, setSession] = useState<RoleSession | null>(() =>
    loadJson(SESSION_KEY, null),
  );
  const [page, setPage] = useState<PageKey>(() =>
    loadJson(PAGE_KEY, "dashboard"),
  );
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    saveJson(STORAGE_KEY, state);
  }, [state]);

  useEffect(() => {
    saveJson(SESSION_KEY, session);
  }, [session]);

  useEffect(() => {
    saveJson(PAGE_KEY, page);
  }, [page]);

  useEffect(() => {
    if (!session) return;
    const allowedPages = NAV[session.role].map((item) => item.page);
    if (!allowedPages.includes(page)) {
      setPage("dashboard");
    }
  }, [page, session]);

  const toast = (tone: ToastTone, title: string, description?: string) => {
    const id = createId("toast");
    setToasts((current) => [...current, { id, tone, title, description }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3600);
  };

  const runBusyAction = async (
    label: string,
    handler: () => Promise<boolean>,
  ) => {
    setBusyAction(label);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 320));
      return await handler();
    } finally {
      setBusyAction(null);
    }
  };

  const login = async (role: LoginRole, username: string, password: string) => {
    const result = await runBusyAction("login", async () => {
      const account =
        role === "teacher"
          ? state.teachers.find(
              (item) =>
                item.username.toLowerCase() === username.toLowerCase() &&
                item.password === password &&
                item.isActive,
            )
          : state.users.find(
              (item) =>
                item.role === role &&
                item.username.toLowerCase() === username.toLowerCase() &&
                item.password === password &&
                item.isActive,
            );

      if (!account) {
        toast("error", "Kirish rad etildi", "Rol, login yoki parol noto'g'ri.");
        return false;
      }

      const displayName =
        role === "teacher"
          ? (state.teachers.find((item) => item.id === account.id)?.fullName ??
            username)
          : (account as UserAccount).fullName;

      setSession({
        role,
        entityId: account.id,
        username: account.username,
        displayName,
      });
      setPage("dashboard");
      setSidebarOpen(false);
      toast(
        "success",
        "Muvaffaqiyatli kirildi",
        `${displayName} sifatida tizimga kirdingiz.`,
      );
      return true;
    });

    return result;
  };

  const logout = () => {
    setSession(null);
    setPage("dashboard");
    setSidebarOpen(false);
    toast("info", "Sessiya yakunlandi");
  };

  const saveStudent = async (input: StudentForm) =>
    runBusyAction("student-save", async () => {
      const accessibleGroupIds =
        session?.role === "teacher"
          ? getTeacherGroups(state, session.entityId).map((group) => group.id)
          : state.groups.map((group) => group.id);
      const groupIds = input.groupIds.filter((groupId) =>
        accessibleGroupIds.includes(groupId),
      );

      if (
        !input.firstName.trim() ||
        !input.lastName.trim() ||
        !input.phone.trim() ||
        !input.parentPhone.trim() ||
        !input.parentName.trim()
      ) {
        toast(
          "warning",
          "Majburiy maydonlar bo'sh",
          "Iltimos, barcha asosiy ma'lumotlarni kiriting.",
        );
        return false;
      }

      const studentId = input.id ?? createId("student");
      const exists = state.students.some((student) => student.id === studentId);

      setState((current) => {
        const nextStudents = exists
          ? current.students.map((student) =>
              student.id === studentId
                ? {
                    ...student,
                    firstName: input.firstName.trim(),
                    lastName: input.lastName.trim(),
                    phone: input.phone.trim(),
                    parentPhone: input.parentPhone.trim(),
                    parentName: input.parentName.trim(),
                    notes: input.notes.trim(),
                    status: input.status,
                    groupIds,
                    updatedAt: new Date().toISOString(),
                  }
                : student,
            )
          : [
              ...current.students,
              {
                id: studentId,
                firstName: input.firstName.trim(),
                lastName: input.lastName.trim(),
                phone: input.phone.trim(),
                parentPhone: input.parentPhone.trim(),
                parentName: input.parentName.trim(),
                notes: input.notes.trim(),
                status: input.status,
                groupIds,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];

        const nextStudentGroups = current.studentGroups
          .filter((link) => link.studentId !== studentId)
          .concat(
            groupIds.map((groupId) => ({
              id: createId("sg"),
              studentId,
              groupId,
              createdAt: new Date().toISOString(),
            })),
          );

        return {
          ...current,
          students: nextStudents,
          studentGroups: nextStudentGroups,
        };
      });

      if (!exists) {
        await addEskizContact(
          `${input.firstName.trim()} ${input.lastName.trim()}`,
          input.parentPhone.trim(),
        );
        toast(
          "success",
          "O'quvchi qo'shildi",
          "Ota-ona kontakti Eskizga qo'shildi.",
        );
      } else {
        toast("success", "O'quvchi yangilandi");
      }

      return true;
    });

  const deleteStudent = async (id: string) =>
    runBusyAction(`student-delete-${id}`, async () => {
      if (session?.role !== "owner") {
        toast(
          "warning",
          "Ruxsat yo'q",
          "O'quvchini faqat owner o'chira oladi.",
        );
        return false;
      }

      setState((current) => ({
        ...current,
        students: current.students.filter((student) => student.id !== id),
        studentGroups: current.studentGroups.filter(
          (link) => link.studentId !== id,
        ),
        attendance: current.attendance.filter(
          (record) => record.studentId !== id,
        ),
        payments: current.payments.filter(
          (payment) => payment.studentId !== id,
        ),
        smsLogs: current.smsLogs.filter((log) => log.studentId !== id),
      }));

      toast("success", "O'quvchi o'chirildi");
      return true;
    });

  const saveTeacher = async (input: TeacherForm) =>
    runBusyAction("teacher-save", async () => {
      if (session?.role === "teacher") {
        toast(
          "warning",
          "Ruxsat yo'q",
          "O'qituvchi akkauntini tahrirlab bo'lmaydi.",
        );
        return false;
      }

      if (
        !input.fullName.trim() ||
        !input.username.trim() ||
        !input.password.trim()
      ) {
        toast("warning", "Majburiy maydonlar bo'sh");
        return false;
      }

      if (
        state.users.some(
          (user) =>
            user.username.toLowerCase() === input.username.toLowerCase(),
        ) ||
        state.teachers.some(
          (teacher) =>
            teacher.username.toLowerCase() === input.username.toLowerCase() &&
            teacher.id !== input.id,
        )
      ) {
        toast("error", "Login band", "Bunday username allaqachon mavjud.");
        return false;
      }

      const teacherId = input.id ?? createId("teacher");
      const groupIds = input.groupIds.filter((groupId) =>
        state.groups.some((group) => group.id === groupId),
      );
      const exists = state.teachers.some((teacher) => teacher.id === teacherId);

      setState((current) => {
        const nextTeachers = exists
          ? current.teachers.map((teacher) =>
              teacher.id === teacherId
                ? {
                    ...teacher,
                    fullName: input.fullName.trim(),
                    username: input.username.trim(),
                    password: input.password,
                    phone: input.phone.trim(),
                    isActive: input.isActive,
                    groupIds,
                    updatedAt: new Date().toISOString(),
                  }
                : teacher,
            )
          : [
              ...current.teachers,
              {
                id: teacherId,
                fullName: input.fullName.trim(),
                username: input.username.trim(),
                password: input.password,
                phone: input.phone.trim(),
                isActive: input.isActive,
                groupIds,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];

        const nextGroups = current.groups.map((group) => {
          if (!groupIds.includes(group.id) && group.teacherId === teacherId) {
            return {
              ...group,
              teacherId: null,
              updatedAt: new Date().toISOString(),
            };
          }

          if (groupIds.includes(group.id)) {
            return { ...group, teacherId, updatedAt: new Date().toISOString() };
          }

          return group;
        });

        return { ...current, teachers: nextTeachers, groups: nextGroups };
      });

      toast(
        "success",
        exists ? "O'qituvchi yangilandi" : "O'qituvchi yaratildi",
      );
      return true;
    });

  const deleteTeacher = async (id: string) =>
    runBusyAction(`teacher-delete-${id}`, async () => {
      if (session?.role !== "owner") {
        toast(
          "warning",
          "Ruxsat yo'q",
          "O'qituvchini faqat owner o'chira oladi.",
        );
        return false;
      }

      setState((current) => ({
        ...current,
        teachers: current.teachers.filter((teacher) => teacher.id !== id),
        groups: current.groups.map((group) =>
          group.teacherId === id ? { ...group, teacherId: null } : group,
        ),
      }));

      toast("success", "O'qituvchi o'chirildi");
      return true;
    });

  const saveGroup = async (input: GroupForm) =>
    runBusyAction("group-save", async () => {
      if (session?.role === "teacher") {
        toast(
          "warning",
          "Ruxsat yo'q",
          "Guruhlarni faqat owner yoki manager boshqaradi.",
        );
        return false;
      }

      if (!input.name.trim() || !input.startTime || !input.endTime) {
        toast("warning", "Majburiy maydonlar bo'sh");
        return false;
      }

      const groupId = input.id ?? createId("group");
      const teacherId = input.teacherId || null;
      const exists = state.groups.some((group) => group.id === groupId);

      setState((current) => {
        const previousTeacherId =
          current.groups.find((group) => group.id === groupId)?.teacherId ??
          null;
        const nextGroups = exists
          ? current.groups.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    name: input.name.trim(),
                    subject: input.subject.trim() || "English",
                    scheduleDays: input.scheduleDays,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    monthlyFee: Number(input.monthlyFee) || 0,
                    teacherId,
                    isActive: input.isActive,
                    capacity: Number(input.capacity) || 0,
                    updatedAt: new Date().toISOString(),
                  }
                : group,
            )
          : [
              ...current.groups,
              {
                id: groupId,
                name: input.name.trim(),
                subject: input.subject.trim() || "English",
                scheduleDays: input.scheduleDays,
                startTime: input.startTime,
                endTime: input.endTime,
                monthlyFee: Number(input.monthlyFee) || 0,
                teacherId,
                isActive: input.isActive,
                capacity: Number(input.capacity) || 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];

        const nextTeachers = current.teachers.map((teacher) => {
          const hasGroup = teacher.groupIds.includes(groupId);
          const shouldHaveGroup = teacherId ? teacher.id === teacherId : false;

          if (
            teacher.id === previousTeacherId &&
            previousTeacherId !== teacherId
          ) {
            return {
              ...teacher,
              groupIds: teacher.groupIds.filter((group) => group !== groupId),
              updatedAt: new Date().toISOString(),
            };
          }

          if (shouldHaveGroup && !hasGroup) {
            return {
              ...teacher,
              groupIds: [...teacher.groupIds, groupId],
              updatedAt: new Date().toISOString(),
            };
          }

          if (
            !shouldHaveGroup &&
            hasGroup &&
            teacher.id !== previousTeacherId
          ) {
            return {
              ...teacher,
              groupIds: teacher.groupIds.filter((group) => group !== groupId),
              updatedAt: new Date().toISOString(),
            };
          }

          return teacher;
        });

        return { ...current, groups: nextGroups, teachers: nextTeachers };
      });

      toast("success", exists ? "Guruh yangilandi" : "Guruh yaratildi");
      return true;
    });

  const deleteGroup = async (id: string) =>
    runBusyAction(`group-delete-${id}`, async () => {
      if (session?.role !== "owner") {
        toast("warning", "Ruxsat yo'q", "Guruhni faqat owner o'chira oladi.");
        return false;
      }

      setState((current) => {
        const relatedLessons = current.lessons
          .filter((lesson) => lesson.groupId === id)
          .map((lesson) => lesson.id);
        return {
          ...current,
          groups: current.groups.filter((group) => group.id !== id),
          students: current.students.map((student) => ({
            ...student,
            groupIds: student.groupIds.filter((groupId) => groupId !== id),
          })),
          studentGroups: current.studentGroups.filter(
            (link) => link.groupId !== id,
          ),
          lessons: current.lessons.filter((lesson) => lesson.groupId !== id),
          attendance: current.attendance.filter(
            (record) => !relatedLessons.includes(record.lessonId),
          ),
          payments: current.payments.filter(
            (payment) => payment.groupId !== id,
          ),
          teachers: current.teachers.map((teacher) => ({
            ...teacher,
            groupIds: teacher.groupIds.filter((groupId) => groupId !== id),
          })),
        };
      });

      toast("success", "Guruh o'chirildi");
      return true;
    });

  const saveAttendance = async (payload: {
    groupId: string;
    date: string;
    rows: Record<string, AttendanceStatus>;
  }) =>
    runBusyAction("attendance-save", async () => {
      const group = state.groups.find((item) => item.id === payload.groupId);
      if (!group) {
        toast("error", "Guruh topilmadi");
        return false;
      }

      if (session?.role === "teacher" && group.teacherId !== session.entityId) {
        toast(
          "warning",
          "Ruxsat yo'q",
          "Faqat o'zingizning guruhingiz davomatini belgilashingiz mumkin.",
        );
        return false;
      }

      setState((current) => {
        const existingLesson = current.lessons.find(
          (lesson) =>
            lesson.groupId === payload.groupId && lesson.date === payload.date,
        );
        const lessonId = existingLesson?.id ?? createId("lesson");
        const nextLessons = existingLesson
          ? current.lessons.map((lesson) =>
              lesson.id === lessonId
                ? { ...lesson, updatedAt: new Date().toISOString() }
                : lesson,
            )
          : [
              ...current.lessons,
              {
                id: lessonId,
                groupId: payload.groupId,
                date: payload.date,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ];

        const remainingAttendance = current.attendance.filter(
          (record) => record.lessonId !== lessonId,
        );
        const nextAttendance = Object.entries(payload.rows).map(
          ([studentId, status]) => ({
            id: createId("att"),
            lessonId,
            studentId,
            status,
            createdAt: new Date().toISOString(),
          }),
        );

        return {
          ...current,
          lessons: nextLessons,
          attendance: [...remainingAttendance, ...nextAttendance],
        };
      });

      toast("success", "Davomat saqlandi");
      return true;
    });

  const savePayments = async (payload: {
    groupId: string;
    month: string;
    rows: Record<string, boolean>;
  }) =>
    runBusyAction("payments-save", async () => {
      if (!session || session.role === "teacher") {
        toast(
          "warning",
          "Ruxsat yo'q",
          "To'lovlar bo'limi faqat owner va manager uchun ochiq.",
        );
        return false;
      }

      const group = state.groups.find((item) => item.id === payload.groupId);
      if (!group) {
        toast("error", "Guruh topilmadi");
        return false;
      }

      setState((current) => {
        const nextPayments = current.payments.filter(
          (payment) =>
            !(
              payment.groupId === payload.groupId &&
              payment.month === payload.month
            ),
        );
        const created = Object.entries(payload.rows).map(
          ([studentId, isPaid]) => ({
            id: createId("pay"),
            studentId,
            groupId: payload.groupId,
            month: payload.month,
            amount: group.monthlyFee,
            isPaid,
            paidAt: isPaid ? new Date().toISOString() : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        );

        return { ...current, payments: [...nextPayments, ...created] };
      });

      toast("success", "To'lovlar yangilandi");
      return true;
    });

  const sendDebtorSms = async (payload: {
    studentIds: string[];
    month: string;
  }) =>
    runBusyAction("sms-send", async () => {
      if (!session || session.role === "teacher") {
        toast(
          "warning",
          "Ruxsat yo'q",
          "SMS faqat owner yoki manager tomonidan yuboriladi.",
        );
        return false;
      }

      if (!payload.studentIds.length) {
        toast("warning", "Tanlov yo'q", "Kamida bitta qarzdorni belgilang.");
        return false;
      }

      const selectedStudents = state.students.filter((student) =>
        payload.studentIds.includes(student.id),
      );
      let sentCount = 0;

      for (const student of selectedStudents) {
        const message = `Brave and Planned: ${student.parentName}, ${student.firstName} ${student.lastName} uchun ${formatMonthLabel(payload.month)} to'lovida qarzdorlik mavjud. Iltimos, administratsiya bilan bog'laning.`;
        const sameMonth = state.smsLogs.some(
          (log) => log.studentId === student.id && log.month === payload.month,
        );

        if (sameMonth) {
          const shouldContinue = window.confirm("Qayta yubormoqchimisiz?");
          if (!shouldContinue) continue;
        }

        try {
          await sendSMS(student.parentPhone, message);
          await addEskizContact(student.parentName, student.parentPhone);
          sentCount += 1;
          setState((current) => ({
            ...current,
            smsLogs: [
              ...current.smsLogs,
              {
                id: createId("sms"),
                studentId: student.id,
                parentPhone: student.parentPhone,
                message,
                month: payload.month,
                status: "sent",
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        } catch {
          setState((current) => ({
            ...current,
            smsLogs: [
              ...current.smsLogs,
              {
                id: createId("sms"),
                studentId: student.id,
                parentPhone: student.parentPhone,
                message,
                month: payload.month,
                status: "failed",
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      }

      toast(
        "success",
        `${sentCount} ta SMS yuborildi`,
        "SMS log'lar saqlandi.",
      );
      return true;
    });

  const actions: ActionBag = {
    saveStudent,
    deleteStudent,
    saveTeacher,
    deleteTeacher,
    saveGroup,
    deleteGroup,
    saveAttendance,
    savePayments,
    sendDebtorSms,
    logout,
  };

  const visibleNav = session ? NAV[session.role] : [];

  if (!session) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,#020617_0%,#020617_100%)] text-slate-100">
        <LoginScreen onLogin={login} busyAction={busyAction} />
        <ToastStack
          items={toasts}
          onDismiss={(id) =>
            setToasts((current) => current.filter((item) => item.id !== id))
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Shell
        page={page}
        setPage={setPage}
        session={session}
        state={state}
        busyAction={busyAction}
        nav={visibleNav}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        actions={actions}
      />
      <ToastStack
        items={toasts}
        onDismiss={(id) =>
          setToasts((current) => current.filter((item) => item.id !== id))
        }
      />
    </div>
  );
}

function Shell({
  page,
  setPage,
  session,
  state,
  busyAction,
  nav,
  sidebarOpen,
  setSidebarOpen,
  actions,
}: {
  page: PageKey;
  setPage: (page: PageKey) => void;
  session: RoleSession;
  state: AppState;
  busyAction: BusyAction;
  nav: { page: PageKey; label: string }[];
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  actions: ActionBag;
}) {
  const title = PAGE_TITLES[page];

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-800 bg-slate-950/95 px-4 py-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-linear-to-br from-cyan-500 via-sky-500 to-indigo-600 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
              BP
            </div>
            <div>
              <p className="text-base font-semibold text-white">
                Brave and Planned
              </p>
              <p className="text-xs text-slate-400">
                English learning center CRM
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {nav.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                  setPage(item.page);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                  page === item.page
                    ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white",
                )}
              >
                <span>{item.label}</span>
                {page === item.page ? (
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                ) : null}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Kirish roli
            </p>
            <p className="mt-2 text-sm font-medium text-white">
              {getRoleLabel(session.role)}
            </p>
            <p className="mt-1 text-xs text-slate-400">{session.displayName}</p>
          </div>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          className="fixed inset-0 z-30 bg-slate-950/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Yopish"
        />
      ) : null}

      <main className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-200 transition hover:border-cyan-500/40 hover:text-cyan-300 lg:hidden"
              aria-label="Menyu"
            >
              <span className="sr-only">Menyu</span>
              <span className="flex flex-col gap-1.5">
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                {getRoleLabel(session.role)}
              </p>
              <h1 className="truncate text-xl font-semibold text-white sm:text-2xl">
                {title}
              </h1>
            </div>

            <button onClick={actions.logout} className="btn btn-ghost">
              Chiqish
            </button>
          </div>
        </header>

        <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {page === "dashboard" ? (
            <DashboardPage session={session} state={state} />
          ) : null}
          {page === "students" ? (
            <StudentsPage
              session={session}
              state={state}
              busyAction={busyAction}
              actions={actions}
            />
          ) : null}
          {page === "teachers" ? (
            <TeachersPage
              session={session}
              state={state}
              busyAction={busyAction}
              actions={actions}
            />
          ) : null}
          {page === "groups" ? (
            <GroupsPage
              session={session}
              state={state}
              busyAction={busyAction}
              actions={actions}
            />
          ) : null}
          {page === "attendance" ? (
            <AttendancePage
              session={session}
              state={state}
              busyAction={busyAction}
              actions={actions}
            />
          ) : null}
          {page === "payments" ? (
            <PaymentsPage
              session={session}
              state={state}
              busyAction={busyAction}
              actions={actions}
            />
          ) : null}
          {page === "debtors" ? (
            <DebtorsPage
              session={session}
              state={state}
              busyAction={busyAction}
              actions={actions}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function LoginScreen({
  onLogin,
  busyAction,
}: {
  onLogin: (
    role: LoginRole,
    username: string,
    password: string,
  ) => Promise<boolean>;
  busyAction: BusyAction;
}) {
  const [role, setRole] = useState<LoginRole>("owner");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden rounded-4xl border border-slate-800 bg-slate-950/60 p-8 shadow-2xl shadow-cyan-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_34%)]" />
          <div className="relative max-w-xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Brave and Planned CRM
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Ingliz tili markazi uchun tartibli boshqaruv
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              O'quvchilar, guruhlar, davomat, to'lovlar, qarzdorlar va SMS
              jarayonlarini bir joyda boshqaring. Rolga asoslangan kirish bilan
              har bir foydalanuvchi faqat o'z bo'limini ko'radi.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Owner", "To'liq nazorat"],
                ["Manager", "Kundalik boshqaruv"],
                ["Teacher", "O'z guruhlari"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-slate-800 bg-slate-900/50 p-4"
                >
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 text-xs text-slate-400">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Demo kirish</p>
              <p className="mt-2">
                Owner / manager / teacher uchun demo loginlar kod ichida
                tayyorlangan. Kirishdan keyin siz barcha ma'lumotlarni mahalliy
                xotirada tahrirlashingiz mumkin.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-4xl border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/50 sm:p-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Kirish
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Hisobingizga kiring
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-300">
                Rolni tanlang
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["owner", "manager", "teacher"] as LoginRole[]).map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-sm font-medium transition",
                        role === item
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
                          : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900",
                      )}
                    >
                      {getRoleLabel(item)}
                    </button>
                  ),
                )}
              </div>
            </div>

            <Field label="Username">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
              />
            </Field>

            <Field label="Parol">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />
            </Field>

            <Button
              className="w-full"
              loading={busyAction === "login"}
              onClick={async (e) => {
                e.preventDefault();
                await onLogin(role, username, password);
              }}
            >
              Kirish
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardPage({
  session,
  state,
}: {
  session: RoleSession;
  state: AppState;
}) {
  const summary = useMemo(() => {
    const currentMonth = getMonthKey(new Date());
    const groups =
      session.role === "teacher"
        ? getTeacherGroups(state, session.entityId)
        : state.groups;
    const groupIds = groups.map((group) => group.id);
    const students = state.students.filter((student) =>
      session.role === "teacher"
        ? student.groupIds.some((id) => groupIds.includes(id))
        : true,
    );
    const payments = state.payments.filter(
      (payment) =>
        payment.month === currentMonth && groupIds.includes(payment.groupId),
    );
    const debtors = getDebtorList(state, currentMonth, session, new Date());
    const revenue = payments
      .filter((payment) => payment.isPaid)
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      groupsCount: groups.length,
      studentsCount: students.length,
      revenue,
      debtorsCount: debtors.length,
      presentCount: state.attendance.filter(
        (record) =>
          record.status === "present" &&
          state.lessons.some(
            (lesson) =>
              lesson.id === record.lessonId &&
              groupIds.includes(lesson.groupId),
          ),
      ).length,
      todayLessons: state.lessons.filter(
        (lesson) =>
          lesson.date === new Date().toISOString().slice(0, 10) &&
          groupIds.includes(lesson.groupId),
      ).length,
    };
  }, [session, state]);

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-slate-800 bg-slate-900/40 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
          Brave and Planned
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Xush kelibsiz, {session.displayName}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Bu panelda sizning rolingizga mos ravishda asosiy ko'rsatkichlar,
          bugungi darslar va to'lov holati jamlanadi.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatBlock
          label="O'quvchilar"
          value={summary.studentsCount}
          helper={
            session.role === "teacher"
              ? "Faqat sizning guruhlaringiz"
              : "Barcha faol o'quvchilar"
          }
        />
        <StatBlock
          label="Guruhlar"
          value={summary.groupsCount}
          helper={
            session.role === "teacher"
              ? "Sizga biriktirilgan"
              : "Faol va faol emas guruhlar"
          }
        />
        <StatBlock
          label={session.role === "manager" ? "To'lovlar" : "Bu oy daromadi"}
          value={
            session.role === "manager"
              ? "Yashirilgan"
              : formatMoney(summary.revenue)
          }
          helper={
            session.role === "manager"
              ? "Miqdorlar ko'rsatilmaydi"
              : "Tasdiqlangan to'lovlar yig'indisi"
          }
        />
        <StatBlock
          label="Qarzdorlar"
          value={summary.debtorsCount}
          helper="15-sanadan keyingi faol qarzlar"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Bugungi holat" description="Tezkor ko'rinish">
          <div className="space-y-4 text-sm text-slate-300">
            <Row label="Bugungi darslar" value={summary.todayLessons} />
            <Row label="Davomat yozuvlari" value={summary.presentCount} />
            <Row label="Faol guruhlar" value={summary.groupsCount} />
          </div>
        </Panel>

        <Panel
          title="Rolga mos imkoniyatlar"
          description="Foydalanuvchi huquqlari"
        >
          <div className="space-y-3 text-sm text-slate-300">
            {session.role === "owner" ? (
              <PermissionLine text="To'liq ko'rish, tahrirlash, o'chirish va SMS yuborish" />
            ) : null}
            {session.role === "manager" ? (
              <PermissionLine text="O'quvchi, o'qituvchi, guruh va SMS boshqaruvi" />
            ) : null}
            {session.role === "teacher" ? (
              <PermissionLine text="O'zingizning guruhlaringizdagi o'quvchilar va davomat" />
            ) : null}
            <PermissionLine text="Barcha amallar to'satlik bilan saqlanadi" />
            <PermissionLine text="Tizim telefonlarga moslashtirilgan" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function StudentsPage({
  session,
  state,
  busyAction,
  actions,
}: {
  session: RoleSession;
  state: AppState;
  busyAction: BusyAction;
  actions: ActionBag;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<StudentForm | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);

  const accessibleGroupIds =
    session.role === "teacher"
      ? getTeacherGroups(state, session.entityId).map((group) => group.id)
      : state.groups.map((group) => group.id);
  const visibleStudents = state.students.filter((student) =>
    session.role === "teacher"
      ? student.groupIds.some((groupId) => accessibleGroupIds.includes(groupId))
      : true,
  );

  const filtered = visibleStudents.filter((student) => {
    const haystack =
      `${student.firstName} ${student.lastName} ${student.phone} ${student.parentPhone} ${student.parentName} ${student.notes} ${student.groupIds.map((groupId) => state.groups.find((group) => group.id === groupId)?.name).join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-5">
      <SectionHeader
        title={session.role === "teacher" ? "O'quvchilarim" : "O'quvchilar"}
        description="O'quvchi ma'lumotlari, guruhlar va ota-ona aloqalari bir joyda yuritiladi."
        actionLabel="Yangi o'quvchi"
        onAction={() =>
          setEditing({
            firstName: "",
            lastName: "",
            phone: "",
            parentPhone: "",
            parentName: "",
            notes: "",
            status: "active",
            groupIds: accessibleGroupIds.slice(0, 1),
          })
        }
        canAction={session.role !== "teacher" || accessibleGroupIds.length > 0}
      >
        <Input
          placeholder="O'quvchi, ota-ona yoki telefon bo'yicha qidirish"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SectionHeader>

      <Panel
        title={`Ro'yxat (${filtered.length})`}
        description="Qidiruv natijalari"
      >
        <Table>
          <thead>
            <tr>
              <Th>O'quvchi</Th>
              <Th>Telefon</Th>
              <Th>Ota-ona</Th>
              <Th>Guruhlar</Th>
              <Th>Status</Th>
              <Th className="text-right">Amallar</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} className="border-t border-slate-800/70">
                <Td>
                  <div>
                    <p className="font-medium text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.notes || "Izoh yo'q"}
                    </p>
                  </div>
                </Td>
                <Td>{student.phone}</Td>
                <Td>
                  <div>
                    <p className="text-slate-200">{student.parentName}</p>
                    <p className="text-xs text-slate-500">
                      {student.parentPhone}
                    </p>
                  </div>
                </Td>
                <Td>
                  {student.groupIds
                    .map(
                      (groupId) =>
                        state.groups.find((group) => group.id === groupId)
                          ?.name,
                    )
                    .filter(Boolean)
                    .join(", ") || "Biriktirilmagan"}
                </Td>
                <Td>
                  <Badge tone="info">
                    {STUDENT_STATUS_LABELS[student.status]}
                  </Badge>
                </Td>
                <Td className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditing(studentToForm(student))}
                    >
                      Tahrirlash
                    </button>
                    {session.role === "teacher" ? (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={async () => {
                          const ownGroups = accessibleGroupIds;
                          const filteredGroups = student.groupIds.filter(
                            (groupId) => !ownGroups.includes(groupId),
                          );
                          const ok = await actions.saveStudent({
                            ...studentToForm(student),
                            groupIds: filteredGroups,
                          });
                          if (ok) {
                            setQuery("");
                          }
                        }}
                      >
                        Guruhdan chiqarish
                      </button>
                    ) : null}
                    {session.role === "owner" ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setRemoveTarget(student)}
                      >
                        O'chirish
                      </button>
                    ) : null}
                  </div>
                </Td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  Hech qanday o'quvchi topilmadi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Panel>

      {editing ? (
        <StudentModal
          student={editing}
          session={session}
          state={state}
          busyAction={busyAction}
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            const ok = await actions.saveStudent(form);
            if (ok) setEditing(null);
          }}
        />
      ) : null}

      {removeTarget ? (
        <ConfirmDialog
          title="O'quvchini o'chirish"
          description={`${removeTarget.firstName} ${removeTarget.lastName} barcha bog'langan to'lov va davomat yozuvlari bilan o'chiriladi.`}
          busy={busyAction?.startsWith("student-delete-") ?? false}
          confirmLabel="O'chirish"
          onCancel={() => setRemoveTarget(null)}
          onConfirm={async () => {
            const ok = await actions.deleteStudent(removeTarget.id);
            if (ok) setRemoveTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}

function TeachersPage({
  session,
  state,
  busyAction,
  actions,
}: {
  session: RoleSession;
  state: AppState;
  busyAction: BusyAction;
  actions: ActionBag;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<TeacherForm | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const filtered = state.teachers.filter((teacher) => {
    const haystack =
      `${teacher.fullName} ${teacher.username} ${teacher.phone} ${teacher.groupIds.map((groupId) => state.groups.find((group) => group.id === groupId)?.name).join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  if (session.role === "teacher") {
    return (
      <EmptyState
        title="Bu bo'lim siz uchun yopiq"
        description="O'qituvchi faqat o'z guruhlari o'quvchilari, davomat va dashboard'ni ko'radi."
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="O'qituvchilar"
        description="Yangi o'qituvchi akkaunti yarating va guruhlarga biriktiring."
        actionLabel="Yangi o'qituvchi"
        onAction={() =>
          setEditing({
            fullName: "",
            username: "",
            password: "",
            phone: "",
            isActive: true,
            groupIds: [],
          })
        }
        canAction
      >
        <Input
          placeholder="Ism, username yoki telefon bo'yicha qidirish"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SectionHeader>

      <Panel
        title={`Ro'yxat (${filtered.length})`}
        description="Faol va arxivdagi o'qituvchilar"
      >
        <Table>
          <thead>
            <tr>
              <Th>F.I.Sh</Th>
              <Th>Login</Th>
              <Th>Telefon</Th>
              <Th>Guruhlar</Th>
              <Th>Status</Th>
              <Th className="text-right">Amallar</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((teacher) => (
              <tr key={teacher.id} className="border-t border-slate-800/70">
                <Td>
                  <p className="font-medium text-white">{teacher.fullName}</p>
                </Td>
                <Td>{teacher.username}</Td>
                <Td>{teacher.phone || "-"}</Td>
                <Td>
                  {teacher.groupIds
                    .map(
                      (groupId) =>
                        state.groups.find((group) => group.id === groupId)
                          ?.name,
                    )
                    .filter(Boolean)
                    .join(", ") || "Biriktirilmagan"}
                </Td>
                <Td>
                  {teacher.isActive ? (
                    <Badge tone="success">Faol</Badge>
                  ) : (
                    <Badge tone="muted">Nofaol</Badge>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditing(teacherToForm(teacher))}
                    >
                      Tahrirlash
                    </button>
                    {session.role === "owner" ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setRemoveTarget(teacher.id)}
                      >
                        O'chirish
                      </button>
                    ) : null}
                  </div>
                </Td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  O'qituvchi topilmadi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Panel>

      {editing ? (
        <TeacherModal
          teacher={editing}
          state={state}
          busyAction={busyAction}
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            const ok = await actions.saveTeacher(form);
            if (ok) setEditing(null);
          }}
        />
      ) : null}

      {removeTarget ? (
        <ConfirmDialog
          title="O'qituvchini o'chirish"
          description="O'chirilganda guruhlardan ajratiladi, lekin o'quvchilar saqlanadi."
          busy={
            busyAction?.startsWith(`teacher-delete-${removeTarget}`) ?? false
          }
          confirmLabel="O'chirish"
          onCancel={() => setRemoveTarget(null)}
          onConfirm={async () => {
            const ok = await actions.deleteTeacher(removeTarget);
            if (ok) setRemoveTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}

function GroupsPage({
  session,
  state,
  busyAction,
  actions,
}: {
  session: RoleSession;
  state: AppState;
  busyAction: BusyAction;
  actions: ActionBag;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<GroupForm | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Group | null>(null);

  if (session.role === "teacher") {
    return (
      <EmptyState
        title="Bu bo'lim yopiq"
        description="Guruhlarni owner yoki manager boshqaradi."
      />
    );
  }

  const filtered = state.groups.filter((group) => {
    const teacherName =
      state.teachers.find((teacher) => teacher.id === group.teacherId)
        ?.fullName ?? "";
    const haystack =
      `${group.name} ${group.subject} ${teacherName} ${group.scheduleDays.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Guruhlar"
        description="Dars jadvali, narx, sig'im va o'qituvchi biriktirish boshqariladi."
        actionLabel="Yangi guruh"
        onAction={() =>
          setEditing({
            name: "",
            subject: "English",
            scheduleDays: [],
            startTime: "09:00",
            endTime: "10:30",
            monthlyFee: 0,
            teacherId: "",
            isActive: true,
            capacity: 0,
          })
        }
        canAction
      >
        <Input
          placeholder="Guruh, o'qituvchi yoki kun bo'yicha qidirish"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </SectionHeader>

      <Panel
        title={`Ro'yxat (${filtered.length})`}
        description="Faol va arxivdagi guruhlar"
      >
        <Table>
          <thead>
            <tr>
              <Th>Nomi</Th>
              <Th>Jadval</Th>
              <Th>O'qituvchi</Th>
              <Th>Sig'im</Th>
              <Th>To'lov</Th>
              <Th>Status</Th>
              <Th className="text-right">Amallar</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((group) => (
              <tr key={group.id} className="border-t border-slate-800/70">
                <Td>
                  <div>
                    <p className="font-medium text-white">{group.name}</p>
                    <p className="text-xs text-slate-500">{group.subject}</p>
                  </div>
                </Td>
                <Td>{group.scheduleDays.join(", ") || "-"}</Td>
                <Td>
                  {state.teachers.find(
                    (teacher) => teacher.id === group.teacherId,
                  )?.fullName || "Biriktirilmagan"}
                </Td>
                <Td>{group.capacity}</Td>
                <Td>
                  {session.role === "manager"
                    ? "Yashirilgan"
                    : formatMoney(group.monthlyFee)}
                </Td>
                <Td>
                  {group.isActive ? (
                    <Badge tone="success">Faol</Badge>
                  ) : (
                    <Badge tone="muted">Nofaol</Badge>
                  )}
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditing(groupToForm(group))}
                    >
                      Tahrirlash
                    </button>
                    {session.role === "owner" ? (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setRemoveTarget(group)}
                      >
                        O'chirish
                      </button>
                    ) : null}
                  </div>
                </Td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  Guruh topilmadi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Panel>

      {editing ? (
        <GroupModal
          group={editing}
          state={state}
          busyAction={busyAction}
          onClose={() => setEditing(null)}
          onSubmit={async (form) => {
            const ok = await actions.saveGroup(form);
            if (ok) setEditing(null);
          }}
        />
      ) : null}

      {removeTarget ? (
        <ConfirmDialog
          title="Guruhni o'chirish"
          description="Bog'liq davomat, to'lov va aloqalar ham tozalanadi."
          busy={
            busyAction?.startsWith(`group-delete-${removeTarget.id}`) ?? false
          }
          confirmLabel="O'chirish"
          onCancel={() => setRemoveTarget(null)}
          onConfirm={async () => {
            const ok = await actions.deleteGroup(removeTarget.id);
            if (ok) setRemoveTarget(null);
          }}
        />
      ) : null}
    </div>
  );
}

function AttendancePage({
  session,
  state,
  busyAction,
  actions,
}: {
  session: RoleSession;
  state: AppState;
  busyAction: BusyAction;
  actions: ActionBag;
}) {
  const groups =
    session.role === "teacher"
      ? getTeacherGroups(state, session.entityId)
      : state.groups;
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    if (!groupId && groups[0]) setGroupId(groups[0].id);
  }, [groupId, groups]);

  const students = getGroupStudents(state, groupId);
  const prefilled = useMemo(
    () => getAttendanceState(state, groupId, date),
    [state, groupId, date],
  );

  useEffect(() => {
    if (!students.length) return;
    const nextRows: Record<string, AttendanceStatus> = {};
    students.forEach((student) => {
      nextRows[student.id] = prefilled[student.id] ?? "present";
    });
    setRows(nextRows);
  }, [prefilled, students]);

  if (!groups.length) {
    return (
      <EmptyState
        title="Guruh topilmadi"
        description="Sizga hali hech qanday guruh biriktirilmagan."
      />
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Davomat"
        description="Guruh va sana tanlab, har bir o'quvchi holatini belgilang."
        canAction={false}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </SectionHeader>

      <Panel
        title={`${groups.find((group) => group.id === groupId)?.name ?? "Guruh"} - ${formatDateLabel(date)}`}
        description="Statusni belgilang va saqlang."
      >
        <div className="space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-[1fr_220px] md:items-center"
            >
              <div>
                <p className="font-medium text-white">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  {student.parentName} • {student.parentPhone}
                </p>
              </div>
              <Select
                value={rows[student.id] ?? "present"}
                onChange={(e) =>
                  setRows((current) => ({
                    ...current,
                    [student.id]: e.target.value as AttendanceStatus,
                  }))
                }
              >
                {ATTENDANCE_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </div>
          ))}
          {!students.length ? (
            <EmptyState
              title="O'quvchi yo'q"
              description="Bu guruhga biriktirilgan o'quvchilar topilmadi."
            />
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-400">
            Jami: <span className="text-white">{students.length}</span> o'quvchi
          </div>
          <Button
            loading={busyAction === "attendance-save"}
            onClick={async () =>
              actions.saveAttendance({ groupId, date, rows })
            }
          >
            Davomatni saqlash
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function PaymentsPage({
  session,
  state,
  busyAction,
  actions,
}: {
  session: RoleSession;
  state: AppState;
  busyAction: BusyAction;
  actions: ActionBag;
}) {
  const currentMonth = getMonthKey(new Date());
  const [query, setQuery] = useState("");
  const [groupId, setGroupId] = useState(state.groups[0]?.id ?? "");
  const [month, setMonth] = useState(currentMonth);
  const students = getGroupStudents(state, groupId);
  const initialMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    students.forEach((student) => {
      map[student.id] =
        state.payments.find(
          (payment) =>
            payment.groupId === groupId &&
            payment.month === month &&
            payment.studentId === student.id,
        )?.isPaid ?? false;
    });
    return map;
  }, [groupId, month, state.payments, students]);
  const [rows, setRows] = useState<Record<string, boolean>>(initialMap);

  useEffect(() => {
    setRows(initialMap);
  }, [initialMap]);

  const filtered = students.filter((student) => {
    const haystack =
      `${student.firstName} ${student.lastName} ${student.phone} ${student.parentPhone} ${student.parentName}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  if (session.role === "teacher") {
    return (
      <EmptyState
        title="Bu bo'lim yopiq"
        description="To'lovlar bo'limi owner va manager uchun mo'ljallangan."
      />
    );
  }

  const totalPaid = filtered.filter((student) => rows[student.id]).length;
  const totalUnpaid = filtered.length - totalPaid;
  const group = state.groups.find((item) => item.id === groupId);
  const revenue =
    filtered.filter((student) => rows[student.id]).length *
    (group?.monthlyFee ?? 0);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="To'lovlar"
        description="Guruh va oy bo'yicha to'lov holatini boshqaring."
        canAction={false}
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
            {state.groups.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          <Select value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthOptions(currentMonth).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Input
            placeholder="O'quvchi yoki ota-ona bo'yicha qidirish"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </SectionHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatBlock
          label="Kim to'ladi"
          value={totalPaid}
          helper="Belgilangani saqlashga tayyor"
        />
        <StatBlock
          label="Kim qarzdor"
          value={totalUnpaid}
          helper="15-sanadan keyingi to'lanmaganlar"
        />
        <StatBlock
          label={session.role === "manager" ? "Miqdor" : "Jami tushum"}
          value={
            session.role === "manager" ? "Yashirilgan" : formatMoney(revenue)
          }
          helper="Guruh narxi bo'yicha"
        />
      </div>

      <Panel
        title={`${group?.name ?? "Guruh"} - ${formatMonthLabel(month)}`}
        description="Har bir o'quvchi uchun paid/unpaid holatini belgilang."
      >
        <div className="space-y-3">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-[1fr_220px] md:items-center"
            >
              <div>
                <p className="font-medium text-white">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  {student.parentName} • {student.parentPhone}
                </p>
              </div>
              <Select
                value={rows[student.id] ? "paid" : "unpaid"}
                onChange={(e) =>
                  setRows((current) => ({
                    ...current,
                    [student.id]: e.target.value === "paid",
                  }))
                }
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </Select>
            </div>
          ))}
          {!filtered.length ? (
            <EmptyState
              title="O'quvchi yo'q"
              description="Bu guruh uchun o'quvchi topilmadi."
            />
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-400">
            Guruh narxi:{" "}
            <span className="text-white">
              {session.role === "manager"
                ? "Yashirilgan"
                : formatMoney(group?.monthlyFee ?? 0)}
            </span>
          </div>
          <Button
            loading={busyAction === "payments-save"}
            onClick={async () => actions.savePayments({ groupId, month, rows })}
          >
            To'lovlarni saqlash
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function DebtorsPage({
  session,
  state,
  busyAction,
  actions,
}: {
  session: RoleSession;
  state: AppState;
  busyAction: BusyAction;
  actions: ActionBag;
}) {
  const currentMonth = getMonthKey(new Date());
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const debtors = getDebtorList(state, month, session, new Date());
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = debtors.filter((item) => {
    const haystack =
      `${item.student.firstName} ${item.student.lastName} ${item.student.parentPhone} ${item.group.name}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  useEffect(() => {
    setSelected((current) =>
      current.filter((id) => filtered.some((item) => item.student.id === id)),
    );
  }, [filtered]);

  if (session.role === "teacher") {
    return (
      <EmptyState
        title="Bu bo'lim yopiq"
        description="Qarzdorlar va SMS faqat owner yoki manager uchun ochiq."
      />
    );
  }

  const toggleSelection = (studentId: string) => {
    setSelected((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Qarzdorlar"
        description="15-sanadan keyingi to'lov qilmagan o'quvchilar va SMS holati."
        canAction={false}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input
            placeholder="O'quvchi, guruh yoki telefon"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthOptions(currentMonth).map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </SectionHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatBlock
          label="Jami qarzdor"
          value={filtered.length}
          helper="Tanlangan oy uchun"
        />
        <StatBlock
          label="SMS tanlandi"
          value={selected.length}
          helper="Bulk yuborish uchun"
        />
        <StatBlock
          label="15-sanadan keyin"
          value={isAfterFifteenth(month, new Date()) ? "Ha" : "Yo'q"}
          helper="Debtor hisoblash qoidasi"
        />
      </div>

      <Panel
        title={`${formatMonthLabel(month)} qarzdorlar`}
        description="Har bir qator uchun SMS yuborish yoki bulk yuborish mumkin."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-400">
            Tanlanganlar: <span className="text-white">{selected.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                setSelected(
                  Array.from(new Set(filtered.map((item) => item.student.id))),
                )
              }
            >
              Hammasini belgilash
            </Button>
            <Button
              loading={busyAction === "sms-send"}
              onClick={async () =>
                actions.sendDebtorSms({ studentIds: selected, month })
              }
            >
              Bulk SMS yuborish
            </Button>
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th />
              <Th>O'quvchi</Th>
              <Th>Guruh</Th>
              <Th>Ota-ona telefoni</Th>
              <Th>Kechikish</Th>
              <Th>SMS holati</Th>
              <Th className="text-right">Amal</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ student, group, daysOverdue, smsStatus }) => (
              <tr
                key={`${student.id}-${group.id}`}
                className="border-t border-slate-800/70"
              >
                <Td>
                  <input
                    type="checkbox"
                    checked={selected.includes(student.id)}
                    onChange={() => toggleSelection(student.id)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
                  />
                </Td>
                <Td>
                  <div>
                    <p className="font-medium text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.parentName}
                    </p>
                  </div>
                </Td>
                <Td>{group.name}</Td>
                <Td>{student.parentPhone}</Td>
                <Td>{daysOverdue > 0 ? `${daysOverdue} kun` : "-"}</Td>
                <Td>
                  <Badge
                    tone={
                      smsStatus === "sent"
                        ? "success"
                        : smsStatus === "failed"
                          ? "danger"
                          : "muted"
                    }
                  >
                    {smsStatus === "sent"
                      ? "Yuborildi"
                      : smsStatus === "failed"
                        ? "Xato"
                        : "Yangi"}
                  </Badge>
                </Td>
                <Td className="text-right">
                  <Button
                    variant="ghost"
                    className="btn-sm"
                    loading={busyAction === "sms-send"}
                    onClick={async () =>
                      actions.sendDebtorSms({ studentIds: [student.id], month })
                    }
                  >
                    SMS yuborish
                  </Button>
                </Td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  Qarzdor topilmadi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}

function StudentModal({
  student,
  session,
  state,
  busyAction,
  onClose,
  onSubmit,
}: {
  student: StudentForm;
  session: RoleSession;
  state: AppState;
  busyAction: BusyAction;
  onClose: () => void;
  onSubmit: (form: StudentForm) => Promise<void>;
}) {
  const accessibleGroupIds =
    session.role === "teacher"
      ? getTeacherGroups(state, session.entityId).map((group) => group.id)
      : state.groups.map((group) => group.id);
  const [form, setForm] = useState<StudentForm>(student);

  useEffect(() => {
    setForm(student);
  }, [student]);

  return (
    <Modal
      title={student.id ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
      description="O'quvchi ma'lumotlari va guruhlarini kiriting."
      onClose={onClose}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Ism">
          <Input
            value={form.firstName}
            onChange={(e) =>
              setForm((current) => ({ ...current, firstName: e.target.value }))
            }
          />
        </Field>
        <Field label="Familiya">
          <Input
            value={form.lastName}
            onChange={(e) =>
              setForm((current) => ({ ...current, lastName: e.target.value }))
            }
          />
        </Field>
        <Field label="Telefon">
          <Input
            value={form.phone}
            onChange={(e) =>
              setForm((current) => ({ ...current, phone: e.target.value }))
            }
          />
        </Field>
        <Field label="Ota-ona telefoni">
          <Input
            value={form.parentPhone}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                parentPhone: e.target.value,
              }))
            }
          />
        </Field>
        <Field label="Ota-ona ismi">
          <Input
            value={form.parentName}
            onChange={(e) =>
              setForm((current) => ({ ...current, parentName: e.target.value }))
            }
          />
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                status: e.target.value as StudentStatus,
              }))
            }
          >
            {STUDENT_STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Guruhlar">
          <select
            multiple
            className="min-h-36 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-500/40"
            value={form.groupIds}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                groupIds: Array.from(e.target.selectedOptions).map(
                  (option) => option.value,
                ),
              }))
            }
          >
            {state.groups
              .filter((group) => accessibleGroupIds.includes(group.id))
              .map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Izoh">
          <Textarea
            value={form.notes}
            onChange={(e) =>
              setForm((current) => ({ ...current, notes: e.target.value }))
            }
            rows={7}
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button
          loading={busyAction === "student-save"}
          onClick={async () => onSubmit(form)}
        >
          Saqlash
        </Button>
      </div>
    </Modal>
  );
}

function TeacherModal({
  teacher,
  state,
  busyAction,
  onClose,
  onSubmit,
}: {
  teacher: TeacherForm;
  state: AppState;
  busyAction: BusyAction;
  onClose: () => void;
  onSubmit: (form: TeacherForm) => Promise<void>;
}) {
  const [form, setForm] = useState<TeacherForm>(teacher);

  useEffect(() => {
    setForm(teacher);
  }, [teacher]);

  return (
    <Modal
      title={teacher.id ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi"}
      description="Login va guruhlarni biriktiring."
      onClose={onClose}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="F.I.Sh">
          <Input
            value={form.fullName}
            onChange={(e) =>
              setForm((current) => ({ ...current, fullName: e.target.value }))
            }
          />
        </Field>
        <Field label="Username">
          <Input
            value={form.username}
            onChange={(e) =>
              setForm((current) => ({ ...current, username: e.target.value }))
            }
          />
        </Field>
        <Field label="Parol">
          <Input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((current) => ({ ...current, password: e.target.value }))
            }
          />
        </Field>
        <Field label="Telefon">
          <Input
            value={form.phone}
            onChange={(e) =>
              setForm((current) => ({ ...current, phone: e.target.value }))
            }
          />
        </Field>
        <Field label="Guruhlar">
          <select
            multiple
            className="min-h-36 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-500/40"
            value={form.groupIds}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                groupIds: Array.from(e.target.selectedOptions).map(
                  (option) => option.value,
                ),
              }))
            }
          >
            {state.groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <Select
            value={form.isActive ? "active" : "inactive"}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                isActive: e.target.value === "active",
              }))
            }
          >
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </Select>
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button
          loading={busyAction === "teacher-save"}
          onClick={async () => onSubmit(form)}
        >
          Saqlash
        </Button>
      </div>
    </Modal>
  );
}

function GroupModal({
  group,
  state,
  busyAction,
  onClose,
  onSubmit,
}: {
  group: GroupForm;
  state: AppState;
  busyAction: BusyAction;
  onClose: () => void;
  onSubmit: (form: GroupForm) => Promise<void>;
}) {
  const [form, setForm] = useState<GroupForm>(group);

  useEffect(() => {
    setForm(group);
  }, [group]);

  return (
    <Modal
      title={group.id ? "Guruhni tahrirlash" : "Yangi guruh"}
      description="Jadval, narx va o'qituvchini belgilang."
      onClose={onClose}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Guruh nomi">
          <Input
            value={form.name}
            onChange={(e) =>
              setForm((current) => ({ ...current, name: e.target.value }))
            }
          />
        </Field>
        <Field label="Subject">
          <Input
            value={form.subject}
            onChange={(e) =>
              setForm((current) => ({ ...current, subject: e.target.value }))
            }
          />
        </Field>
        <Field label="Boshlanish vaqti">
          <Input
            type="time"
            value={form.startTime}
            onChange={(e) =>
              setForm((current) => ({ ...current, startTime: e.target.value }))
            }
          />
        </Field>
        <Field label="Tugash vaqti">
          <Input
            type="time"
            value={form.endTime}
            onChange={(e) =>
              setForm((current) => ({ ...current, endTime: e.target.value }))
            }
          />
        </Field>
        <Field label="Oylik to'lov">
          <Input
            type="number"
            value={form.monthlyFee}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                monthlyFee: Number(e.target.value),
              }))
            }
          />
        </Field>
        <Field label="Sig'im">
          <Input
            type="number"
            value={form.capacity}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                capacity: Number(e.target.value),
              }))
            }
          />
        </Field>
        <Field label="O'qituvchi">
          <Select
            value={form.teacherId}
            onChange={(e) =>
              setForm((current) => ({ ...current, teacherId: e.target.value }))
            }
          >
            <option value="">Biriktirilmagan</option>
            {state.teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.fullName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={form.isActive ? "active" : "inactive"}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                isActive: e.target.value === "active",
              }))
            }
          >
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </Select>
        </Field>
      </div>

      <Field label="Hafta kunlari" className="mt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DAYS_OF_WEEK.map((day) => (
            <label
              key={day}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
            >
              <input
                type="checkbox"
                checked={form.scheduleDays.includes(day)}
                onChange={() =>
                  setForm((current) => ({
                    ...current,
                    scheduleDays: current.scheduleDays.includes(day)
                      ? current.scheduleDays.filter((item) => item !== day)
                      : [...current.scheduleDays, day],
                  }))
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
              />
              {day}
            </label>
          ))}
        </div>
      </Field>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button
          loading={busyAction === "group-save"}
          onClick={async () => onSubmit(form)}
        >
          Saqlash
        </Button>
      </div>
    </Modal>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  busy,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <Modal title={title} description={description} onClose={onCancel} compact>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button variant="danger" loading={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  description,
  onClose,
  children,
  compact = false,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Yopish"
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-3xl rounded-4xl border border-slate-800 bg-slate-950 p-5 shadow-2xl shadow-cyan-950/20 sm:p-6",
          compact ? "max-w-xl" : "",
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-700 hover:text-white"
          >
            Yopish
          </button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}

function ToastStack({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-60 flex w-[calc(100vw-2rem)] flex-col gap-3 sm:right-6 sm:top-6 sm:w-96">
      {items.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-sm transition-all duration-300 animate-[fade-in_0.25s_ease-out]",
            toast.tone === "success" &&
              "border-emerald-500/30 bg-emerald-950/90 text-emerald-100",
            toast.tone === "error" &&
              "border-rose-500/30 bg-rose-950/90 text-rose-100",
            toast.tone === "warning" &&
              "border-amber-500/30 bg-amber-950/90 text-amber-100",
            toast.tone === "info" &&
              "border-cyan-500/30 bg-cyan-950/90 text-cyan-100",
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm opacity-80">{toast.description}</p>
              ) : null}
            </div>
            <button
              className="text-xs opacity-70 transition hover:opacity-100"
              onClick={() => onDismiss(toast.id)}
            >
              Yopish
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-4xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SectionHeader({
  title,
  description,
  actionLabel,
  onAction,
  canAction,
  children,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  canAction: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-4xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        {actionLabel && onAction && canAction ? (
          <Button onClick={onAction}>{actionLabel}</Button>
        ) : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-4xl border border-dashed border-slate-800 bg-slate-950/40 p-10 text-center">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
        {description}
      </p>
    </div>
  );
}

function StatBlock({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-400">{helper}</p>
    </div>
  );
}

function PermissionLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
      <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
      <p>{text}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10",
        props.className,
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10",
        props.className,
      )}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10",
        props.className,
      )}
    />
  );
}

function Button({
  children,
  loading,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "ghost" | "danger";
}) {
  const variantClass = {
    primary: "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
    ghost:
      "border border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:bg-slate-800",
    danger: "bg-rose-500 text-white hover:bg-rose-400",
  }[variant];

  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        className,
      )}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "success" | "warning" | "danger" | "info";
}) {
  const classes = {
    muted: "border-slate-800 bg-slate-900 text-slate-300",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-200",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-200",
    info: "border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        classes,
      )}
    >
      {children}
    </span>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-slate-300">{children}</table>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500",
        className,
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("whitespace-nowrap px-3 py-4 align-top", className)}>
      {children}
    </td>
  );
}

function monthOptions(currentMonth: string) {
  const [year, month] = currentMonth.split("-").map(Number);
  const options: { value: string; label: string }[] = [];
  for (let offset = 0; offset < 6; offset += 1) {
    const date = new Date(year, month - 1 - offset, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label: formatMonthLabel(value) });
  }
  return options;
}

function studentToForm(student: Student): StudentForm {
  return {
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    phone: student.phone,
    parentPhone: student.parentPhone,
    parentName: student.parentName,
    notes: student.notes,
    status: student.status,
    groupIds: student.groupIds,
  };
}

function teacherToForm(teacher: {
  id: string;
  fullName: string;
  username: string;
  password: string;
  phone: string;
  isActive: boolean;
  groupIds: string[];
}): TeacherForm {
  return {
    id: teacher.id,
    fullName: teacher.fullName,
    username: teacher.username,
    password: teacher.password,
    phone: teacher.phone,
    isActive: teacher.isActive,
    groupIds: teacher.groupIds,
  };
}

function groupToForm(group: Group): GroupForm {
  return {
    id: group.id,
    name: group.name,
    subject: group.subject,
    scheduleDays: group.scheduleDays,
    startTime: group.startTime,
    endTime: group.endTime,
    monthlyFee: group.monthlyFee,
    teacherId: group.teacherId ?? "",
    isActive: group.isActive,
    capacity: group.capacity,
  };
}

export default App;
