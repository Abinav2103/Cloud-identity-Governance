import React, { useState } from 'react';
import {
  Lock,
  Key,
  ShieldCheck,
  Smartphone,
  Globe,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Authentication: React.FC = () => {
  const { activeRole, authSettings, updateAuthSettings } = useApp();
  const isAdmin = activeRole === 'Admin';

  const [mfaPolicy, setMfaPolicy] = useState(authSettings.mfaPolicy);
  const [sessionTimeout, setSessionTimeout] = useState(authSettings.sessionTimeoutMinutes);
  const [rotationDays, setRotationDays] = useState(authSettings.passwordRotationDays);
  const [ssoProvider, setSsoProvider] = useState(authSettings.ssoProvider);
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    updateAuthSettings({
      mfaPolicy,
      sessionTimeoutMinutes: Number(sessionTimeout),
      passwordRotationDays: Number(rotationDays),
      ssoProvider,
    });

    setSavedMessage('Authentication security policies successfully updated.');
    setTimeout(() => setSavedMessage(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Authentication & SSO Configuration
            </h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? 'Admin Full Access' : 'View-Only Policy'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Enterprise Single Sign-On (SSO), Multi-Factor Authentication (MFA), and session timeout thresholds.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-3xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* SSO Section */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Federated Identity Provider (SSO)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Configured enterprise identity provider syncing OAuth2 / OIDC credentials and SAML 2.0 assertions.
            </p>
            <div>
              <input
                type="text"
                disabled={!isAdmin}
                value={ssoProvider}
                onChange={(e) => setSsoProvider(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* MFA Policy */}
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Multi-Factor Authentication (MFA)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Enforce hardware security keys (FIDO2 / WebAuthn) or TOTP authenticator apps for console sign-in.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer text-xs ${
                  mfaPolicy === 'Enforced'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-700'
                } ${!isAdmin ? 'pointer-events-none' : ''}`}
              >
                <input
                  type="radio"
                  name="mfa"
                  disabled={!isAdmin}
                  checked={mfaPolicy === 'Enforced'}
                  onChange={() => setMfaPolicy('Enforced')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block font-bold">Strictly Enforced</span>
                  <span className="text-[11px] text-slate-500 font-normal">All user roles required to pass MFA</span>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer text-xs ${
                  mfaPolicy === 'Optional'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold'
                    : 'border-slate-200 text-slate-700'
                } ${!isAdmin ? 'pointer-events-none' : ''}`}
              >
                <input
                  type="radio"
                  name="mfa"
                  disabled={!isAdmin}
                  checked={mfaPolicy === 'Optional'}
                  onChange={() => setMfaPolicy('Optional')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="block font-bold">Optional / Grace Period</span>
                  <span className="text-[11px] text-slate-500 font-normal">Non-privileged roles may defer</span>
                </div>
              </label>
            </div>
          </div>

          {/* Session & Password Rotation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Session Idle Timeout (Minutes)
              </label>
              <input
                type="number"
                disabled={!isAdmin}
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Session automatically locks when inactive.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vault Credential Max Lifetime (Days)
              </label>
              <input
                type="number"
                disabled={!isAdmin}
                value={rotationDays}
                onChange={(e) => setRotationDays(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Maximum rotation window for PAM service credentials.
              </span>
            </div>
          </div>

          {/* Action button: ADMIN ONLY */}
          {isAdmin ? (
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
              >
                Save Authentication Policies
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Authentication policies are managed exclusively by Security Administrators.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
