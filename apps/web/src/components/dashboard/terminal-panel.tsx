"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Send, CheckCircle, XCircle, Clock } from "lucide-react";
import { useOrg } from "@/lib/org-context";
import { apiFetch, getApiUrl, getAccessToken } from "@/lib/api";

interface Session { _id: string; command: string; status: string; logs: string[]; exitCode: number | null; createdAt: string; }
interface LogLine { text: string; type: "stdout" | "stderr" | "system" | "input"; }

function lineColor(line: LogLine) {
  if (line.type === "input") return "text-[#F6410F]";
  if (line.text.startsWith("[stderr]")) return "text-red-400";
  if (line.text.startsWith("[system]")) return "text-[#6b6b6b]";
  return "text-[#c0c0c0]";
}

export function TerminalPanel({ workspaceId }: { workspaceId?: string }) {
  const { activeOrg } = useOrg();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [lines, setLines] = useState<LogLine[]>([{ text: "Forge Terminal — ready", type: "system" }]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!activeOrg) return;
    try {
      const res = await apiFetch<{ data: Session[] }>(`/terminal/sessions?organizationId=${activeOrg._id}&limit=5`);
      setSessions(res.data);
    } catch { /* silent */ }
  }, [activeOrg]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  async function runCommand(cmd: string) {
    if (!activeOrg || !cmd.trim() || running) return;
    setRunning(true);
    setHistory((h) => [cmd, ...h.slice(0, 49)]);
    setHistoryIdx(-1);
    setLines((l) => [...l, { text: `$ ${cmd}`, type: "input" }]);
    try {
      const res = await apiFetch<{ data: Session }>("/terminal/exec", {
        method: "POST",
        body: JSON.stringify({ command: cmd, organizationId: activeOrg._id, workspaceId }),
      });
      const sessionId = res.data._id;
      const token = getAccessToken();
      const es = new EventSource(`${getApiUrl()}/api/terminal/${sessionId}/stream?token=${token ?? ""}`);
      abortRef.current = () => es.close();
      es.onmessage = (e) => {
        const data = JSON.parse(e.data) as { line?: string; done?: boolean; exitCode?: number };
        if (data.line) {
          const type = data.line.startsWith("[stderr]") ? "stderr" : data.line.startsWith("[system]") ? "system" : "stdout";
          setLines((l) => [...l, { text: data.line!, type }]);
        }
        if (data.done) {
          setLines((l) => [...l, { text: `[exit ${data.exitCode ?? "?"}] ${data.exitCode === 0 ? "✓ done" : "✗ failed"}`, type: "system" }]);
          es.close(); setRunning(false); void fetchSessions();
        }
      };
      es.onerror = () => { setLines((l) => [...l, { text: "[system] Stream disconnected", type: "system" }]); es.close(); setRunning(false); };
    } catch (err) {
      setLines((l) => [...l, { text: `[system] Error: ${err instanceof Error ? err.message : String(err)}`, type: "system" }]);
      setRunning(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { const cmd = input.trim(); setInput(""); void runCommand(cmd); }
    else if (e.key === "ArrowUp") { e.preventDefault(); const idx = Math.min(historyIdx + 1, history.length - 1); setHistoryIdx(idx); setInput(history[idx] ?? ""); }
    else if (e.key === "ArrowDown") { e.preventDefault(); const idx = Math.max(historyIdx - 1, -1); setHistoryIdx(idx); setInput(idx === -1 ? "" : (history[idx] ?? "")); }
    else if (e.key === "c" && e.ctrlKey) { abortRef.current?.(); setLines((l) => [...l, { text: "^C", type: "system" }]); setRunning(false); }
  }

  return (
    <div className="border border-[#1a1a1a] bg-black flex flex-col h-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a] shrink-0">
        <div className="flex items-center gap-3">
          <span className="h-px w-4 bg-[#F6410F]" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#F6410F]">Terminal</span>
        </div>
        {sessions.length > 0 && (
          <div className="flex items-center gap-1">
            {sessions.slice(0, 3).map((s) => (
              <button key={s._id} onClick={() => setLines([{ text: `$ ${s.command}`, type: "input" }, ...s.logs.map((l) => ({ text: l, type: (l.startsWith("[stderr]") ? "stderr" : l.startsWith("[system]") ? "system" : "stdout") as LogLine["type"] }))])}
                className="flex items-center gap-1 px-2 py-0.5 text-[9px] border border-[#1a1a1a] hover:border-[#F6410F]/30 transition text-[#4a4a4a] hover:text-white"
                title={s.command}
              >
                {s.status === "completed" ? <CheckCircle className="size-2.5 text-white" /> : s.status === "failed" ? <XCircle className="size-2.5 text-red-400" /> : <Clock className="size-2.5 text-[#F6410F]" />}
                <span className="max-w-[50px] truncate">{s.command}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        <div className="font-mono text-[11px] space-y-0.5">
          {lines.map((line, i) => <p key={i} className={lineColor(line)}>{line.text}</p>)}
          {running && <p className="text-[#F6410F] animate-pulse">▋</p>}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-[#1a1a1a] px-4 py-2 shrink-0">
        <span className="text-[#F6410F] font-mono text-xs shrink-0">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={running ? "running..." : "enter command"}
          disabled={running}
          className="flex-1 bg-transparent text-xs font-mono text-white outline-none placeholder:text-[#2a2a2a] disabled:opacity-50"
        />
        <button
          disabled={running || !input.trim()}
          onClick={() => { const cmd = input.trim(); setInput(""); void runCommand(cmd); }}
          className="text-[#3a3a3a] hover:text-[#F6410F] transition disabled:opacity-30"
        >
          <Send className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
