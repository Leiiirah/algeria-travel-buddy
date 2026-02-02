import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDirection } from "@/hooks/useDirection";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import ServicesPage from "./pages/ServicesPage";
import CommandsPage from "./pages/CommandsPage";
import OmraPage from "./pages/OmraPage";
import DocumentsPage from "./pages/DocumentsPage";
import SuppliersPage from "./pages/SuppliersPage";
import SupplierAccountingPage from "./pages/SupplierAccountingPage";
import AccountingPage from "./pages/AccountingPage";
import EmployeeAccountingPage from "./pages/EmployeeAccountingPage";
import ExpensesPage from "./pages/ExpensesPage";
import ServiceTypesPage from "./pages/ServiceTypesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});


const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  // Initialize RTL/LTR direction based on language
  useDirection();

  if (isLoading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employes"
        element={
          <ProtectedRoute adminOnly>
            <EmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute adminOnly>
            <ServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/commandes"
        element={
          <ProtectedRoute>
            <CommandsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/omra"
        element={
          <ProtectedRoute>
            <OmraPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fournisseurs"
        element={
          <ProtectedRoute>
            <SuppliersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/situation-fournisseurs"
        element={
          <ProtectedRoute>
            <SupplierAccountingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comptabilite"
        element={
          <ProtectedRoute>
            <AccountingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comptabilite-employes"
        element={
          <ProtectedRoute>
            <EmployeeAccountingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/depenses"
        element={
          <ProtectedRoute adminOnly>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/types-services"
        element={
          <ProtectedRoute adminOnly>
            <ServiceTypesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
