"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Container, Input } from "@/components/ui";
import { apiFetch } from "@/lib/api";

type Position = {
  id?: number;
  symbol: string;
  qty: number;
  avg_price: number;
  created_ts?: string;
};

type PnlResponse = {
  unrealized_pnl: number;
  gross_exposure: number;
  positions_count: number;
  positions: Array<{
    symbol: string;
    qty: number;
    avg_price: number;
    last_price: number | null;
    unrealized_pnl: number | null;
  }>;
};

function fmt(n: number | null | undefined) {
  if (n === null || n === undefined) return "-";
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [pnl, setPnl] = useState<PnlResponse | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  // Editor fields
  const [symbol, setSymbol] = useState("AAPL");
  const [qty, setQty] = useState("5");
  const [avg, setAvg] = useState("180");

  async function loadAll() {
    try {
      setLoading(true);
      setMsg("");

      const [pos, snap] = await Promise.all([
        apiFetch<Position[]>("/portfolio/positions"),
        apiFetch<PnlResponse>("/portfolio/pnl"),
      ]);

      setPositions(Array.isArray(pos) ? pos : []);
      setPnl(snap);
      setMsg("Updated.");
    } catch (e: any) {
      setMsg(`Load failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function upsert() {
    try {
      setLoading(true);
      setMsg("");

      const payload = {
        symbol: symbol.toUpperCase().trim(),
        qty: Number(qty),
        avg_price: Number(avg),
      };

      if (!payload.symbol) throw new Error("symbol required");
      if (!Number.isFinite(payload.qty) || payload.qty <= 0) throw new Error("qty must be > 0");
      if (!Number.isFinite(payload.avg_price) || payload.avg_price <= 0)
        throw new Error("avg_price must be > 0");

      await apiFetch<Position>("/portfolio/positions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMsg(`Saved ${payload.symbol}.`);
      await loadAll();
    } catch (e: any) {
      setMsg(`Save failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function deletePosition(sym: string) {
    try {
      setLoading(true);
      setMsg("");

      await apiFetch<{ ok: boolean }>(`/portfolio/positions/${encodeURIComponent(sym)}`, {
        method: "DELETE",
      });

      setMsg(`Deleted ${sym}.`);
      await loadAll();
    } catch (e: any) {
      setMsg(`Delete failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headline = useMemo(() => {
    const net = pnl?.unrealized_pnl ?? 0;
    return {
      net,
      badge: net > 0 ? "positive" : net < 0 ? "negative" : "neutral",
    } as const;
  }, [pnl]);

  return (
    <div className="relative min-h-[calc(100vh-72px)] text-foreground">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/20 via-black to-black dark:from-emerald-500/25" />

      <Container className="py-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* ✅ FIX: force token-based title so it flips correctly */}
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>

              {/* Keep your existing badge logic; cast variant to avoid TS complaining if your Badge type is narrow */}
              <Badge
                variant={
                  (headline.badge === "positive"
                    ? "success"
                    : headline.badge === "negative"
                    ? "danger"
                    : "secondary") as any
                }
              >
                Net: {pnl ? fmt(pnl.unrealized_pnl) : "-"}
              </Badge>

              <Badge variant="secondary">Portfolio</Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Edit positions here and refresh P/L snapshot.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ FIX: status (“Updated.”) should be token-muted, not stuck white */}
            <div className="text-sm text-muted-foreground">{msg}</div>

            <Button onClick={loadAll} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5 space-y-2">
            <div className="text-sm font-semibold text-foreground">Unrealized P/L</div>
            <div className="text-3xl font-semibold text-foreground">
              {pnl ? fmt(pnl.unrealized_pnl) : "-"}
            </div>
            <div className="text-xs text-muted-foreground">Sum of position P/L (paper).</div>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="text-sm font-semibold text-foreground">Gross Exposure</div>
            <div className="text-3xl font-semibold text-foreground">
              {pnl ? fmt(pnl.gross_exposure) : "-"}
            </div>
            <div className="text-xs text-muted-foreground">Notional (qty × last).</div>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="text-sm font-semibold text-foreground">Positions Count</div>
            <div className="text-3xl font-semibold text-foreground">
              {pnl ? pnl.positions_count : "-"}
            </div>
            <div className="text-xs text-muted-foreground">Active symbols.</div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Editor */}
          <Card className="lg:col-span-1">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                {/* ✅ FIX: H2 token-based */}
                <h2 className="text-sm font-semibold text-foreground">Position Editor</h2>
                <Badge variant="secondary">Upsert</Badge>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Symbol</label>
                <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Qty</label>
                  <Input value={qty} onChange={(e) => setQty(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Avg Price</label>
                  <Input value={avg} onChange={(e) => setAvg(e.target.value)} />
                </div>
              </div>

              <Button onClick={upsert} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save / Update Position"}
              </Button>

              <div className="text-xs text-muted-foreground">
                Delete any symbol from the snapshot table on the right.
              </div>
            </div>
          </Card>

          {/* Snapshot table */}
          <Card className="lg:col-span-2">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                {/* ✅ FIX: H2 token-based */}
                <h2 className="text-sm font-semibold text-foreground">PnL Snapshot</h2>
                <span className="text-xs text-muted-foreground">
                  {(pnl?.positions ?? []).length} rows
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-200/70 dark:border-zinc-800/70">
                <table className="w-full text-sm">
                  {/* ✅ FIX: table header uses token-like readable colors */}
                  <thead className="bg-zinc-50 text-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Symbol</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Avg</th>
                      <th className="px-3 py-2 text-right">Last</th>
                      <th className="px-3 py-2 text-right">P/L</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>

                  {/* ✅ BIG FIX: force tbody text to be readable in light mode */}
                  <tbody className="bg-white text-zinc-900 dark:bg-zinc-900/10 dark:text-zinc-100">
                    {(pnl?.positions ?? []).map((p) => (
                      <tr
                        key={p.symbol}
                        className="border-t border-zinc-200/70 dark:border-zinc-800/70"
                      >
                        {/* ✅ ensure every cell is readable in light mode */}
                        <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                          {p.symbol}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-900 dark:text-zinc-100">
                          {p.qty}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-900 dark:text-zinc-100">
                          {fmt(p.avg_price)}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-900 dark:text-zinc-100">
                          {fmt(p.last_price)}
                        </td>
                        <td className="px-3 py-2 text-right text-zinc-900 dark:text-zinc-100">
                          {fmt(p.unrealized_pnl)}
                        </td>

                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="secondary"
                            className="border border-rose-500/40 text-rose-800 dark:text-rose-200"
                            onClick={() => deletePosition(p.symbol)}
                            disabled={loading}
                            title={`Delete ${p.symbol}`}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {!(pnl?.positions ?? []).length && (
                      <tr>
                        <td className="px-3 py-6 text-center text-muted-foreground" colSpan={6}>
                          No positions yet. Add one in the editor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pt-2">
                <div className="text-xs text-muted-foreground">DB positions: {positions.length}</div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
