import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Container,
  Stack,
  IconButton,
  Avatar,
  useTheme,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  People,
  Warning,
  Brightness4,
  Brightness7,
  CheckCircle,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDataStore } from '@/store/useDataStore';
import { useThemeStore } from '@/store/useThemeStore';
import { calculateFinancialSummary, formatCurrency } from '@/utils/calculations';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

dayjs.locale('ar');

export const DashboardPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { clients, invoices, payments, debts } = useDataStore();
  const { mode, toggleTheme } = useThemeStore();

  const summary = useMemo(() => {
    return calculateFinancialSummary(invoices, payments, debts);
  }, [invoices, payments, debts]);

  const recentInvoices = invoices
    .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
    .slice(0, 5);

  const topDebtors = useMemo(() => {
    const clientDebts = new Map<string, number>();
    
    debts.forEach((debt) => {
      const current = clientDebts.get(debt.clientId) || 0;
      clientDebts.set(debt.clientId, current + debt.remainingAmount);
    });

    return Array.from(clientDebts.entries())
      .map(([clientId, amount]) => ({
        client: clients.find((c) => c.id === clientId),
        amount,
      }))
      .filter((item) => item.client && item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [clients, debts]);

  const chartData = summary.monthlyData.slice(-6).map((data) => ({
    name: `${data.month}/${data.year}`,
    فواتير: data.totalInvoiced,
    مدفوعات: data.totalCollected,
    ديون: data.totalDebt,
  }));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #0c1524 0%, #0f1a2e 100%)'
          : 'linear-gradient(180deg, #f4f6f9 0%, #eef1f6 100%)',
        pb: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(160deg, #1a3a5c 0%, #2d5f8a 100%)'
            : 'linear-gradient(160deg, #162a44 0%, #1a3a5c 100%)',
          pt: 2,
          pb: 3,
          px: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 70% 20%, rgba(201, 165, 78, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="sm">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton onClick={() => navigate('/')} sx={{ color: 'rgba(255,255,255,0.9)', marginLeft: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'white', letterSpacing: 0.3 }}>
                لوحة التحكم
              </Typography>
            </Stack>
            <IconButton onClick={toggleTheme} sx={{ color: 'rgba(201, 165, 78, 0.85)', bgcolor: 'rgba(201, 165, 78, 0.08)', border: '1px solid rgba(201, 165, 78, 0.12)', '&:hover': { bgcolor: 'rgba(201, 165, 78, 0.16)' } }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ mt: -2 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={6}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #c44040 0%, #ad3333 100%)',
                color: 'white',
                boxShadow: '0 6px 18px -4px rgba(196,64,64,0.35)',
                transition: 'all 0.25s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 24px -4px rgba(196,64,64,0.4)' },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <AccountBalance sx={{ fontSize: 28, mb: 2 }} />
                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 1.5 }}>
                  إجمالي الديون
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.totalDebt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #0d9668 0%, #087a54 100%)',
                color: 'white',
                boxShadow: '0 6px 18px -4px rgba(13,150,104,0.35)',
                transition: 'all 0.25s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 24px -4px rgba(13,150,104,0.4)' },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <TrendingUp sx={{ fontSize: 28, mb: 1 }} />
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  المبالغ المحصلة
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.totalPaid)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #c9a54e 0%, #a88832 100%)',
                color: 'white',
                boxShadow: '0 6px 18px -4px rgba(201,165,78,0.35)',
                transition: 'all 0.25s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 24px -4px rgba(201,165,78,0.4)' },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <TrendingDown sx={{ fontSize: 28, mb: 1 }} />
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  المتبقي
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.totalRemaining)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #c44070 0%, #a0284d 100%)',
                color: 'white',
                boxShadow: '0 6px 18px -4px rgba(196,64,112,0.35)',
                transition: 'all 0.25s ease',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 10px 24px -4px rgba(196,64,112,0.4)' },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Warning sx={{ fontSize: 28, mb: 1 }} />
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  المتأخرات
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  {formatCurrency(summary.overdueAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Info */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={4}>
            <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <People sx={{ fontSize: 32, color: 'primary.main', mb: 1.5 }} />
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  {clients.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  عميل
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <Receipt sx={{ fontSize: 32, color: 'success.main' }} />
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  {invoices.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  فاتورة
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <AccountBalance sx={{ fontSize: 32, color: 'warning.main' }} />
                </Box>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                  {debts.filter((d) => d.status !== 'paid').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  دين نشط
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Debtors */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, px: 0.5 }}>
          أكبر المدينين
        </Typography>
        <Card sx={{ mb: 5, borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {topDebtors.length > 0 ? (
                topDebtors.map((item, index) => (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {item.client?.name}
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight={800}>
                        {formatCurrency(item.amount)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(item.amount / summary.totalRemaining) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'error.main',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  لا توجد ديون نشطة
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, px: 0.5 }}>
          آخر الفواتير
        </Typography>
        <Stack spacing={3.5}>
          {recentInvoices.length > 0 ? (
            recentInvoices.map((invoice) => {
              const client = clients.find((c) => c.id === invoice.clientId);
              return (
                <Card
                  key={invoice.id}
                  sx={{
                    borderRadius: 2.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" fontWeight={700}>
                          {invoice.invoiceNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client?.name} • {dayjs(invoice.issueDate).format('DD/MM/YYYY')}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                          {formatCurrency(invoice.total)}
                        </Typography>
                        <Chip
                          label={
                            invoice.status === 'paid'
                              ? 'مدفوعة'
                              : invoice.status === 'overdue'
                              ? 'متأخرة'
                              : 'نشطة'
                          }
                          size="small"
                          color={
                            invoice.status === 'paid'
                              ? 'success'
                              : invoice.status === 'overdue'
                              ? 'error'
                              : 'default'
                          }
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card sx={{ borderRadius: 2.5, textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                لا توجد فواتير بعد
              </Typography>
            </Card>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
