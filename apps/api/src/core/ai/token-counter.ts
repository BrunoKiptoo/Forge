export class TokenCounter {
  // Simple estimation: ~4 chars per token for English text
  static estimate(text: string): number {
    return Math.ceil(text.length / 4);
  }

  static estimateMessages(
    messages: { role: string; content: string }[],
  ): number {
    return messages.reduce((sum, m) => sum + TokenCounter.estimate(m.content), 0);
  }
}
