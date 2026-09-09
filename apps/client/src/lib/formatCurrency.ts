/**
 * Formats a number into Indian Rupee format with ₹ symbol
 * Example: 250000 -> ₹2,50,000
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats a number without ₹ symbol for input fields
 */
export function formatNumberIndian(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);
}

