/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CreditCard {
  id: string;
  name: string; // Nome do cartão, ex: Nubank Roxinho
  lastFour: string; // Últimos 4 dígitos
  limit: number; // Limite total
  spent: number; // Valor gasto na fatura atual
  dueDate: number; // Dia de vencimento (1-31)
  closingDate: number; // Dia de fechamento (1-31)
  network: "visa" | "mastercard" | "elo" | "amex"; // Bandeira
  color: string; // Gradiente do cartão (Tailwind classes)
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hexadecimal or tailwind classes
  icon: string; // Lucide icon name
  budget?: number; // Limite mensal orçamentário
}

export type TransactionType = "Crédito" | "Débito" | "Pix" | "Boleto" | "Dinheiro";

export interface Transaction {
  id: string;
  description: string;
  value: number;
  date: string; // YYYY-MM-DD
  category: string; // Nome ou ID da categoria
  cardId?: string; // ID do cartão se for crédito
  type: TransactionType;
  isPaid: boolean;
}

export interface BillReminder {
  id: string;
  title: string;
  value: number;
  dueDate: string; // YYYY-MM-DD
  category: string;
  isPaid: boolean;
  notified: boolean;
  autoDebit: boolean;
}

export interface BankIntegration {
  id: string;
  bankName: string; // Nubank, Itaú, Bradesco, etc.
  connected: boolean;
  lastSync?: string;
  accountEnding?: string;
  type: "OpenFinance" | "API";
}

export interface UserSettings {
  darkMode: boolean;
  biometricEnabled: boolean;
  pushNotificationsEnabled: boolean;
  syncOnStartup: boolean;
}
