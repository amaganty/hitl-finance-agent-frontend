"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Container, Input } from "@/components/ui";
import { apiFetch } from "@/lib/api";

type Approval = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  symbol: string;
  created_ts: string;
  decided_ts: string | null;
  comment: string | null;
  recommendation_json: any;
};

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Approval[]>([]);
  const [msg, setMsg] = useState("");
  const [comment, setComment] = useState("");

  async function load() {
    try {
      setLoading(true);
      setMsg("");
      const data = await apiFetch<Approval[]>("/hitl/approvals");
      setRows(Array.isArray(data) ? data : []);
      setMsg("Loaded.");
    } catch (e: any) {
      setMsg(`Load failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  async function decide(id: number, decision: "APPROVED" | "REJECTED") {
    try {
      setLoading(true);
      setMsg("");

      await apiFetch(`/hitl/approvals/${id}/decision`, {
        method: "POST",
        body: JSON.stringify({ decision, comment: comment || null }),
      });

      setMsg(`Decision saved: ${decision}`);
      await load();
    } catch (e: any) {
      setMsg(`Decision failed: ${e?.message ?? "unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-72px)] text-foreground">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-950/35 via-black to-black" />

      <Container className="py-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Approvals
              </h1>
              <Badge>HITL</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Approve or reject agent recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{msg}</div>
            <Button onClick={load} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <div className="p-5 flex flex-wrap items-end gap-3">
            <div className="min-w-[360px] flex-1">
              <label className="text-xs text-muted-foreground">
                Comment (optional)
              </label>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Notes..."
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Applies to the next approve/reject action.
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          {rows.map((a) => (
            <Card key={a.id}>
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {a.symbol}
                      </span>
                      <Badge>{a.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        id: {a.id}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(a.created_ts).toLocaleString()}
                      {a.decided_ts
                        ? ` · Decided: ${new Date(
                            a.decided_ts
                          ).toLocaleString()}`
                        : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => decide(a.id, "APPROVED")}
                      disabled={loading || a.status !== "PENDING"}
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => decide(a.id, "REJECTED")}
                      disabled={loading || a.status !== "PENDING"}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-black/10 bg-black/5
                                dark:border-white/10 dark:bg-white/5
                                font-mono text-xs overflow-auto max-h-[360px] p-4">
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(a.recommendation_json, null, 2)}
                  </pre>
                </div>

                {a.comment && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold">Comment:</span>{" "}
                    {a.comment}
                  </div>
                )}
              </div>
            </Card>
          ))}

          {!rows.length && (
            <Card>
              <div className="p-8 text-center text-sm text-muted-foreground">
                No approvals found yet. Create one from Agent Desk.
              </div>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}
