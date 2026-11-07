
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type Produto = {
  id: number
  nome: string
  preco: number
  estoque: number
}

function CadastroProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>(() => {
    try {
      const salvos = localStorage.getItem('produtos')
      return salvos ? JSON.parse(salvos) : []
    } catch {
      return []
    }
  })

  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [estoque, setEstoque] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)

  useEffect(() => {
    localStorage.setItem('produtos', JSON.stringify(produtos))
    window.dispatchEvent(new Event('dados-atualizados'))
  }, [produtos])

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(pesquisa.trim().toLowerCase())
  )

  const produtosEstoqueBaixo = produtos.filter(
    produto => produto.estoque <= 5
  ).length

  function salvarProduto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const valor = Number(preco)
    const quantidade = Number(estoque)

    if (!nome.trim() || !preco || estoque === '') return
    if (!Number.isFinite(valor) || valor < 0) return
    if (!Number.isInteger(quantidade) || quantidade < 0) return

    if (editandoId !== null) {
      setProdutos(anteriores =>
        anteriores.map(produto =>
          produto.id === editandoId
            ? {
                ...produto,
                nome: nome.trim(),
                preco: valor,
                estoque: quantidade
              }
            : produto
        )
      )
    } else {
      const novoProduto: Produto = {
        id: Date.now(),
        nome: nome.trim(),
        preco: valor,
        estoque: quantidade
      }

      setProdutos(anteriores => [...anteriores, novoProduto])
    }

    limparFormulario()
  }

  function limparFormulario() {
    setNome('')
    setPreco('')
    setEstoque('')
    setEditandoId(null)
  }

  function editarProduto(produto: Produto) {
    setNome(produto.nome)
    setPreco(String(produto.preco))
    setEstoque(String(produto.estoque))
    setEditandoId(produto.id)

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function excluirProduto(id: number) {
    if (!window.confirm('Deseja excluir este produto?')) return

    setProdutos(anteriores =>
      anteriores.filter(produto => produto.id !== id)
    )

    if (editandoId === id) {
      limparFormulario()
    }
  }

  return (
    <section className="resumo" id="produtos">
      <h2>Gerenciamento de Produtos</h2>
      <p>Cadastre, pesquise e controle o estoque da empresa.</p>

      <form onSubmit={salvarProduto} className="form-produtos">
        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Preço (R$)"
          min="0"
          step="0.01"
          value={preco}
          onChange={e => setPreco(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Quantidade em estoque"
          min="0"
          step="1"
          value={estoque}
          onChange={e => setEstoque(e.target.value)}
          required
        />

        <button type="submit">
          {editandoId !== null
            ? 'Salvar alterações'
            : 'Cadastrar produto'}
        </button>

        {editandoId !== null && (
          <button
            type="button"
            className="btn-cancelar"
            onClick={limparFormulario}
          >
            Cancelar
          </button>
        )}
      </form>

      <div className="produtos-resumo">
        <div className="produto-indicador">
          <span>Total de produtos</span>
          <strong>{produtos.length}</strong>
        </div>

        <div className="produto-indicador">
          <span>Produtos com estoque baixo</span>
          <strong>{produtosEstoqueBaixo}</strong>
        </div>
      </div>

      <div className="produtos-cabecalho">
        <h3>Produtos cadastrados ({produtos.length})</h3>

        <input
          type="search"
          placeholder="🔎 Pesquisar produto..."
          className="pesquisa-produtos"
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
        />
      </div>

      {produtosFiltrados.length === 0 ? (
        <p>
          {produtos.length === 0
            ? 'Nenhum produto cadastrado ainda.'
            : 'Nenhum produto encontrado na pesquisa.'}
        </p>
      ) : (
        <div className="tabela-scroll">
          <table className="tabela-vendas">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {produtosFiltrados.map(produto => (
                <tr key={produto.id}>
                  <td>{produto.nome}</td>

                  <td>
                    {produto.preco.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </td>

                  <td>{produto.estoque}</td>

                  <td>
                    <span
                      className={
                        produto.estoque === 0
                          ? 'estoque-status esgotado'
                          : produto.estoque <= 5
                          ? 'estoque-status baixo'
                          : 'estoque-status normal'
                      }
                    >
                      {produto.estoque === 0
                        ? 'Esgotado'
                        : produto.estoque <= 5
                        ? 'Estoque baixo'
                        : 'Disponível'}
                    </span>
                  </td>

                  <td>
                    <div className="acoes-produtos">
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => editarProduto(produto)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-excluir"
                        onClick={() => excluirProduto(produto.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default CadastroProdutos
