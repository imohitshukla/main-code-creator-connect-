import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // 🛡️ ROLE ENFORCEMENT
    // If user is logged in but has no role, force them to select one.
    // Exception: Don't redirect if we are ALREADY on the select-role page (avoid loop)
    if ((!user.role || user.role === 'PENDING') && window.location.pathname !== '/select-role') {
        return <Navigate to="/select-role" replace />;
    }

    // Vice versa: If user HAS a role, don't let them go back to select-role
    if (user.role && user.role !== 'PENDING' && window.location.pathname === '/select-role') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
