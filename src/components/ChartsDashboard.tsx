/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Transaction, Category } from "../types";
import CategoryIcon from "./CategoryIcon";

interface ChartsDashboardProps {
  transactions: Transaction[];
  categories: Category[];
}

export default function ChartsDashboard({ transactions, categories }: ChartsDashboardProps) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  // Group transactions by category (paid items)
  const categoryTotals = categories.map((cat) => {
    const total = transactions
      .filter((t) => t.category === cat.name && t.isPaid)
      .reduce((sum, t) => sum + t.value, 0);
    return {
      ...cat,
      total,
    };
  });

  const grandTotal = categoryTotals.reduce((sum, c) => sum + c.total, 0);

  // Math for SVG Circular/Donut graph
  let accumulatedPercent = 0;
  const donutSegments = categoryTotals
    .filter((c) => c.total > 0)
    .map((cat) => {
      const percentage = grandTotal > 0 ? (cat.total / grandTotal) * 100 : 0;
      const startPercent = accumulatedPercent;
      accumulatedPercent += percentage;
      return {
        ...cat,
        percentage,
        startPercent,
      };
    });

  // Aggregated data by weekly offset (e.g. current week, 1 week ago, 2 weeks ago...)
  const getWeeklyBurn = () => {
    const burn = [0, 0, 0, 0]; // [Hoje/Ult 3 dias, 4-7 dias, 8-14 dias, 15+ dias]
    const now = new Date();
    transactions.forEach((tx) => {
      if (!tx.isPaid) return;
      const txDate = new Date(tx.date);
      const diffTime = Math.abs(now.getTime() - txDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 3) burn[0] += tx.value;
      else if (diffDays <= 7) burn[1] += tx.value;
      else if (diffDays <= 14) burn[2] += tx.value;
      else burn[3] += tx.value;
    });
    return burn;
  };

  const weeklyExpenses = getWeeklyBurn();
  const maxWeeklyExpense = Math.max(...weeklyExpenses, 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Donut Chart and Category Shares */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm">
        <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-lg mb-4">
          Distribuição por Categoria
        </h3>

        {grandTotal === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500">
            <span className="text-sm">Nenhuma transação efetuada este mês.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            
            {/* Custom SVG Donut */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="currentColor" className="text-neutral-100 dark:text-neutral-800" strokeWidth="4.5" />
                
                {donutSegments.map((segment, idx) => {
                  const strokeWidth = activeCategoryIndex === idx ? "5.5" : "4.5";
                  const offset = 100 - segment.startPercent;
                  return (
                    <circle
                      key={segment.id}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
                      strokeDashoffset={offset}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                    />
                  );
                })}
              </svg>
              
              {/* Inner Circle Info */}
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium uppercase tracking-wider">
                  Total Pago
                </span>
                <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  R$ {grandTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* List with Shares */}
            <div className="flex-1 w-full max-w-xs space-y-2">
              {categoryTotals
                .filter((ct) => ct.total > 0)
                .sort((a, b) => b.total - a.total)
                .map((ct) => {
                  const pct = grandTotal > 0 ? (ct.total / grandTotal) * 100 : 0;
                  return (
                    <div
                      key={ct.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ct.color }} />
                        <CategoryIcon name={ct.icon} className="w-4 h-4 text-neutral-500" />
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {ct.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                          R$ {ct.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {pct.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Activity Column Chart */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm">
        <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-lg mb-2">
          Histórico de Consumo Recente
        </h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-6">
          Distribuição dos gastos conforme o período das despesas pagas.
        </p>

        <div className="h-44 flex items-end justify-between gap-4 px-2 select-none">
          {[
            { label: "Últimos 3 dias", value: weeklyExpenses[0] },
            { label: "4 - 7 dias atrás", value: weeklyExpenses[1] },
            { label: "Ocorrido há 1-2 semanas", value: weeklyExpenses[2] },
            { label: "Mais de 15 dias", value: weeklyExpenses[3] },
          ].map((bar, i) => {
            const pct = (bar.value / maxWeeklyExpense) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                {/* Value Label */}
                <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 mb-2 truncate max-w-[80px]">
                  R$ {bar.value.toFixed(0)}
                </span>
                
                {/* Column */}
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t-lg h-28 relative overflow-hidden flex items-end">
                  <div
                    style={{ height: `${Math.max(pct, 5)}%` }}
                    className={`w-full rounded-t-med transition-all duration-500 ease-out ${
                      i === 0
                        ? "bg-indigo-500 dark:bg-indigo-400"
                        : i === 1
                        ? "bg-blue-500 dark:bg-blue-400"
                        : "bg-teal-500 dark:bg-teal-400"
                    }`}
                  />
                </div>

                {/* Subtitle */}
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 text-center leading-tight">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Budgets Gauge meters */}
      <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm">
        <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-lg mb-1">
          Tetos de Gastos & Metas de Orçamento
        </h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-6">
          Acompanhamento dos tetos de gastos personalizados criados para cada setor de consumo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryTotals.map((cat) => {
            const limit = cat.budget || 500;
            const percentageUsed = Math.min((cat.total / limit) * 100, 100);
            
            // color grading
            let barColor = "bg-emerald-500 dark:bg-emerald-400";
            let textColor = "text-emerald-500";
            if (percentageUsed > 90) {
              barColor = "bg-rose-500 dark:bg-rose-400 animate-pulse";
              textColor = "text-rose-500 dark:text-rose-400 font-bold";
            } else if (percentageUsed > 75) {
              barColor = "bg-amber-500 dark:bg-amber-400";
              textColor = "text-amber-500 dark:text-amber-400";
            }

            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg flex items-center justify-center bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-sm">
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      {cat.name}
                    </span>
                  </div>
                  <span className={`text-xs ${textColor}`}>
                    {percentageUsed.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden mb-3">
                  <div style={{ width: `${percentageUsed}%` }} className={`h-full transition-all duration-500 ${barColor}`} />
                </div>

                <div className="flex justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
                  <span>Gasto: <b>R$ {cat.total.toFixed(0)}</b></span>
                  <span>Teto: <b>R$ {limit.toFixed(0)}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
