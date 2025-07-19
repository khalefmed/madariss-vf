
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'teacher' | 'student' | 'academic_director' | 'accountant' | 'supervisor';
  systemManagerOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  systemManagerOnly = false 
}: ProtectedRouteProps) {
  const { data: userRole, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user role found, redirect to auth
  if (!userRole) {
    return <Navigate to="/auth" replace />;
  }

  // If system manager only route and user is not super_admin
  if (systemManagerOnly && userRole.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // If specific role required, check if user has required role or higher privileges
  if (requiredRole) {
    const hasAccess = userRole.role === requiredRole || 
                     userRole.role === 'admin' || 
                     userRole.role === 'super_admin' ||
                     // Academic director has access to admin functions for academic management
                     (requiredRole === 'admin' && userRole.role === 'academic_director') ||
                     // Students should have access to their specific pages
                     (userRole.role === 'student' && ['student'].includes(requiredRole));
    
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
