import { normalizeBrPhone, parseBRLToCents } from "../../../shared/utils/text.ts";

export interface LinhaImport { nome: string; telefone: string; descricao: string; valorCents: number; vencimento: string; referencia: string | null }

function parseData(s: string): string | null {
  const t = s.trim();
  let y: number, m: number, d: number;
  let r = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  if (r) { d = Number(r[1]); m = Number(r[2]); y = Number(r[3]); }
  else if ((r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t))) { y = Number(r[1]); m = Number(r[2]); d = Number(r[3]); }
  else return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * Colunas (separadas por ; ou TAB): nome ; telefone ; descrição ; valor ; vencimento ; referência (opcional)
 * Aceita colar direto de uma planilha. Linhas inválidas são devolvidas com o motivo; as boas seguem.
 */
export function parseImport(texto: string, max = 500): { ok: LinhaImport[]; erros: string[] } {
  const ok: LinhaImport[] = [], erros: string[] = [];
  const linhas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (linhas.length > max) erros.push(`Máximo de ${max} linhas por importação (você enviou ${linhas.length}).`);
  linhas.slice(0, max).forEach((linha, i) => {
    const n = i + 1;
    const c = linha.split(/[;\t]/).map((x) => x.trim());
    if (i === 0 && /^nome$/i.test(c[0] ?? "")) return; // cabeçalho
    if (c.length < 5) return void erros.push(`Linha ${n}: faltam colunas (nome; telefone; descrição; valor; vencimento).`);
    const telefone = normalizeBrPhone(c[1]);
    const valor = parseBRLToCents(c[3]);
    const venc = parseData(c[4]);
    if (!c[0] || c[0].length > 80) erros.push(`Linha ${n}: nome inválido.`);
    else if (!telefone) erros.push(`Linha ${n}: telefone inválido (“${c[1]}”). Use DDD + número.`);
    else if (!c[2] || c[2].length > 120) erros.push(`Linha ${n}: descrição inválida.`);
    else if (!valor || valor <= 0) erros.push(`Linha ${n}: valor inválido (“${c[3]}”).`);
    else if (!venc) erros.push(`Linha ${n}: vencimento inválido (“${c[4]}”). Use DD/MM/AAAA.`);
    else ok.push({ nome: c[0], telefone, descricao: c[2], valorCents: valor, vencimento: venc, referencia: c[5] ? c[5].slice(0, 60) : null });
  });
  return { ok, erros };
}
