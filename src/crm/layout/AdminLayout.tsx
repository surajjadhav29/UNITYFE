import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarClock,
  Car,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Upload,
  Users,
} from 'lucide-react';
import { CrmNotificationsBell } from '../components/CrmNotificationsBell';
import { useCrm } from '../context/CrmContext';
import {
  canImportLeads,
  canManageUsers,
  canViewReports,
  roleLabel,
} from '../utils/permissions';
import type { UserRole } from '../types/crm.types';
import '../styles/crm.css';
import '../styles/crm-polish.css';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
  require?: (user: ReturnType<typeof useCrm>['currentUser']) => boolean;
};

const navItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { to: '/admin/leads', label: 'Leads', icon: ClipboardList },
  {
    to: '/admin/leads/import',
    label: 'Import leads',
    icon: Upload,
    require: canImportLeads,
  },
  { to: '/admin/vehicles', label: 'Stock', icon: Car },
  {
    to: '/admin/reports',
    label: 'Reports',
    icon: BarChart3,
    require: canViewReports,
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: Users,
    require: canManageUsers,
  },
  {
    to: '/admin/logs',
    label: 'Logs',
    icon: ScrollText,
    require: canManageUsers,
  },
];

export function AdminLayout() {
  const { currentUser, logout } = useCrm();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  const visibleNav = navItems.filter((item) => {
    if (item.require) return item.require(currentUser);
    return true;
  });

  return (
    <div className="crm-root crm-layout">
      <aside className="crm-sidebar" aria-label="CRM navigation">
        <div className="crm-sidebar-brand">
          <img
            src="/images/unity-logo.png"
            alt=""
            className="crm-sidebar-logo"
            width={36}
            height={36}
          />
          <div className="crm-sidebar-brand-text">
            Unity Auto CRM
            <span>Used cars · Pune</span>
          </div>
        </div>
        <nav className="crm-nav">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin/dashboard'}
              className={({ isActive }) =>
                `crm-nav-link${isActive ? ' active' : ''}`
              }
            >
              <Icon size={18} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="crm-sidebar-tools">
          <CrmNotificationsBell />
        </div>
        <div className="crm-sidebar-footer">
          <div className="crm-sidebar-user">
            <strong>{currentUser?.name}</strong>
            <span>{currentUser ? roleLabel(currentUser.role) : ''}</span>
          </div>
          <button type="button" className="crm-btn crm-btn-ghost" onClick={onLogout}>
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </div>
      </aside>
      <div className="crm-main">
        <Outlet />
      </div>
    </div>
  );
}
