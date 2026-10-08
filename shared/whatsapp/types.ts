export type InboundType = "text" | "button" | "list" | "image" | "document" | "audio" | "video" | "location" | "other";

export interface InboundMessage {
  id: string;
  from: string; // wa_id (somente dígitos)
  name?: string;
  timestamp: number; // epoch segundos
  type: InboundType;
  text?: string; // texto digitado OU título do botão/lista
  replyId?: string; // id do botão/linha de lista escolhida
  mediaId?: string;
  phoneNumberId: string;
}

export interface StatusUpdate {
  id: string; // wa_message_id da mensagem enviada
  status: "sent" | "delivered" | "read" | "failed" | "other";
  recipient: string;
  phoneNumberId: string;
  errorCode?: number;
}

export interface Button { id: string; title: string }
export interface ListRow { id: string; title: string; description?: string }

export type Outgoing =
  | { kind: "text"; body: string }
  | { kind: "buttons"; body: string; buttons: Button[] }
  | { kind: "list"; body: string; button: string; rows: ListRow[]; sectionTitle?: string }
  | { kind: "template"; name: string; language: string; params: string[] };

export interface WhatsAppClient {
  send(to: string, msg: Outgoing, opts?: { phoneNumberId?: string }): Promise<{ id: string }>;
  markRead?(messageId: string, opts?: { phoneNumberId?: string }): Promise<void>;
  /** Baixa uma mídia recebida (foto) pelo id. Opcional: só a Cloud API real e o Fake implementam. */
  downloadMedia?(mediaId: string): Promise<{ data: Buffer; mime: string }>;
}

export class WhatsAppError extends Error {
  status: number;
  code?: number;
  retryable: boolean;
  constructor(message: string, status: number, code?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryable = status === 429 || status >= 500;
  }
}
