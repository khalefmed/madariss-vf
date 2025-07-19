import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AuthPage from "@/components/auth/AuthPage";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Schools from "@/pages/Schools";
import Students from "@/pages/Students";
import Classes from "@/pages/Classes";
import Grades from "@/pages/Grades";
import AcademicYears from "@/pages/AcademicYears";
import Teachers from "@/pages/Teachers";
import Schedules from "@/pages/Schedules";
import Absences from "@/pages/Absences";
import Settings from "@/pages/Settings";
import Accounts from "@/pages/Accounts";
import StudentAccounts from "@/pages/StudentAccounts";
import NotFound from "./pages/NotFound";
import Marks from './pages/Marks';
import AcademicQuarters from "./pages/AcademicQuarters";
import Payments from '@/pages/Payments';
import SchoolManagement from "@/pages/SchoolManagement";
import TeacherAccounts from "@/pages/TeacherAccounts";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/schools" element={
                  <ProtectedRoute systemManagerOnly>
                    <Schools />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/schools/:schoolId/manage" element={
                  <ProtectedRoute systemManagerOnly>
                    <SchoolManagement />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/accounts" element={
                  <ProtectedRoute requiredRole="admin">
                    <Accounts />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/student-accounts" element={
                  <ProtectedRoute requiredRole="admin">
                    <StudentAccounts />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teacher-accounts" element={
                  <ProtectedRoute requiredRole="admin">
                    <TeacherAccounts />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/students" element={
                  <ProtectedRoute requiredRole="admin">
                    <Students />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/classes" element={
                  <ProtectedRoute requiredRole="admin">
                    <Classes />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/teachers" element={
                  <ProtectedRoute requiredRole="admin">
                    <Teachers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/grades" element={
                  <ProtectedRoute requiredRole="admin">
                    <Grades />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/schedules" element={
                  <ProtectedRoute>
                    <Schedules />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/absences" element={
                  <ProtectedRoute>
                    <Absences />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/academic-years" element={
                  <ProtectedRoute requiredRole="admin">
                    <AcademicYears />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/academic-quarters" element={
                  <ProtectedRoute requiredRole="admin">
                    <AcademicQuarters />
                  </ProtectedRoute>
                } />
                {/* Settings accessible to all authenticated users */}
                <Route path="/dashboard/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/attendance" element={<Navigate to="/dashboard/absences" replace />} />
                <Route path="/marks" element={
                  <ProtectedRoute>
                    <Marks />
                  </ProtectedRoute>
                } />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <Payments />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
