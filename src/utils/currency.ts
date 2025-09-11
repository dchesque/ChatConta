export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' 
    ? parseFloat(value.replace(/\D/g, '')) / 100 
    : value;
    
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/\D/g, '')) / 100;
};