import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Stack,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Close,
  CloudDownload,
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';
import { Icon } from '@iconify/react';
import { useDataStore } from '../store/useDataStore';
import {
  exportToExcel,
  importFromExcel,
  exportToJson,
  importFromJson,
  validateBackupData,
  type BackupData,
} from '../services/backupService';
import toast from 'react-hot-toast';

interface BackupDialogProps {
  open: boolean;
  onClose: () => void;
}

export const BackupDialog = ({ open, onClose }: BackupDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    clients,
    invoices,
    payments,
    expenses,
    expenseInvoices,
    standaloneDebts,
    debtParties,
  } = useDataStore();

  const handleExport = async (format: 'excel' | 'json') => {
    try {
      setLoading(true);
      setProgress(10);
      setError(null);
      setSuccess(null);

      // Prepare backup data
      const backupData: BackupData = {
        clients,
        invoices,
        payments,
        expenses,
        expenseInvoices,
        standaloneDebts,
        debtParties,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      setProgress(50);

      // Export based on format
      if (format === 'excel') {
        exportToExcel(backupData);
        toast.success('تم تصدير البيانات إلى Excel بنجاح');
      } else {
        exportToJson(backupData);
        toast.success('تم تصدير البيانات إلى JSON بنجاح');
      }

      setProgress(100);
      setSuccess(`تم تصدير البيانات (${format}) بنجاح!`);

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 1500);
    } catch (err) {
      setError('فشل تصدير البيانات. يرجى المحاولة مرة أخرى.');
      toast.error('فشل تصدير البيانات');
      setLoading(false);
      setProgress(0);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setProgress(10);
      setError(null);
      setSuccess(null);

      setProgress(30);

      // Determine import method based on file extension
      let importedData: Partial<BackupData>;
      if (file.name.endsWith('.json')) {
        importedData = await importFromJson(file);
      } else {
        importedData = await importFromExcel(file);
      }

      setProgress(60);

      // Validate data
      const validation = validateBackupData(importedData);
      if (!validation.isValid) {
        setError(`البيانات غير صالحة:\n${validation.errors.join('\n')}`);
        toast.error('البيانات المستوردة غير صالحة');
        setLoading(false);
        setProgress(0);
        return;
      }

      setProgress(80);

      // TODO: Implement data restoration to Firestore
      // This would require additional functions in the data store
      // For now, we'll just show a success message
      
      setProgress(100);
      setSuccess('تم استيراد البيانات بنجاح! (ملاحظة: لم يتم حفظ البيانات بعد)');
      toast.success('تم استيراد البيانات بنجاح');

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 1500);
    } catch (err) {
      setError('فشل استيراد البيانات. يرجى التحقق من صحة الملف.');
      toast.error('فشل استيراد البيانات');
      setLoading(false);
      setProgress(0);
    }

    // Reset file input
    event.target.value = '';
  };

  const stats = [
    { label: 'العملاء', count: clients.length, icon: 'mdi:account-group' },
    { label: 'الفواتير', count: invoices.length, icon: 'mdi:file-document' },
    { label: 'المدفوعات', count: payments.length, icon: 'mdi:cash-multiple' },
    { label: 'المصروفات', count: expenses.length, icon: 'mdi:receipt' },
    { label: 'فواتير المصروفات', count: expenseInvoices.length, icon: 'mdi:file-chart' },
    { label: 'الديون', count: standaloneDebts.length, icon: 'mdi:bank' },
    { label: 'أطراف الديون', count: debtParties.length, icon: 'mdi:account-multiple' },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Icon icon="mdi:database-export" width={28} height={28} />
            <Typography variant="h6" fontWeight={700}>
              النسخ الاحتياطي واستعادة البيانات
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Stack spacing={3}>
          {/* Info Alert */}
          <Alert severity="info" icon={<Info />}>
            <Typography variant="body2">
              يمكنك تصدير جميع بياناتك إلى ملف Excel للنسخ الاحتياطي، أو استيراد بيانات من ملف Excel سابق.
            </Typography>
          </Alert>

          {/* Data Statistics */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
              إحصائيات البيانات الحالية
            </Typography>
            <List dense>
              {stats.map((stat, index) => (
                <ListItem
                  key={index}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    mb: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ListItemIcon>
                    <Icon icon={stat.icon} width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText
                    primary={stat.label}
                    secondary={`${stat.count} عنصر`}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Progress */}
          {loading && (
            <Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={1}>
                جاري المعالجة... {progress}%
              </Typography>
            </Box>
          )}

          {/* Success Message */}
          {success && (
            <Alert severity="success" icon={<CheckCircle />}>
              {success}
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert severity="error" icon={<ErrorIcon />} sx={{ whiteSpace: 'pre-line' }}>
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" spacing={2} width="100%">
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<CloudDownload />}
            onClick={() => handleExport('excel')}
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 700 }}
          >
            تصدير Excel
          </Button>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            startIcon={<Icon icon="mdi:code-json" />}
            onClick={() => handleExport('json')}
            disabled={loading}
            sx={{ py: 1.5, fontWeight: 700 }}
          >
            تصدير JSON
          </Button>
        </Stack>

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          component="label"
          startIcon={<CloudUpload />}
          disabled={loading}
          sx={{ py: 1.5, fontWeight: 700 }}
        >
          استيراد نسخة احتياطية (Excel / JSON)
          <input
            type="file"
            hidden
            accept=".xlsx,.xls,.json"
            onChange={handleImport}
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
