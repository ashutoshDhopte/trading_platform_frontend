
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

export function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && value.trim() !== '';
}