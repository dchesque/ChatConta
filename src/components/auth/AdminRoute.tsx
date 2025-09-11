import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
      {children}
    </ProtectedRoute>
  );
}