import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  LinearProgress,
  Divider,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Email,
  Delete,
  PictureAsPdf,
  Share,
  Edit,
  Payments,
} from "@mui/icons-material";
import { useDataStore } from "@/store/useDataStore";
import type { Client, Invoice } from "@/types";
import { InvoiceStyledPDF } from "@/components/pdf/StyledPDFs";
import { downloadPdf, sharePdf } from "@/utils/pdfService";
import { formatCurrency, getStatusLabel, formatDate } from "@/utils/formatters";
import { getInvoicePaymentSummary } from "@/core/finance/invoicePayments";
import toast from "react-hot-toast";

function resolveInvoiceClient(invoice: Invoice, clients: Client[]): Client | undefined {
  const found = clients.find((c) => c.id === invoice.clientId);
  if (found) return found;

  if (invoice.tempClientName) {
    return {
      id: invoice.clientId,
      name: invoice.tempClientName,
      phone: invoice.tempClientPhone || "",
      address: invoice.tempClientAddress || "",
      email: "",
      type: "individual",
      createdAt: "",
      updatedAt: "",
    };
  }

  if (invoice.notes) {
    const match = invoice.notes.match(/__TEMP_CLIENT__name:(.+?)__phone:(.+?)__/);
    if (match) {
      return {
        id: invoice.clientId,
        name: match[1].trim(),
        phone: match[2].trim(),
        email: "",
        address: "",
        type: "individual",
        createdAt: "",
        updatedAt: "",
      };
    }
  }

  return undefined;
}

