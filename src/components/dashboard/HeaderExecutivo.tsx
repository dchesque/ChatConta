import { Calendar, ChevronDown, Plus, FileBarChart, CreditCard, Settings, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

export function HeaderExecutivo() {
  const navigate = useNavigate();

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-4 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Home className="w-4 h-4" />
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900">Dashboard Executivo</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Título */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            Dashboard Executivo
          </h1>
          <p className="text-sm text-gray-600">
            Central de comando · Visão 360° da operação financeira
          </p>
        </div>
        
        {/* Controles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Seletor de Período */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/80 border-gray-300/50 hover:bg-gray-50/50">
                <Calendar className="w-4 h-4 mr-2" />
                Janeiro 2025
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-white/20">
              <DropdownMenuItem>Este mês</DropdownMenuItem>
              <DropdownMenuItem>Mês anterior</DropdownMenuItem>
              <DropdownMenuItem>Último trimestre</DropdownMenuItem>
              <DropdownMenuItem>Este ano</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dre')}
              className="bg-white/80 border-blue-300/50 text-blue-700 hover:bg-blue-50/50"
            >
              <FileBarChart className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Gerar DRE</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/conta-individual')}
              className="bg-white/80 border-red-300/50 text-red-700 hover:bg-red-50/50"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Nova Conta</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/cheques')}
              className="bg-white/80 border-purple-300/50 text-purple-700 hover:bg-purple-50/50"
            >
              <CreditCard className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Novo Cheque</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/configuracoes')}
              className="bg-white/80 border-gray-300/50 text-gray-700 hover:bg-gray-50/50"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}