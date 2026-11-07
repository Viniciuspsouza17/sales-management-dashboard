
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

import GraficoVendas from './components/GraficoVendas'
import TabelaVendas from './components/TabelaVendas'
import CadastroClientes from './components/CadastroClientes'
import CadastroProdutos from './components/CadastroProdutos'
import RegistroVendas from './components/RegistroVendas'

type Pagina = 'dashboard' | 'clientes' | 'produtos' | 'vendas'

function App() {
  const [logado, setLogado] = useState(
    () => sessionStorage.getItem('sales-logado') === 'true'
  )

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')

  const [paginaAtual, setPaginaAtual] = useState<Pagina>('dashboard')

  const [totalVendas, setTotalVendas] = useState(0)
  const [quantidadePedidos, setQuantidadePedidos] = useState(0)
  const [totalClientes, setTotalClientes] = useState(0)
  const [produtosCadastrados, setProdutosCadastrados] = useState(0)

  useEffect(() => {
    function atualizarIndicadores() {
      try {
        const vendas = JSON.parse(localStorage.getItem('vendas') || '[]')
        const clientes = JSON.parse(localStorage.getItem('clientes') || '[]')
        const produtos = JSON.parse(localStorage.getItem('produtos') || '[]')

        setTotalVendas(
          vendas.reduce(
            (soma: number, venda: { total: number }) =>
              soma + Number(venda.total || 0),
            0
          )
        )

        setQuantidadePedidos(vendas.length)
        setTotalClientes(clientes.length)
        setProdutosCadastrados(produtos.length)
      } catch (erro) {
        console.error('Erro ao atualizar indicadores:', erro)
      }
    }

    atualizarIndicadores()

    window.addEventListener('focus', atualizarIndicadores)
    window.addEventListener('dados-atualizados', atualizarIndicadores)

    return () => {
      window.removeEventListener('focus', atualizarIndicadores)
      window.removeEventListener('dados-atualizados', atualizarIndicadores)
    }
  }, [])

  function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (
      email.trim().toLowerCase() === 'admin@salesmanager.com' &&
      senha === '123456'
    ) {
      sessionStorage.setItem('sales-logado', 'true')
      setLogado(true)
      setErroLogin('')
      setEmail('')
      setSenha('')
    } else {
      setErroLogin('E-mail ou senha incorretos.')
    }
  }

  function sair() {
    sessionStorage.removeItem('sales-logado')
    setLogado(false)
    setPaginaAtual('dashboard')
    setSenha('')
    setErroLogin('')
  }

  function mudarPagina(pagina: Pagina) {
    setPaginaAtual(pagina)
    window.scrollTo(0, 0)
  }

  if (!logado) {
    return (
      <div className="login-pagina">
        <div className="login-card">
          <div className="login-logo">📊</div>

          <h1>Sales Manager</h1>
          <p>Entre para acessar seu painel de gestão.</p>

          <form onSubmit={entrar} className="login-form">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="login-senha">Senha</label>
            <input
              id="login-senha"
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />

            {erroLogin && (
              <p className="login-erro" role="alert">
                {erroLogin}
              </p>
            )}

            <button type="submit">Entrar no sistema</button>
          </form>

          <div className="login-demo">
            <strong>Acesso demonstrativo</strong>
            <span>E-mail: admin@salesmanager.com</span>
            <span>Senha: 123456</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>Sales Manager</h2>

        <nav>
          <button
            className={paginaAtual === 'dashboard' ? 'ativo' : ''}
            onClick={() => mudarPagina('dashboard')}
          >
            📊 Dashboard
          </button>

          <button
            className={paginaAtual === 'clientes' ? 'ativo' : ''}
            onClick={() => mudarPagina('clientes')}
          >
            👥 Clientes
          </button>

          <button
            className={paginaAtual === 'produtos' ? 'ativo' : ''}
            onClick={() => mudarPagina('produtos')}
          >
            📦 Produtos
          </button>

          <button
            className={paginaAtual === 'vendas' ? 'ativo' : ''}
            onClick={() => mudarPagina('vendas')}
          >
            🛒 Vendas
          </button>
        </nav>

        <button
          type="button"
          className="botao-sair"
          onClick={sair}
        >
          🚪 Sair do sistema
        </button>
      </aside>

      <main className="conteudo">
        {paginaAtual === 'dashboard' && (
          <>
            <header>
              <h1>Dashboard de Vendas</h1>
              <p>Bem-vindo ao seu sistema de gestão!</p>
            </header>

            <section className="indicadores">
              <div className="card">
                <h3>Faturamento Total</h3>
                <p>
                  {totalVendas.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>

              <div className="card">
                <h3>Pedidos Realizados</h3>
                <p>{quantidadePedidos}</p>
              </div>

              <div className="card">
                <h3>Clientes Cadastrados</h3>
                <p>{totalClientes}</p>
              </div>

              <div className="card">
                <h3>Produtos Cadastrados</h3>
                <p>{produtosCadastrados}</p>
              </div>
            </section>

            <section className="resumo">
              <h2>Visão Geral</h2>
              <p>
                Acompanhe os principais indicadores
                do seu negócio em um só lugar.
              </p>
              <small>Dados registrados no sistema.</small>
            </section>

            <section className="resumo">
              <h2>Faturamento Mensal</h2>
              <p>Confira a evolução das vendas durante o ano.</p>
              <GraficoVendas />
            </section>

            <section className="resumo">
              <h2>Vendas Recentes</h2>
              <p>Acompanhe os últimos pedidos realizados.</p>
              <TabelaVendas />
            </section>
          </>
        )}

        {paginaAtual === 'clientes' && (
          <>
            <header>
              <h1>Clientes</h1>
              <p>Gerencie os clientes cadastrados.</p>
            </header>
            <CadastroClientes />
          </>
        )}

        {paginaAtual === 'produtos' && (
          <>
            <header>
              <h1>Produtos</h1>
              <p>Gerencie os produtos e o estoque.</p>
            </header>
            <CadastroProdutos />
          </>
        )}

        {paginaAtual === 'vendas' && (
          <>
            <header>
              <h1>Vendas</h1>
              <p>Registre e acompanhe suas vendas.</p>
            </header>
            <RegistroVendas />
          </>
        )}
      </main>
    </div>
  )
}

export default App
