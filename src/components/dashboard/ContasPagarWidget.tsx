import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Calendar, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatarMoeda } from '@/lib/formatacaoBrasileira';
import { GLASSMORPHISM, ANIMATIONS } from '@/constants/designSystem';

interface ContasPagarSummary {
  totalPendente: number;
  totalVencidas: number;
  quantidadeVencidas: number;
  totalVencendoHoje: number;
  quantidadeVencendoHoje: number;
  totalProximos7Dias: number;
  quantidadeProximos7Dias: number;
}

interface ContasPagarWidgetProps {
  summary?: ContasPagarSummary;
  loading?: boolean;
  onViewAll?: () => void;
  onViewOverdue?: () => void;
  onViewDueToday?: () => void;
}

export function ContasPagarWidget({
  summary,
  loading = false,
  onViewAll,
  onViewOverdue,
  onViewDueToday
}: ContasPagarWidgetProps) {
  
  if (loading) {
    return (
      <Card className={`${GLASSMORPHISM.card} animate-pulse`}>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const defaultSummary: ContasPagarSummary = {
    totalPendente: 0,
    totalVencidas: 0,
    quantidadeVencidas: 0,
    totalVencendoHoje: 0,
    quantidadeVencendoHoje: 0,
    totalProximos7Dias: 0,
    quantidadeProximos7Dias: 0
  };

  const data = summary || defaultSummary;

  return (
    <Card className={`${GLASSMORPHISM.card} ${GLASSMORPHISM.cardHover} ${ANIMATIONS.smooth}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Contas a Pagar</span>
          </div>
          
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-muted-foreground hover:text-foreground"
            >
              Ver todas
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Total Pendente */}
        <div className="flex items-center justify-between p-3 bg-blue-50/80 rounded-lg border border-blue-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Total a Pagar</p>
              <p className="text-lg font-bold text-blue-700">
                {formatarMoeda(data.totalPendente)}
              </p>
            </div>
          </div>
        </div>

        {/* Vencidas - Destaque Vermelho */}
        {data.quantidadeVencidas > 0 && (
          <div 
            className="flex items-center justify-between p-3 bg-red-50/80 rounded-lg border border-red-200/50 cursor-pointer hover:bg-red-100/80 transition-colors"
            onClick={onViewOverdue}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-red-900">Vencidas</p>
                  <Badge variant="destructive" className="text-xs">
                    {data.quantidadeVencidas}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-red-700">
                  {formatarMoeda(data.totalVencidas)}
                </p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
        )}

        {/* Vencendo Hoje */}
        {data.quantidadeVencendoHoje > 0 && (
          <div 
            className="flex items-center justify-between p-3 bg-orange-50/80 rounded-lg border border-orange-200/50 cursor-pointer hover:bg-orange-100/80 transition-colors"
            onClick={onViewDueToday}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-orange-900">Vencendo Hoje</p>
                  <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                    {data.quantidadeVencendoHoje}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-orange-700">
                  {formatarMoeda(data.totalVencendoHoje)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Próximos 7 Dias */}
        {data.quantidadeProximos7Dias > 0 && (
          <div className="flex items-center justify-between p-3 bg-yellow-50/80 rounded-lg border border-yellow-200/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-yellow-900">Próximos 7 dias</p>
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                    {data.quantidadeProximos7Dias}
                  </Badge>
                </div>
                <p className="text-base font-semibold text-yellow-700">
                  {formatarMoeda(data.totalProximos7Dias)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {data.totalPendente === 0 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhuma conta pendente
            </p>
            <p className="text-xs text-green-600 font-medium">
              Parabéns! Você está em dia! 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}