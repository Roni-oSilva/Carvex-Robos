export type Status = "IDEIA" | "PESQUISA" | "PLANEJADO" | "DESENVOLVIMENTO" | "TESTE" | "PRONTO" | "COMERCIAL" | "DESCONTINUADO";

export interface Preco { venda_unica: number; mensalidade: number; implantacao: number; personalizacao_hora: number; racional: string[] }

/** Um passo da conversa de demonstração exibida no site. `{x}` = variável escolhida pelo visitante. */
export interface NoRoteiro { bot?: string; ops?: { t: string; set?: Record<string, string> }[]; nota?: string; fim?: boolean }

/** O que aparece no site de vendas (cartão, preço e conversa de demonstração). Sem emojis. */
export interface SiteDoc {
  /** Identificador curto usado na página (ex.: "agenda"). */
  chave: string;
  /** Nome de um ícone do sprite da página (calendar, wallet, bag, clipboard, home...). */
  icone: string;
  titulo: string;
  resumo: string;
  tags: string[];
  para: string;
  roteiro: NoRoteiro[];
}

export interface RobotDoc {
  id: string;
  nome: string;
  slogan: string;
  versao: string;
  status: Status;
  segmentos: string[];
  publico: string;
  problema: string;
  resumo: string;
  oportunidades: number[]; // ids em market-research/opportunities.json
  potencial: "Alto" | "Médio" | "Baixo";
  como_funciona: string[];
  funcionalidades: { titulo: string; descricao: string }[];
  limites: string[];
  diferenciais: string[];
  config_campos: { campo: string; descricao: string; exemplo: string }[];
  templates: { nome: string; categoria: string; corpo: string; parametros: string[]; quando: string }[];
  dados: { dado: string; finalidade: string; base_legal: string; retencao?: string }[];
  tabelas: { nome: string; descricao: string }[];
  arquivos: { caminho: string; descricao: string }[];
  painel: { pagina: string; para_que: string }[];
  manual: {
    cadastrar_info: string;
    alterar_servicos: string;
    alterar_precos: string;
    mensagens: string;
    problemas: { sintoma: string; causa: string; solucao: string }[];
  };
  cliente: { rotina: string[]; regras_de_ouro: string[] };
  fluxos: string;
  requisitos: { id: string; texto: string; status: "Implementado" | "Parcial" | "Não implementado" }[];
  pendencias: string[];
  precos: Preco;
  site: SiteDoc;
  sales: { pagina: string; pitch: string; features: string; objecoes: string; faq: string; demo: string; precificacao: string };
}
