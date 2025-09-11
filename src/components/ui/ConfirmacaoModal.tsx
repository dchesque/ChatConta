import React from 'react';
import { Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { ModalPremium } from './ModalPremium';
import { Button } from './button';
import { ButtonLoading } from './ButtonLoading';

interface ConfirmacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensagem: string;
  tipo?: 'info' | 'warning' | 'danger';
  loading?: boolean;
  textoConfirmar?: string;
  textoCancelar?: string;
}

export function ConfirmacaoModal({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensagem,
  tipo = 'info',
  loading = false,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar'
}: ConfirmacaoModalProps) {
  const icones = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-orange-500" />,
    danger: <AlertCircle className="w-6 h-6 text-red-500" />
  };

  const coresBotao = {
    info: 'default' as const,
    warning: 'default' as const,
    danger: 'destructive' as const
  };

  const coresIcone = {
    info: 'bg-blue-100/80',
    warning: 'bg-orange-100/80',
    danger: 'bg-red-100/80'
  };

  return (
    <ModalPremium
      isOpen={isOpen}
      onClose={onClose}
      title={titulo}
      icon={icones[tipo]}
      size="md"
      loading={loading}
      className="z-[9999]"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {textoCancelar}
          </Button>
          <ButtonLoading
            variant={coresBotao[tipo]}
            onClick={onConfirm}
            loading={loading}
            loadingText="Processando..."
          >
            {textoConfirmar}
          </ButtonLoading>
        </div>
      }
    >
      <div className="text-center py-4">
        <div className={`mx-auto mb-4 w-16 h-16 ${coresIcone[tipo]} rounded-full flex items-center justify-center`}>
          {icones[tipo]}
        </div>
        
        <p className="text-gray-700 text-base leading-relaxed">
          {mensagem}
        </p>
      </div>
    </ModalPremium>
  );
}