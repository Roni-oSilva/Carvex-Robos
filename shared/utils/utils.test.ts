import test from "node:test";
import assert from "node:assert/strict";
import { isGreeting, clip, formatBRL, maskPhone, normalize, normalizeBrPhone, parseBRLToCents, render, escapeHtml } from "./text.ts";
import { addDays, estaAberto, localDate, localTime, weekdayOf, zonedToUtc, parseHHMM } from "./time.ts";
import { redact } from "./logger.ts";
import { RateLimiter } from "./rate-limit.ts";
import { h, raw } from "../dashboard/html.ts";

test("normalize remove acentos e pontuação", () => assert.equal(normalize("  Olá, Tudo BEM?! "), "ola tudo bem"));
test("escapeHtml neutraliza tags e aspas", () => assert.equal(escapeHtml(`<img src=x onerror="a()">`), "&lt;img src=x onerror=&quot;a()&quot;&gt;"));
test("h escapa interpolações e respeita raw", () => {
  assert.equal(h`<b>${"<script>"}</b>`.s, "<b>&lt;script&gt;</b>");
  assert.equal(h`<b>${raw("<i>ok</i>")}</b>`.s, "<b><i>ok</i></b>");
  assert.equal(h`${[h`<a>${"x&y"}</a>`, "<"]}`.s, "<a>x&amp;y</a>&lt;");
});
test("maskPhone esconde o miolo", () => assert.equal(maskPhone("5511987654321"), "5511*****4321"));
test("normalizeBrPhone", () => {
  assert.equal(normalizeBrPhone("(11) 98765-4321"), "5511987654321");
  assert.equal(normalizeBrPhone("+55 11 3456-7890"), "551134567890");
  assert.equal(normalizeBrPhone("123"), null);
});
test("render não vaza undefined", () => assert.equal(render("Oi {{nome}}{{x}}!", { nome: "Ana" }), "Oi Ana!"));
test("dinheiro em centavos", () => {
  assert.equal(formatBRL(123456), "R$ 1.234,56");
  assert.equal(formatBRL(5), "R$ 0,05");
  assert.equal(parseBRLToCents("R$ 1.234,56"), 123456);
  assert.equal(parseBRLToCents("12.5"), 1250);
  assert.equal(parseBRLToCents("abc"), null);
});
test("clip respeita limite", () => assert.equal(clip("abcdefghij", 5), "abcd…"));

test("fuso: São Paulo é UTC-3 e conversão ida e volta", () => {
  const d = new Date("2026-10-07T15:00:00Z");
  assert.equal(localTime(d, "America/Sao_Paulo"), "12:00");
  assert.equal(localDate(new Date("2026-10-07T02:30:00Z"), "America/Sao_Paulo"), "2026-10-06");
  assert.equal(zonedToUtc(2026, 10, 7, 12, 0, "America/Sao_Paulo").toISOString(), "2026-10-07T15:00:00.000Z");
});
test("calendário", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(weekdayOf("2026-10-07"), 3); // quarta
  assert.equal(parseHHMM("09:30"), 570);
  assert.equal(parseHHMM("25:00"), null);
});
test("estaAberto usa o fuso do negócio", () => {
  const horario = { "3": { abre: "09:00", fecha: "18:00" } };
  assert.equal(estaAberto(horario, new Date("2026-10-07T15:00:00Z"), "America/Sao_Paulo"), true); // qua 12h
  assert.equal(estaAberto(horario, new Date("2026-10-07T23:00:00Z"), "America/Sao_Paulo"), false); // qua 20h
  assert.equal(estaAberto(horario, new Date("2026-10-08T15:00:00Z"), "America/Sao_Paulo"), false); // qui
});

test("redact oculta segredos e mascara telefones", () => {
  const r = redact({ token: "abc", api_key: "x", from: "5511987654321", nested: { Authorization: "Bearer z", ok: 1 } }) as Record<string, any>;
  assert.equal(r.token, "[oculto]");
  assert.equal(r.api_key, "[oculto]");
  assert.equal(r.from, "5511*****4321");
  assert.equal(r.nested.Authorization, "[oculto]");
  assert.equal(r.nested.ok, 1);
});

test("RateLimiter bloqueia após o limite e libera depois da janela", () => {
  const rl = new RateLimiter(2, 1000);
  assert.ok(rl.allow("a", 0)); assert.ok(rl.allow("a", 10)); assert.ok(!rl.allow("a", 20));
  assert.ok(rl.allow("b", 20));
  assert.ok(rl.allow("a", 1500));
});

test("saudação: reconhece cumprimentos simples e não engole pedidos", () => {
  for (const ok of ["Oi", "Oi, boa noite!", "Olá, tudo bem?", "bom dia", "Opa, e aí", "Eae pessoal"]) assert.ok(isGreeting(ok), ok);
  for (const no of ["Oi, quero marcar um horário", "bom dia, vocês entregam?", "quanto custa", "", "pix", "boa noite quero pedir"]) assert.ok(!isGreeting(no), no);
});
