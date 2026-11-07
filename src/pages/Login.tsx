import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_USERS } from '../data/mockData';
import { User, UserRole } from '../types';
import { Shield, Lock, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, setCurrentPage } = useApp();
  const [email, setEmail] = useState<string>('admin@garuda-anpr.in');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');

  const handleQuickLogin = (role: UserRole) => {
    const user = INITIAL_USERS.find((u) => u.role === role) || INITIAL_USERS[0];
    login(user);
    setCurrentPage('dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = INITIAL_USERS.find((u) => u.role === selectedRole) || INITIAL_USERS[0];
    login(user);
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-sky-500/25">
            <Shield className="w-9 h-9" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-white">
          GARUDA<span className="text-sky-400 font-mono text-sm ml-1 px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800">ANPR</span>
        </h2>
        <p className="mt-1 text-center text-xs font-mono text-slate-400">
          Indian Vehicle Number Plate & Enterprise Security Gateway
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          {/* Quick Persona Switcher for Evaluation */}
          <div className="mb-6">
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
              Select Demo Role Profile:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'ADMIN' as UserRole, label: 'Administrator', desc: 'Full System Control' },
                { role: 'OPERATOR' as UserRole, label: 'Parking Operator', desc: 'Gate & Barrier Control' },
                { role: 'SECURITY' as UserRole, label: 'Security Guard', desc: 'Checkpoint & Alarms' },
                { role: 'AUDITOR' as UserRole, label: 'Traffic Auditor', desc: 'Reports & Logs Only' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(item.role);
                    handleQuickLogin(item.role);
                  }}
                  className={`p-2.5 text-left rounded-xl border transition cursor-pointer ${
                    selectedRole === item.role
                      ? 'bg-sky-600/20 border-sky-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-mono text-[10px]">Or Standard Login</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  placeholder="name@company.in"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition cursor-pointer"
            >
              <span>Access ANPR Command Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Indian HSRP & Bharat-Series Compatible
            </div>
            <div>Supports all 36 Indian States & UTs with OCR confusion auto-correction.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
