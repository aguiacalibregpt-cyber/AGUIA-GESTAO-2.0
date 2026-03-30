import { create } from 'zustand'
import type { ItemVenda, Venda } from '../types/models'
import { StatusVenda } from '../types/models'
import { api } from '../lib/api'
import { gerarId, obterMensagemErro } from '../utils/robustness'

interface VendasStore {
  vendas: Venda[]
  carregando: boolean
  erro: string | null
  carregarVendas: () => Promise<void>
  adicionarVenda: (payload: {
    pessoaId: string
    descricao: string
    itens: Array<Omit<ItemVenda, 'id'>>
    desconto?: number
    observacoes?: string
  }) => Promise<Venda>
  atualizarStatusVenda: (id: string, status: StatusVenda) => Promise<void>
  deletarVenda: (id: string) => Promise<void>
}

type ItemVendaPersistida = ItemVenda

type VendaPersistida = Omit<Venda, 'dataVenda' | 'dataCadastro' | 'dataAtualizacao'> & {
  dataVenda: string
  dataCadastro: string
  dataAtualizacao: string
  itens: ItemVendaPersistida[]
}

const parseDateSafe = (v: string): Date => {
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

const parseVenda = (venda: VendaPersistida): Venda => ({
  ...venda,
  dataVenda: parseDateSafe(venda.dataVenda),
  dataCadastro: parseDateSafe(venda.dataCadastro),
  dataAtualizacao: parseDateSafe(venda.dataAtualizacao),
})

const serializarVenda = (venda: Venda): VendaPersistida => ({
  ...venda,
  dataVenda: venda.dataVenda.toISOString(),
  dataCadastro: venda.dataCadastro.toISOString(),
  dataAtualizacao: venda.dataAtualizacao.toISOString(),
})

const calcularValorTotal = (itens: ItemVenda[], desconto = 0): number => {
  const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0)
  return Math.max(0, Number((subtotal - desconto).toFixed(2)))
}

export const useVendasStore = create<VendasStore>((set, get) => ({
  vendas: [],
  carregando: false,
  erro: null,

  carregarVendas: async () => {
    if (get().carregando) return
    set({ carregando: true, erro: null })
    try {
      const vendas = ((await api.get<VendaPersistida[]>('/vendas')) ?? []).map(parseVenda)
      vendas.sort((a, b) => b.dataVenda.getTime() - a.dataVenda.getTime())
      set({ vendas })
    } catch (error) {
      set({ erro: obterMensagemErro(error, 'Erro ao carregar vendas') })
    } finally {
      set({ carregando: false })
    }
  },

  adicionarVenda: async ({ pessoaId, descricao, itens, desconto = 0, observacoes }) => {
    set({ erro: null })
    try {
      const itensComId: ItemVenda[] = itens.map((item) => ({ ...item, id: gerarId('item') }))
      const agora = new Date()
      const novaVenda: Venda = {
        id: gerarId('venda'),
        pessoaId,
        descricao,
        status: StatusVenda.ORCAMENTO,
        itens: itensComId,
        desconto,
        valorTotal: calcularValorTotal(itensComId, desconto),
        dataVenda: agora,
        observacoes,
        dataCadastro: agora,
        dataAtualizacao: agora,
      }
      await api.post('/vendas', serializarVenda(novaVenda))
      set({ vendas: [novaVenda, ...get().vendas] })
      return novaVenda
    } catch (error) {
      set({ erro: obterMensagemErro(error, 'Erro ao adicionar venda') })
      throw error
    }
  },

  atualizarStatusVenda: async (id, status) => {
    set({ erro: null })
    try {
      const dataAtualizacao = new Date()
      await api.put(`/vendas/${id}`, {
        status,
        dataAtualizacao: dataAtualizacao.toISOString(),
      })
      set({
        vendas: get().vendas.map((venda) =>
          venda.id === id ? { ...venda, status, dataAtualizacao } : venda,
        ),
      })
    } catch (error) {
      set({ erro: obterMensagemErro(error, 'Erro ao atualizar venda') })
      throw error
    }
  },

  deletarVenda: async (id) => {
    set({ erro: null })
    try {
      await api.del(`/vendas/${id}`)
      set({ vendas: get().vendas.filter((venda) => venda.id !== id) })
    } catch (error) {
      set({ erro: obterMensagemErro(error, 'Erro ao excluir venda') })
      throw error
    }
  },
}))
