import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsuarioAdmin } from '@/types/usuarioAdmin';
import { BadgeStatusAssinatura } from './BadgeStatusAssinatura';
import { formatarMoeda, formatarData } from '@/lib/formatacaoBrasileira';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Edit, 
  Eye, 
  MoreHorizontal,
  Mail,
  Phone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TabelaUsuariosProps {
  usuarios: UsuarioAdmin[];
  loading: boolean;
  onEditarUsuario: (usuario: UsuarioAdmin) => void;
}

export function TabelaUsuarios({ usuarios, loading, onEditarUsuario }: TabelaUsuariosProps) {
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle>Carregando usuários...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (usuarios.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou termos de busca.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle>Usuários do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{usuario.nome}</div>
                      <div className="text-sm text-gray-600">{usuario.email}</div>
                      {usuario.empresa && (
                        <div className="text-xs text-gray-500">{usuario.empresa}</div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-mono">{usuario.documento}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {usuario.tipo_pessoa.replace('_', ' ')}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {usuario.telefone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {usuario.telefone}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {usuario.cidade}, {usuario.estado}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium capitalize">{usuario.plano}</div>
                      {usuario.data_vencimento && (
                        <div className="text-xs text-gray-500">
                          Vence: {formatarData(usuario.data_vencimento)}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <BadgeStatusAssinatura status={usuario.status_assinatura} />
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium">
                      {formatarMoeda(usuario.valor_mensalidade)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {usuario.ultimo_acesso ? formatarData(usuario.ultimo_acesso) : 'Nunca'}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-white/20">
                        <DropdownMenuItem 
                          onClick={() => onEditarUsuario(usuario)}
                          className="cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar Usuário
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar Detalhes
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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