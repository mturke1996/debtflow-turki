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
  ArrowBack,
  People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '@/store/useDataStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Client } from '@/types';
import { Phone } from '@mui/icons-material';

const clientSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  address: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
  type: z.enum(['company', 'individual']),
});

type ClientFormData = z.infer<typeof clientSchema>;

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
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      const newClient: Client = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addClient(newClient);
    }
    handleCloseDialog();
  };


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
          pt: 3,
          pb: 4,
          px: 2,
          borderRadius: '0 0 28px 28px',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 8px 32px -8px rgba(26, 58, 92, 0.3)'
            : '0 8px 32px -8px rgba(0, 0, 0, 0.4)',
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
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <IconButton onClick={() => navigate('/')} sx={{ color: 'rgba(255,255,255,0.9)', marginLeft: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight={800} sx={{ color: 'white', flexGrow: 1, letterSpacing: 0.3 }}>
              العملاء ({clients.length})
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: 'rgba(201, 165, 78, 0.9)',
                color: '#1a2a3e',
                fontWeight: 700,
                '&:hover': { 
                  bgcolor: '#c9a54e',
                  transform: 'scale(1.04)',
                },
                borderRadius: 2.5,
                px: 2.5,
                boxShadow: '0 4px 14px -3px rgba(201, 165, 78, 0.4)',
                transition: 'all 0.25s ease',
              }}
              startIcon={<Add />}
            >
              جديد
            </Button>
          </Stack>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="ابحث عن عميل بالاسم أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mt: 2.5,
              mb: 1,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.95)',
                borderRadius: 3,
                boxShadow: '0 4px 16px -4px rgba(0,0,0,0.12)',
                '& fieldset': { border: 'none' },
                '&:hover': {
                  bgcolor: 'white',
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', opacity: 0.6 }} />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </Box>

      {/* Clients List */}
      <Container maxWidth="sm" sx={{ mt: 1, pt: 1 }}>
        <Stack spacing={2}>
          {filteredClients.length === 0 ? (
            <Card sx={{ borderRadius: 3, textAlign: 'center', py: 6, bgcolor: 'background.paper' }}>
              <People sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.2, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                لا يوجد عملاء
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ 
                  mt: 2, 
                  borderRadius: 2.5,
                  bgcolor: '#1a3a5c',
                  '&:hover': { bgcolor: '#0e2440' },
                  boxShadow: '0 4px 14px -3px rgba(26, 58, 92, 0.35)',
                }}
              >
                إضافة أول عميل
              </Button>
            </Card>
          ) : (
            filteredClients.map((client) => {
              return (
                <Card
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  sx={{
                    borderRadius: 3,
                    boxShadow: theme.palette.mode === 'light'
                      ? '0 2px 12px -2px rgba(26, 58, 92, 0.07)'
                      : '0 4px 20px rgba(0,0,0,0.35)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    bgcolor: 'background.paper',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(90, 143, 196, 0.08)' : '1px solid rgba(26, 58, 92, 0.04)',
                    '&:hover': {
                      boxShadow: theme.palette.mode === 'light'
                        ? '0 10px 32px -6px rgba(26, 58, 92, 0.12)'
                        : '0 12px 40px rgba(0,0,0,0.45)',
                      transform: 'translateY(-3px)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
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
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            bgcolor: theme.palette.mode === 'dark' ? '#0f1a2e' : '#f4f6f9',
          },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              background: theme.palette.mode === 'light' 
                ? 'linear-gradient(160deg, #1a3a5c 0%, #2d5f8a 100%)'
                : 'linear-gradient(160deg, #162a44 0%, #1a3a5c 100%)',
              color: 'white',
              p: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(ellipse at 70% 50%, rgba(201, 165, 78, 0.08) 0%, transparent 50%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <IconButton onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.3 }}>
                {editingClient ? 'تعديل عميل' : 'إضافة عميل جديد'}
              </Typography>
            </Stack>
          </Box>

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
                    label="البريد الإلكتروني"
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
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ 
                  borderRadius: 2.5, 
                  py: 1.5,
                  bgcolor: '#1a3a5c',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px -3px rgba(26, 58, 92, 0.35)',
                  '&:hover': {
                    bgcolor: '#0e2440',
                    boxShadow: '0 8px 22px -4px rgba(26, 58, 92, 0.4)',
                  },
                }}
              >
                {editingClient ? 'حفظ التعديلات' : 'إضافة العميل'}
              </Button>
            </Stack>
          </Box>
        </form>
      </Dialog>
    </Box>
  );
};
