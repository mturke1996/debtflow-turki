import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
} from '@mui/material';
import {
  PictureAsPdf,
  WhatsApp,
  Visibility,
  CheckCircle,
  Send,
  Schedule,
  Share,
  Receipt,
} from '@mui/icons-material';
import { useDataStore } from '@/store/useDataStore';
import { formatCurrency } from '@/utils/calculations';
import { downloadPdf } from '@/utils/pdfService';
import { loadStyledPDFs } from '@/components/pdf/lazyPdf';
import { ListPageLayout } from '@/components/ui/ListPageLayout';
import { normalizeCategoryLabel } from '@/constants/expenseCategories';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppCard } from '@/components/ui/AppCard';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import type { ExpenseInvoice } from '@/types';

dayjs.locale('ar');

export const ExpenseInvoicesPage = () => {
  const { expenseInvoices, clients, payments, getExpenseInvoices } = useDataStore();
  const [selectedInvoice, setSelectedInvoice] = useState<ExpenseInvoice | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const handleShareTotal = async () => {
    const { ExpenseInvoicesSummaryStyledPDF } = await loadStyledPDFs();
    await downloadPdf(
      <ExpenseInvoicesSummaryStyledPDF expenseInvoices={expenseInvoices} clients={clients} />,
      `فواتير-مصروفات-${dayjs().format('YYYY-MM-DD')}.pdf`
    );
  };

  const invoicesWithClient = useMemo(() => {
    return expenseInvoices.map((invoice) => {
      const client = clients.find((c) => c.id === invoice.clientId);
      return { invoice, client };
    });
  }, [expenseInvoices, clients]);

  const handleViewPDF = async (invoice: ExpenseInvoice) => {
    const client = clients.find((c) => c.id === invoice.clientId);
    if (!client) return;
    const { ExpenseInvoiceStyledPDF } = await loadStyledPDFs();
    await downloadPdf(
      <ExpenseInvoiceStyledPDF invoice={invoice} client={client} />,
      `فاتورة-مصروفات-${invoice.invoiceNumber}.pdf`
    );
  };

  const handleShareWhatsApp = async (invoice: ExpenseInvoice) => {
    const client = clients.find((c) => c.id === invoice.clientId);
    if (!client) return;

    const period = `من ${dayjs(invoice.startDate).format('DD/MM/YYYY')} إلى ${dayjs(invoice.endDate).format('DD/MM/YYYY')}`;
    const message = `*فاتورة مصروفات*\n\n` +
      `*العميل:* ${client.name}\n` +
      `*رقم الفاتورة:* ${invoice.invoiceNumber}\n` +
      `*الفترة:* ${period}\n` +
      `*عدد المصروفات:* ${invoice.expenses.length}\n` +
      `*الإجمالي:* ${formatCurrency(invoice.totalAmount)}\n\n` +
      `يرجى مراجعة التفاصيل الكاملة في المرفق.`;

    const whatsappUrl = `https://wa.me/${client.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePreview = (invoice: ExpenseInvoice) => {
    setSelectedInvoice(invoice);
    setPreviewDialogOpen(true);
  };

  const getStatusColor = (status: ExpenseInvoice['status']) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'info';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ExpenseInvoice['status']) => {
    switch (status) {
      case 'paid':
        return 'مدفوعة';
      case 'sent':
        return 'مرسلة';
      case 'overdue':
        return 'متأخرة';
      default:
        return 'مسودة';
    }
  };

  const getStatusIcon = (status: ExpenseInvoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle />;
      case 'sent':
        return <Send />;
      default:
        return <Schedule />;
    }
  };

  return (
    <>
      <ListPageLayout
        kicker="المالية"
        title="فواتير المصروفات"
        subtitle={`${expenseInvoices.length} فاتورة في السجل`}
        maxWidth="lg"
        action={
          expenseInvoices.length > 0 ? (
            <Button variant="outlined" startIcon={<Share />} onClick={handleShareTotal}>
              مشاركة المجموع
            </Button>
          ) : undefined
        }
      >
        {invoicesWithClient.length === 0 ? (
          <EmptyState icon={Receipt} title="لا توجد فواتير مصروفات حتى الآن" />
        ) : (
          <AppCard padding={0}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>رقم الفاتورة</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>العميل</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>الفترة</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>عدد المصروفات</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>الإجمالي</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>الحالة</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
            <TableBody>
              {invoicesWithClient
                .sort((a, b) => dayjs(b.invoice.issueDate).diff(dayjs(a.invoice.issueDate)))
                .map(({ invoice, client }) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{client?.name || 'غير معروف'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="0.875rem">
                        {dayjs(invoice.startDate).format('DD/MM/YYYY')} -{' '}
                        {dayjs(invoice.endDate).format('DD/MM/YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={invoice.expenses.length} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(invoice.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(invoice.status)}
                        label={getStatusLabel(invoice.status)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handlePreview(invoice)}
                          title="معاينة"
                          sx={{
                            width: 38,
                            height: 38,
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleViewPDF(invoice)}
                          title="PDF"
                          sx={{
                            width: 38,
                            height: 38,
                          }}
                        >
                          <PictureAsPdf />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleShareWhatsApp(invoice)}
                          title="واتساب"
                          sx={{
                            width: 38,
                            height: 38,
                          }}
                        >
                          <WhatsApp />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
          </AppCard>
        )}
      </ListPageLayout>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            معاينة فاتورة المصروفات
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Stack spacing={3}>
              {/* معلومات الفاتورة */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  رقم الفاتورة
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {selectedInvoice.invoiceNumber}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  الفترة
                </Typography>
                <Typography variant="body1">
                  {dayjs(selectedInvoice.startDate).format('DD/MM/YYYY')} -{' '}
                  {dayjs(selectedInvoice.endDate).format('DD/MM/YYYY')}
                </Typography>
              </Box>

              {/* جدول المصروفات */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  المصروفات ({selectedInvoice.expenses.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'primary.main' }}>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>التاريخ</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>الوصف</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>الفئة</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">المبلغ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.expenses
                        .sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
                        .map((expense) => (
                          <TableRow key={expense.id} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {dayjs(expense.date).format('DD/MM/YYYY')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {expense.description}
                              </Typography>
                              {expense.notes && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {expense.notes}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip label={normalizeCategoryLabel(expense.category)} size="small" color="primary" variant="outlined" />
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                {formatCurrency(expense.amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="body1" fontWeight="bold">
                            الإجمالي:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            {formatCurrency(selectedInvoice.totalAmount)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {selectedInvoice.notes && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ملاحظات
                  </Typography>
                  <Typography variant="body1">{selectedInvoice.notes}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>إغلاق</Button>
          {selectedInvoice && (
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={() => {
                const client = clients.find((c) => c.id === selectedInvoice.clientId);
                if (client) {
                  void handleViewPDF(selectedInvoice);
                }
                setPreviewDialogOpen(false);
              }}
            >
              تصدير PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

