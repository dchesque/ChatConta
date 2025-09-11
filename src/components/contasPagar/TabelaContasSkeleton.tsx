import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const TabelaContasSkeleton = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/50">
          {/* Header */}
          <thead className="bg-gray-50/80 backdrop-blur-sm">
            <tr>
              {['Status', 'Fornecedor', 'Vencimento', 'Valor Original', 'Valor Final', 'Ações'].map((_, i) => (
                <th key={i} className="px-6 py-4">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body */}
          <tbody className="bg-white/60 divide-y divide-gray-200/50">
            {Array.from({ length: 8 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {/* Status */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </td>
                
                {/* Fornecedor */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full mr-4" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </td>
                
                {/* Vencimento */}
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </td>
                
                {/* Valor Original */}
                <td className="px-6 py-4 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </td>
                
                {/* Valor Final */}
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </td>
                
                {/* Ações */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-1">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-8 w-8 rounded-lg" />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ContaCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>
          
          {/* Dados */}
          <div className="space-y-3 mb-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
          
          {/* Valor */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex space-x-2">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="flex-1 h-8 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};