import { useEffect, useState } from "react";
import api from "../api/axios";
import { GroupStatus } from "../components/dashboard/GroupStatus";
import { PaymentTable } from "../components/dashboard/PaymentTable";
import { TodayAttendance } from "../components/dashboard/TodayAttendance";
import { StatCard } from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";

type DashboardResponse = {
  topStats: {
    students: number;
    groups: number;
    teachers: number;
    revenue: number | null;
    debtors: number;
    studentsDelta: number;
  };
  lastPayments: Array<{
    id: number;
    full_name: string;
    group_name: string;
    amount: number;
    paid: number;
    status: "paid" | "unpaid" | "pending";
  }>;
  groupStatus: Array<{
    id: number;
    name: string;
    total: number;
    present_today: number;
  }>;
  todayAttendance: Array<{
    id: number;
    name: string;
    time: string;
    marked: boolean;
    status: string;
  }>;
};

const compactMoney = (value: number) =>
  new Intl.NumberFormat("uz-UZ", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    api.get<DashboardResponse>("/dashboard").then((response) => setData(response.data));
  }, []);

  if (!data) {
    return (
      <div className="page-stack">
        <div className="bp-card card-pad skeleton" style={{ height: 120 }} />
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="stat-card skeleton skeleton-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="bp-card card-pad">
        <div className="page-header">
          <div>
            <h1>Xush kelibsiz, {user?.full_name}! 👋</h1>
            <p>Bugungi holat va ko'rsatkichlar</p>
          </div>
          <div className="topbar-meta">
            {new Intl.DateTimeFormat("uz-UZ", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          title="Jami o'quvchilar"
          value={data.topStats.students}
          note={`Bu oy +${data.topStats.studentsDelta} ta`}
        />
        <StatCard
          title="Faol guruhlar"
          value={data.topStats.groups}
          note={`${data.topStats.teachers} o'qituvchi`}
        />
        {user?.role === "owner" && data.topStats.revenue !== null ? (
          <StatCard
            title="Daromad"
            value={data.topStats.revenue}
            note="so'm"
            formatter={compactMoney}
          />
        ) : null}
        <StatCard
          title="Qarzdorlar"
          value={data.topStats.debtors}
          note="15-dan keyin"
        />
      </section>

      <PaymentTable rows={data.lastPayments} />

      <section className="grid-two">
        <GroupStatus rows={data.groupStatus} />
        <TodayAttendance rows={data.todayAttendance} />
      </section>
    </div>
  );
}
