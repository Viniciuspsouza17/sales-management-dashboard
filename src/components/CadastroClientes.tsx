
import { useState, useEffect } from 'react'

type Cliente = {
  id: number
  nome: string
  email: string
}

function CadastroClientes() {
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    try {
      const dadosSalvos = localStorage.getItem('clientes')
      return dadosSalvos ? JSON.parse(dadosSalvos) : []
    } catch {
      return []
    }
  })

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)

  useEffect(() => {
    localStorage.setItem('clientes', JSON.stringify(clientes))
    window.dispatchEvent(new Event('dados-atualizados'))
  }, [clientes])

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
    cliente.email.toLowerCase().includes(pesquisa.toLowerCase())
  )

  function salvarCliente(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (!nome.trim() || !email.trim()) return

    if (editandoId !== null) {
      setClientes(clientes.map(cliente =>
        cliente.id === editandoId
          ? {
              ...cliente,
              nome: nome.trim(),
              email: email.trim()
            }
          : cliente
      ))
      setEditandoId(null)
    } else {
      const novoCliente: Cliente = {
        id: Date.now(),
        nome: nome.trim(),
        email: email.trim()
      }

      setClientes([...clientes, novoCliente])
    }

    setNome('')
    setEmail('')
  }

  function editarCliente(cliente: Cliente) {
    setNome(cliente.nome)
    setEmail(cliente.email)
    setEditandoId(cliente.id)
  }

  function excluirCliente(id: number) {
    if (!window.confirm('Deseja excluir este cliente?')) return

    setClientes(clientes.filter(cliente => cliente.id !== id))

    if (editandoId === id) {
      setEditandoId(null)
      setNome('')
      setEmail('')
    }
  }

  return (
    <section className="resumo" id="clientes">
      <h2>Gerenciamento de Clientes</h2>
      <p>Cadastre, pesquise e gerencie seus clientes.</p>

      <form onSubmit={salvarCliente} className="form-clientes">
        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <button type="submit">
          {editandoId !== null
            ? 'Salvar alterações'
            : 'Cadastrar cliente'}
        </button>
      </form>

      <div className="clientes-cabecalho">
        <h3>Clientes cadastrados ({clientes.length})</h3>

        <input
          type="search"
          placeholder="🔎 Pesquisar cliente..."
          value={pesquisa}
          onChange={e => setPesquisa(e.target.value)}
          className="pesquisa-clientes"
        />
      </div>

      {clientesFiltrados.length === 0 ? (
        <p>
          {clientes.length === 0
            ? 'Nenhum cliente cadastrado ainda.'
            : 'Nenhum cliente encontrado na pesquisa.'}
        </p>
      ) : (
        <div className="tabela-scroll">
          <table className="tabela-vendas">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.email}</td>
                  <td>
                    <div className="acoes-clientes">
                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() => editarCliente(cliente)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-excluir"
                        onClick={() => excluirCliente(cliente.id)}
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

export default CadastroClientes
