import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container,
  Avatar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  useTheme,
  Snackbar,
  Alert,
  Menu,
} from "@mui/material";
import {
  ArrowBack,
  Payment,
  Business,
  Person,
  Store,
  Add,
  TrendingDown,
  TrendingUp,
  Edit,
  Delete,
  CreditCard,
  PictureAsPdf,
  WhatsApp,
  Share,
} from "@mui/icons-material";
import { useDataStore } from "@/store/useDataStore";
import { useForm, Controller } from "react-hook-form";
import { formatCurrency } from "@/utils/calculations";
import { downloadPdf } from "@/utils/pdfService";
import { shareClientFinancialSummaryWhatsApp } from "@/utils/whatsappExport";
import {
  ClientFinalStyledPDF,
  ExpensesStyledPDF,
  PaymentsStyledPDF,
} from "@/components/pdf/StyledPDFs";
import { PageHeader } from "@/components/ui/PageHeader";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { KpiCard } from "@/components/ui/KpiCard";
import { ShortcutTile, type ShortcutTileTone } from "@/components/ui/ShortcutTile";
import { QuickExpenseSheet } from "@/components/expense/QuickExpenseSheet";
import { DialogScreenHeader } from "@/components/ui/DialogScreenHeader";
import { ClientLedgerScreen } from "@/components/client/ClientLedgerScreen";
import { ClientDebtsSection } from "@/components/client/ClientDebtsSection";
import { DEFAULT_EXPENSE_CATEGORY } from "@/constants/expenseCategories";
import { normalizeCategoryLabel } from "@/constants/expenseCategories";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema, normalizeClientEmail, type ClientFormData } from "@/schemas/clientSchema";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import type {
  Payment as PaymentType,
  Expense,
  StandaloneDebt,
  DebtParty,
} from "@/types";

dayjs.locale("ar");

