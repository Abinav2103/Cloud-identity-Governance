import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Cloud,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: { theme: 'outline'; size: 'large'; text: 'continue_with'; width: number }
          ) => void;
        };
      };
    };
  }
}

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useApp();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('ramesh.kumar@sentrygate.io');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const button = googleButtonRef.current;
    if (!clientId || !button) return;

    let active = true;
    let observer: ResizeObserver | undefined;
    const initializeGoogleSignIn = () => {
      if (!active || !window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const user = await apiClient.signInWithGoogle(credential);
            loginWithGoogle(user);
            navigate('/');
          } catch {
            setError('Google sign-in could not be completed. Check the OAuth configuration and try again.');
          }
        },
      });

      const renderButton = () => {
        if (!googleButtonRef.current) return;
        const width = Math.floor(googleButtonRef.current.getBoundingClientRect().width);
        if (!width) return;
        googleButtonRef.current.replaceChildren();
        window.google?.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width,
        });
      };

      renderButton();
      observer = new ResizeObserver(renderButton);
      observer.observe(googleButtonRef.current);
    };

    const script = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      script?.addEventListener('load', initializeGoogleSignIn, { once: true });
    }

    return () => {
      active = false;
      observer?.disconnect();
      script?.removeEventListener('load', initializeGoogleSignIn);
    };
  }, [loginWithGoogle, navigate]);

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

      {/* Main Glass Card with Solid Blue Background */}
      <div className="relative z-10 w-full max-w-md bg-blue-600 rounded-2xl shadow-xl border border-blue-500 p-8 space-y-6 text-white">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white text-blue-600 shadow-md shadow-blue-900/30 mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SentryGate</h1>
          <p className="text-xs text-blue-100 max-w-xs mx-auto">
            Cloud Identity Governance & Privileged Access Management (PAM)
          </p>
        </div>

        <div className="space-y-2">
          <div ref={googleButtonRef} className="min-h-10 w-full" />
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <p className="text-center text-[11px] text-blue-100">
              Add VITE_GOOGLE_CLIENT_ID to your .env file to enable Google sign-in.
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-300 text-rose-100 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-white">
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
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-white bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-white">Password</label>
              <span className="text-[11px] text-blue-100 font-medium cursor-pointer hover:underline">
                Reset via Okta
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-white bg-white text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-blue-600 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In with Enterprise SSO</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-[11px] text-blue-200 flex items-center justify-center gap-2 pt-2 border-t border-blue-500/60">
          <Cloud className="w-3.5 h-3.5 text-blue-200" />
          <span>FIDO2 / WebAuthn & Multi-Cloud Identity Guard</span>
        </div>
      </div>
    </div>
  );
};
