import test from "node:test";
import assert from "node:assert/strict";
import { buildPixPayload, crc16, pixIsValid } from "./pix.ts";

test("CRC16 bate com o vetor padrão CCITT-FALSE", () => assert.equal(crc16("123456789"), "29B1"));

test("exemplo oficial do manual do BR Code: CRC confere", () => {
  // Exemplo do Manual de Padrões para Iniciação do Pix (chave, valor 0 omitido, nome e cidade fictícios).
  const code = buildPixPayload({ chave: "123e4567-e12b-12d3-a456-426655440000", beneficiario: "Fulano de Tal", cidade: "BRASILIA" });
  assert.ok(code.startsWith("00020126580014br.gov.bcb.pix0136123e4567-e12b-12d3-a456-426655440000"));
  assert.ok(code.includes("5204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304"));
  assert.ok(pixIsValid(code));
});

test("valor, txid e sanitização de acentos", () => {
  const code = buildPixPayload({ chave: "11987654321", beneficiario: "José da Padaria Ltda ME & Filhos", cidade: "São Paulo", valorCents: 12345, txid: "COB-42/7" });
  assert.ok(code.includes("5406123.45"));
  assert.ok(code.includes("5925Jose da Padaria Ltda ME F"));
  assert.ok(code.includes("6009Sao Paulo"));
  assert.ok(code.includes("0506COB427"));
  assert.ok(pixIsValid(code));
});

test("adulterar qualquer caractere invalida o CRC", () => {
  const code = buildPixPayload({ chave: "a@b.com", beneficiario: "Loja", cidade: "Recife", valorCents: 1000 });
  assert.ok(pixIsValid(code));
  assert.ok(!pixIsValid(code.replace("10.00", "99.00")));
});

test("entradas inválidas lançam erro", () => {
  assert.throws(() => buildPixPayload({ chave: "", beneficiario: "A", cidade: "B" }));
  assert.throws(() => buildPixPayload({ chave: "x", beneficiario: "", cidade: "B" }));
});
