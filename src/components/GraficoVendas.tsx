
import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

type Venda = {
  id: number
  total: number
  data: string
}

type VendaMensal = {
  mes: string
  vendas: number
}

const nomesMeses = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
]

function GraficoVendas() {
  const [vendasMensais, setVendasMensais] = useState<VendaMensal[]>([])

  useEffect(() => {
    function atualizarGrafico() {
      try {
        const vendas: Venda[] = JSON.parse(
          localStorage.getItem('vendas') || '[]'
        )

        const totais = Array(12).fill(0) as number[]
        const anoAtual = new Date().getFullYear()

        vendas.forEach(venda => {
          const partes = venda.data.split('/')

          if (partes.length !== 3) return

          const mes = Number(partes[1]) - 1
          const ano = Number(partes[2])

          if (ano === anoAtual && mes >= 0 && mes < 12) {
            totais[mes] += Number(venda.total) || 0
          }
        })

        setVendasMensais(
          nomesMeses.map((mes, indice) => ({
            mes,
            vendas: totais[indice]
          }))
        )
      } catch (erro) {
        console.error('Erro ao carregar gráfico:', erro)
      }
    }

    atualizarGrafico()

    window.addEventListener('dados-atualizados', atualizarGrafico)
    window.addEventListener('focus', atualizarGrafico)

    return () => {
      window.removeEventListener('dados-atualizados', atualizarGrafico)
      window.removeEventListener('focus', atualizarGrafico)
    }
  }, [])

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={vendasMensais}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip
            formatter={(valor) =>
              Number(valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })
            }
          />
          <Bar
            dataKey="vendas"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GraficoVendas
