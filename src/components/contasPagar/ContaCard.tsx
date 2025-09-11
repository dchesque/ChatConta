import { Eye, Edit, MoreVertical, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ContaPagar } from '@/types/contaPagar';
import { Fornecedor } from '@/types/fornecedor';
import { PlanoContas } from '@/types/planoContas';
import { formatarMoeda, formatarData, getClasseValorMonetario } from '@/utils/formatters';

interface ContaCardProps {
  conta: ContaPagar & {
    fornecedor: Fornecedor;
    plano_conta: PlanoContas;
    dias_para_vencimento?: number;
    dias_em_atraso?: number;
  };
  onVisualizar: (conta: any) => void;
  onEditar: (conta: any) => void;
  onBaixar: (conta: any) => void;
  onDuplicar: (conta: any) => void;
  onExcluir: (conta: any) => void;
}

export default function ContaCard({ 
  conta, 
  onVisualizar, 
  onEditar, 
  onBaixar, 
  onDuplicar, 
  onExcluir 
}: ContaCardProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      pendente: {
        color: 'bg-yellow-100/80 text-yellow-700',
        dot: 'bg-yellow-600',
        label: 'Pendente',
        icon: Clock
      },
      pago: {
        color: 'bg-green-100/80 text-green-700',
        dot: 'bg-green-600',
        label: 'Pago',
        icon: CheckCircle
      },
      vencido: {
        color: 'bg-red-100/80 text-red-700',
        dot: 'bg-red-600',
        label: 'Vencido',
        icon: AlertTriangle
      },
      cancelado: {
        color: 'bg-gray-100/80 text-gray-700',
        dot: 'bg-gray-600',
        label: 'Cancelado',
        icon: Clock
      }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const getVencimentoIndicator = () => {
    if (conta.status === 'pago') return null;
    
    if (conta.dias_em_atraso && conta.dias_em_atraso > 0) {
      return (
        <span className="text-xs bg-red-100/80 text-red-700 px-2 py-1 rounded-full">
          {conta.dias_em_atraso} dias em atraso
        </span>
      );
    }
    
    if (conta.dias_para_vencimento === 0) {
      return (
        <span className="text-xs bg-yellow-100/80 text-yellow-700 px-2 py-1 rounded-full">
          HOJE
        </span>
      );
    }
    
    if (conta.dias_para_vencimento && conta.dias_para_vencimento <= 7) {
      return (
        <span className="text-xs bg-blue-100/80 text-blue-700 px-2 py-1 rounded-full">
          {conta.dias_para_vencimento} dias
        </span>
      );
    }
    
    return null;
  };

  const statusConfig = getStatusConfig(conta.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90">
      <CardContent className="p-6">
        {/* Header com status e DDA */}
        <div className="flex justify-between items-start mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dot}`}></div>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </div>
          {conta.dda && (
            <span className="text-xs bg-purple-100/80 text-purple-700 px-2 py-1 rounded-full">
              DDA
            </span>
          )}
        </div>

        {/* Credor */}
        <h3 className="font-semibold text-gray-900 mb-1">{conta.fornecedor.nome}</h3>
        <p className="text-xs text-gray-500 mb-3">
          {conta.fornecedor.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
        </p>

        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{conta.descricao}</p>
        
        {/* Documento */}
        {conta.documento_referencia && (
          <p className="text-xs text-gray-500 mb-3">Doc: {conta.documento_referencia}</p>
        )}

        {/* Categoria */}
        <div className="text-xs text-gray-600 mb-4">
          <span className="font-mono">{conta.plano_conta.codigo}</span> - {conta.plano_conta.nome}
        </div>

        {/* Valores */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600 text-sm">Valor:</span>
            <span className={`font-semibold ${getClasseValorMonetario(conta.valor_final)}`}>{formatarMoeda(conta.valor_final)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Vencimento:</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{formatarData(conta.data_vencimento)}</span>
              {getVencimentoIndicator()}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex space-x-2 pt-4 border-t border-gray-200/50">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onVisualizar(conta)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditar(conta)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl">
              {conta.status === 'pendente' && (
                <DropdownMenuItem onClick={() => onBaixar(conta)}>
                  💰 Baixar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicar(conta)}>
                📋 Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onExcluir(conta)}
                className="text-red-600"
              >
                🗑️ Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}