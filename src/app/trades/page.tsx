"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Container, Input, Select } from "@/components/ui";
import { apiFetch } from "@/lib/api";

type Trade = {
  id?: number;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  ts?: string;
};

function fmt(n: number) {
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function TradesPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Trade[]>([]);
  const [msg, setMsg] = useState("");

  const [symbol, setSymbol] = useState("AAPL");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("100");

  async function load() {
    try {
      setLoading(true);
      setMsg("");
      const data = await apiFetch<any>("/trades");
      setRows(Array.isArray(data) ? data : data.trades ?? []);
      setMsg("Loaded.");
    } catch (e: any) {
      setMsg(`Load failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function addTrade() {
    try {
      setLoading(true);
      setMsg("");

      const payload: Trade = {
        symbol: symbol.toUpperCase().trim(),
        side,
        qty: Number(qty),
        price: Number(price),
      };

      await apiFetch("/trades", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMsg("Trade added.");
      await load();
    } catch (e: any) {
      setMsg(`Add failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTrade(id?: number) {
    if (!id) return;
    try {
      setLoading(true);
      setMsg("");
      await apiFetch(`/trades/${id}`, { method: "DELETE" });
      setMsg(`Deleted trade #${id}.`);
      await load();
    } catch (e: any) {
      setMsg(`Delete failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    let buys = 0;
    let sells = 0;
    for (const t of rows) {
      const notional = (t.qty ?? 0) * (t.price ?? 0);
      if (t.side === "BUY") buys += notional;
      else sells += notional;
    }
    return { buys, sells, net: sells - buys };
  }, [rows]);

  return (
    <div className="relative min-h-[calc(100vh-72px)] text-foreground">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-500/20 via-black to-black dark:from-amber-500/25" />

      <Container className="py-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Trades</h1>
              <Badge variant="secondary">Paper Log</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Add trades, delete bad rows, view the log.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{msg}</div>
            <Button onClick={load} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <div className="p-5 space-y-3">
              <h2 className="text-sm font-semibold">Add Trade</h2>

              <div>
                <label className="text-xs text-muted-foreground">Symbol</label>
                <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Side</label>
                <Select
                  value={side}
                  onValueChange={(v) => setSide(v as any)}
                  options={["BUY", "SELL"]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Qty</label>
                  <Input value={qty} onChange={(e) => setQty(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Price</label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>

              <Button onClick={addTrade} disabled={loading} className="w-full">
                Add
              </Button>

              <p className="text-xs text-muted-foreground">Paper tracking only.</p>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Trade Log</h2>
                <span className="text-xs text-muted-foreground">{rows.length} rows</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs text-muted-foreground">Buy Notional</div>
                  <div className="mt-1 text-lg font-semibold">{fmt(totals.buys)}</div>
                </div>
                <div className="rounded-xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs text-muted-foreground">Sell Notional</div>
                  <div className="mt-1 text-lg font-semibold">{fmt(totals.sells)}</div>
                </div>
                <div className="rounded-xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs text-muted-foreground">Net (Sell − Buy)</div>
                  <div className="mt-1 text-lg font-semibold">{fmt(totals.net)}</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-black/5 text-foreground dark:bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left">Time</th>
                      <th className="px-3 py-2 text-left">Symbol</th>
                      <th className="px-3 py-2 text-left">Side</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Notional</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-card text-card-foreground">
                    {rows.map((t) => (
                      <tr
                        key={t.id ?? `${t.symbol}-${t.ts}-${t.price}`}
                        className="border-t border-black/10 dark:border-white/10"
                      >
                        <td className="px-3 py-2 text-muted-foreground">
                          {t.ts ? new Date(t.ts).toLocaleString() : "-"}
                        </td>
                        <td className="px-3 py-2 font-medium">{t.symbol}</td>
                        <td className="px-3 py-2">{t.side}</td>
                        <td className="px-3 py-2 text-right">{t.qty}</td>
                        <td className="px-3 py-2 text-right">{fmt(t.price)}</td>
                        <td className="px-3 py-2 text-right">{fmt(t.qty * t.price)}</td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="secondary"
                            className="border border-rose-500/40 text-rose-800 dark:text-rose-200"
                            onClick={() => deleteTrade(t.id)}
                            disabled={loading || !t.id}
                            title="Delete trade"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {!rows.length && (
                      <tr>
                        <td className="px-3 py-6 text-center text-muted-foreground" colSpan={7}>
                          No trades yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-muted-foreground">
                Next we can add “edit trade” + trade-based P/L on this page.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}
