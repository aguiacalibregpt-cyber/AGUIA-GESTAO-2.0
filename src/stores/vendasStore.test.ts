import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusVenda } from '../types/models'
import { useVendasStore } from './vendasStore'

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  },
}))

import { api } from '../lib/api'

const apiMock = vi.mocked(api)

describe('stores/vendasStore', () => {
  beforeEach(() => {
    useVendasStore.setState({ vendas: [], carregando: false, erro: null })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('carrega e ordena vendas por data desc', async () => {
    apiMock.get.mockResolvedValueOnce([
      {
        id: 'v1',
        pessoaId: 'p1',
        descricao: 'Venda antiga',
        status: StatusVenda.ORCAMENTO,
        itens: [],
        desconto: 0,
        valorTotal: 100,
        dataVenda: '2026-03-01T00:00:00.000Z',
        dataCadastro: '2026-03-01T00:00:00.000Z',
        dataAtualizacao: '2026-03-01T00:00:00.000Z',
      },
      {
        id: 'v2',
        pessoaId: 'p1',
        descricao: 'Venda nova',
        status: StatusVenda.FECHADA,
        itens: [],
        desconto: 0,
        valorTotal: 200,
        dataVenda: '2026-04-01T00:00:00.000Z',
        dataCadastro: '2026-04-01T00:00:00.000Z',
        dataAtualizacao: '2026-04-01T00:00:00.000Z',
      },
    ])

    await useVendasStore.getState().carregarVendas()

    const vendas = useVendasStore.getState().vendas
    expect(vendas).toHaveLength(2)
    expect(vendas[0].id).toBe('v2')
    expect(vendas[0].dataVenda).toBeInstanceOf(Date)
    expect(apiMock.get).toHaveBeenCalledWith('/vendas')
  })

  it('adiciona venda calculando valor total com desconto', async () => {
    apiMock.post.mockResolvedValueOnce({})

    const venda = await useVendasStore.getState().adicionarVenda({
      pessoaId: 'p1',
      descricao: 'Servico',
      itens: [{ descricao: 'Servico', quantidade: 2, valorUnitario: 150 }],
      desconto: 50,
    })

    expect(venda.valorTotal).toBe(250)
    expect(venda.status).toBe(StatusVenda.ORCAMENTO)
    expect(useVendasStore.getState().vendas).toHaveLength(1)
    expect(apiMock.post).toHaveBeenCalledTimes(1)
    expect(apiMock.post.mock.calls[0][0]).toBe('/vendas')
  })

  it('atualiza status da venda', async () => {
    const agora = new Date('2026-05-01T00:00:00.000Z')
    useVendasStore.setState({
      vendas: [
        {
          id: 'v1',
          pessoaId: 'p1',
          descricao: 'Servico',
          status: StatusVenda.ORCAMENTO,
          itens: [],
          desconto: 0,
          valorTotal: 10,
          dataVenda: agora,
          dataCadastro: agora,
          dataAtualizacao: agora,
        },
      ],
      carregando: false,
      erro: null,
    })
    apiMock.put.mockResolvedValueOnce({})

    await useVendasStore.getState().atualizarStatusVenda('v1', StatusVenda.FECHADA)

    expect(useVendasStore.getState().vendas[0].status).toBe(StatusVenda.FECHADA)
    expect(apiMock.put).toHaveBeenCalledWith('/vendas/v1', expect.objectContaining({ status: StatusVenda.FECHADA }))
  })
})
