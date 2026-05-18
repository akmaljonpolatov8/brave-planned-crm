import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { useAuth } from "./context/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { DebtorsPage } from "./pages/DebtorsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { GroupDetailPage } from "./pages/GroupDetailPage";
import { GroupsPage } from "./pages/GroupsPage";
import { ImportPage } from "./pages/ImportPage";
import { LoginPage } from "./pages/LoginPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SmsPage } from "./pages/SmsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";

function Protected() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Yuklanmoqda...
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route element={<Protected />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id" element={<GroupDetailPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/debtors" element={<DebtorsPage />} />
        <Route path="/sms" element={<SmsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/import" element={<ImportPage />} />
      </Route>
    </Routes>
  );
}
