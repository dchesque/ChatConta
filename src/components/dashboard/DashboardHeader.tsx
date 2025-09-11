import { Calendar, Filter, Download, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardHeader() {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Home className="w-4 h-4" />
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-foreground">Dashboard</span>
      </div>

      {/* Header Principal */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do financeiro</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl shadow-sm">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">Out 18 - Nov 18</span>
          </div>
          
          <Button variant="outline" size="sm" className="h-10 px-4 border-border hover:bg-muted/50">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          
          <Button className="btn-gradient h-10 px-4" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
    </div>
  );
}