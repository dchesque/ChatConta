import { useState } from 'react';
import { Calendar, Repeat, Hash, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addDays, addWeeks, addMonths, addQuarters, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface RecorrenciaData {
  ativo: boolean;
  tipo: 'mensal' | 'quinzenal' | 'semanal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  quantidade_parcelas: number;
  data_inicio: string;
  valor_parcela: number;
}

interface RecorrenciaSectionProps {
  value: RecorrenciaData;
  onChange: (data: RecorrenciaData) => void;
  valorTotal: number;
  className?: string;
}

const INTERVALOS = {
  semanal: { label: 'Semanal', dias: 7, icone: '📅' },
  quinzenal: { label: 'Quinzenal', dias: 15, icone: '🗓️' },
  mensal: { label: 'Mensal', dias: 30, icone: '📆' },
  bimestral: { label: 'Bimestral', dias: 60, icone: '🗓️' },
  trimestral: { label: 'Trimestral', dias: 90, icone: '📊' },
  semestral: { label: 'Semestral', dias: 180, icone: '📈' },
  anual: { label: 'Anual', dias: 365, icone: '🗓️' }
};

export function RecorrenciaSection({ 
  value, 
  onChange, 
  valorTotal,
  className = "" 
}: RecorrenciaSectionProps) {
  
  const calcularDataFinal = () => {
    if (!value.ativo || !value.data_inicio || value.quantidade_parcelas <= 1) return null;
    
    const dataInicio = new Date(value.data_inicio);
    let dataFinal = new Date(dataInicio);
    
    for (let i = 1; i < value.quantidade_parcelas; i++) {
      switch (value.tipo) {
        case 'semanal':
          dataFinal = addWeeks(dataFinal, 1);
          break;
        case 'quinzenal':
          dataFinal = addDays(dataFinal, 15);
          break;
        case 'mensal':
          dataFinal = addMonths(dataFinal, 1);
          break;
        case 'bimestral':
          dataFinal = addMonths(dataFinal, 2);
          break;
        case 'trimestral':
          dataFinal = addQuarters(dataFinal, 1);
          break;
        case 'semestral':
          dataFinal = addMonths(dataFinal, 6);
          break;
        case 'anual':
          dataFinal = addYears(dataFinal, 1);
          break;
      }
    }
    
    return dataFinal;
  };

  const gerarPreviewParcelas = () => {
    if (!value.ativo || value.quantidade_parcelas <= 1) return [];
    
    const parcelas = [];
    let dataAtual = new Date(value.data_inicio);
    
    for (let i = 0; i < Math.min(value.quantidade_parcelas, 5); i++) {
      parcelas.push({
        numero: i + 1,
        data: new Date(dataAtual),
        valor: value.valor_parcela
      });
      
      switch (value.tipo) {
        case 'semanal':
          dataAtual = addWeeks(dataAtual, 1);
          break;
        case 'quinzenal':
          dataAtual = addDays(dataAtual, 15);
          break;
        case 'mensal':
          dataAtual = addMonths(dataAtual, 1);
          break;
        case 'bimestral':
          dataAtual = addMonths(dataAtual, 2);
          break;
        case 'trimestral':
          dataAtual = addQuarters(dataAtual, 1);
          break;
        case 'semestral':
          dataAtual = addMonths(dataAtual, 6);
          break;
        case 'anual':
          dataAtual = addYears(dataAtual, 1);
          break;
      }
    }
    
    return parcelas;
  };

  const handleSwitchChange = (ativo: boolean) => {
    onChange({
      ...value,
      ativo,
      valor_parcela: ativo ? valorTotal : 0 // Cada parcela mantém o valor total
    });
  };

  const handleQuantidadeChange = (quantidade: number) => {
    onChange({
      ...value,
      quantidade_parcelas: quantidade,
      valor_parcela: valorTotal // Cada parcela mantém o valor total, não dividido
    });
  };

  const previewParcelas = gerarPreviewParcelas();
  const dataFinal = calcularDataFinal();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header da Seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Repeat className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Recorrência</h2>
        </div>
        
        <Switch
          checked={value.ativo}
          onCheckedChange={handleSwitchChange}
        />
      </div>

      {value.ativo && (
        <div className="space-y-6">
          {/* Tipo de Recorrência */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Frequência <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={value.tipo} 
                onValueChange={(tipo: any) => onChange({ ...value, tipo })}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-gray-300/50">
                  <SelectValue placeholder="Selecionar frequência" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  {Object.entries(INTERVALOS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <span>{config.icone}</span>
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Número de Parcelas <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="2"
                max="60"
                value={value.quantidade_parcelas}
                onChange={(e) => handleQuantidadeChange(Number(e.target.value))}
                className="bg-white/80 backdrop-blur-sm border-gray-300/50"
              />
            </div>
          </div>

          {/* Data de Início */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Data de Início <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={value.data_inicio}
              onChange={(e) => onChange({ ...value, data_inicio: e.target.value })}
              className="bg-white/80 backdrop-blur-sm border-gray-300/50"
            />
          </div>

          {/* Resumo */}
          <Card className="p-4 bg-blue-50/80 border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Resumo da Recorrência</span>
              </div>
              
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                 <div>
                   <span className="text-blue-600">Valor por parcela:</span>
                   <div className="font-medium text-blue-900">
                     R$ {value.valor_parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </div>
                 </div>
                 
                 <div>
                   <span className="text-blue-600">Total de parcelas:</span>
                   <div className="font-medium text-blue-900">{value.quantidade_parcelas}x</div>
                 </div>
                 
                 <div>
                   <span className="text-blue-600">Frequência:</span>
                   <div className="font-medium text-blue-900">{INTERVALOS[value.tipo].label}</div>
                 </div>
                 
                 {dataFinal && (
                   <div>
                     <span className="text-blue-600">Última parcela:</span>
                     <div className="font-medium text-blue-900">
                       {format(dataFinal, 'dd/MM/yyyy', { locale: ptBR })}
                     </div>
                   </div>
                 )}
               </div>
               
               {/* Mostra valor total da recorrência */}
               <div className="mt-3 p-3 bg-blue-100/50 rounded-lg border border-blue-300">
                 <div className="flex justify-between items-center">
                   <span className="font-medium text-blue-700">Valor Total da Recorrência:</span>
                   <span className="font-bold text-blue-900 text-lg">
                     R$ {(value.valor_parcela * value.quantidade_parcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </span>
                 </div>
                 <p className="text-xs text-blue-600 mt-1">
                   {value.quantidade_parcelas} parcelas de R$ {value.valor_parcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada
                 </p>
               </div>
            </div>
          </Card>

          {/* Preview das Primeiras Parcelas */}
          {previewParcelas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">Preview das Parcelas</span>
                {value.quantidade_parcelas > 5 && (
                  <Badge variant="outline">Mostrando 5 de {value.quantidade_parcelas}</Badge>
                )}
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {previewParcelas.map((parcela) => (
                  <div 
                    key={parcela.numero}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{parcela.numero}/{value.quantidade_parcelas}</Badge>
                      <span className="text-sm text-gray-600">
                        {format(parcela.data, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                    <span className="font-medium">
                      R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}