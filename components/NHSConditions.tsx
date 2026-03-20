
import React, { useState, useEffect } from 'react';
import { fetchNHSConditions } from '../services/nhsService';
import { NHSCondition } from '../types';

const NHSConditions: React.FC = () => {
  const [conditions, setConditions] = useState<NHSCondition[]>([]);
  const [filtered, setFiltered] = useState<NHSCondition[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchNHSConditions()
      .then(data => {
        if (!cancelled) {
          setConditions(data);
          setFiltered(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load NHS conditions.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      conditions.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      )
    );
  }, [search, conditions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">NHS Health Conditions</h2>
          <p className="text-slate-500 text-sm mt-1">
            Powered by the{' '}
            <a
              href="https://digital.nhs.uk/developer/api-catalogue/nhs-website-content"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              NHS Digital API
            </a>
          </p>
        </div>

        {!loading && !error && (
          <div className="relative w-full md:w-72">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conditions…"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
          <i className="fas fa-circle-notch fa-spin text-3xl text-indigo-400"></i>
          <p className="text-sm font-medium">Loading conditions from NHS API…</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <i className="fas fa-triangle-exclamation text-rose-500 text-xl mt-0.5"></i>
            <div>
              <h3 className="font-semibold text-rose-700 mb-1">Unable to load NHS data</h3>
              <p className="text-rose-600 text-sm">{error}</p>
              {error.includes('VITE_NHS_API_KEY') && (
                <p className="text-rose-500 text-xs mt-2">
                  Copy <code className="bg-rose-100 px-1 rounded">.env.example</code> to{' '}
                  <code className="bg-rose-100 px-1 rounded">.env</code> and add your NHS API key.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            {filtered.length} condition{filtered.length !== 1 ? 's' : ''} found
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <i className="fas fa-magnifying-glass text-3xl mb-3"></i>
              <p className="text-sm">No conditions match &ldquo;{search}&rdquo;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(condition => (
                <a
                  key={condition.url}
                  href={condition.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {condition.name}
                    </h3>
                    <i className="fas fa-arrow-up-right-from-square text-slate-300 group-hover:text-indigo-400 text-xs transition-colors"></i>
                  </div>
                  {condition.description && (
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                      {condition.description}
                    </p>
                  )}
                  <span className="mt-auto text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    NHS.UK →
                  </span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NHSConditions;
