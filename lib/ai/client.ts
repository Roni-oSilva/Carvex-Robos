import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const AI_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022";

// USD por 1M de tokens (ajuste conforme o modelo configurado).
const PRICING = { input: 3, output: 15 };

export function estimateCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * PRICING.input + outputTokens * PRICING.output) / 1_000_000;
}
