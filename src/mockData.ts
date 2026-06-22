/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreditCard, Category, Transaction, BillReminder, BankIntegration } from "./types";

// Helper to get relative dates based on current time
const getOffsetDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
};

export const defaultCards: CreditCard[] = [
  {
    id: "card-1",
    name: "Nubank Ultra",
    lastFour: "4829",
    limit: 12000,
    spent: 2478.5,
    dueDate: 10,
    closingDate: 3,
    network: "mastercard",
    color: "from-[#8A05BE] to-[#510472]",
  },
  {
    id: "card-2",
    name: "Itaú Platinum",
    lastFour: "9312",
    limit: 25000,
    spent: 1240.0,
    dueDate: 15,
    closingDate: 8,
    network: "visa",
    color: "from-[#EC7000] to-[#A33D00]",
  },
  {
    id: "card-3",
    name: "Inter Black",
    lastFour: "0540",
    limit: 15000,
    spent: 600.0,
    dueDate: 25,
    closingDate: 18,
    network: "mastercard",
    color: "from-neutral-800 to-neutral-950",
  }
];

export const defaultCategories: Category[] = [
  { id: "cat-1", name: "Alimentação", color: "#EC6E34", icon: "Utensils", budget: 800 },
  { id: "cat-2", name: "Transporte", color: "#3B82F6", icon: "Car", budget: 400 },
  { id: "cat-3", name: "Lazer", color: "#8B5CF6", icon: "Gamepad", budget: 600 },
  { id: "cat-4", name: "Moradia", color: "#10B981", icon: "Home", budget: 2500 },
  { id: "cat-5", name: "Saúde", color: "#F43F5E", icon: "Heart", budget: 300 },
  { id: "cat-6", name: "Mercado", color: "#F59E0B", icon: "ShoppingBag", budget: 1000 },
  { id: "cat-7", name: "Outros", color: "#64748B", icon: "Percent", budget: 500 }
];

export const defaultTransactions: Transaction[] = [
  {
    id: "tx-1",
    description: "Supermercado Carrefour",
    value: 345.8,
    date: getOffsetDate(1),
    category: "Mercado",
    type: "Débito",
    isPaid: true
  },
  {
    id: "tx-2",
    description: "Uber Corrida",
    value: 24.5,
    date: getOffsetDate(0), // Hoje
    category: "Transporte",
    cardId: "card-1",
    type: "Crédito",
    isPaid: true
  },
  {
    id: "tx-3",
    description: "Almoço Executivo",
    value: 68.0,
    date: getOffsetDate(2),
    category: "Alimentação",
    type: "Pix",
    isPaid: true
  },
  {
    id: "tx-4",
    description: "Mensalidade Netflix",
    value: 55.9,
    date: getOffsetDate(5),
    category: "Lazer",
    cardId: "card-1",
    type: "Crédito",
    isPaid: true
  },
  {
    id: "tx-5",
    description: "Combustível Posto Ipiranga",
    value: 150.0,
    date: getOffsetDate(3),
    category: "Transporte",
    cardId: "card-2",
    type: "Crédito",
    isPaid: true
  },
  {
    id: "tx-6",
    description: "Aluguel Apartamento",
    value: 1800.0,
    date: getOffsetDate(10),
    category: "Moradia",
    type: "Pix",
    isPaid: true
  },
  {
    id: "tx-7",
    description: "Farmácia Pague Menos",
    value: 84.6,
    date: getOffsetDate(8),
    category: "Saúde",
    cardId: "card-1",
    type: "Crédito",
    isPaid: true
  },
  {
    id: "tx-8",
    description: "Cinemark Pipoca",
    value: 72.0,
    date: getOffsetDate(12),
    category: "Lazer",
    cardId: "card-3",
    type: "Crédito",
    isPaid: true
  },
  {
    id: "tx-9",
    description: "Luz Enel Distribuidora",
    value: 234.15,
    date: getOffsetDate(6),
    category: "Moradia",
    type: "Boleto",
    isPaid: true
  },
  {
    id: "tx-10",
    description: "Compra Sushi Delivery",
    value: 120.0,
    date: getOffsetDate(4),
    category: "Alimentação",
    type: "Pix",
    isPaid: true
  }
];

export const defaultReminders: BillReminder[] = [
  {
    id: "rem-1",
    title: "Internet Virtua",
    value: 129.9,
    dueDate: getOffsetDate(-4), // Vence em 4 dias
    category: "Moradia",
    isPaid: false,
    notified: false,
    autoDebit: true
  },
  {
    id: "rem-2",
    title: "Plano de Saúde Unimed",
    value: 450.0,
    dueDate: getOffsetDate(-2), // Vence em 2 dias
    category: "Saúde",
    isPaid: false,
    notified: false,
    autoDebit: false
  },
  {
    id: "rem-3",
    title: "Academia SmartFit",
    value: 119.9,
    dueDate: getOffsetDate(-8), // Vence em 8 dias
    category: "Lazer",
    isPaid: false,
    notified: false,
    autoDebit: true
  },
  {
    id: "rem-4",
    title: "Condomínio Alvorada",
    value: 380.0,
    dueDate: getOffsetDate(3), // Já venceu a 3 dias ou venceu recentemente
    category: "Moradia",
    isPaid: true,
    notified: true,
    autoDebit: false
  }
];

export const defaultBanks: BankIntegration[] = [
  { id: "bank-1", bankName: "Nubank", connected: false, type: "OpenFinance" },
  { id: "bank-2", bankName: "Itaú", connected: false, type: "OpenFinance" },
  { id: "bank-3", bankName: "Bradesco", connected: false, type: "OpenFinance" },
  { id: "bank-4", bankName: "Banco Inter", connected: false, type: "OpenFinance" },
  { id: "bank-5", bankName: "Santander", connected: false, type: "OpenFinance" },
];
