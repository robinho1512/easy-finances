/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Transaction, CreditCard, BillReminder, Category } from "../types";
import { TrendingUp, CreditCard as CardIcon, Bell, DollarSign, Wallet } from "lucide-react";

interface MetricCardsProps {
  transactions: Transaction[];
  cards: CreditCard[];
  reminders: BillReminder[];
  categories: Category[];
}

export default function MetricCards({ transactions, cards, reminders, categories }: MetricCardsProps) {
  // 1. Total paid expenditures (cash, pix, debit, boleto + paid credit transactions)
  const totalPaidExpenses = transactions
    .filter((tx) => tx.isPaid)
    .reduce((sum, tx) => sum + tx.value, 0);

  // 2. Sum of current faturas of all cards
  const totalCardSpent = cards.reduce((sum, card) => sum + card.spent, 0);

  // 3. Sum of upcoming unpaid bills due
  const totalPendingBills = reminders
    .filter((rem) => !rem.isPaid)
    .reduce((sum, rem) => sum + rem.value, 0);

  // 4. Aggregated monthly budget vs actual spend
  const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
  const budgetRatio = totalBudget > 0 ? (totalPaidExpenses / totalBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Spent settled Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 rounded-xl">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full">
            Liquidado
          </span>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Gastos Liquidados</p>
        <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
          R$ {totalPaidExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
          Dinheiro, Débito, Pix e boletos pagos
        </p>
      </div>

      {/* Credit cards combined Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400 rounded-xl">
            <CardIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 px-2 py-0.5 rounded-full">
            {cards.length} Cartões
          </span>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Soma de Cartões</p>
        <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
          R$ {totalCardSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
          Gasto acumulado nas faturas abertas
        </p>
      </div>

      {/* Pending bills Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          {totalPendingBills > 0 ? (
            <span className="text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 rounded-full animate-bounce">
              A vencer
            </span>
          ) : (
            <span className="text-xs font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 px-2 py-0.5 rounded-full">
              Em dia
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Compromissos Pendentes</p>
        <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100 mt-1">
          R$ {totalPendingBills.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
          Boletos e vencimentos não finalizados
        </p>
      </div>

      {/* Global Limit Progress Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs text-neutral-500 font-semibold">
              Meta: R$ {totalBudget}
            </span>
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Utilização do Orçamento</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {budgetRatio.toFixed(0)}%
            </h3>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">usado</span>
          </div>
        </div>

        {/* Short inline progress tracker */}
        <div className="mt-4">
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(budgetRatio, 100)}%` }}
              className={`h-full transition-all duration-300 ${
                budgetRatio > 90
                  ? "bg-rose-500"
                  : budgetRatio > 70
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
