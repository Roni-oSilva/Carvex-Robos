import type { Outgoing } from "../whatsapp/types.ts";
import type { TestWorld } from "./helpers.ts";

export type Step = string | { say: string; tap?: string; label?: string; type?: "text" | "audio" | "image"; media?: string };

export function fmtOutgoing(m: Outgoing): string {
  switch (m.kind) {
    case "text": return m.body;
    case "template": return `_(modelo aprovado: ${m.name})_ ${m.params.join(" · ")}`;
    case "buttons": return `${m.body}\n${m.buttons.map((b) => `> 🔘 ${b.title}`).join("\n")}`;
    case "list": return `${m.body}\n${m.rows.map((r) => `> ▫️ ${r.title}${r.description ? ` — ${r.description}` : ""}`).join("\n")}`;
  }
}

/**
 * Executa um roteiro no robô de verdade e devolve a conversa em Markdown.
 * `tap` simula o toque em botão/lista (id interno); `say` é o texto que o cliente vê.
 */
export async function runScenario<S>(w: TestWorld<S>, who: string, title: string, steps: Step[], opts: { name?: string } = {}): Promise<string> {
  const lines = [`### ${title}`, ""];
  for (const st of steps) {
    const s = typeof st === "string" ? { say: st } : st;
    const before = w.wa.sent.length;
    await w.say(who, s.say, { replyId: s.tap, name: opts.name, type: s.type, mediaId: s.media });
    const shown = s.type && s.type !== "text" ? `📎 (${s.type === "audio" ? "áudio enviado" : "foto enviada"})` : s.tap ? `*toca em* “${s.say}”` : `“${s.say}”`;
    lines.push(`**CLIENTE:** ${shown}`, "");
    for (const o of w.wa.sent.slice(before).filter((x) => x.to === who)) lines.push(...fmtOutgoing(o.msg).split("\n").map((l, i) => (i === 0 ? `**ROBÔ:** ${l}` : l.startsWith(">") ? l : `${l}`)), "");
  }
  return lines.join("\n");
}
