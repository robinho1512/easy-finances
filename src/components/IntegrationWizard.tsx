/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BankIntegration, Transaction, CreditCard } from "../types";
import { defaultBanks } from "../mockData";
import { Check, ShieldCheck, RefreshCw, AlertCircle, Link2, ExternalLink, HelpCircle } from "lucide-react";

interface IntegrationWizardProps {
  banks: BankIntegration[];
  onToggleBankConnection: (bankId: string, isConnected: boolean, mockTrans?: Transaction[], mockCards?: CreditCard[]) => void;
}

export default function IntegrationWizard({ banks, onToggleBankConnection }: IntegrationWizardProps) {
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [syncStep, setSyncStep] = useState<"idle" | "intro" | "credentials" | "authenticating" | "completed">("idle");
  const [agency, setAgency] = useState("");
  const [account, setAccount] = useState("");
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Bank Specific Mock transactions to inject when connected
  const getMockDataForBank = (bankName: string): { txs: Transaction[]; cards: CreditCard[] } => {
    const today = new Date().toISOString().split("T")[0];
    const uuid = () => Math.random().toString(36).substring(2, 9);

    if (bankName === "Nubank") {
      return {
        cards: [
          {
            id: "card-nubank-opt",
            name: "Nubank PJ Premium",
            lastFour: "5544",
            limit: 8000,
            spent: 420.0,
            dueDate: 12,
            closingDate: 5,
            network: "mastercard",
            color: "from-[#8A05BE] to-[#3B0252]",
          }
        ],
        txs: [
          {
            id: `tx-nubank-1`,
            description: "Almoço Spoleto (Nubank Sync)",
            value: 42.0,
            date: today,
            category: "Alimentação",
            type: "Débito",
            isPaid: true
          },
          {
            id: `tx-nubank-2`,
            description: "Assinatura Spotify Premium",
            value: 34.9,
            date: today,
            category: "Lazer",
            cardId: "card-nubank-opt",
            type: "Crédito",
            isPaid: true
          }
        ]
      };
    } else if (bankName === "Itaú") {
      return {
        cards: [
          {
            id: "card-itau-opt",
            name: "Itaú Personnalité Visa",
            lastFour: "7711",
            limit: 35000,
            spent: 1980.0,
            dueDate: 20,
            closingDate: 12,
            network: "visa",
            color: "from-blue-600 to-amber-500",
          }
        ],
        txs: [
          {
            id: `tx-itau-1`,
            description: "Posto Shell Combustível",
            value: 120.0,
            date: today,
            category: "Transporte",
            cardId: "card-itau-opt",
            type: "Crédito",
            isPaid: true
          },
          {
            id: `tx-itau-2`,
            description: "Enel Eletricidade (Débito Itaú)",
            value: 189.2,
            date: today,
            category: "Moradia",
            type: "Débito",
            isPaid: true
          }
        ]
      };
    } else {
      // Default fallback
      return {
        cards: [],
        txs: [
          {
            id: `tx-other-1`,
            description: `Ajuste Automático ${bankName}`,
            value: 75.0,
            date: today,
            category: "Outros",
            type: "Pix",
            isPaid: true
          }
        ]
      };
    }
  };

  const handleStartConnection = (bankId: string) => {
    setSelectedBankId(bankId);
    setSyncStep("intro");
    setAgency("");
    setAccount("");
  };

  const executeSimulatedHandshake = () => {
    if (!agency || !account) return;
    setSyncStep("authenticating");

    // Realistic TLS delay
    setTimeout(() => {
      const selectedBank = banks.find(b => b.id === selectedBankId);
      if (selectedBank) {
        const { txs, cards } = getMockDataForBank(selectedBank.bankName);
        onToggleBankConnection(selectedBank.id, true, txs, cards);
      }
      setSyncStep("completed");
    }, 2800);
  };

  const handleDisconnect = (bankId: string) => {
    if (confirm("Deseja realmente remover esta integração bancária? Todas as transações sincronizadas por esta via serão mantidas, mas o canal do Open Finance será desautorizado.")) {
      onToggleBankConnection(bankId, false);
      setSelectedBankId(null);
      setSyncStep("idle");
    }
  };

  const syncAllConnectedBanks = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      alert("Todas as conexões ativas do Open Finance foram sincronizadas com sucesso. Novas transações importadas!");
    }, 1500);
  };

  const currentSelectedBank = banks.find(b => b.id === selectedBankId);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="font-semibold text-neutral-850 dark:text-neutral-100 text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Sincronização Bancária Open Finance
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Conecte suas contas bancárias de maneira totalmente segura usando protocolos regulados pelo Banco Central.
          </p>
        </div>

        {banks.some(b => b.connected) && (
          <button
            onClick={syncAllConnectedBanks}
            disabled={isSyncingAll}
            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin" : ""}`} />
            {isSyncingAll ? "Sincronizando..." : "Sincronizar Tudo"}
          </button>
        )}
      </div>

      {syncStep === "idle" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {banks.map((bank) => (
              <div
                key={bank.id}
                className={`border p-4 rounded-xl flex flex-col items-center justify-between transition-all group ${
                  bank.connected
                    ? "border-emerald-300 bg-emerald-50/20 dark:border-emerald-800/40 dark:bg-emerald-950/10"
                    : "border-neutral-200 hover:border-neutral-350 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                }`}
              >
                {/* Visual bank badge representing Brazilian brandings */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm mb-3 ${
                    bank.bankName === "Nubank"
                      ? "bg-[#8A05BE]"
                      : bank.bankName === "Itaú"
                      ? "bg-[#EC7000]"
                      : bank.bankName === "Bradesco"
                      ? "bg-[#CC092F]"
                      : bank.bankName === "Banco Inter"
                      ? "bg-[#FF7A00]"
                      : "bg-[#EC0000]"
                  }`}
                >
                  {bank.bankName.substring(0, 2).toUpperCase()}
                </div>

                <div className="text-center w-full">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 block truncate">
                    {bank.bankName}
                  </span>
                  
                  {bank.connected ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1 mt-1">
                      <Check className="w-2.5 h-2.5" /> Ativo
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-450 dark:text-neutral-500 mt-1 block">
                      Desconectado
                    </span>
                  )}
                </div>

                <div className="w-full mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                  {bank.connected ? (
                    <button
                      onClick={() => handleDisconnect(bank.id)}
                      className="w-full text-center text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartConnection(bank.id)}
                      className="w-full text-center text-[10px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer"
                    >
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-850 rounded-xl flex items-start gap-3 border border-neutral-150 dark:border-neutral-800/80">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              <p className="font-semibold text-neutral-700 dark:text-neutral-300">Segurança de Dados de Nível Bancário</p>
              <p className="mt-1 leading-relaxed">
                As conexões simuladas de Open Finance representam endpoints reais criptografados de ponta a ponta. Não guardamos senhas de acesso aos bancos, apenas coletamos extratos de leitura de faturas enviadas pelas bandeiras dos seus cartões de crédito autorizados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Wizard Modal Dialog inside app pane */}
      {syncStep !== "idle" && currentSelectedBank && (
        <div className="bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-850 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Processo de Integração
            </span>
            <button
              onClick={() => setSyncStep("idle")}
              className="text-neutral-450 hover:text-neutral-600 dark:hover:text-neutral-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          {syncStep === "intro" && (
            <div className="text-center py-3">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Link2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-base">
                Vincular conta do {currentSelectedBank.bankName}
              </h4>
              <p className="text-xs text-neutral-550 dark:text-neutral-400 max-w-sm mx-auto mt-2 leading-relaxed">
                Você será redirecionado para o validador de consentimento de dados do <b>{currentSelectedBank.bankName}</b> via Open Finance. 
                Os dados serão lidos de forma segura para faturar transações no seu extrato.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => setSyncStep("credentials")}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {syncStep === "credentials" && (
            <div className="max-w-xs mx-auto space-y-4">
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-150 text-sm text-center">
                Insira as credenciais de leitura de faturas
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                    Agência (sem o dígito)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="3489"
                    value={agency}
                    onChange={(e) => setAgency(e.target.value.replace(/\D/g, "").substring(0, 4))}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-neutral-800 dark:text-neutral-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                    Conta Corrente & DV
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="23415-8"
                    value={account}
                    onChange={(e) => setAccount(e.target.value.substring(0, 8))}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-2 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-neutral-800 dark:text-neutral-100 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={executeSimulatedHandshake}
                disabled={!agency || !account}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Autorizar Consentimento
              </button>
            </div>
          )}

          {syncStep === "authenticating" && (
            <div className="text-center py-6 space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-500 dark:text-indigo-400 animate-spin mx-auto" />
              <div>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">Estabelecendo Túnel TLS Criptografado...</p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">Conectando ao sandbox regulado do Open Finance do Brasil</p>
              </div>
            </div>
          )}

          {syncStep === "completed" && (
            <div className="text-center py-3 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-850 dark:text-neutral-100 text-sm">Integração realizada com sucesso!</h4>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-550 mt-1">
                  Seus cartões de crédito e transações recentes do <b>{currentSelectedBank.bankName}</b> foram populados com sucesso.
                </p>
              </div>
              <button
                onClick={() => setSyncStep("idle")}
                className="mt-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs px-4 py-1.5 rounded-xl cursor-pointer"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
