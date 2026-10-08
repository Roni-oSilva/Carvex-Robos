import { normalize } from "../../../shared/utils/text.ts";
import type { Corretor, Imovel, LeadSettings } from "./settings.ts";
import { cents } from "./settings.ts";
import type { Prazo, Temperatura } from "./store.ts";

export interface Perfil { finalidade: "comprar" | "alugar"; tipoId: string; bairro: string; minCents: number; maxCents: number; quartos: number }

/** Só devolve imóveis CADASTRADOS e disponíveis que cabem no perfil (nada é inventado). */
export function compativeis(s: LeadSettings, p: Perfil, max = 5): Imovel[] {
  return s.imoveis
    .filter((i) => i.disponivel && i.finalidade === p.finalidade && i.tipo === p.tipoId && normalize(i.bairro) === normalize(p.bairro) && cents(i.preco) >= p.minCents && cents(i.preco) <= p.maxCents && i.quartos >= p.quartos)
    .sort((a, b) => a.preco - b.preco)
    .slice(0, max);
}

/**
 * Pontuação transparente (documentada em docs/FLUXOS.md):
 *  prazo urgente +4 · 1 a 3 meses +2 · só pesquisando 0
 *  há imóvel compatível cadastrado +2 · informou nº de quartos +1
 *  demonstrou interesse em um imóvel +1 · agendou visita +2
 * quente ≥ 5 · morno 2–4 · frio < 2
 */
export function pontuar(prazo: Prazo, achouImovel: boolean, quartos: number, interesse = false, visita = false): { pontos: number; temperatura: Temperatura } {
  const pontos = (prazo === "urgente" ? 4 : prazo === "curto" ? 2 : 0) + (achouImovel ? 2 : 0) + (quartos > 0 ? 1 : 0) + (interesse ? 1 : 0) + (visita ? 2 : 0);
  return { pontos, temperatura: pontos >= 5 ? "quente" : pontos >= 2 ? "morno" : "frio" };
}

/** Roteamento: corretor que atende o bairro (ou sem restrição) com menos leads em aberto. */
export function escolherCorretor(s: LeadSettings, bairro: string, abertosPorCorretor: Record<string, number>): Corretor | null {
  const cand = s.corretores.filter((c) => c.bairros.length === 0 || c.bairros.some((b) => normalize(b) === normalize(bairro)));
  const especificos = cand.filter((c) => c.bairros.length > 0);
  const pool = especificos.length ? especificos : cand;
  if (!pool.length) return null;
  return [...pool].sort((a, b) => (abertosPorCorretor[a.id] ?? 0) - (abertosPorCorretor[b.id] ?? 0) || a.id.localeCompare(b.id))[0];
}
