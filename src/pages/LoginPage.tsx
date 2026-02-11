import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, error, clearError, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      navigate('/');
    } catch (error) {
      // Error is handled in the store
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0a1628 0%, #162a44 40%, #1a3550 70%, #122840 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at 25% 15%, rgba(201, 165, 78, 0.1) 0%, transparent 55%), radial-gradient(ellipse at 75% 85%, rgba(90, 143, 196, 0.06) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201, 165, 78, 0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          sx={{
            borderRadius: 5,
            boxShadow: '0 24px 64px -12px rgba(0,0,0,0.5)',
            background: 'linear-gradient(165deg, rgba(255,255,255,0.97), rgba(248,250,252,0.99))',
            border: '1px solid rgba(201, 165, 78, 0.15)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1a3a5c, #c9a54e, #1a3a5c)',
            },
          }}
        >
          <CardContent sx={{ p: 4, pt: 5 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="شعار م. محمد سالم التركي"
                sx={{
                  width: 88,
                  height: 88,
                  mb: 2,
                  filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))',
                }}
              />
              <Typography variant="h5" fontWeight={900} gutterBottom sx={{ color: '#1a2a3e', letterSpacing: 0.5 }}>
                م. محمد سالم التركي
              </Typography>
              <Typography variant="body2" sx={{ color: '#c9a54e', fontWeight: 700, mb: 0.5, letterSpacing: 0.5 }}>
                إنشاءات وتعهدات
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ letterSpacing: 0.2 }}>
                نظام إدارة الفواتير والمصروفات
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
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
                    margin="normal"
                    autoComplete="email"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1a3a5c',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1a3a5c',
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="كلمة المرور"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    margin="normal"
                    autoComplete="current-password"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1a3a5c',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#1a3a5c',
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={<LoginIcon />}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  bgcolor: '#1a3a5c',
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: 0.5,
                  boxShadow: '0 6px 20px -4px rgba(26, 58, 92, 0.4)',
                  '&:hover': {
                    bgcolor: '#0e2440',
                    boxShadow: '0 10px 28px -6px rgba(26, 58, 92, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Button>
            </form>

            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: 'rgba(201, 165, 78, 0.06)', 
              borderRadius: 2.5, 
              border: '1px solid rgba(201, 165, 78, 0.12)',
              textAlign: 'center',
            }}>
              <Typography variant="caption" sx={{ color: '#c9a54e', fontWeight: 600, letterSpacing: 0.3 }} display="block">
                📍 تاجوراء ليبيا | 📞 0911191263
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Typography
          variant="body2"
          color="white"
          textAlign="center"
          sx={{ mt: 3, opacity: 0.5, fontWeight: 500, letterSpacing: 0.3 }}
        >
          © 2024 م. محمد سالم التركي - جميع الحقوق محفوظة
        </Typography>
      </Container>
    </Box>
  );
};
