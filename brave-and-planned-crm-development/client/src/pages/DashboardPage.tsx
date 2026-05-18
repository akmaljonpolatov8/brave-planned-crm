import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { GroupStatus } from "../components/dashboard/GroupStatus";
import { PaymentTable } from "../components/dashboard/PaymentTable";
import { StatCard } from "../components/dashboard/StatCard";
import { TodayLessons } from "../components/dashboard/TodayLessons";
import { useAuth } from "../context/AuthContext";

type DashboardData = {
  topStats?: {
    students?: number;
    groups?: number;
    teachers?: number;
    revenue?: number | null;
    unpaid?: number;
    studentsDelta?: number;
  };
  lastPayments?: Array<{
    full_name: string;
    group_name?: string | null;
    amount: number;
    paid: number;
    status?: "paid" | "unpaid" | "pending";
  }>;
  groupStatus?: Array<{
    id: number;
    name: string;
    total?: number;
    present_today?: number;
  }>;
  todayLessons?: Array<{
    id?: number;
    name: string;
    time?: string | null;
    marked?: boolean;
    status?: string;
  }>;
};

function formatDateUz(date = new Date()) {
  return new Intl.DateTimeFormat("uz-UZ", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatRevenueCompact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bp-panel animate-pulse p-6">
        <div className="h-4 w-48 rounded-full bg-white/10" />
        <div className="mt-3 h-10 w-80 rounded-lg bg-white/10" />
        <div className="mt-3 h-4 w-64 rounded-full bg-white/10" />
      </div>

      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="stat-card animate-pulse">
            <div className="h-4 w-28 rounded-full bg-white/10" />
            <div className="mt-4 h-12 w-24 rounded-lg bg-white/10" />
            <div className="mt-3 h-3 w-24 rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="bp-panel animate-pulse p-5">
        <div className="h-4 w-44 rounded-full bg-white/10" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded-lg bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/dashboard");
      setData(response.data);
    } catch {
      setError("Ma'lumot yuklanmadi, qayta urinish");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const userRole = user?.role;
  const isOwner = userRole === "owner";
  const isTeacher = userRole === "teacher";

  const students = data?.topStats?.students ?? 0;
  const groups = data?.topStats?.groups ?? 0;
  const teachers = data?.topStats?.teachers ?? 0;
  const revenue = data?.topStats?.revenue ?? 0;
  const debtors = data?.topStats?.unpaid ?? 0;
  const studentsDelta = data?.topStats?.studentsDelta ?? 0;

  return (
    <div className="bp-dashboard space-y-6">
      <header className="bp-panel p-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] sm:text-4xl">
              Xush kelibsiz, {user?.username || "Foydalanuvchi"}!
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Bugungi holat, to'lovlar va guruhlar bo'yicha nazorat paneli.
            </p>
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            {formatDateUz()}
          </p>
        </div>
      </header>

      {loading ? <DashboardSkeleton /> : null}

      {!loading && error ? (
        <div className="bp-panel p-6 text-center">
          <p className="text-[var(--text-primary)]">{error}</p>
          <button className="btn-secondary mt-4" onClick={loadDashboard}>
            Qayta urinish
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          {!isTeacher ? (
            <section className="stats-grid">
              <StatCard
                title="Jami o'quvchilar"
                value={students}
                subText={`Bu oy +${studentsDelta} ta`}
                tone="gold"
                delayClass="bp-delay-0"
              />
              <StatCard
                title="Faol guruhlar"
                value={groups}
                subText={`${teachers} ta o'qituvchi`}
                tone="gold"
                delayClass="bp-delay-1"
              />
              {userRole === "owner" ? (
                <StatCard
                  title="Daromad (oy)"
                  value={revenue}
                  subText="so'm"
                  tone="gold"
                  delayClass="bp-delay-2"
                  formatter={formatRevenueCompact}
                />
              ) : null}
              <StatCard
                title="Qarzdorlar"
                value={debtors}
                subText="15-dan keyin"
                tone="gold"
                delayClass={isOwner ? "bp-delay-3" : "bp-delay-2"}
              />
            </section>
          ) : null}

          {!isTeacher ? <PaymentTable rows={data?.lastPayments || []} /> : null}

          <section className="grid gap-6 lg:grid-cols-2">
            <GroupStatus rows={data?.groupStatus || []} />
            <TodayLessons rows={data?.todayLessons || []} />
          </section>
        </>
      ) : null}
    </div>
  );
}
