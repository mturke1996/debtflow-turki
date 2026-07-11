import * as XLSX from 'xlsx';
import type {
  Client,
  Invoice,
  Payment,
  Expense,
  ExpenseInvoice,
  StandaloneDebt,
  DebtParty,
} from '../types';
import {
  clientsService,
  invoicesService,
  paymentsService,
  expensesService,
  expenseInvoicesService,
  standaloneDebtsService,
  debtPartiesService,
} from './firebaseService';

export const BACKUP_VERSION = '1.1.0';
export const BACKUP_META_KEY = 'debtflow-backup-meta';

export interface BackupData {
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  expenseInvoices: ExpenseInvoice[];
  standaloneDebts: StandaloneDebt[];
  debtParties: DebtParty[];
  exportDate: string;
  version: string;
}

export interface BackupStats {
  clients: number;
  invoices: number;
  payments: number;
  expenses: number;
  expenseInvoices: number;
  standaloneDebts: number;
  debtParties: number;
  total: number;
}

export interface BackupMeta {
  lastExportAt: string;
  lastExportFormat: 'excel' | 'json';
  recordCount: number;
}

export interface RestoreResult {
  imported: BackupStats;
  durationMs: number;
}

export type RestoreProgressCallback = (label: string, percent: number) => void;

export const getBackupStats = (data: Partial<BackupData>): BackupStats => {
  const stats: BackupStats = {
    clients: data.clients?.length ?? 0,
    invoices: data.invoices?.length ?? 0,
    payments: data.payments?.length ?? 0,
    expenses: data.expenses?.length ?? 0,
    expenseInvoices: data.expenseInvoices?.length ?? 0,
    standaloneDebts: data.standaloneDebts?.length ?? 0,
    debtParties: data.debtParties?.length ?? 0,
    total: 0,
  };
  stats.total =
    stats.clients +
    stats.invoices +
    stats.payments +
    stats.expenses +
    stats.expenseInvoices +
    stats.standaloneDebts +
    stats.debtParties;
  return stats;
};

export const readBackupMeta = (): BackupMeta | null => {
  try {
    const raw = localStorage.getItem(BACKUP_META_KEY);
    return raw ? (JSON.parse(raw) as BackupMeta) : null;
  } catch {
    return null;
  }
};

export const writeBackupMeta = (meta: BackupMeta): void => {
  localStorage.setItem(BACKUP_META_KEY, JSON.stringify(meta));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
};

export const parseBackupFile = async (file: File): Promise<Partial<BackupData>> => {
  if (file.name.endsWith('.json')) {
    return importFromJson(file);
  }
  return importFromExcel(file);
};

