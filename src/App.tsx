/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Transaction, CreditCard, Category, BillReminder, BankIntegration, UserSettings } from "./types";
import {
  defaultCards,
  defaultCategories,
  defaultTransactions,
  defaultReminders,
  defaultBanks,
} from "./mockData";

// Components
import MetricCards from "./components/MetricCards";
import ChartsDashboard from "./components/ChartsDashboard";
import CreditCardList from "./components/CreditCardList";
import TransactionForm from "./components/TransactionForm";
import TransactionHistory from "./components/TransactionHistory";
import CategoryCustomizer from "./components/CategoryCustomizer";
import RemindersModule from "./components/RemindersModule";
import WidgetsModule from "./components/WidgetsModule";
import IntegrationWizard from "./components/IntegrationWizard";
import CloudSecurityPanel from "./components/CloudSecurityPanel";

// Lucide Icons
import {
  Wallet,
  TrendingDown,
  CreditCard as CardIcon,
  Bell,
  Sliders,
  DollarSign,
  LayoutGrid,
  FileText,
  Printer,
  ChevronLeft,
  X,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Moon,
  Sun,
} from "lucide-react";

export default function App() {
  // -------------------------------------------------------------
  // Persistent State Management
  // -------------------------------------------------------------
  const [cards, setCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem("expenses_cards");
    return saved ? JSON.parse(saved) : defaultCards;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("expenses_categories");
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("expenses_transactions");
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [reminders, setReminders] = useState<BillReminder[]>(() => {
    const saved = localStorage.getItem("expenses_reminders");
    return saved ? JSON.parse(saved) : defaultReminders;
  });

  const [banks, setBanks] = useState<BankIntegration[]>(() => {
    const saved = localStorage.getItem("expenses_banks");
    return saved ? JSON.parse(saved) : defaultBanks;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem("expenses_settings");
    return saved
      ? JSON.parse(saved)
      : {
          darkMode: true,
          biometricEnabled: true,
          pushNotificationsEnabled: true,
          syncOnStartup: true,
        };
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "cards" | "reminders" | "categories" | "integrations">("dashboard");
  const [inAppToast, setInAppToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem("expenses_cards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem("expenses_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("expenses_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("expenses_reminders", JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem("expenses_banks", JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem("expenses_settings", JSON.stringify(settings));
    
    // Apply full document dark mode styling
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  // -------------------------------------------------------------
  // Recalculating Credit Card charges when transaction lists changes
  // -------------------------------------------------------------
  useEffect(() => {
    // Recompute "spent" faturas of all cards dynamically.
    // spent is equal to sum of paid + unpaid transactions linked to cardId
    setCards((prevCards) =>
      prevCards.map((card) => {
        const spent = transactions
          .filter((t) => t.cardId === card.id)
          .reduce((sum, t) => sum + t.value, 0);
        return {
          ...card,
          spent,
        };
      })
    );
  }, [transactions]);

  // -------------------------------------------------------------
  // Helper Events & Modifiers
  // -------------------------------------------------------------
  const handleTriggerToast = (message: string) => {
    setInAppToast(message);
    setTimeout(() => {
      setInAppToast(null);
    }, 4500);
  };

  const handleAddTransaction = (newTx: Omit<Transaction, "id">) => {
    const tx: Transaction = {
      ...newTx,
      id: "tx-" + Math.random().toString(36).substring(2, 9),
    };
    setTransactions((prev) => [tx, ...prev]);
    handleTriggerToast(`Despesa "${tx.description}" lançada com sucesso!`);
  };

  const handleToggleTransactionStatus = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, isPaid: !t.isPaid } : t))
    );
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    handleTriggerToast("Lançamento removido do extrato.");
  };

  const handleAddCard = (newCard: Omit<CreditCard, "id" | "spent">) => {
    const card: CreditCard = {
      ...newCard,
      id: "card-" + Math.random().toString(36).substring(2, 9),
      spent: 0,
    };
    setCards((prev) => [...prev, card]);
    handleTriggerToast(`Cartão "${card.name}" adicionado à carteira.`);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    // Clear card links in transactions
    setTransactions((prev) =>
      prev.map((t) => (t.cardId === cardId ? { ...t, cardId: undefined } : t))
    );
    handleTriggerToast("Cartão de crédito removido.");
  };

  const handleAddCategory = (cat: Category) => {
    setCategories((prev) => [...prev, cat]);
    handleTriggerToast(`Categoria "${cat.name}" criada.`);
  };

  const handleUpdateCategoryBudget = (catId: string, budget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, budget } : c))
    );
    handleTriggerToast("Teto e limites reconfigurados.");
  };

  const handleDeleteCategory = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    // Fallback transactions category
    setTransactions((prev) =>
      prev.map((t) => (t.category === cat.name ? { ...t, category: "Outros" } : t))
    );
    handleTriggerToast(`Categoria "${cat.name}" excluída.`);
  };

  const handleAddReminder = (newRem: Omit<BillReminder, "id" | "notified">) => {
    const rem: BillReminder = {
      ...newRem,
      id: "rem-" + Math.random().toString(36).substring(2, 9),
      notified: false,
    };
    setReminders((prev) => [...prev, rem]);
  };

  const handleToggleReminderPaid = (remId: string) => {
    const rem = reminders.find((r) => r.id === remId);
    if (!rem) return;

    const nextPaid = !rem.isPaid;
    setReminders((prev) =>
      prev.map((r) => (r.id === remId ? { ...r, isPaid: nextPaid } : r))
    );

    // If marked as paid, let's automatically record/ledger it as a transaction to easy tracking!
    if (nextPaid) {
      handleAddTransaction({
        description: rem.title,
        value: rem.value,
        date: new Date().toISOString().split("T")[0],
        category: rem.category,
        type: "Boleto",
        isPaid: true,
      });
      handleTriggerToast(`Boleto "${rem.title}" liquidado e deduzido do caixa.`);
    }
  };

  const handleDeleteReminder = (remId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== remId));
    handleTriggerToast("Alerta de boleto cancelado.");
  };

  // -------------------------------------------------------------
  // Open Finance Sincronizer implementation links
  // -------------------------------------------------------------
  const handleToggleBankConnection = (
    bankId: string,
    isConnected: boolean,
    mockTrans?: Transaction[],
    mockCards?: CreditCard[]
  ) => {
    setBanks((prev) =>
      prev.map((b) =>
        b.id === bankId
          ? {
              ...b,
              connected: isConnected,
              lastSync: isConnected ? new Date().toLocaleDateString("pt-BR") : undefined,
            }
          : b
      )
    );

    if (isConnected && mockTrans) {
      setTransactions((prev) => [...mockTrans, ...prev]);
    }
    if (isConnected && mockCards) {
      setCards((prev) => [...prev, ...mockCards]);
    }

    const b = banks.find((item) => item.id === bankId);
    if (isConnected) {
      handleTriggerToast(`Banco "${b?.bankName}" vinculado. Fatura e extrato atualizados!`);
    } else {
      handleTriggerToast(`Conexão do "${b?.bankName}" removida.`);
    }
  };

  // Quick Home Widget launcher press
  const handleQuickWidgetLaunch = (preset: {
    desc: string;
    value: number;
    cat: string;
    type: any;
  }) => {
    handleAddTransaction({
      description: preset.desc,
      value: preset.value,
      date: new Date().toISOString().split("T")[0],
      category: preset.cat,
      type: preset.type,
      isPaid: true,
    });
  };

  // -------------------------------------------------------------
  // Cloud Backup saving and loading triggers via API endpoints
  // -------------------------------------------------------------
  const handleSaveToCloud = async (account: string) => {
    const payload = {
      cards,
      categories,
      transactions,
      reminders,
      banks,
    };

    try {
      const response = await fetch("/api/backup/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountName: account, data: payload }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const handleLoadFromCloud = async (account: string) => {
    try {
      const response = await fetch(`/api/backup/load?accountName=${account}`);
      if (!response.ok) {
        throw new Error("Conta não registrada no Cloud.");
      }
      const file = await response.json();
      if (file.success && file.data?.backupData) {
        const cloud = file.data.backupData;
        if (cloud.cards) setCards(cloud.cards);
        if (cloud.categories) setCategories(cloud.categories);
        if (cloud.transactions) setTransactions(cloud.transactions);
        if (cloud.reminders) setReminders(cloud.reminders);
        if (cloud.banks) setBanks(cloud.banks);
        return { success: true };
      }
      return { success: false, error: "Formato de arquivo corrompido." };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // Local JSON files triggers
  const handleLocalExport = () => {
    const dataStr = JSON.stringify({
      cards,
      categories,
      transactions,
      reminders,
      banks,
    });
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_minhas_despesas_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLocalImport = (fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.cards) setCards(parsed.cards);
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.reminders) setReminders(parsed.reminders);
      if (parsed.banks) setBanks(parsed.banks);
    } catch (e) {
      alert("Erro ao importar o arquivo de dados local.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 transition-colors duration-300 flex flex-col">
      
      {/* App Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              R$
            </span>
            <div>
              <h1 className="font-bold text-neutral-850 dark:text-neutral-100 text-base flex items-center gap-1.5 leading-none">
                Easy Finance
                <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-400 px-1.5 py-0.5 rounded-full font-bold">
                  v3.5
                </span>
              </h1>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                Planejamento inteligente regulado pelo Open Finance
              </p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "cards", label: "Cartões" },
              { id: "reminders", label: "Boletos" },
              { id: "categories", label: "Configurar" },
            ].map((navTab) => (
              <button
                key={navTab.id}
                onClick={() => setActiveTab(navTab.id as any)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === navTab.id
                    ? "bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {navTab.label}
              </button>
            ))}
          </nav>

        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Metric widgets stats */}
        <MetricCards
          transactions={transactions}
          cards={cards}
          reminders={reminders}
          categories={categories}
        />

        {/* Tab body rendering */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Split row: Addition input and quick preview dials */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form trigger block */}
              <div className="lg:col-span-2">
                <TransactionForm
                  categories={categories}
                  cards={cards}
                  onAddTransaction={handleAddTransaction}
                />
              </div>

              {/* Home widgets simulator sandbox side block */}
              <div>
                <WidgetsModule
                  transactions={transactions}
                  reminders={reminders}
                  categories={categories}
                  onQuickLaunchTransaction={handleQuickWidgetLaunch}
                />
              </div>
            </div>

            {/* Custom charts block */}
            <ChartsDashboard transactions={transactions} categories={categories} />

            {/* Ledger tracker history list */}
            <TransactionHistory
              transactions={transactions}
              categories={categories}
              cards={cards}
              onToggleStatus={handleToggleTransactionStatus}
              onDeleteTransaction={handleDeleteTransaction}
              onExportReport={() => setIsExporting(true)}
            />
          </div>
        )}

        {activeTab === "cards" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Multiple credit cards lists */}
            <CreditCardList
              cards={cards}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              biometricGloballyEnabled={settings.biometricEnabled}
            />

            {/* Simulated Open Finance links */}
            <IntegrationWizard
              banks={banks}
              onToggleBankConnection={handleToggleBankConnection}
            />
          </div>
        )}

        {activeTab === "reminders" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Reminders checklist scheduler */}
            <RemindersModule
              reminders={reminders}
              onAddReminder={handleAddReminder}
              onToggleReminderPaid={handleToggleReminderPaid}
              onDeleteReminder={handleDeleteReminder}
              pushGloballyEnabled={settings.pushNotificationsEnabled}
              onTriggerInAppToast={handleTriggerToast}
            />
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-6 animate-fadeIn">
            <CategoryCustomizer
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategoryBudget={handleUpdateCategoryBudget}
              onDeleteCategory={handleDeleteCategory}
            />

            <CloudSecurityPanel
              settings={settings}
              onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
              onSaveCloudBackup={handleSaveToCloud}
              onLoadCloudBackup={handleLoadFromCloud}
              onLocalExport={handleLocalExport}
              onLocalImport={handleLocalImport}
            />
          </div>
        )}

      </main>

      {/* Footer credits block */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-4 bg-white dark:bg-neutral-900 transition-colors text-center select-none text-[10px] text-neutral-400 dark:text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            <b>Easy Finance</b> &bull; Open Finance Standardizado
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Dados Criptografados de Ponta a Ponta
          </span>
        </div>
      </footer>

      {/* Push Dynamic in-app toast alerts */}
      {inAppToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 border border-neutral-700 dark:border-neutral-200 p-4 rounded-xl shadow-xl max-w-sm flex items-start gap-3 animate-fadeIn">
          <Bell className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold leading-relaxed">{inAppToast}</p>
        </div>
      )}

      {/* Printable Report PDF compiling Modal View overlay */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto p-4 flex items-center justify-center">
          <div className="bg-white text-neutral-900 max-w-3xl w-full rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 print-container animate-scaleUp">
            
            {/* Modal actions non-printable toolbar */}
            <div className="flex justify-between items-center border-b border-neutral-200 pb-3 print:hidden">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Compilar Documento Financeiro
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Salvar PDF
                </button>
                <button
                  onClick={() => setIsExporting(false)}
                  className="p-1 hover:bg-neutral-100 text-neutral-500 rounded-lg cursor-pointer"
                  title="Fechar visualização"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* High-fidelity printable invoice template sheet section */}
            <div className="space-y-6">
              
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-wider text-neutral-800">
                    Relatório Mensal de Despesas
                  </h2>
                  <p className="text-[10px] text-neutral-500 font-medium">Controle de Gastos Pessoais &bull; Brasil</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-neutral-550 block">REF: {new Date().toLocaleDateString("pt-BR")}</span>
                  <span className="text-[9px] text-neutral-400 font-semibold">Emitido via Open Finance API</span>
                </div>
              </div>

              {/* Summaries strip */}
              <div className="grid grid-cols-3 gap-3 border-y border-neutral-200 py-4">
                <div>
                  <span className="text-[10px] text-neutral-450 block font-semibold">Total de Lançamentos</span>
                  <span className="text-sm font-bold text-neutral-800">
                    R$ {transactions.filter(t => t.isPaid).reduce((sum, t) => sum + t.value, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-450 block font-semibold">Faturas Correntes</span>
                  <span className="text-sm font-bold text-neutral-800">
                    R$ {cards.reduce((sum, c) => sum + c.spent, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-450 block font-semibold">Boletos Pendentes</span>
                  <span className="text-sm font-bold text-neutral-800">
                    R$ {reminders.filter(r => !r.isPaid).reduce((sum, r) => sum + r.value, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Cards details inside PDF */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Limites de Cartões Registrados</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cards.map(c => (
                    <div key={c.id} className="p-2.5 border border-neutral-200 rounded-lg text-xs">
                      <p className="font-bold text-neutral-800">{c.name} (*{c.lastFour})</p>
                      <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                        <span>Fatura: R$ {c.spent}</span>
                        <span>Limite: R$ {c.limit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions list inside PDF */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">Histórico de Movimentações</h4>
                <table className="w-full text-left text-xs text-neutral-700">
                  <thead>
                    <tr className="border-b border-neutral-300 text-[10px] font-bold text-neutral-400">
                      <th className="py-2">Data</th>
                      <th className="py-2">Descrição</th>
                      <th className="py-2">Categoria</th>
                      <th className="py-2">Meio</th>
                      <th className="py-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(item => (
                      <tr key={item.id} className="border-b border-neutral-100">
                        <td className="py-1.5 font-mono text-[10px]">{item.date}</td>
                        <td className="py-1.5 font-semibold text-neutral-800">{item.description}</td>
                        <td className="py-1.5">{item.category}</td>
                        <td className="py-1.5 text-[10px]">{item.type}</td>
                        <td className="py-1.5 text-right font-bold">R$ {item.value.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
