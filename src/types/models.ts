// Tipos para o sistema de gestão de processos Águia Gestão

export enum TipoProcesso {
  AQUISICAO_ARMA_SINARM = 'AQUISICAO_ARMA_SINARM',
  REGISTRO_SINARM = 'REGISTRO_SINARM',
  RENOVACAO_REGISTRO_SINARM = 'RENOVACAO_REGISTRO_SINARM',
  AQUISICAO_ARMA_CR_ATIRADOR = 'AQUISICAO_ARMA_CR_ATIRADOR',
  AQUISICAO_ARMA_CR_CACADOR = 'AQUISICAO_ARMA_CR_CACADOR',
  CRAF_CR = 'CRAF_CR',
  RENOVACAO_CRAF_CR = 'RENOVACAO_CRAF_CR',
  GUIA_TRAFEGO_CACA = 'GUIA_TRAFEGO_CACA',
  GUIA_TRAFEGO_MUDANCA_ACERVO = 'GUIA_TRAFEGO_MUDANCA_ACERVO',
  GUIA_TRAFEGO_RECUPERACAO = 'GUIA_TRAFEGO_RECUPERACAO',
  GUIA_TRAFEGO_TIRO = 'GUIA_TRAFEGO_TIRO',
  GUIA_TRAFEGO_SINARM = 'GUIA_TRAFEGO_SINARM',
  TRANSFERENCIA_ARMA_CR = 'TRANSFERENCIA_ARMA_CR',
  CR_ATIRADOR_CACADOR = 'CR_ATIRADOR_CACADOR',
}

export enum StatusProcesso {
  ABERTO = 'ABERTO',
  EM_ANALISE = 'EM_ANALISE',
  PRONTO_PARA_PROTOCOLO = 'PRONTO_PARA_PROTOCOLO',
  AGUARDANDO_PAGAMENTO_GRU = 'AGUARDANDO_PAGAMENTO_GRU',
  DEFERIDO = 'DEFERIDO',
  INDEFERIDO = 'INDEFERIDO',
  ENTREGUE_AO_CLIENTE = 'ENTREGUE_AO_CLIENTE',
  RESTITUIDO = 'RESTITUIDO',
  FINALIZADO = 'FINALIZADO',
}

export enum StatusDocumento {
  PENDENTE = 'PENDENTE',
  ENTREGUE = 'ENTREGUE',
  REJEITADO = 'REJEITADO',
  NAO_APLICAVEL = 'NAO_APLICAVEL',
}

export interface Pessoa {
  id: string
  nome: string
  cpf: string
  senhaGov?: string
  telefone: string
  email?: string
  endereco?: string
  dataCadastro: Date
  dataAtualizacao: Date
  ativo: boolean
}

export interface DocumentoProcesso {
  id: string
  processoId: string
  documentoId: string
  nome: string
  status: StatusDocumento
  dataEntrega?: Date
  observacoes?: string
  arquivo?: string
}

export interface Processo {
  id: string
  pessoaId: string
  tipo: TipoProcesso
  numero: string
  status: StatusProcesso
  dataAbertura: Date
  dataPrazo?: Date
  dataFechamento?: Date
  dataRestituido?: Date
  dataUltimaConsulta?: Date
  descricao?: string
  observacoes?: string
  documentos: DocumentoProcesso[]
  dataCadastro: Date
  dataAtualizacao: Date
}

export interface Configuracao {
  id: string
  chave: string
  valor: string | number | boolean | object
  dataCadastro: Date
  dataAtualizacao: Date
}

export interface BackupHistorico {
  id: string
  timestamp: Date
  origem: 'EXPORTACAO' | 'IMPORTACAO'
  nomeArquivo: string
  tamanhoBytes: number
  checksum?: string
  pessoas: number
  processos: number
  documentos: number
  configuracoes: number
  statusIntegridade: 'OK' | 'ALERTA'
  observacoes?: string
  payload: string
}

export enum StatusVenda {
  ORCAMENTO = 'ORCAMENTO',
  FECHADA = 'FECHADA',
  CANCELADA = 'CANCELADA',
}

export enum StatusEvento {
  PLANEJADO = 'PLANEJADO',
  CONFIRMADO = 'CONFIRMADO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
}

export interface ItemVenda {
  id: string
  descricao: string
  quantidade: number
  valorUnitario: number
}

export interface Venda {
  id: string
  pessoaId: string
  descricao: string
  status: StatusVenda
  itens: ItemVenda[]
  desconto: number
  valorTotal: number
  dataVenda: Date
  observacoes?: string
  dataCadastro: Date
  dataAtualizacao: Date
}

export interface Evento {
  id: string
  titulo: string
  descricao?: string
  pessoaId?: string
  processoId?: string
  status: StatusEvento
  dataInicio: Date
  dataFim?: Date
  local?: string
  dataCadastro: Date
  dataAtualizacao: Date
}


