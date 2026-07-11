import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export function exportScopedExcel(sheetName: string, rows: Record<string, string | number>[]) {
  if (rows.length === 0) {
    toast.error("لا توجد بيانات للتصدير");
    return;
  }
  try {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
    XLSX.writeFile(wb, `${sheetName}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("تم تصدير Excel");
  } catch {
    toast.error("فشل تصدير Excel");
  }
}
