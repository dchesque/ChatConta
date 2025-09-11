import React, { useState } from 'react';
import { Search, Calendar, User, Tag, ChevronDown, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MonthPickerFilter } from '@/components/ui/MonthPickerFilter';
import { FiltrosContasPagar, EstatisticasContasPagar } from '@/hooks/useContasPagarOtimizado';

interface FiltrosInteligentesProps {
  filtros: FiltrosContasPagar;
  setFiltros: (filtros: FiltrosContasPagar) => void;
  filtroRapido: string;
  setFiltroRapido: (filtro: string) => void;
  fornecedores: Array<{ id: string; name: string }>;
  categorias: Array<{ id: string; name: string; color?: string }>;
  estatisticas: EstatisticasContasPagar;
  onLimparFiltros: () => void;
  onVoltarMesAtual?: () => void;
}

export function FiltrosInteligentes({
  filtros,
  setFiltros,
  filtroRapido,
  setFiltroRapido,
  fornecedores,
  categorias,
  estatisticas,
  onLimparFiltros,
  onVoltarMesAtual
}: FiltrosInteligentesProps) {
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false);

  // Badges de filtros rápidos com estatísticas
  const filtrosRapidos = [
    {
      id: 'todos',
      label: 'Todos',
      count: estatisticas.total,
      className: 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
    },
    {
      id: 'pendente',
      label: 'Pendentes',
      count: estatisticas.pendentes,
      className: 'bg-yellow-100/80 text-yellow-700 hover:bg-yellow-200/80'
    },
    {
      id: 'vencendo',
      label: 'Vencendo (7 dias)',
      count: estatisticas.vencendoProximo,
      className: 'bg-orange-100/80 text-orange-700 hover:bg-orange-200/80'
    },
    {
      id: 'vencido',
      label: 'Vencidas',
      count: estatisticas.vencidas,
      className: 'bg-red-100/80 text-red-700 hover:bg-red-200/80'
    },
    {
      id: 'pago',
      label: 'Pagas',
      count: estatisticas.pagas,
      className: 'bg-green-100/80 text-green-700 hover:bg-green-200/80'
    }
  ];

  const handleFiltroRapido = (novoFiltro: string) => {
    setFiltroRapido(novoFiltro);
    
    const novosFiltros = { ...filtros };
    
    if (novoFiltro === 'todos') {
      novosFiltros.status = 'todos';
      novosFiltros.vencendo_em = '';
    } else if (novoFiltro === 'vencendo') {
      novosFiltros.status = 'pendente';
      novosFiltros.vencendo_em = '7';
    } else if (novoFiltro === 'vencido') {
      novosFiltros.status = 'vencido';
      novosFiltros.vencendo_em = '';
    } else if (novoFiltro === 'pago') {
      novosFiltros.status = 'pago';
      novosFiltros.vencendo_em = '';
    } else {
      novosFiltros.status = novoFiltro as 'pendente' | 'pago' | 'vencido';
      novosFiltros.vencendo_em = '';
    }
    
    setFiltros(novosFiltros);
  };



  // Verificar se há filtros ativos além dos filtros rápidos
  const temFiltrosAtivos = Object.entries(filtros).some(([key, value]) => {
    if (key === 'status' || key === 'vencendo_em') return false;
    return value !== '';
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-6 space-y-6">
      {/* Filtros Rápidos */}
      <div className="flex flex-wrap gap-2">
        {filtrosRapidos.map((filtro) => (
          <Button
            key={filtro.id}
            variant={filtroRapido === filtro.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleFiltroRapido(filtro.id)}
            className={`flex items-center space-x-2 transition-all duration-200 ${
              filtroRapido === filtro.id 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : filtro.className
            }`}
          >
            <span>{filtro.label}</span>
            <Badge variant="secondary" className="ml-1 bg-white/20 text-current">
              {filtro.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Filtros Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar contas..."
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            className="pl-10 input-base"
          />
        </div>

        {/* Mês de Referência */}
        <MonthPickerFilter
          value={filtros.mes_referencia}
          onChange={(value) => setFiltros({ 
            ...filtros, 
            mes_referencia: value,
            data_inicio: value ? '' : filtros.data_inicio,
            data_fim: value ? '' : filtros.data_fim
          })}
          placeholder="Selecionar mês"
          className="input-base"
        />

        {/* Credor */}
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Select
            value={filtros.fornecedor_id}
            onValueChange={(value) => setFiltros({ ...filtros, fornecedor_id: value === 'todos' ? '' : value })}
          >
            <SelectTrigger className="input-base pl-10">
              <SelectValue placeholder="Credor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os credores</SelectItem>
              {fornecedores.map((fornecedor) => (
                <SelectItem key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Select
            value={filtros.categoria_id}
            onValueChange={(value) => setFiltros({ ...filtros, categoria_id: value === 'todos' ? '' : value })}
          >
            <SelectTrigger className="input-base pl-10">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  <div className="flex items-center gap-2">
                    {categoria.color && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: categoria.color }}
                      />
                    )}
                    {categoria.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros Avançados */}
      <Collapsible open={filtrosAvancadosAbertos} onOpenChange={setFiltrosAvancadosAbertos}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtros Avançados</span>
              {temFiltrosAtivos && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Ativos
                </Badge>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${filtrosAvancadosAbertos ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Data de Vencimento - Início */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data de Vencimento - Início</label>
              <Input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                className="input-base"
              />
            </div>

            {/* Data de Vencimento - Fim */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Data de Vencimento - Fim</label>
              <Input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                className="input-base"
              />
            </div>

            {/* Valor Mínimo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor Mínimo</label>
              <Input
                type="text"
                placeholder="R$ 0,00"
                value={filtros.valor_min}
                onChange={(e) => setFiltros({ ...filtros, valor_min: e.target.value })}
                className="input-base"
              />
            </div>

            {/* Valor Máximo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Valor Máximo</label>
              <Input
                type="text"
                placeholder="R$ 0,00"
                value={filtros.valor_max}
                onChange={(e) => setFiltros({ ...filtros, valor_max: e.target.value })}
                className="input-base"
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Botões de Ação */}
      {(temFiltrosAtivos || onVoltarMesAtual) && (
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          {onVoltarMesAtual && (
            <Button
              variant="outline"
              size="sm"
              onClick={onVoltarMesAtual}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Mês Atual
            </Button>
          )}
          {temFiltrosAtivos && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLimparFiltros}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}