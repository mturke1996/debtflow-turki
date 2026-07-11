import { lazy, Suspense, useMemo, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  CircularProgress,
  Box,
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { createAppTheme } from "./theme";
import { useThemeStore } from "./store/useThemeStore";
import { useAuthStore } from "./store/useAuthStore";
import { useDataStore } from "./store/useDataStore";
import { subscribeUserCategories } from "./services/categorySync";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { ConfirmProvider } from "./components/ui/ConfirmDialog";

// Lazy load pages for code splitting
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);
const HomePage = lazy(() =>
  import("./pages/HomePage").then((module) => ({ default: module.HomePage }))
);
const ClientsPage = lazy(() =>
  import("./pages/ClientsPage").then((module) => ({
    default: module.ClientsPage,
  }))
);
const ClientProfilePage = lazy(() =>
  import("./pages/ClientProfilePage").then((module) => ({
    default: module.ClientProfilePage,
  }))
);
const InvoicesPage = lazy(() =>
  import("./pages/InvoicesPage").then((module) => ({
    default: module.InvoicesPage,
  }))
);
const NewInvoicePage = lazy(() =>
  import("./pages/NewInvoicePage").then((module) => ({
    default: module.NewInvoicePage,
  }))
);
const InvoiceDetailsPage = lazy(() =>
  import("./pages/InvoiceDetailsPage").then((module) => ({
    default: module.InvoiceDetailsPage,
  }))
);
const PaymentsPage = lazy(() =>
  import("./pages/PaymentsPage").then((module) => ({
    default: module.PaymentsPage,
  }))
);
const DebtsPage = lazy(() =>
  import("./pages/DebtsPage").then((module) => ({ default: module.DebtsPage }))
);
const ExpenseInvoicesPage = lazy(() =>
  import("./pages/ExpenseInvoicesPage").then((module) => ({
    default: module.ExpenseInvoicesPage,
  }))
);
const ExpensesPage = lazy(() =>
  import("./pages/ExpensesPage").then((module) => ({
    default: module.ExpensesPage,
  }))
);
const BackupPage = lazy(() =>
  import("./pages/BackupPage").then((module) => ({
    default: module.BackupPage,
  }))
);

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading component
const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  const themeMode = useThemeStore((state) => state.mode);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { initialized, initializeData, subscribeToRealtimeUpdates } =
    useDataStore();

  // Memoize theme to prevent unnecessary recalculations
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  // Initialize data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !initialized) {
      initializeData().then(() => {
        subscribeToRealtimeUpdates();
      });
    }

    return () => {
      if (!isAuthenticated) {
        const { unsubscribeFunctions } = useDataStore.getState();
        if (unsubscribeFunctions) {
          unsubscribeFunctions();
          useDataStore.setState({ unsubscribeFunctions: null });
        }
      }
    };
  }, [
    isAuthenticated,
    initialized,
    initializeData,
    subscribeToRealtimeUpdates,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const unsub = subscribeUserCategories(user.id);
    return unsub;
  }, [isAuthenticated, user?.id]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConfirmProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--panel)',
              color: 'var(--ink)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: 'Cairo, sans-serif',
              fontWeight: 600,
              fontSize: '0.8125rem',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow-soft)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                }
              />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<HomePage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:clientId" element={<ClientProfilePage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/invoices/new" element={<NewInvoicePage />} />
                <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/debts" element={<DebtsPage />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/expense-invoices" element={<ExpenseInvoicesPage />} />
                <Route path="/backup" element={<BackupPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        </ConfirmProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
