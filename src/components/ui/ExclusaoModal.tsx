import React from 'react';
import { ConfirmacaoModal } from './ConfirmacaoModal';

interface ExclusaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: string;
  detalhes?: string;
  loading?: boolean;
}

export function ExclusaoModal({
  isOpen,
  onClose,
  onConfirm,
  item,
  detalhes,
  loading = false
}: ExclusaoModalProps) {
  return (
    <ConfirmacaoModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      titulo="Confirmar Exclusão"
      mensagem={`Tem certeza que deseja excluir ${item}?${detalhes ? ` ${detalhes}` : ''} Esta ação não pode ser desfeita.`}
      tipo="danger"
      loading={loading}
      textoConfirmar="Excluir"
      textoCancelar="Cancelar"
    />
  );
}