'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// ─── CSS injected automatically ───────────────────────────────────────────────
const css = `
  /* ── Theme tokens ── */
  :root {
    --sk-base:       #e8e8f0;
    --sk-shine:      #f4f4fa;
    --sk-border:     #ebebf5;
    --sk-bg:         #ffffff;
    --sk-page-bg:    #f8f9fc;
    --sk-donut-hole: #ffffff;
  }

  /* Tailwind "class" dark mode (.dark on <html>) */
  .dark {
    --sk-base:       #1e2130;
    --sk-shine:      #262b3d;
    --sk-border:     #2a2f44;
    --sk-bg:         #141827;
    --sk-page-bg:    #0d1017;
    --sk-donut-hole: #141827;
  }

  /* ── REMOVED: @media (prefers-color-scheme: dark) block ──
     Reason: conflicts with Tailwind's "class" darkMode strategy.
     The OS-level media query was firing before React set the .dark
     class, causing the skeleton to always appear dark on dark OS.
     Theme is now controlled exclusively via the .dark class on <html>.
  */

  .sk {
    background: linear-gradient(
      90deg,
      var(--sk-base)  25%,
      var(--sk-shine) 50%,
      var(--sk-base)  75%
    );
    background-size: 200% 100%;
    animation: hms-shimmer 1.6s infinite;
    border-radius: 6px;
    flex-shrink: 0;
  }

  @keyframes hms-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .sk-circle { border-radius: 50%; }

  /* ── Stat Cards ── */
  .hms-sk-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }
  .hms-sk-card {
    background: var(--sk-bg);
    border-radius: 12px;
    border: 1px solid var(--sk-border);
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .hms-sk-card-text { display: flex; flex-direction: column; gap: 8px; flex: 1; }

  /* ── Charts ── */
  .hms-sk-charts {
    display: grid;
    grid-template-columns: 1fr 0.55fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  .hms-sk-chart-box {
    background: var(--sk-bg);
    border-radius: 12px;
    border: 1px solid var(--sk-border);
    padding: 18px;
  }
  .hms-sk-chart-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  .hms-sk-x-axis { display: flex; justify-content: space-between; margin-top: 8px; }

  /* ── Donut ── */
  .hms-sk-donut {
    width: 120px; height: 120px; border-radius: 50%;
    background: conic-gradient(
      var(--sk-base)  0deg   90deg,
      var(--sk-shine) 90deg  180deg,
      var(--sk-base)  180deg 270deg,
      var(--sk-shine) 270deg 360deg
    );
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .hms-sk-donut-hole {
    width: 72px; height: 72px;
    background: var(--sk-donut-hole);
    border-radius: 50%;
  }
  .hms-sk-donut-row  { display: flex; align-items: center; gap: 20px; margin-top: 8px; }
  .hms-sk-legend     { display: flex; flex-direction: column; gap: 10px; }
  .hms-sk-legend-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .hms-sk-legend-left { display: flex; align-items: center; gap: 8px; }

  /* ── Table ── */
  .hms-sk-table-box {
    background: var(--sk-bg);
    border-radius: 12px;
    border: 1px solid var(--sk-border);
    padding: 18px;
    margin-bottom: 20px;
  }
  .hms-sk-table-header {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 16px;
  }
  .hms-sk-table-cols {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 1fr;
    gap: 12px; padding: 0 4px 10px;
    border-bottom: 1px solid var(--sk-border);
    margin-bottom: 10px;
  }
  .hms-sk-table-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr 1fr;
    gap: 12px; padding: 10px 4px;
    border-bottom: 1px solid var(--sk-border);
    align-items: center;
  }
  .hms-sk-table-cell-first { display: flex; align-items: center; gap: 10px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('hms-sk-style')) {
  const style = document.createElement('style');
  style.id = 'hms-sk-style';
  style.innerHTML = css;
  document.head.appendChild(style);
}

// ─── Base Skeleton Box ────────────────────────────────────────────────────────
export function Skeleton({ w = '100%', h = '14px', circle = false, style = {} }) {
  return (
    <div
      className={`sk${circle ? ' sk-circle' : ''}`}
      style={{ width: w, height: h, ...style }}
    />
  );
}

// ─── Dashboard Content Skeleton ───────────────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div
      className="flex-1 overflow-y-auto p-6"
      style={{ background: 'var(--sk-page-bg)' }}
    >
      {/* Breadcrumb + page title */}
      <div style={{ marginBottom: 20 }}>
        <Skeleton w="160px" h="12px" style={{ marginBottom: 10 }} />
        <Skeleton w="220px" h="22px" style={{ marginBottom: 6 }} />
        <Skeleton w="300px" h="13px" />
      </div>

      {/* Stat Cards */}
      <div className="hms-sk-cards">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="hms-sk-card">
            <Skeleton w="48px" h="48px" style={{ borderRadius: 10 }} />
            <div className="hms-sk-card-text">
              <Skeleton w="70%" h="13px" />
              <Skeleton w="50%" h="20px" />
              <Skeleton w="60%" h="11px" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="hms-sk-charts">
        {/* Area chart */}
        <div className="hms-sk-chart-box">
          <div className="hms-sk-chart-header">
            <div>
              <Skeleton w="180px" h="15px" style={{ marginBottom: 8 }} />
              <Skeleton w="120px" h="12px" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Skeleton w="50px" h="26px" style={{ borderRadius: 6 }} />
              <Skeleton w="50px" h="26px" style={{ borderRadius: 6 }} />
            </div>
          </div>
          <Skeleton w="100%" h="160px" style={{ borderRadius: 10 }} />
          <div className="hms-sk-x-axis">
            {[1,2,3,4,5,6,7,8,9].map(i => <Skeleton key={i} w="30px" h="10px" />)}
          </div>
        </div>

        {/* Donut chart */}
        <div className="hms-sk-chart-box">
          <div className="hms-sk-chart-header">
            <div>
              <Skeleton w="140px" h="15px" style={{ marginBottom: 8 }} />
              <Skeleton w="100px" h="12px" />
            </div>
          </div>
          <div className="hms-sk-donut-row">
            <div className="hms-sk-donut">
              <div className="hms-sk-donut-hole" />
            </div>
            <div className="hms-sk-legend" style={{ flex: 1 }}>
              {[1,2,3].map(i => (
                <div key={i} className="hms-sk-legend-row">
                  <div className="hms-sk-legend-left">
                    <Skeleton circle w="10px" h="10px" />
                    <Skeleton w="80px" h="12px" />
                  </div>
                  <Skeleton w="40px" h="12px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="hms-sk-table-box">
        <div className="hms-sk-table-header">
          <div>
            <Skeleton w="180px" h="15px" style={{ marginBottom: 8 }} />
            <Skeleton w="120px" h="12px" />
          </div>
          <Skeleton w="90px" h="30px" style={{ borderRadius: 8 }} />
        </div>
        <div className="hms-sk-table-cols">
          {['60%','70%','70%','70%','50%'].map((w, i) => (
            <Skeleton key={i} w={w} h="12px" />
          ))}
        </div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="hms-sk-table-row">
            <div className="hms-sk-table-cell-first">
              <Skeleton w="34px" h="34px" style={{ borderRadius: 8 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton w="100px" h="12px" />
                <Skeleton w="70px" h="10px" />
              </div>
            </div>
            <Skeleton w="70%" h="12px" />
            <Skeleton w="60%" h="12px" />
            <Skeleton w="65%" h="12px" />
            <Skeleton w="60px" h="24px" style={{ borderRadius: 20 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Global Loading Context ───────────────────────────────────────────────────
const LoadingContext = createContext({ isLoading: false, setLoading: () => {} });

export function useLoadingContext() {
  return useContext(LoadingContext);
}

export function SkeletonProvider({ children }) {
  const [isLoading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(fetchFn) {
  const { isLoading, setLoading } = useContext(LoadingContext);

  useEffect(() => {
    setLoading(true);
    fetchFn().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return isLoading;
}