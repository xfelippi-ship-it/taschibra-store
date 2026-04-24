import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const produtos = [
    {
      sku: 'EXEMPLO-001',
      ean: '7891234567890',
      nome: 'Lampada LED Exemplo 9W 6500K',
      preco: 29.90,
      preco_pix: 27.90,
      estoque: 100,
      descricao_curta: 'Descricao curta do produto',
      descricao: 'Descricao completa do produto',
      categoria: 'lampadas',
      familia: 'LED',
      ativo: 'sim',
      lancamento: 'nao',
      peso_kg: 0.15,
      garantia: '12 meses',
      imagem_principal: 'https://exemplo.com/img1.jpg',
      imagem_1: '',
      imagem_2: '',
      imagem_3: '',
      imagem_4: '',
      imagem_5: '',
      imagem_6: '',
      video: ''
    }
  ]

  const variacoes = [
    {
      sku_pai: 'EXEMPLO-001',
      sku_variacao: 'EXEMPLO-001-4000K',
      ean_variacao: '7891234567891',
      nome_variacao: 'Branco Quente 4000K',
      atributo: 'temperatura_cor',
      valor: '4000K',
      preco: 29.90,
      preco_pix: 27.90,
      estoque: 50
    }
  ]

  const referencia = [
    { coluna: 'sku', obrigatorio: 'Sim', observacao: 'Codigo interno do produto (unico)' },
    { coluna: 'ean', obrigatorio: 'Recomendado', observacao: 'EAN/codigo de barras (13 digitos). Usado para integracao com marketplaces e rotulagem de imagens.' },
    { coluna: 'nome', obrigatorio: 'Sim', observacao: 'Nome do produto para exibicao' },
    { coluna: 'preco', obrigatorio: 'Sim', observacao: 'Preco no cartao (formato: 29.90)' },
    { coluna: 'preco_pix', obrigatorio: 'Nao', observacao: 'Preco no PIX com desconto' },
    { coluna: 'estoque', obrigatorio: 'Sim', observacao: 'Quantidade em estoque (numero inteiro)' },
    { coluna: 'categoria', obrigatorio: 'Sim', observacao: 'Slug da categoria (ex: lampadas, plafons)' },
    { coluna: 'ativo', obrigatorio: 'Sim', observacao: 'sim ou nao' },
    { coluna: 'lancamento', obrigatorio: 'Nao', observacao: 'sim ou nao - marca como lancamento' },
    { coluna: 'peso_kg', obrigatorio: 'Nao', observacao: 'Peso em kg para calculo de frete (ex: 0.15)' },
    { coluna: 'imagem_principal', obrigatorio: 'Nao', observacao: 'URL da imagem principal' },
    { coluna: 'imagem_1 a imagem_6', obrigatorio: 'Nao', observacao: 'URLs das imagens da galeria' }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(produtos), 'Produtos')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(variacoes), 'Variacoes')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(referencia), 'Referencia')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="planilha-modelo-v4-taschibra.xlsx"',
    }
  })
}
