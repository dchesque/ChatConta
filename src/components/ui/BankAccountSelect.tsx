import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { formatarMoeda } from '@/lib/formatacaoBrasileira';

interface BankAccount {
  id: string;
  account_number: string;
  agency: string;
  bank_name: string;
  current_balance: number;
  type: string;
}

interface BankAccountSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  accounts: BankAccount[];
  placeholder?: string;
  disabled?: boolean;
  showBalance?: boolean;
}

export function BankAccountSelect({
  value,
  onValueChange,
  accounts,
  placeholder = "Selecione uma conta",
  disabled = false,
  showBalance = true
}: BankAccountSelectProps) {
  
  // Agrupar contas por banco
  const accountsByBank = accounts.reduce((acc, account) => {
    if (!acc[account.bank_name]) {
      acc[account.bank_name] = [];
    }
    acc[account.bank_name].push(account);
    return acc;
  }, {} as Record<string, BankAccount[]>);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="z-50 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
        {Object.entries(accountsByBank).map(([bankName, bankAccounts]) => (
          <div key={bankName}>
            {/* Header do banco */}
            <div className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-50/80 border-b border-gray-200/50">
              {bankName}
            </div>
            
            {/* Contas do banco */}
            {bankAccounts.map((account) => (
              <SelectItem 
                key={account.id} 
                value={account.id}
                className="pl-6 hover:bg-blue-50/80 focus:bg-blue-50/80"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      Ag. {account.agency} - C.C. {account.account_number}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {account.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {showBalance && (
                    <div className="ml-4 text-right">
                      <span className={`text-sm font-medium ${
                        account.current_balance >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatarMoeda(account.current_balance)}
                      </span>
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </div>
        ))}
        
        {accounts.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500 text-center">
            Nenhuma conta bancária encontrada
          </div>
        )}
      </SelectContent>
    </Select>
  );
}