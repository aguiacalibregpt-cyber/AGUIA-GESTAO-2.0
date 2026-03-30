import { useEffect, useMemo } from 'react'
import { FileBarChart2 } from 'lucide-react'
import { Alert, Button, PageHeader } from '../components'
import { usePessoasStore } from '../stores/pessoasStore'
import { useProcessosStore } from '../stores/processosStore'
import { useVendasStore } from '../stores/vendasStore'
import { useEventosStore } from '../stores/eventosStore'
import { StatusVenda } from '../types/models'

const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

const baixarArquivo = (nome: string, conteudo: string) => {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = nome
  anchor.click()
  URL.revokeObjectURL(url)
}

export const Relatorios: React.FC = () => {
  const { pessoas, erro: erroPessoas, carregarPessoas } = usePessoasStore()
  const { processos, erro: erroProcessos, carregarProcessos } = useProcessosStore()
  const { vendas, erro: erroVendas, carregarVendas } = useVendasStore()
  const { eventos, erro: erroEventos, carregarEventos } = useEventosStore()

  useEffect(() => {
    void carregarPessoas()
    void carregarProcessos()
    void carregarVendas()
    void carregarEventos()
  }, [carregarPessoas, carregarProcessos, carregarVendas, carregarEventos])

  const totalFechado = useMemo(() =>
    vendas
      .filter((venda) => venda.status === StatusVenda.FECHADA)
      .reduce((acc, venda) => acc + venda.valorTotal, 0),
  [vendas])

  const exportarResumoCsv = () => {
    const linhas = [
      ['Modulo', 'Quantidade', 'Observacao'],
      ['Pessoas', String(pessoas.length), 'Cadastros ativos e inativos'],
      ['Processos', String(processos.length), 'Processos administrativos'],
      ['Vendas', String(vendas.length), `Total fechado: ${formatarMoeda(totalFechado)}`],
      ['Eventos', String(eventos.length), 'Agenda operacional'],
    ]
    const csv = linhas.map((linha) => linha.map((coluna) => `"${String(coluna).replace(/"/g, '""')}"`).join(';')).join('\n')
    baixarArquivo(`relatorio-executivo-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  const exportarVendasCsv = () => {
    const linhas = [
      ['ID', 'PessoaID', 'Descricao', 'Status', 'ValorTotal', 'DataVenda'],
      ...vendas.map((venda) => [
        venda.id,
        venda.pessoaId,
        venda.descricao,
        venda.status,
        venda.valorTotal.toFixed(2),
        venda.dataVenda.toISOString(),
      ]),
    ]
    const csv = linhas.map((linha) => linha.map((coluna) => `"${String(coluna).replace(/"/g, '""')}"`).join(';')).join('\n')
    baixarArquivo(`vendas-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  const erroGeral = erroPessoas || erroProcessos || erroVendas || erroEventos

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileBarChart2 className="w-8 h-8" />}
        title="Relatorios"
        subtitle="Indicadores consolidados de pessoas, processos, vendas e eventos"
      />

      {erroGeral && <Alert type="error" message={erroGeral} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold">Pessoas</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{pessoas.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold">Processos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{processos.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold">Vendas fechadas</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatarMoeda(totalFechado)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-xs text-gray-500 uppercase font-semibold">Eventos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{eventos.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5 space-y-3">
        <p className="text-sm text-gray-600">Exporte dados operacionais em CSV para auditoria, BI e integração externa.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportarResumoCsv}>Exportar resumo executivo (CSV)</Button>
          <Button variant="secondary" onClick={exportarVendasCsv}>Exportar vendas (CSV)</Button>
        </div>
      </div>
    </div>
  )
}
