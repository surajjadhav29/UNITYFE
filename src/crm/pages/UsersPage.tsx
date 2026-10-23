import { useState, type FormEvent } from 'react';
import { useCrm } from '../context/CrmContext';
import type { UserRole } from '../types/crm.types';

export function UsersPage() {
  const { state, createUser, updateUser } = useCrm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff' as UserRole,
    password: '',
  });

  function onCreate(event: FormEvent) {
    event.preventDefault();
    const result = createUser({
      ...form,
      status: 'active',
    });
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setForm({ name: '', email: '', phone: '', role: 'staff', password: '' });
    setError('');
    setMessage(`Created user ${result.name}.`);
  }

  function toggleStatus(id: string, active: boolean) {
    updateUser(id, { status: active ? 'active' : 'inactive' });
    setMessage('User status updated.');
  }

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Users</h1>
          <p className="crm-page-sub">Staff accounts, roles, and access (admin)</p>
        </div>
      </header>

      {message ? <div className="crm-alert crm-alert-success">{message}</div> : null}
      {error ? <div className="crm-alert crm-alert-error">{error}</div> : null}

      <section className="crm-panel">
        <h2 className="crm-panel-title">Create staff account</h2>
        <form className="crm-form" onSubmit={onCreate}>
          <div className="crm-form-grid">
            <div className="crm-field">
              <label>Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="crm-field">
              <label>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="crm-field">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="crm-field">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                <option value="sales">Sales executive</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="crm-field">
              <label>Password *</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="crm-btn crm-btn-primary">
            Create user
          </button>
        </form>
      </section>

      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Leads owned</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {state.users.map((u) => {
              const owned = state.leads.filter((l) => l.assignedStaffId === u.id).length;
              return (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                  <td>{owned}</td>
                  <td>
                    {u.role !== 'admin' ? (
                      <button
                        type="button"
                        className="crm-btn crm-btn-secondary"
                        onClick={() => toggleStatus(u.id, u.status !== 'active')}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
