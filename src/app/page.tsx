import { Boxes, ShieldCheck, GitBranch, Database, LineChart, Bot } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-72px)]">
      {/* Page-specific gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-fuchsia-950/25 via-black to-black" />
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">HITL Finance Agent</h1>
          <p className="max-w-2xl text-zinc-700 dark:text-zinc-300">
            Local decision-support dashboard with a Human-in-the-Loop approval workflow.
            No auto-trading. Full audit trail.
          </p>
        </div>

        {/* System Diagram */}
        <section className="rounded-2xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm backdrop-blur
                            dark:border-zinc-800/70 dark:bg-zinc-900/40">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">System Diagram</h2>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                How data, the agent, approvals, and the UI connect end-to-end.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700
                            dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
              <ShieldCheck size={14} />
              HITL only (no execution)
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {/* Frontend */}
            <div className="rounded-xl border border-zinc-200/70 bg-white p-4 dark:border-zinc-800/70 dark:bg-zinc-950/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <Boxes size={16} />
                Frontend (Next.js)
              </div>
              <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">Market: candles + timeframe</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">Dashboard: P/L tiles</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">Trades: paper log</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">Agent Desk: memo + request</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">Approvals: approve/reject</div>
              </div>
            </div>

            {/* Backend */}
            <div className="rounded-xl border border-zinc-200/70 bg-white p-4 dark:border-zinc-800/70 dark:bg-zinc-950/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <Bot size={16} />
                Backend (FastAPI + Agent)
              </div>
              <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">
                  <span className="inline-flex items-center gap-2">
                    <LineChart size={14} /> /market/ohlcv (MVP yfinance)
                  </span>
                </div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">/portfolio/pnl</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">/trades (paper log)</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">/agent/ask → structured JSON</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">/hitl/approvals (workflow)</div>
              </div>
            </div>

            {/* Governance */}
            <div className="rounded-xl border border-zinc-200/70 bg-white p-4 dark:border-zinc-800/70 dark:bg-zinc-950/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <Database size={16} />
                Governance + Storage
              </div>
              <div className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">Postgres: approvals (audit)</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">Postgres: positions + trades</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">Human decision required</div>
                <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/40">
                  <span className="inline-flex items-center gap-2">
                    <GitBranch size={14} /> Traceability from memo → decision
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-200/70 bg-zinc-50 p-4 text-sm text-zinc-700
                          dark:border-zinc-800/70 dark:bg-zinc-950/40 dark:text-zinc-300">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Flow:</span>{" "}
            UI request → FastAPI (market/portfolio/trades) → Agent memo → ApprovalRequest (PENDING) → Human decision →
            Audit trail persists → UI reflects status.
          </div>
        </section>
      </div>
    </div>
  );
}
