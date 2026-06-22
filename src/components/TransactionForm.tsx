/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Transaction, Category, CreditCard, TransactionType } from "../types";
import { Sparkles, Plus, AlertCircle, RefreshCw, FileText, Check, HelpCircle, ArrowRight } from "lucide-react";

interface TransactionFormProps {
  categories: Category[];
  cards: CreditCard[];
  onAddTransaction: (tx: Omit<Transaction, "id">) => void;
}

export default function TransactionForm({ categories, cards, onAddTransaction }: TransactionFormProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  
  // Manual form states
  const [description, setDescription] = useState("");
  const [val, setVal] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [type, setType] = useState<TransactionType>("Pix");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [isPaid, setIsPaid] = useState(true);

  // AI OCR / parsing states
  const [aiText, setAiText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResult, setParsedResult] = useState<any | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !val || !selectedCategory) return;

    onAddTransaction({
      description,
      value: parseFloat(val),
      date,
      category: selectedCategory,
      type,
      cardId: type === "Crédito" ? selectedCardId || undefined : undefined,
      isPaid,
    });

    // Reset manual form
    setDescription("");
    setVal("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("Pix");
    setSelectedCardId("");
    setIsPaid(true);
  };

  const handleAiParse = async () => {
    if (!aiText.trim()) return;
    setIsParsing(true);
    setParsedResult(null);
    setAiMessage(null);

    try {
      const response = await fetch("/api/parse-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });
      const data = await response.json();

      if (data.fallback) {
        setAiMessage("Modo Simulação (Chave Gemini indisponível, usando motor de busca local).");
      } else {
        setAiMessage("Análise concluída com sucesso pelo modelo financeiro Gemini AI!");
      }

      if (data.data) {
        setParsedResult(data.data);
      } else {
        throw new Error("Resposta inválida do servidor");
      }
    } catch (err: any) {
      console.error(err);
      setAiMessage("Ocorreu um erro ao processar. Tente novamente.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAiTransaction = () => {
    if (!parsedResult) return;

    // Map AI extracted values to our state variables safely
    const finalVal = parsedResult.value || 0;
    const finalDesc = parsedResult.description || "Transação por IA";
    const finalDate = parsedResult.date || new Date().toISOString().split("T")[0];
    const finalCat = parsedResult.category || "Outros";
    const finalType: TransactionType = (parsedResult.paymentMethod === "Pix" || parsedResult.paymentMethod === "Crédito" || parsedResult.paymentMethod === "Débito") 
      ? parsedResult.paymentMethod as TransactionType 
      : "Pix";

    // Auto-select a credit card if type is Credit
    let finalCardId: string | undefined = undefined;
    if (finalType === "Crédito" && cards.length > 0) {
      finalCardId = cards[0].id;
    }

    onAddTransaction({
      description: finalDesc,
      value: finalVal,
      date: finalDate,
      category: finalCat,
      type: finalType,
      cardId: finalCardId,
      isPaid: true,
    });

    // Reset AI view
    setParsedResult(null);
    setAiText("");
    setAiMessage(null);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm">
      
      {/* Tabs list toggle bar */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-5">
        <button
          onClick={() => { setActiveTab("manual"); setParsedResult(null); }}
          className={`flex-1 text-center font-bold text-xs pb-3 transition-colors cursor-pointer ${
            activeTab === "manual"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
              : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          Lançamento Manual
        </button>
        <button
          onClick={() => { setActiveTab("ai"); }}
          className={`flex-1 text-center font-bold text-xs pb-3 transition-colors flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === "ai"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
              : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Importação por IA
        </button>
      </div>

      {activeTab === "manual" ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Description input */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                Descrição da Despesa
              </label>
              <input
                type="text"
                required
                placeholder="E.g. Supermercado, Almoço, Uber..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-medium"
              />
            </div>

            {/* Value in R$ */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                placeholder="0,00"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-medium"
              />
            </div>

            {/* Date input */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                Data do Gasto
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-neutral-800 dark:text-neutral-100 font-medium"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                Categoria
              </label>
              <select
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none text-neutral-800 dark:text-neutral-150"
              >
                <option value="">Selecione uma Categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction type select */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                Meio de Pagamento
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none text-neutral-800 dark:text-neutral-150"
              >
                <option value="Pix">Pix / Transferência</option>
                <option value="Crédito">Cartão de Crédito</option>
                <option value="Débito">Débito em Conta</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Dinheiro">Dinheiro Físico</option>
              </select>
            </div>

            {/* Dynamic Card selection if type is credit */}
            {type === "Crédito" && (
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1 animate-fadeIn">
                  Selecione o Cartão responsável
                </label>
                <select
                  required
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none text-[#EC7000] dark:text-[#EC7000] font-semibold animate-fadeIn"
                >
                  <option value="">Escolha qual cartão...</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} (últimos: {card.lastFour})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Payment settlement status */}
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="isPaidCheckbox font-semibold"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="rounded border-neutral-300 text-indigo-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="isPaidCheckbox" className="text-xs text-neutral-600 dark:text-neutral-400 select-none cursor-pointer">
                Lançar já como <b>Pago/Liquidado</b>
              </label>
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Lançar Despesa
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Importador Inteligente Open Finance
            </h4>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              Copie o SMS de compra, o comprovante do PIX ou a notificação de transação do banco e cole abaixo para que o Gemini AI classifique automaticamente.
            </p>
          </div>

          <textarea
            rows={3}
            placeholder={`Ex de texto aceito para parsear:\n"Transação aprovada no seu Nubank de R$ 38,90 no estabelecimento McDonald's às 14:20"\nou "C6 Bank: Pix de R$ 150 enviado para Enel em 15/06."`}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
          />

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1 font-mono">
              <FileText className="w-3.5 h-3.5" />
              Segurança TLS garantida
            </span>
            
            <button
              onClick={handleAiParse}
              disabled={isParsing || !aiText.trim()}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Classificando...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Interpretar com IA
                </>
              )}
            </button>
          </div>

          {/* Feedback messages */}
          {aiMessage && (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-850 rounded-xl flex items-start gap-2.5 text-[11px] text-neutral-550 dark:text-neutral-400 select-none">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>{aiMessage}</span>
            </div>
          )}

          {/* Extracted Review UI result */}
          {parsedResult && (
            <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl space-y-3 animate-fadeIn">
              <h5 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs uppercase tracking-wider">
                Dados Extraídos por IA (Revisão)
              </h5>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-neutral-400 dark:text-neutral-500 block text-[10px] font-semibold">Valor</span>
                  <span className="font-bold text-neutral-850 dark:text-neutral-100 text-sm">
                    R$ {(parsedResult.value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-neutral-400 dark:text-neutral-500 block text-[10px] font-semibold">Estabelecimento</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-100">
                    {parsedResult.description || "Não identificado"}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-neutral-400 dark:text-neutral-500 block text-[10px] font-semibold">Categoria Sugerida</span>
                  <span className="font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full inline-block">
                    {parsedResult.category || "Outros"}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-neutral-400 dark:text-neutral-500 block text-[10px] font-semibold">Meio Pagamento</span>
                  <span className="font-semibold text-neutral-850 dark:text-neutral-100">
                    {parsedResult.paymentMethod || "Pix"}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <button
                  onClick={handleConfirmAiTransaction}
                  className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Confirmar e Lançar Despesa
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
