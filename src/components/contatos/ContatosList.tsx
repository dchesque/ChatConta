import { Edit, Trash2, Eye, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatarData } from '@/lib/formatacaoBrasileira';

export interface ContatoListItem {
  id: string;
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  type: string;
  active: boolean;
  created_at: string;
  category?: {
    id: string;
    name: string;
    color: string;
    type: string;
  } | null;
}

interface ContatosListProps {
  contatos: ContatoListItem[];
  loading?: boolean;
  onEdit: (contato: ContatoListItem) => void;
  onDelete: (contato: ContatoListItem) => void;
  onView?: (contato: ContatoListItem) => void;
}

export function ContatosList({ contatos, loading, onEdit, onDelete, onView }: ContatosListProps) {
  if (loading) {
    return (
      <Card className="card-base">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contatos.length === 0) {
    return (
      <Card className="card-base">
        <CardContent className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum contato encontrado
          </h3>
          <p className="text-gray-500 mb-6">
            Crie seu primeiro contato para começar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTipoBadge = (type: string, active: boolean) => {
    const isCredor = type === 'supplier' || type === 'credor';
    return (
      <Badge 
        variant={active ? "default" : "secondary"}
        className={`${
          isCredor 
            ? 'bg-red-100/80 text-red-700 hover:bg-red-200/80' 
            : 'bg-green-100/80 text-green-700 hover:bg-green-200/80'
        } ${!active ? 'opacity-60' : ''}`}
      >
        {isCredor ? 'Credor' : 'Pagador'}
      </Badge>
    );
  };

  const getStatusBadge = (active: boolean) => {
    return (
      <Badge 
        variant={active ? "default" : "secondary"}
        className={active 
          ? 'bg-green-100/80 text-green-700 hover:bg-green-200/80' 
          : 'bg-red-100/80 text-red-700 hover:bg-red-200/80'
        }
      >
        {active ? 'Ativo' : 'Inativo'}
      </Badge>
    );
  };

  return (
    <Card className="card-base">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-200/50">
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold text-gray-900">Nome</TableHead>
                <TableHead className="font-semibold text-gray-900">Documento</TableHead>
                <TableHead className="font-semibold text-gray-900">Contato</TableHead>
                <TableHead className="font-semibold text-gray-900">Tipo</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Categoria</TableHead>
                <TableHead className="font-semibold text-gray-900">Criado em</TableHead>
                <TableHead className="w-32 font-semibold text-gray-900">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contatos.map((contato) => (
                <TableRow 
                  key={contato.id}
                  className="hover:bg-gray-50/50 transition-colors border-b border-gray-100/50"
                >
                  <TableCell>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      contato.type === 'supplier' || contato.type === 'credor'
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {contato.type === 'supplier' || contato.type === 'credor' ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {contato.name}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-gray-600 text-sm font-mono">
                      {contato.document || '-'}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {contato.email && (
                        <div className="text-sm text-gray-600">{contato.email}</div>
                      )}
                      {contato.phone && (
                        <div className="text-sm text-gray-600">{contato.phone}</div>
                      )}
                      {!contato.email && !contato.phone && (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getTipoBadge(contato.type, contato.active)}
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(contato.active)}
                  </TableCell>
                  
                  <TableCell>
                    {contato.category ? (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: contato.category.color }}
                        />
                        <span className="text-sm text-gray-700">
                          {contato.category.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sem categoria</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-gray-600 text-sm">
                      {formatarData(contato.created_at)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(contato)}
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(contato)}
                        className="h-8 w-8 p-0 hover:bg-orange-50"
                      >
                        <Edit className="w-4 h-4 text-orange-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(contato)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}