/**
 * User Management Modal — allows Super Admins to view, invite, and manage team members and roles.
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAdminUsersAPI, createAdminUserAPI, updateUserRoleAPI, deleteAdminUserAPI } from '../services/api';

function UserManagementModal({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsersAPI();
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      await createAdminUserAPI(email, password, role);
      toast.success(`User ${email} created as ${role}`);
      setEmail('');
      setPassword('');
      setRole('admin');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRoleAPI(userId, newRole);
      toast.success('Role updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete ${userEmail}?`)) return;
    try {
      await deleteAdminUserAPI(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl bg-white dark:bg-surface-card-dark rounded-2xl shadow-2xl border border-border dark:border-border-dark animate-fade-in-up max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-border-dark flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
              Admin & Role Management
            </h3>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
              Manage system administrators and role-based permissions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add User Form */}
          <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-border dark:border-border-dark">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary mb-3">
              Add New Team Member
            </h4>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary cursor-pointer"
              >
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Adding...' : '+ Add User'}
              </button>
            </form>
          </div>

          {/* User List */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary mb-3">
              Existing Users ({users.length})
            </h4>

            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-border dark:divide-border-dark border border-border dark:border-border-dark rounded-xl overflow-hidden">
                {users.map((u) => (
                  <div key={u._id} className="p-3.5 flex items-center justify-between bg-white dark:bg-surface-card-dark hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">{u.email}</p>
                      <span className="text-xs text-text-secondary dark:text-text-dark-secondary capitalize">
                        {u.role ? u.role.replace('_', ' ') : 'admin'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={u.role || 'admin'}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-text-primary dark:text-text-dark-primary cursor-pointer"
                      >
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                        <option value="super_admin">Super Admin</option>
                      </select>

                      <button
                        onClick={() => handleDeleteUser(u._id, u.email)}
                        className="text-danger hover:text-red-700 p-1 text-sm cursor-pointer"
                        title="Delete user"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border dark:border-border-dark flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-dark-primary text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserManagementModal;