export const restoreBackupToFirestore = async (
  data: Partial<BackupData>,
  onProgress?: RestoreProgressCallback
): Promise<RestoreResult> => {
  const started = Date.now();
  const imported = getBackupStats({});

  type RestoreStep = {
    key: keyof Omit<BackupStats, "total">;
    label: string;
    items?: { id: string }[];
    upsert: (id: string, payload: Record<string, unknown>) => Promise<void>;
    toPayload: (item: { id: string }) => Record<string, unknown>;
  };

  const steps: RestoreStep[] = [
    {
      key: "clients",
      label: "العملاء",
      items: data.clients,
      upsert: (id, payload) => clientsService.setWithId(id, payload as never),
      toPayload: (item) => {
        const { id: _id, ...rest } = item as Client;
        return rest;
      },
    },
    {
      key: "debtParties",
      label: "أطراف الديون",
      items: data.debtParties,
      upsert: (id, payload) => debtPartiesService.setWithId(id, payload as never),
      toPayload: (item) => {
        const { id: _id, ...rest } = item as DebtParty;
        return rest;
      },
    },
    {
      key: "invoices",
      label: "الفواتير",
      items: data.invoices,
      upsert: (id, payload) => invoicesService.setWithId(id, payload as never),
      toPayload: (item) => {
        const { id: _id, ...rest } = item as Invoice;
        return rest;
      },
    },
    {
      key: "payments",
      label: "المدفوعات",
      items: data.payments,
      upsert: (id, payload) => paymentsService.setWithId(id, payload as never),
      toPayload: (item) => {
        const { id: _id, ...rest } = item as Payment;
        return rest;
      },
    },
    {
      key: "expenses",
      label: "المصروفات",
      items: data.expenses,
      upsert: (id, payload) => expensesService.setWithId(id, payload as never),
      toPayload: (item) => {
        const { id: _id, ...rest } = item as Expense;
        return rest;
      },
    },
    {
      key: "expenseInvoices",
      label: "فواتير المصروفات",
      items: data.expenseInvoices,
      upsert: (id, payload) => expenseInvoicesService.setWithId(id, payload as never),
      toPayload: (item) => {
        const { id: _id, ...rest } = item as ExpenseInvoice;
        return rest;
      },
    },
    {
      key: "standaloneDebts",
      label: "الديون",
      items: data.standaloneDebts,
      upsert: (id, payload) => standaloneDebtsService.setWithId(id, payload as never),
      toPayload: (item) => {
        const { id: _id, ...rest } = item as StandaloneDebt;
        return rest;
      },
    },
  ];

  const activeSteps = steps.filter((step) => step.items?.length);
  const totalSteps = activeSteps.length || 1;
  let stepIndex = 0;

  for (const step of activeSteps) {
    stepIndex += 1;
    onProgress?.(step.label, Math.round((stepIndex / totalSteps) * 90));

    let count = 0;
    for (const item of step.items ?? []) {
      if (!item.id) continue;
      await step.upsert(item.id, step.toPayload(item));
      count += 1;
    }
    imported[step.key] = count;
  }

  imported.total =
    imported.clients +
    imported.invoices +
    imported.payments +
    imported.expenses +
    imported.expenseInvoices +
    imported.standaloneDebts +
    imported.debtParties;

  onProgress?.("اكتمل", 100);

  return {
    imported,
    durationMs: Date.now() - started,
  };
};

/**
 * Export all data to Excel file
 */
