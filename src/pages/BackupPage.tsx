import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CloudDownload,
  CloudUpload,
  People,
  Receipt,
  Payment,
  AccountBalance,
  ReceiptLong,
  DataObject,
  TableChart,
  CheckCircleOutline,
  WarningAmber,
  Schedule,
  Storage,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { useDataStore } from "@/store/useDataStore";
import { PageHeader, PageSectionTitle } from "@/components/ui/PageHeader";
import { AppCard } from "@/components/ui/AppCard";
import { MiniStatCard } from "@/components/ui/KpiCard";
import {
  BACKUP_VERSION,
  exportToExcel,
  exportToJson,
  formatFileSize,
  getBackupStats,
  parseBackupFile,
  readBackupMeta,
  validateBackupData,
  writeBackupMeta,
  type BackupData,
  type BackupMeta,
} from "@/services/backupService";

dayjs.locale("ar");

type ExportFormat = "excel" | "json";

type PendingImport = {
  file: File;
  data: Partial<BackupData>;
  stats: ReturnType<typeof getBackupStats>;
};

const STAT_ITEMS = [
  { key: "clients" as const, label: "العملاء", icon: People, tone: "primary" as const },
  { key: "invoices" as const, label: "الفواتير", icon: Receipt, tone: "info" as const },
  { key: "payments" as const, label: "المدفوعات", icon: Payment, tone: "success" as const },
  { key: "expenses" as const, label: "المصروفات", icon: ReceiptLong, tone: "warning" as const },
  { key: "standaloneDebts" as const, label: "الديون", icon: AccountBalance, tone: "error" as const },
  { key: "debtParties" as const, label: "أطراف الديون", icon: People, tone: "secondary" as const },
  { key: "expenseInvoices" as const, label: "فواتير المصروفات", icon: ReceiptLong, tone: "neutral" as const },
];

function ExportOptionCard({
  title,
  description,
  icon: Icon,
  format,
  loading,
  onExport,
}: {
  title: string;
  description: string;
  icon: typeof TableChart;
  format: ExportFormat;
  loading: boolean;
  onExport: (format: ExportFormat) => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <AppCard
      hover
      padding={2}
      sx={{
        height: "100%",
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.72 : 1,
      }}
      onClick={() => !loading && onExport(format)}
    >
      <Stack spacing={1.5} sx={{ height: "100%" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            display: "grid",
            placeItems: "center",
            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.12) : "var(--accent-soft)",
            color: "primary.main",
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ textWrap: "balance" }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textWrap: "pretty" }}>
            {description}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<CloudDownload />}
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation();
            onExport(format);
          }}
          sx={{ alignSelf: "flex-start", fontWeight: 700 }}
        >
          تصدير
        </Button>
      </Stack>
    </AppCard>
  );
}

