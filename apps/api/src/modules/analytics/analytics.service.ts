import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExecutionPlan } from "../../core/database/schemas";
import type { ExecutionPlanDocument } from "../../core/database/schemas";
import { AgentExecution } from "../../core/database/schemas";
import type { AgentExecutionDocument } from "../../core/database/schemas";
import { Activity } from "../../core/database/schemas";
import type { ActivityDocument } from "../../core/database/schemas";

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(ExecutionPlan.name) private readonly planModel: Model<ExecutionPlanDocument>,
    @InjectModel(AgentExecution.name) private readonly executionModel: Model<AgentExecutionDocument>,
    @InjectModel(Activity.name) private readonly activityModel: Model<ActivityDocument>,
  ) {}

  async getTokenUsage(_organizationId: string) {
    const plans = await this.planModel.find({ deletedAt: null }).lean().exec();

    let totalPrompt = 0;
    let totalCompletion = 0;
    let totalCost = 0;
    const byProvider: Record<string, { tokens: number; cost: number; calls: number }> = {};

    for (const plan of plans) {
      for (const step of plan.steps) {
        const r = (step.result ?? {}) as Record<string, unknown>;
        if (!r?.provider) continue;
        const prompt = Number(r.promptTokens ?? 0);
        const completion = Number(r.completionTokens ?? 0);
        const cost = Number(r.estimatedCost ?? 0);
        const provider = String(r.provider);

        totalPrompt += prompt;
        totalCompletion += completion;
        totalCost += cost;

        if (!byProvider[provider]) byProvider[provider] = { tokens: 0, cost: 0, calls: 0 };
        byProvider[provider].tokens += prompt + completion;
        byProvider[provider].cost += cost;
        byProvider[provider].calls += 1;
      }
    }

    return {
      totalPromptTokens: totalPrompt,
      totalCompletionTokens: totalCompletion,
      totalTokens: totalPrompt + totalCompletion,
      totalCost: Math.round(totalCost * 10000) / 10000,
      byProvider: Object.entries(byProvider).map(([provider, data]) => ({ provider, ...data })),
    };
  }

  async getCostOverTime(organizationId: string, days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const activities = await this.activityModel.find({
      organizationId,
      action: "orchestration.started",
      createdAt: { $gte: since },
      deletedAt: null,
    }).lean().exec();

    const byDay: Record<string, { date: string; cost: number; tokens: number; executions: number }> = {};

    for (const act of activities) {
      const raw = act as unknown as Record<string, unknown>;
      const day = new Date(raw.createdAt as Date).toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, cost: 0, tokens: 0, executions: 0 };
      const meta = act.metadata as Record<string, unknown>;
      byDay[day].cost += Number(meta.estimatedCost ?? 0);
      byDay[day].tokens += Number(meta.totalTokens ?? 0);
      byDay[day].executions += 1;
    }

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push(byDay[key] ?? { date: key, cost: 0, tokens: 0, executions: 0 });
    }

    return result;
  }

  async getAgentPerformance(organizationId: string) {
    const byAgent: Record<string, { agentType: string; total: number; completed: number; failed: number }> = {};

    const completedActivities = await this.activityModel.find({
      organizationId,
      action: { $regex: /^agent\..+\.completed$/ },
      deletedAt: null,
    }).lean().exec();

    for (const act of completedActivities) {
      const agentType = act.action.split(".")[1] ?? "unknown";
      if (!byAgent[agentType]) byAgent[agentType] = { agentType, total: 0, completed: 0, failed: 0 };
      byAgent[agentType].total += 1;
      byAgent[agentType].completed += 1;
    }

    const failedActivities = await this.activityModel.find({
      organizationId,
      action: { $regex: /^agent\..+\.failed$/ },
      deletedAt: null,
    }).lean().exec();

    for (const act of failedActivities) {
      const agentType = act.action.split(".")[1] ?? "unknown";
      if (!byAgent[agentType]) byAgent[agentType] = { agentType, total: 0, completed: 0, failed: 0 };
      byAgent[agentType].total += 1;
      byAgent[agentType].failed += 1;
    }

    return Object.values(byAgent).map((a) => ({
      ...a,
      successRate: a.total > 0 ? Math.round((a.completed / a.total) * 100) : 0,
    }));
  }

  async getFailureDiagnostics(organizationId: string, limit = 10) {
    const executions = await this.executionModel.find({
      organizationId,
      status: "failed",
      deletedAt: null,
    })
      .sort({ startedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return executions.map((e) => ({
      id: String(e._id),
      taskId: String(e.taskId),
      agentId: String(e.agentId),
      error: (e.result as Record<string, unknown>).error ?? "Unknown error",
      startedAt: e.startedAt,
      finishedAt: e.finishedAt,
    }));
  }

  async getSummary(organizationId: string) {
    const [tokenUsage, agentPerf, failures] = await Promise.all([
      this.getTokenUsage(organizationId),
      this.getAgentPerformance(organizationId),
      this.getFailureDiagnostics(organizationId, 5),
    ]);

    const totalExecutions = agentPerf.reduce((s, a) => s + a.total, 0);
    const totalCompleted = agentPerf.reduce((s, a) => s + a.completed, 0);
    const overallSuccessRate = totalExecutions > 0
      ? Math.round((totalCompleted / totalExecutions) * 100)
      : 0;

    return {
      tokenUsage,
      overallSuccessRate,
      totalExecutions,
      recentFailures: failures.length,
    };
  }
}
