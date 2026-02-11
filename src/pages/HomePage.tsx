import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  useTheme,
  IconButton,
  Stack,
} from "@mui/material";
import {
  People,
  Receipt,
  Payment,
  Brightness4,
  Brightness7,
  Logout,
  ChevronLeft,
  TrendingUp,
  CloudSync,
} from "@mui/icons-material";
import { BackupDialog } from "@/components/BackupDialog";
import { useDataStore } from "@/store/useDataStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { formatCurrency } from "@/utils/calculations";
import { useMemo, useEffect, useState } from "react";

export const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { payments, clients, expenses } = useDataStore();
  const { user, logout } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const [profitRecalcTrigger, setProfitRecalcTrigger] = useState(0);
  const [openBackup, setOpenBackup] = useState(false);

  // Listen for storage changes to update profit calculation
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render by updating state
      setProfitRecalcTrigger((prev) => prev + 1);
    };
    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom event for same-window updates
    window.addEventListener("profitPercentageUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "profitPercentageUpdated",
        handleStorageChange
      );
    };
  }, []);

  const stats = useMemo(() => {
    const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);
    const clientsCount = clients.length;

    // Calculate profit for each client separately
    // Each client has their own percentage stored in database
    const totalProfit = clients.reduce((totalProfit, client) => {
      const clientPercentage = client.profitPercentage;
      if (
        !clientPercentage ||
        isNaN(clientPercentage) ||
        clientPercentage <= 0
      ) {
        return totalProfit;
      }

      // Get payments for this client only
      const clientPayments = payments.filter(
        (pay) => pay.clientId === client.id
      );
      const clientTotalPayments = clientPayments.reduce(
        (sum, pay) => sum + pay.amount,
        0
      );
      const clientProfit = (clientTotalPayments * clientPercentage) / 100;

      return totalProfit + clientProfit;
    }, 0);

    return { totalPaid, clientsCount, profit: totalProfit };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, clients, expenses, profitRecalcTrigger]);

  const menuItems = [
    {
      title: "العملاء",
      icon: People,
      path: "/clients",
      color: "#c9a54e",
      bgColor:
        theme.palette.mode === "dark" ? "rgba(201, 165, 78, 0.12)" : "rgba(201, 165, 78, 0.1)",
      borderColor:
        theme.palette.mode === "dark" ? "rgba(201, 165, 78, 0.2)" : "rgba(201, 165, 78, 0.15)",
    },
    {
      title: "الفواتير",
      icon: Receipt,
      path: "/invoices",
      color: "#5a8fc4",
      bgColor:
        theme.palette.mode === "dark" ? "rgba(90, 143, 196, 0.12)" : "rgba(90, 143, 196, 0.1)",
      borderColor:
        theme.palette.mode === "dark" ? "rgba(90, 143, 196, 0.2)" : "rgba(90, 143, 196, 0.15)",
    },
    {
      title: "المدفوعات",
      icon: Payment,
      path: "/payments",
      color: "#0d9668",
      bgColor:
        theme.palette.mode === "dark" ? "rgba(13, 150, 104, 0.12)" : "rgba(13, 150, 104, 0.1)",
      borderColor:
        theme.palette.mode === "dark" ? "rgba(13, 150, 104, 0.2)" : "rgba(13, 150, 104, 0.15)",
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.palette.mode === "dark" 
          ? "linear-gradient(180deg, #0c1524 0%, #0f1a2e 100%)" 
          : "linear-gradient(180deg, #f4f6f9 0%, #eef1f6 100%)",
        pb: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(160deg, #0a1628 0%, #162a44 40%, #1a3550 70%, #122840 100%)",
          pt: 3,
          pb: 4.5,
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
            background: 'radial-gradient(ellipse at 25% 15%, rgba(201, 165, 78, 0.1) 0%, transparent 60%), radial-gradient(ellipse at 75% 85%, rgba(90, 143, 196, 0.06) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: '40px',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(to top, #0c1524, transparent)'
              : 'linear-gradient(to top, #f4f6f9, transparent)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Top Bar */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 46,
                    height: 46,
                    bgcolor: "rgba(201, 165, 78, 0.15)",
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: '#c9a54e',
                    border: '1.5px solid rgba(201, 165, 78, 0.25)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {user?.displayName?.charAt(0) ||
                    user?.email.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(201, 165, 78, 0.75)", fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    مرحباً
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#e8edf5", fontWeight: 700, fontSize: "1rem", letterSpacing: '0.02em' }}
                  >
                    {user?.displayName || user?.email.split("@")[0]}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    color: "rgba(201, 165, 78, 0.85)",
                    bgcolor: "rgba(201, 165, 78, 0.08)",
                    border: '1px solid rgba(201, 165, 78, 0.12)',
                    "&:hover": { bgcolor: "rgba(201, 165, 78, 0.16)", transform: 'scale(1.08)' },
                    margin: "0 !important",
                    transition: 'all 0.25s ease',
                  }}
                  size="small"
                >
                  {mode === "dark" ? (
                    <Brightness7 fontSize="small" />
                  ) : (
                    <Brightness4 fontSize="small" />
                  )}
                </IconButton>
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    color: "rgba(201, 165, 78, 0.85)",
                    bgcolor: "rgba(201, 165, 78, 0.08)",
                    border: '1px solid rgba(201, 165, 78, 0.12)',
                    "&:hover": { bgcolor: "rgba(201, 165, 78, 0.16)", transform: 'scale(1.08)' },
                    margin: "0 !important",
                    transition: 'all 0.25s ease',
                  }}
                  size="small"
                >
                  <Logout fontSize="small" />
                </IconButton>
              </Box>
            </Box>

          {/* Title with Logo */}
          <Box sx={{ textAlign: "center", mb: 3.5 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="شعار م. محمد سالم التركي"
              sx={{
                width: 72,
                height: 72,
                mb: 1.5,
                filter: 'drop-shadow(0 6px 16px rgba(201, 165, 78, 0.25))',
              }}
            />
            <Typography
              variant="h4"
              sx={{
                color: "#e8edf5",
                fontWeight: 900,
                mb: 0.5,
                fontSize: { xs: "1.4rem", sm: "1.8rem" },
                letterSpacing: 0.5,
                textShadow: "0 2px 12px rgba(0,0,0,0.35)",
              }}
            >
              م. محمد سالم التركي
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#c9a54e",
                fontWeight: 700,
                fontSize: { xs: "0.82rem", sm: "0.92rem" },
                letterSpacing: 1,
                mb: 0.5,
              }}
            >
              إنشاءات وتعهدات
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(232, 237, 245, 0.5)",
                fontWeight: 500,
                fontSize: { xs: "0.72rem", sm: "0.76rem" },
                letterSpacing: 0.3,
              }}
            >
              📍 تاجوراء ليبيا | 📞 0911191263
            </Typography>
          </Box>

          {/* Profit Card */}
          <Card
            sx={{
              background: "rgba(201, 165, 78, 0.1)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(201, 165, 78, 0.2)",
              borderRadius: 3.5,
              color: "white",
              boxShadow: "0 8px 32px -8px rgba(201, 165, 78, 0.15)",
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: "0 12px 40px -8px rgba(201, 165, 78, 0.2)",
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent sx={{ py: 2.5, px: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.85, fontSize: "0.76rem", color: '#c9a54e', fontWeight: 600, letterSpacing: 0.3 }}
                  >
                    إجمالي الأرباح
                  </Typography>
                  <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
                    {formatCurrency(stats.profit)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.6,
                      fontSize: "0.7rem",
                      mt: 0.5,
                      display: "block",
                      letterSpacing: 0.2,
                    }}
                  >
                    من جميع العملاء
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    bgcolor: "rgba(201, 165, 78, 0.12)",
                    border: '1px solid rgba(201, 165, 78, 0.2)',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TrendingUp sx={{ fontSize: 28, color: '#c9a54e' }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ mt: -2 }}>
        {/* Menu Section */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2, px: 0.5, mt: 3, letterSpacing: 0.3 }}
        >
          القوائم الرئيسية
        </Typography>

        <Stack spacing={1.5}>
          {menuItems.map((item, index) => (
            <Card
              key={index}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'light' 
                  ? "0 2px 12px -2px rgba(26, 58, 92, 0.06)"
                  : "0 2px 12px -2px rgba(0,0,0,0.3)",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                border: `1px solid ${item.borderColor}`,
                bgcolor: 'background.paper',
                "&:hover": {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'light'
                    ? "0 8px 24px -4px rgba(26, 58, 92, 0.1)"
                    : "0 8px 24px -4px rgba(0,0,0,0.4)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        bgcolor: item.bgColor,
                        border: `1px solid ${item.borderColor}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: 'all 0.25s ease',
                      }}
                    >
                      <item.icon sx={{ fontSize: 24, color: item.color }} />
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                        اضغط للدخول
                      </Typography>
                    </Box>
                  </Box>
                  <ChevronLeft sx={{ color: "text.secondary", opacity: 0.5, fontSize: 20 }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Backup Section */}
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ mb: 2, px: 0.5, mt: 4, letterSpacing: 0.3 }}
        >
          النظام
        </Typography>

        <Card
          onClick={() => setOpenBackup(true)}
          sx={{
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'light'
              ? "0 2px 12px -2px rgba(26, 58, 92, 0.06)"
              : "0 2px 12px -2px rgba(0,0,0,0.3)",
            cursor: "pointer",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            border: theme.palette.mode === "dark"
              ? "1px solid rgba(90, 143, 196, 0.12)"
              : "1px solid rgba(26, 58, 92, 0.06)",
            "&:hover": {
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'light'
                ? "0 8px 24px -4px rgba(26, 58, 92, 0.1)"
                : "0 8px 24px -4px rgba(0,0,0,0.4)",
            },
            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? "rgba(90, 143, 196, 0.12)"
                        : "rgba(26, 58, 92, 0.06)",
                    border: theme.palette.mode === "dark"
                      ? '1px solid rgba(90, 143, 196, 0.2)'
                      : '1px solid rgba(26, 58, 92, 0.1)',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CloudSync sx={{ fontSize: 24, color: theme.palette.mode === 'dark' ? "#5a8fc4" : "#1a3a5c" }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
                    النسخ الاحتياطي
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                    حفظ واستعادة البيانات
                  </Typography>
                </Box>
              </Box>
              <ChevronLeft sx={{ color: "text.secondary", opacity: 0.5, fontSize: 20 }} />
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 4, opacity: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: 0.3 }}>
            م. محمد سالم التركي © 2024 | تاجوراء ليبيا
          </Typography>
        </Box>
      </Container>
      <BackupDialog open={openBackup} onClose={() => setOpenBackup(false)} />
    </Box>
  );
};
