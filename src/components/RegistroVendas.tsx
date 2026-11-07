
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Cliente = {
  id: number
  nome: string
  email: string
}

type Produto = {
  id: number
  nome: string
  preco: number
  estoque: number
}

type Venda = {
  id: number
  cliente: string
  produto: string
  quantidade: number
  total: number
  data: string
}

function lerDados<T>(chave: string): T[] {
  try {
    const dados = JSON.parse(localStorage.getItem(chave) || '[]')
    return Array.isArray(dados) ? dados : []
  } catch {
    return []
  }
}

function RegistroVendas() {
  const [clientes, setClientes] = useState<Cliente[]>(() =>
    lerDados<Cliente>('clientes')
  )

  const [produtos, setProdutos] = useState<Produto[]>(() =>
    lerDados<Produto>('produtos')
  )

  const [vendas, setVendas] = useState<Venda[]>(() =>
    lerDados<Venda>('vendas')
  )

  const [clienteId, setClienteId] = useState('')
  const [produtoId, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [pesquisa, setPesquisa] = useState('')

  useEffect(() => {
    function atualizarDados() {
      setClientes(lerDados<Cliente>('clientes'))
      setProdutos(lerDados<Produto>('produtos'))
      setVendas(lerDados<Venda>('vendas'))
    }

    window.addEventListener('focus', atualizarDados)
    window.addEventListener('storage', atualizarDados)
    window.addEventListener('dados-atualizados', atualizarDados)

    return () => {
      window.removeEventListener('focus', atualizarDados)
      window.removeEventListener('storage', atualizarDados)
      window.removeEventListener('dados-atualizados', atualizarDados)
    }
  }, [])

  const produtoSelecionado = produtos.find(
    produto => produto.id === Number(produtoId)
  )

  const quantidadeNumerica = Number(quantidade)

  const total =
    produtoSelecionado &&
    Number.isFinite(quantidadeNumerica) &&
    quantidadeNumerica > 0
      ? produtoSelecionado.preco * quantidadeNumerica
      : 0

  const vendasFiltradas = vendas.filter(venda =>
    venda.cliente.toLowerCase().includes(pesquisa.toLowerCase()) ||
    venda.produto.toLowerCase().includes(pesquisa.toLowerCase())
  )

  const faturamento = vendas.reduce(
    (soma, venda) => soma + Number(venda.total || 0),
    0
  )

  function registrarVenda(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Consulta os dados mais recentes antes de registrar.
    const clientesAtuais = lerDados<Cliente>('clientes')
    const produtosAtuais = lerDados<Produto>('produtos')
    const vendasAtuais = lerDados<Venda>('vendas')

    const cliente = clientesAtuais.find(
      c => c.id === Number(clienteId)
    )

    const produto = produtosAtuais.find(
      p => p.id === Number(produtoId)
    )

    const qtd = Number(quantidade)

    if (
      !cliente ||
      !produto ||
      !Number.isInteger(qtd) ||
      qtd <= 0
    ) {
      alert('Selecione um cliente, um produto e uma quantidade válida.')
      return
    }

    if (qtd > produto.estoque) {
      alert(
        `Estoque insuficiente! Disponível: ${produto.estoque} unidade(s).`
      )
      setProdutos(produtosAtuais)
      return
    }

    if (!Number.isFinite(produto.preco) || produto.preco < 0) {
      alert('O preço deste produto é inválido.')
      return
    }

    const novaVenda: Venda = {
      id: Date.now(),
      cliente: cliente.nome,
      produto: produto.nome,
      quantidade: qtd,
      total: produto.preco * qtd,
      data: new Date().toLocaleDateString('pt-BR')
    }

    const produtosAtualizados = produtosAtuais.map(p =>
      p.id === produto.id
        ? { ...p, estoque: p.estoque - qtd }
        : p
    )

    const vendasAtualizadas = [...vendasAtuais, novaVenda]

    try {
      localStorage.setItem(
        'produtos',
        JSON.stringify(produtosAtualizados)
      )

      localStorage.setItem(
        'vendas',
        JSON.stringify(vendasAtualizadas)
      )
    } catch (erro) {
      console.error('Erro ao salvar venda:', erro)
      alert('Não foi possível salvar a venda.')
      return
    }

    setProdutos(produtosAtualizados)
    setVendas(vendasAtualizadas)

    window.dispatchEvent(new Event('dados-atualizados'))

    setClienteId('')
    setProdutoId('')
    setQuantidade('1')

    alert('Venda registrada com sucesso!')
  }

  return (
    <section className="resumo" id="registrar-venda">
      <h2>Registrar Nova Venda</h2>
      <p>Selecione o cliente, o produto e a quantidade.</p>

      <form onSubmit={registrarVenda} className="form-produtos">
        <select
          value={clienteId}
          onChange={e => setClienteId(e.target.value)}
          required
        >
          <option value="">Selecione o cliente</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>

        <select
          value={produtoId}
          onChange={e => setProdutoId(e.target.value)}
          required
        >
          <option value="">Selecione o produto</option>
          {produtos.map(produto => (
            <option
              key={produto.id}
              value={produto.id}
              disabled={produto.estoque <= 0}
            >
              {produto.nome} — Estoque: {produto.estoque}
              {produto.estoque <= 0 ? ' (Esgotado)' : ''}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="1"
          max={produtoSelecionado?.estoque}
          step="1"
          placeholder="Quantidade"
          value={quantidade}
          onChange={e => setQuantidade(e.target.value)}
          required
        />

        <button type="submit">Registrar venda</button>
      </form>

      {produtoSelecionado && (
        <p>
          Estoque disponível: <strong>{produtoSelecionado.estoque}</strong>
        </p>
      )}

      <h3>
        Total da venda:{' '}
        {total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}
      </h3>

      <div className="vendas-indicadores">
        <div className="produto-indicador">
          <span>Vendas realizadas</span>
          <strong>{vendas.length}</strong>
        </div>

        <div className="produto-indicador">
          <span>Faturamento total</span>
          <strong>
            {faturamento.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </strong>
        </div>
      </div>

      <div className="vendas-cabecalho">
        <h3>Histórico de vendas ({vendas.length})</h3>

        <input
          type="search"
          placeholder="🔎 Pesquisar venda..."
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
          className="pesquisa-vendas"
        />
      </div>

      {vendasFiltradas.length === 0 ? (
        <p>
          {vendas.length === 0
            ? 'Nenhuma venda registrada ainda.'
            : 'Nenhuma venda encontrada na pesquisa.'}
        </p>
      ) : (
        <div className="tabela-scroll">
          <table className="tabela-vendas">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {[...vendasFiltradas].reverse().map(venda => (
                <tr key={venda.id}>
                  <td>{venda.cliente}</td>
                  <td>{venda.produto}</td>
                  <td>{venda.quantidade}</td>
                  <td>
                    {venda.total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>
                  <td>{venda.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default RegistroVendas
