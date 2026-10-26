import React, { useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  X,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AccessReviews: React.FC = () => {
  const { activeRole, accessReviews, createAccessReview } = useApp();
  const isAdmin = activeRole === 'Admin';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [targetCloud, setTargetCloud] = useState('AWS Commercial Cloud');
  const [reviewer, setReviewer] = useState('Priya Lakshmi');
  const [deadline, setDeadline] = useState('2026-11-15');
  const [totalCount, setTotalCount] = useState(25);
  const [error, setError] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      setError('Please provide a campaign title.');
      return;
    }

    createAccessReview({
      campaignName: campaignName.trim(),
      targetCloud,
      reviewer,
      deadline,
      totalCount,
    });

    setCampaignName('');
    setError('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Access Certification Reviews
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
            Periodic user access recertification campaigns to enforce least-privilege principles and satisfy SOC2 / ISO compliance.
          </p>
        </div>

        {/* Action Button: ADMIN ONLY */}
        {isAdmin && (
          <button
            onClick={() => {
              setError('');
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Review Campaign
          </button>
        )}
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        {accessReviews.map((rev) => {
          const progressPercent = Math.round((rev.reviewedCount / rev.totalCount) * 100);
          return (
            <div
              key={rev.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-1.5 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500">
                    {rev.id}
                  </span>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      rev.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : rev.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{rev.campaignName}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{rev.targetCloud}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Reviewer: <strong className="text-slate-700">{rev.reviewer}</strong>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Deadline: <span className="font-mono">{rev.deadline}</span>
                  </span>
                </div>
              </div>

              {/* Progress meter */}
              <div className="w-full md:w-64 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Recertification Progress</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {rev.reviewedCount}/{rev.totalCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADMIN MODAL: New Review Campaign */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Initiate Review Campaign
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4 Azure Identity Review"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Cloud / Perimeter
                </label>
                <input
                  type="text"
                  value={targetCloud}
                  onChange={(e) => setTargetCloud(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Certifier / Reviewer
                </label>
                <input
                  type="text"
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Completion Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accounts to Review
                  </label>
                  <input
                    type="number"
                    value={totalCount}
                    onChange={(e) => setTotalCount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-colors"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
