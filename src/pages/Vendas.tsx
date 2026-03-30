import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { DollarSign, ReceiptText, Trash2 } from 'lucide-react'
import { Alert, Button, Input, PageHeader, Select } from '../components'
import { usePessoasStore } from '../stores/pessoasStore'
import { useVendasStore } from '../stores/vendasStore'
import { StatusVenda } from '../types/models'
import { formatarData } from '../utils/constants'

const opcoesStatus = [
  { value: StatusVenda.ORCAMENTO, label: 'Orcamento' },
  { value: StatusVenda.FECHADA, label: 'Fechada' },
  { value: StatusVenda.CANCELADA, label: 'Cancelada' },
]

const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

export const Vendas: React.FC = () => {
  const { pessoas, carregarPessoas } = usePessoasStore()
  const { vendas, carregando, erro, carregarVendas, adicionarVenda, atualizarStatusVenda, deletarVenda } = useVendasStore()

  const [pessoaId, setPessoaId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [valorUnitario, setValorUnitario] = useState('0')
  const [desconto, setDesconto] = useState('0')
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  const onChangeInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
  }

  const onChangeSelect = (setter: (value: string) => void) => (e: ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value)
  }

  useEffect(() => {
    void carregarPessoas()
    void carregarVendas()
  }, [carregarPessoas, carregarVendas])

  const totalMes = useMemo(() => {
    const agora = new Date()
    return vendas
      .filter((v) => v.status === StatusVenda.FECHADA && v.dataVenda.getMonth() === agora.getMonth() && v.dataVenda.getFullYear() === agora.getFullYear())
      .reduce((acc, venda) => acc + venda.valorTotal, 0)
  }, [vendas])

  const cadastrar = async () => {
    if (!pessoaId || !descricao.trim()) return
    setSalvando(true)
    try {
      await adicionarVenda({
        pessoaId,
        descricao: descricao.trim(),
        itens: [{ descricao: descricao.trim(), quantidade: Number(quantidade) || 1, valorUnitario: Number(valorUnitario) || 0 }],
        desconto: Number(desconto) || 0,
        observacoes: observacoes.trim() || undefined,
      })
      setDescricao('')
      setQuantidade('1')
      setValorUnitario('0')
      setDesconto('0')
      setObservacoes('')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<DollarSign className="w-8 h-8" />}
        title="Vendas"
        subtitle="Gestao comercial com rastreio de status e valor"
        actions={
          <div className="bg-white/10 rounded-lg px-3 py-2 text-xs text-red-100">
            Faturamento do mes: <strong className="text-white">{formatarMoeda(totalMes)}</strong>
          </div>
        }
      />

      {erro && <Alert type="error" message={erro} />}

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select
          label="Cliente"
          value={pessoaId}
          onChange={onChangeSelect(setPessoaId)}
          options={pessoas.map((p) => ({ value: p.id, label: `${p.nome} (${p.cpf})` }))}
          placeholder="Selecione"
        />
        <Input label="Descricao" value={descricao} onChange={onChangeInput(setDescricao)} placeholder="Ex.: Taxa de assessoria" />
        <Input label="Quantidade" type="number" min={1} value={quantidade} onChange={onChangeInput(setQuantidade)} />
        <Input label="Valor unitario" type="number" min={0} step="0.01" value={valorUnitario} onChange={onChangeInput(setValorUnitario)} />
        <Input label="Desconto" type="number" min={0} step="0.01" value={desconto} onChange={onChangeInput(setDesconto)} />
        <Input label="Observacoes" value={observacoes} onChange={onChangeInput(setObservacoes)} placeholder="Opcional" />
        <div className="md:col-span-2 lg:col-span-3">
          <Button onClick={() => void cadastrar()} isLoading={salvando}>
            <ReceiptText className="w-4 h-4" />
            Registrar venda
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2">Data</th>
              <th className="text-left py-2 px-2">Cliente</th>
              <th className="text-left py-2 px-2">Descricao</th>
              <th className="text-left py-2 px-2">Total</th>
              <th className="text-left py-2 px-2">Status</th>
              <th className="text-left py-2 px-2">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => {
              const pessoa = pessoas.find((p) => p.id === venda.pessoaId)
              return (
                <tr key={venda.id} className="border-b border-gray-100">
                  <td className="py-2 px-2">{formatarData(venda.dataVenda)}</td>
                  <td className="py-2 px-2">{pessoa?.nome || '(nao encontrado)'}</td>
                  <td className="py-2 px-2">{venda.descricao}</td>
                  <td className="py-2 px-2 font-semibold">{formatarMoeda(venda.valorTotal)}</td>
                  <td className="py-2 px-2">
                    <Select
                      options={opcoesStatus}
                      value={venda.status}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => void atualizarStatusVenda(venda.id, e.target.value as StatusVenda)}
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Button variant="danger" onClick={() => void deletarVenda(venda.id)}>
                      <Trash2 className="w-4 h-4" /> Excluir
                    </Button>
                  </td>
                </tr>
              )
            })}
            {!carregando && vendas.length === 0 && (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={6}>Nenhuma venda registrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
