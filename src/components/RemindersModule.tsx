/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { BillReminder } from "../types";
import { Plus, Bell, Calendar, BadgeAlert, CheckCircle2, Circle, Trash2, Sliders, Smartphone, Check } from "lucide-react";

interface RemindersModuleProps {
  reminders: BillReminder[];
  onAddReminder: (rem: Omit<BillReminder, "id" | "notified">) => void;
  onToggleReminderPaid: (remId: string) => void;
  onDeleteReminder: (remId: string) => void;
  pushGloballyEnabled: boolean;
  onTriggerInAppToast: (message: string) => void;
}

export default function RemindersModule({
  reminders,
  onAddReminder,
  onToggleReminderPaid,
  onDeleteReminder,
  pushGloballyEnabled,
  onTriggerInAppToast,
}: RemindersModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("Moradia");
  const [autoDebit, setAutoDebit] = useState(false);

  // Push Config Simulation states
  const [preNotifyDays, setPreNotifyDays] = useState("2");
  const [pushHour, setPushHour] = useState("09:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !value || !dueDate) return;

    onAddReminder({
      title,
      value: parseFloat(value),
      dueDate,
      category,
      isPaid: false,
      autoDebit,
    });

    // Notify user to simulate custom push notifications instantly
    if (pushGloballyEnabled) {
      onTriggerInAppToast(`Lembrete criado! Enviaremos uma Notificação Push ${preNotifyDays} dias antes do vencimento às ${pushHour}h.`);
    }

    // Reset Form
    setTitle("");
    setValue("");
    setDateToDefault();
    setAutoDebit(false);
    setShowAddForm(false);
  };

  const setDateToDefault = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7); // Default due in 1 week
    setDueDate(today.toISOString().split("T")[0]);
  };

  // Determine late/overdue status
  const checkIsOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dateStr);
    due.setHours(0,0,0,0);
    return due < today;
  };

  const getFormattedDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  const overdueBills = reminders.filter((r) => !r.isPaid && checkIsOverdue(r.dueDate));
  const upcomingBills = reminders.filter((r) => !r.isPaid && !checkIsOverdue(r.dueDate));

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm space-y-6">
      
      {/* Module Title info */}
      <div className="flex justify-between items-center pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="font-semibold text-neutral-850 dark:text-neutral-100 text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" />
            Lembretes de Vencimento de Boletos
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Monitore suas despesas fixas recorrentes e configure alarmes de notificação
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) setDateToDefault();
          }}
          className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agendar Conta
        </button>
      </div>

      {/* Red Alert on actually late bills */}
      {overdueBills.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-250 dark:border-rose-900/40 dark:bg-rose-950/15 p-4 rounded-xl flex items-start gap-3.5 animate-fadeIn">
          <BadgeAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wide">
              {overdueBills.length} Conta{overdueBills.length > 1 ? "s" : ""} em Atraso Identificada{overdueBills.length > 1 ? "s" : ""}!
            </h4>
            <div className="mt-1.5 space-y-1">
              {overdueBills.map((bill) => (
                <div key={bill.id} className="text-xs text-rose-700 dark:text-rose-350 flex justify-between items-center max-w-sm">
                  <span>• <b>{bill.title}</b> (venceu dia {getFormattedDate(bill.dueDate)})</span>
                  <span className="font-bold">R$ {bill.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800 rounded-xl space-y-4 animate-fadeIn">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Vincular Fatura de Consumo
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">Título do Boleto / Credor</label>
              <input
                type="text"
                required
                placeholder="Ex Enel Distribuidora, Aluguel Adicional..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">Valor do Compromisso (R$)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">Data de Vencimento</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">Categoria de Custeio</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none text-neutral-800 dark:text-neutral-150"
              >
                <option value="Moradia">Moradia</option>
                <option value="Saúde">Saúde</option>
                <option value="Lazer">Lazer</option>
                <option value="Alimentação">Alimentação</option>
                <option value="Transporte">Transporte</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoDebitCheckbox"
                checked={autoDebit}
                onChange={(e) => setAutoDebit(e.target.checked)}
                className="rounded border-neutral-300 text-indigo-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="autoDebitCheckbox" className="text-xs text-neutral-600 dark:text-neutral-400 select-none cursor-pointer">
                Agendado no <b>Débito Automático</b> bancário
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-4 py-1.5 rounded-xl font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-1.5 rounded-xl font-bold shadow-sm cursor-pointer"
            >
              Criar Alerta
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Unpaid / Upcoming Reminder list */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Contas Ativas e Pendentes ({upcomingBills.length + overdueBills.length})
          </h4>

          {reminders.filter(r => !r.isPaid).length === 0 ? (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-850 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
              <span className="text-xs text-neutral-450 dark:text-neutral-500">Nenhum vencimento ativo agendado. Parabéns!</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reminders
                .filter((r) => !r.isPaid)
                .sort((a,b) => a.dueDate.localeCompare(b.dueDate))
                .map((rem) => {
                  const isLate = checkIsOverdue(rem.dueDate);
                  return (
                    <div
                      key={rem.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                        isLate
                          ? "border-rose-150 bg-rose-50/20 dark:border-rose-900/30 dark:bg-rose-950/5"
                          : "border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-850/15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleReminderPaid(rem.id)}
                          className="text-neutral-400 dark:text-neutral-600 hover:text-indigo-500 transition-colors cursor-pointer"
                          title="Marcar como Liquidado"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        
                        <div>
                          <p className="font-semibold text-xs text-neutral-800 dark:text-neutral-100">
                            {rem.title}
                          </p>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            Vence dia {rem.dueDate.replace(/-/g, "/")} {rem.autoDebit && "• Débito Aut."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-xs ${isLate ? "text-rose-500" : "text-neutral-800 dark:text-neutral-200"}`}>
                          R$ {rem.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                        
                        <button
                          onClick={() => onDeleteReminder(rem.id)}
                          className="text-neutral-450 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Paid History Reminders / Notification Push simulator */}
        <div className="space-y-4">
          
          <div className="space-y-3 p-4 bg-neutral-50/60 dark:bg-neutral-850/25 border border-neutral-150 dark:border-neutral-800 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              Alarme de Notificações Push
            </h4>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300 block">Status dos Push Logs</span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">O sistema alertará o vencimento de boletos</span>
                </div>
                
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  pushGloballyEnabled 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" 
                    : "bg-neutral-150 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                }`}>
                  {pushGloballyEnabled ? "Ativado" : "Desativado"}
                </span>
              </div>

              {pushGloballyEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                    <div>
                      <label className="block text-neutral-450 mb-1">Antecedência (dias)</label>
                      <select
                        value={preNotifyDays}
                        onChange={(e) => setPreNotifyDays(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded font-semibold text-neutral-850 dark:text-neutral-100 outline-none"
                      >
                        <option value="1">1 dia antes</option>
                        <option value="2">2 dias antes</option>
                        <option value="5">5 dias antes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-450 mb-1">Horário do Disparo</label>
                      <select
                        value={pushHour}
                        onChange={(e) => setPushHour(e.target.value)}
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 rounded font-semibold text-neutral-850 dark:text-neutral-100 outline-none"
                      >
                        <option value="08:00">08:00 (Início)</option>
                        <option value="09:00">09:00 (Manhã)</option>
                        <option value="12:00">12:00 (Meio Dia)</option>
                        <option value="18:00">18:00 (Noite)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onTriggerInAppToast("🔔 Notificação de Alerta: O boleto 'Plano de Saúde Unimed' vence em 2 dias. Evite atrasos e pague agora!")}
                    className="w-full text-center bg-indigo-500 hover:bg-indigo-600 font-bold py-1.5 rounded-xl text-white mt-2 transition-all cursor-pointer text-[10px]"
                  >
                    Simular Envio de Push Push Now
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Paid accounts ledger list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Contas pagas este mês ({reminders.filter(r => r.isPaid).length})
            </h4>

            {reminders.filter(r => r.isPaid).length === 0 ? (
              <span className="text-[10px] text-neutral-400 block dark:text-neutral-500 italic">Nennum lembrete liquidado ainda.</span>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {reminders
                  .filter(r => r.isPaid)
                  .map(r => (
                    <div key={r.id} className="p-2 border border-neutral-100/50 dark:border-neutral-800 bg-neutral-50/10 rounded-lg flex justify-between items-center text-xs opacity-70">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-neutral-800 dark:text-neutral-300 font-medium line-through">{r.title}</span>
                      </div>
                      <span className="font-bold text-neutral-500">R$ {r.value.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
