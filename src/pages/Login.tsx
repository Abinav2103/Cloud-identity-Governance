import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Cloud,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Login: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('ramesh.kumar@sentrygate.io');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your corporate email address');
      return;
    }
    const success = login(email);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-100">
      {/* Background Image with Light Blur & Airy Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center filter blur-xs scale-105 opacity-60"
        style={{
          backgroundImage: `url(/src/assets/images/sentrygate_auth_bg_1790664054806.jpg)`,
        }}
      />
      {/* Light Gradient Scrim */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-100/90 via-sky-50/70 to-blue-100/80" />

      {/* Main Glass Card with Light Blue Background */}
      <div className="relative z-10 w-full max-w-md bg-sky-100/95 backdrop-blur-md rounded-2xl shadow-xl shadow-sky-900/10 border border-sky-300 p-8 space-y-6 text-slate-800">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30 mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">SentryGate</h1>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Cloud Identity Governance & Privileged Access Management (PAM)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-300 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@sentrygate.io"
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-sky-200/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-sky-200/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In with Enterprise SSO</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2 pt-2 border-t border-sky-200">
          <Cloud className="w-3.5 h-3.5 text-blue-500" />
          <span>FIDO2 / WebAuthn & Multi-Cloud Identity Guard</span>
        </div>
      </div>
    </div>
  );
};
