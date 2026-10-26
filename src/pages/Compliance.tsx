import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Calendar,
  Check,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Compliance: React.FC = () => {
  const { activeRole, complianceFrameworks, updateComplianceFramework } = useApp();
  const isAdmin = activeRole === 'Admin';

  const [isScanning, setIsScanning] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRunEvaluation = () => {
    setIsScanning(true);
    setTimeout(() => {
      // bump scores
      complianceFrameworks.forEach((c) => {
        const newScore = Math.min(100, c.score + 1);
        updateComplianceFramework(c.id, newScore);
      });
      setIsScanning(false);
      setSuccessMessage('Multi-cloud compliance scan completed successfully. Evidence updated.');
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Governance & Compliance Frameworks
            </h2>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isAdmin ? 'Admin Full Access' : 'View-Only Directory'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Continuous IAM posture evaluation mapped against global security standards and regulatory benchmarks.
          </p>
        </div>

        {/* Action Button: ADMIN ONLY */}
        {isAdmin && (
          <button
            onClick={handleRunEvaluation}
            disabled={isScanning}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Play className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Evaluating Controls...' : 'Run Automated Audit Scan'}
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Compliance Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {complianceFrameworks.map((comp) => (
          <div
            key={comp.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-slate-400 font-semibold">{comp.id}</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    comp.status === 'Compliant'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {comp.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">{comp.framework}</h3>

              <div className="my-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Compliance Health</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                    {comp.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      comp.score >= 90
                        ? 'bg-emerald-500'
                        : comp.score >= 75
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${comp.score}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Passing Controls:</span>
                <span className="font-mono font-semibold text-slate-800 tabular-nums">
                  {comp.controlsPassed} / {comp.totalControls}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Verified Audit:</span>
                <span className="font-mono text-slate-600">{comp.lastAudit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
