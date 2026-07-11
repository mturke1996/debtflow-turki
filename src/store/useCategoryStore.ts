import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  normalizeCategoryLabel,
  isDefaultCategory,
} from "@/constants/expenseCategories";
import { customExpenseCategoriesService } from "@/services/firebaseService";

interface CategoryState {
  customCategories: string[];
  remoteSynced: boolean;
  setRemoteCategories: (names: string[]) => void;
  addCategory: (name: string, userId?: string) => Promise<boolean>;
  removeCategory: (name: string, userId?: string) => Promise<void>;
  getAllCategories: () => string[];
}

function uniqueSorted(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const n = normalizeCategoryLabel(raw);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

export function getAllExpenseCategories(customCategories: string[]): string[] {
  return uniqueSorted([...DEFAULT_EXPENSE_CATEGORIES, ...customCategories]);
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      customCategories: [],
      remoteSynced: false,

      setRemoteCategories: (names: string[]) => {
        set({ customCategories: uniqueSorted(names), remoteSynced: true });
      },

      addCategory: async (name: string, userId?: string) => {
        const normalized = normalizeCategoryLabel(name);
        if (!normalized || normalized.length < 2) return false;
        const all = get().getAllCategories();
        if (all.includes(normalized)) return false;

        if (userId) {
          try {
            await customExpenseCategoriesService.add({
              name: normalized,
              userId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Omit<import("@/types").CustomExpenseCategory, "id">);
            return true;
          } catch {
            return false;
          }
        }

        set((s) => ({
          customCategories: [...s.customCategories, normalized],
        }));
        return true;
      },

      removeCategory: async (name: string, userId?: string) => {
        const normalized = normalizeCategoryLabel(name);
        if (isDefaultCategory(normalized)) return;

        if (userId) {
          const rows = await customExpenseCategoriesService.getAll();
          const row = rows.find((r) => r.name === normalized && r.userId === userId);
          if (row) await customExpenseCategoriesService.delete(row.id);
          return;
        }

        set((s) => ({
          customCategories: s.customCategories.filter((c) => c !== normalized),
        }));
      },

      getAllCategories: () => getAllExpenseCategories(get().customCategories),
    }),
    { name: "expense-categories", partialize: (s) => ({ customCategories: s.customCategories }) }
  )
);
