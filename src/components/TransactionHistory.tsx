/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Transaction, Category, CreditCard } from "../types";
import { Search, Filter, Trash2, Calendar, FileDown, CheckCircle, Clock } from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
  categories: Category[];
  cards: CreditCard[];
  onToggleStatus: (txId: string) => void;
  onDeleteTransaction: (txId: string) => void;
  onExportReport: () => void;
}

export default function TransactionHistory({
  transactions,
  categories,
  cards,
  onToggleStatus,
  onDeleteTransaction,
  onExportReport,
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(c => [c.name, c]));
  }, [categories]);

  // Combined filters
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tx.category === selectedCategory;
    const matchesType = selectedType === "all" || tx.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCardAbbrName = (cardId?: string) => {
    if (!cardId) return "";
    const card = cards.find((c) => c.id === cardId);
    return card ? `${card.name} (*${card.lastFour})` : "";
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm">
      
      {/* Header operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="font-semibold text-neutral-850 dark:text-neutral-100 text-lg">
            Extrato de Lançamentos
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Histórico completo de despesas registradas e importadas
          </p>
        </div>

        <button
          onClick={onExportReport}
          className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          Exportar PDF / Relatório
        </button>
      </div>

      {/* Filter and search parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 pl-9 pr-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-200 font-medium"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none text-neutral-700 dark:text-neutral-200"
          >
            <option value="all">Filtrar por Categoria (Todas)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none text-neutral-700 dark:text-neutral-200"
          >
            <option value="all">Filtrar por Forma de Pagamento (Todas)</option>
            <option value="Pix">Pix / Transferência</option>
            <option value="Crédito">Cartão de Crédito</option>
            <option value="Débito">Débito em Conta</option>
            <option value="Boleto">Boleto</option>
            <option value="Dinheiro">Dinheiro</option>
          </select>
        </div>
      </div>

      {/* Main ledger table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-neutral-800 text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500">
              <th className="py-2.5 px-3">Data</th>
              <th className="py-2.5 px-3">Descrição / Meio</th>
              <th className="py-2.5 px-3">Categoria</th>
              <th className="py-2.5 px-3 text-right">Valor</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-center">Ações</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-450 dark:text-neutral-500 font-medium">
                  Nenhuma transação atende aos filtros definidos.
                </td>
              </tr>
            ) : (
              filteredTransactions
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((tx) => {
                  const catData = categoryMap.get(tx.category);
                  const badgeColor = catData?.color || "#cbd5e1";

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/55 dark:hover:bg-neutral-850/20 transition-all group"
                    >
                      {/* Date */}
                      <td className="py-3 px-3 text-neutral-450 dark:text-neutral-500 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 opacity-60" />
                          {getFormattedDate(tx.date)}
                        </span>
                      </td>

                      {/* Description and card info if applicable */}
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-semibold text-neutral-750 dark:text-neutral-100">
                            {tx.description}
                          </p>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block truncate">
                            {tx.type} {tx.cardId && `• Card: ${getCardAbbrName(tx.cardId)}`}
                          </span>
                        </div>
                      </td>

                      {/* Category tag */}
                      <td className="py-3 px-3">
                        <span
                          className="px-2.5 py-0.5 rounded-full inline-block text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: badgeColor }}
                        >
                          {tx.category}
                        </span>
                      </td>

                      {/* Value in R$ (Negative representation as expense) */}
                      <td className="py-3 px-3 text-right font-bold text-neutral-850 dark:text-neutral-100">
                        {tx.isPaid ? "-" : ""}R$ {tx.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Paying status toggler */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onToggleStatus(tx.id)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-85 ${
                            tx.isPaid
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                          title="Clique para alternar o status de liquidação"
                        >
                          {tx.isPaid ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              Liquidado
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                              Pendente
                            </>
                          )}
                        </button>
                      </td>

                      {/* Remove item */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="text-neutral-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Excluir despesa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