export const BackupPage = () => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    clients,
    invoices,
    payments,
    expenses,
    expenseInvoices,
    standaloneDebts,
    debtParties,
    restoreFromBackup,
  } = useDataStore();

  const [loading, setLoading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastMeta, setLastMeta] = useState<BackupMeta | null>(() => readBackupMeta());
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const currentStats = useMemo(
    () =>
      getBackupStats({
        clients,
        invoices,
        payments,
        expenses,
        expenseInvoices,
        standaloneDebts,
        debtParties,
      }),
    [clients, invoices, payments, expenses, expenseInvoices, standaloneDebts, debtParties]
  );

  const buildPayload = useCallback(
    (): BackupData => ({
      clients,
      invoices,
      payments,
      expenses,
      expenseInvoices,
      standaloneDebts,
      debtParties,
      exportDate: new Date().toISOString(),
      version: BACKUP_VERSION,
    }),
    [clients, invoices, payments, expenses, expenseInvoices, standaloneDebts, debtParties]
  );

  const handleExport = async (format: ExportFormat) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setProgressLabel("جاري تجهيز البيانات");
      setProgress(20);

      const payload = buildPayload();
      setProgress(55);

      if (format === "excel") {
        exportToExcel(payload);
      } else {
        exportToJson(payload);
      }

      const meta: BackupMeta = {
        lastExportAt: new Date().toISOString(),
        lastExportFormat: format,
        recordCount: currentStats.total,
      };
      writeBackupMeta(meta);
      setLastMeta(meta);

      setProgress(100);
      setSuccess(`تم تصدير ${currentStats.total} سجل إلى ${format === "excel" ? "Excel" : "JSON"}`);
      toast.success("تم التصدير بنجاح");
    } catch {
      setError("تعذّر تصدير البيانات. تحقق من الاتصال وحاول مجدداً.");
      toast.error("فشل التصدير");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setProgressLabel("");
      }, 600);
    }
  };

  const processFile = async (file: File) => {
    const validExt = [".xlsx", ".xls", ".json"];
    const hasValidExt = validExt.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError("الملف غير مدعوم. استخدم Excel (.xlsx) أو JSON.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setProgressLabel("جاري قراءة الملف");
      setProgress(25);

      const importedData = await parseBackupFile(file);
      setProgress(60);

      const validation = validateBackupData(importedData);
      if (!validation.isValid) {
        setError(`البيانات غير صالحة:\n${validation.errors.slice(0, 5).join("\n")}`);
        toast.error("ملف غير صالح");
        return;
      }

      const stats = getBackupStats(importedData);
      if (stats.total === 0) {
        setError("الملف لا يحتوي على بيانات للاستعادة.");
        return;
      }

      setPendingImport({ file, data: importedData, stats });
      setConfirmOpen(true);
    } catch {
      setError("تعذّر قراءة الملف. تأكد أنه نسخة احتياطية صادرة من هذا النظام.");
      toast.error("فشل قراءة الملف");
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  };

  const handleConfirmRestore = async () => {
    if (!pendingImport) return;

    try {
      setConfirmOpen(false);
      setLoading(true);
      setError(null);
      setSuccess(null);

      const result = await restoreFromBackup(pendingImport.data, (label, percent) => {
        setProgressLabel(label);
        setProgress(percent);
      });

      setSuccess(
        `تمت استعادة ${result.imported.total} سجل خلال ${(result.durationMs / 1000).toFixed(1)} ثانية`
      );
      toast.success("تمت الاستعادة بنجاح");
      setPendingImport(null);
    } catch {
      setError("تعذّرت استعادة البيانات. لم تُحفظ أي تغييرات جزئية على الخادم.");
      toast.error("فشلت الاستعادة");
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressLabel("");
    }
  };

  return (
    <Stack spacing={3} sx={{ pb: 2 }}>
      <PageHeader
        kicker="النظام"
        title="النسخ الاحتياطي"
        subtitle="صدّر بياناتك بانتظام واحفظ نسخة محلية. الاستعادة تدمج السجلات مع قاعدة البيانات الحالية."
        maxWidth={false}
      />

      {(loading || progress > 0) && (
        <AppCard padding={2}>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={600}>
                {progressLabel || "جاري المعالجة"}
              </Typography>
              <Typography variant="caption" color="text.secondary" className="num">
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Stack>
        </AppCard>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ whiteSpace: "pre-line" }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" icon={<CheckCircleOutline />} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 1.35,
          gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
        }}
      >
        <MiniStatCard icon={Storage} label="إجمالي السجلات" value={currentStats.total} tone="primary" />
        <MiniStatCard icon={People} label="العملاء" value={currentStats.clients} tone="info" />
        <MiniStatCard icon={Receipt} label="الفواتير" value={currentStats.invoices} tone="secondary" />
        <MiniStatCard icon={Payment} label="المدفوعات" value={currentStats.payments} tone="success" />
      </Box>

      {lastMeta && (
        <AppCard padding={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
            <Schedule sx={{ color: "text.secondary", fontSize: 20 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={700}>
                آخر تصدير: {dayjs(lastMeta.lastExportAt).format("D MMMM YYYY · HH:mm")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lastMeta.recordCount} سجل · {lastMeta.lastExportFormat === "excel" ? "Excel" : "JSON"}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={`الإصدار ${BACKUP_VERSION}`}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </AppCard>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        }}
      >
        <Box>
          <PageSectionTitle title="تصدير نسخة احتياطية" />
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <ExportOptionCard
              title="Excel"
              description="ملف جداول متعددة — مناسب للمراجعة والطباعة"
              icon={TableChart}
              format="excel"
              loading={loading}
              onExport={handleExport}
            />
            <ExportOptionCard
              title="JSON"
              description="نسخة كاملة للاستعادة السريعة والنسخ البرمجي"
              icon={DataObject}
              format="json"
              loading={loading}
              onExport={handleExport}
            />
          </Box>
        </Box>

        <Box>
          <PageSectionTitle title="استيراد واستعادة" />
          <AppCard
            padding={0}
            sx={{
              borderStyle: dragOver ? "solid" : "dashed",
              borderWidth: dragOver ? 2 : 1,
              borderColor: dragOver ? "primary.main" : "divider",
              bgcolor: dragOver
                ? alpha(theme.palette.primary.main, 0.04)
                : "background.paper",
              transition: "border-color 0.2s ease, background-color 0.2s ease",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "14px",
                  mx: "auto",
                  mb: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: "warning.main",
                }}
              >
                <CloudUpload sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ textWrap: "balance" }}>
                اسحب الملف هنا أو اختر من جهازك
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2, textWrap: "pretty" }}>
                يدعم Excel (.xlsx) و JSON. سيتم عرض ملخص قبل الحفظ.
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                disabled={loading}
                sx={{ fontWeight: 700 }}
              >
                اختيار ملف
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".xlsx,.xls,.json"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>
          </AppCard>

          <Alert severity="warning" icon={<WarningAmber />} sx={{ mt: 1.5 }}>
            <Typography variant="body2">
              الاستعادة تدمج السجلات حسب المعرف. السجلات الموجودة بنفس المعرف ستُحدَّث.
            </Typography>
          </Alert>
        </Box>
      </Box>

      <Box>
        <PageSectionTitle title="تفاصيل البيانات الحالية" />
        <Box
          sx={{
            display: "grid",
            gap: 1.25,
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
            },
          }}
        >
          {STAT_ITEMS.map(({ key, label, icon, tone }) => (
            <MiniStatCard
              key={key}
              icon={icon}
              label={label}
              value={currentStats[key]}
              tone={tone === "neutral" ? "secondary" : tone}
            />
          ))}
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => !loading && setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>تأكيد الاستعادة</DialogTitle>
        <DialogContent>
          {pendingImport && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                الملف: <strong>{pendingImport.file.name}</strong> ({formatFileSize(pendingImport.file.size)})
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: "repeat(2, 1fr)",
                }}
              >
                {STAT_ITEMS.filter(({ key }) => pendingImport.stats[key] > 0).map(({ key, label }) => (
                  <Box
                    key={key}
                    sx={{
                      p: 1.25,
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} className="num">
                      {pendingImport.stats[key]}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Alert severity="info">
                سيتم رفع {pendingImport.stats.total} سجل إلى Firebase. تأكد من صحة الملف قبل المتابعة.
              </Alert>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={loading}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={() => void handleConfirmRestore()} disabled={loading}>
            استعادة الآن
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
