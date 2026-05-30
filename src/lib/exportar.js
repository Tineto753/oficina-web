import * as XLSX from 'xlsx'
import { supabase } from './supabase'

export async function exportarPlanilha() {
  // Clientes
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .eq('ativo', true)
    .order('nome_completo')

  // Veículos
  const { data: veiculos } = await supabase
    .from('veiculos')
    .select('*, modelos(nome, marcas(nome)), clientes(nome_completo)')
    .eq('ativo', true)
    .order('placa')

  // OS concluídas
  const { data: ordens } = await supabase
    .from('ordens_servico')
    .select('*, clientes(nome_completo), veiculos(placa), os_servicos(preco_cobrado, devolvido, servicos(nome))')
    .eq('status', 'concluida')
    .order('concluida_em', { ascending: false })

  const wb = XLSX.utils.book_new()

  // Aba Clientes
  const clientesRows = (clientes || []).map(c => ({
    'Nome': c.nome_completo,
    'Tipo': c.tipo_pessoa,
    'CPF/CNPJ': c.cpf_cnpj,
    'Telefone': c.telefone,
    'Email': c.email || '',
    'Cidade': c.cidade || '',
    'UF': c.uf || '',
    'Cadastrado em': new Date(c.created_at).toLocaleDateString('pt-BR')
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientesRows), 'Clientes')

  // Aba Veículos
  const veiculosRows = (veiculos || []).map(v => ({
    'Proprietário': v.clientes?.nome_completo || '',
    'Marca': v.modelos?.marcas?.nome || '',
    'Modelo': v.modelos?.nome || '',
    'Placa': v.placa,
    'Ano Fab.': v.ano_fabricacao,
    'Ano Mod.': v.ano_modelo,
    'Cor': v.cor || '',
    'Chassi': v.chassi || ''
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(veiculosRows), 'Veículos')

  // Aba OS
  const osRows = (ordens || []).map(o => ({
    'Cliente': o.clientes?.nome_completo || '',
    'Placa': o.veiculos?.placa || '',
    'Serviços': (o.os_servicos || []).filter(s => !s.devolvido).map(s => s.servicos?.nome).join(', '),
    'Valor Total': parseFloat(o.valor_total || 0).toFixed(2),
    'Forma Pagamento': o.forma_pagamento || '',
    'KM Entrada': o.km_entrada || '',
    'Concluída em': o.concluida_em ? new Date(o.concluida_em).toLocaleDateString('pt-BR') : ''
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(osRows), 'OS Concluídas')

  const data = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
  XLSX.writeFile(wb, `oficina_${data}.xlsx`)
}