export const InvoiceDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, clients, payments, updateInvoice, deleteInvoice, addPayment } = useDataStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"cash" | "bank_transfer" | "check" | "credit_card">("cash");
  const [payNotes, setPayNotes] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const invoice = invoices.find((inv) => inv.id === id);
  const client = invoice ? resolveInvoiceClient(invoice, clients) : undefined;

  const displayNotes = invoice?.notes?.replace(/__TEMP_CLIENT__name:.+?__phone:.+?__/g, "").trim();

  const invoicePayments = useMemo(
    () => (invoice ? payments.filter((p) => p.invoiceId === invoice.id) : []),
    [payments, invoice]
  );

  const paymentSummary = useMemo(
    () => (invoice ? getInvoicePaymentSummary(invoice, payments) : null),
    [invoice, payments]
  );

  const handleRecordPayment = async () => {
    if (!invoice) return;
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) {
      toast.error("أدخل مبلغاً صحيحاً");
      return;
    }
    if (paymentSummary && amount > paymentSummary.remaining + 0.01) {
      toast.error("المبلغ أكبر من المتبقي");
      return;
    }
    setPayLoading(true);
    try {
      const now = new Date().toISOString();
      await addPayment({
        id: crypto.randomUUID(),
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        amount,
        paymentMethod: payMethod,
        paymentDate: now,
        notes: payNotes.trim(),
        createdAt: now,
        updatedAt: now,
      });
      setPayAmount("");
      setPayNotes("");
    } catch {
      /* toast from store */
    } finally {
      setPayLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice || !client) return;
    setPdfLoading(true);
    try {
      await downloadPdf(
        React.createElement(InvoiceStyledPDF, { invoice, client }),
        `فاتورة-${invoice.invoiceNumber}`
      );
      toast.success("تم تحميل PDF بنجاح");
    } catch {
      toast.error("فشل في إنشاء PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSharePdf = async () => {
    if (!invoice || !client) return;
    setPdfLoading(true);
    try {
      await sharePdf(
        React.createElement(InvoiceStyledPDF, { invoice, client }),
        `فاتورة-${invoice.invoiceNumber}`,
        {
          title: `فاتورة #${invoice.invoiceNumber} - ${client.name}`,
          text: `مرفق: فاتورة رقم ${invoice.invoiceNumber} — ${client.name}`,
        }
      );
    } catch {
      toast.error("فشل في مشاركة PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    setDeleting(true);
    try {
      await deleteInvoice(invoice.id);
      setDeleteDialogOpen(false);
      navigate("/invoices");
    } catch {
      toast.error("فشل في حذف الفاتورة");
    } finally {
      setDeleting(false);
    }
  };

  if (!invoice || !client) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  const handleStatusChange = async (status: string) => {
    await updateInvoice(invoice.id, { status: status as Invoice["status"] });
    setAnchorEl(null);
  };

  return (
    <Box sx={{ pb: 4, "@media print": { bgcolor: "white", pb: 0, minHeight: "auto" } }}>
      <Box sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", pt: 3, pb: 3, px: 2, "@media print": { display: "none" } }}>
        <Container maxWidth="sm">
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={800} sx={{ fontSize: "1.1rem", color: "text.primary" }}>
                فاتورة #{invoice.invoiceNumber}
              </Typography>
              <Chip
                label={getStatusLabel(invoice.status)}
                color={invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "error" : "default"}
                size="small"
                sx={{ fontWeight: 600, borderRadius: 1.5, height: 22, fontSize: "0.65rem", mt: 0.5 }}
              />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={pdfLoading ? <CircularProgress size={14} /> : <PictureAsPdf />}
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              sx={{ borderRadius: 2, fontSize: "0.72rem", fontWeight: 700, flex: 1, textTransform: "none" }}
            >
              تحميل PDF
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<Share />}
              onClick={handleSharePdf}
              disabled={pdfLoading}
              sx={{ borderRadius: 2, fontSize: "0.72rem", fontWeight: 700, flex: 1, textTransform: "none" }}
            >
              مشاركة
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ borderRadius: 2, fontSize: "0.72rem", fontWeight: 700, flex: 1, textTransform: "none", borderColor: "divider" }}
            >
              إجراءات
            </Button>
          </Stack>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2, mt: 1, minWidth: 180 } }}>
            <MenuItem onClick={() => handleStatusChange("paid")} disabled={invoice.status === "paid"}>
              <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} /> تم الدفع
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange("sent")} disabled={invoice.status === "sent"}>
              <Email fontSize="small" color="info" sx={{ mr: 1 }} /> تم الإرسال
            </MenuItem>
            <MenuItem onClick={() => handleStatusChange("cancelled")} disabled={invoice.status === "cancelled"}>
              <Cancel fontSize="small" color="warning" sx={{ mr: 1 }} /> إلغاء
            </MenuItem>
            <MenuItem onClick={() => navigate(`/invoices/new?edit=${invoice.id}`)}>
              <Edit fontSize="small" color="primary" sx={{ mr: 1 }} /> تعديل الفاتورة
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setDeleteDialogOpen(true);
              }}
              sx={{ color: "error.main" }}
            >
              <Delete fontSize="small" sx={{ mr: 1, color: "error.main" }} /> حذف الفاتورة
            </MenuItem>
          </Menu>
        </Container>
      </Box>

      {paymentSummary && invoice.status !== "cancelled" && (
        <Container maxWidth="sm" sx={{ mt: 2, "@media print": { display: "none" } }}>
          <Box sx={{ p: 2.5, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <Payments color="primary" fontSize="small" />
              <Typography fontWeight={800} fontSize="0.95rem">
                التحصيل
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                المحصّل
              </Typography>
              <Typography variant="caption" fontWeight={700} className="money-ar">
                {formatCurrency(paymentSummary.paid)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography variant="caption" color="text.secondary">
                المتبقي
              </Typography>
              <Typography variant="caption" fontWeight={800} color="warning.main" className="money-ar">
                {formatCurrency(paymentSummary.remaining)}
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={paymentSummary.progressPct} sx={{ height: 6, mb: 2, borderRadius: 0 }} />

            {paymentSummary.remaining > 0 && (
              <Stack spacing={1.5} sx={{ mb: invoicePayments.length ? 2 : 0 }}>
                <TextField size="small" label="مبلغ الدفعة" type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder={String(paymentSummary.remaining)} fullWidth />
                <TextField select size="small" label="طريقة الدفع" value={payMethod} onChange={(e) => setPayMethod(e.target.value as typeof payMethod)} fullWidth>
                  <MenuItem value="cash">نقدي</MenuItem>
                  <MenuItem value="bank_transfer">تحويل بنكي</MenuItem>
                  <MenuItem value="check">شيك</MenuItem>
                  <MenuItem value="credit_card">بطاقة ائتمان</MenuItem>
                </TextField>
                <TextField size="small" label="ملاحظات" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} fullWidth />
                <Button variant="contained" disabled={payLoading} onClick={handleRecordPayment} startIcon={payLoading ? <CircularProgress size={16} color="inherit" /> : <Payments />} sx={{ fontWeight: 800, textTransform: "none" }}>
                  تسجيل دفعة
                </Button>
              </Stack>
            )}

            {invoicePayments.length > 0 && (
              <Stack spacing={1}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  سجل الدفعات
                </Typography>
                {invoicePayments.map((p) => (
                  <Stack key={p.id} direction="row" justifyContent="space-between" sx={{ py: 1, borderTop: 1, borderColor: "divider" }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} className="money-ar">
                        {formatCurrency(p.amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(p.paymentDate)}
                        {p.notes ? ` · ${p.notes}` : ""}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Container>
      )}

      <Container maxWidth="sm" sx={{ mt: 2, px: { xs: 1, sm: 2 } }}>
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                العميل
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {client.name}
              </Typography>
              {client.phone ? (
                <Typography variant="caption" color="text.secondary" dir="ltr">
                  {client.phone}
                </Typography>
              ) : null}
            </Box>

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                  الإصدار
                </Typography>
                <Typography variant="body2">{formatDate(invoice.issueDate)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
                  الاستحقاق
                </Typography>
                <Typography variant="body2">{formatDate(invoice.dueDate)}</Typography>
              </Box>
            </Stack>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom>
                البنود ({invoice.items.length})
              </Typography>
              <Stack spacing={1}>
                {invoice.items.map((item, idx) => (
                  <Box
                    key={item.id ?? idx}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "var(--panel-muted)",
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {item.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" className="num">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={800} className="num" color="primary">
                        {formatCurrency(item.total)}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />

            <Stack spacing={0.75}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  المجموع الفرعي
                </Typography>
                <Typography variant="body2" fontWeight={700} className="num">
                  {formatCurrency(invoice.subtotal)}
                </Typography>
              </Stack>
              {invoice.taxAmount > 0 ? (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    الضريبة ({invoice.taxRate}%)
                  </Typography>
                  <Typography variant="body2" fontWeight={700} className="num">
                    {formatCurrency(invoice.taxAmount)}
                  </Typography>
                </Stack>
              ) : null}
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={800}>
                  الإجمالي
                </Typography>
                <Typography variant="h6" fontWeight={900} className="num" color="primary">
                  {formatCurrency(invoice.total)}
                </Typography>
              </Stack>
            </Stack>

            {displayNotes ? (
              <>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>
                    ملاحظات
                  </Typography>
                  <Typography variant="body2">{displayNotes}</Typography>
                </Box>
              </>
            ) : null}
          </Stack>
        </Paper>
      </Container>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 380 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: "error.main", fontSize: "1.1rem", pb: 0.5 }}>
          حذف الفاتورة
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
            هل أنت متأكد من حذف الفاتورة رقم <strong>#{invoice.invoiceNumber}</strong>؟
            <br />
            هذا الإجراء لا يمكن التراجع عنه.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting} sx={{ borderRadius: 2, fontWeight: 700 }}>
            إلغاء
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleting} startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Delete />} sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}>
            {deleting ? "جاري الحذف..." : "حذف"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
