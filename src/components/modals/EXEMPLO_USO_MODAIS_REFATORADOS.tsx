/**
 * EXEMPLO DE USO DOS NOVOS MODAIS REFATORADOS
 *
 * Este arquivo demonstra como integrar os novos modais refatorados
 * nas páginas de Contas a Pagar e Contas a Receber
 */

import { useState } from 'react';
import ContaVisualizarModalRefatorado from '@/components/contasPagar/ContaVisualizarModalRefatorado';
import ContaReceberVisualizarModalRefatorado from '@/components/contasReceber/ContaReceberVisualizarModalRefatorado';

// ============================================
// EXEMPLO 1: CONTAS A PAGAR
// ============================================

export function ExemploContasPagar() {
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);

  // Função para recarregar a lista (após reverter pagamento, por exemplo)
  const recarregarLista = () => {
    // Sua lógica para recarregar a lista de contas
    console.log('Recarregando lista de contas a pagar...');
  };

  const handleVisualizar = (conta: any) => {
    setContaSelecionada(conta);
    setModalVisualizar(true);
  };

  const handleEditar = (conta: any) => {
    console.log('Editando conta:', conta);
    // Sua lógica de edição
  };

  const handleBaixar = (conta: any) => {
    console.log('Baixando conta:', conta);
    // Sua lógica para baixar/pagar conta
  };

  const handleDuplicar = (conta: any) => {
    console.log('Duplicando conta:', conta);
    // Sua lógica para duplicar
  };

  const handleExcluir = (conta: any) => {
    console.log('Excluindo conta:', conta);
    // Sua lógica para excluir
  };

  return (
    <>
      {/* Seu componente de lista de contas */}
      <button onClick={() => handleVisualizar(/* sua conta */)}>
        Visualizar Conta
      </button>

      {/* Modal Refatorado de Visualização */}
      <ContaVisualizarModalRefatorado
        isOpen={modalVisualizar}
        onClose={() => {
          setModalVisualizar(false);
          setContaSelecionada(null);
        }}
        conta={contaSelecionada}
        onEditar={handleEditar}
        onBaixar={handleBaixar}
        onDuplicar={handleDuplicar}
        onExcluir={handleExcluir}
        onReload={recarregarLista} // Importante para atualizar a lista após reverter
      />
    </>
  );
}

// ============================================
// EXEMPLO 2: CONTAS A RECEBER
// ============================================

export function ExemploContasReceber() {
  const [modalVisualizar, setModalVisualizar] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);

  // Função para recarregar a lista (após reverter recebimento, por exemplo)
  const recarregarLista = () => {
    // Sua lógica para recarregar a lista de contas
    console.log('Recarregando lista de contas a receber...');
  };

  const handleVisualizar = (conta: any) => {
    setContaSelecionada(conta);
    setModalVisualizar(true);
  };

  const handleEditar = (conta: any) => {
    console.log('Editando conta:', conta);
    // Sua lógica de edição
  };

  const handleReceber = (conta: any) => {
    console.log('Recebendo conta:', conta);
    // Sua lógica para receber conta
  };

  const handleDuplicar = (conta: any) => {
    console.log('Duplicando conta:', conta);
    // Sua lógica para duplicar
  };

  const handleExcluir = (conta: any) => {
    console.log('Excluindo conta:', conta);
    // Sua lógica para excluir
  };

  return (
    <>
      {/* Seu componente de lista de contas */}
      <button onClick={() => handleVisualizar(/* sua conta */)}>
        Visualizar Conta
      </button>

      {/* Modal Refatorado de Visualização */}
      <ContaReceberVisualizarModalRefatorado
        isOpen={modalVisualizar}
        onClose={() => {
          setModalVisualizar(false);
          setContaSelecionada(null);
        }}
        conta={contaSelecionada}
        onEditar={handleEditar}
        onReceber={handleReceber}
        onDuplicar={handleDuplicar}
        onExcluir={handleExcluir}
        onReload={recarregarLista} // Importante para atualizar a lista após reverter
      />
    </>
  );
}

// ============================================
// PRINCIPAIS MELHORIAS DOS NOVOS MODAIS:
// ============================================

/**
 * 1. DESIGN MELHORADO:
 *    - Header colorido com gradiente (azul para pagar, verde para receber)
 *    - Cards organizados e com hover effects
 *    - Ícones contextuais para cada seção
 *    - Melhor hierarquia visual
 *
 * 2. NOVA FUNCIONALIDADE - REVERTER:
 *    - Botão "Reverter Pagamento" para contas pagas
 *    - Botão "Reverter Recebimento" para contas recebidas
 *    - Feedback visual durante a reversão
 *    - Toast de sucesso/erro
 *
 * 3. MELHOR ORGANIZAÇÃO:
 *    - Informações agrupadas em cards temáticos
 *    - Grid responsivo de 2 colunas
 *    - Indicadores visuais de prazo (dias para vencer/em atraso)
 *    - Status com ícones correspondentes
 *
 * 4. AÇÕES SECUNDÁRIAS:
 *    - Botões de Duplicar e Excluir sempre visíveis
 *    - Botões contextuais (Pagar/Receber) apenas quando aplicável
 *    - Botão Reverter apenas para contas já processadas
 *
 * 5. FEEDBACK VISUAL:
 *    - Cores diferenciadas por tipo de conta
 *    - Animações suaves em hover
 *    - Loading state no botão de reverter
 *    - Toast notifications para feedback
 */

// ============================================
// INTEGRAÇÃO COM PÁGINAS EXISTENTES:
// ============================================

/**
 * Para integrar nas páginas existentes:
 *
 * 1. Importe o novo modal:
 *    import ContaVisualizarModalRefatorado from '@/components/contasPagar/ContaVisualizarModalRefatorado';
 *
 * 2. Substitua o modal antigo pelo novo no JSX
 *
 * 3. Adicione a prop onReload que deve chamar a função de recarregar lista
 *
 * 4. Os novos modais já incluem a funcionalidade de reverter automaticamente
 *
 * IMPORTANTE: Os serviços já foram atualizados com as funções:
 * - accountsPayableService.revertPayment(id)
 * - accountsReceivableService.revertReceipt(id)
 */