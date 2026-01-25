import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import ServicesPage from "./pages/ServicesPage";
import CommandsPage from "./pages/CommandsPage";
import DocumentsPage from "./pages/DocumentsPage";
import SuppliersPage from "./pages/SuppliersPage";
import SupplierAccountingPage from "./pages/SupplierAccountingPage";
import AccountingPage from "./pages/AccountingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/employes" element={<EmployeesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/commandes" element={<CommandsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/fournisseurs" element={<SuppliersPage />} />
            <Route path="/situation-fournisseurs" element={<SupplierAccountingPage />} />
            <Route path="/comptabilite" element={<AccountingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
