import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_USERS } from '../data/mockData';
import { User, UserRole } from '../types';
import { Users, Plus, Shield, CheckCircle, XCircle, KeyRound, Mail } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { currentUser, addUser, auditLogs } = useApp();
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<UserRole>('OPERATOR');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      lastLogin: 'Never',
      status: 'ACTIVE',
    };
    setUsersList((prev) => [...prev, newUser]);
    addUser(newUser);
    setShowAddModal(false);
  };

  const toggleStatus = (id: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <span>Operator & Access Control Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based security accounts: Administrators, Parking Operators, Security Guards, and Auditors
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg shadow transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">User Profile</th>
              <th className="px-4 py-3">Email Address</th>
              <th className="px-4 py-3">Role & Permissions</th>
              <th className="px-4 py-3">Last Active</th>
              <th className="px-4 py-3">Account Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {usersList.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/40 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-300">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : user.role === 'OPERATOR'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : user.role === 'SECURITY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-slate-400">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleStatus(user.id)}
                    className="text-xs text-slate-400 hover:text-white underline font-mono"
                  >
                    {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Audit Log Overview */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Security Audit Trail & Override Log</span>
        </h3>
        <div className="space-y-2 font-mono text-xs">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-sky-400 font-bold mr-2">[{log.action}]</span>
                <span className="text-slate-200">{log.details}</span>
              </div>
              <div className="text-[10px] text-slate-500">
                {new Date(log.timestamp).toLocaleTimeString('en-IN')} by {log.userName}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" />
              <span>Create New Operator Account</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. anand@garuda-anpr.in"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role & Permissions:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="OPERATOR">Parking Operator (Gate & Manual Review)</option>
                  <option value="SECURITY">Security Guard (Gate Clearance Only)</option>
                  <option value="AUDITOR">Traffic Auditor (Read & Reports)</option>
                  <option value="ADMIN">System Administrator (Full Permissions)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
