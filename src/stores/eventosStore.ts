import { create } from 'zustand'
import type { Evento } from '../types/models'
import { StatusEvento } from '../types/models'
import { api } from '../lib/api'
import { gerarId, obterMensagemErro } from '../utils/robustness'

interface EventosStore {
  eventos: Evento[]
  carregando: boolean
  erro: string | null
  carregarEventos: () => Promise<void>
  adicionarEvento: (payload: {
    titulo: string
    descricao?: string
    pessoaId?: string
    processoId?: string
    dataInicio: Date
    dataFim?: Date
    local?: string
  }) => Promise<Evento>
  atualizarStatusEvento: (id: string, status: StatusEvento) => Promise<void>
  deletarEvento: (id: string) => Promise<void>
}

type EventoPersistido = Omit<Evento, 'dataInicio' | 'dataFim' | 'dataCadastro' | 'dataAtualizacao'> & {
  dataInicio: string
  dataFim?: string
  dataCadastro: string
  dataAtualizacao: string
}

const parseDateSafe = (v: string): Date => {
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

const parseDateSafeOpt = (v?: string): Date | undefined => {
  if (!v) return undefined
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? undefined : d
}

const parseEvento = (evento: EventoPersistido): Evento => ({
  ...evento,
  dataInicio: parseDateSafe(evento.dataInicio),
  dataFim: parseDateSafeOpt(evento.dataFim),
  dataCadastro: parseDateSafe(evento.dataCadastro),
  dataAtualizacao: parseDateSafe(evento.dataAtualizacao),
})

const serializarEvento = (evento: Evento): EventoPersistido => ({
  ...evento,
  dataInicio: evento.dataInicio.toISOString(),
  dataFim: evento.dataFim?.toISOString(),
  dataCadastro: evento.dataCadastro.toISOString(),
  dataAtualizacao: evento.dataAtualizacao.toISOString(),
})

export const useEventosStore = create<EventosStore>((set, get) => ({
  eventos: [],
  carregando: false,
  erro: null,

  carregarEventos: async () => {
    if (get().carregando) return
    set({ carregando: true, erro: null })
    try {
      const eventos = ((await api.get<EventoPersistido[]>('/eventos')) ?? []).map(parseEvento)
      eventos.sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime())
      set({ eventos })
    } catch (error) {
      set({ erro: obterMensagemErro(error, 'Erro ao carregar eventos') })
    } finally {
      set({ carregando: false })
    }
  },

  adicionarEvento: async (payload) => {
    set({ erro: null })
    try {
      const agora = new Date()
      const novoEvento: Evento = {
        id: gerarId('evento'),
        titulo: payload.titulo,
        descricao: payload.descricao,
        pessoaId: payload.pessoaId,
        processoId: payload.processoId,
        status: StatusEvento.PLANEJADO,
        dataInicio: payload.dataInicio,
        dataFim: payload.dataFim,
        local: payload.local,
        dataCadastro: agora,
        dataAtualizacao: agora,
      }
      await api.post('/eventos', serializarEvento(novoEvento))
      set({ eventos: [...get().eventos, novoEvento].sort((a, b) => a.dataInicio.getTime() - b.dataInicio.getTime()) })
      return novoEvento
    } catch (error) {
      set({ erro: obterMensagemErro(error, 'Erro ao adicionar evento') })
      throw error
    }
  },

  atualizarStatusEvento: async (id, status) => {
    set({ erro: null })
    try {
      const dataAtualizacao = new Date()
      await api.put(`/eventos/${id}`, {
        status,
        dataAtualizacao: dataAtualizacao.toISOString(),
      })
      set({
        eventos: get().eventos.map((evento) =>
          evento.id === id ? { ...evento, status, dataAtualizacao } : evento,
        ),
      })
    } catch (error) {
      set({ erro: obterMensagemErro(error, 'Erro ao atualizar evento') })
      throw error
    }
  },

  deletarEvento: async (id) => {
    set({ erro: null })
    try {
      await api.del(`/eventos/${id}`)
      set({ eventos: get().eventos.filter((evento) => evento.id !== id) })
    } catch (error) {
      set({ erro: obterMensagemErro(error, 'Erro ao excluir evento') })
      throw error
    }
  },
}))