export const exportToExcel = (data: BackupData): void => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Add Clients sheet
    const clientsSheet = XLSX.utils.json_to_sheet(
      data.clients.map((client) => ({
        'المعرف': client.id,
        'الاسم': client.name,
        'البريد الإلكتروني': client.email,
        'الهاتف': client.phone,
        'العنوان': client.address,
        'النوع': client.type === 'company' ? 'شركة' : 'فرد',
        'نسبة الأرباح': client.profitPercentage || 0,
        'تاريخ الإنشاء': client.createdAt,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, clientsSheet, 'العملاء');

    // Add Invoices sheet
    const invoicesSheet = XLSX.utils.json_to_sheet(
      data.invoices.map((invoice) => ({
        'المعرف': invoice.id,
        'رقم الفاتورة': invoice.invoiceNumber,
        'معرف العميل': invoice.clientId,
        'المجموع الفرعي': invoice.subtotal,
        'نسبة الضريبة': invoice.taxRate,
        'مبلغ الضريبة': invoice.taxAmount,
        'الإجمالي': invoice.total,
        'الحالة': invoice.status,
        'تاريخ الإصدار': invoice.issueDate,
        'تاريخ الاستحقاق': invoice.dueDate,
        'ملاحظات': invoice.notes || '',
        'تاريخ الإنشاء': invoice.createdAt,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, invoicesSheet, 'الفواتير');

    // Add Invoice Items sheet
    const invoiceItems = data.invoices.flatMap((invoice) =>
      invoice.items.map((item) => ({
        'معرف الفاتورة': invoice.invoiceNumber,
        'الوصف': item.description,
        'الكمية': item.quantity,
        'سعر الوحدة': item.unitPrice,
        'الإجمالي': item.total,
      }))
    );
    const invoiceItemsSheet = XLSX.utils.json_to_sheet(invoiceItems);
    XLSX.utils.book_append_sheet(workbook, invoiceItemsSheet, 'بنود الفواتير');

    // Add Payments sheet
    const paymentsSheet = XLSX.utils.json_to_sheet(
      data.payments.map((payment) => ({
        'المعرف': payment.id,
        'معرف الفاتورة': payment.invoiceId,
        'معرف العميل': payment.clientId,
        'المبلغ': payment.amount,
        'طريقة الدفع': payment.paymentMethod,
        'تاريخ الدفع': payment.paymentDate,
        'ملاحظات': payment.notes || '',
        'تاريخ الإنشاء': payment.createdAt,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, paymentsSheet, 'المدفوعات');

    // Add Expenses sheet
    const expensesSheet = XLSX.utils.json_to_sheet(
      data.expenses.map((expense) => ({
        'المعرف': expense.id,
        'معرف العميل': expense.clientId,
        'الوصف': expense.description,
        'المبلغ': expense.amount,
        'الفئة': expense.category,
        'التاريخ': expense.date,
        'مغلق': expense.isClosed ? 'نعم' : 'لا',
        'تاريخ الإغلاق': expense.closedAt || '',
        'معرف فاتورة المصروفات': expense.expenseInvoiceId || '',
        'ملاحظات': expense.notes || '',
        'تاريخ الإنشاء': expense.createdAt,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'المصروفات');

    // Add Expense Invoices sheet
    const expenseInvoicesSheet = XLSX.utils.json_to_sheet(
      data.expenseInvoices.map((expInv) => ({
        'المعرف': expInv.id,
        'رقم الفاتورة': expInv.invoiceNumber,
        'معرف العميل': expInv.clientId,
        'تاريخ البداية': expInv.startDate,
        'تاريخ النهاية': expInv.endDate,
        'المبلغ الإجمالي': expInv.totalAmount,
        'الحالة': expInv.status,
        'تاريخ الإصدار': expInv.issueDate,
        'ملاحظات': expInv.notes || '',
        'تاريخ الإنشاء': expInv.createdAt,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, expenseInvoicesSheet, 'فواتير المصروفات');

    // Add Standalone Debts sheet
    const debtsSheet = XLSX.utils.json_to_sheet(
      data.standaloneDebts.map((debt) => ({
        'المعرف': debt.id,
        'معرف العميل': debt.clientId,
        'معرف الطرف': debt.partyId,
        'نوع الطرف': debt.partyType,
        'اسم الطرف': debt.partyName,
        'الوصف': debt.description,
        'المبلغ': debt.amount,
        'المبلغ المدفوع': debt.paidAmount,
        'المبلغ المتبقي': debt.remainingAmount,
        'الحالة': debt.status,
        'التاريخ': debt.date,
        'ملاحظات': debt.notes || '',
        'تاريخ الإنشاء': debt.createdAt,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, debtsSheet, 'الديون');

    // Add Debt Parties sheet
    const debtPartiesSheet = XLSX.utils.json_to_sheet(
      data.debtParties.map((party) => ({
        'المعرف': party.id,
        'معرف العميل': party.clientId,
        'الاسم': party.name,
        'الهاتف': party.phone,
        'العنوان': party.address,
        'النوع': party.type,
        'تاريخ الإنشاء': party.createdAt,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, debtPartiesSheet, 'أطراف الديون');

    // Add metadata sheet
    const metadataSheet = XLSX.utils.json_to_sheet([
      {
        'تاريخ التصدير': data.exportDate,
        'الإصدار': data.version,
        'عدد العملاء': data.clients.length,
        'عدد الفواتير': data.invoices.length,
        'عدد المدفوعات': data.payments.length,
        'عدد المصروفات': data.expenses.length,
        'عدد فواتير المصروفات': data.expenseInvoices.length,
        'عدد الديون': data.standaloneDebts.length,
        'عدد أطراف الديون': data.debtParties.length,
      },
    ]);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'معلومات النسخة');

    // Generate Excel file
    const fileName = `DebtFlow_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('فشل تصدير البيانات إلى Excel');
  }
};

/**
 * Export data to JSON file
 */
export const exportToJson = (data: BackupData): void => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `DebtFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('فشل تصدير البيانات إلى JSON');
  }
};

/**
 * Import data from Excel file
 */
export const importFromExcel = async (
  file: File
): Promise<Partial<BackupData>> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    const result: Partial<BackupData> = {};

    // Import Clients
    if (workbook.SheetNames.includes('العملاء')) {
      const clientsSheet = workbook.Sheets['العملاء'];
      const clientsData = XLSX.utils.sheet_to_json(clientsSheet);
      result.clients = clientsData.map((row: any) => ({
        id: row['المعرف'],
        name: row['الاسم'],
        email: row['البريد الإلكتروني'],
        phone: row['الهاتف'],
        address: row['العنوان'],
        type: row['النوع'] === 'شركة' ? 'company' : 'individual',
        profitPercentage: row['نسبة الأرباح'] || 0,
        createdAt: row['تاريخ الإنشاء'],
        updatedAt: new Date().toISOString(),
      }));
    }

    // Import Invoices
    if (workbook.SheetNames.includes('الفواتير')) {
      const invoicesSheet = workbook.Sheets['الفواتير'];
      const invoicesData = XLSX.utils.sheet_to_json(invoicesSheet);
      
      // Get invoice items
      let invoiceItemsMap: Record<string, any[]> = {} as Record<string, any[]>;
      if (workbook.SheetNames.includes('بنود الفواتير')) {
        const itemsSheet = workbook.Sheets['بنود الفواتير'];
        const itemsData = XLSX.utils.sheet_to_json(itemsSheet);
        invoiceItemsMap = (itemsData as Record<string, unknown>[]).reduce<Record<string, any[]>>(
          (acc, item) => {
          const row = item as Record<string, unknown>;
          const invoiceNum = String(row['معرف الفاتورة'] ?? '');
          if (!acc[invoiceNum]) acc[invoiceNum] = [];
          acc[invoiceNum].push({
            id: `${invoiceNum}-${acc[invoiceNum].length}`,
            description: row['الوصف'],
            quantity: row['الكمية'],
            unitPrice: row['سعر الوحدة'],
            total: row['الإجمالي'],
          });
          return acc;
        }, {});
      }

      result.invoices = invoicesData.map((row: any) => ({
        id: row['المعرف'],
        invoiceNumber: row['رقم الفاتورة'],
        clientId: row['معرف العميل'],
        items: invoiceItemsMap[row['رقم الفاتورة']] || [],
        subtotal: row['المجموع الفرعي'],
        taxRate: row['نسبة الضريبة'],
        taxAmount: row['مبلغ الضريبة'],
        total: row['الإجمالي'],
        status: row['الحالة'],
        issueDate: row['تاريخ الإصدار'],
        dueDate: row['تاريخ الاستحقاق'],
        notes: row['ملاحظات'],
        createdAt: row['تاريخ الإنشاء'],
        updatedAt: new Date().toISOString(),
      }));
    }

    // Import Payments
    if (workbook.SheetNames.includes('المدفوعات')) {
      const paymentsSheet = workbook.Sheets['المدفوعات'];
      const paymentsData = XLSX.utils.sheet_to_json(paymentsSheet);
      result.payments = paymentsData.map((row: any) => ({
        id: row['المعرف'],
        invoiceId: row['معرف الفاتورة'],
        clientId: row['معرف العميل'],
        amount: row['المبلغ'],
        paymentMethod: row['طريقة الدفع'],
        paymentDate: row['تاريخ الدفع'],
        notes: row['ملاحظات'],
        createdAt: row['تاريخ الإنشاء'],
        updatedAt: new Date().toISOString(),
      }));
    }

    // Import Expenses
    if (workbook.SheetNames.includes('المصروفات')) {
      const expensesSheet = workbook.Sheets['المصروفات'];
      const expensesData = XLSX.utils.sheet_to_json(expensesSheet);
      result.expenses = expensesData.map((row: any) => ({
        id: row['المعرف'],
        clientId: row['معرف العميل'],
        description: row['الوصف'],
        amount: row['المبلغ'],
        category: row['الفئة'],
        date: row['التاريخ'],
        isClosed: row['مغلق'] === 'نعم',
        closedAt: row['تاريخ الإغلاق'],
        expenseInvoiceId: row['معرف فاتورة المصروفات'],
        notes: row['ملاحظات'],
        createdAt: row['تاريخ الإنشاء'],
        updatedAt: new Date().toISOString(),
      }));
    }

    // Import Expense Invoices
    if (workbook.SheetNames.includes('فواتير المصروفات')) {
      const expInvSheet = workbook.Sheets['فواتير المصروفات'];
      const expInvData = XLSX.utils.sheet_to_json(expInvSheet);
      result.expenseInvoices = expInvData.map((row: any) => ({
        id: row['المعرف'],
        invoiceNumber: row['رقم الفاتورة'],
        clientId: row['معرف العميل'],
        expenseIds: [],
        startDate: row['تاريخ البداية'],
        endDate: row['تاريخ النهاية'],
        totalAmount: row['المبلغ الإجمالي'],
        expenses: [],
        status: row['الحالة'],
        issueDate: row['تاريخ الإصدار'],
        notes: row['ملاحظات'],
        createdAt: row['تاريخ الإنشاء'],
        updatedAt: new Date().toISOString(),
      }));
    }

    // Import Standalone Debts
    if (workbook.SheetNames.includes('الديون')) {
      const debtsSheet = workbook.Sheets['الديون'];
      const debtsData = XLSX.utils.sheet_to_json(debtsSheet);
      result.standaloneDebts = debtsData.map((row: any) => ({
        id: row['المعرف'],
        clientId: row['معرف العميل'],
        partyId: row['معرف الطرف'],
        partyType: row['نوع الطرف'],
        partyName: row['اسم الطرف'],
        description: row['الوصف'],
        amount: row['المبلغ'],
        paidAmount: row['المبلغ المدفوع'],
        remainingAmount: row['المبلغ المتبقي'],
        status: row['الحالة'],
        date: row['التاريخ'],
        notes: row['ملاحظات'],
        createdAt: row['تاريخ الإنشاء'],
        updatedAt: new Date().toISOString(),
      }));
    }

    // Import Debt Parties
    if (workbook.SheetNames.includes('أطراف الديون')) {
      const partiesSheet = workbook.Sheets['أطراف الديون'];
      const partiesData = XLSX.utils.sheet_to_json(partiesSheet);
      result.debtParties = partiesData.map((row: any) => ({
        id: row['المعرف'],
        clientId: row['معرف العميل'],
        name: row['الاسم'],
        phone: row['الهاتف'],
        address: row['العنوان'],
        type: row['النوع'],
        createdAt: row['تاريخ الإنشاء'],
        updatedAt: new Date().toISOString(),
      }));
    }

    return result;
  } catch (error) {
    console.error('Error importing from Excel:', error);
    throw new Error('فشل استيراد البيانات من Excel');
  }
};

/**
 * Import data from JSON file
 */
export const importFromJson = async (
  file: File
): Promise<Partial<BackupData>> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('Error importing from JSON:', error);
    throw new Error('فشل استيراد البيانات من JSON');
  }
};

/**
 * Validate imported data
 */
export const validateBackupData = (data: Partial<BackupData>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validate clients
  if (data.clients) {
    data.clients.forEach((client, index) => {
      if (!client.id) errors.push(`العميل ${index + 1}: المعرف مفقود`);
      if (!client.name) errors.push(`العميل ${index + 1}: الاسم مفقود`);
      if (!client.email) errors.push(`العميل ${index + 1}: البريد الإلكتروني مفقود`);
      if (!client.phone) errors.push(`العميل ${index + 1}: الهاتف مفقود`);
    });
  }

  // Validate invoices
  if (data.invoices) {
    data.invoices.forEach((invoice, index) => {
      if (!invoice.id) errors.push(`الفاتورة ${index + 1}: المعرف مفقود`);
      if (!invoice.invoiceNumber) errors.push(`الفاتورة ${index + 1}: رقم الفاتورة مفقود`);
      if (!invoice.clientId) errors.push(`الفاتورة ${index + 1}: معرف العميل مفقود`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
