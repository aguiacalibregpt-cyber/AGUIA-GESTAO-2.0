import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { CalendarClock, Trash2 } from 'lucide-react'
import { Alert, Button, Input, PageHeader, Select } from '../components'
import { usePessoasStore } from '../stores/pessoasStore'
import { useProcessosStore } from '../stores/processosStore'
import { useEventosStore } from '../stores/eventosStore'
import { StatusEvento } from '../types/models'
import { formatarData, obterDataHoje } from '../utils/constants'

const opcoesStatus = [
  { value: StatusEvento.PLANEJADO, label: 'Planejado' },
  { value: StatusEvento.CONFIRMADO, label: 'Confirmado' },
  { value: StatusEvento.CONCLUIDO, label: 'Concluido' },
  { value: StatusEvento.CANCELADO, label: 'Cancelado' },
]

export const Eventos: React.FC = () => {
  const { pessoas, carregarPessoas } = usePessoasStore()
  const { processos, carregarProcessos } = useProcessosStore()
  const { eventos, erro, carregando, carregarEventos, adicionarEvento, atualizarStatusEvento, deletarEvento } = useEventosStore()

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [pessoaId, setPessoaId] = useState('')
  const [processoId, setProcessoId] = useState('')
  const [local, setLocal] = useState('')
  const [dataInicio, setDataInicio] = useState(obterDataHoje())
  const [salvando, setSalvando] = useState(false)

  const onChangeInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
  }

  const onChangeSelect = (setter: (value: string) => void) => (e: ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value)
  }

  useEffect(() => {
    void carregarPessoas()
    void carregarProcessos()
    void carregarEventos()
  }, [carregarPessoas, carregarProcessos, carregarEventos])

  const cadastrar = async () => {
    if (!titulo.trim() || !dataInicio) return
    setSalvando(true)
    try {
      await adicionarEvento({
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        pessoaId: pessoaId || undefined,
        processoId: processoId || undefined,
        local: local.trim() || undefined,
        dataInicio: new Date(`${dataInicio}T08:00:00`),
      })
      setTitulo('')
      setDescricao('')
      setPessoaId('')
      setProcessoId('')
      setLocal('')
      setDataInicio(obterDataHoje())
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<CalendarClock className="w-8 h-8" />}
        title="Eventos"
        subtitle="Agenda operacional com vinculo opcional a pessoa e processo"
      />

      {erro && <Alert type="error" message={erro} />}

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Input label="Titulo" value={titulo} onChange={onChangeInput(setTitulo)} placeholder="Ex.: Entrega de documento" />
        <Input label="Data" type="date" value={dataInicio} onChange={onChangeInput(setDataInicio)} />
        <Input label="Local" value={local} onChange={onChangeInput(setLocal)} placeholder="Opcional" />
        <Select
          label="Pessoa (opcional)"
          value={pessoaId}
          onChange={onChangeSelect(setPessoaId)}
          options={pessoas.map((p) => ({ value: p.id, label: p.nome }))}
          placeholder="Sem vinculo"
        />
        <Select
          label="Processo (opcional)"
          value={processoId}
          onChange={onChangeSelect(setProcessoId)}
          options={processos.map((p) => ({ value: p.id, label: `${p.numero || p.id} - ${p.tipo}` }))}
          placeholder="Sem vinculo"
        />
        <Input label="Descricao" value={descricao} onChange={onChangeInput(setDescricao)} placeholder="Opcional" />
        <div className="md:col-span-2 lg:col-span-3">
          <Button onClick={() => void cadastrar()} isLoading={salvando}>Criar evento</Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2">Data</th>
              <th className="text-left py-2 px-2">Titulo</th>
              <th className="text-left py-2 px-2">Pessoa</th>
              <th className="text-left py-2 px-2">Processo</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {eventos.map((evento) => {
              const pessoa = pessoas.find((p) => p.id === evento.pessoaId)
              const processo = processos.find((p) => p.id === evento.processoId)
              return (
                <tr key={evento.id} className="border-b border-gray-100">
                  <td className="py-2 px-2">{formatarData(evento.dataInicio)}</td>
                  <td className="py-2 px-2">{evento.titulo}</td>
                  <td className="py-2 px-2">{pessoa?.nome || '-'}</td>
                  <td className="py-2 px-2">{processo?.numero || processo?.id || '-'}</td>
                  <td className="py-2 px-2">
                    <Select
                      options={opcoesStatus}
                      value={evento.status}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => void atualizarStatusEvento(evento.id, e.target.value as StatusEvento)}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Button variant="danger" onClick={() => void deletarEvento(evento.id)}>
                      <Trash2 className="w-4 h-4" /> Excluir
                    </Button>
                  </td>
                </tr>
              )
            })}
            {!carregando && eventos.length === 0 && (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={6}>Nenhum evento cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
