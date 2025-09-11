import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export interface DadosDRE {
  receitas: {
    categoria: string;
    valor: number;
    subcategorias?: { nome: string; valor: number }[];
  }[];
  despesas: {
    categoria: string;
    valor: number;
    subcategorias?: { nome: string; valor: number }[];
  }[];
  resultado: {
    receitaLiquida: number;
    lucroBruto: number;
    lucroOperacional: number;
    resultadoLiquido: number;
    margemBruta: number;
    margemOperacional: number;
    margemLiquida: number;
  };
  periodo: string;
  empresa?: string;
}

export interface ConfiguracaoExportacao {
  formato: 'pdf' | 'excel';
  tipoRelatorio: 'resumido' | 'detalhado' | 'analitico';
  incluirComparacao: boolean;
  incluirInsights: boolean;
  incluirGraficos: boolean;
  orientacao: 'retrato' | 'paisagem';
  logoEmpresa: boolean;
}

export interface InsightsDRE {
  principais: string[];
  recomendacoes: string[];
  alertas: string[];
}

// Funções utilitárias
const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
};

const formatarPercentual = (valor: number): string => {
  return `${valor.toFixed(1)}%`;
};

// Exportação PDF
export async function exportarDREParaPDF(
  dados: DadosDRE, 
  configuracao: ConfiguracaoExportacao, 
  insights?: InsightsDRE
): Promise<void> {
  
  const orientacao = configuracao.orientacao === 'paisagem' ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation: orientacao,
    unit: 'mm',
    format: 'a4'
  });

  let yPosition = 20;
  const pageWidth = orientacao === 'landscape' ? 297 : 210;
  const margin = 20;

  // Header do documento
  if (configuracao.logoEmpresa && dados.empresa) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(dados.empresa, margin, yPosition);
    yPosition += 10;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Demonstração do Resultado do Exercício', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${dados.periodo}`, margin, yPosition);
  yPosition += 4;

  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, yPosition);
  yPosition += 15;

  // Preparar dados da tabela baseado no tipo de relatório
  const tableData: (string | number)[][] = [];
  
  // Receitas
  tableData.push(['RECEITAS', '', '']);
  
  for (const receita of dados.receitas) {
    tableData.push([receita.categoria, formatarMoeda(receita.valor), '']);
    
    if (configuracao.tipoRelatorio !== 'resumido' && receita.subcategorias) {
      for (const sub of receita.subcategorias) {
        tableData.push([`  ${sub.nome}`, formatarMoeda(sub.valor), '']);
      }
    }
  }

  const totalReceitas = dados.receitas.reduce((acc, r) => acc + r.valor, 0);
  tableData.push(['TOTAL RECEITAS', formatarMoeda(totalReceitas), '']);
  tableData.push(['', '', '']);

  // Despesas
  tableData.push(['DESPESAS E CUSTOS', '', '']);
  
  for (const despesa of dados.despesas) {
    tableData.push([despesa.categoria, formatarMoeda(despesa.valor), '']);
    
    if (configuracao.tipoRelatorio !== 'resumido' && despesa.subcategorias) {
      for (const sub of despesa.subcategorias) {
        tableData.push([`  ${sub.nome}`, formatarMoeda(sub.valor), '']);
      }
    }
  }

  const totalDespesas = dados.despesas.reduce((acc, d) => acc + d.valor, 0);
  tableData.push(['TOTAL DESPESAS', formatarMoeda(totalDespesas), '']);
  tableData.push(['', '', '']);

  // Resultados
  tableData.push(['RESULTADOS', '', '']);
  tableData.push(['Lucro Bruto', formatarMoeda(dados.resultado.lucroBruto), formatarPercentual(dados.resultado.margemBruta)]);
  tableData.push(['Lucro Operacional', formatarMoeda(dados.resultado.lucroOperacional), formatarPercentual(dados.resultado.margemOperacional)]);
  tableData.push(['Resultado Líquido', formatarMoeda(dados.resultado.resultadoLiquido), formatarPercentual(dados.resultado.margemLiquida)]);

  // Gerar tabela
  autoTable(doc, {
    head: [['Descrição', 'Valor (R$)', 'Margem (%)']],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: orientacao === 'landscape' ? 120 : 80 },
      1: { cellWidth: orientacao === 'landscape' ? 80 : 60, halign: 'right' },
      2: { cellWidth: orientacao === 'landscape' ? 60 : 40, halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.row.raw[0] === 'RECEITAS' || 
          data.row.raw[0] === 'DESPESAS E CUSTOS' || 
          data.row.raw[0] === 'RESULTADOS' ||
          data.row.raw[0] === 'TOTAL RECEITAS' ||
          data.row.raw[0] === 'TOTAL DESPESAS') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [243, 244, 246]; // gray-100
      }
    }
  });

  // Insights e recomendações (se habilitados)
  if (configuracao.incluirInsights && insights) {
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Análises e Recomendações', margin, finalY);
    
    let currentY = finalY + 8;
    
    if (insights.principais.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Principais Insights:', margin, currentY);
      currentY += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      for (const insight of insights.principais) {
        const lines = doc.splitTextToSize(`• ${insight}`, pageWidth - 2 * margin);
        doc.text(lines, margin + 5, currentY);
        currentY += lines.length * 4;
      }
      currentY += 5;
    }
    
    if (insights.recomendacoes.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Recomendações:', margin, currentY);
      currentY += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      for (const recomendacao of insights.recomendacoes) {
        const lines = doc.splitTextToSize(`• ${recomendacao}`, pageWidth - 2 * margin);
        doc.text(lines, margin + 5, currentY);
        currentY += lines.length * 4;
      }
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} - JC Financeiro - DRE ${dados.periodo}`,
      pageWidth / 2,
      orientacao === 'landscape' ? 200 : 285,
      { align: 'center' }
    );
  }

  // Salvar arquivo
  const fileName = `DRE_${dados.periodo.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

// Exportação Excel
export async function exportarDREParaExcel(
  dados: DadosDRE, 
  configuracao: ConfiguracaoExportacao, 
  insights?: InsightsDRE
): Promise<void> {
  
  const workbook = XLSX.utils.book_new();

  // Aba principal - DRE
  const dreData: (string | number)[][] = [];
  
  // Header
  dreData.push(['DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO']);
  dreData.push([`Período: ${dados.periodo}`]);
  dreData.push([`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`]);
  dreData.push([]);
  dreData.push(['Descrição', 'Valor (R$)', 'Margem (%)']);

  // Receitas
  dreData.push(['RECEITAS', '', '']);
  
  for (const receita of dados.receitas) {
    dreData.push([receita.categoria, receita.valor, '']);
    
    if (configuracao.tipoRelatorio !== 'resumido' && receita.subcategorias) {
      for (const sub of receita.subcategorias) {
        dreData.push([`  ${sub.nome}`, sub.valor, '']);
      }
    }
  }

  const totalReceitas = dados.receitas.reduce((acc, r) => acc + r.valor, 0);
  dreData.push(['TOTAL RECEITAS', totalReceitas, '']);
  dreData.push([]);

  // Despesas
  dreData.push(['DESPESAS E CUSTOS', '', '']);
  
  for (const despesa of dados.despesas) {
    dreData.push([despesa.categoria, despesa.valor, '']);
    
    if (configuracao.tipoRelatorio !== 'resumido' && despesa.subcategorias) {
      for (const sub of despesa.subcategorias) {
        dreData.push([`  ${sub.nome}`, sub.valor, '']);
      }
    }
  }

  const totalDespesas = dados.despesas.reduce((acc, d) => acc + d.valor, 0);
  dreData.push(['TOTAL DESPESAS', totalDespesas, '']);
  dreData.push([]);

  // Resultados
  dreData.push(['RESULTADOS', '', '']);
  dreData.push(['Lucro Bruto', dados.resultado.lucroBruto, dados.resultado.margemBruta]);
  dreData.push(['Lucro Operacional', dados.resultado.lucroOperacional, dados.resultado.margemOperacional]);
  dreData.push(['Resultado Líquido', dados.resultado.resultadoLiquido, dados.resultado.margemLiquida]);

  const dreSheet = XLSX.utils.aoa_to_sheet(dreData);
  
  // Formatação básica da planilha
  dreSheet['!cols'] = [
    { width: 30 }, // Descrição
    { width: 15 }, // Valor
    { width: 12 }  // Margem
  ];

  XLSX.utils.book_append_sheet(workbook, dreSheet, 'DRE');

  // Aba de insights (se habilitada)
  if (configuracao.incluirInsights && insights) {
    const insightsData: string[][] = [];
    
    insightsData.push(['ANÁLISES E RECOMENDAÇÕES']);
    insightsData.push([]);
    
    if (insights.principais.length > 0) {
      insightsData.push(['PRINCIPAIS INSIGHTS']);
      for (const insight of insights.principais) {
        insightsData.push([insight]);
      }
      insightsData.push([]);
    }
    
    if (insights.recomendacoes.length > 0) {
      insightsData.push(['RECOMENDAÇÕES']);
      for (const recomendacao of insights.recomendacoes) {
        insightsData.push([recomendacao]);
      }
      insightsData.push([]);
    }
    
    if (insights.alertas.length > 0) {
      insightsData.push(['ALERTAS']);
      for (const alerta of insights.alertas) {
        insightsData.push([alerta]);
      }
    }

    const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData);
    insightsSheet['!cols'] = [{ width: 80 }];
    
    XLSX.utils.book_append_sheet(workbook, insightsSheet, 'Insights');
  }

  // Aba de métricas resumidas
  const metricasData: (string | number)[][] = [];
  metricasData.push(['MÉTRICAS RESUMIDAS']);
  metricasData.push([]);
  metricasData.push(['Métrica', 'Valor', 'Percentual']);
  metricasData.push(['Receita Líquida', dados.resultado.receitaLiquida, '100,0%']);
  metricasData.push(['Lucro Bruto', dados.resultado.lucroBruto, `${dados.resultado.margemBruta.toFixed(1)}%`]);
  metricasData.push(['Lucro Operacional', dados.resultado.lucroOperacional, `${dados.resultado.margemOperacional.toFixed(1)}%`]);
  metricasData.push(['Resultado Líquido', dados.resultado.resultadoLiquido, `${dados.resultado.margemLiquida.toFixed(1)}%`]);

  const metricasSheet = XLSX.utils.aoa_to_sheet(metricasData);
  metricasSheet['!cols'] = [
    { width: 20 },
    { width: 15 },
    { width: 12 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, metricasSheet, 'Métricas');

  // Salvar arquivo
  const fileName = `DRE_${dados.periodo.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(blob, fileName);
}

// Função principal de exportação
export async function exportarDRE(
  dados: DadosDRE,
  configuracao: ConfiguracaoExportacao,
  insights?: InsightsDRE
): Promise<void> {
  try {
    if (configuracao.formato === 'pdf') {
      await exportarDREParaPDF(dados, configuracao, insights);
    } else {
      await exportarDREParaExcel(dados, configuracao, insights);
    }
  } catch (error) {
    console.error('Erro ao exportar DRE:', error);
    throw new Error('Falha na exportação. Tente novamente.');
  }
}