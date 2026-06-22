/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CreditCard } from "../types";
import { Plus, Trash2, Eye, EyeOff, Lock, Unlock, Fingerprint, RefreshCcw, Landmark, Sliders, Check } from "lucide-react";

interface CreditCardListProps {
  cards: CreditCard[];
  onAddCard: (card: Omit<CreditCard, "id" | "spent">) => void;
  onDeleteCard: (cardId: string) => void;
  biometricGloballyEnabled: boolean;
}

export default function CreditCardList({ cards, onAddCard, onDeleteCard, biometricGloballyEnabled }: CreditCardListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [lockedCardIds, setLockedCardIds] = useState<Record<string, boolean>>(() => {
    // Lock cards initially if biometric globally enabled
    return {};
  });
  
  // Biometric dialog simulation states
  const [authenticatingCardId, setAuthenticatingCardId] = useState<string | null>(null);
  const [bioStep, setBioStep] = useState<"idle" | "scanning" | "success" | "failed">("idle");

  // Form states
  const [name, setName] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [limit, setLimit] = useState("");
  const [dueDate, setDueDate] = useState("10");
  const [closingDate, setClosingDate] = useState("3");
  const [network, setNetwork] = useState<"visa" | "mastercard" | "elo" | "amex">("mastercard");
  const [colorGradiant, setColorGradiant] = useState("from-indigo-600 to-purple-600");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || lastFour.length < 4 || !limit) return;
    
    onAddCard({
      name,
      lastFour,
      limit: parseFloat(limit),
      dueDate: parseInt(dueDate),
      closingDate: parseInt(closingDate),
      network,
      color: colorGradiant,
    });

    // Reset Form
    setName("");
    setLastFour("");
    setLimit("");
    setDueDate("10");
    setClosingDate("3");
    setNetwork("mastercard");
    setColorGradiant("from-indigo-600 to-purple-600");
    setShowAddForm(false);
  };

  const toggleCardPrivacyLock = (cardId: string) => {
    // If turning on privacy, lock right away
    if (!lockedCardIds[cardId]) {
      setLockedCardIds(prev => ({ ...prev, [cardId]: true }));
    } else {
      // If turning off / unlocking, trigger bio-dialog
      setAuthenticatingCardId(cardId);
      setBioStep("scanning");
      setTimeout(() => {
        setBioStep("success");
        setTimeout(() => {
          setLockedCardIds(prev => ({ ...prev, [cardId]: false }));
          setAuthenticatingCardId(null);
          setBioStep("idle");
        }, 1100);
      }, 1600);
    }
  };

  const getNetworkLogo = (netName: string) => {
    switch (netName) {
      case "visa":
        return <span className="font-bold italic text-white text-base">VISA</span>;
      case "mastercard":
        return (
          <div className="flex -space-x-2">
            <span className="w-4 h-4 bg-rose-500 rounded-full" />
            <span className="w-4 h-4 bg-amber-500 rounded-full opacity-80" />
          </div>
        );
      case "amex":
        return <span className="font-semibold bg-sky-500/20 px-1 py-0.2 rounded text-[10px] text-white tracking-widest">AMEX</span>;
      default:
        return <span className="font-bold text-white text-xs uppercase tracking-wider">ELO</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-semibold text-neutral-850 dark:text-neutral-100 text-lg">
            Meus Cartões de Crédito
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Gerencie múltiplos limites e datas de fechamento
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Cartão
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-850 rounded-xl space-y-4 border border-neutral-150 dark:border-neutral-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Cadastrar Novo Cartão
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Apelido do Cartão</label>
              <input
                type="text"
                required
                placeholder="Ex Autonegócio, Nubank, Itaú..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Últimos 4 Dígitos</label>
              <input
                type="text"
                required
                maxLength={4}
                placeholder="E.g. 5831"
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Limite Total do Cartão (R$)</label>
              <input
                type="number"
                required
                min={1}
                placeholder="Ex 5000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Dia Vencimento</label>
                <select
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-2 py-1.5 rounded-xl text-xs outline-none text-neutral-800 dark:text-neutral-100"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>Dia {d}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Dia Fechamento</label>
                <select
                  value={closingDate}
                  onChange={(e) => setClosingDate(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-2 py-1.5 rounded-xl text-xs outline-none text-neutral-800 dark:text-neutral-100"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>Dia {d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Bandeira do Cartão</label>
              <div className="flex gap-4 mt-1">
                {["visa", "mastercard", "elo", "amex"].map((net) => (
                  <label key={net} className="flex items-center gap-1 text-xs text-neutral-700 dark:text-neutral-300 capitalize cursor-pointer">
                    <input
                      type="radio"
                      name="network"
                      checked={network === net}
                      onChange={() => setNetwork(net as any)}
                      className="text-indigo-500 focus:ring-0"
                    />
                    {net}
                  </label>
                ))}
              </div>
            </div>

            {/* Aesthetic presets */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">Visual do Cartão</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {[
                  { class: "from-indigo-600 to-purple-600", label: "Roxo" },
                  { class: "from-neutral-800 to-neutral-950", label: "Black" },
                  { class: "from-[#EC7000] to-[#E33E00]", label: "Laranja" },
                  { class: "from-emerald-600 to-teal-700", label: "Verde" },
                  { class: "from-rose-500 to-red-700", label: "Vinho" },
                ].map((col) => (
                  <button
                    key={col.label}
                    type="button"
                    onClick={() => setColorGradiant(col.class)}
                    className={`w-6 h-6 rounded-full bg-gradient-to-r ${col.class} border-2 ${
                      colorGradiant === col.class ? "border-amber-400 shadow-md" : "border-transparent"
                    } cursor-pointer`}
                    title={col.label}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-xl font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-bold shadow-sm cursor-pointer"
            >
              Gravar Cartão
            </button>
          </div>
        </form>
      )}

      {/* Cards list Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const isLocked = lockedCardIds[card.id];
          const hasSecurityDevice = biometricGloballyEnabled;
          const limitPercentage = Math.min((card.spent / card.limit) * 100, 100);

          return (
            <div
              key={card.id}
              className="border border-neutral-150 dark:border-neutral-800 rounded-2xl p-4 bg-neutral-50/50 dark:bg-neutral-850/30 flex flex-col justify-between"
            >
              {/* Virtual physical card design */}
              <div
                className={`w-full aspect-[1.58/1] bg-gradient-to-br ${card.color} rounded-2xl p-4 flex flex-col justify-between shadow-md relative text-white select-none overflow-hidden`}
              >
                {/* Visual reflections */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[10px] font-medium tracking-wider uppercase opacity-80">
                      {card.name}
                    </h4>
                    <span className="text-sm font-semibold tracking-widest font-mono">
                      •••• •••• •••• {card.lastFour}
                    </span>
                  </div>
                  <div>
                    {getNetworkLogo(card.network)}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[9px] uppercase opacity-70 block">
                      Vencimento
                    </span>
                    <span className="text-xs font-semibold">
                      Dia {card.dueDate}
                    </span>
                  </div>

                  {/* Private biometry trigger */}
                  {hasSecurityDevice && (
                    <button
                      onClick={() => toggleCardPrivacyLock(card.id)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 transition-colors cursor-pointer"
                      title={isLocked ? "Desbloquear com Biometria" : "Proteger com Biometria"}
                    >
                      {isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-300" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Card statistics metrics status */}
              <div className="mt-4 space-y-3">
                {isLocked ? (
                  <div className="h-28 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200/50 dark:border-neutral-800/80 p-3 text-center space-y-1.5">
                    <Fingerprint className="w-7 h-7 text-neutral-400 dark:text-neutral-500" />
                    <div>
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Cartão Bloqueado</p>
                      <button
                        onClick={() => toggleCardPrivacyLock(card.id)}
                        className="text-[10px] text-indigo-500 hover:underline font-bold mt-1 cursor-pointer"
                      >
                        Autenticar ID para ver faturas
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400 dark:text-neutral-500 font-medium">Gasto na Fatura</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-bold">
                          R$ {card.spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      {/* Percent slide bar */}
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${limitPercentage}%` }}
                          className={`h-full ${
                            limitPercentage > 85
                              ? "bg-rose-500"
                              : limitPercentage > 60
                              ? "bg-amber-500"
                              : "bg-indigo-500"
                          }`}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                        <span>Limite Corrente: R$ {card.limit.toFixed(0)}</span>
                        <span>Disp: R$ {(card.limit - card.spent).toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[11px] text-neutral-450 dark:text-neutral-500">
                      <span>Fechamento: <b>Dia {card.closingDate}</b></span>
                      <button
                        onClick={() => onDeleteCard(card.id)}
                        className="text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                        title="Deletar este cartão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Biometric Scan Prompt Backdrop Overlay Dialog */}
      {authenticatingCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 max-w-sm w-full rounded-2xl p-6 text-center space-y-6 shadow-xl transition-all">
            
            {/* Handshake Scanner graphic */}
            <div className="flex justify-center">
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Circular pulsing wave */}
                <span className={`absolute inset-0 rounded-full border-2 border-indigo-500/20 ${
                  bioStep === "scanning" ? "animate-ping" : ""
                }`} />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  bioStep === "success"
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-400"
                }`}>
                  {bioStep === "success" ? (
                    <Check className="w-8 h-8" />
                  ) : (
                    <Fingerprint className="w-8 h-8 animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-base">
                {bioStep === "scanning" ? "Escaneando Biometria..." : "Acesso Concedido!"}
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                {bioStep === "scanning"
                  ? "Por favor, encoste o dedo no sensor biométrico ou posicione o rosto de frente para a câmera."
                  : "Assinatura criptografada validada com credenciais do aparelho!"}
              </p>
            </div>

            {bioStep === "scanning" && (
              <button
                onClick={() => setAuthenticatingCardId(null)}
                className="text-xs text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 font-semibold px-4 py-1.5 rounded-xl cursor-pointer"
              >
                Cancelar Autenticação
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
