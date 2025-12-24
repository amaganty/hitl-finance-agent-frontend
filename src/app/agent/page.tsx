"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, Container, Input } from "@/components/ui";
import { apiFetch } from "@/lib/api";

type Recommendation = {
  symbol?: string;
  question?: string;
  recommendation?: string;
  time_horizon?: string;
  risk?: string;
  market_snapshot?: {
    last_close?: number;
    change_1d?: number;
    change_1d_pct?: number;
  };
  rationale?: string[];
  next_checks?: string[];
};

type AgentResponse = {
  approval_id?: number;
  recommendation_json?: Recommendation;
  answer?: string;
};

function fmt(n: number | undefined | null) {
  if (n === null || n === undefined) return "-";
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function AgentPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [question, setQuestion] = useState("Should I buy AAPL?");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AgentResponse | null>(null);
  const [msg, setMsg] = useState("");

  const memo = resp?.recommendation_json;

  const recBadge = useMemo(() => {
    const r = (memo?.recommendation ?? "").toUpperCase();
    if (r === "BUY") return { label: "BUY", variant: "default" as const, tone: "success" as const };
    if (r === "SELL") return { label: "SELL", variant: "default" as const, tone: "danger" as const };
    return { label: r || "HOLD", variant: "secondary" as const, tone: "neutral" as const };
  }, [memo?.recommendation]);

  async function ask() {
    try {
      setLoading(true);
      setMsg("");
      setResp(null);

      const json = await apiFetch<AgentResponse>("/agent/ask", {
        method: "POST",
        body: JSON.stringify({ symbol: symbol.toUpperCase().trim(), question }),
      });

      setResp(json);
      setMsg("Agent memo generated.");
    } catch (e: any) {
      setMsg(`Ask failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] text-foreground">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-violet-200 via-white to-white dark:from-violet-950/60 dark:via-black dark:to-black" />

      <Container className="py-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Agent Desk</h1>
              <Badge variant="secondary">HITL Memo</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Generates a memo + creates a pending approval request.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">{msg}</div>
        </div>

        <Card>
          <div className="p-5 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Symbol</label>
                <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Question</label>
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
              </div>

              <Button onClick={ask} disabled={loading} className="w-full">
                {loading ? "Asking..." : "Ask Agent"}
              </Button>

              {resp?.approval_id != null && (
                <div className="rounded-xl border border-black/10 bg-card p-4 text-card-foreground dark:border-white/10">
                  <div className="font-semibold">Approval Created</div>
                  <div className="mt-1 text-xs text-muted-foreground">approval_id</div>
                  <div className="mt-1 font-mono">{resp.approval_id}</div>
                </div>
              )}

              {resp?.answer && (
                <div className="rounded-xl border border-black/10 bg-card p-4 text-card-foreground dark:border-white/10">
                  <div className="text-xs text-muted-foreground">Summary</div>
                  <div className="mt-1">{resp.answer}</div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">Research Memo</div>

                {/* Keep your badge system but ensure readability */}
                {recBadge.tone === "success" ? (
                  <Badge className="bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black">
                    {recBadge.label}
                  </Badge>
                ) : recBadge.tone === "danger" ? (
                  <Badge className="bg-rose-600 text-white dark:bg-rose-500 dark:text-black">
                    {recBadge.label}
                  </Badge>
                ) : (
                  <Badge variant={recBadge.variant}>{recBadge.label}</Badge>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 bg-card p-4 text-card-foreground dark:border-white/10">
                  <div className="text-xs text-muted-foreground">Symbol</div>
                  <div className="mt-1 text-lg font-semibold">{memo?.symbol ?? "-"}</div>

                  <div className="mt-2 text-xs text-muted-foreground">Horizon</div>
                  <div className="mt-1">{memo?.time_horizon ?? "-"}</div>
                </div>

                <div className="rounded-xl border border-black/10 bg-card p-4 text-card-foreground dark:border-white/10">
                  <div className="text-xs text-muted-foreground">Risk</div>
                  <div className="mt-1 text-lg font-semibold">{memo?.risk ?? "-"}</div>

                  <div className="mt-2 text-xs text-muted-foreground">Question</div>
                  <div className="mt-1">{memo?.question ?? "-"}</div>
                </div>

                <div className="rounded-xl border border-black/10 bg-card p-4 text-card-foreground dark:border-white/10 sm:col-span-2">
                  <div className="text-xs text-muted-foreground">Market Snapshot</div>

                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Last Close</div>
                      <div className="mt-1 font-semibold">
                        {fmt(memo?.market_snapshot?.last_close)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Change (1D)</div>
                      <div className="mt-1 font-semibold">
                        {fmt(memo?.market_snapshot?.change_1d)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground">Change % (1D)</div>
                      <div className="mt-1 font-semibold">
                        {memo?.market_snapshot?.change_1d_pct == null
                          ? "-"
                          : `${fmt(memo.market_snapshot.change_1d_pct)}%`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-black/10 bg-card p-4 text-card-foreground dark:border-white/10">
                  <div className="text-xs text-muted-foreground">Rationale</div>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {(memo?.rationale ?? []).length ? (
                      memo!.rationale!.map((x, i) => <li key={i}>{x}</li>)
                    ) : (
                      <li className="text-muted-foreground">Ask the agent to generate a memo.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-black/10 bg-card p-4 text-card-foreground dark:border-white/10">
                  <div className="text-xs text-muted-foreground">Next Checks</div>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {(memo?.next_checks ?? []).length ? (
                      memo!.next_checks!.map((x, i) => <li key={i}>{x}</li>)
                    ) : (
                      <li className="text-muted-foreground">Generate a memo to see checks.</li>
                    )}
                  </ul>
                </div>
              </div>

              <details className="rounded-xl border border-black/10 bg-card p-4 text-card-foreground dark:border-white/10">
                <summary className="cursor-pointer text-sm font-semibold">
                  View raw JSON (debug)
                </summary>
                <pre className="mt-3 max-h-[360px] overflow-auto rounded-lg border border-black/10 bg-black/5 p-3 text-xs text-foreground dark:border-white/10 dark:bg-white/5">
                  {JSON.stringify(resp?.recommendation_json ?? {}, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
