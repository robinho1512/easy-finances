/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Transaction, BillReminder, Category } from "../types";
import { Pin, Plus, Sparkles, Smartphone, Landmark, LayoutGrid, Calendar, Wallet } from "lucide-react";

interface WidgetsModuleProps {
  transactions: Transaction[];
  reminders: BillReminder[];
  categories: Category[];
  onQuickLaunchTransaction: (preset: { desc: string; value: number; cat: string; type: any }) => void;
}

export default function WidgetsModule({
  transactions,
  reminders,
  categories,
  onQuickLaunchTransaction,
}: WidgetsModuleProps) {
  
  const upcomingBills = reminders.filter((r) => !r.isPaid).slice(0, 2);
  const totalPaid = transactions.filter((t) => t.isPaid).reduce((sum, t) => sum + t.value, 0);
  const totalBudget = categories.reduce((sum, c) => sum + (c.budget || 0), 0);
  const budgetPercentage = totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm space-y-5">
      <div>
        <h3 className="font-semibold text-neutral-850 dark:text-neutral-100 text-lg flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-500" />
          Central de Widgets Interativos
        </h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Simule a visualização e controle rápido do seu app diretamente na HomeScreen do celular.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Widget 1: Micro Balance & Limits */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between aspect-square max-w-[220px] mx-auto w-full">
          {/* Reflection ring */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold tracking-wide flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 opacity-80" />
              Finanças Widget
            </span>
            <Pin className="w-3.5 h-3.5 opacity-80 rotate-45" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Gasto Consolidado</span>
            <h4 className="text-xl font-bold">R$ {totalPaid.toFixed(0)}</h4>
            <div className="w-full bg-white/25 h-1 rounded-full overflow-hidden">
              <div style={{ width: `${Math.min(budgetPercentage, 100)}%` }} className="h-full bg-emerald-400" />
            </div>
            <span className="text-[9px] opacity-90 block">Utilizado {budgetPercentage.toFixed(0)}% do teto</span>
          </div>
        </div>

        {/* Widget 2: Rapid Transaction Add PRESSETS */}
        <div className="bg-neutral-50 dark:bg-neutral-850/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between aspect-square max-w-[220px] mx-auto w-full">
          <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 font-semibold mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Acesso Rápido
            </span>
            <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded text-indigo-500">Lançador</span>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-center">
            <button
              onClick={() => onQuickLaunchTransaction({ desc: "Café Expresso", value: 8.5, cat: "Alimentação", type: "Pix" })}
              className="w-full bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-850 text-left px-2.5 py-1 rounded-xl text-[10px] font-bold text-neutral-700 dark:text-neutral-200 shadow-xs flex justify-between cursor-pointer"
            >
              <span>+ Café da Manhã</span>
              <span className="text-indigo-500">R$ 8,50</span>
            </button>
            <button
              onClick={() => onQuickLaunchTransaction({ desc: "Recarga Bilhete", value: 20.0, cat: "Transporte", type: "Débito" })}
              className="w-full bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-850 text-left px-2.5 py-1 rounded-xl text-[10px] font-bold text-neutral-700 dark:text-neutral-200 shadow-xs flex justify-between cursor-pointer"
            >
              <span>+ Bilhete Único</span>
              <span className="text-indigo-500">R$ 20,00</span>
            </button>
            <button
              onClick={() => onQuickLaunchTransaction({ desc: "Salgado com Refri", value: 16.0, cat: "Alimentação", type: "Pix" })}
              className="w-full bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-850 text-left px-2.5 py-1 rounded-xl text-[10px] font-bold text-neutral-700 dark:text-neutral-200 shadow-xs flex justify-between cursor-pointer"
            >
              <span>+ Lanchonete</span>
              <span className="text-indigo-500">R$ 16,00</span>
            </button>
          </div>

          <span className="text-[8px] text-neutral-400 dark:text-neutral-500 text-center block mt-1">Toque para simular compra rápida</span>
        </div>

        {/* Widget 3: Quick impending due list */}
        <div className="bg-neutral-50 dark:bg-neutral-850/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between aspect-square max-w-[220px] mx-auto w-full">
          <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 font-semibold mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              Contas do Dia
            </span>
            <span className="text-[8px] uppercase font-bold text-rose-500">Alertas</span>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-center">
            {upcomingBills.length === 0 ? (
              <p className="text-[10px] text-center text-neutral-450 dark:text-neutral-550">Nenhum compromisso pendente hoje.</p>
            ) : (
              upcomingBills.map((bill) => (
                <div key={bill.id} className="p-1.5 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 rounded-lg flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 truncate max-w-[80px]">{bill.title}</span>
                  <span className="font-bold text-neutral-850 dark:text-neutral-100">R$ {bill.value.toFixed(0)}</span>
                </div>
              ))
            )}
          </div>

          <p className="text-[8px] text-neutral-400 dark:text-neutral-500 text-center leading-tight">Cheque lembretes de faturas na HomeScreen</p>
        </div>

      </div>
    </div>
  );
}
