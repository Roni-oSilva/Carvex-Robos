import { parseHHMM, type Horario } from "./time.ts";

/** Validador mínimo de configurações (sem dependências). Acumula mensagens em português. */
export class Check {
  errors: string[] = [];

  fail(path: string, msg: string): void { this.errors.push(`${path}: ${msg}`); }

  obj(v: unknown, path: string): Record<string, unknown> {
    if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
    this.fail(path, "deve ser um objeto { ... }");
    return {};
  }

  arr(v: unknown, path: string, max = 200): unknown[] {
    if (Array.isArray(v)) {
      if (v.length > max) this.fail(path, `no máximo ${max} itens`);
      return v.slice(0, max);
    }
    this.fail(path, "deve ser uma lista [ ... ]");
    return [];
  }

  str(v: unknown, path: string, o: { min?: number; max?: number; optional?: boolean } = {}): string {
    const { min = 1, max = 500, optional = false } = o;
    if (v === undefined || v === null || v === "") {
      if (!optional) this.fail(path, "campo obrigatório");
      return "";
    }
    if (typeof v !== "string") { this.fail(path, "deve ser texto entre aspas"); return ""; }
    if (v.length < min || v.length > max) this.fail(path, `texto deve ter entre ${min} e ${max} caracteres`);
    return v;
  }

  num(v: unknown, path: string, o: { min?: number; max?: number; int?: boolean; optional?: boolean; def?: number } = {}): number {
    if (v === undefined || v === null) {
      if (o.def !== undefined) return o.def;
      if (!o.optional) this.fail(path, "campo obrigatório");
      return o.def ?? 0;
    }
    if (typeof v !== "number" || !Number.isFinite(v)) { this.fail(path, "deve ser número (sem aspas)"); return 0; }
    if (o.int && !Number.isInteger(v)) this.fail(path, "deve ser número inteiro");
    if (o.min !== undefined && v < o.min) this.fail(path, `mínimo ${o.min}`);
    if (o.max !== undefined && v > o.max) this.fail(path, `máximo ${o.max}`);
    return v;
  }

  bool(v: unknown, path: string, def: boolean): boolean {
    if (v === undefined || v === null) return def;
    if (typeof v !== "boolean") { this.fail(path, "deve ser true ou false"); return def; }
    return v;
  }

  id(v: unknown, path: string): string {
    const s = this.str(v, path, { max: 40 });
    if (s && !/^[a-z0-9_-]+$/.test(s)) this.fail(path, "use só letras minúsculas, números, - e _ (sem espaços ou acentos)");
    return s;
  }

  horario(v: unknown, path: string): Horario {
    const o = this.obj(v, path);
    const out: Horario = {};
    for (const [dia, val] of Object.entries(o)) {
      if (!/^[0-6]$/.test(dia)) { this.fail(`${path}.${dia}`, "dia deve ser 0 (domingo) a 6 (sábado)"); continue; }
      const h = this.obj(val, `${path}.${dia}`);
      const abre = this.str(h.abre, `${path}.${dia}.abre`, { max: 5 });
      const fecha = this.str(h.fecha, `${path}.${dia}.fecha`, { max: 5 });
      const a = parseHHMM(abre), f = parseHHMM(fecha);
      if (abre && a === null) this.fail(`${path}.${dia}.abre`, 'formato "HH:MM"');
      if (fecha && f === null) this.fail(`${path}.${dia}.fecha`, 'formato "HH:MM"');
      if (a !== null && f !== null && f <= a) this.fail(`${path}.${dia}`, "fecha deve ser depois de abre");
      out[dia] = { abre, fecha };
    }
    return out;
  }

  date(v: unknown, path: string): string {
    const s = this.str(v, path, { max: 10 });
    if (s && !/^\d{4}-\d{2}-\d{2}$/.test(s)) this.fail(path, 'formato "AAAA-MM-DD"');
    return s;
  }

  result<T>(value: T): { ok: true; value: T } | { ok: false; error: string } {
    return this.errors.length ? { ok: false, error: this.errors.slice(0, 8).join(" | ") } : { ok: true, value };
  }
}

export function faqFrom(c: Check, v: unknown, path: string): { pergunta: string; resposta: string; palavras_chave?: string[] }[] {
  return c.arr(v ?? [], path, 100).map((raw, i) => {
    const o = c.obj(raw, `${path}[${i}]`);
    const kws = o.palavras_chave === undefined ? undefined : c.arr(o.palavras_chave, `${path}[${i}].palavras_chave`, 30).map((k) => String(k));
    return { pergunta: c.str(o.pergunta, `${path}[${i}].pergunta`, { max: 200 }), resposta: c.str(o.resposta, `${path}[${i}].resposta`, { max: 800 }), ...(kws ? { palavras_chave: kws } : {}) };
  });
}

export function empresaFrom(c: Check, v: unknown, path = "empresa") {
  const o = c.obj(v, path);
  const horario = o.horario === undefined ? undefined : c.horario(o.horario, `${path}.horario`);
  return {
    nome: c.str(o.nome, `${path}.nome`, { max: 80 }),
    endereco: c.str(o.endereco, `${path}.endereco`, { max: 200, optional: true }),
    telefone: c.str(o.telefone, `${path}.telefone`, { max: 40, optional: true }),
    horario_texto: c.str(o.horario_texto, `${path}.horario_texto`, { max: 200, optional: true }),
    pagamento: c.str(o.pagamento, `${path}.pagamento`, { max: 200, optional: true }),
    ...(horario ? { horario } : {}),
  };
}

export function mensagensFrom(c: Check, v: unknown, keys: string[], path = "mensagens"): Record<string, string> {
  const o = v === undefined ? {} : c.obj(v, path);
  const out: Record<string, string> = {};
  for (const k of keys) if (o[k] !== undefined) out[k] = c.str(o[k], `${path}.${k}`, { max: 1000 });
  return out;
}
