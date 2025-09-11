import React, { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ContaEnriquecida } from '@/types/contaPagar';
import ContaCard from './ContaCard';

interface TabelaContasVirtualizadaProps {
  contas: ContaEnriquecida[];
  height: number;
  onEditar: (conta: ContaEnriquecida) => void;
  onBaixar: (conta: ContaEnriquecida) => void;
  onVisualizar: (conta: ContaEnriquecida) => void;
  onDuplicar: (conta: ContaEnriquecida) => void;
  onExcluir: (conta: ContaEnriquecida) => void;
}

const ItemConta = memo(({ index, style, data }: any) => {
  const { contas, onEditar, onBaixar, onVisualizar, onDuplicar, onExcluir } = data;
  const conta = contas[index];

  return (
    <div style={style} className="p-2">
      <ContaCard
        conta={conta}
        onEditar={() => onEditar(conta)}
        onBaixar={() => onBaixar(conta)}
        onVisualizar={() => onVisualizar(conta)}
        onDuplicar={() => onDuplicar(conta)}
        onExcluir={() => onExcluir(conta)}
      />
    </div>
  );
});

ItemConta.displayName = 'ItemConta';

export const TabelaContasVirtualizada: React.FC<TabelaContasVirtualizadaProps> = ({
  contas,
  height,
  onEditar,
  onBaixar,
  onVisualizar,
  onDuplicar,
  onExcluir
}) => {
  return (
    <List
      height={height}
      width="100%"
      itemCount={contas.length}
      itemSize={200} // Altura de cada card
      itemData={{
        contas,
        onEditar,
        onBaixar,
        onVisualizar,
        onDuplicar,
        onExcluir
      }}
    >
      {ItemConta}
    </List>
  );
};