export const ClientProfilePage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    clients,
    payments,
    expenses,
    standaloneDebts,
    invoices,
    debtParties,
    addPayment,
    updatePayment,
    deletePayment,
    addExpense,
    updateExpense,
    deleteExpense,
    addStandaloneDebt,
    updateStandaloneDebt,
    deleteStandaloneDebt,
    addDebtParty,
    updateDebtParty,
    updateClient,
    deleteClient,
  } = useDataStore();
  const confirm = useConfirm();

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingDebt, setEditingDebt] = useState<StandaloneDebt | null>(null);
  const [activeSection, setActiveSection] = useState<"expenses" | "payments" | null>(null);
  const [debtsListDialogOpen, setDebtsListDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(
    null
  );
  const [payDebtDialogOpen, setPayDebtDialogOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] =
    useState<StandaloneDebt | null>(null);
  const [payDebtAmount, setPayDebtAmount] = useState<string>("");
  const [partyProfileDialogOpen, setPartyProfileDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<DebtParty | null>(null);
  const [partyDialogOpen, setPartyDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<DebtParty | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [profitDialogOpen, setProfitDialogOpen] = useState(false);
  const [profitPercentage, setProfitPercentage] = useState<string>("");
  const [expensesSearchQuery, setExpensesSearchQuery] = useState("");
  const [paymentsSearchQuery, setPaymentsSearchQuery] = useState("");
  const [debtsSearchQuery, setDebtsSearchQuery] = useState("");
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);

  const client = clients.find((c) => c.id === clientId);

  // Client Edit Form
  const {
    control: clientControl,
    handleSubmit: handleClientSubmit,
    reset: resetClient,
    formState: { errors: clientErrors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      type: client?.type || "individual",
    },
  });

  // Update form when client changes
  useEffect(() => {
    if (client && editClientDialogOpen) {
      resetClient({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        type: client.type,
      });
    }
  }, [client, editClientDialogOpen, resetClient]);

  const onSubmitClient = async (data: ClientFormData) => {
    if (!clientId) return;
    try {
      await updateClient(clientId, { ...data, email: normalizeClientEmail(data.email) });
      setSnackbarMessage("تم تحديث بيانات العميل بنجاح");
      setSnackbarOpen(true);
      setEditClientDialogOpen(false);
    } catch (error: any) {
      setSnackbarMessage(error?.message || "حدث خطأ أثناء التحديث");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientId) return;
    const ok = await confirm({
      title: "حذف عميل",
      message: "هل أنت متأكد من حذف هذا العميل؟ سيتم حذف العميل نهائياً.",
      confirmLabel: "حذف",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteClient(clientId);
      setSnackbarMessage("تم حذف العميل بنجاح");
      setSnackbarOpen(true);
      navigate("/clients");
    } catch (error: any) {
      setSnackbarMessage(error?.message || "حدث خطأ أثناء الحذف");
      setSnackbarOpen(true);
    }
  };

  // Payment Form
  const {
    control: paymentControl,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    setValue: setPaymentValue,
  } = useForm<{
    amount: string | number;
    paymentMethod: "cash" | "check" | "bank_transfer" | "credit_card";
    paymentDate: string;
    invoiceId: string;
    notes: string;
  }>({
    defaultValues: {
      amount: "" as any,
      paymentMethod: "cash",
      paymentDate: dayjs().format("YYYY-MM-DD"),
      invoiceId: "",
      notes: "",
    },
  });

  // Expense Form
  const {
    control: expenseControl,
    handleSubmit: handleExpenseSubmit,
    reset: resetExpense,
    setValue: setExpenseValue,
  } = useForm<{
    description: string;
    amount: number | string;
    category: string;
    date: string;
    notes: string;
  }>({
    defaultValues: {
      description: "",
      amount: "" as any,
      category: DEFAULT_EXPENSE_CATEGORY,
      date: dayjs().format("YYYY-MM-DD"),
      notes: "",
    },
  });

  // Debt Form
  const {
    control: debtControl,
    handleSubmit: handleDebtSubmit,
    reset: resetDebt,
    setValue: setDebtValue,
  } = useForm({
    defaultValues: {
      partyType: "person" as "person" | "shop" | "company",
      partyName: "",
      description: "",
      amount: "" as any,
      date: dayjs().format("YYYY-MM-DD"),
      notes: "",
    },
  });

  // Party Form
  const {
    control: partyControl,
    handleSubmit: handlePartySubmit,
    reset: resetParty,
    setValue: setPartyValue,
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      type: "person" as "person" | "shop" | "company",
    },
  });

  // Update party form when editing
  useEffect(() => {
    if (editingParty) {
      setPartyValue("name", editingParty.name);
      setPartyValue("phone", editingParty.phone);
      setPartyValue("address", editingParty.address);
      setPartyValue("type", editingParty.type);
    } else {
      resetParty({
        name: "",
        phone: "",
        address: "",
        type: "person",
      });
    }
  }, [editingParty, setPartyValue, resetParty]);

  // Load profit percentage for this client from database
  useEffect(() => {
    if (!client) {
      setProfitPercentage("");
      return;
    }
    const percentage = client.profitPercentage;
    if (percentage !== undefined && percentage !== null) {
      setProfitPercentage(percentage.toString());
    } else {
      setProfitPercentage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client?.id, client?.profitPercentage]);

  // Handle save profit percentage for this client
  const handleSaveProfitPercentage = async () => {
    if (!clientId || !client) return;

    const percentage = parseFloat(profitPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setSnackbarMessage("النسبة يجب أن تكون بين 0 و 100");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Save to database
      await updateClient(clientId, {
        profitPercentage: percentage,
      });

      // Dispatch custom event to update HomePage
      window.dispatchEvent(new Event("profitPercentageUpdated"));
      setSnackbarMessage("تم حفظ النسبة بنجاح");
      setSnackbarOpen(true);
      setProfitDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving profit percentage:", error);
      setSnackbarMessage(error?.message || "حدث خطأ أثناء حفظ النسبة");
      setSnackbarOpen(true);
    }
  };

  const clientExpenses = useMemo(
    () =>
      expenses
        .filter((exp) => exp.clientId === clientId)
        .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt))),
    [expenses, clientId]
  );

  const clientPayments = useMemo(
    () =>
      payments
        .filter((pay) => pay.clientId === clientId)
        .sort((a, b) => dayjs(b.paymentDate).diff(dayjs(a.paymentDate))),
    [payments, clientId]
  );

  const clientDebts = useMemo(
    () =>
      standaloneDebts
        .filter((debt) => debt.clientId === clientId)
        .sort((a, b) => dayjs(b.date).diff(dayjs(a.date))),
    [standaloneDebts, clientId]
  );

  // Filtered data for search
  const filteredExpenses = useMemo(() => {
    if (!expensesSearchQuery) return clientExpenses;
    const query = expensesSearchQuery.toLowerCase();
    return clientExpenses.filter(
      (exp) =>
        exp.description.toLowerCase().includes(query) ||
        exp.category.toLowerCase().includes(query) ||
        exp.notes?.toLowerCase().includes(query) ||
        formatCurrency(exp.amount).includes(query)
    );
  }, [clientExpenses, expensesSearchQuery]);

  const filteredPayments = useMemo(() => {
    if (!paymentsSearchQuery) return clientPayments;
    const query = paymentsSearchQuery.toLowerCase();
    return clientPayments.filter(
      (pay) =>
        formatCurrency(pay.amount).includes(query) ||
        pay.paymentMethod.toLowerCase().includes(query) ||
        pay.notes?.toLowerCase().includes(query) ||
        dayjs(pay.paymentDate).format("DD/MM/YYYY").includes(query)
    );
  }, [clientPayments, paymentsSearchQuery]);

  // Get debt parties for this client
  const clientDebtParties = useMemo(() => {
    return debtParties.filter((p) => p.clientId === clientId);
  }, [debtParties, clientId]);

  // Group debts by party (using debt parties)
  const parties = useMemo(() => {
    return clientDebtParties
      .map((party) => {
        const partyDebts = clientDebts.filter(
          (d) =>
            (d as any).partyId === party.id ||
            ((d as any).partyName === party.name &&
              (d as any).partyType === party.type)
        );
        const totalAmount = partyDebts.reduce((sum, d) => sum + d.amount, 0);
        const totalPaid = partyDebts.reduce((sum, d) => sum + d.paidAmount, 0);
        const totalRemaining = partyDebts.reduce(
          (sum, d) => sum + d.remainingAmount,
          0
        );
        return {
          ...party,
          debts: partyDebts,
          totalAmount,
          totalPaid,
          totalRemaining,
        };
      })
      .sort((a, b) => dayjs(b.createdAt || "").diff(dayjs(a.createdAt || "")));
  }, [clientDebtParties, clientDebts]);

  // Filtered parties based on search
  const filteredParties = useMemo(() => {
    if (!debtsSearchQuery) return parties;
    const query = debtsSearchQuery.toLowerCase();
    return parties.filter(
      (party) =>
        party.name.toLowerCase().includes(query) ||
        party.phone?.toLowerCase().includes(query) ||
        party.address?.toLowerCase().includes(query) ||
        party.debts.some(
          (debt) =>
            debt.description?.toLowerCase().includes(query) ||
            formatCurrency(debt.amount).includes(query) ||
            formatCurrency(debt.remainingAmount).includes(query)
        )
    );
  }, [parties, debtsSearchQuery]);

  // Get debts for selected party
  const partyDebts = useMemo(() => {
    if (!selectedParty) return [];
    return clientDebts.filter(
      (debt) =>
        (debt as any).partyId === selectedParty.id ||
        ((debt as any).partyName === selectedParty.name &&
          (debt as any).partyType === selectedParty.type)
    );
  }, [clientDebts, selectedParty]);

  const partyStats = useMemo(() => {
    const totalAmount = partyDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPaid = partyDebts.reduce((sum, d) => sum + d.paidAmount, 0);
    const totalRemaining = partyDebts.reduce(
      (sum, d) => sum + d.remainingAmount,
      0
    );
    return { totalAmount, totalPaid, totalRemaining };
  }, [partyDebts]);

  const summary = useMemo(() => {
    const totalExpenses = clientExpenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalDebts = clientDebts.reduce(
      (sum, debt) => sum + (debt.remainingAmount || 0),
      0
    );
    const totalPaid = clientPayments.reduce((sum, pay) => sum + pay.amount, 0);

    // نسبة الربح / الشركة - تحتسب دائماً من إجمالي المصروفات
    const profitPercentage = client?.profitPercentage || 0;
    const profit =
      totalExpenses > 0 && profitPercentage > 0
        ? (totalExpenses * profitPercentage) / 100
        : 0;

    // إجمالي المستحق = المصروفات + نسبة الشركة + الديون غير المسددة
    const totalObligations = totalExpenses + profit + totalDebts;

    // صافي الرصيد = المدفوع - إجمالي المستحق
    const netBalance = totalPaid - totalObligations;
    const remaining = Math.max(0, totalObligations - totalPaid);
    const surplus = Math.max(0, totalPaid - totalObligations);

    return {
      totalExpenses,
      totalDebts,
      totalPaid,
      totalObligations,
      netBalance,
      remaining,
      surplus,
      profit,
      profitPercentage,
      expenseCount: clientExpenses.length,
      debtCount: clientDebts.length,
      paymentCount: clientPayments.length,
    };
  }, [clientExpenses, clientDebts, clientPayments, client]);

  const [pdfMenuAnchor, setPdfMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDownloadFinalReport = () => {
    if (!client) return;
    setPdfMenuAnchor(null);
    downloadPdf(
      <ClientFinalStyledPDF
        client={client}
        expenses={clientExpenses}
        payments={clientPayments}
        debts={clientDebts}
        profitPercentage={client.profitPercentage || 0}
      />,
      `التقرير-المالي-الشامل-${client.name}.pdf`
    );
  };

  const handleDownloadExpensesPdf = () => {
    if (!client) return;
    setPdfMenuAnchor(null);
    downloadPdf(
      <ExpensesStyledPDF client={client} expenses={clientExpenses} />,
      `تقرير-المصروفات-${client.name}.pdf`
    );
  };

  const handleDownloadPaymentsPdf = () => {
    if (!client) return;
    setPdfMenuAnchor(null);
    downloadPdf(
      <PaymentsStyledPDF client={client} payments={clientPayments} />,
      `تقرير-المدفوعات-${client.name}.pdf`
    );
  };

  const menuItems: Array<{
    title: string;
    subtitle: string;
    icon: any;
    tone: ShortcutTileTone;
    badge?: string;
    highlight?: boolean;
    onClick: () => void;
  }> = useMemo(
    () => [
      {
        title: "المصروفات",
        subtitle: `${summary.expenseCount} مصروف (${formatCurrency(summary.totalExpenses)})`,
        icon: TrendingDown,
        tone: "error",
        badge: summary.expenseCount > 0 ? `${summary.expenseCount}` : undefined,
        onClick: () => setActiveSection("expenses"),
      },
      {
        title: "المدفوعات",
        subtitle: `${summary.paymentCount} دفعة (${formatCurrency(summary.totalPaid)})`,
        icon: Payment,
        tone: "success",
        badge: summary.paymentCount > 0 ? `${summary.paymentCount}` : undefined,
        onClick: () => setActiveSection("payments"),
      },
      {
        title: "الديون",
        subtitle: `${summary.debtCount} دين (${formatCurrency(summary.totalDebts)})`,
        icon: CreditCard,
        tone: summary.totalDebts > 0 ? "warning" : "neutral",
        badge: summary.totalDebts > 0 ? "معلق" : undefined,
        onClick: () => setDebtsListDialogOpen(true),
      },
      {
        title: "نسبة الشركة",
        subtitle:
          summary.profitPercentage > 0
            ? `${summary.profitPercentage}% (${formatCurrency(summary.profit)})`
            : "تحديد نسبة الأرباح",
        icon: TrendingUp,
        tone: "info",
        badge:
          summary.profitPercentage > 0
            ? `${summary.profitPercentage}%`
            : undefined,
        onClick: () => setProfitDialogOpen(true),
      },
      {
        title: "التقرير المالي الشامل",
        subtitle: "عرض وتصدير تقرير PDF عالي الوضوح",
        icon: PictureAsPdf,
        tone: "purple",
        badge: "PDF عالي الدقة",
        highlight: true,
        onClick: handleDownloadFinalReport,
      },
      {
        title: "مشاركة كشف الحساب",
        subtitle: "إرسال ملخص الحساب عبر واتساب بدون روابط",
        icon: WhatsApp,
        tone: "success",
        badge: "واتساب",
        onClick: () => {
          if (!client) return;
          shareClientFinancialSummaryWhatsApp(client, summary);
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [summary, client]
  );

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseDialogOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const ok = await confirm({
      title: "حذف مصروف",
      message: "هل أنت متأكد من حذف هذا المصروف؟",
      confirmLabel: "حذف",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteExpense(expenseId);
      setSnackbarMessage("تم الحذف بنجاح");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحذف";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleEditDebt = (debt: StandaloneDebt) => {
    setEditingDebt(debt);
    setDebtValue("partyType", debt.partyType || "person");
    setDebtValue("partyName", debt.partyName || "");
    setDebtValue("description", debt.description);
    setDebtValue("amount", debt.amount);
    setDebtValue("date", debt.date);
    setDebtValue("notes", debt.notes || "");
    setDebtDialogOpen(true);
  };

  const handleDeleteDebt = async (debtId: string) => {
    const ok = await confirm({
      title: "حذف دين",
      message: "هل أنت متأكد من حذف هذا الدين؟",
      confirmLabel: "حذف",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deleteStandaloneDebt(debtId);
      setSnackbarMessage("تم الحذف بنجاح");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error deleting debt:", error);
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحذف";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleOpenPayDebtDialog = (debt: StandaloneDebt) => {
    setSelectedDebtForPay(debt);
    setPayDebtAmount("");
    setPayDebtDialogOpen(true);
  };

  const handleOpenPartyProfile = (party: DebtParty) => {
    setSelectedParty(party);
    setPartyProfileDialogOpen(true);
  };

  const handleAddParty = () => {
    setEditingParty(null);
    setPartyDialogOpen(true);
  };

  const onSubmitParty = async (data: {
    name: string;
    phone: string;
    address: string;
    type: "person" | "shop" | "company";
  }) => {
    try {
      if (editingParty) {
        await updateDebtParty(editingParty.id, {
          name: data.name,
          phone: data.phone,
          address: data.address,
          type: data.type,
        });
        setSnackbarMessage("تم التحديث بنجاح");
      } else {
        await addDebtParty({
          id: crypto.randomUUID(),
          clientId: clientId!,
          name: data.name,
          phone: data.phone,
          address: data.address,
          type: data.type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setSnackbarMessage("تم الإضافة بنجاح");
      }
      setPartyDialogOpen(false);
      setEditingParty(null);
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error saving party:", error);
      setSnackbarMessage(error?.message || "حدث خطأ أثناء الحفظ");
      setSnackbarOpen(true);
    }
  };

  const handlePayDebt = async () => {
    if (!selectedDebtForPay) return;
    const pay = parseFloat(payDebtAmount) || 0;

    // Get the latest debt data from clientDebts to ensure we have current values
    const currentDebt = clientDebts.find((d) => d.id === selectedDebtForPay.id);
    if (!currentDebt && !selectedDebtForPay.id.startsWith("party_")) {
      setSnackbarMessage("الدين غير موجود");
      setSnackbarOpen(true);
      return;
    }

    const debtToPay = currentDebt || selectedDebtForPay;
    const maxPayable = debtToPay.remainingAmount;

    if (pay <= 0 || pay > maxPayable) {
      setSnackbarMessage(
        `المبلغ غير صحيح. الحد الأقصى: ${formatCurrency(maxPayable)}`
      );
      setSnackbarOpen(true);
      return;
    }

    try {
      // Check if this is a party-level payment (virtual debt)
      if (selectedDebtForPay.id.startsWith("party_")) {
        // Distribute payment across all debts for this party
        const partyName = selectedDebtForPay.partyName;
        const partyType = selectedDebtForPay.partyType;
        const partyDebtsToPay = clientDebts
          .filter(
            (d) =>
              ((d as any).partyName || "") === partyName &&
              ((d as any).partyType || "person") === partyType &&
              d.remainingAmount > 0
          )
          .sort((a, b) => b.remainingAmount - a.remainingAmount); // Pay larger debts first

        let remainingPay = pay;
        for (const debt of partyDebtsToPay) {
          if (remainingPay <= 0) break;
          const payForThisDebt = Math.min(remainingPay, debt.remainingAmount);
          const newPaid = debt.paidAmount + payForThisDebt;
          const newRemaining = Math.max(0, debt.amount - newPaid);
          await updateStandaloneDebt(debt.id, {
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            status: newRemaining <= 0 ? "paid" : "active",
          });
          remainingPay -= payForThisDebt;
        }
      } else {
        // Regular single debt payment - use current debt data
        const newPaid = debtToPay.paidAmount + pay;
        const newRemaining = Math.max(0, debtToPay.amount - newPaid);
        await updateStandaloneDebt(debtToPay.id, {
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newRemaining <= 0 ? "paid" : "active",
        });
      }
      setPayDebtDialogOpen(false);
      setSelectedDebtForPay(null);
      setPayDebtAmount("");
      setSnackbarMessage("تم الدفع بنجاح");
      setSnackbarOpen(true);
      if (partyProfileDialogOpen) {
        // Keep party profile open to see updated stats
      } else {
        setDebtsListDialogOpen(true);
      }
    } catch (error: any) {
      console.error("Error paying debt:", error);
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الدفع";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleEditPayment = (payment: PaymentType) => {
    setEditingPayment(payment);
    setPaymentValue("amount", payment.amount);
    setPaymentValue("paymentMethod", payment.paymentMethod);
    setPaymentValue("paymentDate", payment.paymentDate);
    setPaymentValue("invoiceId", payment.invoiceId || "");
    setPaymentValue("notes", payment.notes || "");
    setPaymentDialogOpen(true);
  };

  const handleDeletePayment = async (paymentId: string) => {
    const ok = await confirm({
      title: "حذف دفعة",
      message: "هل أنت متأكد من حذف هذه الدفعة؟",
      confirmLabel: "حذف",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await deletePayment(paymentId);
      setSnackbarMessage("تم الحذف بنجاح");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحذف";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const onSubmitPayment = async (data: any) => {
    try {
      const amount = parseFloat(data.amount) || 0;
      if (editingPayment) {
        await updatePayment(editingPayment.id, {
          amount: amount,
          paymentMethod: data.paymentMethod || "cash",
          paymentDate: data.paymentDate || dayjs().format("YYYY-MM-DD"),
          invoiceId: data.invoiceId || "",
          notes: data.notes || "",
        });
        setEditingPayment(null);
        setSnackbarMessage("تم التعديل بنجاح");
      } else {
        const newPayment: PaymentType = {
          id: crypto.randomUUID(),
          invoiceId: data.invoiceId || "",
          clientId: clientId!,
          amount: amount,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate,
          notes: data.notes || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addPayment(newPayment);
        setSnackbarMessage("تمت الإضافة بنجاح");
      }
      setPaymentDialogOpen(false);
      resetPayment({
        amount: "" as any,
        paymentMethod: "cash",
        paymentDate: dayjs().format("YYYY-MM-DD"),
        invoiceId: "",
        notes: "",
      });
      // إعادة فتح قائمة المدفوعات
      setActiveSection("payments");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error saving payment:", error);
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحفظ";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const onSubmitExpense = async (data: any) => {
    try {
      const amount = parseFloat(data.amount) || 0;
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          description: data.description || "",
          amount: amount,
          category: data.category || DEFAULT_EXPENSE_CATEGORY,
          date: data.date || dayjs().format("YYYY-MM-DD"),
          notes: data.notes || "",
        });
        setEditingExpense(null);
        setSnackbarMessage("تم التعديل بنجاح");
      } else {
        const newExpense: Expense = {
          id: crypto.randomUUID(),
          clientId: clientId!,
          description: data.description,
          amount: amount,
          category: data.category,
          date: data.date,
          notes: data.notes,
          isClosed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addExpense(newExpense);
        setEditingExpense(null);
        setSnackbarMessage("تمت الإضافة بنجاح");
      }
      setExpenseDialogOpen(false);
      resetExpense({
        description: "",
        amount: "" as any,
        category: DEFAULT_EXPENSE_CATEGORY,
        date: dayjs().format("YYYY-MM-DD"),
        notes: "",
      });
      // إعادة فتح قائمة المصروفات
      setActiveSection("expenses");
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error saving expense:", error);
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحفظ";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const onSubmitDebt = async (data: any) => {
    try {
      const amount = parseFloat(data.amount) || 0;
      if (!data.partyName || !data.description || amount <= 0) {
        setSnackbarMessage("يرجى ملء جميع الحقول المطلوبة");
        setSnackbarOpen(true);
        return;
      }

      if (editingDebt) {
        const newPaidAmount = Math.min(editingDebt.paidAmount, amount);
        const newRemaining = Math.max(0, amount - newPaidAmount);
        const existingParty = clientDebtParties.find(
          (p) => p.name === data.partyName && p.type === data.partyType
        );
        await updateStandaloneDebt(editingDebt.id, {
          partyId: existingParty?.id || (editingDebt as any).partyId || "",
          partyType: data.partyType || "person",
          partyName: data.partyName,
          description: data.description,
          amount: amount,
          paidAmount: newPaidAmount,
          remainingAmount: newRemaining,
          status: newRemaining <= 0 ? "paid" : "active",
          date: data.date,
          notes: data.notes || "",
        });
        setEditingDebt(null);
        setSnackbarMessage("تم التعديل بنجاح");
      } else {
        const existingParty = clientDebtParties.find(
          (p) => p.name === data.partyName && p.type === data.partyType
        );
        const newDebt: StandaloneDebt = {
          id: crypto.randomUUID(),
          clientId: clientId!,
          partyId: existingParty?.id || "",
          partyType: data.partyType || "person",
          partyName: data.partyName,
          description: data.description,
          amount: amount,
          paidAmount: 0,
          remainingAmount: amount,
          status: "active",
          date: data.date,
          notes: data.notes || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await addStandaloneDebt(newDebt);
        setSnackbarMessage("تمت الإضافة بنجاح");
      }
      setDebtDialogOpen(false);
      resetDebt({
        partyType: "person",
        partyName: "",
        description: "",
        amount: "" as any,
        date: dayjs().format("YYYY-MM-DD"),
        notes: "",
      });
      setDebtsListDialogOpen(true);
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error saving debt:", error);
      const errorMessage =
        error?.message || error?.toString() || "حدث خطأ أثناء الحفظ";
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    }
  };

  if (!client) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>العميل غير موجود</Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/clients")}
          sx={{ mt: 2 }}
        >
          العودة
        </Button>
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        kicker="ملف العميل"
        title={client.name}
        subtitle={client.phone}
        backTo="/clients"
        maxWidth="sm"
        action={
          <Stack direction="row" spacing={0.5}>
            <IconButton
              onClick={() => shareClientFinancialSummaryWhatsApp(client, summary)}
              aria-label="مشاركة عبر واتساب"
              sx={{ border: "1px solid", borderColor: "divider", color: "success.main" }}
            >
              <WhatsApp />
            </IconButton>
            <IconButton
              onClick={(e) => setPdfMenuAnchor(e.currentTarget)}
              aria-label="تصدير PDF"
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <PictureAsPdf />
            </IconButton>
            <Menu
              anchorEl={pdfMenuAnchor}
              open={Boolean(pdfMenuAnchor)}
              onClose={() => setPdfMenuAnchor(null)}
              PaperProps={{
                sx: { borderRadius: 2, minWidth: 200, p: 0.5 },
              }}
            >
              <MenuItem onClick={handleDownloadFinalReport} sx={{ py: 1, borderRadius: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <PictureAsPdf sx={{ fontSize: 18, color: "error.main" }} />
                  <Typography variant="body2" fontWeight={700}>
                    التقرير المالي الشامل
                  </Typography>
                </Stack>
              </MenuItem>
              <MenuItem onClick={handleDownloadExpensesPdf} sx={{ py: 1, borderRadius: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <TrendingDown sx={{ fontSize: 18, color: "warning.main" }} />
                  <Typography variant="body2">كشف المصروفات</Typography>
                </Stack>
              </MenuItem>
              <MenuItem onClick={handleDownloadPaymentsPdf} sx={{ py: 1, borderRadius: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Payment sx={{ fontSize: 18, color: "success.main" }} />
                  <Typography variant="body2">كشف المدفوعات</Typography>
                </Stack>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => {
                  setPdfMenuAnchor(null);
                  shareClientFinancialSummaryWhatsApp(client, summary);
                }}
                sx={{ py: 1, borderRadius: 1 }}
              >
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <WhatsApp sx={{ fontSize: 18, color: "success.main" }} />
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    مشاركة الملخص عبر واتساب
                  </Typography>
                </Stack>
              </MenuItem>
            </Menu>
            <IconButton
              onClick={() => setEditClientDialogOpen(true)}
              aria-label="تعديل العميل"
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <Edit />
            </IconButton>
          </Stack>
        }
      />

      <Stack spacing={3}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard
              icon={TrendingDown}
              label="المصروفات"
              value={formatCurrency(summary.totalExpenses)}
              subtitle={`${summary.expenseCount} مصروف مسجل`}
              tone="error"
              onClick={() => setActiveSection("expenses")}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard
              icon={TrendingUp}
              label="نسبة الشركة"
              value={summary.profit > 0 ? formatCurrency(summary.profit) : "—"}
              subtitle={
                summary.profitPercentage > 0
                  ? `${summary.profitPercentage}% من المصروفات`
                  : "اضغط لتحديد النسبة"
              }
              tone="info"
              onClick={() => setProfitDialogOpen(true)}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard
              icon={Payment}
              label="المدفوع"
              value={formatCurrency(summary.totalPaid)}
              subtitle={`${summary.paymentCount} دفعة مسجلة`}
              tone="success"
              onClick={() => setActiveSection("payments")}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard
              icon={summary.netBalance >= 0 ? TrendingUp : TrendingDown}
              label={
                summary.netBalance > 0
                  ? "فائض للعميل"
                  : summary.netBalance < 0
                    ? "المتبقي للسداد"
                    : "الرصيد"
              }
              value={
                summary.netBalance === 0
                  ? "مسدد بالكامل"
                  : formatCurrency(Math.abs(summary.netBalance))
              }
              subtitle={
                summary.netBalance > 0
                  ? "رصيد دائن للعميل"
                  : summary.netBalance < 0
                    ? "مطلوب سداده"
                    : "الحساب متوازن"
              }
              tone={
                summary.netBalance > 0
                  ? "success"
                  : summary.netBalance < 0
                    ? "error"
                    : "primary"
              }
            />
          </Grid>
        </Grid>

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={700}
              display="block"
              sx={{ letterSpacing: "0.04em", fontSize: "0.78rem" }}
            >
              إدارة الحساب والتقارير
            </Typography>
            <Button
              size="small"
              onClick={(e) => setPdfMenuAnchor(e.currentTarget)}
              sx={{ fontSize: "0.75rem", fontWeight: 700, py: 0.25 }}
              startIcon={<PictureAsPdf sx={{ fontSize: 16 }} />}
            >
              كشوفات PDF
            </Button>
          </Box>
          <Box
            sx={{
              display: "grid",
              gap: 1.25,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            }}
          >
            {menuItems.map((item) => (
              <ShortcutTile
                key={item.title}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                tone={item.tone}
                badge={item.badge}
                highlight={item.highlight}
                onClick={item.onClick}
              />
            ))}
          </Box>
        </Box>

        {clientExpenses.length > 0 && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="overline" color="text.secondary" fontWeight={600} display="block">
                آخر المصروفات
              </Typography>
              <Button
                size="small"
                startIcon={<Add sx={{ fontSize: 16 }} />}
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseDialogOpen(true);
                }}
                sx={{ fontSize: "0.75rem", fontWeight: 700, py: 0.25 }}
              >
                إضافة مصروف
              </Button>
            </Box>
            <Stack spacing={1}>
              {clientExpenses.slice(0, 3).map((exp) => (
                <Card
                  key={exp.id}
                  elevation={0}
                  onClick={() => handleEditExpense(exp)}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1.5,
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 }, display: "flex", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>{exp.description}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {normalizeCategoryLabel(exp.category)} · {dayjs(exp.date).format("DD/MM/YYYY")}
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={800} className="num" color="error.main">
                      {formatCurrency(exp.amount)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>

      <ClientLedgerScreen
        open={activeSection === "expenses"}
        variant="expenses"
        clientName={client.name}
        onBack={() => setActiveSection(null)}
        searchQuery={expensesSearchQuery}
        onSearchChange={setExpensesSearchQuery}
        totalAmount={summary.totalExpenses}
        items={filteredExpenses}
        allCount={clientExpenses.length}
        onAdd={() => {
          setEditingExpense(null);
          setExpenseDialogOpen(true);
        }}
        onExportPdf={handleDownloadExpensesPdf}
        onEditExpense={(expense) => handleEditExpense(expense)}
        onDeleteExpense={handleDeleteExpense}
      />

      <ClientLedgerScreen
        open={activeSection === "payments"}
        variant="payments"
        clientName={client.name}
        onBack={() => setActiveSection(null)}
        searchQuery={paymentsSearchQuery}
        onSearchChange={setPaymentsSearchQuery}
        totalAmount={summary.totalPaid}
        items={filteredPayments}
        allCount={clientPayments.length}
        invoices={invoices}
        onAdd={() => {
          setEditingPayment(null);
          resetPayment({
            amount: "" as any,
            paymentMethod: "cash",
            paymentDate: dayjs().format("YYYY-MM-DD"),
            invoiceId: "",
            notes: "",
          });
          setPaymentDialogOpen(true);
        }}
        onExportPdf={handleDownloadPaymentsPdf}
        onEditPayment={(payment) => handleEditPayment(payment)}
        onDeletePayment={handleDeletePayment}
      />

      <QuickExpenseSheet
        open={expenseDialogOpen}
        onClose={() => {
          setExpenseDialogOpen(false);
          setEditingExpense(null);
        }}
        defaultClientId={clientId}
        editExpense={
          editingExpense
            ? {
                id: editingExpense.id,
                clientId: editingExpense.clientId,
                expenseNumber: editingExpense.expenseNumber,
                supplierInvoiceNumber: editingExpense.supplierInvoiceNumber,
                description: editingExpense.description,
                amount: editingExpense.amount,
                category: editingExpense.category,
                date: editingExpense.date,
                notes: editingExpense.notes,
                quantity: editingExpense.quantity,
                unitPrice: editingExpense.unitPrice,
                unit: editingExpense.unit,
              }
            : null
        }
        onSaved={() => {
          setActiveSection("expenses");
          setSnackbarMessage(editingExpense ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح");
          setSnackbarOpen(true);
        }}
      />

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => {
          setPaymentDialogOpen(false);
          setEditingPayment(null);
        }}
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "column",
            pt: "env(safe-area-inset-top, 0px)",
            bgcolor: "background.default",
          },
        }}
      >
        <form
          onSubmit={handlePaymentSubmit(onSubmitPayment)}
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
        >
          <DialogScreenHeader
            title={editingPayment ? "تعديل دفعة" : "إضافة دفعة جديدة"}
            onClose={() => {
              setPaymentDialogOpen(false);
              setEditingPayment(null);
            }}
          />

          <Box sx={{ p: 3, pb: "calc(24px + env(safe-area-inset-bottom, 0px))", flex: 1, overflowY: "auto" }}>
            <Stack spacing={3.5}>
              <Controller
                name="invoiceId"
                control={paymentControl}
                render={({ field }) => {
                  const clientInvoices = invoices.filter(
                    (inv) => inv.clientId === clientId && inv.status !== "paid"
                  );

                  return (
                    <FormControl fullWidth>
                      <InputLabel>الفاتورة (اختياري)</InputLabel>
                      <Select
                        {...field}
                        value={field.value || ""}
                        label="الفاتورة (اختياري)"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">بدون فاتورة</MenuItem>
                        {clientInvoices.map((invoice) => (
                          <MenuItem key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber} -{" "}
                            {formatCurrency(invoice.total)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }}
              />

              <Controller
                name="amount"
                control={paymentControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="المبلغ"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={
                      field.value === 0 || field.value === "" ? "" : field.value
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : value);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="paymentMethod"
                control={paymentControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>طريقة الدفع</InputLabel>
                    <Select
                      {...field}
                      label="طريقة الدفع"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="cash">💵 نقدي</MenuItem>
                      <MenuItem value="bank_transfer">🏦 تحويل بنكي</MenuItem>
                      <MenuItem value="check">📝 شيك</MenuItem>
                      <MenuItem value="credit_card">💳 بطاقة ائتمان</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="paymentDate"
                control={paymentControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="تاريخ الدفع"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="notes"
                control={paymentControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ملاحظات"
                    multiline
                    rows={3}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                onClick={() => {
                  setPaymentDialogOpen(false);
                  setEditingPayment(null);
                }}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="success"
                fullWidth
                size="large"
                className="btn-primary-premium"
                sx={{ borderRadius: 2.5, py: 1.5, fontWeight: 800 }}
              >
                {editingPayment ? "حفظ" : "إضافة"}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* Debt Dialog */}
      <Dialog
        open={debtDialogOpen}
        onClose={() => {
          setDebtDialogOpen(false);
          setEditingDebt(null);
        }}
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "column",
            pt: "env(safe-area-inset-top, 0px)",
            bgcolor: "background.default",
          },
        }}
      >
        <form
          onSubmit={handleDebtSubmit(onSubmitDebt)}
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
        >
          <DialogScreenHeader
            title={editingDebt ? "تعديل دين" : "إضافة دين جديد"}
            onClose={() => {
              setDebtDialogOpen(false);
              setEditingDebt(null);
            }}
          />

          <Box sx={{ p: 3, pb: "calc(24px + env(safe-area-inset-bottom, 0px))", flex: 1, overflowY: "auto" }}>
            <Stack spacing={3}>
              <Controller
                name="partyType"
                control={debtControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>نوع الطرف</InputLabel>
                    <Select
                      {...field}
                      label="نوع الطرف"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="person">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Person sx={{ fontSize: 18 }} />
                          <Typography>شخص</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="shop">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Store sx={{ fontSize: 18 }} />
                          <Typography>محل</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="company">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Business sx={{ fontSize: 18 }} />
                          <Typography>شركة</Typography>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="partyName"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="اسم الشخص/المحل/الشركة"
                    placeholder="مثال: محمد أحمد، محل الأجهزة، شركة البناء"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="description"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="وصف الدين"
                    placeholder="مثال: دين على مواد بناء"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="amount"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="المبلغ"
                    type="number"
                    placeholder="أدخل المبلغ"
                    value={
                      field.value === 0 || field.value === "" ? "" : field.value
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? "" : value);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="date"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="تاريخ الدين"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="notes"
                control={debtControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ملاحظات"
                    multiline
                    rows={3}
                    placeholder="أي ملاحظات إضافية..."
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                onClick={() => {
                  setDebtDialogOpen(false);
                  setEditingDebt(null);
                }}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="warning"
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {editingDebt ? "حفظ" : "إضافة"}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>


      <ClientDebtsSection
        open={debtsListDialogOpen}
        onClose={() => setDebtsListDialogOpen(false)}
        clientName={client.name}
        parties={filteredParties.map((p) => ({
          ...p,
          debtCount: p.debts.length,
        }))}
        searchQuery={debtsSearchQuery}
        onSearchChange={setDebtsSearchQuery}
        totalRemaining={parties.reduce((s, p) => s + p.totalRemaining, 0)}
        onAdd={handleAddParty}
        onOpenParty={(party) => handleOpenPartyProfile(party)}
      />

      {/* Party Profile Dialog */}
      <Dialog
        open={partyProfileDialogOpen}
        onClose={() => {
          setPartyProfileDialogOpen(false);
          setSelectedParty(null);
        }}
        fullScreen
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: theme.palette.mode === "dark" ? "#0f172a" : "#f8fafc",
          },
        }}
      >
        <DialogScreenHeader
          title={selectedParty?.name ?? "الطرف"}
          subtitle={
            selectedParty?.type === "company"
              ? "شركة"
              : selectedParty?.type === "shop"
                ? "محل"
                : "شخص"
          }
          onClose={() => {
            setPartyProfileDialogOpen(false);
            setSelectedParty(null);
          }}
        />

        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 4 }}>
              <KpiCard icon={CreditCard} label="إجمالي الدين" value={formatCurrency(partyStats.totalAmount)} tone="warning" />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <KpiCard icon={Payment} label="المدفوع" value={formatCurrency(partyStats.totalPaid)} tone="success" />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <KpiCard icon={TrendingUp} label="المتبقي" value={formatCurrency(partyStats.totalRemaining)} tone="primary" />
            </Grid>
          </Grid>

          <Stack spacing={1.2}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Add />}
              onClick={() => {
                if (selectedParty) {
                  setEditingDebt(null);
                  resetDebt({
                    partyType: selectedParty.type,
                    partyName: selectedParty.name,
                    description: "",
                    amount: "" as any,
                    date: dayjs().format("YYYY-MM-DD"),
                    notes: "",
                  });
                  setDebtDialogOpen(true);
                  setPartyProfileDialogOpen(false);
                }
              }}
            >
              إضافة دين جديد
            </Button>
            {partyStats.totalRemaining > 0 && (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Payment />}
                onClick={() => {
                  const virtualDebt: StandaloneDebt = {
                    id: `party_${selectedParty?.id}`,
                    clientId: clientId!,
                    partyId: selectedParty?.id || "",
                    partyName: selectedParty?.name || "",
                    partyType: selectedParty?.type || "person",
                    description: `إجمالي ديون ${selectedParty?.name}`,
                    amount: partyStats.totalAmount,
                    paidAmount: partyStats.totalPaid,
                    remainingAmount: partyStats.totalRemaining,
                    status: partyStats.totalRemaining > 0 ? "active" : "paid",
                    date: dayjs().format("YYYY-MM-DD"),
                    createdAt: "",
                    updatedAt: "",
                  };
                  setSelectedDebtForPay(virtualDebt);
                  setPayDebtAmount("");
                  setPayDebtDialogOpen(true);
                }}
              >
                دفع المتبقي ({formatCurrency(partyStats.totalRemaining)})
              </Button>
            )}
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", pb: { xs: 2, sm: 3 } }}>
          <Container
            maxWidth="sm"
            sx={{ mt: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                mb: { xs: 1.5, sm: 2 },
                px: 0.5,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              سجل الديون ({partyDebts.length})
            </Typography>

            {partyDebts.length === 0 ? (
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 2.5 },
                  textAlign: "center",
                  py: { xs: 5, sm: 6 },
                  bgcolor: "background.paper",
                }}
              >
                <CreditCard
                  sx={{
                    fontSize: { xs: 50, sm: 60 },
                    color: "text.secondary",
                    opacity: 0.3,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.875rem", sm: "1.25rem" } }}
                >
                  لا توجد ديون
                </Typography>
              </Card>
            ) : (
              <Stack spacing={{ xs: 2, sm: 2.5 }}>
                {partyDebts.map((debt) => (
                  <Card
                    key={debt.id}
                    sx={{
                      borderRadius: { xs: 2, sm: 2.5 },
                      boxShadow:
                        theme.palette.mode === "light"
                          ? "0 2px 8px rgba(0,0,0,0.06)"
                          : "0 2px 8px rgba(0,0,0,0.3)",
                      bgcolor: "background.paper",
                      border:
                        theme.palette.mode === "dark"
                          ? "1px solid rgba(255,255,255,0.1)"
                          : "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 2, sm: 2.5 },
                        "&:last-child": { pb: { xs: 2, sm: 2.5 } },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={{ xs: 1.5, sm: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "warning.light",
                            width: { xs: 44, sm: 48 },
                            height: { xs: 44, sm: 48 },
                            flexShrink: 0,
                          }}
                        >
                          <CreditCard
                            sx={{
                              color: "warning.main",
                              fontSize: { xs: 18, sm: 20 },
                            }}
                          />
                        </Avatar>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 0.75, sm: 1.5 }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            sx={{ mb: { xs: 1, sm: 1.25 } }}
                            flexWrap="wrap"
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{
                                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                                wordBreak: "break-word",
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {debt.description}
                            </Typography>
                            <Chip
                              label={debt.status === "paid" ? "مدفوع" : "نشط"}
                              size="small"
                              color={
                                debt.status === "paid" ? "success" : "warning"
                              }
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                flexShrink: 0,
                              }}
                            />
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{
                              mb: { xs: 1, sm: 1.25 },
                              fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            }}
                          >
                            {dayjs(debt.date).format("DD/MM/YYYY")}
                          </Typography>

                          {debt.notes && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 1,
                                fontStyle: "italic",
                                lineHeight: 1.6,
                                px: 1,
                                py: 0.5,
                                bgcolor:
                                  theme.palette.mode === "dark"
                                    ? "rgba(255,255,255,0.05)"
                                    : "rgba(0,0,0,0.03)",
                                borderRadius: 1,
                                borderRight: `2px solid ${theme.palette.warning.main}`,
                              }}
                            >
                              💬 {debt.notes}
                            </Typography>
                          )}

                          <Typography
                            variant="h6"
                            fontWeight={800}
                            color="primary.main"
                            sx={{
                              fontSize: { xs: "1rem", sm: "1.25rem" },
                              mb: { xs: 1, sm: 0 },
                            }}
                          >
                            {formatCurrency(debt.amount)}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={{ xs: 1, sm: 1.5 }}
                          sx={{
                            flexShrink: 0,
                            alignSelf: { xs: "flex-start", sm: "center" },
                          }}
                        >
                          {debt.remainingAmount > 0 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenPayDebtDialog(debt);
                              }}
                              sx={{
                                bgcolor: "success.main",
                                color: "white",
                                width: { xs: 36, sm: 32 },
                                height: { xs: 36, sm: 32 },
                                "&:hover": { bgcolor: "success.dark" },
                                "&:active": { transform: "scale(0.9)" },
                              }}
                            >
                              <Payment sx={{ fontSize: { xs: 18, sm: 16 } }} />
                            </IconButton>
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditDebt(debt);
                              setPartyProfileDialogOpen(false);
                            }}
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              width: { xs: 36, sm: 32 },
                              height: { xs: 36, sm: 32 },
                              "&:hover": { bgcolor: "primary.dark" },
                              "&:active": { transform: "scale(0.9)" },
                            }}
                          >
                            <Edit sx={{ fontSize: { xs: 18, sm: 16 } }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteDebt(debt.id);
                            }}
                            sx={{
                              bgcolor: "error.main",
                              color: "white",
                              width: { xs: 36, sm: 32 },
                              height: { xs: 36, sm: 32 },
                              "&:hover": { bgcolor: "error.dark" },
                              "&:active": { transform: "scale(0.9)" },
                            }}
                          >
                            <Delete sx={{ fontSize: { xs: 18, sm: 16 } }} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Container>
        </Box>
      </Dialog>

      {/* Pay Debt Dialog */}
      <Dialog
        open={payDebtDialogOpen}
        onClose={() => {
          setPayDebtDialogOpen(false);
          setSelectedDebtForPay(null);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogScreenHeader
          title="سداد دين"
          subtitle={selectedDebtForPay?.description}
          onClose={() => {
            setPayDebtDialogOpen(false);
            setSelectedDebtForPay(null);
          }}
        />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            المتبقي: {formatCurrency(selectedDebtForPay?.remainingAmount ?? 0)}
          </Typography>
          <TextField
            fullWidth
            label="مبلغ الدفع"
            type="number"
            value={payDebtAmount}
            onChange={(e) => setPayDebtAmount(e.target.value)}
            placeholder={`حتى ${formatCurrency(selectedDebtForPay?.remainingAmount ?? 0)}`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setPayDebtDialogOpen(false);
              setSelectedDebtForPay(null);
            }}
          >
            إلغاء
          </Button>
          <Button variant="contained" onClick={handlePayDebt}>
            تأكيد الدفع
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Party Dialog */}
      <Dialog
        open={partyDialogOpen}
        onClose={() => {
          setPartyDialogOpen(false);
          setEditingParty(null);
        }}
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "column",
            pt: "env(safe-area-inset-top, 0px)",
            bgcolor: "background.default",
          },
        }}
      >
        <form
          onSubmit={handlePartySubmit(onSubmitParty)}
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
        >
          <DialogScreenHeader
            title={editingParty ? "تعديل طرف" : "إضافة طرف"}
            onClose={() => {
              setPartyDialogOpen(false);
              setEditingParty(null);
            }}
          />
          <Box sx={{ p: 3, pb: "calc(24px + env(safe-area-inset-bottom, 0px))", flex: 1, overflowY: "auto" }}>
            <Stack spacing={3}>
              <Controller
                name="name"
                control={partyControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="اسم الطرف" required />
                )}
              />
              <Controller
                name="type"
                control={partyControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>النوع</InputLabel>
                    <Select {...field} label="النوع">
                      <MenuItem value="person">شخص</MenuItem>
                      <MenuItem value="shop">محل</MenuItem>
                      <MenuItem value="company">شركة</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <Controller
                name="phone"
                control={partyControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="الهاتف" />
                )}
              />
              <Controller
                name="address"
                control={partyControl}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="العنوان" multiline rows={2} />
                )}
              />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                type="button"
                onClick={() => {
                  setPartyDialogOpen(false);
                  setEditingParty(null);
                }}
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                {editingParty ? "حفظ" : "إضافة"}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* Profit Calculation Dialog */}
      <Dialog
        open={profitDialogOpen}
        onClose={() => setProfitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, py: 2.5, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <TrendingUp sx={{ fontSize: 24, color: "primary.main" }} />
            <Typography variant="h6" fontWeight={800}>
              حساب وتحديد نسبة الشركة
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.25, fontWeight: 600 }}
              >
                النسبة المئوية المحتسبة من إجمالي المصروفات:
              </Typography>
              <TextField
                fullWidth
                label="النسبة المئوية (%)"
                type="number"
                value={profitPercentage}
                onChange={(e) => setProfitPercentage(e.target.value)}
                placeholder="مثال: 10 أو 15"
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
                {[5, 10, 15, 20, 25].map((pct) => (
                  <Chip
                    key={pct}
                    label={`${pct}%`}
                    size="small"
                    variant={parseFloat(profitPercentage) === pct ? "filled" : "outlined"}
                    color={parseFloat(profitPercentage) === pct ? "primary" : "default"}
                    onClick={() => setProfitPercentage(pct.toString())}
                    sx={{ cursor: "pointer", fontWeight: 700 }}
                  />
                ))}
              </Stack>
            </Box>

            {(() => {
              const currentPct = parseFloat(profitPercentage) || 0;
              const calcProfit = (summary.totalExpenses * currentPct) / 100;
              const calcObligations = summary.totalExpenses + calcProfit + summary.totalDebts;
              const calcNet = summary.totalPaid - calcObligations;

              return (
                <Card
                  elevation={0}
                  sx={{
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(45, 212, 191, 0.08)"
                        : "rgba(15, 118, 110, 0.05)",
                    border: `1px solid ${
                      theme.palette.mode === "dark"
                        ? "rgba(45, 212, 191, 0.25)"
                        : "rgba(15, 118, 110, 0.18)"
                    }`,
                    borderRadius: 2.5,
                    p: 2.25,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ mb: 1.5 }}>
                    تفاصيل الاحتساب المالي للعميل ({client?.name})
                  </Typography>

                  <Stack spacing={1.2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        إجمالي المصروفات ({summary.expenseCount} مصروف):
                      </Typography>
                      <Typography variant="body2" fontWeight={800} className="num" color="error.main">
                        {formatCurrency(summary.totalExpenses)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        نسبة الشركة ({currentPct}% من المصروفات):
                      </Typography>
                      <Typography variant="body2" fontWeight={800} className="num" color="primary.main">
                        {formatCurrency(calcProfit)}
                      </Typography>
                    </Box>

                    {summary.totalDebts > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          ديون معلقة على العميل:
                        </Typography>
                        <Typography variant="body2" fontWeight={800} className="num" color="warning.main">
                          {formatCurrency(summary.totalDebts)}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 0.5 }} />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" fontWeight={700}>
                        إجمالي المستحق (المصروفات + النسبة):
                      </Typography>
                      <Typography variant="body2" fontWeight={900} className="num">
                        {formatCurrency(calcObligations)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        إجمالي المدفوع من العميل:
                      </Typography>
                      <Typography variant="body2" fontWeight={800} className="num" color="success.main">
                        {formatCurrency(summary.totalPaid)}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5 }} />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {calcNet >= 0 ? "فائض لصالح العميل:" : "المتبقي للسداد على العميل:"}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={900}
                        className="num"
                        color={calcNet >= 0 ? "success.main" : "error.main"}
                      >
                        {formatCurrency(Math.abs(calcNet))}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              );
            })()}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setProfitDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSaveProfitPercentage}
            variant="contained"
            sx={{
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            حفظ النسبة
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog
        open={editClientDialogOpen}
        onClose={() => setEditClientDialogOpen(false)}
        fullScreen
        PaperProps={{
          sx: {
            display: "flex",
            flexDirection: "column",
            pt: "env(safe-area-inset-top, 0px)",
            bgcolor: "background.default",
          },
        }}
      >
        <form
          onSubmit={handleClientSubmit(onSubmitClient)}
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}
        >
          <DialogScreenHeader
            title="تعديل بيانات العميل"
            onClose={() => setEditClientDialogOpen(false)}
          />

          <Box sx={{ p: 3, pb: "calc(24px + env(safe-area-inset-bottom, 0px))", flex: 1, overflowY: "auto" }}>
            <Stack spacing={3}>
              <Controller
                name="name"
                control={clientControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="الاسم"
                    error={!!clientErrors.name}
                    helperText={clientErrors.name?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="type"
                control={clientControl}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>النوع</InputLabel>
                    <Select {...field} label="النوع" sx={{ borderRadius: 2 }}>
                      <MenuItem value="individual">فرد</MenuItem>
                      <MenuItem value="company">شركة</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="phone"
                control={clientControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="رقم الهاتف"
                    error={!!clientErrors.phone}
                    helperText={clientErrors.phone?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="email"
                control={clientControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="البريد الإلكتروني (اختياري)"
                    type="email"
                    error={!!clientErrors.email}
                    helperText={clientErrors.email?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />

              <Controller
                name="address"
                control={clientControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="العنوان"
                    multiline
                    rows={3}
                    error={!!clientErrors.address}
                    helperText={clientErrors.address?.message}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                )}
              />
            </Stack>

            <Stack spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                startIcon={<Delete />}
                onClick={handleDeleteClient}
                sx={{ borderRadius: 2, py: 1.5 }}
              >
                حذف العميل
              </Button>
              <Stack direction="row" spacing={2}>
                <Button
                  onClick={() => setEditClientDialogOpen(false)}
                  fullWidth
                  size="large"
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  حفظ التعديلات
                </Button>
              </Stack>
            </Stack>
          </Box>
        </form>
      </Dialog>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
