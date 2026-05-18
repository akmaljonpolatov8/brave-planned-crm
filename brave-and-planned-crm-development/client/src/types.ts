export type UserRole = "owner" | "manager" | "teacher";

export type User = {
  id: number;
  username: string;
  role: UserRole;
};

export type Teacher = {
  id: number;
  name: string;
  phone?: string | null;
  group_count?: number;
};

export type Group = {
  id: number;
  name: string;
  teacher_id?: number | null;
  teacher_name?: string | null;
  course?: string | null;
  schedule_time?: string | null;
  schedule_days?: string | null;
  monthly_fee?: number;
  created_at?: string;
  student_count?: number;
  students?: Student[];
};

export type Student = {
  id: number;
  full_name: string;
  ota_phone?: string | null;
  ona_phone?: string | null;
  telefon?: string | null;
  group_id?: number | null;
  group_name?: string | null;
  status: string;
  joined_at?: string;
  payment_amount?: number | null;
  payment_paid?: number | null;
};

export type Payment = {
  id: number;
  student_id: number;
  group_id: number;
  month: string;
  amount: number;
  paid: number;
  paid_at?: string | null;
  full_name?: string;
  group_name?: string;
};

export type AttendanceRecord = {
  id?: number;
  student_id: number;
  group_id: number;
  date: string;
  status: "present" | "absent";
};
