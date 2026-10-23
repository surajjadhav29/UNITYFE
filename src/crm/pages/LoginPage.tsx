import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useCrm } from '../context/CrmContext';
import '../styles/crm.css';
import '../styles/crm-polish.css';

export function LoginPage() {
  const { login, currentUser } = useCrm();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard';

  const [email, setEmail] = useState('admin@unityauto.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (currentUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div className="crm-root crm-login-shell">
      <div className="crm-login-card">
        <div className="crm-login-brand">Unity Auto CRM</div>
        <p className="crm-login-sub">Sign in to manage leads, follow-ups, and stock.</p>
        {error ? <div className="crm-alert crm-alert-error">{error}</div> : null}
        <form className="crm-form" onSubmit={onSubmit}>
          <div className="crm-field">
            <label htmlFor="crm-email">Email</label>
            <input
              id="crm-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="crm-field">
            <label htmlFor="crm-password">Password</label>
            <input
              id="crm-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="crm-btn crm-btn-primary" style={{ width: '100%' }}>
            Sign in
          </button>
        </form>
        <p className="crm-login-sub" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
          Demo — Admin: <strong>admin@unityauto.com</strong> / admin123 · Sales:{' '}
          <strong>rahul@unityauto.com</strong> / staff123 · Staff:{' '}
          <strong>priya@unityauto.com</strong> / staff123
        </p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.88rem' }}>
          <Link to="/" className="crm-link">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
