import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Plus, CreditCard } from 'lucide-react';
import { BankWithAccounts, BANK_TYPE_LABELS } from '@/types/bank';

interface BankCardProps {
  bank: BankWithAccounts;
  onEdit: (bank: BankWithAccounts) => void;
  onDelete: (bank: BankWithAccounts) => void;
  onAddAccount: (bank: BankWithAccounts) => void;
  onViewAccounts: (bank: BankWithAccounts) => void;
}

export function BankCard({ bank, onEdit, onDelete, onAddAccount, onViewAccounts }: BankCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'banco':
        return 'bg-blue-100/80 text-blue-700';
      case 'carteira':
        return 'bg-green-100/80 text-green-700';
      case 'corretora':
        return 'bg-purple-100/80 text-purple-700';
      case 'cripto':
        return 'bg-orange-100/80 text-orange-700';
      default:
        return 'bg-gray-100/80 text-gray-700';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 text-lg">{bank.name}</h3>
          <Badge className={`px-3 py-1 text-xs ${getTypeColor(bank.type)}`}>
            {BANK_TYPE_LABELS[bank.type]}
          </Badge>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border border-white/20">
            <DropdownMenuItem onClick={() => onEdit(bank)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddAccount(bank)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewAccounts(bank)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Ver Contas ({bank.accounts.length})
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(bank)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Contas:</span>
            <span className="font-medium text-gray-900">
              {bank.accounts.length}
            </span>
          </div>
        </div>

        {bank.accounts.length > 0 && (
          <div className="pt-2 border-t border-gray-200/50">
            <p className="text-xs text-gray-500 mb-2">Contas vinculadas:</p>
            <div className="space-y-1">
              {bank.accounts.slice(0, 2).map(account => (
                <div key={account.id} className="text-xs text-gray-600">
                  {account.agency && account.account_number 
                    ? `Ag: ${account.agency} | CC: ${account.account_number}`
                    : account.pix_key 
                    ? `PIX: ${account.pix_key}`
                    : 'Dados da conta'}
                </div>
              ))}
              {bank.accounts.length > 2 && (
                <p className="text-xs text-gray-400">
                  +{bank.accounts.length - 2} mais
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}