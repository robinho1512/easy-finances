/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserSettings } from "../types";
import { UploadCloud, DownloadCloud, Moon, Sun, Fingerprint, Bell, ShieldAlert, FileJson, Check, AlertTriangle, Key } from "lucide-react";

interface CloudSecurityPanelProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onSaveCloudBackup: (accountName: string) => Promise<{ success: boolean; message: string }>;
  onLoadCloudBackup: (accountName: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  onLocalExport: () => void;
  onLocalImport: (fileContent: string) => void;
}

export default function CloudSecurityPanel({
  settings,
  onUpdateSettings,
  onSaveCloudBackup,
  onLoadCloudBackup,
  onLocalExport,
  onLocalImport,
}: CloudSecurityPanelProps) {
  const [accountName, setAccountName] = useState("usuario_financas");
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [backupStatusMessage, setBackupStatusMessage] = useState<string | null>(null);
  const [isErrorMsg, setIsErrorMsg] = useState(false);

  const handleSaveBackup = async () => {
    if (!accountName.trim()) return;
    setIsBackupLoading(true);
    setBackupStatusMessage(null);
    setIsErrorMsg(false);

    try {
      const res = await onSaveCloudBackup(accountName);
      if (res.success) {
        setBackupStatusMessage(res.message);
      } else {
        setIsErrorMsg(true);
        setBackupStatusMessage("Falha ao salvar no banco em nuvem: " + res.message);
      }
    } catch (e: any) {
      setIsErrorMsg(true);
      setBackupStatusMessage("Erro operacional do servidor de backups.");
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleLoadBackup = async () => {
    if (!accountName.trim()) return;
    setIsBackupLoading(true);
    setBackupStatusMessage(null);
    setIsErrorMsg(false);

    try {
      const res = await onLoadCloudBackup(accountName);
      if (res.success) {
        setBackupStatusMessage("Backup carregado com sucesso da nuvem! Atualizando finanças...");
      } else {
        setIsErrorMsg(true);
        setBackupStatusMessage(res.error || "Conta de backup não encontrada.");
      }
    } catch (e: any) {
      setIsErrorMsg(true);
      setBackupStatusMessage("Erro ao recuperar banco de dados da nuvem.");
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleFileReader = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        try {
          // Attempt dry parse to make sure it's valid
          JSON.parse(content);
          onLocalImport(content);
          alert("Backup local JSON importado e restaurado com sucesso!");
        } catch (err) {
          alert("O arquivo JSON escolhido é inválido.");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm space-y-6">
      
      {/* Toggles settings */}
      <div>
        <h3 className="font-semibold text-neutral-850 dark:text-neutral-100 text-lg mb-1">
          Configurações de Segurança & Usabilidade
        </h3>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
          Habilite recursos de proteção biométrica local, central de notificações e controle visual
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Darkmode toggle */}
          <button
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            className="flex items-center justify-between p-4 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-800/35 transition-colors text-left cursor-pointer"
          >
            <div>
              <span className="font-semibold text-xs text-neutral-700 dark:text-neutral-300 block">Modo Escuro</span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 block">Melhore a leitura noturna</span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-500">
              {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
          </button>

          {/* Biometrics Toggle */}
          <button
            onClick={() => {
              const nextVal = !settings.biometricEnabled;
              onUpdateSettings({ biometricEnabled: nextVal });
              if (nextVal) {
                alert("Proteção de cartões ativada! Certas áreas agora exigirão autenticação biométrica simulada para visualização.");
              }
            }}
            className="flex items-center justify-between p-4 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-800/35 transition-colors text-left cursor-pointer"
          >
            <div>
              <span className="font-semibold text-xs text-neutral-700 dark:text-neutral-300 block">Bloqueio Biométrico</span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 block">Garante privacidade de cartões</span>
            </div>
            <div className={`p-2 rounded-lg text-white ${settings.biometricEnabled ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-800 text-neutral-500"}`}>
              <Fingerprint className="w-4 h-4" />
            </div>
          </button>

          {/* Custom Notification toggle */}
          <button
            onClick={() => onUpdateSettings({ pushNotificationsEnabled: !settings.pushNotificationsEnabled })}
            className="flex items-center justify-between p-4 rounded-xl border border-neutral-150 dark:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50 dark:hover:bg-neutral-800/35 transition-colors text-left cursor-pointer"
          >
            <div>
              <span className="font-semibold text-xs text-neutral-700 dark:text-neutral-300 block">Notificações Push</span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 block">Disparo de vencimentos fixos</span>
            </div>
            <div className={`p-2 rounded-lg text-white ${settings.pushNotificationsEnabled ? "bg-indigo-500 animate-pulse" : "bg-neutral-300 dark:bg-neutral-800 text-neutral-500"}`}>
              <Bell className="w-4 h-4" />
            </div>
          </button>

        </div>
      </div>

      {/* Cloud backup mechanism */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <h4 className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm mb-1 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-500" />
          Serviço de Backup Seguro na Nuvem (Controle Remoto)
        </h4>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
          Envie todo o seu ledger financeiro criptografado para o nosso banco de backups em nuvem, protegendo seus dados contra exclusão acidental do navegador.
        </p>

        <div className="bg-neutral-50 dark:bg-neutral-850 p-4 rounded-2xl border border-neutral-150 dark:border-neutral-800 space-y-4">
          <div className="max-w-md">
            <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
              Apelido ou Cédula da Conta Cloud
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="meu_backup_seguro"
                className="bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-mono flex-1 font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSaveBackup}
              disabled={isBackupLoading}
              className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Enviar para Nuvem
            </button>

            <button
              onClick={handleLoadBackup}
              disabled={isBackupLoading}
              className="flex items-center gap-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              Sincronizar Cloud Data
            </button>
          </div>

          {backupStatusMessage && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              isErrorMsg 
                ? "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30" 
                : "bg-emerald-55/10 text-emerald-800 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/20"
            }`}>
              {isErrorMsg ? <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" /> : <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500 font-bold" />}
              <span>{backupStatusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Local manual file Backup */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <h4 className="font-semibold text-neutral-850 dark:text-neutral-150 text-sm mb-1 flex items-center gap-2">
          <FileJson className="w-4 h-4 text-indigo-500" />
          Arquivo Backup Local (Offline)
        </h4>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
          Baixe um snapshot JSON local dos seus dados ou carregue um arquivo gerado anteriormente.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onLocalExport}
            className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4" />
            Exportar Arquivo JSON
          </button>

          <label className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm cursor-pointer border-none">
            <UploadCloud className="w-4 h-4" />
            Importar Arquivo JSON
            <input
              type="file"
              accept=".json"
              onChange={handleFileReader}
              className="hidden"
            />
          </label>
        </div>
      </div>

    </div>
  );
}
