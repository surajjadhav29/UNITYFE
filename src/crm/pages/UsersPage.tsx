import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  CrmTable,
  crmTableActionsClass,
} from '../common/components/CrmTable';
import { useCrm } from '../context/CrmContext';
import type { CrmUser, UserRole } from '../types/crm.types';
import { roleLabel } from '../utils/permissions';

const FORM_ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'sales', label: 'Sales' },
  { value: 'staff', label: 'Staff' },
];

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'staff' as UserRole,
  password: '',
  status: 'active' as CrmUser['status'],
};

export function UsersPage() {
  const { state, currentUser, createUser, updateUser, deleteUser } = useCrm();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  }

  function closeForm() {
    resetForm();
    setFormOpen(false);
  }

  function openCreate() {
    resetForm();
    setFormOpen(true);
    setMessage('');
  }

  function openEdit(user: CrmUser) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role:
        user.role === 'admin' || user.role === 'sales' || user.role === 'staff'
          ? user.role
          : 'staff',
      password: '',
      status: user.status,
    });
    setFormOpen(true);
    setError('');
    setMessage('');
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId) {
      const patch: Parameters<typeof updateUser>[1] = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        status: form.status,
      };
      if (form.password.trim()) {
        patch.password = form.password;
      }
      const result = updateUser(editingId, patch);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setMessage(`Updated ${result.name}.`);
      closeForm();
      return;
    }

    const result = createUser({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      password: form.password,
      status: 'active',
    });
    if ('error' in result) {
      setError(result.error);
      return;
    }
    setMessage(`Created ${result.name}.`);
    closeForm();
  }

  function onDelete(user: CrmUser) {
    if (user.id === currentUser?.id) {
      setError('You cannot delete your own account.');
      return;
    }
    const ok = window.confirm(`Delete ${user.name}? This cannot be undone.`);
    if (!ok) return;
    const result = deleteUser(user.id);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (editingId === user.id) closeForm();
    setError('');
    setMessage(`Deleted ${user.name}.`);
  }

  return (
    <>
      <header className="crm-topbar">
        <div>
          <h1 className="crm-page-title">Users</h1>
          <p className="crm-page-sub">Staff accounts, roles, and access (admin)</p>
        </div>
        <div className="crm-actions">
          {formOpen ? (
            <button type="button" className="crm-btn crm-btn-secondary" onClick={closeForm}>
              <X size={16} aria-hidden />
              Close form
            </button>
          ) : (
            <button type="button" className="crm-btn crm-btn-primary" onClick={openCreate}>
              <Plus size={16} aria-hidden />
              Create user
            </button>
          )}
        </div>
      </header>

      {message ? <div className="crm-alert crm-alert-success">{message}</div> : null}
      {error ? <div className="crm-alert crm-alert-error">{error}</div> : null}

      {formOpen ? (
        <section className="crm-panel crm-user-form-panel">
          <h2 className="crm-panel-title">
            {editingId ? 'Edit user' : 'Create user'}
          </h2>
          <form className="crm-form" onSubmit={onSubmit}>
            <div className="crm-form-grid">
              <div className="crm-field">
                <label htmlFor="user-name">Name *</label>
                <input
                  id="user-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="crm-field">
                <label htmlFor="user-email">Email *</label>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="crm-field">
                <label htmlFor="user-phone">Phone</label>
                <input
                  id="user-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="crm-field">
                <label htmlFor="user-role">Role *</label>
                <select
                  id="user-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                >
                  {FORM_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="crm-field">
                <label htmlFor="user-password">
                  Password {editingId ? '(leave blank to keep)' : '*'}
                </label>
                <input
                  id="user-password"
                  type="password"
                  required={!editingId}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {editingId ? (
                <div className="crm-field">
                  <label htmlFor="user-status">Status</label>
                  <select
                    id="user-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as CrmUser['status'],
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              ) : null}
            </div>
            <div className="crm-user-form-actions">
              <button type="submit" className="crm-btn crm-btn-primary crm-btn-sm">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                className="crm-btn crm-btn-secondary crm-btn-sm"
                onClick={closeForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <CrmTable stickyHeader>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Leads owned</th>
            <th className={crmTableActionsClass}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {state.users.map((u) => {
            const owned = state.leads.filter((l) => l.assignedStaffId === u.id).length;
            return (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{roleLabel(u.role)}</td>
                <td>{u.status}</td>
                <td>{owned}</td>
                <td className={crmTableActionsClass}>
                  <div className="crm-table-icon-actions">
                    <button
                      type="button"
                      className="crm-table-icon-btn"
                      title="Edit user"
                      aria-label={`Edit ${u.name}`}
                      onClick={() => openEdit(u)}
                    >
                      <Pencil size={15} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className="crm-table-icon-btn crm-table-icon-btn--danger"
                      title="Delete user"
                      aria-label={`Delete ${u.name}`}
                      disabled={u.id === currentUser?.id}
                      onClick={() => onDelete(u)}
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </CrmTable>
    </>
  );
}
