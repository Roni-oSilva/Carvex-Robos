export interface PromptTemplate<V> {
  /** Versão registrada em ai_generations.prompt_version */
  version: string;
  system: string;
  build: (vars: V) => string;
}
