"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { Card, Button, Input, Select, Container } from "@/components/ui";
import { apiFetch } from "@/lib/api";

export default function MarketPage() {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  const [symbol, setSymbol] = useState("AAPL");
  const [period, setPeriod] = useState("6mo");
  const [interval, setInterval] = useState("1d");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!ref.current) return;

    const chart = createChart(ref.current, {
      height: 420,
      layout: { background: { color: "#000" }, textColor: "#e5e7eb" },
      grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },
    });

    const series = chart.addSeries(CandlestickSeries);
    chartRef.current = chart;
    seriesRef.current = series;

    return () => chart.remove();
  }, []);

  async function load() {
    try {
      setStatus("Loading...");

      const json = await apiFetch<any>(
        `/market/ohlcv?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(
          period
        )}&interval=${encodeURIComponent(interval)}`
      );

      seriesRef.current.setData(
        (json.points ?? []).map((p: any) => ({
          time: Math.floor(new Date(p.t).getTime() / 1000),
          open: p.o,
          high: p.h,
          low: p.l,
          close: p.c,
        }))
      );

      chartRef.current.timeScale().fitContent();
      setStatus(`Loaded ${json.count ?? (json.points?.length ?? 0)} candles`);
    } catch (e: any) {
      setStatus(`Load failed: ${e?.message ?? "unknown error"}`);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] text-foreground">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-200 via-white to-white dark:from-sky-950/60 dark:via-black dark:to-black" />

      <Container className="py-6 space-y-4">
        <h1 className="text-2xl font-semibold">Market</h1>

        <Card className="p-4 flex gap-3 flex-wrap items-center">
          <div className="min-w-[140px]">
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>

          <div className="min-w-[120px]">
            <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>1mo</option>
              <option>3mo</option>
              <option>6mo</option>
              <option>1y</option>
            </Select>
          </div>

          <div className="min-w-[120px]">
            <Select value={interval} onChange={(e) => setInterval(e.target.value)}>
              <option>1d</option>
              <option>1h</option>
            </Select>
          </div>

          <Button onClick={load}>Load</Button>

          <span className="text-sm text-muted-foreground">{status}</span>
        </Card>

        <Card className="p-4">
          <div ref={ref} />
        </Card>
      </Container>
    </div>
  );
}
