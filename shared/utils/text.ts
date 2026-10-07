/** Utilitários de texto puros (sem dependências). */

/** minúsculas, sem acentos, espaços normalizados — para comparar entradas do usuário. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function onlyDigits(s: string): string {
  return s.replace(/\D+/g, "");
}

/** Mascara telefone para logs: 5511987654321 -> 5511*****4321 */
export function maskPhone(p: string): string {
  const d = onlyDigits(p);
  if (d.length <= 8) return "***";
  return d.slice(0, 4) + "*".repeat(d.length - 8) + d.slice(-4);
}

/** Normaliza para o formato da WhatsApp Cloud API (somente dígitos, com DDI 55 se faltar). */
export function normalizeBrPhone(p: string): string | null {
  let d = onlyDigits(p);
  if (d.startsWith("0")) d = d.replace(/^0+/, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  if (!/^55\d{10,11}$/.test(d)) return null;
  return d;
}

/** Substitui {{chave}} por valores; chaves ausentes viram string vazia (nunca expõe "undefined"). */
export function render(template: string, vars: Record<string, string | number | undefined | null>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, k: string) => String(vars[k] ?? ""));
}

/** Valores monetários sempre em centavos inteiros. */
export function formatBRL(cents: number): string {
  const neg = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const reais = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${neg ? "-" : ""}R$ ${reais},${String(abs % 100).padStart(2, "0")}`;
}

/** "12,50" | "12.50" | "R$ 1.234,56" -> centavos; null se inválido. */
export function parseBRLToCents(input: string): number | null {
  const s = input.replace(/[^\d,.-]/g, "");
  if (!s) return null;
  let norm = s;
  if (s.includes(",")) norm = s.replace(/\./g, "").replace(",", ".");
  const n = Number(norm);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Corta texto para os limites do WhatsApp (ex.: título de botão = 20 caracteres). */
export function clip(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

const SAUDACAO_BASE = new Set(["oi", "oie", "oii", "ola", "opa", "eae", "hey", "hello", "salve", "bom", "boa", "dia", "tarde", "noite", "tudo", "bem", "e", "ai", "td", "blz", "tranquilo", "pessoal", "galera", "gente", "amigo", "amiga", "ola", "tem", "alguem", "ai"]);
const SAUDACAO_GATILHO = new Set(["oi", "oie", "oii", "ola", "opa", "eae", "hey", "hello", "salve", "bom", "boa"]);

/** "Oi, boa noite!" / "Olá tudo bem?" -> true. "Oi, quero marcar horário" -> false (tem pedido junto). */
export function isGreeting(text: string): boolean {
  const t = normalize(text).split(" ").filter(Boolean);
  return t.length > 0 && t.length <= 6 && t.every((w) => SAUDACAO_BASE.has(w)) && t.some((w) => SAUDACAO_GATILHO.has(w));
}
