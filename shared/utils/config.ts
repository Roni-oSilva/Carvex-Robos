import { existsSync } from "node:fs";

/** Carrega .env se existir (Node 22+). Nunca versione o .env. */
export function loadEnvFile(path = ".env"): void {
  if (existsSync(path) && typeof process.loadEnvFile === "function") process.loadEnvFile(path);
}

export function env(name: string, fallback?: string): string | undefined {
  const v = process.env[name];
  return v !== undefined && v !== "" ? v : fallback;
}

export function requireEnv(name: string): string {
  const v = env(name);
  if (!v) throw new Error(`Variável de ambiente obrigatória ausente: ${name}. Veja o arquivo .env.example.`);
  return v;
}

export function envInt(name: string, fallback: number): number {
  const v = env(name);
  if (v === undefined) return fallback;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`${name} deve ser um número inteiro.`);
  return n;
}
