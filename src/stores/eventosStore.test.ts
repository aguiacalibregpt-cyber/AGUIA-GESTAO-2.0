import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusEvento } from '../types/models'
import { useEventosStore } from './eventosStore'

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

describe('stores/eventosStore', () => {
  beforeEach(() => {
    useEventosStore.setState({ eventos: [], carregando: false, erro: null })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('carrega e ordena eventos por data asc', async () => {
    apiMock.get.mockResolvedValueOnce([
      {
        id: 'e2',
        titulo: 'Evento futuro',
        status: StatusEvento.PLANEJADO,
        dataInicio: '2026-07-10T00:00:00.000Z',
        dataCadastro: '2026-07-01T00:00:00.000Z',
        dataAtualizacao: '2026-07-01T00:00:00.000Z',
      },
      {
        id: 'e1',
        titulo: 'Evento proximo',
        status: StatusEvento.CONFIRMADO,
        dataInicio: '2026-06-10T00:00:00.000Z',
        dataCadastro: '2026-06-01T00:00:00.000Z',
        dataAtualizacao: '2026-06-01T00:00:00.000Z',
      },
    ])

    await useEventosStore.getState().carregarEventos()

    const eventos = useEventosStore.getState().eventos
    expect(eventos).toHaveLength(2)
    expect(eventos[0].id).toBe('e1')
    expect(eventos[0].dataInicio).toBeInstanceOf(Date)
    expect(apiMock.get).toHaveBeenCalledWith('/eventos')
  })

  it('adiciona evento com status inicial planejado', async () => {
    apiMock.post.mockResolvedValueOnce({})

    const evento = await useEventosStore.getState().adicionarEvento({
      titulo: 'Protocolo',
      dataInicio: new Date('2026-08-01T10:00:00.000Z'),
      local: 'Unidade central',
    })

    expect(evento.status).toBe(StatusEvento.PLANEJADO)
    expect(useEventosStore.getState().eventos).toHaveLength(1)
    expect(apiMock.post).toHaveBeenCalledWith('/eventos', expect.objectContaining({ titulo: 'Protocolo' }))
  })

  it('atualiza status de evento', async () => {
    const agora = new Date('2026-08-01T00:00:00.000Z')
    useEventosStore.setState({
      eventos: [
        {
          id: 'e1',
          titulo: 'Reuniao',
          status: StatusEvento.PLANEJADO,
          dataInicio: agora,
          dataCadastro: agora,
          dataAtualizacao: agora,
        },
      ],
      carregando: false,
      erro: null,
    })
    apiMock.put.mockResolvedValueOnce({})

    await useEventosStore.getState().atualizarStatusEvento('e1', StatusEvento.CONCLUIDO)

    expect(useEventosStore.getState().eventos[0].status).toBe(StatusEvento.CONCLUIDO)
    expect(apiMock.put).toHaveBeenCalledWith('/eventos/e1', expect.objectContaining({ status: StatusEvento.CONCLUIDO }))
  })
})
