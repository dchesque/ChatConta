import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { BankWithAccounts, BANK_TYPE_LABELS } from '@/types/bank';

interface BanksListProps {
  banks: BankWithAccounts[];
  onEdit: (bank: BankWithAccounts) => void;
  onDelete: (bank: BankWithAccounts) => void;
  onAddAccount: (bank: BankWithAccounts) => void;
  onViewAccounts: (bank: BankWithAccounts) => void;
}

export function BanksList({ banks, onEdit, onDelete, onAddAccount, onViewAccounts }: BanksListProps) {
  if (banks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Nenhum banco cadastrado</p>
        <p className="text-sm text-gray-400">Adicione um banco para começar a gerenciar suas contas</p>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'banco':
        return 'bg-blue-100/80 text-blue-700 border-blue-200';
      case 'carteira':
        return 'bg-green-100/80 text-green-700 border-green-200';
      case 'corretora':
        return 'bg-purple-100/80 text-purple-700 border-purple-200';
      case 'cripto':
        return 'bg-orange-100/80 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100/80 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold text-center">Contas</TableHead>
            <TableHead className="font-semibold">Contas Vinculadas</TableHead>
            <TableHead className="font-semibold w-[180px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banks.map((bank) => (
            <TableRow key={bank.id} className="hover:bg-gray-50/50 transition-colors">
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold text-gray-900">{bank.name}</div>
                  <div className="text-xs text-gray-500">
                    Criado em {new Date(bank.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge className={`px-3 py-1 text-xs ${getTypeColor(bank.type)}`}>
                  {BANK_TYPE_LABELS[bank.type]}
                </Badge>
              </TableCell>
              
              <TableCell className="text-center">
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {bank.accounts.length}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {bank.accounts.length === 0 ? (
                    <span className="text-xs text-gray-400">Nenhuma conta</span>
                  ) : bank.accounts.length <= 2 ? (
                    bank.accounts.map((account, index) => (
                      <div key={account.id} className="text-xs text-gray-600">
                        {account.agency && account.account_number ? (
                          <span>Ag: {account.agency} - CC: {account.account_number}</span>
                        ) : account.pix_key ? (
                          <span>PIX: {account.pix_key}</span>
                        ) : (
                          <span>Conta {index + 1}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-600">
                      <div>Ag: {bank.accounts[0].agency} - CC: {bank.accounts[0].account_number}</div>
                      <div className="text-gray-400">+{bank.accounts.length - 1} outras</div>
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-1">
                  {/* Botões de ação diretos */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(bank)}
                    className="h-7 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    title="Editar banco"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddAccount(bank)}
                    className="h-7 px-2 text-gray-600 hover:text-green-600 hover:bg-green-50"
                    title="Adicionar conta"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  
                  {bank.accounts.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewAccounts(bank)}
                      className="h-7 px-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                      title="Ver contas"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(bank)}
                    className="h-7 px-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    title="Excluir banco"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  {/* Menu dropdown como alternativa */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-1">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-white/20">
                      <DropdownMenuItem onClick={() => onEdit(bank)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAddAccount(bank)} className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Conta
                      </DropdownMenuItem>
                      {bank.accounts.length > 0 && (
                        <DropdownMenuItem onClick={() => onViewAccounts(bank)} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Contas
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onDelete(bank)}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}