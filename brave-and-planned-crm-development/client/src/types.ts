export type UserRole = "owner" | "manager" | "teacher";

export type User = {
  id: number;
  username: string;
  role: UserRole;
  full_name?: string;
};

export type Teacher = {
  id: number;
  name?: string;
  full_name?: string;
  phone?: string | null;
  is_active?: number;
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
  start_time?: string | null;
  end_time?: string | null;
  monthly_fee?: number;
  monthlyFee?: number;
  capacity?: number;
  is_active?: number;
  isActive?: number;
  created_at?: string;
  student_count?: number;
  students?: Student[];
};

export type Student = {
  id: number;
  full_name: string;
  phone?: string | null;
  parent_phone?: string | null;
  parent_name?: string | null;
  // Legacy field names (backwards compat)
  ota_phone?: string | null;
  ona_phone?: string | null;
  telefon?: string | null;
  group_id?: number | null;
  group_name?: string | null;
  groups?: string | string[];
  status: string;
  notes?: string | null;
  joined_at?: string;
  created_at?: string;
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
  status: "present" | "absent" | "late" | "excused";
};
