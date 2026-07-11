import { customExpenseCategoriesService } from "@/services/firebaseService";
import { useCategoryStore } from "@/store/useCategoryStore";

export function subscribeUserCategories(userId: string): () => void {
  return customExpenseCategoriesService.subscribe((rows) => {
    const names = rows.filter((r) => r.userId === userId).map((r) => r.name);
    useCategoryStore.getState().setRemoteCategories(names);
  });
}
