import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency to show dollars and cents
export function formatCurrency(amount: number): string {
  return amount.toFixed(2);
}

// Format date for receipt display
export function formatReceiptDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }) + ' ' + date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Generate a random transaction number for receipts
export function generateTransactionNumber(): string {
  const numbers = [];
  for (let i = 0; i < 6; i++) {
    numbers.push(Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  }
  return numbers.join(' ');
}

// Calculate subtotal from items
export function calculateSubtotal(items: Array<{ price: string; quantity: string }>): number {
  return items.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * parseInt(item.quantity));
  }, 0);
}

// Calculate tax amount
export function calculateTax(subtotal: number, taxRate: string): number {
  return subtotal * (parseFloat(taxRate) / 100);
}

// Calculate total
export function calculateTotal(subtotal: number, taxAmount: number): number {
  return subtotal + taxAmount;
}
