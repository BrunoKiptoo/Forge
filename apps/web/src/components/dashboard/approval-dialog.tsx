"use client";

import { useState } from "react";
import { CheckCircle, Loader2, AlertTriangle, DollarSign, FileCode, ListChecks } from "lucide-react";

interface PlanStep {
  order: number;
  agentType: string;
  description: string;
  status: string;
}

interface CostMeta {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ApprovalPayload {
  plan: { _id: string; steps: PlanStep[] };
  costMeta: CostMeta;
  taskTitle: string;
  taskId: string;
}

const AGENT_FILES: Record<string, string[]> = {
  backend: ["src/modules/**/*.ts", "src/core/**/*.ts"],
  frontend: ["src/components/**/*.tsx", "src/app/**/*.tsx"],
  testing: ["src/**/*.spec.ts", "src/**/*.test.ts"],
  reviewer: ["— (read-only review)"],
  planner: ["— (planning only)"],
};

export function ApprovalDialog({
  payload,
  onApprove,
  onCancel,
}: {
  payload: ApprovalPayload;
  onApprove: () => Promise<void>;
  onCancel: () => void;
}) {
  const [approving, setApproving] = useState(false);

  async function handleApprove() {
    setApproving(true);
    try {
      await onApprove();
    } finally {
      setApproving(false);
    }
  }

  const { plan, costMeta, taskTitle } = payload;
  const totalCostEstimate = costMeta.estimatedCost * plan.steps.length;
  const filePatterns = plan.steps
    .flatMap((s) => AGENT_FILES[s.agentType] ?? ["src/**/*"])
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-50 w-full max-w-2xl border border-[#1f1f1f] bg-black shadow-xl">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1a1a1a]">
          <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs font-semibold tracking-wide">Review Execution Plan</h2>
            <p className="text-[11px] text-[#888888] truncate">{taskTitle}</p>
          </div>
        </div>

        {/* Body — two columns */}
        <div className="grid grid-cols-2 gap-0 divide-x divide-[#1a1a1a]">

          {/* Left — steps */}
          <div className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <ListChecks className="size-3 text-[#888888]" />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#888888]">
                Plan ({plan.steps.length} steps)
              </span>
            </div>
            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
              {plan.steps.map((step) => (
                <div key={step.order} className="flex items-start gap-2 border border-[#1a1a1a] bg-[#080808] px-2.5 py-2">
                  <span className="flex size-3.5 shrink-0 items-center justify-center bg-[#F6410F]/10 text-[8px] font-bold text-[#F6410F] mt-0.5">
                    {step.order + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] leading-snug text-[#d0d0d0] break-words">{step.description}</p>
                    <span className="inline-block mt-1 text-[9px] font-semibold tracking-[0.12em] uppercase border border-[#2a2a2a] px-1.5 py-0.5 text-[#888888]">
                      {step.agentType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — files + cost */}
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <FileCode className="size-3 text-[#888888]" />
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#888888]">Files</span>
              </div>
              <div className="border border-[#1a1a1a] bg-[#080808] p-2.5 space-y-1">
                {filePatterns.map((p) => (
                  <p key={p} className="font-mono text-[10px] text-[#888888]">{p}</p>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <DollarSign className="size-3 text-[#888888]" />
                <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#888888]">Cost Estimate</span>
              </div>
              <div className="border border-[#1a1a1a] bg-[#080808] p-2.5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888888]">Provider</span>
                  <span className="font-mono text-[11px] text-[#d0d0d0]">{costMeta.provider} / {costMeta.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888888]">Planning tokens</span>
                  <span className="font-mono text-[11px] text-[#d0d0d0]">{costMeta.totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#888888]">Est. execution</span>
                  <span className="font-mono text-[11px] text-[#d0d0d0]">~{(costMeta.totalTokens * plan.steps.length).toLocaleString()}</span>
                </div>
                <div className="border-t border-[#1a1a1a] pt-1.5 flex justify-between">
                  <span className="text-[11px] font-semibold">Total est.</span>
                  <span className="text-[11px] font-semibold text-[#F6410F]">${totalCostEstimate.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions — always visible */}
        <div className="flex gap-2 px-4 py-3 border-t border-[#1a1a1a]">
          <button
            className="flex-1 text-[11px] font-semibold tracking-[0.08em] uppercase border border-[#2a2a2a] text-[#888888] py-2.5 hover:text-white hover:border-[#444444] transition disabled:opacity-50"
            onClick={onCancel}
            disabled={approving}
          >
            Cancel
          </button>
          <button
            className="flex-1 text-[11px] font-semibold tracking-[0.08em] uppercase bg-[#F6410F] text-white py-2.5 hover:bg-[#d93a0d] transition disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={handleApprove}
            disabled={approving}
          >
            {approving
              ? <><Loader2 className="size-3 animate-spin" />Starting...</>
              : <><CheckCircle className="size-3" />Approve &amp; Execute</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
