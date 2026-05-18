import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import { useAuth } from "./context/AuthContext";
import { AttendancePage } from "./pages/AttendancePage";
import { DashboardPage } from "./pages/DashboardPage";
import { DebtorsPage } from "./pages/DebtorsPage";
import { GroupsPage } from "./pages/GroupsPage";
import { ImportPage } from "./pages/ImportPage";
import { LoginPage } from "./pages/LoginPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { SmsPage } from "./pages/SmsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { TeachersPage } from "./pages/TeachersPage";

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loader">Yuklanmoqda...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/debtors" element={<DebtorsPage />} />
        <Route path="/sms" element={<SmsPage />} />
      </Route>
    </Routes>
  );
}
