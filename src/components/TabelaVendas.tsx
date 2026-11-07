
import { useEffect, useState } from 'react'
import './TabelaVendas.css'

type Venda = {
  id: number
  cliente: string
  produto: string
  quantidade: number
  total: number
  data: string
}

function TabelaVendas() {
  const [vendas, setVendas] = useState<Venda[]>([])

  useEffect(() => {
    function carregarVendas() {
      try {
        const dados = JSON.parse(
          localStorage.getItem('vendas') || '[]'
        )

        setVendas(
          Array.isArray(dados)
            ? [...dados].reverse().slice(0, 5)
            : []
        )
      } catch {
        setVendas([])
      }
    }

    carregarVendas()

    window.addEventListener('dados-atualizados', carregarVendas)
    window.addEventListener('focus', carregarVendas)

    return () => {
      window.removeEventListener('dados-atualizados', carregarVendas)
      window.removeEventListener('focus', carregarVendas)
    }
  }, [])

  if (vendas.length === 0) {
    return <p>Nenhuma venda registrada ainda.</p>
  }

  return (
    <div className="tabela-scroll">
      <table className="tabela-vendas">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Quantidade</th>
            <th>Valor Total</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {vendas.map(venda => (
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
  )
}

export default TabelaVendas
