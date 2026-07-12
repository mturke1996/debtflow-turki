import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CompanyBlock } from "@/components/ui/CompanyLogo";
import { COMPANY_INFO } from "@/constants/companyInfo";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
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
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password);
      navigate("/");
    } catch {
      // handled in store
    }
  };

  return (
    <Box
      className="safe-top safe-x"
      sx={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        bgcolor: "background.default",
      }}
    >
      {/* Brand panel — desktop only */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 5,
          bgcolor: "background.paper",
          borderInlineEnd: 1,
          borderColor: "divider",
        }}
      >
        <CompanyBlock />
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.03em", textWrap: "balance", mb: 2 }}>
            إدارة الفواتير والمصروفات بكل وضوح
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 360, lineHeight: 1.7 }}>
            نظام محاسبي بسيط لمتابعة العملاء والديون والمدفوعات — {COMPANY_INFO.companyName}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {COMPANY_INFO.addressSingle}
        </Typography>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4, md: 6 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
            <CompanyBlock dense />
          </Box>

          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5, letterSpacing: "-0.02em" }}>
            تسجيل الدخول
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            أدخل بيانات حسابك للمتابعة
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
                  type={showPassword ? "text" : "password"}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  margin="normal"
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
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
              className="btn-primary-premium"
              sx={{ mt: 3, py: 1.35 }}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "دخول"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" display="block">
              {COMPANY_INFO.engineerName}
            </Typography>
            <Typography variant="caption" color="primary.main" fontWeight={600} className="num-ltr" dir="ltr">
              {COMPANY_INFO.phones[0]}
            </Typography>
          </Box>

          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 3, display: "block" }}>
            © {new Date().getFullYear()} {COMPANY_INFO.copyright}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
