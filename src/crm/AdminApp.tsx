import { Navigate, Route, Routes } from 'react-router-dom';
import { CrmProvider } from './context/CrmContext';
import { AdminLayout } from './layout/AdminLayout';
import { RequireAdmin, RequireAuth } from './components/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import { LeadFormPage } from './pages/LeadFormPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { VehicleFormPage } from './pages/VehicleFormPage';
import { UsersPage } from './pages/UsersPage';
import { LogsPage } from './pages/LogsPage';
import { ReportsPage } from './pages/ReportsPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { ImportLeadsPage } from './pages/ImportLeadsPage';

export function AdminApp() {
  return (
    <CrmProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/import" element={<ImportLeadsPage />} />
          <Route path="leads/new" element={<LeadFormPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="leads/:id/edit" element={<LeadFormPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="vehicles/new" element={<VehicleFormPage />} />
          <Route path="vehicles/:id/edit" element={<VehicleFormPage />} />
          <Route
            path="users"
            element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="logs"
            element={
              <RequireAdmin>
                <LogsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="reports"
            element={
              <RequireAdmin>
                <ReportsPage />
              </RequireAdmin>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </CrmProvider>
  );
}
