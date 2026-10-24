import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  Car,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Receipt,
  ScrollText,
  Settings,
  Users,
} from 'lucide-react';
import { CrmNotificationsBell } from '../components/CrmNotificationsBell';
import { useCrm } from '../context/CrmContext';
import {
  canManageSettings,
  canManageUsers,
  canViewReports,
  roleLabel,
} from '../utils/permissions';
import { CrmLayoutProvider, useCrmLayout } from '../context/CrmLayoutContext';
import '../styles/crm.css';
import '../styles/crm-polish.css';
import '../styles/crm-premium.css';
import '../styles/crm-layout-tight.css';
import '../styles/crm-sidebar-light.css';
import '../styles/crm-topbar-light.css';
import '../styles/crm-responsive.css';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  require?: (user: ReturnType<typeof useCrm>['currentUser']) => boolean;
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <CrmLayoutProvider sidebarCollapsed={collapsed} setSidebarCollapsed={setCollapsed}>
      <AdminLayoutShell />
    </CrmLayoutProvider>
  );
}

function AdminLayoutShell() {
  const { currentUser, logout } = useCrm();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useCrmLayout();
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  function setNotificationsOpen(open: boolean) {
    setNotifyOpen(open);
    if (open) setAccountOpen(false);
  }

  function toggleAccountMenu() {
    setAccountOpen((v) => {
      const next = !v;
      if (next) setNotifyOpen(false);
      return next;
    });
  }

  useEffect(() => {
    if (!accountOpen) return;
    function onDocClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [accountOpen]);

  const navItems: NavItem[] = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/leads', label: 'Leads', icon: ClipboardList },
    { to: '/admin/follow-ups', label: 'Follow-ups', icon: CalendarClock },
    { to: '/admin/appointments', label: 'Appointments & test drives', icon: CalendarDays },
    { to: '/admin/vehicles', label: 'Stock / Vehicles', icon: Car },
    { to: '/admin/bookings', label: 'Bookings & sales', icon: Receipt },
    {
      to: '/admin/reports',
      label: 'Reports & analytics',
      icon: BarChart3,
      require: canViewReports,
    },
    {
      to: '/admin/users',
      label: 'Users & team',
      icon: Users,
      require: canManageUsers,
    },
    {
      to: '/admin/logs',
      label: 'Activity logs',
      icon: ScrollText,
      require: canManageUsers,
    },
    {
      to: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      require: canManageSettings,
    },
  ];

  function onLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  const visibleNav = navItems.filter((item) => {
    if (item.require) return item.require(currentUser);
    return true;
  });

  const initials = currentUser?.name
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`crm-root crm-layout crm-shell${sidebarCollapsed ? ' crm-layout-collapsed' : ''}`}>
      <aside className="crm-sidebar" aria-label="CRM navigation">
        <div className="crm-sidebar-head">
          <div className="crm-sidebar-brand">
            <div className="crm-sidebar-logo-mark">D</div>
            {!sidebarCollapsed ? (
              <div className="crm-sidebar-brand-text">
                DriveNext
                <span>Used car CRM</span>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="crm-sidebar-collapse"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft size={16} strokeWidth={2} className={sidebarCollapsed ? 'crm-flip-x' : undefined} />
          </button>
        </div>
        <nav className="crm-nav">
          {visibleNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={sidebarCollapsed ? label : undefined}
              className={({ isActive }) =>
                `crm-nav-link${isActive ? ' active' : ''}`
              }
            >
              <span className="crm-nav-icon" aria-hidden>
                <Icon size={18} strokeWidth={1.75} />
              </span>
              {!sidebarCollapsed ? (
                <>
                  <span className="crm-nav-label">{label}</span>
                </>
              ) : null}
            </NavLink>
          ))}
        </nav>
        <div className="crm-sidebar-footer">
          <button type="button" className="crm-btn crm-btn-ghost crm-sidebar-logout" onClick={onLogout}>
            <LogOut size={18} strokeWidth={1.75} aria-hidden />
            {!sidebarCollapsed ? 'Sign out' : null}
          </button>
        </div>
      </aside>
      <div className="crm-main">
        <header className="crm-topbar crm-topbar-pro">
          <div className="crm-topbar-actions">
            <CrmNotificationsBell open={notifyOpen} onOpenChange={setNotificationsOpen} />
            <div className="crm-topbar-account-wrap" ref={accountRef}>
              <button
                type="button"
                className="crm-topbar-account-btn"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={toggleAccountMenu}
              >
                <span className="crm-topbar-avatar">{initials}</span>
                <div className="crm-topbar-user-text">
                  <strong>{currentUser?.name}</strong>
                  <span className="crm-topbar-user-role">
                    {currentUser ? roleLabel(currentUser.role) : ''}
                  </span>
                </div>
              </button>
              {accountOpen ? (
                <div className="crm-topbar-account-menu" role="menu">
                  <div className="crm-topbar-account-menu-head">
                    <strong>{currentUser?.name}</strong>
                    <span>{currentUser?.email}</span>
                  </div>
                  <button
                    type="button"
                    className="crm-btn crm-btn-ghost crm-sidebar-logout"
                    role="menuitem"
                    onClick={() => {
                      setAccountOpen(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={18} strokeWidth={1.75} aria-hidden />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div className="crm-main-content crm-main-content-pro">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
