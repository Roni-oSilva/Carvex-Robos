import test from "node:test";
import assert from "node:assert/strict";
import { makeWorld } from "../testing/helpers.ts";
import { echoRobot } from "../testing/echo-robot.ts";
import { createTickRunner } from "./scheduler.ts";
import type { Robot } from "./types.ts";
import type { EchoSettings } from "../testing/echo-robot.ts";

test("duas rodadas simultâneas não se sobrepõem (evita lembrete duplicado)", async () => {
  let chamadas = 0;
  let liberar!: () => void;
  const trava = new Promise<void>((r) => { liberar = r; });
  const robot: Robot<EchoSettings> = { ...echoRobot, async tick() { chamadas++; await trava; } };
  const w = makeWorld(robot);
  const tick = createTickRunner(w.env, robot);
  const a = tick();
  const b = await tick(); // chega enquanto a primeira ainda roda
  assert.equal(b, "ocupado");
  liberar();
  assert.equal(await a, "ok");
  assert.equal(chamadas, 1);
  assert.equal(await tick(), "ok"); // depois de terminar, volta a rodar
  assert.equal(chamadas, 2);
});

test("erro na tarefa não derruba o agendador e libera a próxima rodada", async () => {
  let n = 0;
  const robot: Robot<EchoSettings> = { ...echoRobot, async tick() { n++; if (n === 1) throw new Error("falha"); } };
  const w = makeWorld(robot);
  const tick = createTickRunner(w.env, robot);
  assert.equal(await tick(), "erro");
  assert.equal(await tick(), "ok");
});

test("limpeza de mensagens antigas roda no máximo uma vez por dia", async () => {
  const w = makeWorld(echoRobot);
  const c = w.env.repo.upsertContact(w.tenant.id, "5511999", "x", w.env.clock());
  w.env.repo.logMessage({ tenantId: w.tenant.id, contactId: c.id, direction: "in", type: "text", body: "velha" }, w.env.clock());
  w.advance(200 * 86_400_000);
  const tick = createTickRunner(w.env, echoRobot);
  await tick();
  assert.equal(w.env.repo.messages(w.tenant.id, c.id).length, 0);
  w.env.repo.logMessage({ tenantId: w.tenant.id, contactId: c.id, direction: "in", type: "text", body: "nova" }, new Date(w.env.clock().getTime() - 200 * 86_400_000));
  await tick(); // mesmo dia: não limpa de novo
  assert.equal(w.env.repo.messages(w.tenant.id, c.id).length, 1);
});
