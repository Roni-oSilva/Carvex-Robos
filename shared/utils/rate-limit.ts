/** Limitador de janela fixa em memória (suficiente para 1 processo; para vários, use Redis). */
export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();
  private limit: number;
  private windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Retorna true se a ação é permitida. */
  allow(key: string, now = Date.now()): boolean {
    const cur = this.hits.get(key);
    if (!cur || now >= cur.resetAt) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      this.gc(now);
      return true;
    }
    cur.count += 1;
    return cur.count <= this.limit;
  }

  private gc(now: number): void {
    if (this.hits.size < 5000) return;
    for (const [k, v] of this.hits) if (now >= v.resetAt) this.hits.delete(k);
  }
}
