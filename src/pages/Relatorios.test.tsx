import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusVenda } from '../types/models'
import { Relatorios } from './Relatorios'

const mockCarregarPessoas = vi.fn(async () => {})
const mockCarregarProcessos = vi.fn(async () => {})
const mockCarregarVendas = vi.fn(async () => {})
const mockCarregarEventos = vi.fn(async () => {})

vi.mock('../stores/pessoasStore', () => ({
  usePessoasStore: () => ({
    pessoas: [{ id: 'p1', nome: 'Ana', cpf: '111' }],
    erro: null,
    carregarPessoas: mockCarregarPessoas,
  }),
}))

vi.mock('../stores/processosStore', () => ({
  useProcessosStore: () => ({
    processos: [{ id: 'proc1' }],
    erro: null,
    carregarProcessos: mockCarregarProcessos,
  }),
}))

vi.mock('../stores/vendasStore', () => ({
  useVendasStore: () => ({
    vendas: [
      {
        id: 'v1',
        pessoaId: 'p1',
        descricao: 'Servico',
        status: StatusVenda.FECHADA,
        itens: [],
        desconto: 0,
        valorTotal: 350,
        dataVenda: new Date('2026-03-01T00:00:00.000Z'),
        dataCadastro: new Date('2026-03-01T00:00:00.000Z'),
        dataAtualizacao: new Date('2026-03-01T00:00:00.000Z'),
      },
    ],
    erro: null,
    carregarVendas: mockCarregarVendas,
  }),
}))

vi.mock('../stores/eventosStore', () => ({
  useEventosStore: () => ({
    eventos: [{ id: 'e1', titulo: 'Reuniao' }],
    erro: null,
    carregarEventos: mockCarregarEventos,
  }),
}))

describe('pages/Relatorios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza indicadores e exporta CSV', async () => {
    const user = userEvent.setup()
    const createObjectURLMock = vi.fn(() => 'blob:fake')
    const revokeObjectURLMock = vi.fn()

    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURLMock,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURLMock,
      writable: true,
      configurable: true,
    })

    render(<Relatorios />)

    expect(screen.getByText('Relatorios')).toBeTruthy()
    expect(screen.getByText('R$ 350,00')).toBeTruthy()

    await user.click(screen.getByText('Exportar resumo executivo (CSV)'))

    expect(createObjectURLMock).toHaveBeenCalledTimes(1)
    expect(revokeObjectURLMock).toHaveBeenCalledTimes(1)
  })
})
