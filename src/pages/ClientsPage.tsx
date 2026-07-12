import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Avatar,
  Stack,
  useTheme,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Business,
  Person,
  ChevronLeft,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '@/store/useDataStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Client } from '@/types';
import { Phone } from '@mui/icons-material';
import { clientSchema, normalizeClientEmail, type ClientFormData } from '@/schemas/clientSchema';
import { ListPageLayout } from '@/components/ui/ListPageLayout';
import { SearchField } from '@/components/ui/SearchField';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppCard } from '@/components/ui/AppCard';

export const ClientsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { clients, expenses, standaloneDebts, payments, addClient, updateClient } = useDataStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'individual',
    },
  });

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      client.phone.includes(searchQuery)
    );
  }, [clients, searchQuery]);

  const getClientRemainingBalance = (clientId: string) => {
    const clientExpenses = expenses.filter((exp) => exp.clientId === clientId);
    const clientDebts = standaloneDebts.filter((debt) => debt.clientId === clientId);
    const clientPayments = payments.filter((pay) => pay.clientId === clientId);
    
    const totalExpenses = clientExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalDebts = clientDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const totalPaid = clientPayments.reduce((sum, pay) => sum + pay.amount, 0);
    
    const remainingBalance = totalExpenses + totalDebts - totalPaid;
    
    return remainingBalance;
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        type: client.type,
      });
    } else {
      setEditingClient(null);
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'individual',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
    reset();
  };

  const onSubmit = (data: ClientFormData) => {
    const payload = { ...data, email: normalizeClientEmail(data.email) };
    if (editingClient) {
      updateClient(editingClient.id, payload);
    } else {
      const newClient: Client = {
        ...payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addClient(newClient);
    }
    handleCloseDialog();
  };


  return (
    <>
      <ListPageLayout
        kicker="السجلات"
        title={`العملاء (${clients.length})`}
        subtitle="إدارة بطاقات العملاء والأرصدة"
        maxWidth="md"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            className="btn-primary-premium"
            sx={{ fontWeight: 800, borderRadius: 2.5, px: 2.5 }}
          >
            عميل جديد
          </Button>
        }
        filters={
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث بالاسم أو الهاتف أو البريد..."
          />
        }
      >
        <Stack spacing={2}>
          {filteredClients.length === 0 ? (
            <EmptyState
              icon={People}
              title="لا يوجد عملاء"
              description="ابدأ بإضافة أول عميل لتتبع الفواتير والمدفوعات."
              actionLabel="إضافة عميل"
              onAction={() => handleOpenDialog()}
            />
          ) : (
            filteredClients.map((client) => (
              <AppCard
                key={client.id}
                hover
                padding={2}
                onClick={() => navigate(`/clients/${client.id}`)}
                sx={{ cursor: 'pointer' }}
              >
                    <Stack direction="row" alignItems="center" spacing={0}>
                      {/* Avatar */}
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: client.type === 'company' 
                            ? (theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.15)' : 'rgba(26, 58, 92, 0.08)')
                            : (theme.palette.mode === 'dark' ? 'rgba(201, 165, 78, 0.15)' : 'rgba(201, 165, 78, 0.1)'),
                          flexShrink: 0,
                          marginLeft: '20px',
                          border: client.type === 'company' 
                            ? '1.5px solid rgba(90, 143, 196, 0.2)'
                            : '1.5px solid rgba(201, 165, 78, 0.2)',
                        }}
                      >
                        {client.type === 'company' ? (
                          <Business sx={{ color: theme.palette.mode === 'dark' ? '#5a8fc4' : '#1a3a5c', fontSize: 22 }} />
                        ) : (
                          <Person sx={{ color: '#c9a54e', fontSize: 22 }} />
                        )}
                      </Avatar>

                      {/* Client Info */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Stack 
                          direction={{ xs: 'column', sm: 'row' }} 
                          spacing={{ xs: 0.5, sm: 1.5 }} 
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          sx={{ mb: 1 }}
                        >
                          <Typography 
                            variant="h6" 
                            fontWeight={700}
                            sx={{
                              fontSize: { xs: '0.95rem', sm: '1.15rem' },
                              wordBreak: 'break-word',
                              letterSpacing: 0.2,
                            }}
                          >
                            {client.name}
                          </Typography>
                          <Chip
                            label={client.type === 'company' ? 'شركة' : 'فرد'}
                            size="small"
                            sx={{ 
                              height: 22, 
                              fontSize: '0.7rem', 
                              fontWeight: 700, 
                              flexShrink: 0,
                              bgcolor: client.type === 'company' 
                                ? (theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.15)' : 'rgba(26, 58, 92, 0.08)')
                                : (theme.palette.mode === 'dark' ? 'rgba(201, 165, 78, 0.15)' : 'rgba(201, 165, 78, 0.1)'),
                              color: client.type === 'company'
                                ? (theme.palette.mode === 'dark' ? '#5a8fc4' : '#1a3a5c')
                                : '#c9a54e',
                              border: 'none',
                            }}
                          />
                        </Stack>
                        
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.04)' 
                              : 'rgba(26, 58, 92, 0.03)',
                            px: 1.5,
                            py: 0.6,
                            borderRadius: 2,
                            mt: 0.5,
                          }}
                        >
                          <Phone sx={{ fontSize: 15, color: 'text.secondary', opacity: 0.6 }} />
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                            }}
                          >
                            {client.phone}
                          </Typography>
                        </Stack>
                      </Box>

                      {/* Actions */}
                      <Stack direction="row" spacing={{ xs: 2, sm: 2.5 }} sx={{ marginLeft: '12px', flexShrink: 0 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(client);
                          }}
                          sx={{
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.1)' : 'rgba(26, 58, 92, 0.05)',
                            color: theme.palette.mode === 'dark' ? '#5a8fc4' : '#1a3a5c',
                            width: { xs: 40, sm: 38 },
                            height: { xs: 40, sm: 38 },
                            borderRadius: 2,
                            border: theme.palette.mode === 'dark' 
                              ? '1px solid rgba(90, 143, 196, 0.15)' 
                              : '1px solid rgba(26, 58, 92, 0.08)',
                            '&:hover': { 
                              bgcolor: theme.palette.mode === 'dark' ? 'rgba(90, 143, 196, 0.2)' : 'rgba(26, 58, 92, 0.1)',
                              transform: 'scale(1.06)',
                            },
                            '&:active': {
                              transform: 'scale(0.95)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Edit sx={{ fontSize: { xs: 18, sm: 17 } }} />
                        </IconButton>
                      </Stack>
                    </Stack>
              </AppCard>
            ))
          )}
        </Stack>
      </ListPageLayout>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullScreen>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {editingClient ? 'تعديل عميل' : 'إضافة عميل جديد'}
          </DialogTitle>

          <Box sx={{ p: 3.5 }}>
            <Stack spacing={3}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="الاسم"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }}
                  />
                )}
              />

              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>النوع</InputLabel>
                    <Select {...field} label="النوع" sx={{ borderRadius: 2.5, bgcolor: 'background.paper' }}>
                      <MenuItem value="individual">فرد</MenuItem>
                      <MenuItem value="company">شركة</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="رقم الهاتف"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="البريد الإلكتروني (اختياري)"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }}
                  />
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="العنوان"
                    multiline
                    rows={3}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: 'background.paper' } }}
                  />
                )}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
              <Button
                onClick={handleCloseDialog}
                fullWidth
                size="large"
                sx={{ 
                  borderRadius: 2.5, 
                  py: 1.5,
                  fontWeight: 600,
                  border: theme.palette.mode === 'dark' 
                    ? '1px solid rgba(90, 143, 196, 0.2)' 
                    : '1px solid rgba(26, 58, 92, 0.15)',
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" variant="contained" fullWidth size="large" className="btn-primary-premium" sx={{ borderRadius: 2.5, py: 1.5, fontWeight: 800 }}>
                {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>
    </>
  );
};
