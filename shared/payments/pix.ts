/**
 * Gerador de Pix "copia e cola" (BR Code estático, padrão EMV do Banco Central).
 * Não depende de banco/PSP: usa a chave Pix da empresa. A confirmação do pagamento continua
 * manual (ou por conciliação), pois um QR estático não avisa quando é pago.
 */

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF). Vetor: "123456789" -> 29B1. */
export function crc16(s: string): string {
  let crc = 0xffff;
  for (const b of Buffer.from(s, "utf8")) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const tlv = (id: string, value: string): string => {
  if (value.length > 99) throw new Error(`Campo Pix ${id} grande demais.`);
  return id + String(value.length).padStart(2, "0") + value;
};

/** Remove acentos/símbolos: o BR Code só aceita ASCII imprimível. */
const ascii = (s: string, max: number): string =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 .\-]/g, "").replace(/ {2,}/g, " ").trim().slice(0, max).trim();

export interface PixInput {
  chave: string;
  beneficiario: string; // até 25 caracteres
  cidade: string; // até 15 caracteres
  valorCents?: number;
  txid?: string; // até 25, só letras e números
  descricao?: string;
}

export function buildPixPayload(p: PixInput): string {
  if (!p.chave.trim()) throw new Error("Chave Pix vazia.");
  const nome = ascii(p.beneficiario, 25), cidade = ascii(p.cidade, 15);
  if (!nome || !cidade) throw new Error("Beneficiário e cidade do Pix são obrigatórios.");
  const txid = (p.txid ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const conta = tlv("00", "br.gov.bcb.pix") + tlv("01", p.chave.trim()) + (p.descricao ? tlv("02", ascii(p.descricao, 40)) : "");
  const valor = p.valorCents && p.valorCents > 0 ? tlv("54", (p.valorCents / 100).toFixed(2)) : "";
  const body =
    tlv("00", "01") + tlv("26", conta) + tlv("52", "0000") + tlv("53", "986") + valor +
    tlv("58", "BR") + tlv("59", nome) + tlv("60", cidade) + tlv("62", tlv("05", txid)) + "6304";
  return body + crc16(body);
}

/** Confere o CRC de um código Pix (útil nos testes e para validar a configuração). */
export function pixIsValid(code: string): boolean {
  return code.length > 8 && code.slice(-4) === crc16(code.slice(0, -4)) && code.startsWith("000201");
}
