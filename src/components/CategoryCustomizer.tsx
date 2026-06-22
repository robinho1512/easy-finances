/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Category } from "../types";
import CategoryIcon from "./CategoryIcon";
import { Plus, Trash2, Edit3, Sliders, Check, Smartphone, Key, Award, Phone, GraduationCap, Plane, DollarSign } from "lucide-react";

interface CategoryCustomizerProps {
  categories: Category[];
  onAddCategory: (cat: Category) => void;
  onUpdateCategoryBudget: (catId: string, budget: number) => void;
  onDeleteCategory: (catId: string) => void;
}

const AVAILABLE_ICONS = [
  "Utensils",
  "Car",
  "Gamepad",
  "Home",
  "Heart",
  "ShoppingBag",
  "Percent",
  "Phone",
  "GraduationCap",
  "Plane",
  "Award",
  "Key",
  "DollarSign"
];

const PRESET_COLORS = [
  "#EC6E34", // Alimentação
  "#3B82F6", // Transporte
  "#8B5CF6", // Lazer
  "#10B981", // Moradia
  "#F43F5E", // Saúde
  "#F59E0B", // Mercado
  "#64748B", // Outros
  "#06B6D4", // Info/Cyber
  "#EC4899", // Vestuário/Pink
  "#14B8A6", // Teal/Utility
];

export default function CategoryCustomizer({
  categories,
  onAddCategory,
  onUpdateCategoryBudget,
  onDeleteCategory,
}: CategoryCustomizerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBudget, setEditBudget] = useState("");

  // Add form states
  const [name, setName] = useState("");
  const [color, setColor] = useState("#EC6E34");
  const [icon, setIcon] = useState("Utensils");
  const [budget, setBudget] = useState("500");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddCategory({
      id: "cat-" + Math.random().toString(36).substring(2, 9),
      name,
      color,
      icon,
      budget: budget ? parseFloat(budget) : undefined,
    });

    setName("");
    setColor("#EC6E34");
    setIcon("Utensils");
    setBudget("500");
    setShowAddForm(false);
  };

  const startEditingBudget = (cat: Category) => {
    setEditingId(cat.id);
    setEditBudget(cat.budget ? cat.budget.toString() : "500");
  };

  const saveBudget = (catId: string) => {
    onUpdateCategoryBudget(catId, parseFloat(editBudget) || 0);
    setEditingId(null);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 transition-colors shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-semibold text-neutral-850 dark:text-neutral-100 text-lg">
            Personalizar Categorias & Limites
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Adicione categorias exclusivas e gerencie tetos de gastos mensais
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? "Fechar" : "Nova Categoria"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800 rounded-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Nova Categoria Personalizada
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                Nome da Categoria
              </label>
              <input
                type="text"
                required
                placeholder="Ex Academia, Vestuário..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 text-xs py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                Planejamento Mensal / Teto (R$)
              </label>
              <input
                type="number"
                placeholder="Ex 500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-3 text-xs py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-800 dark:text-neutral-100 font-semibold"
              />
            </div>

            {/* Custom color presets */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-1">
                Cor de Identificação
              </label>
              <div className="flex gap-2 flex-wrap items-center mt-1">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`w-6 h-6 rounded-full border-2 ${
                      color === col ? "border-neutral-900 dark:border-neutral-100 scale-110 shadow-sm" : "border-transparent"
                    } cursor-pointer`}
                    style={{ backgroundColor: col }}
                  />
                ))}
                
                {/* Advanced selector */}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border-none cursor-pointer outline-none bg-transparent"
                  title="Cor customizada"
                />
              </div>
            </div>

            {/* Vector Icons custom picks */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-450 mb-2">
                Selecione um Ícone Vetorial
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                {AVAILABLE_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      icon === ic
                        ? "bg-indigo-50 dark:bg-indigo-950/45 border-indigo-500 text-indigo-500"
                        : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                    }`}
                    title={ic}
                  >
                    <CategoryIcon name={ic} className="w-4 h-4" />
                  </button>
                ))}
              </div>
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
              Criar Categoria
            </button>
          </div>
        </form>
      )}

      {/* Grid representation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="border border-neutral-150 dark:border-neutral-800 rounded-2xl p-4 bg-neutral-50/50 dark:bg-neutral-850/25 flex flex-col justify-between hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-150">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    ID: {cat.id}
                  </span>
                </div>
              </div>

              {/* Prevent deleting default core categories unless required */}
              {!["Alimentação", "Transporte", "Lazer", "Moradia", "Saúde"].includes(cat.name) && (
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="text-neutral-400 hover:text-rose-500 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Budget modifier form inline */}
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              {editingId === cat.id ? (
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-2 text-xs py-1 rounded-lg outline-none text-neutral-800 dark:text-neutral-100 font-semibold"
                    placeholder="Teto R$"
                  />
                  <button
                    onClick={() => saveBudget(cat.id)}
                    className="p-1 bg-emerald-500 text-white rounded-lg cursor-pointer"
                    title="Salvar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 text-[10px] block font-semibold">Teto Mensal</span>
                    <span className="text-neutral-700 dark:text-neutral-300 font-bold">
                      R$ {cat.budget ? cat.budget.toFixed(0) : "Não definido"}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => startEditingBudget(cat)}
                    className="text-indigo-500 hover:text-indigo-600 hover:underline flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Alterar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
